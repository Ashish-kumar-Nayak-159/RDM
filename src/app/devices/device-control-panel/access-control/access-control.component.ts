import { CONSTANTS } from './../../../app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
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
  @Input() device: any;
  @Input() componentState: any;
  deviceUsers: any[] = [];
  deviceUserForDelete: any;
  // pageType: string;
  isUpdateAPILoading: boolean;
  isAddUserModalOpen = false;
  deviceAccessUsers: any[] = [];
  selectedTab = 'Access Control';
  constructor(
    private commonService: CommonService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private deviceService: DeviceService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getDeviceAccessUsers();
  }

  onClickOfTab(type) {
    this.selectedTab = type;
  }

  async ngOnChanges(changes) {
    if (changes.device) {
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      await this.getApplicationUsers();
      this.deviceUsers = [];
      if (this.device?.tags?.device_users) {
        Object.keys(this.device?.tags?.device_users).forEach(user => {
          const appUser = this.appUsers.find(userObj => userObj.user_email === this.device.tags.device_users[user].user_email);
          if (appUser) {
            this.deviceUsers.push(appUser);
          } else {
            this.deviceUsers.push(this.device.tags.device_users[user]);
          }
        });
        } else {
          this.device.tags.device_users = {};
        }
    }
  }

  getDeviceAccessUsers() {
    this.deviceAccessUsers = [];

    this.appUsers.forEach(user => {
      let flag = false;
      this.contextApp.hierarchy.levels.forEach(level => {
        if (user.hierarchy[level] === this.device.tags.hierarchy_json[level] || user.hierarchy[level] === undefined) {
          flag = true;
        } else {
          flag = false;
        }
      });
      console.log(user.name, '=====', flag);
      if (flag) {
        this.deviceAccessUsers.push(user);
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
    this.deviceUserForDelete = btoa(user.user_email);
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalClose() {
    $('#userAccessAddModal').modal('hide');
    this.isAddUserModalOpen = false;
    this.selectedUser = {};
  }

  onCloseConfirmModal() {
    $('#confirmMessageModal').modal('hide');
    this.deviceUserForDelete = undefined;
  }

  onAddUserAccess() {
    if (!this.selectedUser.user_email || !this.selectedUser.user_name) {
      this.toasterService.showError('Please fill all details',
        'Access Control');
      return;
    }
    if (!CONSTANTS.EMAIL_REGEX.test(this.selectedUser.user_email)) {
      this.toasterService.showError('Email address is not valid',
        'Access Control');
      return;
    }
    if (this.device.tags.device_users[btoa(this.selectedUser.user_email)] ) {
      this.toasterService.showError('This user already has access of this asset',
        'Access Control');
      return;
    }
    this.device.tags.device_users[btoa(this.selectedUser.user_email)] = {
      user_email: this.selectedUser.user_email,
      user_name: this.selectedUser.user_name
    };
    this.device.tags.email_recipients = '';
    const keys = (Object.keys(this.device.tags.device_users));
    keys.forEach((key, index) => {
      this.device.tags.email_recipients += this.device.tags.device_users[key].user_email + (keys[index + 1] ? ',' : '');
    });
    this.updateDeviceData();
  }

  removeUserAccess() {
    const keys = Object.keys(this.device?.tags?.device_users);
    if (keys.length === 1) {
      this.toasterService.showError('At least one user is required', 'Access control');
      return;
    }
    this.device.tags.device_users[this.deviceUserForDelete] = null;
    const index = keys.findIndex(key => key === this.deviceUserForDelete);
    keys.splice(index, 1);
    this.device.tags.email_recipients = '';
    keys.forEach((key, i) => {
      this.device.tags.email_recipients += this.device.tags.device_users[key].user_email + (keys[i + 1] ? ',' : '');
    });
    this.updateDeviceData();
  }


  updateDeviceData() {
    this.isUpdateAPILoading = true;
    let methodToCall;
    this.device['sync_with_cache'] = true;
    if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
      methodToCall = this.deviceService.updateNonIPDeviceTags(this.device, this.contextApp.app);
    } else {
      methodToCall = this.deviceService.updateDeviceTags(this.device, this.contextApp.app);
    }
    this.apiSubscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess('Asset Access updated successfully', 'Access Control');
        this.deviceService.reloadDeviceInControlPanelEmitter.emit();
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
