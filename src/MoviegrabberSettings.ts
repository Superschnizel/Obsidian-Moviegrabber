export interface MoviegrabberSettings {
	MovieDirectory: string;
	API_Key: string;
}

export const DEFAULT_SETTINGS: MoviegrabberSettings = {
	MovieDirectory: 'Movies',
	API_Key: '__'
}