import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-device-type-control-widgets',
  templateUrl: './device-type-control-widgets.component.html',
  styleUrls: ['./device-type-control-widgets.component.css']
})
export class DeviceTypeControlWidgetsComponent implements OnInit {

  @Input() deviceType: any;
  constructor() { }

  ngOnInit(): void {
  }

}
