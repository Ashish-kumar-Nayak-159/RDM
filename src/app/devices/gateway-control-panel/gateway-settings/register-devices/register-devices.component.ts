import { DeviceService } from 'src/app/services/devices/device.service';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-register-devices',
  templateUrl: './register-devices.component.html',
  styleUrls: ['./register-devices.component.css']
})
export class RegisterDevicesComponent implements OnInit {

  @Input() deviceTwin: any;
  @Input() device: any;
  devices: any[] = [];
  contextApp: any;
  subscriptions: Subscription[] = [];
  isAllRegisteredDeviceSelected = false;
  selectedRegisteredDevices: any[] = [];
  selectedDevices: any[] = [];
  isAllDeviceSelected = false;
  isDevicesAPILoading = false;
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getDevicesOfGateway();
  }

  getDevicesOfGateway() {
    this.isDevicesAPILoading = true;
    this.devices = [];
    const obj = {
      gateway_id: this.deviceTwin.device_id,
      type: CONSTANTS.NON_IP_DEVICE,
      hierarchy: JSON.stringify(this.device.tags.hierarchy_json)
    };
    this.subscriptions.push(
      this.deviceService.getLegacyDevices(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response.data) {
            this.devices = response.data;
          }
          this.isDevicesAPILoading = false;
        }, error => this.isDevicesAPILoading = false
      )
    );
  }

  onDeviceSelection(device) {
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
    if (this.selectedDevices.length === this.devices.length) {
      this.isAllDeviceSelected = true;
    } else {
      this.isAllDeviceSelected = false;
    }
  }

  onClickOfDeviceAllCheckbox() {
    if (this.isAllDeviceSelected) {
      this.selectedDevices = JSON.parse(JSON.stringify(this.devices));
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

  onClickOfRegisteredDeviceAllCheckbox() {
    if (this.isAllRegisteredDeviceSelected) {
      this.selectedRegisteredDevices = JSON.parse(JSON.stringify(this.devices));
    } else {
      this.selectedRegisteredDevices = [];
    }
  }

  onRegisteredDeviceSelection(device) {
    if (this.selectedRegisteredDevices.length === 0) {
      this.selectedRegisteredDevices.push(device);
    } else {
      const index = this.selectedRegisteredDevices.findIndex(deviceObj => deviceObj.device_id === device.device_id);
      if (index > -1) {
        this.selectedRegisteredDevices.splice(index, 1);
      } else {
        this.selectedRegisteredDevices.push(device);
      }
    }
    if (this.selectedRegisteredDevices.length === this.devices.length) {
      this.isAllRegisteredDeviceSelected = true;
    } else {
      this.isAllRegisteredDeviceSelected = false;
    }
  }

  checkForRegisteredDeviceVisibility(device) {
    const index = this.selectedRegisteredDevices.findIndex(deviceObj => deviceObj.device_id === device.device_id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  registerDevices() {

  }

  deregisterDevices() {

  }


}
