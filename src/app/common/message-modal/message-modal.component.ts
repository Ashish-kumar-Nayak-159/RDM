import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { JsonEditorOptions } from 'ang-jsoneditor';

@Component({
  selector: 'app-message-modal',
  templateUrl: './message-modal.component.html',
  styleUrls: ['./message-modal.component.css']
})
export class MessageModalComponent implements OnInit {

  @Input() bodyMessage: any;
  @Input() headerMessage: any;
  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();
  @Input() modalConfig: any;
  @Input() isAPILoading: any;
  editorOptions: JsonEditorOptions;

  constructor() { }

  ngOnInit(): void {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.modes = ['code','view'];
    this.editorOptions.mode = 'view';
    this.editorOptions.statusBar = false;
    if(!this.isAPILoading) this.isAPILoading = false;
  }

  onCloseModal(type) {
    this.modalEvents.emit(type);
  }

}
