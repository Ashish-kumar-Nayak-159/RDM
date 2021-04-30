import { ToasterService } from './../../../services/toaster.service';
import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as moment from 'moment';

@Component({
  selector: 'app-gateway-settings',
  templateUrl: './gateway-settings.component.html',
  styleUrls: ['./gateway-settings.component.css']
})
export class GatewaySettingsComponent implements OnInit {

  @Input() device: any;
  @Input() tileData: any;
  subscriptions: Subscription[] = [];
  contextApp: any;
  userData: any;
  selectedTab: string;
  isSaveSettingAPILoading = false;
  isTestConnectionAPILoading = false;
  testConnectionMessage: string;
  deviceTwin: any;
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.device = JSON.parse(JSON.stringify(this.device));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getDeviceData();
    this.getDeviceTwinData();
  }

  getDeviceData() {
    this.subscriptions.push(
      this.deviceService.getDeviceDetailById(this.contextApp.app, this.device.device_id).subscribe(
      async (response: any) => {
        this.device = JSON.parse(JSON.stringify(response));
        if (!this.device.tags.settings) {
          this.device.tags.settings = {
            normal_mode: {
              frequency: 60
            },
            turbo_mode: {
              frequency: 1,
              timeout_time: 120
            }
          };
        }
        if (!this.device.tags.settings.normal_mode) {
          this.device.tags.settings.normal_mode = {
            frequency: 60
        };
        }
        if (!this.device.tags.settings.turbo_mode) {
          this.device.tags.settings.turbo_mode = {
            frequency: 1,
            timeout_time: 120
          };
        }
      }));
  }

  getDeviceTwinData() {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.deviceService.getDeviceTwin(this.contextApp.app, this.device.device_id).subscribe(
          (response) => {
            this.deviceTwin = response;
            if (!this.deviceTwin.twin_properties) {
              this.deviceTwin.twin_properties = {};
            }
            if (!this.deviceTwin.twin_properties.reported) {
              this.deviceTwin.twin_properties.reported = {};
            }
            if (!this.deviceTwin.twin_properties.reported.registered_devices) {
              this.deviceTwin.twin_properties.reported.registered_devices = [];
            }
            resolve();
          }
        ));
    });
  }

  onClickOfTab(type) {
    this.selectedTab = type;
  }

  testConnectionWithGateway() {
    this.testConnectionMessage = undefined;
    this.isTestConnectionAPILoading = true;
    const obj = {
      method: 'test_gateway_connection',
      app: this.contextApp.app,
      gateway_id: this.device.device_id,
      message: {},
      timestamp: (moment().utc()).unix(),
      acknowledge: 'Full',
      expire_in_min: 1,
      message_id: this.device.device_id + '_' + (moment().utc()).unix()
    };
    this.subscriptions.push(
      this.deviceService.callDeviceMethod(obj, obj.app).subscribe(
        (response: any) => {
          if (response.status === 'connected') {
            this.testConnectionMessage = 'Gateway connection is successful';
          }
          this.isTestConnectionAPILoading = false;
        }, error => {
          this.testConnectionMessage = 'Gateway is not connected';
          this.isTestConnectionAPILoading = false;
        }
      )
    );
  }

  saveGatewaySettings() {
    this.isSaveSettingAPILoading = true;
    const obj = {
      device_id: this.device.device_id,
      display_name: this.device.display_name,
      tags: this.device.tags,
      app: this.contextApp.app
    };
    this.subscriptions.push(this.deviceService.updateDeviceTags(obj, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess('Gateway Settings updated successfully.', 'Gateway Settings');
        this.deviceService.reloadDeviceInControlPanelEmitter.emit();
        this.isSaveSettingAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Gateway Settings');
        this.isSaveSettingAPILoading = false;
      }
    ));
  }

}
