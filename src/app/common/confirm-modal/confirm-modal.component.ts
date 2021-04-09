import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent implements OnInit {

  @Input() bodyMessage: any;
  @Input() headerMessage: any;
  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();
  @Input() modalConfig: any;
  constructor() { }

  ngOnInit(): void {
  }

  onCloseModal(type) {
    this.modalEvents.emit(type);
  }


}
