import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Device } from 'src/app/models/device.model';

@Component({
  selector: 'app-access-control',
  templateUrl: './access-control.component.html',
  styleUrls: ['./access-control.component.css']
})
export class AccessControlComponent implements OnInit {

  @Input() device: Device = new Device();
  @Output() sidebarClickEvent: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

  onSideBarClick() {
    this.sidebarClickEvent.emit();
  }

}
