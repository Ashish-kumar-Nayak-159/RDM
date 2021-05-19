import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { ToasterService } from './../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../../services/common.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
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
  tileData = {};
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
  constantData = CONSTANTS;
  deviceTwin: any;
  devicePackages: any[] = [];
  currentDeviceApps: any[] = [];
  deviceApps: any[] = [];
  selectedDeviceApp: any;
  selectedDevicePackage: any;
  twinResponseInterval: any;
  installPackages: any[] = [];
  updatePackages: any[] = [];
  uninstallPackages: any[] = [];
  displyaMsgArr = [];
  applicationList: any[] = CONSTANTS.DEVICEAPPPS;
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
  tabData: any;
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();
    this.getDevices();
    // if (this.type === 'legacy-devices') {
    //   this.componentState = CONSTANTS.NON_IP_DEVICE;
    // } else if (this.type === 'iot-devices') {
    //   this.componentState = CONSTANTS.IP_DEVICE;
    // } else if (this.type === 'iot-gateways') {
    //   this.componentState = CONSTANTS.IP_GATEWAY;
    // }
    setTimeout(() => {
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
      console.log(item.page);
      if (item.page === 'Assets') {
        selectedItem = item.showAccordion;
      }
    });
    selectedItem.forEach(item => {
      this.tileData[item.name] = item.value;
    });
    if (this.type === CONSTANTS.IP_DEVICE) {
    this.tabData = {
      tab_name: this.tileData['IOT Assets Tab Name'],
      table_key: this.tileData['IOT Assets Table Key Name']
    };
    }
    if (this.type === CONSTANTS.NON_IP_DEVICE) {
    this.tabData = {
      tab_name: this.tileData['Legacy Assets Tab Name'],
      table_key: this.tileData['Legacy Assets Table Key Name']
    };
    }
    if (this.type === CONSTANTS.IP_GATEWAY) {
    this.tabData = {
      tab_name: this.tileData['IOT Gateways Tab Name'],
      table_key: this.tileData['IOT Gateways Table Key Name']
    };
    }
    this.currentLimit = this.tileData && this.tileData[2] ? Number(this.tileData[2]?.value) : 20;
  }

  getDevices() {
    this.isDeviceListLoading = true;
    const obj: any = {};
    obj.app = this.contextApp.app;
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    if (this.contextApp) {
      obj.hierarchy = JSON.stringify(this.contextApp.user.hierarchy);
    }
    let methodToCall;
    if (this.type === CONSTANTS.NON_IP_DEVICE) {
      methodToCall = this.deviceService.getNonIPDeviceList(obj);
    } else {
      obj.type = this.type;
      methodToCall = this.deviceService.getDeviceList(obj);
    }
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        if (response.data) {
          response.data.forEach(item => {
            if (!item.display_name) {
              item.display_name = item.device_id;
            }
            if (item.hierarchy) {
              item.hierarchyString = '';
              const keys = Object.keys(item.hierarchy);
              this.contextApp.hierarchy.levels.forEach((key, index) => {
                item.hierarchyString += item.hierarchy[key] ? (item.hierarchy[key] + ( keys[index + 1] ? ' / ' : '')) : '';
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
    if (this.type === CONSTANTS.NON_IP_DEVICE) {
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

  onCreateDeviceCancelModal() {
    this.isOpenDeviceCreateModal = false;
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
    if (this.selectedDevices.length === this.devicesList.length) {
      this.isAllDeviceSelected = true;
    } else {
      this.isAllDeviceSelected = false;
    }
  }

  checkForDeviceVisibility(device) {
    const index = this.selectedDevices.findIndex(deviceObj => deviceObj.device_id === device.device_id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  onSingleOperationClick(type) {
    if (!type.toLowerCase().includes('provision') && this.componentState === CONSTANTS.NON_IP_DEVICE) {
      this.toasterService.showError(`You can't perform this operation on legacy asset.`, 'Asset Management');
      return;
    }
    if (this.selectedDevices?.length !== 1) {
      this.toasterService.showError('To perform single operations, please select only one asset', 'Asset Management');
      return;
    }
    if (type === 'Deprovision' || type === 'Enable' || type === 'Disable') {
      this.openConfirmDialog(type);
    } else if (type === 'Package Management') {
      this.openPackageManagementModal();
    }
  }

  onBulkOperationClick(type) {
    // if (!type.toLowerCase().includes('provision') && this.componentState === CONSTANTS.NON_IP_DEVICE) {
    //   this.toasterService.showError(`You can't perform this operation on legacy device.`, 'Device Management');
    //   return;
    // }
    this.toasterService.showError('Currently Bulk Operations are not available for use. Work in Progress.', 'Asset Management');
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
    if (type === 'Enable') {
      this.confirmBodyMessage = 'Are you sure you want to enable this asset?';
      this.confirmHeaderMessage = 'Enable ' + (this.tabData?.table_key || 'Asset');
    } else if (type === 'Disable') {
      this.confirmBodyMessage = 'This ' + (this.tabData?.table_key || 'Asset') + ' will be temporarily disabled. Are you sure you want to continue?';
      this.confirmHeaderMessage = 'Disable ' + (this.tabData?.table_key || 'Asset');
    } else if (type === 'Deprovision') {
      this.confirmHeaderMessage = 'Deprovision ' + (this.tabData?.table_key || 'Asset');
      if (this.type !== 'legacy-devices') {
      this.confirmBodyMessage = 'This ' + (this.tabData?.table_key || 'Asset') + ' will be permanently deleted. Instead, you can temporarily disable the ' + (this.tabData?.table_key || 'Asset') + '.' +
      ' Are you sure you want to continue?';
      } else {
        this.confirmBodyMessage = 'This ' + (this.tabData?.table_key || 'Asset') + ' will be permanently deleted.' +
      ' Are you sure you want to continue?';
      }
    } else if (type === 'Install' || type === 'Uninstall' ||
    type === 'Upgrade' || type === 'Downgrade') {
      this.confirmHeaderMessage = type + ' Package';
      this.confirmBodyMessage = 'Are you sure you want to ' + type.toLowerCase() + ' this package?';
    }
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'save'){
      if (this.btnClickType === 'Enable') {
        this.enableDevice();
      } else if (this.btnClickType === 'Disable') {
        this.disableDevice();
      } else if (this.btnClickType === 'Deprovision') {
        this.deleteDevice();
      } else if (this.btnClickType === 'Install' || this.btnClickType === 'Uninstall' ||
      this.btnClickType === 'Upgrade' || this.btnClickType === 'Downgrade') {
        this.updateDeviceTwin(this.btnClickType);
      }
      this.btnClickType = undefined;
    } else {
      $('#confirmMessageModal').modal('hide');
      $('#packageManagementModal').modal('hide');
      clearInterval(this.twinResponseInterval);
      this.installPackages = [];
      this.updatePackages = [];
      this.uninstallPackages = [];
      this.selectedDevices = [];
      this.devicePackages = [];
      this.currentDeviceApps = [];
      this.displyaMsgArr = [];
      this.deviceTwin = undefined;
      this.isAPILoading = false;
      this.isAllDeviceSelected = false;
      this.selectedDevicePackage = undefined;
    }
  }

  enableDevice() {
    const device = this.selectedDevices[0];
    if (device.status.toLowerCase() === 'enabled') {
      this.toasterService.showError('Asset is already enabled.', 'Enable Asset');
      return;
    }
    this.isAPILoading = true;
    this.subscriptions.push(this.deviceService.enableDevice(device.device_id, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Enable Asset');
        this.isAPILoading = false;
        this.devicesList = [];
        this.selectedDevices = [];
        this.getDevices();
        $('#confirmMessageModal').modal('hide');
      }, error => {
        this.toasterService.showError(error.message, 'Enable Asset');
        this.isAPILoading = false;
      }
    ));
  }

  disableDevice() {
    const device = this.selectedDevices[0];
    if (device.status.toLowerCase() === 'disabled') {
      this.toasterService.showError('Asset is already disabled.', 'Disable Asset');
      return;
    }
    this.isAPILoading = true;
    this.subscriptions.push(this.deviceService.disableDevice(device.device_id, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Disable Asset');
        this.isAPILoading = false;
        this.devicesList = [];
        this.selectedDevices = [];
        this.getDevices();
        $('#confirmMessageModal').modal('hide');
      }, error => {
        this.toasterService.showError(error.message, 'Disable Asset');
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
        this.toasterService.showSuccess(response.message, 'Delete Asset');
        this.isAPILoading = false;
        this.devicesList = [];
        this.selectedDevices = [];
        this.getDevices();
        $('#confirmMessageModal').modal('hide');
      }, error => {
        this.toasterService.showError(error.message, 'Delete Asset');
        this.isAPILoading = false;
      }
    ));
  }

  async openPackageManagementModal() {
    if (this.selectedDevices?.length === 0) {
      this.toasterService.showError('To perform any operations, please select at least one asset', 'Package Management');
      return;
    }
    if (this.selectedDevices.length > 1) {
      this.toasterService.showError('To perform single operations, please select only one asset', 'Package Management');
      return;
    }
    $('#packageManagementModal').modal({ backdrop: 'static', keyboard: false, show: true });
    await this.getDeviceTypeData();
    await this.getDeviceTwinData();
  }

  getDeviceTypeData() {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.deviceTypeService.getPackages(this.contextApp.app, this.selectedDevices[0].device_type, {}).subscribe(
          (response: any) => {
            if (response.data?.length > 0) {
              this.devicePackages = response.data;
              this.devicePackages.forEach(packageObj => {
                if (this.deviceApps.indexOf(packageObj.name) === -1) {
                  this.deviceApps.push(packageObj.name);
                }
                this.applicationList.forEach(app => {
                  if (packageObj.name === app.name) {
                    packageObj['is_install'] = app.is_install;
                    packageObj['is_uninstall'] = app.is_uninstall;
                    packageObj['is_update'] = app.is_update;
                  }
                });
              });
            }
            resolve();
          }
        )
      );
    });
  }

  getDeviceTwinData() {
    return new Promise<void>((resolve) => {
      const device = this.selectedDevices[0];
      this.subscriptions.push(
        this.deviceService.getDeviceTwin(this.contextApp.app, device.device_id).subscribe(
          (response) => {
            this.deviceTwin = response;
            if (!this.deviceTwin.twin_properties) {
              this.deviceTwin.twin_properties = {};
            }
            if (!this.deviceTwin.twin_properties.reported) {
              this.deviceTwin.twin_properties.reported = {};
            }
            if (!this.deviceTwin.twin_properties.reported.installed_packages) {
              this.deviceTwin.twin_properties.reported.installed_packages = {};
            }
            if (this.deviceTwin.twin_properties?.reported?.installed_packages) {
              this.currentDeviceApps = Object.keys(this.deviceTwin.twin_properties.reported.installed_packages);
            }
            if (this.currentDeviceApps.length > 0) {
            this.devicePackages.forEach(devicePackage => {
              const index = this.currentDeviceApps.findIndex(packageName => packageName === devicePackage.name);
              if (index === -1) {
                  this.installPackages.push(devicePackage);
              }
              this.currentDeviceApps.forEach(currentPackage => {
                if (devicePackage.name === currentPackage &&
                  this.deviceTwin.twin_properties.reported.installed_packages[currentPackage] === devicePackage.version) {
                    this.uninstallPackages.push(devicePackage);
                }
                if (devicePackage.name === currentPackage &&
                  this.deviceTwin.twin_properties.reported.installed_packages[currentPackage] !== devicePackage.version) {
                    this.updatePackages.push(devicePackage);
                }
              });
            });
            } else {
              this.installPackages = JSON.parse(JSON.stringify(this.devicePackages));
            }
            resolve();
          }
        ));
    });
  }

  updateDeviceTwin(type) {
    this.isAPILoading = true;
    this.displyaMsgArr = [];
    const obj = {
      desired_properties: {
        package_management: {
          job_id: 'job_' + this.commonService.generateUUID(),
          command: null,
          package_details: {
            app_name: this.selectedDevicePackage.name,
            version: this.selectedDevicePackage.version,
            url: environment.blobURL + this.selectedDevicePackage.url,
            token: environment.blobKey,
            job_id: null
          }
        }
      },
      job_id: null,
      timestamp: moment().utc().unix(),
      request_type: 'FOTA'
    };
    obj.job_id = obj.desired_properties.package_management.job_id;
    obj.desired_properties.package_management.package_details.job_id = obj.desired_properties.package_management.job_id;
    if (type === 'Install') {
      obj.desired_properties.package_management.command = 'INSTALL_PACKAGE';
    } else if (type === 'Upgrade' || type === 'Downgrade') {
      obj.desired_properties.package_management.command = 'UPGRADE_PACKAGE';
    } else if (type === 'Uninstall') {
      obj.desired_properties.package_management.command = 'DELETE_PACKAGE';
    }

    this.subscriptions.push(
      this.deviceService.updateDeviceTwin(this.contextApp.app, this.selectedDevices[0].device_id, obj).subscribe(
        (response: any) => {
          // this.confirmBodyMessage = response.message;
          this.displyaMsgArr.push({
            message: 'Firmware ' + type.toLowerCase() + ' request sent to Asset.',
            error: false
          });
          this.modalConfig.isDisplaySave = false;
          clearInterval(this.twinResponseInterval);
          this.loadDeviceTwinChangeResponse(obj);
        }, error => {
          clearInterval(this.twinResponseInterval);
          this.confirmBodyMessage = error.message;
          this.modalConfig.isDisplaySave = false;
          this.isAPILoading = false;
        }
      )
    );
  }

  onCheckboxChange(event, packageObj) {
    if (event.target.checked) {
      this.selectedDevicePackage = packageObj;
    } else {
      this.selectedDevicePackage = undefined;
    }
  }

  loadDeviceTwinChangeResponse(requestObj) {
    clearInterval(this.twinResponseInterval);
    const obj = {
      job_id: requestObj.job_id,
      twin_event: 'Reported',
      from_date: requestObj.timestamp - 5,
      to_date: moment().utc().unix()
    };
    this.subscriptions.push(
      this.deviceService.getDeviceTwinHistory(this.contextApp.app, obj).subscribe(
        (response: any) => {
          if (response.data?.length > 0 && response.data[response.data.length - 1]?.twin?.reported[this.selectedDevicePackage.name]
            && this.displyaMsgArr.length <= response.data.length) {
            this.displyaMsgArr.push({
              message: response.data[response.data.length - 1].twin.reported[this.selectedDevicePackage.name].fw_update_sub_status,
              error: false
            });
            this.modalConfig.isDisplaySave = false;
            if (response.data[response.data.length - 1].twin.reported[this.selectedDevicePackage.name].fw_pending_version) {
              clearInterval(this.twinResponseInterval);
              this.twinResponseInterval = setInterval(
              () => {
                this.loadDeviceTwinChangeResponse(requestObj);
              }, 5000);
            } else {
              clearInterval(this.twinResponseInterval);
              setTimeout(() => {
                this.onModalEvents('close');
                this.isAPILoading = false;
              }, 1000);
            }
          } else {
          clearInterval(this.twinResponseInterval);
          this.twinResponseInterval = setInterval(
          () => {
            this.loadDeviceTwinChangeResponse(requestObj);
          }, 5000);
          }
        }, error => {
          this.displyaMsgArr.push({
            message: error.message,
            error: true
          });
          this.isAPILoading = false;
          this.modalConfig.isDisplaySave = false;
          clearInterval(this.twinResponseInterval);
        }
      ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
