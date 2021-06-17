import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { Output, OnDestroy } from '@angular/core';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { resolve } from 'dns';

declare var $: any;
@Component({
  selector: 'app-register-properties',
  templateUrl: './register-properties.component.html',
  styleUrls: ['./register-properties.component.css']
})
export class RegisterPropertiesComponent implements OnInit, OnDestroy {

  @Input() deviceTwin: any;
  @Input() device: any;
  @Output() refreshDeviceTwin: EventEmitter<any> = new EventEmitter<any>();
  @Input() componentstate: any;
  devices: any[] = [];
  contextApp: any;
  subscriptions: Subscription[] = [];
  isDevicesAPILoading = false;
  optionsValue: any = {};
  selectedDevice: any;
  displyaMsgArr: any[] = [];
  isAPILoading = false;
  headerMessage: any;
  c2dResponseInterval: any;
  showPropOptions = false;
  properties: any;
  alertConditions: any[] = [];
  applications = CONSTANTS.DEVICEAPPPS;
  thingsModels: any[] = [];
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private toasterService: ToasterService,
    private deviceTypeService: DeviceTypeService
  ) { }

  async ngOnInit(): Promise<void> {
    console.log(JSON.stringify(this.deviceTwin));
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getThingsModels();
    if (this.componentstate === CONSTANTS.IP_GATEWAY) {
      this.getDevicesOfGateway();
    } else {
      this.device.gateway_id = this.device.configuration?.gateway_id;
      this.thingsModels.forEach(model => {
        if (this.device.device_type === model.name) {
          this.device.model_freeze = model.freezed;
        }
      });
      if (this.device.metadata?.package_app && this.deviceTwin?.twin_properties?.reported.registered_devices[this.device.metadata.package_app]
        && (this.deviceTwin.twin_properties.reported?.registered_devices[this.device?.metadata?.package_app]?.
          indexOf(this.device.device_id) > -1)) {
        this.device.is_registered = true;
      }
      this.devices.push(this.device);
    }

  }

  getThingsModels() {
    return new Promise<void>((resolve1, reject) => {
    this.thingsModels = [];
    const obj = {
      app: this.contextApp.app,
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.thingsModels = response.data;
        }
        resolve1();
      }
    ));
    });
  }

  getDevicesOfGateway() {
    this.isDevicesAPILoading = true;
    this.devices = [];
    const obj = {
      gateway_id: this.deviceTwin.device_id,
      type: CONSTANTS.NON_IP_DEVICE,
    };
    this.subscriptions.push(
      this.deviceService.getLegacyDevices(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response.data) {
            // this.devices = response.data;
            response.data.forEach(device => {
              this.thingsModels.forEach(model => {
              if (device.device_type === model.name) {
                device.model_freeze = model.freezed;
              }
              });
              device.appObj = this.applications.find(appObj => appObj.name === device.metadata.package_app);
            });
            this.devices = response.data;
          }
          this.isDevicesAPILoading = false;
        }, error => this.isDevicesAPILoading = false
      )
    );
  }

  openRegisterPropModal(device) {
    this.selectedDevice = device;
    this.showPropOptions = true;
    this.optionsValue = {};
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  getThingsModelProperties() {
    return new Promise<void>((resolve1, reject) => {
        const obj = {
          app: this.contextApp.app,
          name: this.selectedDevice.device_type || this.selectedDevice.tags?.device_type
        };
        this.subscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
          (response: any) => {

            response.properties.measured_properties = response.properties.measured_properties ?
            response.properties.measured_properties : [];
            response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
            response.properties.readable_properties = response.properties.readable_properties ?
            response.properties.readable_properties : [];
            response.properties.writable_properties = response.properties.writable_properties ?
            response.properties.writable_properties : [];
            this.properties = response.properties;
            resolve1();
          }, error => reject()
        ));

    });
  }

  getAlertConditions() {
    return new Promise<void>((resolve1, reject) => {
    const filterObj = {
      device_type: this.selectedDevice.device_type || this.selectedDevice.tags?.device_type,
      source: 'Asset'
    };
    this.subscriptions.push(this.deviceTypeService.getAlertConditions(this.contextApp.app, filterObj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.alertConditions = response.data;
          resolve1();
        }
      }, error => reject()
    ));
    });
  }

  async registerProperties() {
    let count = 0;
    Object.keys(this.optionsValue).forEach(key => {
      if (!this.optionsValue[key]) {
        count++;
      }
    });
    if (count === 4) {
      this.toasterService.showError('Please select options to register', 'Register Properties/Alerts');
      return;
    }
    this.isAPILoading = true;
    this.showPropOptions = false;
    await this.getThingsModelProperties();
    await this.getAlertConditions();
    const obj = {
      device_id: this.selectedDevice.device_id,
      command: 'set_properties',
      measured_properties: this.optionsValue?.measured_properties ? {} : undefined,
      alerts: this.optionsValue.alerts ? {} : undefined,
      writable_properties: this.optionsValue.writable_properties ? {} : undefined,
      readable_properties: this.optionsValue.readable_properties ? {} : undefined,
      derived_properties: this.optionsValue.derived_properties ? {} : undefined
    };
    if (this.optionsValue.measured_properties) {
      this.properties.measured_properties.forEach(prop => {
        obj.measured_properties[prop.json_key] = prop.metadata;
      });
    }
    if (this.optionsValue.readable_properties) {
      this.properties.readable_properties.forEach(prop => {
        obj.readable_properties[prop.json_key] = prop.metadata;
      });
    }
    if (this.optionsValue.alerts) {
      this.alertConditions.forEach(prop => {
        obj.alerts[prop.code] = prop.metadata;
      });
    }
    if (this.optionsValue.derived_properties) {
      this.properties.derived_properties.forEach(prop => {
        obj.derived_properties[prop.json_key] = prop.metadata;
      });
    }
    if (this.optionsValue.writable_properties) {
      this.properties.writable_properties.forEach(prop => {
        obj.writable_properties[prop.json_key] = prop.metadata;
      });
    }
    this.callC2dMethod(obj);
  }

  callC2dMethod(obj) {
    console.log(obj);
    this.isAPILoading = true;
    const c2dObj = {
      device_id: this.componentstate !== CONSTANTS.NON_IP_DEVICE ? this.device.device_id : this.device.gateway_id,
      message: obj,
      app: this.contextApp.app,
      timestamp:  moment().unix(),
      acknowledge: 'Full',
      expire_in_min: 2880,
      job_id: (this.componentstate !== CONSTANTS.NON_IP_DEVICE ? this.device.device_id : this.device.gateway_id)
      + '_' + this.commonService.generateUUID(),
      request_type: obj.command,
      job_type: 'Message',
      sub_job_id: null
    };
    c2dObj.sub_job_id = c2dObj.job_id + '_1';
    this.subscriptions.push(
      this.deviceService.sendC2DMessage(c2dObj, this.contextApp.app,
        this.componentstate !== CONSTANTS.NON_IP_DEVICE ? this.device.device_id : this.device.gateway_id).subscribe(
        (response: any) => {
          this.displyaMsgArr.push({
            message: 'Device properties/alert registration request sent to gateway.',
            error: false
          });
          clearInterval(this.c2dResponseInterval);
          this.loadC2DResponse(c2dObj);
        }, error => {
          this.toasterService.showError(error.message, 'Register Properties/Alerts');
          this.isAPILoading = false;
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
        if (response.data?.length > 0) {
          this.displyaMsgArr.push({
            message:  response.data[response.data.length - 1].device_id + ': ' + response.data[response.data.length - 1]?.payload?.message,
            error: response.data[response.data.length - 1]?.payload?.status === 'failure' ? true : false
          });
          clearInterval(this.c2dResponseInterval);
          // this.refreshDeviceTwin.emit();
          setTimeout(() => {
            this.onModalClose();
            this.isAPILoading = false;
          }, 1000);
        } else {
          clearInterval(this.c2dResponseInterval);
          this.c2dResponseInterval = setInterval(
          () => {
            this.loadC2DResponse(c2dObj);
          }, 5000);
        }
      }
      ));
  }

  onModalClose() {
    $('#confirmMessageModal').modal('hide');
    this.selectedDevice = undefined;
    this.isAPILoading = false;
    clearInterval(this.c2dResponseInterval);
    this.displyaMsgArr = [];
    this.headerMessage = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    clearInterval(this.c2dResponseInterval);
  }
}
