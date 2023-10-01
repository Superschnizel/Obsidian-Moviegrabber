import { App, Modal, Notice, SuggestModal } from "obsidian";
import { MovieSearch, MovieSearchItem } from "./MoviegrabberSearchObject";

export class MoviegrabberSelectionModal extends SuggestModal<MovieSearchItem> {
    result: string;
    searchQuerry : string;
    searchResults : MovieSearch;
    onSubmit: (result: MovieSearchItem) => void;
  
    constructor(app: App, searchResults : MovieSearch,  onSubmit: (result: MovieSearchItem) => void) {
      super(app);
      this.onSubmit = onSubmit;
      this.searchResults = searchResults;
    }
  
    getSuggestions(query: string): MovieSearchItem[] {
        return this.searchResults.Search.filter((movie) =>
          movie.Title.toLowerCase().includes(query.toLowerCase())
        );
      }
    
      // Renders each Movie
      renderSuggestion(movie: MovieSearchItem, el: HTMLElement) {
        var d = el.createEl("div", {cls: "preview_list_item"})
        d.createEl("img", { 
            attr: {src : movie.Poster},
            cls : "preview_img"}
            );
        var dd = d.createEl("div", {cls : "preview_Text"});
        dd.createEl("div", { text: movie.Title , cls : "preview_Title"});
        dd.createEl("small", { text: `(${movie.Year})`, cls : "preview_Year" });
      }
    
      // Perform action on the selected suggestion.
      onChooseSuggestion(movie: MovieSearchItem, evt: MouseEvent | KeyboardEvent) {
        new Notice(`Creating Note for: ${movie.Title} (${movie.Year})`);
        this.onSubmit(movie);
      }
  }