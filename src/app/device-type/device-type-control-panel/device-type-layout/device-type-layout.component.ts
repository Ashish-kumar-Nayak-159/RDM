import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-device-type-layout',
  templateUrl: './device-type-layout.component.html',
  styleUrls: ['./device-type-layout.component.css']
})
export class DeviceTypeLayoutComponent implements OnInit {

  @Input() deviceType: any;
  viewType: string;
  constructor(
  ) {

  }
  ngOnInit(): void {
    this.setViewType('history');
  }

  setViewType(type) {
    this.viewType = type;
  }
}
