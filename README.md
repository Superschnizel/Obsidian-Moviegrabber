# Obsidian Moviegrabber

A plugin to generate notes for movies and series with properties that can be used with [dataview](https://github.com/blacksmithgu/obsidian-dataview). Uses the [Open Movie Database (OMDb) API](http://www.omdbapi.com/) to retrieve movie/series data and the [Youtube Data API](https://developers.google.com/youtube/v3/docs?hl=de) to get the embed links for the trailers (optional).

<p float="left">
	<img src="https://github.com/Superschnizel/Obsidian-Moviegrabber/assets/47162464/3df2496a-ad9c-46ec-a806-b048100e7d70" width="41%">
	<img src="https://github.com/Superschnizel/Obsidian-Moviegrabber/assets/47162464/99770856-7e87-4333-88c0-690e16688d55" width="50%">
</p>

---

# Usage

https://github.com/Superschnizel/Obsidian-Moviegrabber/assets/47162464/28e2ca9d-e504-4923-9609-dc1e5953d219

*(Disclaimer: the choice selection uses outside assets for the movie posters in the preview, retrieved in the search request to OMDb)*

To use this plugin you need to create an API key for the OMDb [here](http://www.omdbapi.com/apikey.aspx) and also a Youtube Data API Key as described [here](https://developers.google.com/youtube/v3/docs#calling-the-api). and set these in the plugin settings.

To search for a movie or series, simply call the command `Search movie` or `Search series`

## Templates

To define how the data will be saved in your notes you can define a template. This template uses tags of the form `{{tag}}` to fill in the data. The available tags are:
```
{{Title}}
{{Year}}
{{Rated}}
{{Runtime}}
{{Genre}}
{{Director}}
{{Writer}}
{{Actors}}
{{Plot}}
{{Language}}
{{Country}}
{{Awards}}
{{Poster}}
{{Ratings}}
{{Metascore}}
{{imdbRating}}
{{imdbVotes}}
{{imdbID}}
{{Type}}
{{DVD}}
{{BoxOffice}}
{{Production}}
{{Website}}
{{totalSeasons}}
{{YoutubeEmbed}}
```

You can generate an example template in the plugin settings. If no template is given, this default template is used.

# Regenerating notes

When trying to create a note for a movie that already exists you will be asked if you want to overwrite the existing note. If you want to keep something from the old note in the newly generated one you can make use of the delimiter string:

```
%%==MOVIEGRABBER_KEEP==%%
```
Everything below this will be transfered to the new note when overwriting.

# Using the generated notes with Dataview and custom CSS

Using a [dataview](https://github.com/blacksmithgu/) table in combination with a custom [css snippet](https://help.obsidian.md/Extending+Obsidian/CSS+snippets), you can use these notes to create an interactive display for your movies.

![grafik](https://github.com/Superschnizel/Obsidian-Moviegrabber/assets/47162464/be2345a6-eeab-4e8b-b2e1-2a5263a9dc41)


https://github.com/Superschnizel/Obsidian-Moviegrabber/assets/47162464/fc555eea-0ae4-46b4-87d2-44cc2626d387

To use this, copy `aditional_css/CardViewMovies.css` to your vault's snippets folder (`.obsidian/snippets/`) and put 

```yaml
---
cssclass: CardViewMovies
---
```
at the top of your note.

A dataview query for movies not yet seen could look something like this:

````dataview
```dataview
TABLE country, year, length, trailer_embed, availability, rating, seen
FROM "Movies" WHERE type = "movie" AND seen = Null
```
````

Note that the cards need at least ``country, year, length, trailer_embed`` in the querry to show a card.
