import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-device-type-live-layout',
  templateUrl: './device-type-live-layout.component.html',
  styleUrls: ['./device-type-live-layout.component.css']
})
export class DeviceTypeLiveLayoutComponent implements OnInit {

  @Input() deviceType: any;
  constructor() { }

  ngOnInit(): void {
  }

}
