import { UserService } from './../../../services/user.service';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
declare var $: any;
@Component({
  selector: 'app-application-users',
  templateUrl: './application-users.component.html',
  styleUrls: ['./application-users.component.css']
})
export class ApplicationUsersComponent implements OnInit {

  @Input() applicationData: any;
  users: any[] = [];
  addUserObj: any;
  hierarchyList: any[] = [];
  isCreateUserAPILoading = false;
  hierarchyArr = {};
  configureHierarchy = {};
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.getApplicationUsers();

    this.applicationData.hierarchy.levels.forEach((element, index) => {
      this.hierarchyArr[index] = [];
    });

  }

  getApplicationUsers() {
    this.users = [];
    console.log(this.applicationData);
    this.applicationService.getApplicationUsers(this.applicationData.app).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.users = response.data;
        }
      }
    );
  }

  getUserHierarchy(userObj) {
    let hierarchy = '';
    const keyList = Object.keys(userObj.hierarchy);
    keyList.forEach((key, index) => {
      hierarchy = hierarchy + userObj.hierarchy[key] + (userObj.hierarchy[keyList[index + 1]] ? ' / ' : '');
    });
    return hierarchy;
  }

  openCreateUserModal() {
    this.addUserObj = {};
    this.addUserObj.app = this.applicationData.app;
    this.addUserObj.role = 'App Admin';
    this.configureHierarchy = {};
    this.addUserObj.hierarchy = {App: this.applicationData.app};
    this.addUserObj.hierarchy = {};
    $('#createUserModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onUserRoleChange() {
    this.getAccessLevelHierarchy();
  }

  onChangeOfHierarchy(i) {
    Object.keys(this.configureHierarchy).forEach(key => {
      console.log(key, i);
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
      console.log(index);
      console.log(this.configureHierarchy);
      console.log(this.configureHierarchy[index + 1]);
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
        console.log(nextHierarchy);
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
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
    Object.keys(this.configureHierarchy).forEach((key) => {
      this.addUserObj.hierarchy[this.applicationData.hierarchy.levels[key]] = this.configureHierarchy[key];
      console.log(this.addUserObj.hierarchy);
    });

    if (!this.addUserObj.name || !this.addUserObj.email || !this.addUserObj.role ||
      Object.keys(this.addUserObj.hierarchy).length !== this.hierarchyList.length) {
      this.toasterService.showError('Please fill all the details', 'Create User');
      return;
    }
    this.isCreateUserAPILoading = true;
    console.log(this.addUserObj);
    this.userService.createUser(this.addUserObj, this.applicationData.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Create User');
        this.isCreateUserAPILoading = false;
        this.onCloseCreateUserModal();
        this.getApplicationUsers();
      }, error => {
        this.toasterService.showError(error.message, 'Create User');
        this.isCreateUserAPILoading = false;
      }
    );
  }

  onCloseCreateUserModal() {
    $('#createUserModal').modal('hide');
    this.addUserObj = undefined;
    this.hierarchyList = [];
  }

}
