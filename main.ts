import { App, Editor, MarkdownView, Modal, Menu, Notice, Plugin, PluginSettingTab, Setting, requestUrl, normalizePath } from 'obsidian';

import {MoviegrabberSettings, DEFAULT_SETTINGS} from "./src/MoviegrabberSettings"
import {MoviegrabberSearchModal} from "./src/MoviegrabberSearchModal"
import {MovieData, MovieSearch, MovieSearchItem, TEST_SEARCH} from "./src/MoviegrabberSearchObject"
import { MoviegrabberSelectionModal } from 'src/MoviegrabberSelectionModal';
import { existsSync } from 'fs';


export default class Moviegrabber extends Plugin {
	settings: MoviegrabberSettings;

	async onload() {
		await this.loadSettings();
		
		
		console.log(this.app.vault.adapter.exists('/fuskcnslgasdfalög/'));
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'search-movie',
			name: 'Search movie',
			callback: () => {
				if (this.settings.OMDb_API_Key == '' || this.settings.YouTube_API_Key == '') {
					var n = new Notice("missing one or more API keys!")
					n.noticeEl.addClass("notice_error");
					return;
				}
				new MoviegrabberSearchModal(this.app,'movie', (result) => 
					{this.searchOmdb(result, 'movie');
				}).open();
			}
		});

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
	async searchOmdb(title : string, type : 'movie' | 'series') {
		var url = new URL("http://www.omdbapi.com");
		
		url.searchParams.append('apikey', this.settings.OMDb_API_Key);
		url.searchParams.append('s', title);
		url.searchParams.append('type', type);

		const response = await requestUrl(url.toString());
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

		new MoviegrabberSelectionModal(this.app, data as MovieSearch, (result) =>
			{
				this.createNote(result, type);
			}).open();
	}



	// get the Movie Data from OMDb
	async getOmdbData(movie : MovieSearchItem) : Promise<MovieData | null | undefined> {
		var url = new URL("http://www.omdbapi.com");
		
		url.searchParams.append('apikey', this.settings.OMDb_API_Key);
		url.searchParams.append('i', movie.imdbID);

		const response = await requestUrl(url.toString());

		if (response.status != 200) {
			var n = new Notice(`Http Error! Status: ${response.status}`);
			n.noticeEl.addClass("notice_error");
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json;

		console.log(data);

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

		const response = await requestUrl(url.toString());

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

	async createNote(item : MovieSearchItem, type : 'movie' | 'series') {
		// create path and check for directory before posting the request

		var dir = type == 'movie' ? this.settings.MovieDirectory : this.settings.SeriesDirectory;
		
		dir.replace(/(^[/\s]+)|([/\s]+$)/g, ''); // clean up

		var dir = dir != '' ? `/${dir}/` : '';
		
		if (!(await this.app.vault.adapter.exists('dir'))) {
			var n = new Notice(`Folder for ${type}: ${dir} does not exist!`)
			n.noticeEl.addClass("notice_error")
			return;
		}

		var path = `${dir}${item.Title.replace(/[/\\?%*:|"<>]/g, '')}.md`
		
		if (this.app.vault.getAbstractFileByPath(path) != null) {
			var n = new Notice(`Note for ${item.Title} already exists!`);
			n.noticeEl.addClass("notice_error");
			return;
		}

		var itemData = await this.getOmdbData(item);
		
		if (itemData == null){
			var n = new Notice(`something went wrong in fetching ${item.Title} data`)
			n.noticeEl.addClass("notice_error")
			return;
		}
		
		new Notice(`Creating Note for: ${item.Title} (${item.Year})`);

		// clean Movie Title to avoid frontmatter issues
		itemData.Title = itemData.Title.replace(/[/\\?%*:|"<>]/g, '');

		var content = 
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
		`trailer_embed: ${await this.getTrailerEmbed(itemData.Title, itemData.Year)}\n`+
		`poster: "${itemData.Poster}"\n`+
		`availability:\n`+
		`---\n`+
		`${itemData.Plot}`

		var tFile = await this.app.vault.create(path, content);
		if (this.settings.SwitchToCreatedNote) {
			this.app.workspace.getLeaf().openFile(tFile);
		}
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
			.setName('Movie folder')
			.setDesc('Folder in which to save the generated notes for series')
			.addText(text => text
				.setPlaceholder('Movies')
				.setValue(this.plugin.settings.MovieDirectory)
				.onChange(async (value) => {
					this.plugin.settings.MovieDirectory = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Series folder')
			.setDesc('Folder in which to save the generated notes for series')
			.addText(text => text
				.setPlaceholder('Series')
				.setValue(this.plugin.settings.SeriesDirectory)
				.onChange(async (value) => {
					this.plugin.settings.SeriesDirectory = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('OMDb API key')
			.setDesc('Your API key for OMDb')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.OMDb_API_Key)
				.onChange(async (value) => {
					this.plugin.settings.OMDb_API_Key = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Youtube API key')
			.setDesc('Your API key for Youtube')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.YouTube_API_Key)
				.onChange(async (value) => {
					this.plugin.settings.YouTube_API_Key = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Switch to generated notes')
			.setDesc('Automatically switch to the current workspace to the newly created note')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.SwitchToCreatedNote)
				.onChange(async (value) => {
					this.plugin.settings.SwitchToCreatedNote = value;
					await this.plugin.saveSettings();
				}));
	}
}
