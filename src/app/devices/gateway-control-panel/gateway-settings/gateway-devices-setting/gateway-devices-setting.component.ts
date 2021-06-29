import { ToasterService } from './../../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CONSTANTS } from './../../../../app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
declare var $: any;
@Component({
  selector: 'app-gateway-devices-setting',
  templateUrl: './gateway-devices-setting.component.html',
  styleUrls: ['./gateway-devices-setting.component.css']
})
export class GatewayDevicesSettingComponent implements OnInit {

  @Input() deviceTwin: any;
  @Input() device: any;
  @Output() refreshDeviceTwin: EventEmitter<any> = new EventEmitter<any>();
  @Input() componentState: any;
  contextApp: any;
  applications = CONSTANTS.DEVICEAPPPS;
  isDevicesAPILoading = false;
  devices: any[] = [];
  subscriptions: Subscription[] = [];
  telemetrySettings = {};
  selectedDevice: any;
  displayMsgArr: any[] = [];
  c2dResponseInterval: any;
  isAPILoading = false;
  headerMessage: any;
  isSaveSettingAPILoading = false;
  constantData = CONSTANTS;
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.componentState === CONSTANTS.IP_GATEWAY) {
    this.getDevicesOfGateway();
    } else {
      this.device.gateway_id = this.device.configuration?.gateway_id;
      this.selectedDevice = this.device;
      if (!this.device.metadata) {
        this.device.metadata = {};
      }

      if (!this.device.metadata.measurement_settings) {
        this.device.metadata.measurement_settings = {
          measurement_frequency: 5
        };
      }
      if (!this.device.metadata.data_ingestion_settings) {
        this.device.metadata.data_ingestion_settings = {
          type: 'all_props_at_fixed_interval',
          frequency_in_sec: 10
        };
      }
      if (!this.device.metadata.telemetry_mode_settings) {
        this.device.metadata.telemetry_mode_settings = {
          normal_mode_frequency: 60,
          turbo_mode_frequency: 5,
          turbo_mode_timeout_time: 120
        };
      }
      this.device.settings_enabled = false;
      if (this.device.metadata?.package_app) {
        this.device.appObj = this.applications.find(appObj => appObj.name === this.device.metadata.package_app);
        console.log(this.device.appObj);
        console.log(this.deviceTwin);
        if (this.deviceTwin.twin_properties.reported && this.deviceTwin.twin_properties.reported[this.device.appObj.type] &&
          this.deviceTwin.twin_properties.reported[this.device.appObj.type][this.device.appObj.name]) {
            if (this.deviceTwin.twin_properties.reported[this.device.appObj.type][this.device.appObj.name].status?.toLowerCase() !== 'running') {
              this.device.settings_enabled = false;
            } else {
              if (this.deviceTwin.twin_properties.reported[this.device.appObj.type][this.device.appObj.name].device_configuration
              && this.deviceTwin.twin_properties.reported[this.device.appObj.type][this.device.appObj.name].device_configuration[this.device.device_id]) {
                this.device.settings_enabled = true;
              } else {
                this.device.settings_enabled = false;
              }
            }
          }
        }
      this.devices.push(this.device);
    }
  }

  getDevicesOfGateway() {
    this.isDevicesAPILoading = true;
    this.devices = [];
    const obj = {
      gateway_id: this.device.device_id,
      type: CONSTANTS.NON_IP_DEVICE,
    };
    this.subscriptions.push(
      this.deviceService.getLegacyDevices(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response.data) {
            this.devices = response.data;
            this.devices.forEach(device => {
              if (!device.metadata) {
                device.metadata = {};
              }
              if (!device.metadata.measurement_settings) {
                device.metadata.measurement_settings = {
                  measurement_frequency: 5
                };
              }
              if (!device.metadata.data_ingestion_settings) {
                device.metadata.data_ingestion_settings = {
                  type: 'all_props_at_fixed_interval',
                  frequency_in_sec: 10
                };
              }
              if (!device.metadata.telemetry_mode_settings) {
                device.metadata.telemetry_mode_settings = {
                  normal_mode_frequency: 60,
                  turbo_mode_frequency: 5,
                  turbo_mode_timeout_time: 120
                };
              }
              device.settings_enabled = false;
              if (device.metadata?.package_app) {
              device.appObj = this.applications.find(appObj => appObj.name === device.metadata.package_app);
              if (this.deviceTwin.twin_properties.reported && this.deviceTwin.twin_properties.reported[device.appObj.type] &&
                this.deviceTwin.twin_properties.reported[device.appObj.type][device.appObj.name]) {
                  if (this.deviceTwin.twin_properties.reported[device.appObj.type][device.appObj.name].status?.toLowerCase() !== 'running') {
                    device.settings_enabled = false;
                  } else {
                    if (this.deviceTwin.twin_properties.reported[device.appObj.type][device.appObj.name].device_configuration
                    && this.deviceTwin.twin_properties.reported[device.appObj.type][device.appObj.name].device_configuration[device.device_id]) {
                      device.settings_enabled = true;
                    } else {
                      device.settings_enabled = false;
                    }
                  }
                }
              }
            });
          }
          this.isDevicesAPILoading = false;
        }, error => this.isDevicesAPILoading = false
      )
    );
  }

  changeTelemetrySetting() {
    const obj = {
      command: 'set_configuration',
      app_name: this.selectedDevice?.metadata?.package_app,
      devices: {}
    };
    console.log(this.telemetrySettings);
    obj.devices[this.selectedDevice.device_id] = {
      measurement_frequency_in_milli_sec: this.selectedDevice.metadata.measurement_settings.measurement_frequency * 1000,
      turbo_mode_frequency_in_milli_sec: this.selectedDevice.metadata.telemetry_mode_settings.turbo_mode_frequency * 1000,
      turbo_mode_timeout_in_milli_sec: this.selectedDevice.metadata.telemetry_mode_settings.turbo_mode_timeout_time * 1000,
      ingestion_settings_type: this.selectedDevice.metadata.data_ingestion_settings.type,
      ingestion_settings_frequency_in_milli_sec: this.selectedDevice.metadata.telemetry_mode_settings.normal_mode_frequency * 1000
    };
    this.callC2dMethod(obj, 'Change Asset Settings');
  }


  callC2dMethod(obj, type) {
    console.log(obj);
    this.isAPILoading = true;
    this.headerMessage = type;
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    const c2dObj = {
      device_id: this.componentState !== CONSTANTS.NON_IP_DEVICE ? this.device.device_id : this.device.gateway_id,
      message: obj,
      app: this.contextApp.app,
      timestamp:  moment().unix(),
      acknowledge: 'Full',
      expire_in_min: 2880,
      job_id: this.device.device_id + '_' + this.commonService.generateUUID(),
      request_type: obj.command,
      job_type: 'Message',
      sub_job_id: null
    };
    c2dObj.sub_job_id = c2dObj.job_id + '_1';
    this.subscriptions.push(
      this.deviceService.sendC2DMessage(c2dObj, this.contextApp.app,
        this.componentState !== CONSTANTS.NON_IP_DEVICE ? this.device.device_id : this.device.gateway_id).subscribe(
        (response: any) => {
          this.displayMsgArr.push({
            message: type + ' request sent to gateway.',
            error: false
          });
          clearInterval(this.c2dResponseInterval);
          this.loadC2DResponse(c2dObj);
        }, error => {
          this.toasterService.showError(error.message, type);
          this.isAPILoading = false;
          this.onModalClose();
          clearInterval(this.c2dResponseInterval);
        }
      )
    );
  }

  loadC2DResponse(c2dObj) {
    const obj = {
      sub_job_id: c2dObj.sub_job_id,
      app: this.contextApp.app,
      from_date: c2dObj.timestamp - 5,
      to_date: moment().unix(),
      epoch: true,
      job_type: 'Message'
    };
    this.subscriptions.push(this.deviceService.getMessageResponseDetails(this.contextApp.app, obj).subscribe(
      (response: any) => {
        // response.data = this.generateResponse();
        if (response.data?.length > 0 && this.displayMsgArr.length <= response.data.length) {
          for (let i = this.displayMsgArr.length - 1; i < response.data.length; i++) {
            this.displayMsgArr.push({
              message:  response.data[i].device_id + ': ' + response.data[i]?.payload?.message,
              error: response.data[i]?.payload?.status === 'failure' ? true : false
            });
          }
        }
        if (response.data.length < 1) {
          clearInterval(this.c2dResponseInterval);

          this.c2dResponseInterval = setInterval(
          () => {
            this.loadC2DResponse(c2dObj);
          }, 5000);
        } else {
          clearInterval(this.c2dResponseInterval);
          this.refreshDeviceTwin.emit();
          setTimeout(() => {
            this.onModalClose();
            this.isAPILoading = false;
          }, 1000);
        }
      }
      ));
  }

  onModalClose() {
    $('#confirmMessageModal').modal('hide');
    this.isAPILoading = false;
    clearInterval(this.c2dResponseInterval);
    this.telemetrySettings = {};
    this.displayMsgArr = [];
    this.headerMessage = undefined;
  }

  saveGatewaySettings() {
    this.changeTelemetrySetting();
    this.isSaveSettingAPILoading = true;
    const obj = {
      metadata: this.selectedDevice.metadata,
      app: this.contextApp.app
    };
    this.subscriptions.push(this.deviceService.updateDeviceMetadata(obj, this.contextApp.app, this.selectedDevice.device_id).subscribe(
      (response: any) => {
        this.toasterService.showSuccess('Asset Settings updated successfully.', 'Asset Settings');
        this.deviceService.reloadDeviceInControlPanelEmitter.emit();
        this.isSaveSettingAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Asset Settings');
        this.isSaveSettingAPILoading = false;
      }
    ));
  }



}
