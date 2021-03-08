import { CONSTANTS } from 'src/app/app.constants';
import { Subscription } from 'rxjs';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
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
export class OverviewComponent implements OnInit, OnDestroy {

  @Input() device: Device = new Device();
  deviceCredentials: any;
  deviceConnectionStatus: any;
  userData: any;
  isCopyClicked = false;
  isViewClicked = false;
  contextApp: any;
  blobSASToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  pageType: string;
  deviceCount = null;
  isAPILoading = false;
  modalConfig: any;
  btnClickType: string;
  confirmModalMessage: string;
  constantData = CONSTANTS;
  @Input() tileData: any;
  @Input() menuDetail: any;
  componentState: any;
  deviceType: any;
  subscriptions: Subscription[] = [];
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private deviceTypeService: DeviceTypeService,
    private deviceService: DeviceService,
    private toasterService: ToasterService,
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);

    this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1).toLowerCase();
      if (this.pageType === 'device') {
        this.componentState = CONSTANTS.IP_DEVICE;
      } else if (this.pageType === 'gateway') {
        this.componentState = CONSTANTS.IP_GATEWAY;
      } else if (this.pageType === 'nonipdevice') {
        this.componentState = CONSTANTS.NON_IP_DEVICE;
      }
      this.getDeviceCredentials();
      this.getDeviceConnectionStatus();
      this.getDeviceTypeDetail();
      if (this.pageType === 'gateway') {
        this.getDeviceCount();
      }
    });
  }


  getDeviceCredentials() {
    this.deviceCredentials = undefined;
    const id = (this.pageType === 'nonipdevice') ? this.device.gateway_id : this.device.device_id;
    this.subscriptions.push(this.deviceService.getDeviceCredentials(id, this.contextApp.app).subscribe(
      response => {
        this.deviceCredentials = response;
      }
    ));
  }

  getDeviceTypeDetail() {
    return new Promise((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(this.device.tags.hierarchy_json),
        name: this.device.tags.device_type,
        app: this.contextApp.app
      };
      this.subscriptions.push(this.deviceTypeService.getThingsModelDetails(obj.app, obj.name).subscribe(
        (response: any) => {
          if (response) {
            this.deviceType = response;
            this.deviceType.name = obj.name;
            this.deviceType.app = obj.app;
            if (!this.deviceType.metadata?.image) {
              this.deviceType.metadata.image = {
                url: CONSTANTS.DEFAULT_MODEL_IMAGE
              };
            }
          }
          resolve();
        }
      ));
    });
  }

  onRedirectToDevices(gatewayId) {
    const obj = {
      gateway_id: this.device.device_id
    };
    this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_LIST_FILTER_FOR_GATEWAY, obj);
    this.router.navigate(['applications', this.contextApp.app, 'nonIPDevices']);
  }

  getDeviceCount() {
    this.deviceCount = null;
    const obj = {
      app: this.contextApp.app,
      gateway_id: this.device.device_id
    };
    this.subscriptions.push(this.deviceService.getNonIPDeviceCount(obj).subscribe(
      (response: any) => {
        this.deviceCount = response.count;
      }
    ));
  }

  syncWithCache() {
    const obj = {
      device_id: this.device.device_id
    };
    this.deviceService.syncDeviceCache(this.deviceType.app, obj)
    .subscribe((response: any) => {
      this.toasterService.showSuccess(response.message, 'Sync Device Data');
    }, error => {
      this.toasterService.showError(error.message, 'Sync Device Data');
    });
  }

  getDeviceConnectionStatus() {
    this.deviceConnectionStatus = undefined;
    const id = (this.pageType === 'nonipdevice') ? this.device.gateway_id : this.device.device_id;
    this.subscriptions.push(this.deviceService.getDeviceConnectionStatus(id, this.contextApp.app).subscribe(
      response => {
        this.deviceConnectionStatus = response;
        this.deviceConnectionStatus.local_updated_date =
          this.commonService.convertUTCDateToLocal(this.deviceConnectionStatus.updated_date);
      }
    ));
  }

  copyConnectionString() {
    this.isCopyClicked = true;
    navigator.clipboard.writeText(this.deviceCredentials.primary_connection_string);
    setTimeout(() => this.isCopyClicked = false, 1000);
  }

  viewonnectionString() {
    this.isViewClicked = true;
    setTimeout(() => this.isViewClicked = false, 10000);
  }

  enableDevice() {
    this.isAPILoading = true;
    this.subscriptions.push(this.deviceService.enableDevice(this.device.device_id, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Enable Device');
        this.isAPILoading = false;
        this.deviceService.reloadDeviceInControlPanelEmitter.emit();
      }, error => {
        this.toasterService.showError(error.message, 'Enable Device');
        this.isAPILoading = false;
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
    this.subscriptions.push(this.deviceService.disableDevice(this.device.device_id, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Disable Device');
        this.isAPILoading = false;
        this.deviceService.reloadDeviceInControlPanelEmitter.emit();
      }, error => {
        this.toasterService.showError(error.message, 'Disable Device');
        this.isAPILoading = false;
      }
    ));
  }

  deleteDevice() {
    this.isAPILoading = true;
    let methodToCall;
    if (this.pageType === 'nonipdevice') {
      methodToCall = this.deviceService.deleteNonIPDevice(this.device.device_id, this.contextApp.app);
    } else {
      methodToCall = this.deviceService.deleteDevice(this.device.device_id, this.contextApp.app);
    }

    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Delete Device');
        this.isAPILoading = false;
        if (this.pageType === 'nonipdevice') {
          this.router.navigate(['applications', this.contextApp.app, 'devices']);
        } else if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
          this.router.navigate(['applications', this.contextApp.app, 'gateways']);
        }  else {
          this.router.navigate(['applications', this.contextApp.app, 'nonIPDevices']);
        }
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
