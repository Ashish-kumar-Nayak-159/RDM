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
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.getApplicationUsers();
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
    this.addUserObj.hierarchy = {App: this.applicationData.app};
    $('#createUserModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onUserRoleChange() {
    this.getAccessLevelHierarchy();
  }

  getAccessLevelHierarchy() {
    this.hierarchyList = [];
    let hierarchy = '';
    const roleObj = this.applicationData.roles.filter(role => role.name === this.addUserObj.role)[0];
    this.applicationData.hierarchy.forEach(element => {
      if (element.level <= roleObj.level) {
        hierarchy = hierarchy + element.name + ' / ';
        if (element.level !== 0) {
          this.hierarchyList.push(element);
        }
      }
    });
    if (hierarchy.slice(-2) === '/ ') {
      hierarchy = hierarchy.substring(0, hierarchy.length - 2);
    }
    return hierarchy;
  }

  onCreateUser() {
    console.log(this.addUserObj);
    if (!this.addUserObj.name || !this.addUserObj.email || !this.addUserObj.role ||
      Object.keys(this.addUserObj.hierarchy).length !== this.hierarchyList.length + 1) {
      this.toasterService.showError('Please fill all the details', 'Create User');
      return;
    }
    this.isCreateUserAPILoading = true;
    this.userService.createUser(this.addUserObj).subscribe(
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
