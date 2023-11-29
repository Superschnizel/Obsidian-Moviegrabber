export interface MoviegrabberSettings {
	MovieDirectory: string;
	SeriesDirectory: string;
	OMDb_API_Key: string;
	YouTube_API_Key: string;
	SwitchToCreatedNote: boolean;

	MovieTemplatePath: string;
	SeriesTemplatePath: string;

	PlotLength: string;
}

export const DEFAULT_SETTINGS: MoviegrabberSettings = {
	MovieDirectory: 'Movies',
	SeriesDirectory: 'Series',
	OMDb_API_Key: '',
	YouTube_API_Key: '',
	SwitchToCreatedNote: true,
	MovieTemplatePath: '',
	SeriesTemplatePath: '',
	PlotLength: 'short'
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
	`{{Plot}}`