import { App, Modal, Setting, TextComponent } from "obsidian";


export class MoviegrabberSearchModal extends Modal {
  result: string;
  onSubmit: (result: string) => void;
  searchType : string;

  constructor(app: App, searchType: 'movie' | 'series',onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
    this.searchType = searchType;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h1", { text: `Search ${this.searchType} by title` });
	let label = contentEl.createDiv({cls : "search_text_label_box"}).createSpan({cls : "search_text_label"});
	label.innerText = "To add a year to the search put it in parntheses: (2024).\nYou can also directly enter an ImdbID (e.g. tt0062622).";
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
