export interface MoviegrabberSettings {
	MovieDirectory: string;
	OMDb_API_Key: string;
	YouTube_API_Key: string;
}

export const DEFAULT_SETTINGS: MoviegrabberSettings = {
	MovieDirectory: 'Movies',
	OMDb_API_Key: '__',
	YouTube_API_Key: ''
}