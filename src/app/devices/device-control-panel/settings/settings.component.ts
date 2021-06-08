import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
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
export class SettingsComponent implements OnInit, OnDestroy {

  @Input() device = new Device();
  originalDevice = new Device();
  deviceType: any;
  subscriptions: Subscription[] = [];
  contextApp: any;
  userData: any;
  isSaveSettingAPILoading = false;
  isSettingsEditable = false;
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private toasterService: ToasterService,
    private deviceTypeService: DeviceTypeService
  ) { }

  async ngOnInit(): Promise<void> {
    const device = JSON.parse(JSON.stringify(this.device));
    this.device = undefined;
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getDeviceTypeDetail(device);
    this.getDeviceData(device);
  }

  getDeviceTypeDetail(device) {
    return new Promise<void>((resolve) => {
    const obj = {
      name: device.tags.device_type,
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
          if (!this.deviceType.metadata) {
            this.deviceType.metdata = {};
          }
          if (!this.deviceType.metadata.measurement_settings) {
            this.deviceType.metadata.measurement_settings = {
              measurement_frequency: 5
            };
          }
          if (!this.deviceType.metadata.data_ingestion_settings) {
            this.deviceType.metadata.data_ingestion_settings = {
              value: 'all'
            };
          }
          if (!this.deviceType.metadata.telemetry_mode_settings) {
            this.deviceType.metadata.telemetry_mode_settings = {
              normal_mode_frequency: 60,
              turbo_mode_frequency: 5,
              turbo_mode_timeout_time: 120
            };
          }
        }
        resolve();
      }
    ));
  });
  }

  getDeviceData(device) {
    // this.device.tags = undefined;
    this.subscriptions.push(
      this.deviceService.getDeviceDetailById(this.contextApp.app, device.device_id).subscribe(
      async (response: any) => {
        this.device = JSON.parse(JSON.stringify(response));
        if (!this.device.metadata) {
          this.device.metadata = {};
        }
        console.log(this.device.metadata.measurement_frequency);
        if (!this.device.metadata.telemetry_mode_settings) {
          this.device.metadata.telemetry_mode_settings = {
            normal_mode_frequency: 60,
            turbo_mode_frequency: 5,
            turbo_mode_timeout_time: 120
          };
        }
        if (!this.device.metadata.data_ingestion_settings) {
          this.device.metadata.data_ingestion_settings = {
            value: 'all'
          };
        }
        if (!this.device.metadata.measurement_settings) {
          this.device.metadata.measurement_settings = {
            measurement_frequency: 5
          };
        }
        this.originalDevice = JSON.parse(JSON.stringify(this.device));
      }));
  }

  onCancelClick() {
    this.isSettingsEditable = false;
    this.device = JSON.parse(JSON.stringify(this.originalDevice));
  }

  saveSettings() {
    this.isSaveSettingAPILoading = true;
    const tagObj = {};
    const obj = {
      app : this.contextApp.app,
      metadata: this.device.metadata
    };
    this.subscriptions.push(this.deviceService.updateDeviceMetadata(obj, this.contextApp.app, this.device.device_id).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Update Asset Settings');
        this.getDeviceData(this.device);
        this.isSettingsEditable = false;
        this.isSaveSettingAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Update Asset Settings');
        this.isSaveSettingAPILoading = false;
      }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
