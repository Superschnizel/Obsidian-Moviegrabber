import { Modal, App, Setting } from "obsidian";
import { MovieData, MovieSearchItem } from "./MoviegrabberSearchObject";

export class ConfirmCreateNoteModal extends Modal {
    result: string;
    onSubmit: () => void;
    data : MovieData;
  
    constructor(app: App, data: MovieData, onSubmit: () => void) {
      super(app);
      this.onSubmit = onSubmit;
      this.data = data;
    }
  
    onOpen() {
      const { contentEl } = this;
  
      contentEl.createEl("h1", { text: `Create Note for ${this.data.Title} (${this.data.Year})?` });
      
      var d = contentEl.createEl("div", {cls: "confirm_preview_item"})
      d.createEl("img", { 
          attr: {src : this.data.Poster},
          cls : "confirm_preview_img"}
          );
      var dd = d.createEl("div", {cls : "confirm_preview_Text"});
      dd.createEl("div", { text: this.data.Title , cls : "preview_Title"});
      dd.createEl("small", { text: `(${this.data.Year})`, cls : "confirm_preview_Year" });
      

            
      new Setting(contentEl)
        .addButton((btn) =>
          btn
            .setButtonText("Create")
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