import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ActivatedRoute } from '@angular/router';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
declare var $: any;
@Component({
  selector: 'app-access-control',
  templateUrl: './access-control.component.html',
  styleUrls: ['./access-control.component.css'],
})
export class AccessControlComponent implements OnInit, OnChanges {
  contextApp: any;
  appUsers: any[] = [];
  constantData = CONSTANTS;
  apiSubscriptions: any[] = [];
  @Input() asset: any;
  @Input() componentState: any;
  assetUsers: any[] = [];
  assetUserForDelete: any;
  // pageType: string;
  isUpdateAPILoading: boolean;
  isAddUserModalOpen = false;
  assetAccessUsers: any[] = [];
  selectedTab = 'Access Control';
  decodedToken: any;
  addUserForm: FormGroup;
  searchCountryField = SearchCountryField;
  countryISO = CountryISO;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private commonService: CommonService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private assetService: AssetService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.decodedToken?.privileges?.indexOf('UMV') > -1) {
      this.getAssetAccessUsers();
    } else {
      this.selectedTab = 'Recipients';
    }
  }

  onClickOfTab(type) {
    this.selectedTab = type;
  }

  async ngOnChanges(changes) {
    if (changes.asset) {
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      if (this.decodedToken?.privileges?.indexOf('UMV') > -1) {
        await this.getApplicationUsers();
      }
      this.assetUsers = [];
      if (this.asset?.tags?.recipients) {
        this.assetUsers = this.asset.tags.recipients;
      } else {
        this.asset.tags.recipients = [];
        this.assetUsers = [];
      }
    }
  }

  getAssetAccessUsers() {
    this.assetAccessUsers = [];

    this.appUsers.forEach((user) => {
      let flag = false;
      this.contextApp.hierarchy.levels.forEach((level) => {
        if (user.hierarchy[level] === this.asset.tags.hierarchy_json[level] || user.hierarchy[level] === undefined) {
          flag = true;
        } else {
          flag = false;
        }
      });
      if (flag) {
        this.assetAccessUsers.push(user);
      }
    });
  }

  getApplicationUsers() {
    return new Promise<void>((resolve) => {
      this.appUsers = [];
      this.apiSubscriptions.push(
        this.applicationService.getApplicationUsers(this.contextApp.app).subscribe((response: any) => {
          if (response && response.data) {
            this.appUsers = response.data;
          }
          resolve();
        })
      );
    });
  }

  onUserSelectionChange() {
    const user = this.addUserForm.value.userObj;
    console.log(user);
    if (user) {
      this.addUserForm.patchValue({
        name: user.user_name,
        email: user.user_email,
        sms: user?.metadata?.sms,
        whatsapp: user?.metadata?.whatsapp,
      });
    } else {
      this.addUserForm.patchValue({
        name: null,
        email: null,
        sms: null,
        whatsapp: null,
      });
    }
    console.log(this.addUserForm.value);
  }

  openAddUserModal() {
    this.addUserForm = new FormGroup({
      userObj: new FormControl(null, []),
      name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required]),
      sms: new FormControl(null),
      whatsapp: new FormControl(null),
    });
    this.isAddUserModalOpen = true;
    $('#userAccessAddModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openConfirmModal(index) {
    const user = this.asset?.tags?.recipients[index];
    if (this.asset?.tags?.recipients.length === 1) {
      this.toasterService.showError('At least one recipient is required', 'Remove Recipient');
      this.onModalClose();
      return;
    } else {
      this.assetUserForDelete = index;
      this.modalConfig = {
        stringDisplay: true,
        isDisplaySave: true,
        isDisplayCancel: true,
      };
      $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  onModalClose() {
    $('#userAccessAddModal').modal('hide');
    this.isAddUserModalOpen = false;
    this.addUserForm.reset();
  }

  onCloseConfirmModal() {
    $('#confirmMessageModal').modal('hide');
    this.assetUserForDelete = undefined;
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.onCloseConfirmModal();
    } else if (eventType === 'save') {
      this.removeUserAccess();
    }
  }

  onAddUserAccess() {
    const user = this.addUserForm.value;
    delete user.userObj;
    if (!user.email || !user.name) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add Recipient');
      return;
    }
    if (!CONSTANTS.EMAIL_REGEX.test(user.email)) {
      this.toasterService.showError('Email address is not valid', 'Add Recipient');
      return;
    }
    if (user.sms) {
      if ($('#sms').is(':invalid')) {
        this.toasterService.showError('Please enter valid sms number', 'Add Recipient');
        return;
      }
      user.sms = user.sms.e164Number;
    }
    if (user.whatsapp) {
      if ($('#whatsapp').is(':invalid')) {
        this.toasterService.showError('Please enter valid whatsapp number', 'Add Recipient');
        return;
      }
      user.whatsapp = user.whatsapp.e164Number;
    }
    const index = this.asset.tags?.recipients?.findIndex((userObj) => user.email === userObj.email);
    if (index > -1) {
      this.toasterService.showError('Recipient with same email address is already there.', 'Add Recipient');
      return;
    }
    this.asset.tags?.recipients.push(user);
    this.updateAssetData();
  }

  removeUserAccess() {
    this.asset.tags?.recipients?.splice(this.assetUserForDelete, 1);
    this.updateAssetData();
  }

  updateAssetData() {
    this.isUpdateAPILoading = true;
    let methodToCall;
    this.asset['sync_with_cache'] = true;
    if (this.componentState === CONSTANTS.NON_IP_ASSET) {
      methodToCall = this.assetService.updateNonIPAssetTags(this.asset, this.contextApp.app);
    } else {
      methodToCall = this.assetService.updateAssetTags(this.asset, this.contextApp.app);
    }
    this.apiSubscriptions.push(
      methodToCall.subscribe(
        (response: any) => {
          this.toasterService.showSuccess('Asset Access updated successfully', 'Access Control');
          this.assetService.reloadAssetInControlPanelEmitter.emit();
          this.isUpdateAPILoading = false;
          this.onModalClose();
          this.onCloseConfirmModal();
        },
        (error) => {
          this.toasterService.showError(error.message, 'Access Control');
          this.isUpdateAPILoading = false;
        }
      )
    );
  }
}
