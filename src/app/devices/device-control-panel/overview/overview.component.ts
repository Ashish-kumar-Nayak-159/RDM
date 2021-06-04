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
import { JsonEditorOptions } from 'ang-jsoneditor';
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
  // pageType: string;
  deviceCount = null;
  isAPILoading = false;
  modalConfig: any;
  btnClickType: string;
  confirmModalMessage: string;
  constantData = CONSTANTS;
  @Input() tileData: any;
  @Input() menuDetail: any;
  @Input() componentState: any;
  deviceType: any;
  subscriptions: Subscription[] = [];
  isDeviceTwinLoading = false;
  deviceTwin: any;
  editorOptions: JsonEditorOptions;
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private deviceTypeService: DeviceTypeService,
    private deviceService: DeviceService,
    private toasterService: ToasterService,
  ) { }

  ngOnInit(): void {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'view';
    this.editorOptions.statusBar = false;
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);

    this.subscriptions.push(this.route.paramMap.subscribe(params => {
      this.getDeviceCredentials();
      this.getDeviceTypeDetail();
      if (this.componentState === CONSTANTS.IP_GATEWAY) {
        this.getDeviceCount();
      }
    }));
  }


  getDeviceCredentials() {
    this.deviceCredentials = undefined;
    const id = (this.componentState === CONSTANTS.NON_IP_DEVICE) ? this.device.gateway_id : this.device.device_id;
    this.subscriptions.push(this.deviceService.getDeviceCredentials(id, this.contextApp.app).subscribe(
      response => {
        this.deviceCredentials = response;
      }
    ));
  }

  getDeviceTypeDetail() {
    return new Promise<void>((resolve) => {
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

  onRedirectToDevices() {
    const obj = {
      gateway_id: this.device.device_id
    };
    this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_LIST_FILTER_FOR_GATEWAY, obj);
    this.router.navigate(['applications', this.contextApp.app, 'devices']);
  }

  onRedirectToGateway(device) {
    this.router.navigate(['applications', this.contextApp.app, 'devices', device.gateway_id, 'control-panel']);
  }

  onRedirectToModel(device) {
    this.router.navigate(['applications', this.contextApp.app, 'things', 'model', device?.tags?.device_type, 'control-panel']);
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
    this.subscriptions.push(this.deviceService.syncDeviceCache(this.deviceType.app, obj)
    .subscribe((response: any) => {
      this.toasterService.showSuccess(response.message, 'Sync Asset Data');
    }, error => {
      this.toasterService.showError(error.message, 'Sync Asset Data');
    }));
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

  viewDeviceTwin() {
    $('#deviceTwinModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.isDeviceTwinLoading = true;
    this.subscriptions.push( this.deviceService.getDeviceTwin(this.contextApp.app, this.device.device_id).subscribe(
      response => {
        this.deviceTwin = response;
        this.isDeviceTwinLoading = false;
      }, error => this.isDeviceTwinLoading = false
    ));
  }

  onModalClose() {
    $('#deviceTwinModal').modal('hide');
    this.isDeviceTwinLoading = false;
    this.deviceTwin = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
