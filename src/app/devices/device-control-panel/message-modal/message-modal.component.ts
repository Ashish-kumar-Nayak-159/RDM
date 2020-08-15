import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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
  constructor() { }

  ngOnInit(): void {
    console.log(this.bodyMessage);
  }

  onCloseModal(type) {
    this.modalEvents.emit(type);
  }

}
