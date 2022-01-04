import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from './../../../services/common.service';

declare var $: any;
@Component({
  selector: 'app-application-roles',
  templateUrl: './application-roles.component.html',
  styleUrls: ['./application-roles.component.css'],
})
export class ApplicationRolesComponent implements OnInit, OnDestroy {
  @Input() applicationData: any;
  userData: any;
  isUserRolesAPILoading = false;
  isCreateUserAPILoading = false;
  userRoles: any[] = [];
  privilegeObj: any = {};
  privilegeGroups: any;
  privileges: any = {};
  saveRoleAPILoading = false;
  selectedRole: any;
  isDeleteRoleAPILoading = false;
  apiSubscriptions: Subscription[] = [];
  toggleRows: any = {};
  decodedToken: any;
  pageType: any;
  isAllprivilegeSelected: any = {};
  constantData = CONSTANTS;
  contextApp: any = {};
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.getAllPriviledges();
    this.getApplicationUserRoles();

  }

  getApplicationUserRoles() {
    this.isUserRolesAPILoading = true;
    this.apiSubscriptions.push(
      this.applicationService.getApplicationUserRoles(this.applicationData.app).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.userRoles = response.data;
          }
          this.isUserRolesAPILoading = false;
        },
        (error) => (this.isUserRolesAPILoading = false)
      )
    );
  }

  onToggleRows(i, type, action) {
    this.privilegeObj[i] = this.userRoles[i];
    if (this.toggleRows[i]) {
      if (action === 'toggle') {
        this.toggleRows = {};
      }
    } else {
      this.toggleRows = {};
      this.toggleRows[i] = true;
      this.onPrivilegeSelection(i);
    }
    this.pageType = type;
  }


  openCreateUserModal() {
    this.privilegeObj['add'] = {};
    this.privilegeObj['add'].app = this.applicationData.app;
    this.privilegeObj['add'].privileges = JSON.parse(JSON.stringify(this.privileges));
    this.isAllprivilegeSelected['add'] = true;
    $('#createUserModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onSaveRoles(index) {
    let i = 0;
    Object.keys(this.privilegeObj[index].privileges).forEach((privilege) => {
      if (this.privilegeObj[index].privileges[privilege].enabled) {
        i++;
      }
    });
    if (i === 0) {
      this.toasterService.showError('At least one privilege is required to save Role', 'Save Role');
      return;
    }
    this.saveRoleAPILoading = true;
    const method = this.privilegeObj[index].id
      ? this.applicationService.updateUserRoles(this.applicationData.app, this.privilegeObj[index])
      : this.applicationService.addUserRoles(this.applicationData.app, this.privilegeObj[index]);
    this.apiSubscriptions.push(
      method.subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Save User Roles');
          this.saveRoleAPILoading = false;
          this.onCloseCreateUserModal();
          this.getApplicationUserRoles();
          this.toggleRows = {};
        },
        (error) => {
          this.toasterService.showError(error.message, 'Save User Roles');
          this.saveRoleAPILoading = false;
        }
      )
    );
  }

  onCloseCreateUserModal() {
    $('#createUserModal').modal('hide');
    this.privilegeObj['add'] = undefined;
    this.isAllprivilegeSelected['add'] = false;
  }

  openDeleteUserModal(i) {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.selectedRole = this.userRoles[i];
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.selectedRole = undefined;
      $('#confirmMessageModal').modal('hide');
    } else if (eventType === 'save') {
      this.deleteRole();
    }
  }

  deleteRole() {
    this.isDeleteRoleAPILoading = true;
    const obj = {
      id: this.selectedRole.id,
      role: this.selectedRole.role,
      force_update: true,
    };
    this.apiSubscriptions.push(
      this.applicationService.deleteUserRoles(this.applicationData.app, obj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Delete Role');
          this.isDeleteRoleAPILoading = false;
          this.onModalEvents('close');
          this.getApplicationUserRoles();
        },
        (error) => {
          this.toasterService.showError(error.message, 'Delete Role');
          this.isDeleteRoleAPILoading = false;
        }
      )
    );
  }

  onPrivilegeSelection(index) {
    let count = 0;
    Object.keys(this.privileges).forEach((privilege) => {
      if(this.privilegeObj[index].privileges[privilege] == undefined)
      {
        this.privilegeObj[index].privileges[privilege] = {enabled : false,display_name : this.privileges[privilege].display_name}
      }
      if (this.privilegeObj[index].privileges[privilege].enabled) {
        count++;
      }
    });

    if (count === Object.keys(this.privilegeObj[index].privileges).length) {
      this.isAllprivilegeSelected[index] = true;
    } else {
      this.isAllprivilegeSelected[index] = false;
    }
  }

  onClickOfAllCheckbox(index) {
    if (this.isAllprivilegeSelected[index]) {
      Object.keys(this.privilegeObj[index].privileges).forEach((privilege) => (this.privilegeObj[index].privileges[privilege].enabled = true));
    } else {
      Object.keys(this.privilegeObj[index].privileges).forEach((privilege) => (this.privilegeObj[index].privileges[privilege].enabled = false));
    }
  }

  onCancelClick() {
    this.toggleRows = {};
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  getAllPriviledges() {
    this.apiSubscriptions.push(
      this.applicationService.getAllPriviledges().subscribe(
        (response: any) => {
          if (response && response.data) {
            this.privileges = response.data.Priviledges;
            this.privilegeGroups = response.data.PrivilegeGroup;
          }
        },
        () => { }
      )
    );
  }
}
