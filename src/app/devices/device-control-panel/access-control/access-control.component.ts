import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
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
  selectedUser: any;
  @Input() device: any;
  deviceUsers: any[] = [];
  deviceUserForDelete: any;
  pageType: string;
  isUpdateAPILoading: boolean;
  constructor(
    private commonService: CommonService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private deviceService: DeviceService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.route.paramMap.subscribe(async params => {
      this.pageType = params.get('listName').toLowerCase();
    });
    // if (this.device?.tags?.device_users) {
    // Object.keys(this.device?.tags?.device_users).forEach(user => {
    //   const appUser = this.appUsers.find(userObj => userObj.user_email === user);
    //   if (appUser) {
    //     this.deviceUsers.push(appUser);
    //   } else {
    //     this.deviceUsers.push(this.device.tags.device_users[user]);
    //   }
    // });
    // } else {
    //   this.device.tags.device_users = {};
    // }
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

  getApplicationUsers() {
    return new Promise((resolve) => {
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
    $('#userAccessAddModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openConfirmModal(user) {
    this.deviceUserForDelete = btoa(user.user_email);
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalClose() {
    $('#userAccessAddModal').modal('hide');
    this.selectedUser = undefined;
  }

  onCloseConfirmModal() {
    $('#confirmMessageModal').modal('hide');
    this.deviceUserForDelete = undefined;
  }

  onAddUserAccess() {
    if (!this.selectedUser.user_email || !this.selectedUser.user_name) {
      this.toasterService.showError('Please fill all details',
        'Create User');
      return;
    }
    if (!CONSTANTS.EMAIL_REGEX.test(this.selectedUser.user_email)) {
      this.toasterService.showError('Email address is not valid',
        'Access Control');
      return;
    }
    if (this.device.tags.device_users[this.selectedUser.user_email] ) {
      this.toasterService.showError('This user already has access of this device',
        'Access Control');
      return;
    }
    this.device.tags.device_users[btoa(this.selectedUser.user_email)] = {
      user_email: this.selectedUser.user_email,
      user_name: this.selectedUser.user_name
    };
    this.device.tags.device_manager = '';
    const keys = (Object.keys(this.device.tags.device_users));
    keys.forEach((key, index) => {
      this.device.tags.device_manager += this.device.tags.device_users[key].user_email + (keys[index + 1] ? ',' : '');
    });
    this.updateDeviceData();
  }

  removeUserAccess() {
    // const originalKeys = Object.keys(this.device?.tags?.device_users);
    // const keys = Object.keys(this.device?.tags?.device_users);
    // originalKeys.forEach((user, index) => {
    //   if (this.device.tags.device_users[user].user_email === this.deviceUserForDelete) {
    //     this.device.tags.device_users[user] = null;
    //     keys.splice(index, 1);
    //   }
    // });
    this.device.tags.device_users[this.deviceUserForDelete] = null;
    const keys = Object.keys(this.device?.tags?.device_users);
    const index = keys.findIndex(key => key === this.deviceUserForDelete);
    keys.splice(index, 1);
    console.log(this.device.tags.device_users);
    this.device.tags.device_manager = '';
    keys.forEach((key, i) => {
      this.device.tags.device_manager += this.device.tags.device_users[key].user_email + (keys[i + 1] ? ',' : '');
    });
    this.updateDeviceData();
  }


  updateDeviceData() {
    this.isUpdateAPILoading = true;
    let methodToCall;
    if (this.pageType === 'nonipdevices') {
      methodToCall = this.deviceService.updateNonIPDeviceTags(this.device, this.contextApp.app);
    } else {
      methodToCall = this.deviceService.updateDeviceTags(this.device, this.contextApp.app);
    }
    this.apiSubscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess('Device Access updated successfully', 'Access Control');
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
