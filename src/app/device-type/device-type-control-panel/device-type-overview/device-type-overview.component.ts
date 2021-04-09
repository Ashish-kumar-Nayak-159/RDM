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
  constructor(
    private toasterService: ToasterService,
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
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

  freezeModel() {
    this.isModelFreezeUnfreezeAPILoading = true;
    this.subscriptions.push(this.deviceTypeService.freezeDeviceModel(this.contextApp.app, this.deviceType.name).subscribe(
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
      return;
    }
    this.isModelFreezeUnfreezeAPILoading = true;
    const obj = {
      email: this.userData.email,
      password: this.password
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
