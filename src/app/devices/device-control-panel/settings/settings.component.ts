import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { DeviceService } from './../../../services/devices/device.service';
import { ToasterService } from './../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @Input() device = new Device();
  constructor(
  ) { }

  ngOnInit(): void {
  }


}
