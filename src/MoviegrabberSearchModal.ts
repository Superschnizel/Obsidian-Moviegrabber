import { App, Modal, Setting, TextComponent } from "obsidian";


export class MoviegrabberSearchModal extends Modal {
  result: string;
  onSubmit: (result: string) => void;

  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h1", { text: "Search Movie by Title" });
    // contentEl.createEl("input", {type: "text", cls: "search_text"})
    var text = new TextComponent(contentEl.createDiv({cls : "search_text_box"}))
      .onChange((value) => { 
        this.result = value;
      });
    text.inputEl.addClass("search_text");
    text.inputEl.focus();
    text.inputEl.addEventListener("keypress", ({key}) => {
      if (key === 'Enter') {
        this.close();
        this.onSubmit(this.result);
      }
    })
    
    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Search")
          .setCta()
          .onClick(() => {
            this.close();
            this.onSubmit(this.result);
          }));
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}