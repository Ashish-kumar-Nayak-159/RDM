import { CommonService } from './../../../services/common.service';

import { Subscription } from 'rxjs';
import { UserService } from './../../../services/user.service';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;
@Component({
  selector: 'app-application-users',
  templateUrl: './application-users.component.html',
  styleUrls: ['./application-users.component.css']
})
export class ApplicationUsersComponent implements OnInit, OnDestroy {

  @Input() applicationData: any;
  userData: any;
  users: any[] = [];
  addUserObj: any;
  hierarchyList: any[] = [];
  isCreateUserAPILoading = false;
  hierarchyArr = {};
  configureHierarchy = {};
  apiSubscriptions: Subscription[] = [];
  isPasswordVisible = false;
  isDeleteUserAPILoadig = false;
  selectedUserForDelete: any;
  password: any;
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private userService: UserService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.getApplicationUsers();

    this.applicationData.hierarchy.levels.forEach((element, index) => {
      this.hierarchyArr[index] = [];
    });

  }

  getApplicationUsers() {
    this.users = [];
    this.apiSubscriptions.push(this.applicationService.getApplicationUsers(this.applicationData.app).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.users = response.data;
        }
      }
    ));
  }

  getUserHierarchy(userObj) {
    let hierarchy = '';
    const keyList = Object.keys(userObj.hierarchy);
    keyList.forEach((key, index) => {
      hierarchy = hierarchy + userObj.hierarchy[key] + (userObj.hierarchy[keyList[index + 1]] ? ' / ' : '');
    });
    return hierarchy;
  }

  // tslint:disable-next-line: no-unnecessary-initializer
  openCreateUserModal(userObj = undefined) {
    this.addUserObj = {};
    if (!userObj) {
    this.addUserObj.app = this.applicationData.app;
    this.addUserObj.role = 'App Admin';
    this.configureHierarchy = {};
    this.addUserObj.hierarchy = {App: this.applicationData.app};
    this.addUserObj.hierarchy = {};
    } else {
      this.addUserObj = JSON.parse(JSON.stringify(userObj));
      this.addUserObj.name = userObj.user_name;
      this.addUserObj.email = userObj.user_email;

      this.applicationData.hierarchy.levels.forEach((level, index) => {
        if (level !== 'App' && userObj.hierarchy[level]) {

          this.configureHierarchy[index] = userObj.hierarchy[level];
          this.onChangeOfHierarchy(index);
        }
      });
    }
    $('#createUserModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onUserRoleChange() {
    this.getAccessLevelHierarchy();
    this.configureHierarchy = JSON.parse(JSON.stringify({}));
  }

  onChangeOfHierarchy(i) {
    Object.keys(this.configureHierarchy).forEach(key => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach(key => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.applicationData.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }

    let count = 0;
    Object.keys(this.configureHierarchy).forEach(key => {
      if (this.configureHierarchy[key]) {
        count ++;
      }
    });
    if (count === 0) {
      this.hierarchyArr = [];
      if (this.applicationData.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.applicationData.hierarchy.tags);
      }
    }
  }
  getAccessLevelHierarchy() {
    this.hierarchyList = [];
    let hierarchy = '';
    const roleObj = this.applicationData.roles.filter(role => role.name === this.addUserObj.role)[0];
    this.applicationData.hierarchy.levels.forEach((element, index) => {
      if (index <= roleObj.level) {
        hierarchy = hierarchy + element + ' / ';
        if (element.level !== 0) {
          this.hierarchyList.push(element);
        }
      }
    });
    if (this.hierarchyList.length > 1) {
      this.hierarchyArr['1'] = Object.keys(this.applicationData.hierarchy.tags);
    }
    if (hierarchy.slice(-2) === '/ ') {
      hierarchy = hierarchy.substring(0, hierarchy.length - 2);
    }
    return hierarchy;
  }

  onCreateUser() {
    this.addUserObj.hierarchy[this.applicationData.hierarchy.levels[0]] = this.applicationData.app;
    this.addUserObj.hierarchy = {App: this.applicationData.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      this.addUserObj.hierarchy[this.applicationData.hierarchy.levels[key]] = this.configureHierarchy[key];
    });
    if (!this.addUserObj.name || !this.addUserObj.email || !this.addUserObj.role ||
      Object.keys(this.addUserObj.hierarchy).length !== this.hierarchyList.length) {
      this.toasterService.showError('Please fill all the details', 'Create User');
      return;
    }
    if (!CONSTANTS.EMAIL_REGEX.test(this.addUserObj.email)) {
      this.toasterService.showError('Email address is not valid',
        'Create User');
      return;
    }
    this.isCreateUserAPILoading = true;
    const method = this.addUserObj.id ? this.userService.updateUser(this.addUserObj, this.applicationData.app) :
    this.userService.createUser(this.addUserObj, this.applicationData.app);
    this.apiSubscriptions.push(method.subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'App User');
        this.isCreateUserAPILoading = false;
        this.onCloseCreateUserModal();
        this.getApplicationUsers();
      }, error => {
        this.toasterService.showError(error.message, 'App User');
        this.isCreateUserAPILoading = false;
      }
    ));
  }

  onCloseCreateUserModal() {
    $('#createUserModal').modal('hide');
    this.addUserObj = undefined;
    this.hierarchyList = [];
  }

  checkForOneAppAdminUser() {
    let count = 0;
    this.users.forEach(user => {
      if (user.role === CONSTANTS.APP_ADMIN_ROLE) {
        count++;
      }
    });
    return count;
  }

  async openDeleteUserModal(user) {
    const count = await this.checkForOneAppAdminUser();
    if (count < 2 && user.role === CONSTANTS.APP_ADMIN_ROLE) {
      this.toasterService.showError('At least one app admin user required.', 'Delete User Access');
      return;
    }
    this.selectedUserForDelete = user;
    $('#deleteUserModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }


  onCloseModal() {
    $('#deleteUserModal').modal('hide');
    this.selectedUserForDelete = undefined;
    this.isDeleteUserAPILoadig = false;
    this.password = undefined;
  }

  deleteUser() {
    if (!this.password || (this.password.trim()).length === 0) {
      this.toasterService.showError('Please enter password.', 'Delete User Access');
      return;
    }
    this.isDeleteUserAPILoadig = true;
    const obj = {
      email: this.userData.email,
      password: this.password
    };
    this.apiSubscriptions.push(this.userService.deleteUser(this.applicationData.app, this.selectedUserForDelete.id, obj).subscribe
    ((response: any) => {
      this.toasterService.showSuccess(response.message, 'Delete User Access');
      this.isDeleteUserAPILoadig = false;
      this.onCloseModal();
      this.getApplicationUsers();
    }, error => {
      this.toasterService.showError(error.message, 'Delete User Access');
      this.isDeleteUserAPILoadig = false;
    }));
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }

}
