import { ItemView, MarkdownRenderer, TFile, TFolder, WorkspaceLeaf, normalizePath } from "obsidian";
import { MoviegrabberSettings } from "./MoviegrabberSettings";
import { MovieData } from "./MoviegrabberSearchObject";
import { GalleryMovieData } from "./GalleryMovieData";

export const VIEW_TYPE_MOVIE_GALLERY = "movie-gallery-view";

export class MovieGalleryView extends ItemView {
  settings : MoviegrabberSettings;
  movies : GalleryMovieData[] | null;

  constructor(leaf: WorkspaceLeaf, settings: MoviegrabberSettings) {
    super(leaf);
    this.settings = settings;
  }

  getViewType() {
    return VIEW_TYPE_MOVIE_GALLERY;
  }

  getDisplayText() {
    return "Movie gallery";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "Example view" });
    var cardBox = container.createDiv({cls:"moviegrabber-gallery-cardbox"});

    this.movies = await this.getMovies();

    this.movies?.forEach(element => {
      this.createMovieCard(cardBox, element);
    });
        
  }

  async onClose() {
    // Nothing to clean up.
  }

  getMovies() : GalleryMovieData[] | null {
    const movieDir = this.app.vault.getAbstractFileByPath(this.settings.MovieDirectory);
    if (!(movieDir instanceof TFolder)) {
      console.log("movieDir is not an instance of TFolder.")
      return null;
    }

    return movieDir.children
      .filter((element) => element instanceof TFile)
      .map(element => {
        const tFile = element as TFile
        const data = this.app.metadataCache.getFileCache(tFile)?.frontmatter as GalleryMovieData;
        // console.log(data);
        data.Title = tFile.basename;
        return data;
    });
  }

  createMovieCard(container : HTMLElement, data : GalleryMovieData){
    // create card and assign styles
    const card = container.createDiv({cls: "moviegrabber-card-outerbody"});

    var internalLink = `${this.settings.MovieDirectory}/${data.title}.md`;

    // <a data-tooltip-position="top" aria-label="Movies/Alien vs. Predator.md" data-href="Movies/Alien vs. Predator.md" href="Movies/Alien vs. Predator.md" class="internal-link" target="_blank" rel="noopener">Alien vs. Predator</a>
    const titlebox = card.createDiv({cls: "moviegrabber-card-titlebox"});
    MarkdownRenderer.render(this.app, `[[${data.title}]]`, titlebox, normalizePath(internalLink), this)
        
    //     .createEl("span", {text: data.Title ,cls: "internal-link", href: internalLink});
    // titleLink.setAttribute("data-href", internalLink);
    // titleLink.setAttribute("aria-label", internalLink);
    // titleLink.setAttribute("target", "_blank");
    // titleLink.setAttribute("rel", "noopener");
    // titleLink.setAttribute("data-href", internalLink);
    // titleLink.setAttribute("data-tooltip-position", "top")
    

    var topRow = card.createDiv({cls: "moviegrabber-card-toprow"});
    const countryYear = topRow.createDiv({cls: "moviegrabber-card-countryyearbox"});
    countryYear.createEl("p", {text: `${data.country}`,cls: "moviegrabber-card-country"});
    countryYear.createEl("p", {text: `(${data.year})`,cls: "moviegrabber-card-year"});
    topRow.createEl("p", {text: `${data.length} min.`,cls: "moviegrabber-card-length"})

    card.createEl("img", {cls: "moviegrabber-card-poster"}).setAttribute("src", data.poster);
  }
}