import { ToasterService } from 'src/app/services/toaster.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { EventEmitter, Output } from '@angular/core';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-manage-applications',
  templateUrl: './manage-applications.component.html',
  styleUrls: ['./manage-applications.component.css']
})
export class ManageApplicationsComponent implements OnInit {

  @Input() deviceTwin: any;
  @Input() device: any;
  @Output() refreshDeviceTwin: EventEmitter<any> = new EventEmitter<any>();
  contextApp: any;
  applications = CONSTANTS.DEVICEAPPPS;
  isAPILoading: any = {};

  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
  }

  startApp(app, index) {
    const obj = {
      device_id: this.device.device_id,
      method: 'START_APP',
      message: {
      command: 'START_APP',
      app_name: app.name
      },
      app: this.contextApp.app,
      timestamp: (moment().utc()).unix(),
      acknowledge: 'Full',
      expire_in_min: 1,
      request_type: 'Start App',
      message_id: this.device.device_id + '_' + (moment().utc()).unix()
    };
    this.callDirectMethod(obj, 'Start', index);
  }

  stopApp(app, index) {
    const obj = {
      device_id: this.device.device_id,
      method: 'STOP_APP',
      message: {
        command: 'STOP_APP',
        app_name: app.name
      },
      app: this.contextApp.app,
      timestamp: (moment().utc()).unix(),
      acknowledge: 'Full',
      expire_in_min: 1,
      message_id: this.device.device_id + '_' + (moment().utc()).unix(),
      request_type: 'Stop App',
    };
    this.callDirectMethod(obj, 'Stop', index);
  }

  restartApp(app, index) {
    const obj = {
      device_id: this.device.device_id,
      method: 'RESTART_APP',
      message: {
        command: 'RESTART_APP',
        app_name: app.name
      },
      app: this.contextApp.app,
      timestamp: (moment().utc()).unix(),
      acknowledge: 'Full',
      expire_in_min: 1,
      message_id: this.device.device_id + '_' + (moment().utc()).unix(),
      request_type: 'Restart App',
    };
    this.callDirectMethod(obj, 'Restart', index);
  }

  callDirectMethod(obj, type, index) {
    this.isAPILoading = {};
    this.isAPILoading[index] = true;
    this.deviceService.callDeviceMethod(obj, this.contextApp.app).subscribe(
      (response: any) => {
        this.isAPILoading[index] = false;
        this.toasterService.showSuccess(response?.device_response?.message, type + ' App');
        this.refreshDeviceTwin.emit();
      }, error => {
        this.isAPILoading[index] = false;
        this.toasterService.showError(error?.device_response?.message, type + ' App');
      }
      );

  }

}
