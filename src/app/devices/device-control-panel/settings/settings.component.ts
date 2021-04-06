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
    this.device = JSON.parse(JSON.stringify(this.device));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getDeviceTypeDetail();
    this.getDeviceData();
  }

  getDeviceTypeDetail() {
    return new Promise<void>((resolve) => {
    const obj = {
      name: this.device.tags.device_type,
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
          if (!this.deviceType.metadata.measurement_frequency) {
            this.deviceType.metadata.measurement_frequency = {
              min: 1,
              max: 10,
              average: 5
            };
          }
          if (!this.deviceType.metadata.telemetry_frequency) {
            this.deviceType.metadata.telemetry_frequency = {
              min: 1,
              max: 60,
              average: 30
            };
          }
        }
        resolve();
      }
    ));
  });
  }

  getDeviceData() {
    // this.device.tags = undefined;
    this.subscriptions.push(
      this.deviceService.getDeviceDetailById(this.contextApp.app, this.device.device_id).subscribe(
      async (response: any) => {
        this.device = JSON.parse(JSON.stringify(response));
        if (!this.device.metadata) {
          this.device.metadata = {};
        }
        if (!this.device.metadata.measurement_frequency) {
          this.device.metadata.measurement_frequency = {
            min: this.deviceType.metadata.measurement_frequency.min,
            max: this.deviceType.metadata.measurement_frequency.max,
            average: this.deviceType.metadata.measurement_frequency.average
          };
        }
        if (!this.device.metadata.telemetry_frequency) {
          this.device.metadata.telemetry_frequency = {
            min: this.deviceType.metadata.telemetry_frequency.min,
            max: this.deviceType.metadata.telemetry_frequency.max,
            average: this.deviceType.metadata.telemetry_frequency.average
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
    console.log(obj);
    this.subscriptions.push(this.deviceService.updateDeviceMetadata(obj, this.contextApp.app, this.device.device_id).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Update Device Settings');
        this.getDeviceData();
        this.isSettingsEditable = false;
        this.isSaveSettingAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Update Device Settings');
        this.isSaveSettingAPILoading = false;
      }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
