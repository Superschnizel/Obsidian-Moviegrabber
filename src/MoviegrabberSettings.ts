import Moviegrabber from "main";
import { PluginSettingTab, App, Setting } from "obsidian";
import { FileSuggest } from "./interface/FileSuggester";
import { FolderSuggest } from "./interface/FolderSuggester";

export interface MoviegrabberSettings {
	MovieDirectory: string;
	SeriesDirectory: string;
	OMDb_API_Key: string;
	YouTube_API_Key: string;
	SwitchToCreatedNote: boolean;

	MovieTemplatePath: string;
	SeriesTemplatePath: string;

	PlotLength: string;
	FilenameTemplateMovie: string;
	FilenameTemplateSeries: string;
}

export const DEFAULT_SETTINGS: MoviegrabberSettings = {
	MovieDirectory: 'Movies',
	SeriesDirectory: 'Series',
	OMDb_API_Key: '',
	YouTube_API_Key: '',
	SwitchToCreatedNote: true,
	MovieTemplatePath: '',
	SeriesTemplatePath: '',
	PlotLength: 'short',
	FilenameTemplateMovie: '{{Title}}',
	FilenameTemplateSeries: '{{Title}}'
}

export const DEFAULT_TEMPLATE: string = "---\n"+
	"type: {{Type}}\n"+
	`country: {{Country}}\n`+
	`title: {{Title}}\n`+
	`year: {{Year}}\n`+
	`director: {{Director}}\n`+
	`actors: [{{Actors}}]\n`+
	`genre: [{{Genre}}]\n`+
	`length: {{Runtime}}\n`+
	`seen:\n`+
	`rating: \n`+
	`found_at: \n`+
	`trailer_embed: {{YoutubeEmbed}}\n` +
	`poster: "{{Poster}}"\n`+
	`availability:\n`+
	`---\n`+
	`{{Plot}}`;

export class MoviegrabberSettingTab extends PluginSettingTab {
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
			.addSearch((cb) => {
                new FolderSuggest(cb.inputEl, this.plugin.app);
                cb.setPlaceholder("Example: folder1/folder2")
                    .setValue(this.plugin.settings.MovieDirectory)
                    .onChange(async (newFolder) => {
                        this.plugin.settings.MovieDirectory = newFolder;
                        await this.plugin.saveSettings();
                    });
				});
			
		
		new Setting(containerEl)
			.setName('Series folder')
			.setDesc('Folder in which to save the generated notes for series')
			.addSearch((cb) => {
                new FolderSuggest(cb.inputEl, this.plugin.app);
                cb.setPlaceholder("Example: folder1/folder2")
                    .setValue(this.plugin.settings.SeriesDirectory)
                    .onChange(async (newFolder) => {
                        this.plugin.settings.SeriesDirectory = newFolder;
                        await this.plugin.saveSettings();
                    });
				});

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
			.setDesc('Your API key for Youtube (optional)')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.YouTube_API_Key)
				.onChange(async (value) => {
					this.plugin.settings.YouTube_API_Key = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Plot length')
			.setDesc('choose the plot length option for Omdb.')
			.addDropdown(dropDown => dropDown
				.addOption('short', 'short')
				.addOption('full', 'full')
				.setValue(this.plugin.settings.PlotLength)
				.onChange(async (value) => {
					this.plugin.settings.PlotLength = value;
					await this.plugin.saveSettings();
				}))

		new Setting(containerEl)
			.setName('Switch to generated notes')
			.setDesc('Automatically switch to the current workspace to the newly created note')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.SwitchToCreatedNote)
				.onChange(async (value) => {
					this.plugin.settings.SwitchToCreatedNote = value;
					await this.plugin.saveSettings();
				}));
		
		containerEl.createEl('h1', { text : "Templates"})
		new Setting(containerEl)
			.setName('Movie template file path')
			.setDesc('Path to the template file that is used to create notes for movies')
			.addSearch((cb) => {
                new FileSuggest(cb.inputEl, this.plugin.app);
                cb.setPlaceholder("Example: folder1/folder2")
                    .setValue(this.plugin.settings.MovieTemplatePath)
                    .onChange(async (newFile) => {
                        this.plugin.settings.MovieTemplatePath = newFile;
                        await this.plugin.saveSettings();
                    });
				});

		new Setting(containerEl)
			.setName('Series template file path')
			.setDesc('Path to the template file that is used to create notes for series')
			.addSearch((cb) => {
                new FileSuggest(cb.inputEl, this.plugin.app);
                cb.setPlaceholder("Example: folder1/folder2")
                    .setValue(this.plugin.settings.SeriesTemplatePath)
                    .onChange(async (newFile) => {
                        this.plugin.settings.SeriesTemplatePath = newFile;
                        await this.plugin.saveSettings();
                    });
				});
		
		new Setting(containerEl)
			.setName('Create example template file')
			.setDesc('Creates an example template file to expand and use.\nThe file is called `/Moviegrabber-example-template`')
			.addButton(btn => btn
				.setButtonText("Create")
				.onClick((event) => {
					this.plugin.CreateDefaultTemplateFile();
				}));
		
		new Setting(containerEl)
			.setName('Movie filename template')
			.setDesc('Template used for the filename of Movienotes. Used same template tags as other files.')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.FilenameTemplateMovie)
				.onChange(async (value) => {
					this.plugin.settings.FilenameTemplateMovie = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Series filename template')
			.setDesc('Template used for the filename of Movienotes. Used same template tags as other files.')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.FilenameTemplateSeries)
				.onChange(async (value) => {
					this.plugin.settings.FilenameTemplateSeries = value;
					await this.plugin.saveSettings();
				}));
	}
}