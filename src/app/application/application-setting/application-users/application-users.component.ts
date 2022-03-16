import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from './../../../services/common.service';

import { Subscription } from 'rxjs';
import { UserService } from './../../../services/user.service';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
declare var $: any;
@Component({
  selector: 'app-application-users',
  templateUrl: './application-users.component.html',
  styleUrls: ['./application-users.component.css'],
})
export class ApplicationUsersComponent implements OnInit, OnDestroy {
  @Input() applicationData: any;
  userData: any;
  users: any[] = [];
  isGetUsersAPILoading = false;
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
  decodedToken: any;
  searchCountryField = SearchCountryField;
  countryISO = CountryISO;
  userRoles: any = [];
  addUserForm: FormGroup;
  rolesList: any = [];
  userLevel;
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private userService: UserService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.getApplicationUserRoles();
    this.getApplicationUsers();
    this.applicationData.hierarchy.levels.forEach((element, index) => {
      this.hierarchyArr[index] = [];
    });
  }

  getApplicationUserRoles() {
    this.apiSubscriptions.push(
      this.applicationService.getApplicationUserRoles(this.applicationData.app).subscribe((response: any) => {
        if (response && response.data) {
          // this.userRoles = response.data;
          response.data.map((role) => {
            if (role.role == this.applicationData.user.role) {
              this.userLevel = role.level;
            }
          })
          response.data.map((role) => {
            if (role.level >= this.userLevel) {
              this.userRoles.push(role)
              this.rolesList.push(role.role);
            }
          })
          console.log('userRoles ', this.userRoles)
          console.log('this.applicationData ', this.applicationData)
        }
      })
    );
  }

  getApplicationUsers() {
    this.isGetUsersAPILoading = true;
    this.users = [];
    this.apiSubscriptions.push(
      this.applicationService.getApplicationUsers(this.applicationData.app).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.users = response.data;
            this.isGetUsersAPILoading = false;
          }
        },
        (error) => (this.isGetUsersAPILoading = false)
      )
    );
  }

  getUserHierarchy(userObj) {
    const keyList = this.applicationData.hierarchy.levels;

    // keyList.forEach((key, index) => {
    //   hierarchy = hierarchy + userObj.hierarchy[key] + (userObj.hierarchy[keyList[index + 1]] ? ' / ' : '');
    //   userHierarchy = userHierarchy + (this.applicationData.user.hierarchy[key] ?  this.applicationData.user.hierarchy[key] : '')  + (this.applicationData.user.hierarchy[keyList[index + 1]] ? ' / ' : '')
    // });
    // if(hierarchy.substr(0,userHierarchy.length ) == userHierarchy && hierarchy.length >= userHierarchy.length){
    //   userObj['isEditable'] = true
    // }
    let userHierarchyItems = [];
    let currentUserHierarchyItems = [];
    keyList.forEach(level => {
      if (userObj.hierarchy.hasOwnProperty(level)) 
        userHierarchyItems.push(userObj.hierarchy[level]);
      if (this.applicationData.user.hierarchy.hasOwnProperty(level)) 
        currentUserHierarchyItems.push(this.applicationData.user.hierarchy[level]);
    });
    userObj["isEditable"] = currentUserHierarchyItems < userHierarchyItems;
    return userHierarchyItems.join(" / ");
  }

  // tslint:disable-next-line: no-unnecessary-initializer
  openCreateUserModal(userObj = undefined) {
    this.addUserObj = {};
    if (!userObj) {
      this.addUserForm = new FormGroup({
        app: new FormControl(this.applicationData.app),
        name: new FormControl(null, [Validators.required, Validators.nullValidator]),
        email: new FormControl(null, [Validators.required, Validators.nullValidator]),
        metadata: new FormGroup({
          sms: new FormControl(null),
          whatsapp: new FormControl(null),
        }),
        // role: new FormControl(CONSTANTS.APP_ADMIN_ROLE, [Validators.required]),
        role: new FormControl(this.applicationData.user.role, [Validators.required])
      });
      this.addUserObj.app = this.applicationData.app;
      this.configureHierarchy = {};
      // this.addUserObj.hierarchy = { App: this.applicationData.app };
      // this.addUserObj.hierarchy = {};
      this.addUserObj.hierarchy = this.applicationData.user.hierarchy;
      this.applicationData.hierarchy.levels.forEach((level, index) => {
        if (level !== 'App' && this.addUserObj.hierarchy[level]) {
          this.configureHierarchy[index] = this.addUserObj.hierarchy[level];
          this.onChangeOfHierarchy(index);
        }
      });
    } else {
      this.addUserForm = new FormGroup({
        id: new FormControl(userObj.id),
        app: new FormControl(this.applicationData.app),
        name: new FormControl(userObj.user_name, [Validators.required, Validators.nullValidator]),
        email: new FormControl(userObj.user_email, [Validators.required, Validators.nullValidator]),
        metadata: new FormGroup({
          sms: new FormControl(userObj.metadata?.sms || null),
          whatsapp: new FormControl(userObj.metadata?.whatsapp || null),
        }),
        role: new FormControl(userObj.role, [Validators.required]),
      });
      this.addUserObj = JSON.parse(JSON.stringify(userObj));
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
    this.addUserObj.hierarchy = this.applicationData.user.hierarchy;
    this.applicationData.hierarchy.levels.forEach((level, index) => {
      if (level !== 'App' && this.addUserObj.hierarchy[level]) {
        this.configureHierarchy[index] = this.addUserObj.hierarchy[level];
        this.onChangeOfHierarchy(index);
      }
    });
  }

  onChangeOfHierarchy(i) {
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach((key) => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    
    let nextHierarchy = this.commonService.getItemFromLocalStorage(CONSTANTS.HIERARCHY_TAGS);
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }

    let count = 0;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        count++;
      }
    });
    if (count === 0) {
      this.hierarchyArr = [];
      if (this.applicationData.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.commonService.getItemFromLocalStorage(CONSTANTS.HIERARCHY_TAGS));
      }
    }
  }

  getAccessLevelHierarchy() {
    this.hierarchyList = [];
    let hierarchy = '';
    const roleObj = this.userRoles.filter((role) => role.role === this.addUserForm.value.role)[0];
    debugger
    this.applicationData.hierarchy.levels.forEach((element, index) => {
      if (index <= roleObj?.level) {
        hierarchy = hierarchy + element + ' / ';
        if (element.level !== 0) {
          this.hierarchyList.push(element);
        }
      }
    });
    if (this.hierarchyList.length > 1) {
      this.hierarchyArr['1'] = Object.keys(this.commonService.getItemFromLocalStorage(CONSTANTS.HIERARCHY_TAGS));
    }
    if (hierarchy.slice(-2) === '/ ') {
      hierarchy = hierarchy.substring(0, hierarchy.length - 2);
    }
    return hierarchy;
  }

  onCreateUser() {
    this.addUserObj = this.addUserForm.value;
    this.addUserObj.hierarchy = {};
    // this.addUserObj.hierarchy[this.applicationData.hierarchy.levels[0]] = this.applicationData.app;
    this.addUserObj.hierarchy = { App: this.applicationData.app };
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        this.addUserObj.hierarchy[this.applicationData.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });
    if (
      !this.addUserObj.name ||
      !this.addUserObj.email ||
      !this.addUserObj.role ||
      Object.keys(this.addUserObj.hierarchy).length !== this.hierarchyList.length
    ) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Create User');
      return;
    }
    if (!CONSTANTS.EMAIL_REGEX.test(this.addUserObj.email)) {
      this.toasterService.showError('Email address is not valid', 'Create User');
      return;
    }

    if (this.addUserObj?.metadata?.sms) {
      if ($('#sms').is(':invalid')) {
        this.toasterService.showError('Please enter valid number', 'Add SMS No');
        return;
      }
      this.addUserObj.metadata.sms = this.addUserObj.metadata.sms.e164Number;
    }
    if (this.addUserObj?.metadata?.whatsapp) {
      if ($('#whatsapp').is(':invalid')) {
        this.toasterService.showError('Please enter valid number', 'Add Whatsapp No');
        return;
      }
      this.addUserObj.metadata.whatsapp = this.addUserObj.metadata.whatsapp.e164Number;
    }
    this.isCreateUserAPILoading = true;
    const method = this.addUserObj.id
      ? this.userService.updateUser(this.addUserObj, this.applicationData.app)
      : this.userService.createUser(this.addUserObj, this.applicationData.app);
    this.apiSubscriptions.push(
      method.subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, (this.addUserObj.id ? 'Update' : 'Add') + ' User');
          this.isCreateUserAPILoading = false;
          this.onCloseCreateUserModal();
          this.getApplicationUsers();
        },
        (error) => {
          this.toasterService.showError(error.message, (this.addUserObj.id ? 'Update' : 'Add') + ' User');
          this.isCreateUserAPILoading = false;
        }
      )
    );
  }

  onCloseCreateUserModal() {
    $('#createUserModal').modal('hide');
    this.addUserObj = undefined;
    this.hierarchyList = [];
  }

  checkForOneAppAdminUser() {
    let count = 0;
    this.users.forEach((user) => {
      if (user.role === CONSTANTS.APP_ADMIN_ROLE) {
        count++;
      }
    });
    return count;
  }

  async openDeleteUserModal(user) {
    const count = this.checkForOneAppAdminUser();
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
    if (!this.password || this.password.trim().length === 0) {
      this.toasterService.showError('Please enter password.', 'Delete User Access');
      return;
    }
    this.isDeleteUserAPILoadig = true;
    const obj = {
      email: this.userData.email,
      password: this.password,
    };
    this.apiSubscriptions.push(
      this.userService.deleteUser(this.applicationData.app, this.selectedUserForDelete.id, obj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Delete User Access');
          this.isDeleteUserAPILoadig = false;
          this.onCloseModal();
          this.getApplicationUsers();
        },
        (error) => {
          this.toasterService.showError(error.message, 'Delete User Access');
          this.isDeleteUserAPILoadig = false;
        }
      )
    );
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
