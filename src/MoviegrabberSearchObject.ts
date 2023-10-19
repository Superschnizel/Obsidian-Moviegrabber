export interface MovieSearch{
    totalResults : number;
    Response: boolean;
    Search : Array<MovieSearchItem>;
}

export interface MovieSearchItem{
    Title : string;
    Year : number;
    imdbID : string;
    Type : string;
    Poster : string;
}

export interface MovieData{
    Title: string,
    Year: number,
    Rated: string
    Runtime: string,
    Genre: string,
    Director: string,
    Writer: string,
    Actors: string,
    Plot: string,
    Language: string,
    Country: string,
    Awards: string,
    Poster: string,
    Ratings: Array<any>,
    Metascore: number,
    imdbRating: number,
    imdbVotes: number,
    imdbID: string,
    Type: string,
    DVD: string,
    BoxOffice: string,
    Production: string,
    Website: string,
    totalSeasons: number,
    Response: boolean
  }

export const TEST_SEARCH : MovieSearch = {
    "Search": [
        {
            "Title": "Mission: Impossible - Ghost Protocol",
            "Year": 2011,
            "imdbID": "tt1229238",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BMTY4MTUxMjQ5OV5BMl5BanBnXkFtZTcwNTUyMzg5Ng@@._V1_SX300.jpg"
        },
        {
            "Title": "Mission: Impossible",
            "Year": 1996,
            "imdbID": "tt0117060",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BMTc3NjI2MjU0Nl5BMl5BanBnXkFtZTgwNDk3ODYxMTE@._V1_SX300.jpg"
        },
        {
            "Title": "Mission: Impossible - Rogue Nation",
            "Year": 2015,
            "imdbID": "tt2381249",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BOTFmNDA3ZjMtN2Y0MC00NDYyLWFlY2UtNTQ4OTQxMmY1NmVjXkEyXkFqcGdeQXVyNTg4NDQ4NDY@._V1_SX300.jpg"
        },
        {
            "Title": "Mission: Impossible III",
            "Year": 2006,
            "imdbID": "tt0317919",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BOThhNTA1YjItYzk2Ny00M2Y1LWJlYWUtZDQyZDU0YmY5Y2M5XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg"
        },
        {
            "Title": "Mission: Impossible II",
            "Year": 2000,
            "imdbID": "tt0120755",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BN2RkYWVkZDQtNTMxMi00NWQ4LWE2ODctNmQzOWM2NjQzYzdlXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg"
        },
        {
            "Title": "Mission: Impossible - Fallout",
            "Year": 2018,
            "imdbID": "tt4912910",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BNjRlZmM0ODktY2RjNS00ZDdjLWJhZGYtNDljNWZkMGM5MTg0XkEyXkFqcGdeQXVyNjAwMjI5MDk@._V1_SX300.jpg"
        },
        {
            "Title": "Mission: Impossible - Dead Reckoning Part One",
            "Year": 2023,
            "imdbID": "tt9603212",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BYzFiZjc1YzctMDY3Zi00NGE5LTlmNWEtN2Q3OWFjYjY1NGM2XkEyXkFqcGdeQXVyMTUyMTUzNjQ0._V1_SX300.jpg"
        },
        {
            "Title": "Mission Impossible Versus the Mob",
            "Year": 1969,
            "imdbID": "tt0063310",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BM2RiM2UzNmQtM2UxNS00NWI1LTkxZmEtMzAxM2M4OGY4OTBhXkEyXkFqcGdeQXVyMjUwMDUwNA@@._V1_SX300.jpg"
        }
    ],
    "totalResults": 69,
    "Response": true
}