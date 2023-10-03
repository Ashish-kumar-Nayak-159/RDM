import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { environment } from './../../../../environments/environment';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-asset-model-overview',
  templateUrl: './asset-model-overview.component.html',
  styleUrls: ['./asset-model-overview.component.css'],
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
  overviewFile: any;
  invalid_width:boolean=false;
  invalid_height:boolean=false;
  scaled_image_size: FormGroup;
  modelOpenFlag='';
  default_pin_icon=CONSTANTS.DEFAULT_MAP_PIN_ICON;
  constructor(
    private toasterService: ToasterService,
    private assetModelService: AssetModelService,
    private commonService: CommonService,private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    // const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    if (!this.assetModel.metadata?.image) {
      this.assetModel.metadata.image = {
        url: CONSTANTS.DEFAULT_MODEL_IMAGE,
      };
    }
    if (!this.assetModel.metadata?.mapPinIcon) {
      this.assetModel.metadata.mapPinIcon = {
        url:CONSTANTS.DEFAULT_MAP_PIN_ICON,
      };
    }
    this.scaled_image_size = this.fb.group({
      file:this.fb.control (null, [Validators.required]),
      width:this.fb.control (null, [Validators.required,Validators.min(20), Validators.max(150), Validators.pattern('[0-9]+$')]),
      height:this.fb.control (null, [Validators.required,Validators.min(20), Validators.max(75), Validators.pattern('[0-9]+$')])
    });
    this.invalid_width=false;
    this.invalid_height=false;
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

  openCreateAssetModelModal(modelFlag:string) {
      this.modelOpenFlag=modelFlag;
      this.updatedAssetModel = JSON.parse(JSON.stringify(this.assetModel));
      if(this.modelOpenFlag!=='removePinIcon'){
        $('#createAssetModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
      }else{
        if(this.updatedAssetModel?.metadata && this.updatedAssetModel?.metadata?.mapPinIcon && this.updatedAssetModel?.metadata?.mapPinIcon?.name){
          this.updatedAssetModel.metadata.mapPinIcon=undefined;
          this.updateAssetsModel();
        }
      }
  }
  getConnectivityData() {
    this.assetModel.tags.cloud_connectivity = undefined;
    if (this.assetModel && this.assetModel.tags && this.assetModel.tags.protocol) {
      this.connectivityList =
        this.protocolList.find((protocol) => protocol.name === this.assetModel.tags.protocol)?.cloud_connectivity || [];
    }
  }

  async onLogoFileSelected(files: FileList): Promise<void> {
    this.overviewFile = files.item(0);
    if (this.overviewFile?.size > CONSTANTS.ASSET_MODEL_IMAGE_SIZE){
      this.toasterService.showError('File size exceeded' + " " + CONSTANTS.ASSET_MODEL_IMAGE_SIZE / 1000000 + " " + 'MB', 'Upload file');
      this.overviewFile = undefined;
      if(this.scaled_image_size && this.scaled_image_size?.controls['file']){
        this.scaled_image_size.controls['file'].reset();
      }
    }
    else {
      const image = new Image();
      image.src = URL.createObjectURL(this.overviewFile);

      image.onload = (e: any) => {
        const selectedImage = e.target as HTMLImageElement;
        if (selectedImage.width <= CONSTANTS.ASSET_MODEL_IMAGE_WIDTH && selectedImage.height <= CONSTANTS.ASSET_MODEL_IMAGE_HEIGHT){
          if(this.modelOpenFlag==='assetModelFlag'){
            this.updatedAssetModel.metadata.image = this.overviewFile;
          }else{
            this.updatedAssetModel.metadata.mapPinIcon = this.overviewFile;
          }
        } else {
          this.toasterService.showError('Image size exceeded' + " " + CONSTANTS.ASSET_MODEL_IMAGE_WIDTH + " " + 'x' + " " + CONSTANTS.ASSET_MODEL_IMAGE_HEIGHT + " " + 'px', 'Upload file');
        }
      };
    }
  }
  
  validWidth(){  
        this.scaled_image_size.controls['width'].value > CONSTANTS.SCALED_SIZE_IMAGE_WIDTH || this.scaled_image_size.controls['width'].value<20 ? this.invalid_width=true :this.invalid_width=false;
  }
  
  validHeight(){  
    this.scaled_image_size.controls['height'].value > CONSTANTS.SCALED_SIZE_IMAGE_HEIGHT || this.scaled_image_size.controls['height'].value<20 ? this.invalid_height=true :this.invalid_height=false;
  }

  async uploadFile(): Promise<void>{
    this.isFileUploading = true;
    const icon_size={
      width:this.scaled_image_size.controls['width'].value,
      height:this.scaled_image_size.controls['height'].value,
      modelOpenFlag:this.modelOpenFlag
    }

    const data = await this.commonService.uploadImageToBlob(
      this.overviewFile,this.contextApp.app + '/models/' + this.assetModel?.name ? this.assetModel.name : this.updatedAssetModel.name,this.modelOpenFlag !=='assetModelFlag' ? icon_size : ''
    );
    if (data) {
      if(this.modelOpenFlag==='assetModelFlag'){
        this.updatedAssetModel.metadata.image = data;
      }else{
        this.updatedAssetModel.metadata.mapPinIcon = data;
      }
      
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(this.overviewFile);
  }

  async updateAssetsModel() {
    //upload file
    if(this.modelOpenFlag!=='removePinIcon'){
      await this.uploadFile();
    }
    this.assetModel = JSON.parse(JSON.stringify(this.updatedAssetModel));
    if (
      !this.assetModel.name ||
      !this.assetModel.tags.protocol ||
      !this.assetModel.tags.cloud_connectivity ||
      !this.assetModel.metadata.model_type
    ) {
        this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, this.modelOpenFlag==='assetModelFlag' ? 'Update Asset Model' : 'Map Pin Icon Updated');
      return;
    }
    if (this.assetModel.id) {
      this.assetModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    }
    this.isUpdateAssetsModelAPILoading = true;
    const method = this.assetModel.id
      ? this.assetModelService.updateAssetsModel(this.assetModel, this.contextApp.app)
      : this.assetModelService.createAssetsModel(this.assetModel, this.contextApp.app);
    this.subscriptions.push(
      method.subscribe(
        (response: any) => {
          this.isUpdateAssetsModelAPILoading = false;
          this.onCloseAssetsModelModal();
          this.assetModelService.assetModelRefreshData.emit(this.assetModel.name);
            this.toasterService.showSuccess(response.message,this.modelOpenFlag==='assetModelFlag'? 'Update Asset Model' : 'Map Pin Icon Updated');
            this.overviewFile=undefined;
        },
        (error) => {
          this.isUpdateAssetsModelAPILoading = false;
            this.toasterService.showError(error.message,this.modelOpenFlag==='assetModelFlag' ? 'Update Asset Model':'Map Pin Icon Updated');
        }
      )
    );
    this.modelOpenFlag=undefined;
  }

  onCloseAssetsModelModal() {
    $('#createAssetModelModal').modal('hide');
    this.modelOpenFlag=undefined;
    this.invalid_height=false;
    this.invalid_width=false;
    this.scaled_image_size.reset();
    this.overviewFile = undefined;
    // this.assetModel = undefined;
    // this.updatedAssetModel = undefined;
  }

  freezeModel() {
    this.isModelFreezeUnfreezeAPILoading = true;
    const obj = {
      updated_by: this.userData.email + ' (' + this.userData.name + ')',
    };
    this.subscriptions.push(
      this.assetModelService.freezeAssetModel(this.contextApp.app, this.assetModel.name, obj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Freeze Model');
          this.isModelFreezeUnfreezeAPILoading = false;
          this.assetModelService.assetModelRefreshData.emit(this.assetModel.name);
        },
        (error) => {
          this.toasterService.showError(error.message, 'Freeze Model');
          this.isModelFreezeUnfreezeAPILoading = false;
        }
      )
    );
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
      updated_by: this.userData.email + ' (' + this.userData.name + ')',
    };
    this.subscriptions.push(
      this.assetModelService.unfreezeAssetModel(this.contextApp.app, this.assetModel.name, obj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Unfreeze Model');
          this.isModelFreezeUnfreezeAPILoading = false;
          this.assetModelService.assetModelRefreshData.emit(this.assetModel.name);
          this.onCloseModal('passwordCheckModal');
        },
        (error) => {
          this.toasterService.showError(error.message, 'Unfreeze Model');
          this.isModelFreezeUnfreezeAPILoading = false;
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
