import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-app-maintenance-modal',
  templateUrl: './app-maintenance-modal.component.html',
  styleUrls: ['./app-maintenance-modal.component.css']
})
export class AppMaintenanceModalComponent implements OnInit {

  @Output() modalEmit = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onClose(){
    this.modalEmit.emit('close')
  }
  

}
