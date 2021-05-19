import { DeviceService } from './../../services/devices/device.service';
import { CommonService } from './../../services/common.service';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})
export class ControlPanelComponent implements OnInit {
  componentState: string;
  constantData = CONSTANTS;
  subscriptions: Subscription[] = [];
  contextApp: any;
  device: any;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private deviceService: DeviceService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.subscriptions.push(this.route.paramMap.subscribe(
      async params => {
        if (params.get('deviceId')) {
          this.device = new Device();
          this.device.device_id = params.get('deviceId');
          this.getDeviceDetail();
          }
      }
    ));
  }

  async getDeviceDetail() {
    let methodToCall;
    methodToCall = this.deviceService.getDeviceDetailById(this.contextApp.app, this.device.device_id);
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.device = response;
        this.device.gateway_id = this.device.configuration?.gateway_id;
        this.componentState = this.device.type;
      }
    ));
  }

}
