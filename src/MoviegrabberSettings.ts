export interface MoviegrabberSettings {
	MovieDirectory: string;
	SeriesDirectory: string;
	OMDb_API_Key: string;
	YouTube_API_Key: string;
	SwitchToCreatedNote: boolean;
}

export const DEFAULT_SETTINGS: MoviegrabberSettings = {
	MovieDirectory: 'Movies',
	SeriesDirectory: 'Series',
	OMDb_API_Key: '',
	YouTube_API_Key: '',
	SwitchToCreatedNote: true
}