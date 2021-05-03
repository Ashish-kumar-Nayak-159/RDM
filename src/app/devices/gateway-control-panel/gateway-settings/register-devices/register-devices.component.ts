import { ToasterService } from 'src/app/services/toaster.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
declare var $: any;
@Component({
  selector: 'app-register-devices',
  templateUrl: './register-devices.component.html',
  styleUrls: ['./register-devices.component.css']
})
export class RegisterDevicesComponent implements OnInit, OnDestroy {

  @Input() deviceTwin: any;
  @Input() device: any;
  @Output() refreshDeviceTwin: EventEmitter<any> = new EventEmitter<any>();
  @Input() pageType: any;
  devices: any[] = [];
  contextApp: any;
  subscriptions: Subscription[] = [];
  selectedDevices: any[] = [];
  isAllDeviceSelected = false;
  isDevicesAPILoading = false;
  deviceApps: any[] = [];
  selectedApp: any;
  displyaMsgArr: any[] = [];
  isAPILoading = false;
  headerMessage: any;
  c2dResponseInterval: any;
  telemetrySettings: any = {};
  count = 0;
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getDevicesOfGateway();
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
            const apps = CONSTANTS.DEVICEAPPPS;
            apps.forEach(app => {
              const appObj = {
                app: app.name,
                devices: []
              };
              console.log(appObj);
              this.devices.forEach(device => {
                if (device?.metadata?.package_app === app.name) {
                  appObj.devices.push(device);
                }
              });
              console.log(appObj);
              if (appObj.devices.length > 0) {
                this.deviceApps.push(appObj);
              }
            });
          }
          this.isDevicesAPILoading = false;
        }, error => this.isDevicesAPILoading = false
      )
    );
  }

  onDeviceSelection(device, app) {
    if (this.selectedDevices.length === 0) {
      this.selectedDevices.push(device);
    } else {
      const index = this.selectedDevices.findIndex(deviceObj => deviceObj.device_id === device.device_id);
      if (index > -1) {
        this.selectedDevices.splice(index, 1);
      } else {
        this.selectedDevices.push(device);
      }
    }
    const devices = this.deviceApps.find(appObj => appObj.app === app)?.devices;
    if (this.selectedDevices.length === devices.length) {
      this.isAllDeviceSelected = true;
    } else {
      this.isAllDeviceSelected = false;
    }
  }

  onClickOfDeviceAllCheckbox(app) {
    if (this.isAllDeviceSelected) {
      const devices = this.deviceApps.find(appObj => appObj.app === app)?.devices;
      this.selectedDevices = JSON.parse(JSON.stringify(devices));
    } else {
      this.selectedDevices = [];
    }
  }

  checkForDeviceVisibility(device) {
    const index = this.selectedDevices.findIndex(deviceObj => deviceObj.device_id === device.device_id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  registerDevices() {
    const obj = {
      command: 'register_devices',
      app_name: this.selectedApp,
      devices: {}
    };
    this.selectedDevices.forEach(device => {
      obj.devices[device.device_id] = device.metadata.setup_details;
    });
    this.callC2dMethod(obj, 'Register Devices');
  }

  deregisterDevices() {
    const obj = {
      command: 'register_devices',
      app_name: this.selectedApp,
      devices: []
    };
    this.selectedDevices.forEach(device => {
      obj.devices.push(device.device_id);
    });
    this.callC2dMethod(obj, 'Deregister Devices');
  }

  changeTelemetrySetting() {
    const obj = {
      command: 'set_change_value_state',
      app_name: this.selectedApp,
      devices: {}
    };
    this.selectedDevices.forEach(device => {
      obj.devices[device.device_id] = {scv: this.telemetrySettings[device.device_id] ? true : false }
    });
    this.callC2dMethod(obj, 'Change Telemtry Settings');
  }

  callC2dMethod(obj, type) {
    console.log(obj);
    this.isAPILoading = true;
    this.headerMessage = type;
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    const c2dObj = {
      device_id: this.device.device_id,
      message: obj,
      app: this.contextApp.app,
      timestamp:  moment().unix(),
      metadata: {
        acknowledge: 'Full',
        expire_in_min: 1
      },
      message_id: this.device.device_id + '_' + moment().unix(),
      request_type: type
    };
    this.subscriptions.push(
      this.deviceService.sendC2DMessage(c2dObj, this.contextApp.app).subscribe(
        (response: any) => {
          this.displyaMsgArr.push({
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
      correlation_id: c2dObj.message_id,
      app: this.contextApp.app,
      device_id: this.device.device_id,
      from_date: c2dObj.timestamp - 5,
      to_date: moment().unix(),
      epoch: true
    };
    this.subscriptions.push(this.deviceService.getC2dResponseJSON(obj).subscribe(
      (response: any) => {
        // response.data = this.generateResponse();
        if (response.data?.length > 0 && this.displyaMsgArr.length < response.data.length) {
          this.displyaMsgArr.push({
            message:  response.data[response.data.length - 1].device_id + ': ' + response.data[response.data.length - 1].message,
            error: response.data[response.data.length - 1].status === 'failure' ? true : false
          });
        }
        console.log(response.data.length, '======', this.selectedDevices.length);
        if (response.data.length < this.selectedDevices.length) {
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

  generateResponse() {
    const rand = this.commonService.randomIntFromInterval(0, 1);
    const arr = [];
    for (let i = 0; i <= this.count; i++ ) {
      arr.push({
        device_id: this.selectedDevices[i].device_id,
        status: rand === 0 ? 'Success' : 'Failure',
        message: rand === 0 ? 'Device registered successfully.' : 'Error in device registration'
      });
    }
    this.count++;
    console.log(arr);
    return arr;
  }

  onModalClose() {
    $('#confirmMessageModal').modal('hide');
    this.selectedDevices = [];
    this.isAPILoading = false;
    this.count = 0;
    this.isAllDeviceSelected = false;
    clearInterval(this.c2dResponseInterval);
    this.telemetrySettings = {};
    this.displyaMsgArr = [];
    this.headerMessage = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    clearInterval(this.c2dResponseInterval);
  }
}
