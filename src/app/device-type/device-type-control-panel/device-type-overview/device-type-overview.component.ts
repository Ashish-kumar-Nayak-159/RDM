import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { environment } from './../../../../environments/environment';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
declare var $: any;
@Component({
  selector: 'app-device-type-overview',
  templateUrl: './device-type-overview.component.html',
  styleUrls: ['./device-type-overview.component.css']
})
export class DeviceTypeOverviewComponent implements OnInit, OnDestroy {

  @Input() deviceType: any;
  contextApp: any;
  userData: any;
  blobSASToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  isModelFreezeUnfreezeAPILoading = false;
  appAdminRole = CONSTANTS.APP_ADMIN_ROLE;
  password: any;
  isPasswordVisible = false;
  subscriptions: Subscription[] = [];
  thingsModel: any;
  protocolList = CONSTANTS.PROTOCOLS;
  connectivityList: string[] = [];
  isUpdateThingsModelAPILoading = false;
  isFileUploading: boolean;
  constructor(
    private toasterService: ToasterService,
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    console.log(this.deviceType);
    if (!this.deviceType.metadata?.image) {
      this.deviceType.metadata.image = {
        url: CONSTANTS.DEFAULT_MODEL_IMAGE
      };
    }
  }

  openUnfreezeModal() {
    this.password = undefined;
    $('#passwordCheckModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  openCreateDeviceTypeModal() {
    this.thingsModel = JSON.parse(JSON.stringify(this.deviceType));
    $('#createDeviceTypeModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  getConnectivityData() {
    this.thingsModel.tags.cloud_connectivity = undefined;
    if (this.thingsModel && this.thingsModel.tags && this.thingsModel.tags.protocol) {
      this.connectivityList = this.protocolList.find(protocol => protocol.name === this.thingsModel.tags.protocol)?.cloud_connectivity
       || [];
    }
  }

  async onLogoFileSelected(files: FileList): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'device-type-images');
    if (data) {
      this.thingsModel.metadata.image = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  updateThingsModel() {
    console.log(this.thingsModel);
    if (!this.thingsModel.name || !this.thingsModel.tags.protocol || !this.thingsModel.tags.cloud_connectivity
    || !this.thingsModel.metadata.model_type) {
      this.toasterService.showError('Please fill all the fields', 'Update Things Model');
      return;
    }
    this.thingsModel.metadata.measurement_frequency = {
      min: 1,
      max: 10,
      average: 5
    };
    this.thingsModel.metadata.telemetry_frequency = {
      min: 1,
      max: 60,
      average: 30
    };
    if (this.thingsModel.id) {
      this.thingsModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    }
    this.isUpdateThingsModelAPILoading = true;
    const method = this.thingsModel.id ? this.deviceTypeService.updateThingsModel(this.thingsModel, this.contextApp.app) :
    this.deviceTypeService.createThingsModel(this.thingsModel, this.contextApp.app);
    this.subscriptions.push(method.subscribe(
      (response: any) => {
        this.isUpdateThingsModelAPILoading = false;
        this.onCloseThingsModelModal();
        this.deviceTypeService.deviceModelRefreshData.emit(this.deviceType.name);
        this.toasterService.showSuccess(response.message, 'Update Things Model');
      }, error => {
        this.isUpdateThingsModelAPILoading = false;
        this.toasterService.showError(error.message, 'Update Things Model');
      }
    ));
  }

  onCloseThingsModelModal() {
    $('#createDeviceTypeModal').modal('hide');
    this.thingsModel = undefined;
  }

  freezeModel() {
    this.isModelFreezeUnfreezeAPILoading = true;
    const obj = {
      updated_by: this.userData.email + ' (' + this.userData.name + ')'
    };
    this.subscriptions.push(this.deviceTypeService.freezeDeviceModel(this.contextApp.app, this.deviceType.name, obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Freeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
        this.deviceTypeService.deviceModelRefreshData.emit(this.deviceType.name);
      }, error => {
        this.toasterService.showError(error.message, 'Freeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
      }
    ));
  }


  unfreezeModel() {
    if (!this.password) {
      this.toasterService.showError('Password is compulsory.', 'Unfreeze Model');
    }
    this.isModelFreezeUnfreezeAPILoading = true;
    const obj = {
      email: this.userData.email,
      password: this.password,
      updated_by: this.userData.email + ' (' + this.userData.name + ')'
    };
    this.subscriptions.push(this.deviceTypeService.unfreezeDeviceModel(this.contextApp.app, this.deviceType.name, obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Unfreeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
        this.deviceTypeService.deviceModelRefreshData.emit(this.deviceType.name);
        this.onCloseModal('passwordCheckModal');
      }, error => {
        this.toasterService.showError(error.message, 'Unfreeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
      }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
