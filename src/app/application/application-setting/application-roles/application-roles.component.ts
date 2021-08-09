import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/app.constants';

declare var $: any;
@Component({
  selector: 'app-application-roles',
  templateUrl: './application-roles.component.html',
  styleUrls: ['./application-roles.component.css']
})
export class ApplicationRolesComponent implements OnInit, OnDestroy {

  @Input() applicationData: any;
  addedLevelItem: string;
  saveRoleAPILoading = false;
  originalApplicationData: any;
  selectedRole: any;
  apiSubscriptions: Subscription[] = [];
  forceUpdate = false;
  isAppSetingsEditable = false;
  isSaveButtonDisable = true;
  decodedToken: any;
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.applicationData.roles.forEach(element => {
      element.isEditable = false;
    });

  }

  onAddNewRoleObj() {
    this.isSaveButtonDisable = false;
    this.applicationData.roles.splice(this.applicationData.roles.length, 0, {
      name: null,
      level: 0,
      isEditable: true
    });
  }

  onSaveRoles(forceUpdate = false) {
    this.applicationData.id = this.applicationData.app;
    let flag = '';
    this.applicationData.roles.forEach(element => {
      if (!element.name || (element.name.trim()).length === 0) {
        flag = 'Blank Name is not allowed.';
      }
    });
    if (flag) {
      this.toasterService.showError(flag, 'Save Role');
      return;
    }
    this.saveRoleAPILoading = true;
    this.applicationData.roles.forEach(item => {
      delete item.isEditable;
    });
    const obj = {
      app: this.applicationData.app,
      roles: this.applicationData.roles,
      force_update: this.forceUpdate ? this.forceUpdate : undefined
    };
    this.apiSubscriptions.push(this.applicationService.updateAppRoles(obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Role');
        this.saveRoleAPILoading = false;
        this.forceUpdate = false;
        this.isSaveButtonDisable = true;
        // this.isAppSetingsEditable = false;
        this.applicationService.refreshAppData.emit();
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Role');
        this.saveRoleAPILoading = false;
      }
    ));
  }

  openConfirmRoleDeleteModal(role) {
    this.selectedRole = role;
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  deleteRole() {
    const roles = [];
    this.applicationData.roles.forEach(role => {
      if (role.name !== this.selectedRole.name) {
        roles.push(role);
      }
    });
    this.applicationData.roles = roles;
    this.forceUpdate = true;
    this.onSaveRoles(this.forceUpdate);
    this.onCloseModal();
  }

  onCloseModal() {
    this.selectedRole = undefined;
    $('#confirmMessageModal').modal('hide');
    this.isAppSetingsEditable = false;
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
    this.isAppSetingsEditable = false;
    this.isSaveButtonDisable = true;
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }

}
