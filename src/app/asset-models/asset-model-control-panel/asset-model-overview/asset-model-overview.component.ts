import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { environment } from './../../../../environments/environment';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
declare var $: any;
@Component({
  selector: 'app-asset-model-overview',
  templateUrl: './asset-model-overview.component.html',
  styleUrls: ['./asset-model-overview.component.css']
})
export class AssetModelOverviewComponent implements OnInit, OnDestroy {

  @Input() assetModel: any;
  contextApp: any;
  userData: any;
  blobSASToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  isModelFreezeUnfreezeAPILoading = false;
  appAdminRole = CONSTANTS.APP_ADMIN_ROLE;
  password: any;
  isPasswordVisible = false;
  subscriptions: Subscription[] = [];
  // assetModel: any;
  protocolList = CONSTANTS.PROTOCOLS;
  connectivityList: string[] = [];
  isUpdateAssetsModelAPILoading = false;
  isFileUploading: boolean;
  updatedAssetModel: any;
  decodedToken: any;
  constructor(
    private toasterService: ToasterService,
    private assetModelService: AssetModelService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    console.log(this.assetModel);
    if (!this.assetModel.metadata?.image) {
      this.assetModel.metadata.image = {
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

  openCreateAssetModelModal() {
    this.updatedAssetModel = JSON.parse(JSON.stringify(this.assetModel));
    $('#createAssetModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  getConnectivityData() {
    this.assetModel.tags.cloud_connectivity = undefined;
    if (this.assetModel && this.assetModel.tags && this.assetModel.tags.protocol) {
      this.connectivityList = this.protocolList.find(protocol => protocol.name === this.assetModel.tags.protocol)?.cloud_connectivity
       || [];
    }
  }

  async onLogoFileSelected(files: FileList): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), this.contextApp.app + '/models/' + this.assetModel.name);
    if (data) {
      this.updatedAssetModel.metadata.image = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  updateAssetsModel() {
    this.assetModel = JSON.parse(JSON.stringify(this.updatedAssetModel));
    console.log(this.assetModel);
    if (!this.assetModel.name || !this.assetModel.tags.protocol || !this.assetModel.tags.cloud_connectivity
    || !this.assetModel.metadata.model_type) {
      this.toasterService.showError('Please enter all required fields', 'Update Asset Model');
      return;
    }
    if (this.assetModel.id) {
      this.assetModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    }
    this.isUpdateAssetsModelAPILoading = true;
    const method = this.assetModel.id ? this.assetModelService.updateAssetsModel(this.assetModel, this.contextApp.app) :
    this.assetModelService.createAssetsModel(this.assetModel, this.contextApp.app);
    this.subscriptions.push(method.subscribe(
      (response: any) => {
        this.isUpdateAssetsModelAPILoading = false;
        this.onCloseAssetsModelModal();
        this.assetModelService.assetModelRefreshData.emit(this.assetModel.name);
        this.toasterService.showSuccess(response.message, 'Update Asset Model');
      }, error => {
        this.isUpdateAssetsModelAPILoading = false;
        this.toasterService.showError(error.message, 'Update Asset Model');
      }
    ));
  }

  onCloseAssetsModelModal() {
    $('#createAssetModelModal').modal('hide');
    // this.assetModel = undefined;
    this.updatedAssetModel = undefined;
  }

  freezeModel() {
    this.isModelFreezeUnfreezeAPILoading = true;
    const obj = {
      updated_by: this.userData.email + ' (' + this.userData.name + ')'
    };
    this.subscriptions.push(this.assetModelService.freezeAssetModel(this.contextApp.app, this.assetModel.name, obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Freeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
        this.assetModelService.assetModelRefreshData.emit(this.assetModel.name);
      }, error => {
        this.toasterService.showError(error.message, 'Freeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
      }
    ));
  }


  unfreezeModel() {
    if (!this.password) {
      this.toasterService.showError('Password is compulsory.', 'Unfreeze Model');
      return;
    }
    this.isModelFreezeUnfreezeAPILoading = true;
    const obj = {
      email: this.userData.email,
      password: this.password,
      updated_by: this.userData.email + ' (' + this.userData.name + ')'
    };
    this.subscriptions.push(this.assetModelService.unfreezeAssetModel(this.contextApp.app, this.assetModel.name, obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Unfreeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
        this.assetModelService.assetModelRefreshData.emit(this.assetModel.name);
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
