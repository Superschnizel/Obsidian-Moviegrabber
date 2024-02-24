import { App, Editor, MarkdownView, Modal, Menu, Notice, Plugin, PluginSettingTab, Setting, requestUrl, normalizePath, WorkspaceLeaf, TFile, TAbstractFile } from 'obsidian';

import {MoviegrabberSettings, DEFAULT_SETTINGS, DEFAULT_TEMPLATE, MoviegrabberSettingTab} from "./src/MoviegrabberSettings"
import {MoviegrabberSearchModal} from "./src/MoviegrabberSearchModal"
import {MOVIE_DATA_LOWER, MovieData, MovieRating, MovieSearch, MovieSearchItem, Rating, TEST_SEARCH} from "./src/MoviegrabberSearchObject"
import { MoviegrabberSelectionModal } from 'src/MoviegrabberSelectionModal';
import { MovieGalleryView, VIEW_TYPE_MOVIE_GALLERY } from 'src/MovieGalleryView';
import { ConfirmOverwriteModal } from 'src/ConfirmOverwriteModal';
import { ConfirmCreateNoteModal } from 'src/ConfirmCreateNoteModal';
import { FolderSuggest } from 'src/interface/FolderSuggester';
import { FileSuggest } from 'src/interface/FileSuggester';

const OVERWRITE_DELIMITER = /%%==MOVIEGRABBER_KEEP==%%[\s\S]*/
const IMDBID_REGEX = /^ev\d{1,8}\/\d{4}(-\d)?$|^(ch|co|ev|nm|tt)\d{1,8}$/

export default class Moviegrabber extends Plugin {
	settings: MoviegrabberSettings;

