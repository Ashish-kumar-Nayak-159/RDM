import { Component, Input, OnInit } from '@angular/core';
import { Device } from 'src/app/models/device.model';

@Component({
  selector: 'app-gateway-current-configuration',
  templateUrl: './gateway-current-configuration.component.html',
  styleUrls: ['./gateway-current-configuration.component.css']
})
export class GatewayCurrentConfigurationComponent implements OnInit {

  @Input() device: Device = new Device();
  deviceMetadataKeys: any[] = [];
  constructor() { }

  ngOnInit(): void {
    this.deviceMetadataKeys = Object.keys(this.device.metadata);
  }

}
