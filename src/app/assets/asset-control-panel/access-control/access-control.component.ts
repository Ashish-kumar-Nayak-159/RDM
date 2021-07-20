import { CONSTANTS } from './../../../app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ActivatedRoute } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-access-control',
  templateUrl: './access-control.component.html',
  styleUrls: ['./access-control.component.css']
})
export class AccessControlComponent implements OnInit, OnChanges {

  contextApp: any;
  appUsers: any[] = [];
  constantData = CONSTANTS;
  apiSubscriptions: any[] = [];
  selectedUser: any = {};
  @Input() asset: any;
  @Input() componentState: any;
  assetUsers: any[] = [];
  assetUserForDelete: any;
  // pageType: string;
  isUpdateAPILoading: boolean;
  isAddUserModalOpen = false;
  assetAccessUsers: any[] = [];
  selectedTab = 'Access Control';
  constructor(
    private commonService: CommonService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private assetService: AssetService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getAssetAccessUsers();
  }

  onClickOfTab(type) {
    this.selectedTab = type;
  }

  async ngOnChanges(changes) {
    if (changes.asset) {
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      await this.getApplicationUsers();
      this.assetUsers = [];
      if (this.asset?.tags?.asset_users) {
        Object.keys(this.asset?.tags?.asset_users).forEach(user => {
          const appUser = this.appUsers.find(userObj => userObj.user_email === this.asset.tags.asset_users[user].user_email);
          if (appUser) {
            this.assetUsers.push(appUser);
          } else {
            this.assetUsers.push(this.asset.tags.asset_users[user]);
          }
        });
        } else {
          this.asset.tags.asset_users = {};
        }
    }
  }

  getAssetAccessUsers() {
    this.assetAccessUsers = [];

    this.appUsers.forEach(user => {
      let flag = false;
      this.contextApp.hierarchy.levels.forEach(level => {
        if (user.hierarchy[level] === this.asset.tags.hierarchy_json[level] || user.hierarchy[level] === undefined) {
          flag = true;
        } else {
          flag = false;
        }
      });
      console.log(user.name, '=====', flag);
      if (flag) {
        this.assetAccessUsers.push(user);
      }
    });
  }

  getApplicationUsers() {
    return new Promise<void>((resolve) => {
    this.appUsers = [];
    this.apiSubscriptions.push(this.applicationService.getApplicationUsers(this.contextApp.app).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.appUsers = response.data;
        }
        resolve();
      }
    ));
    });
  }

  openAddUserModal() {
    this.selectedUser = {};
    this.isAddUserModalOpen = true;
    $('#userAccessAddModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openConfirmModal(user) {
    const keys = Object.keys(this.asset?.tags?.asset_users);
    if (keys.length === 1) {
      this.toasterService.showError('At least one user is required', 'Access control');
      this.onModalClose();
      return;
    } else {
    this.assetUserForDelete = btoa(user.user_email);
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  onModalClose() {
    $('#userAccessAddModal').modal('hide');
    this.isAddUserModalOpen = false;
    this.selectedUser = {};
  }

  onCloseConfirmModal() {
    $('#confirmMessageModal').modal('hide');
    this.assetUserForDelete = undefined;
  }

  onAddUserAccess() {
    if (!this.selectedUser.user_email || !this.selectedUser.user_name) {
      this.toasterService.showError('Please enter all required fields',
        'Access Control');
      return;
    }
    if (!CONSTANTS.EMAIL_REGEX.test(this.selectedUser.user_email)) {
      this.toasterService.showError('Email address is not valid',
        'Access Control');
      return;
    }
    if (this.asset.tags.asset_users[btoa(this.selectedUser.user_email)] ) {
      this.toasterService.showError('This user already has access of this asset',
        'Access Control');
      return;
    }
    this.asset.tags.asset_users[btoa(this.selectedUser.user_email)] = {
      user_email: this.selectedUser.user_email,
      user_name: this.selectedUser.user_name
    };
    this.asset.tags.email_recipients = '';
    const keys = (Object.keys(this.asset.tags.asset_users));
    keys.forEach((key, index) => {
      this.asset.tags.email_recipients += this.asset.tags.asset_users[key].user_email + (keys[index + 1] ? ',' : '');
    });
    this.updateAssetData();
  }

  removeUserAccess() {
    const keys = Object.keys(this.asset?.tags?.asset_users);
    // if (keys.length === 1) {
    //   this.toasterService.showError('At least one user is required', 'Access control');
    //   this.onModalClose();
    //   return;
    // }
    this.asset.tags.asset_users[this.assetUserForDelete] = null;
    const index = keys.findIndex(key => key === this.assetUserForDelete);
    keys.splice(index, 1);
    this.asset.tags.email_recipients = '';
    keys.forEach((key, i) => {
      this.asset.tags.email_recipients += this.asset.tags.asset_users[key].user_email + (keys[i + 1] ? ',' : '');
    });
    this.updateAssetData();
  }


  updateAssetData() {
    this.isUpdateAPILoading = true;
    let methodToCall;
    this.asset['sync_with_cache'] = true;
    if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
      methodToCall = this.assetService.updateNonIPAssetTags(this.asset, this.contextApp.app);
    } else {
      methodToCall = this.assetService.updateAssetTags(this.asset, this.contextApp.app);
    }
    this.apiSubscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess('Asset Access updated successfully', 'Access Control');
        this.assetService.reloadAssetInControlPanelEmitter.emit();
        this.isUpdateAPILoading = false;
        this.onModalClose();
        this.onCloseConfirmModal();
      }, error => {
        this.toasterService.showError(error.message, 'Access Control');
        this.isUpdateAPILoading = false;
      }
    ));
  }

}
