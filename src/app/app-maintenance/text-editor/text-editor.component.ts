import { Component, EventEmitter, OnInit,Output } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})

export class TextEditorComponent  {
  name = 'Angular ';
  htmlContent :any;
  @Output() htmlContentDetect = new EventEmitter<any>();
  handleInputChange(value){
    // ... all of your logic
    console.log(this.htmlContent+"--"+value);
    this.htmlContentDetect.emit(this.htmlContent); // this will pass the $event object to the parent component.
    }
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '10rem!important',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
      ],
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  };
}
