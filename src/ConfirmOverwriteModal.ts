import { App, MarkdownRenderer, Modal, Setting, TextComponent } from "obsidian";
import { MovieData, MovieSearch, MovieSearchItem } from "./MoviegrabberSearchObject";



export class ConfirmOverwriteModal extends Modal {
    result: string;
    onSubmit: () => void;
    SearchItem : MovieSearchItem;
  
    constructor(app: App, searchItem: MovieSearchItem, onSubmit: () => void) {
      super(app);
      this.onSubmit = onSubmit;
      this.SearchItem = searchItem;
    }
  
    onOpen() {
      const { contentEl } = this;
  
      contentEl.createEl("h1", { text: `Overwrite Note?` });
      // contentEl.createEl("input", {type: "text", cls: "search_text"})
      let message = contentEl.createDiv();
      message.createEl("p", {text: `The note for ${this.SearchItem.Title} (${this.SearchItem.Year}) already exists. Do you want to overwrite this note?`})
      let info = message.createDiv({cls : "moviegrabber-info-text", text : '(Everything below the delimiter '});
      info.createEl("span", {cls: "cm-inline-code", text : "%%==MOVIEGRABBER_KEEP==%%"});
      info.createEl("span", {text: " will be kept.)"})

      

            
      new Setting(contentEl)
        .addButton((btn) =>
          btn
            .setButtonText("Overwrite")
            .setCta()
            .setClass("moviegrabber-confirm-button")
            .onClick(() => {
              this.close();
              this.onSubmit();
            }))
        .addButton((btn) =>
        btn
          .setButtonText("Cancel")
          .setCta()
          .onClick(() => {
            this.close();
          }));
    }
  
    onClose() {
      let { contentEl } = this;
      contentEl.empty();
    }
  }