# Obsidian Moviegrabber

A plugin to generate Notes for Movies with properties that can be used with [dataview](https://github.com/blacksmithgu/obsidian-dataview). Uses the [Open Movie Database (OMDb) API](http://www.omdbapi.com/) to retrieve movie data and the [Youtube Data API](https://developers.google.com/youtube/v3/docs?hl=de) to get the embed links for the trailers.



# Usage



*(disclaimer: the choice selection uses outside assets for the movie posters in the preview, retrieved in the search request to OMDb)*

To use this plugin you need to create an API Key for the OMDb [here](http://www.omdbapi.com/apikey.aspx), and also a Youtube Data API Key as is described [here](https://developers.google.com/youtube/v3/docs#calling-the-api). and set these in the plugins settings.

To search for a movie simply call the command `Search movie`

# Using with Dataview and custom css

Using a [dataview](https://github.com/blacksmithgu/) table in combination with a custom [css snippet](https://help.obsidian.md/Extending+Obsidian/CSS+snippets) you can use these notes to create an interactive display for your movies.


To use this copy `aditional_css/CardViewMovies.css` to your vault's snippets folder (`.obsidian/snippets/`) and put 

```yaml
---
cssclass: CardViewMovies
---
```
at the top of your note.

A dataview querry for movies not yet seen could look something like this:

````dataview
```dataview
TABLE country, year, length, trailer_embed, availability, rating, seen
FROM "Movies" WHERE type = "movie" AND seen = Null
```
````

Note that the cards need at least ``country, year, length, trailer_embed`` in the querry to show a card.

# Disclaimer

Right now the properties generated do not make full use of all the data available from OMDb and is set up such that it works best for my personal use case. If there is interest in this plugin and using the rest of the data please let me know.
