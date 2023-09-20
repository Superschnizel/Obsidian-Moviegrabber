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
			name: 'Search Movie',
			callback: () => {
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
		
		url.searchParams.append('apikey', this.settings.API_Key);
		url.searchParams.append('s', title);
		url.searchParams.append('type', "movie");

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();

		if (data.Response != "True") {
			new Notice(`Found no movies named ${title}!`)
			return;
		}

		new MoviegrabberSelectionModal(this.app, data as MovieSearch, (result) =>
			{
				this.createNote(result);
			}).open();
	}



	// get the Movie Data from OMDb
	async getMovieData(title : string) : Promise<MovieData | null | undefined> {
		var url = new URL("http://www.omdbapi.com");
		
		url.searchParams.append('apikey', this.settings.API_Key);
		url.searchParams.append('t', title);

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();

		if (data.Response != "True") {
			new Notice(`Found no movies named ${title}!`)
			return null;
		}

		return data as MovieData;
	}

	async createNote(title : string) {
		var movieData = await this.getMovieData(title);
		
		if (movieData == null){
			new Notice(`something went wrong in fetching ${title} data`)
			return;
		}
	
		var content = 
		`---\n`+
		`type: movie\n`+
		`country: ${movieData.Country}\n`+
		`title: ${movieData.Title.replace(/[/\\?%*:|"<>]/g, '')}\n`+
		`year: ${movieData.Year}\n`+
		`director: ${movieData.Director}\n`+
		`actors: [${movieData.Actors}]\n`+
		`genre: [${movieData.Genre}]\n`+
		`length: ${ movieData.Runtime.split(" ")![0] }\n`+
		`seen:\n`+
		`rating: 0\n`+
		`found_at: \n`+
		`trailer_embed:\n`+
		`availability:\n`+
		`---\n`+
		`${movieData.Plot}`

		var path = `/${this.settings.MovieDirectory}/${movieData.Title.replace(/[/\\?%*:|"<>]/g, '')}.md`
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
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.MovieDirectory)
				.onChange(async (value) => {
					this.plugin.settings.MovieDirectory = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('OMDb API Key')
			.setDesc('The API key for OMDb')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.API_Key)
				.onChange(async (value) => {
					this.plugin.settings.API_Key = value;
					await this.plugin.saveSettings();
				}));
	}
}
