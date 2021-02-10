import { ToasterService } from './../../../services/toaster.service';
import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { DeviceService } from 'src/app/services/devices/device.service';

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
  isSaveSettingAPILoading = false;
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getDeviceData();
  }

  getDeviceData() {
    this.device.tags = undefined;

    this.subscriptions.push(
      this.deviceService.getDeviceData(this.device.device_id, this.contextApp.app).subscribe(
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

  saveGatewaySettings() {
    this.isSaveSettingAPILoading = true;
    const obj = {
      device_id: this.device.device_id,
      display_name: this.device.display_name,
      tags: this.device.tags
    };
    this.subscriptions.push(this.deviceService.updateDeviceTags(obj, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess('Gateway Settings updated successfully.', 'Gateway Settings');
        this.getDeviceData();
        this.isSaveSettingAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Gateway Settings');
        this.isSaveSettingAPILoading = false;
      }
    ));
  }

}
