import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-device-type-json-packet-format',
  templateUrl: './device-type-json-packet-format.component.html',
  styleUrls: ['./device-type-json-packet-format.component.css']
})
export class DeviceTypeJsonPacketFormatComponent implements OnInit {

  @Input() deviceType: any;
  constructor() { }

  ngOnInit(): void {
  }

}
