import { environment } from './../../../../environments/environment';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-device-type-overview',
  templateUrl: './device-type-overview.component.html',
  styleUrls: ['./device-type-overview.component.css']
})
export class DeviceTypeOverviewComponent implements OnInit {

  @Input() deviceType: any;
  blobSASToken = environment.blobKey;
  constructor() { }

  ngOnInit(): void {
  }

}
