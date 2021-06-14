import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

declare var $: any;
@Component({
  selector: 'app-fota',
  templateUrl: './fota.component.html',
  styleUrls: ['./fota.component.css']
})
export class FotaComponent implements OnInit {

  @Input() deviceTwin: any;
  @Input() device: any;
  @Output() refreshDeviceTwin: EventEmitter<any> = new EventEmitter<any>();
  subscriptions: any[] = [];
  contextApp: any;
  selectedDevice: any;
  devicePackages: any[] = [];
  currentDeviceApps: any[] = [];
  deviceApps: any[] = [];
  installPackages: any[] = [];
  updatePackages: any[] = [];
  uninstallPackages: any[] = [];
  displyaMsgArr = [];
  applicationList: any[] = CONSTANTS.DEVICEAPPPS;
  isDevicesAPILoading = false;
  devices: any[] = [];
  selectedDevicePackage: any;
  isAPILoading = false;
  modalConfig: any;
  twinResponseInterval: any;
  btnClickType: any;
  confirmBodyMessage: any;
  confirmHeaderMessage: string;

  constructor(
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService
  ) { }

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getDevicesOfGateway();
    await this.getDeviceTypeData();
    await this.getDeviceTwinData();
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
          }
          this.isDevicesAPILoading = false;
        }, error => this.isDevicesAPILoading = false
      )
    );
  }

  getDeviceTypeData() {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.deviceTypeService.getPackages(this.contextApp.app, this.device.tags.device_type, {}).subscribe(
          (response: any) => {
            if (response.data?.length > 0) {
              this.devicePackages = response.data;
              console.log('packagesssss   ', this.devicePackages);
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
      const device = this.device;
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
          job_id: this.device.device_id + '_' + this.commonService.generateUUID(),
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
      sub_job_id: null,
      device_id: this.device.device_id,
      request_type: 'FOTA'
    };
    obj.job_id = obj.desired_properties.package_management.job_id;
    obj.sub_job_id = obj.job_id + '_1';
    obj.desired_properties.package_management.package_details.job_id = obj.desired_properties.package_management.job_id;
    if (type === 'Install') {
      obj.desired_properties.package_management.command = 'INSTALL_PACKAGE';
      obj.request_type = 'FOTA - INSTALL_PACKAGE';
    } else if (type === 'Upgrade' || type === 'Downgrade') {
      obj.desired_properties.package_management.command = 'UPGRADE_PACKAGE';
      obj.request_type = 'FOTA - UPGRADE_PACKAGE';
    } else if (type === 'Uninstall') {
      obj.desired_properties.package_management.command = 'DELETE_PACKAGE';
      obj.request_type = 'FOTA - DELETE_PACKAGE';
    }

    this.subscriptions.push(
      this.deviceService.updateDeviceTwin(this.contextApp.app, this.device.device_id, obj).subscribe(
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
      sub_job_id: requestObj.sub_job_id,
      from_date: requestObj.timestamp - 5,
      to_date: moment().utc().unix(),
      epoch: true,
      job_type: 'Twin'
    };
    this.subscriptions.push(
      this.deviceService.getMessageResponseDetails(this.contextApp.app, obj).subscribe(
        (response: any) => {
          response.data.reverse();
          if (response.data.length > 0) {
          this.displyaMsgArr.length = 1;
          response.data.forEach(item => {
            if (item.payload?.reported && item.payload?.reported[this.selectedDevicePackage.name]) {
              this.displyaMsgArr.push({
                message: item.payload.reported[this.selectedDevicePackage.name].fw_update_sub_status,
                error: false
              });
              this.modalConfig.isDisplaySave = false;
              if (item.payload.reported[this.selectedDevicePackage.name].fw_pending_version) {
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
          });
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

  openConfirmDialog(type) {
    this.btnClickType = type;
    this.modalConfig = {
      isDisplaySave: true,
      isDisplayCancel: true,
      saveBtnText: 'Yes',
      cancelBtnText: 'No',
      stringDisplay: true
    };
    this.confirmHeaderMessage = type + ' Package';
    this.confirmBodyMessage = 'Are you sure you want to ' + type.toLowerCase() + ' this package?';
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'save'){
      this.updateDeviceTwin(this.btnClickType);
      this.btnClickType = undefined;
    } else {
      $('#confirmMessageModal').modal('hide');
      $('#packageManagementModal').modal('hide');
      clearInterval(this.twinResponseInterval);
      this.installPackages = [];
      this.updatePackages = [];
      this.uninstallPackages = [];
      this.selectedDevice = undefined;
      this.devicePackages = [];
      this.currentDeviceApps = [];
      this.displyaMsgArr = [];
      // this.deviceTwin = undefined;
      this.isAPILoading = false;
      this.selectedDevicePackage = undefined;
    }
  }

}
