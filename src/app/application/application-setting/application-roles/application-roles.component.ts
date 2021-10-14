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
  privilegeObj: any;
  privilegeGroups: any;
  saveRoleAPILoading = false;
  selectedRole: any;
  isDeleteRoleAPILoading = false;
  apiSubscriptions: Subscription[] = [];
  toggleRows: any = {};
  decodedToken: any;
  pageType: any;
  constantData = CONSTANTS;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.privilegeGroups = CONSTANTS.PRIVILEGE_GROUPS;
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

  onToggleRows(i, type) {
    this.privilegeObj = this.userRoles[i];
    if (this.toggleRows[i]) {
      this.toggleRows = {};
    } else {
      this.toggleRows = {};
      this.toggleRows[i] = true;
    }
    this.pageType = type;
  }

  openCreateUserModal() {
    this.privilegeObj = {};
    this.privilegeObj.app = this.applicationData.app;
    this.privilegeObj.privileges = CONSTANTS.DEFAULT_PRIVILEGES;
    $('#createUserModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onSaveRoles() {
    this.saveRoleAPILoading = true;
    const method = this.privilegeObj.id
      ? this.applicationService.updateUserRoles(this.applicationData.app, this.privilegeObj)
      : this.applicationService.addUserRoles(this.applicationData.app, this.privilegeObj);
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
    this.privilegeObj = undefined;
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

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
