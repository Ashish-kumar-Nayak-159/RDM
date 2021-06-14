import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-device-type-settings',
  templateUrl: './device-type-settings.component.html',
  styleUrls: ['./device-type-settings.component.css']
})
export class DeviceTypeSettingsComponent implements OnInit {

  @Input() deviceType: any;
  originalDeviceType: any;
  subscriptions: Subscription[] = [];
  contextApp: any;
  userData: any;
  isSaveSettingAPILoading = false;
  isSettingsEditable = false;
  constructor(
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.deviceType = JSON.parse(JSON.stringify(this.deviceType));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getDeviceTypeDetail();
  }

  getDeviceTypeDetail() {
    return new Promise<void>((resolve) => {
    const obj = {
      name: this.deviceType.name,
      app: this.contextApp.app
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelDetails(obj.app, obj.name).subscribe(
      (response: any) => {
        if (response) {
          this.deviceType = response;
          this.deviceType.name = obj.name;
          this.deviceType.app = obj.app;
          if (!this.deviceType.tags.reserved_tags) {
            this.deviceType.tags.reserved_tags = [];
          }
          if (!this.deviceType.metadata.telemetry_mode_settings) {
            this.deviceType.metadata.telemetry_mode_settings = {
              normal_mode_frequency: 60,
              turbo_mode_frequency: 5,
              turbo_mode_timeout_time: 120
            };
          }
          if (!this.deviceType.metadata.data_ingestion_settings) {
            this.deviceType.metadata.data_ingestion_settings = {
              type: 'all_props_at_fixed_interval',
              frequency_in_sec: 10
            };
          }
          if (!this.deviceType.metadata.measurement_settings) {
            this.deviceType.metadata.measurement_settings = {
              measurement_frequency: 5
            };
          }
          this.originalDeviceType = JSON.parse(JSON.stringify(this.deviceType));
        }
        resolve();
      }
    ));
  });
  }

  onCancelClick() {
    this.isSettingsEditable = false;
    this.deviceType = JSON.parse(JSON.stringify(this.originalDeviceType));
  }

  saveSettings() {
    if (this.deviceType.metadata.measurement_settings.measurement_frequency <= 0) {
      this.toasterService.showError('Measurement frequency should be greater than 0', 'Model Settings');
      return;
    }
    if (this.deviceType.metadata.telemetry_mode_settings.normal_mode_frequency <= 0 || this.deviceType.metadata.telemetry_mode_settings.turbo_mode_frequency <= 0 ||
      this.deviceType.metadata.telemetry_mode_settings.turbo_mode_timeout_time <= 0) {
        this.toasterService.showError('Telemtry frequency values should be greater than 0', 'Model Settings');
        return;
    }
    this.isSaveSettingAPILoading = true;
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.app = this.contextApp.app;
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(this.deviceTypeService.updateThingsModel(obj, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Update Model Settings');
        this.getDeviceTypeDetail();
        this.isSaveSettingAPILoading = false;
        this.isSettingsEditable = false;
      }, error => {
        this.toasterService.showError(error.message, 'Update Model Settings');
        this.isSaveSettingAPILoading = false;
      }
    ));
  }

}
