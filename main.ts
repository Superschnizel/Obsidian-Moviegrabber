import { App, Editor, MarkdownView, Modal, Menu, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

import {MoviegrabberSettings, DEFAULT_SETTINGS} from "./src/MoviegrabberSettings"
import {MoviegrabberSearchModal} from "./src/MoviegrabberSearchModal"
import {MovieData, MovieSearch, MovieSearchItem, TEST_SEARCH} from "./src/MoviegrabberSearchObject"
import { MoviegrabberSelectionModal } from 'src/MoviegrabberSelectionModal';


export default class Moviegrabber extends Plugin {
	settings: MoviegrabberSettings;

	async onload() {
		await this.loadSettings();
		
		this.addRibbonIcon("dice", "Open menu", (event) => {
			new MoviegrabberSelectionModal(this.app, TEST_SEARCH, (result) =>
			{
				this.createNote(result);
			}).open();
		});
		
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'moviegrabber-search',
			name: 'Search movie',
			callback: () => {
				if (this.settings.OMDb_API_Key == '' || this.settings.YouTube_API_Key == '') {
					var n = new Notice("missing one or more API keys!")
					n.noticeEl.addClass("notice_error");
					return;
				}
				new MoviegrabberSearchModal(this.app, (result) => 
					{this.searchMovie(result);
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
	async searchMovie(title : string) {
		var url = new URL("http://www.omdbapi.com");
		
		url.searchParams.append('apikey', this.settings.OMDb_API_Key);
		url.searchParams.append('s', title);
		url.searchParams.append('type', "movie");

		const response = await fetch(url);

		if (!response.ok) {
			var n = new Notice(`Http Error! Status: ${response.status}`);
			n.noticeEl.addClass("notice_error");
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();

		if (data.Response != "True") {
			var n = new Notice(`Found no movies named ${title}!`)
			n.noticeEl.addClass("notice_error")
			return;
		}

		new MoviegrabberSelectionModal(this.app, data as MovieSearch, (result) =>
			{
				this.createNote(result);
			}).open();
	}



	// get the Movie Data from OMDb
	async getMovieData(movie : MovieSearchItem) : Promise<MovieData | null | undefined> {
		var url = new URL("http://www.omdbapi.com");
		
		url.searchParams.append('apikey', this.settings.OMDb_API_Key);
		url.searchParams.append('i', movie.imdbID);

		const response = await fetch(url);

		if (!response.ok) {
			var n = new Notice(`Http Error! Status: ${response.status}`);
			n.noticeEl.addClass("notice_error");
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();

		if (data.Response != "True") {
			var n = new Notice(`Found no movies named ${movie.Title}!`)
			n.noticeEl.addClass("notice_error");
			return null;
		}

		return data as MovieData;
	}

	async getTrailerEmbed(title : string, year : number) : Promise<string> {
		var url = new URL("https://www.googleapis.com/youtube/v3/search");

		url.searchParams.append("part", "snippet");
		url.searchParams.append("key", this.settings.YouTube_API_Key);
		url.searchParams.append("type", "video")
		url.searchParams.append("q", `${title} ${year} trailer`)

		const response = await fetch(url);

		if (!response.ok) {
			var n = new Notice(`Http Error! Status: ${response.status}`);
			n.noticeEl.addClass("notice_error");
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();

		if ('error' in data) {
			var n = new Notice('failed to grab Trailer');
			n.noticeEl.addClass("notice_error");
			return '';
		}

		var embed = `<iframe src="https://www.youtube.com/embed/${data.items[0].id.videoId}" title="${data.items[0].snippet.title.replace(/[/\\?%*:|#"<>]/g, '')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`

		return embed;
	}

	async createNote(movie : MovieSearchItem) {
		// create path and check for directory before posting the request

		var dir = this.settings.MovieDirectory != '' ? `/${this.settings.MovieDirectory}/` : '';
		var path = `${dir}${movie.Title.replace(/[/\\?%*:|"<>]/g, '')}.md`
		
		if (this.app.vault.getAbstractFileByPath(path) != null) {
			var n = new Notice("File for Movie already exists!");
			n.noticeEl.addClass("notice_error");
			return;
		}

		var movieData = await this.getMovieData(movie);
		
		if (movieData == null){
			var n = new Notice(`something went wrong in fetching ${movie.Title} data`)
			n.noticeEl.addClass("notice_error")
			return;
		}
		
		// clean Movie Title to avoid frontmatter issues
		movieData.Title = movieData.Title.replace(/[/\\?%*:|"<>]/g, '');

		var content = 
		`---\n`+
		`type: movie\n`+
		`country: ${movieData.Country}\n`+
		`title: ${movieData.Title}\n`+
		`year: ${movieData.Year}\n`+
		`director: ${movieData.Director}\n`+
		`actors: [${movieData.Actors}]\n`+
		`genre: [${movieData.Genre}]\n`+
		`length: ${ movieData.Runtime.split(" ")![0] }\n`+
		`seen:\n`+
		`rating: \n`+
		`found_at: \n`+
		`trailer_embed: ${await this.getTrailerEmbed(movieData.Title, movieData.Year)}\n`+
		`poster: "${movieData.Poster}"\n`+
		`availability:\n`+
		`---\n`+
		`${movieData.Plot}`

		this.app.vault.create(path, content)
	}
}

class MoviegrabberSettingTab extends PluginSettingTab {
	plugin: Moviegrabber;

	constructor(app: App, plugin: Moviegrabber) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Movie Folder')
			.setDesc('Folder in which to Save the generated notes')
			.addText(text => text
				.setPlaceholder('Movies')
				.setValue(this.plugin.settings.MovieDirectory)
				.onChange(async (value) => {
					this.plugin.settings.MovieDirectory = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('OMDb API Key')
			.setDesc('Your API key for OMDb')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.OMDb_API_Key)
				.onChange(async (value) => {
					this.plugin.settings.OMDb_API_Key = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
		.setName('Youtube API Key')
		.setDesc('Your API key for Youtube')
		.addText(text => text
			.setPlaceholder('')
			.setValue(this.plugin.settings.YouTube_API_Key)
			.onChange(async (value) => {
				this.plugin.settings.YouTube_API_Key = value;
				await this.plugin.saveSettings();
			}));
	}
}
