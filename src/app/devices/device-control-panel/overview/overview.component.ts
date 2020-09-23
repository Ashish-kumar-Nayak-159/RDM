import { Component, OnInit, Input } from '@angular/core';
import { DeviceService } from './../../../services/devices/device.service';
import { Device } from 'src/app/models/device.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CONSTANTS } from './../../../app.constants';
import { CommonService } from 'src/app/services/common.service';
import { ApplicationService } from './../../../services/application/application.service';
import { environment } from './../../../../environments/environment';
import { ToasterService } from 'src/app/services/toaster.service';
declare var $: any;

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {

  @Input() device: Device = new Device();
  deviceCredentials: any;
  deviceConnectionStatus: any;
  userData: any;
  isCopyClicked = false;
  isViewClicked = false;
  applicationData: any;
  appName: any;
  blobSASToken = environment.blobKey;
  pageType: string;
  deviceCount = null;
  isAPILoading = false;
  modalConfig: any;
  btnClickType: string;
  confirmModalMessage: string;
  constantData = CONSTANTS;
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private deviceService: DeviceService,
    private toasterService: ToasterService,
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.getApplicationData();
      this.getDeviceCredentials();
      this.getDeviceConnectionStatus();
      if (this.pageType === 'gateway') {
        this.getDeviceCount();
      }
    });

  }

  getApplicationData() {
    this.applicationService.getApplications({}).subscribe(
      (response: any) => {
        if (response && response.data) {
          response.data.forEach(item => {
            if (item.app === this.appName) {
              this.applicationData = item;
              if (this.applicationData && this.applicationData.metadata && !this.applicationData.metadata.logo) {
                this.applicationData.metadata.logo = {
                  url : CONSTANTS.DEFAULT_APP_LOGO
                };
              }
            }
          });
        }
      }
    );
  }

  getDeviceCredentials() {
    this.deviceCredentials = undefined;
    const id = (this.device.tags.category && this.device.gateway_id) ? this.device.gateway_id : this.device.device_id;
    this.deviceService.getDeviceCredentials(id, this.appName).subscribe(
      response => {
        this.deviceCredentials = response;
      }
    );
  }

  getDeviceCount() {
    this.deviceCount = null;
    const obj = {
      app: this.appName,
      gateway_id: this.device.device_id
    }
    this.deviceService.getNonIPDeviceCount(obj).subscribe(
      (response: any) => {
        this.deviceCount = response.count;
      }
    )
  }

  getDeviceConnectionStatus() {
    this.deviceConnectionStatus = undefined;
    const id = (this.device.tags.category && this.device.gateway_id) ? this.device.gateway_id : this.device.device_id;
    this.deviceService.getDeviceConnectionStatus(id, this.appName).subscribe(
      response => {
        this.deviceConnectionStatus = response;
        this.deviceConnectionStatus.local_updated_date =
          this.commonService.convertUTCDateToLocal(this.deviceConnectionStatus.updated_date);
      }
    );
  }

  copyConnectionString() {
    this.isCopyClicked = true;
    navigator.clipboard.writeText(this.deviceCredentials.primary_connection_string);
    setTimeout(() => this.isCopyClicked = false, 1000);
  }

  viewonnectionString() {
    this.isViewClicked = true;
    setTimeout(() => this.isViewClicked = false, 3000);
  }

  enableDevice() {
    this.isAPILoading = true;
    this.deviceService.enableDevice(this.device.device_id, this.appName).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Enable Device');
        this.isAPILoading = false;
        this.deviceService.reloadDeviceInControlPanelEmitter.emit();
      }, error => {
        this.toasterService.showError(error.message, 'Enable Device');
        this.isAPILoading = false;
      }
    );
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
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    console.log(eventType);
    if (eventType === 'save'){
      console.log(this.btnClickType);
      if (this.btnClickType === 'Disable') {
        this.disableDevice();
        this.btnClickType = undefined;
      } else if (this.btnClickType === 'Delete') {
        this.deleteDevice();
        this.btnClickType = undefined;
      }
    }
    $('#confirmMessageModal').modal('hide');
  }

  disableDevice() {
    this.isAPILoading = true;
    this.deviceService.disableDevice(this.device.device_id, this.appName).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Disable Device');
        this.isAPILoading = false;
        this.deviceService.reloadDeviceInControlPanelEmitter.emit();
      }, error => {
        this.toasterService.showError(error.message, 'Disable Device');
        this.isAPILoading = false;
      }
    );
  }

  deleteDevice() {
    this.isAPILoading = true;
    let methodToCall;
    if (this.device.tags.category && this.device.gateway_id) {
      methodToCall = this.deviceService.deleteNonIPDevice(this.device.device_id, this.appName);
    } else {
      methodToCall = this.deviceService.deleteDevice(this.device.device_id, this.appName);
    }

    methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Delete Device');
        this.isAPILoading = false;
        if (this.device.tags.category && this.device.gateway_id) {
          this.router.navigate(['applications', this.appName, 'devices']);
        } else if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
          this.router.navigate(['applications', this.appName, 'gateways']);
        }  else {
          this.router.navigate(['applications', this.appName, 'nonIPDevices']);
        }
      }, error => {
        this.toasterService.showError(error.message, 'Delete Device');
        this.isAPILoading = false;
      }
    );
  }


}