	async onload() {
		await this.loadSettings();
		
		// Search-Movie command
		this.addCommand({
			id: 'search-movie',
			name: 'Search movie',
			callback: () => {
				if (this.settings.OMDb_API_Key == '') {
					var n = new Notice("missing OMDb API key!")
					n.noticeEl.addClass("notice_error");
					return;
				}
				new MoviegrabberSearchModal(this.app,'movie', (result) => 
					{this.searchOmdb(result, 'movie');
				}).open();
			}
		});

		// Search-Series command
		this.addCommand({
			id: 'search-series',
			name: 'Search series',
			callback: () => {
				if (this.settings.OMDb_API_Key == '' || this.settings.YouTube_API_Key == '') {
					var n = new Notice("missing one or more API keys!")
					n.noticeEl.addClass("notice_error");
					return;
				}
				new MoviegrabberSearchModal(this.app, 'series',(result) => 
					{this.searchOmdb(result, 'series');
				}).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MoviegrabberSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// search the OMDb and oben selection Modal if some are found
	async searchOmdb(title : string, type : 'movie' | 'series', depth : number=0) {
		// cancel recursive retries if depth is too low
		if (depth >= 4) {
			this.SendWarningNotice(`Stopping after ${depth +1 } tries.`)
			return;
		}
		
		// check if search string is valid IMDB-id
		let isImdbId = IMDBID_REGEX.test(title);

		// build request URL
		var url = new URL("http://www.omdbapi.com");
		
		url.searchParams.append('apikey', this.settings.OMDb_API_Key);
		url.searchParams.append(isImdbId ? 'i' : 's', title);
		url.searchParams.append('type', type);

		// console.log(`requesting: ${url}`);

		// fetch data
		var response;
		try {
			response = await requestUrl(url.toString());	
		} catch (error) {
			this.SendWarningNotice(`Error in request while trying to search ${type}!\nretrying...`);
			this.searchOmdb(title, type, depth + 1);
			return;
		}
		
		if (response.status != 200) {
			var n = new Notice(`Http Error! Status: ${response.status}`);
			n.noticeEl.addClass("notice_error");
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json;

		if (data.Response != "True") {
			var n = new Notice(`Found no movies named ${title}!`)
			n.noticeEl.addClass("notice_error")
			return;
		}

		if (isImdbId) {
			let movie = data as MovieData;
			new ConfirmCreateNoteModal(this.app, movie, () =>{
				this.tryCreateNote(movie, type);
			}).open();
			return;
		}
		new MoviegrabberSelectionModal(this.app, data as MovieSearch, (result) =>
			{
				this.tryCreateNote(result, type);
			}).open();
	}

	// get the Movie Data from OMDb
	async getOmdbData(movie : MovieSearchItem, depth : number=0) : Promise<MovieData | null | undefined> {
		// end retries if recursion too deep.
		if (depth >= 4) {
			var n = new Notice(`Could not fetch Movie data: quit after ${depth+1} tries!`);
			n.noticeEl.addClass("notice_error");
			return null;
		}

		// build request URL
		var url = new URL("http://www.omdbapi.com");

		url.searchParams.append('apikey', this.settings.OMDb_API_Key);
		url.searchParams.append('i', movie.imdbID);
		url.searchParams.append('plot', this.settings.PlotLength);

		// fetch data
		var response;

		try {
			response = await requestUrl(url.toString());
		} catch (error) {
			var n = new Notice(`Error in request while trying to fetch Movie Data!\n...retrying`);
			return this.getOmdbData(movie, depth + 1); // retry by recursion
		}
		

		if (response.status != 200) {
			var n = new Notice(`Http Error! Status: ${response.status}`);
			n.noticeEl.addClass("notice_error");
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json;

		if (data.Response != "True") {
			var n = new Notice(`Found no movies named ${movie.Title}!`)
			n.noticeEl.addClass("notice_error");
			return null;
		}

		return data as MovieData;
	}

	// get the trailer embed from youtube.
	async getTrailerEmbed(title : string, year : number) : Promise<string> {
		var url = new URL("https://www.googleapis.com/youtube/v3/search");

		url.searchParams.append("part", "snippet");
		url.searchParams.append("key", this.settings.YouTube_API_Key);
		url.searchParams.append("type", "video")
		url.searchParams.append("q", `${title} ${year} trailer`)


		var response;
		try {
			response = await requestUrl(url.toString());	
		} catch (error) {
			var n = new Notice(`Error while trying to fetch Youtube trailer embed!`);
			n.noticeEl.addClass("notice_error");
			return "Could not find trailer."
		}
		
		// something went wrong doing the request.
		if (response.status != 200) {
			var n = new Notice(`Http Error! Status: ${response.status}`);
			n.noticeEl.addClass("notice_error");
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json;

		if ('error' in data) {
			var n = new Notice('failed to grab Trailer');
			n.noticeEl.addClass("notice_error");
			return '';
		}

		var embed = `<iframe src="https://www.youtube.com/embed/${data.items[0].id.videoId}" title="${data.items[0].snippet.title.replace(/[/\\?%*:|#"<>]/g, '')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`

		return embed;
	}

	async tryCreateNote(item : MovieSearchItem | MovieData, type : 'movie' | 'series') {
		// create path and check for directory before posting the request
		// Transform Search into MovieData
		var itemData = ('Response' in item ) ? item as MovieData : await this.getOmdbData(item);
		
		if (itemData == null || itemData == undefined){
			var n = new Notice(`something went wrong in fetching ${item.Title} data`)
			n.noticeEl.addClass("notice_error")
			return;
		}


		var dir = type == 'movie' ? this.settings.MovieDirectory : this.settings.SeriesDirectory;
		
		dir = this.CleanPath(dir);
		dir = dir != '' ? `${dir}/` : ''; // this might be unecessary.
		
		if (!(await this.app.vault.adapter.exists(dir))) {
			var n = new Notice(`Folder for ${type}: "${dir}" does not exist!`)
			n.noticeEl.addClass("notice_error")
			return;
		}

		let titleTemplate = type == 'movie' 
							? this.settings.FilenameTemplateMovie 
							: this.settings.FilenameTemplateSeries;
		let title = await this.FillTemplate(titleTemplate, itemData);
		title = title == '' ? item.Title : title;

		let path = `${dir}${title.replace(/[/\\?%*:|"<>]/g, '')}.md`
		let file = this.app.vault.getAbstractFileByPath(path);

		// console.log(`${file}, path: ${path}`);
		if (file != null && file instanceof TFile) {
			new ConfirmOverwriteModal(this.app, item, () => {
				this.createNote(itemData!, type, path, file as TFile);
			}).open();
			return;
		}

		this.createNote(itemData, type, path);
	}

	async createNote(item : MovieData, type : 'movie' | 'series', path : string, tFile : TFile | null=null) {
		if (this.settings.enablePosterImageSave && item.Poster && item.Poster !== "N/A") {
			// Construct the image name in a similar fashion to the provided example
			const imageName = `${item.Title}_${item.Year}`.replace(/[^a-z0-9]+/gi, '_').toLowerCase() + '.jpg';
			const posterDirectory = this.settings.posterImagePath;
			item.PosterLocal = await this.downloadAndSavePoster(item.Poster, posterDirectory, imageName);
		}
				
		new Notice(`Creating Note for: ${item.Title} (${item.Year})`);

		// add and clean up data
		item.Title = item.Title.replace(/[/\\?%*:|"<>]/g, ''); // clean Movie Title to avoid frontmatter issues
		item.Runtime = item.Runtime ? item.Runtime.split(" ")[0] : '';
		if (this.settings.YouTube_API_Key != '') {
			item.YoutubeEmbed = await this.getTrailerEmbed(item.Title, item.Year);
		}

		// get and fill template

		var template = await this.GetTemplate(type)
		if (template == null) {
			return;
		}
		var content = await this.FillTemplate(template, item);
		
		/* var content = 
		`---\n`+
		`type: ${type}\n`+
		`country: ${itemData.Country}\n`+
		`title: ${itemData.Title}\n`+
		`year: ${itemData.Year}\n`+
		`director: ${itemData.Director}\n`+
		`actors: [${itemData.Actors}]\n`+
		`genre: [${itemData.Genre}]\n`+
		`length: ${ itemData.Runtime.split(" ")![0] }\n`+
		(type == 'movie' ? '' : `seasons: ${itemData.totalSeasons}\n`) +
		`seen:\n`+
		`rating: \n`+
		`found_at: \n`+
		(this.settings.YouTube_API_Key != '' ? `trailer_embed: ${await this.getTrailerEmbed(itemData.Title, itemData.Year)}\n` : '') +
		`poster: "${itemData.Poster}"\n`+
		`availability:\n`+
		`---\n`+
		`${itemData.Plot}` */

		// create and open file
		if (tFile == null) {
			tFile = await this.app.vault.create(path, content);
		} else {
			let oldContent = await this.app.vault.read(tFile);
			// find delimiter string if it exists and keep whatever is below.
			let toKeep = OVERWRITE_DELIMITER.exec(oldContent);

			this.app.vault.modify(tFile, content + '\n' + (toKeep != null ? toKeep : ''));

			// trigger "create" Event to assure compatibility with other plugins, like templater
			this.app.vault.trigger("create", tFile);
		}

		if (this.settings.SwitchToCreatedNote) {
			this.app.workspace.getLeaf().openFile(tFile);
		}
	}

	async downloadAndSavePoster(imageUrl: string, directory: string, imageName: string): Promise<string> {
		if (!directory) {
			console.error("Poster image directory is not specified.");
			return "";
		}
	
		const filePath = normalizePath(`${directory}/${imageName}`);
		try {
			const response = await requestUrl({ url: imageUrl, method: "GET" });
			const imageData = response.arrayBuffer;
			await this.app.vault.adapter.writeBinary(filePath, imageData);
			return filePath;
		} catch (error) {
			console.error("Error downloading or saving poster image:", error);
			return "";
		}
	}

	async GetTemplate(type : 'movie' | 'series') : Promise<string | null> {
		if (this.settings.MovieTemplatePath == '') {
			// no template given, return default
			return DEFAULT_TEMPLATE;
		}

		// handle paths with both .md and not .md at the end
		var path = type == 'movie' ? this.settings.MovieTemplatePath : this.settings.SeriesTemplatePath;
		path = this.CleanPath(path).replace(".md", '') + '.md';

		var tAbstractFile = this.app.vault.getAbstractFileByPath(path);
		if (tAbstractFile == null || !(tAbstractFile instanceof TFile)) {
			this.SendWarningNotice("Template Path is not a File in Vault.\nstopping")
			return null;
		}

		var tFile = tAbstractFile as TFile;
		var text = await this.app.vault.cachedRead(tFile);
		return text;
	}

	async FillTemplate(template : string, data : MovieData) : Promise<string> {
		return template.replace(/{{(.*?)}}/g, (match) => {
			// console.log(match);
			let inner = match.split(/{{|}}/).filter(Boolean)[0];
			if (!inner) {
				return match;
			}
			let split = inner.split(/(?<!\\)\|/); // split at not escaped "|"
			const prefix = split.length >= 2 ? split[1].replace(/\\\|/, '|') : '';
			const suffix = split.length >= 3 ? split[2].replace(/\\\|/, '|') : '';

			let result = '';
			// handle the data being a list.
			let name = MOVIE_DATA_LOWER[split[0].trim().toLowerCase()];
			// console.log(`${name}, --> ${data[name]}`);

			let rawData = data[name];

			let items = rawData instanceof Array 
						? rawData.map( (elem) : string => {
							let r = elem as MovieRating;
							return `${r.Source}: ${r.Value}`;
						}) 
						: rawData?.split(/\,\s?/);

			if (!items) {
				console.log(`Tag "{{${inner}}}" could not be resolved.`);
				new Notice(`Warning: Tag "{{${inner}}}" could not be resolved.`)
				return `{{${inner}}}`;
			}

			result += prefix;
			result += items[0];	// data
			result += suffix;

			for (let i = 1; i < items.length; i++) {
				result += ', ';
				result += prefix;
				result += items[i]; // data
				result += suffix;
			}

			return result
		});
	}

	SendWarningNotice(text:string) {
		var n = new Notice(text);
		n.noticeEl.addClass("notice_error")
	}

	async CreateDefaultTemplateFile(){
		var content = DEFAULT_TEMPLATE +
			"\n\n\n%%\n" +
			"Available tags:\n" +
			"----------------------\n" +
			"{{Title}}\n" +
			"{{Year}}\n" +
			"{{Rated}}\n" +
			"{{Runtime}}\n" +
			"{{Genre}}\n" +
			"{{Director}}\n" +
			"{{Writer}}\n" +
			"{{Actors}}\n" +
			"{{Plot}}\n" +
			"{{Language}}\n" +
			"{{Country}}\n" +
			"{{Awards}}\n" +
			"{{Poster}}\n" +
			"{{Ratings}}\n" +
			"{{Metascore}}\n" +
			"{{imdbRating}}\n" +
			"{{imdbVotes}}\n" +
			"{{imdbID}}\n" +
			"{{Type}}\n" +
			"{{DVD}}\n" +
			"{{BoxOffice}}\n" +
			"{{Production}}\n" +
			"{{Website}}\n" +
			"{{totalSeasons}}\n" +
			"{{YoutubeEmbed}}\n" +
			"%%";
		
		// create and open file
		var tFile = await this.app.vault.create('/Moviegrabber-example-template.md', content);
		this.app.workspace.getLeaf().openFile(tFile);
		
	}

	CleanPath(path : string) :string {
		path.replace(/(^[/\s]+)|([/\s]+$)/g, ''); // clean up forbidden symbols
		path = path != '' ? `${path.replace(/\/$/, "")}` : ''; // trim "/"
		return path;
	}

	async activateView() {
		let { workspace }  = this.app;
	
		let leaf: WorkspaceLeaf;
		let leaves = workspace.getLeavesOfType(VIEW_TYPE_MOVIE_GALLERY);
	
		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
			workspace.revealLeaf(leaf);
			return
		} 
		
		// Our view could not be found in the workspace, create a new leaf
		// in the right sidebar for it
		leaf = workspace.getLeaf(false);
		await leaf.setViewState({ type: VIEW_TYPE_MOVIE_GALLERY, active: true });
		workspace.revealLeaf(leaf);
		
	
		// "Reveal" the leaf in case it is in a collapsed sidebar
		
	  }
}


