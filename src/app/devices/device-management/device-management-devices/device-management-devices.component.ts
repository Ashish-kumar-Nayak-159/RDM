import { ToasterService } from './../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../../services/common.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-device-management-devices',
  templateUrl: './device-management-devices.component.html',
  styleUrls: ['./device-management-devices.component.css']
})
export class DeviceManagementDevicesComponent implements OnInit, OnDestroy {

  @Input() type: any;
  devicesList: any[] = [];
  isDeviceListLoading = false;
  insideScrollFunFlag = false;
  currentOffset = 0;
  currentLimit = 20;
  contextApp: any;
  tileData: any;
  iotDevicesPage = 'Devices';
  legacyDevicesPage = 'Non IP Devices';
  iotGatewaysPage = 'Gateways';
  subscriptions: Subscription[] = [];
  isOpenDeviceCreateModal = false;
  componentState: any;
  gateways: any[] = [];
  confirmBodyMessage: string;
  confirmHeaderMessage: string;
  selectedDevices: any[] = [];
  modalConfig: { isDisplaySave: boolean; isDisplayCancel: boolean; saveBtnText: string; cancelBtnText: string; stringDisplay: boolean; };
  btnClickType: any;
  isAPILoading = false;
  isAllDeviceSelected = false;
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();
    this.getDevices();
    if (this.type === 'legacy-devices') {
      this.componentState = CONSTANTS.NON_IP_DEVICE;
    } else if (this.type === 'iot-devices') {
      this.componentState = CONSTANTS.IP_DEVICE;
    } else if (this.type === 'iot-gateways') {
      this.componentState = CONSTANTS.IP_GATEWAY;
    }
    setTimeout(() => {
      console.log($('#table-wrapper'));
      $('#table-wrapper').on('scroll', () => {
        const element = document.getElementById('table-wrapper');
        if (parseFloat(element.scrollTop.toFixed(0)) + parseFloat(element.clientHeight.toFixed(0))
        >= parseFloat(element.scrollHeight.toFixed(0)) && !this.insideScrollFunFlag) {
          this.currentOffset += this.currentLimit;
          this.getDevices();
          this.insideScrollFunFlag = true;
        }
      });
    }, 2000);
  }

  getGatewayList() {
    this.gateways = [];
    const obj = {
      app: this.contextApp.app,
      type: CONSTANTS.IP_GATEWAY,
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy)
    };
    this.subscriptions.push(this.deviceService.getDeviceList(obj).subscribe(
      (response: any) => {
        if (response.data) {
          this.gateways = response.data;
          this.devicesList.forEach(item => {
            const name = this.gateways.filter(gateway => gateway.device_id === item.gateway_id)[0]?.display_name;
            item.gateway_display_name = name ? name : item.gateway_id;
          });
        }
      }
    ));
  }

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      if ((item.page === this.iotDevicesPage && this.type === 'iot-devices') ||
        (item.page === this.legacyDevicesPage && this.type === 'legacy-devices') ||
        (item.page === this.iotGatewaysPage && this.type === 'iot-gateways')) {
        selectedItem = item.showAccordion;
        console.log(selectedItem);
      }
    });
    this.tileData = selectedItem;
    console.log('1111111   ', this.tileData);
    this.currentLimit = Number(this.tileData[2]?.value) || 20;
  }

  getDevices() {
    this.isDeviceListLoading = true;
    const obj: any = {};
    obj.app = this.contextApp.app;
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    console.log('387777777   ', obj);
    if (this.contextApp) {
      obj.hierarchy = JSON.stringify(this.contextApp.user.hierarchy);
      console.log(obj.hierarchy);
    }
    let methodToCall;
    if (this.type === 'legacy-devices') {
      methodToCall = this.deviceService.getNonIPDeviceList(obj);
    } else {
      if (this.type === 'iot-devices') {
        obj.type = CONSTANTS.IP_DEVICE;
      } else if (this.type === 'iot-gateways') {
        obj.type = CONSTANTS.IP_GATEWAY;
      }
      methodToCall = this.deviceService.getDeviceList(obj);
    }
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        if (response.data) {

          console.log(this.devicesList);
          response.data.forEach(item => {
            if (!item.display_name) {
              item.display_name = item.device_id;
            }
            if (item.hierarchy) {
              item.hierarchyString = '';
              const keys = Object.keys(item.hierarchy);
              this.contextApp.hierarchy.levels.forEach((key, index) => {
                item.hierarchyString += item.hierarchy[key] + ( keys[index + 1] ? ' / ' : '');
              });
            }
            if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
              const name = this.gateways.filter(gateway => gateway.device_id === item.gateway_id)[0]?.display_name;
              item.gateway_display_name = name ? name : item.gateway_id;
            }
          });
          this.devicesList = [...this.devicesList, ...response.data];
        }
        if (response.data.length === this.currentLimit) {
        this.insideScrollFunFlag = false;
        } else {
          this.insideScrollFunFlag = true;
        }

        this.isDeviceListLoading = false;
      }, error => {
        this.isDeviceListLoading = false;
        this.insideScrollFunFlag = false;
    }));
  }

  openDeviceCreateModal() {
    if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
      this.getGatewayList();
    }
    this.isOpenDeviceCreateModal = true;
  }

  onClickOfDeviceAllCheckbox() {
    if (this.isAllDeviceSelected) {
      this.selectedDevices = JSON.parse(JSON.stringify(this.devicesList));
    } else {
      this.selectedDevices = [];
    }
  }

  onDeviceSelection(device) {
    if (this.selectedDevices.length > 0) {
      this.selectedDevices.push(device);
    } else {
      const index = this.selectedDevices.findIndex(deviceObj => deviceObj.device_id === device.device_id);
      if (index > -1) {
        this.selectedDevices.splice(index, 1);
      } else {
        this.selectedDevices.push(device);
      }
    }
  }

  checkForDeviceVisibility(device) {
    const index = this.selectedDevices.findIndex(deviceObj => deviceObj.device_id === device.device_id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  openConfirmDialog(type) {
    this.btnClickType = type;
    this.modalConfig = {
      isDisplaySave: true,
      isDisplayCancel: true,
      saveBtnText: 'Yes',
      cancelBtnText: 'No',
      stringDisplay: true
    };
    if (type === 'enable') {
      if (this.selectedDevices.length > 1) {
        this.toasterService.showError('To perform single operations, please select only one device', 'Enable Device');
        return;
      }
      if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
        this.confirmBodyMessage = `You won't be able to enable legacy device. Please try to enable relevant gateway.`;
        this.modalConfig.isDisplaySave = false;
        this.modalConfig.cancelBtnText = 'Ok';
      } else {
        this.confirmBodyMessage = 'Are you sure you want to enable this device?';
      }
      this.confirmHeaderMessage = 'Enable ' + (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '');
    } else if (type === 'disable') {
      if (this.selectedDevices.length > 1) {
        this.toasterService.showError('To perform single operations, please select only one device', 'Disable Device');
        return;
      }
      if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
        this.confirmBodyMessage = `You won't be able to disable legacy device. Please try to disable relevant gateway.`;
        this.modalConfig.isDisplaySave = false;
        this.modalConfig.cancelBtnText = 'Ok';
      } else {
        this.confirmBodyMessage = 'This ' + (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '') + ' will be temporarily disabled. Are you sure you want to continue?';
      }
      this.confirmHeaderMessage = 'Disable ' + (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '');
    } else if (type === 'delete') {
      if (this.selectedDevices.length > 1) {
        this.toasterService.showError('To perform single operations, please select only one device', 'Delete Device');
        return;
      }
      this.confirmHeaderMessage = 'Deprovision ' + (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '');
      this.confirmBodyMessage = 'This ' + (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '') + ' will be permanently deleted. Instead, you can temporarily disable the ' + (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '') + '.' +
      ' Are you sure you want to continue?';
    }
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'save'){
      console.log(this.btnClickType);
      if (this.btnClickType === 'enable') {
        this.enableDevice();
      } else if (this.btnClickType === 'disable') {
        this.disableDevice();
      } else if (this.btnClickType === 'delete') {
        this.deleteDevice();
      }
      this.btnClickType = undefined;
    }
  }

  enableDevice() {
    const device = this.selectedDevices[0];
    this.isAPILoading = true;
    this.subscriptions.push(this.deviceService.enableDevice(device.device_id, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Enable Device');
        this.isAPILoading = false;
        this.devicesList = [];
        this.selectedDevices = [];
        this.getDevices();
        $('#confirmMessageModal').modal('hide');
      }, error => {
        this.toasterService.showError(error.message, 'Enable Device');
        this.isAPILoading = false;
      }
    ));
  }

  disableDevice() {
    const device = this.selectedDevices[0];
    this.isAPILoading = true;
    this.subscriptions.push(this.deviceService.disableDevice(device.device_id, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Disable Device');
        this.isAPILoading = false;
        this.devicesList = [];
        this.selectedDevices = [];
        this.getDevices();
        $('#confirmMessageModal').modal('hide');
      }, error => {
        this.toasterService.showError(error.message, 'Disable Device');
        this.isAPILoading = false;
      }
    ));
  }

  deleteDevice() {
    const device = this.selectedDevices[0];
    this.isAPILoading = true;
    let methodToCall;
    if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
      methodToCall = this.deviceService.deleteNonIPDevice(device.device_id, this.contextApp.app);
    } else {
      methodToCall = this.deviceService.deleteDevice(device.device_id, this.contextApp.app);
    }

    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Delete Device');
        this.isAPILoading = false;
        this.devicesList = [];
        this.selectedDevices = [];
        this.getDevices();
        $('#confirmMessageModal').modal('hide');
      }, error => {
        this.toasterService.showError(error.message, 'Delete Device');
        this.isAPILoading = false;
      }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
