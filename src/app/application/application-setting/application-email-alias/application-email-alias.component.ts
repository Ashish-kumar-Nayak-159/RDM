import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
declare var $: any;

@Component({
  selector: 'app-application-email-alias',
  templateUrl: './application-email-alias.component.html',
  styleUrls: ['./application-email-alias.component.css'],
})
export class ApplicationEmailAliasComponent implements OnInit {
  @Input() applicationData: any;
  appObj: { group_name?: string; recipients?: any[]; email?: any[]; sms?: any[]; whatsapp?: any[] };
  groupObj: { group_name?: string; recipients?: {}; email?: any[]; sms?: any[]; whatsapp?: any[] };
  userGroups: any[] = [];
  isUserGroupsAPILoading = false;
  isUpdateUserGroupsLoading = false;
  apiSubscriptions: Subscription[] = [];
  recipientemail: any = {};
  recipientsms: any = {};
  recipientwhatsapp: any = {};
  decodedToken: any;
  searchCountryField = SearchCountryField;
  countryISO = CountryISO;
  isCreateUserGroupAPILoading = false;
  selectedUserGroup: any;
  isAddUserGroup = false;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.getApplicationUserGroups();
  }

  getApplicationUserGroups() {
    this.isUserGroupsAPILoading = true;
    this.apiSubscriptions.push(
      this.applicationService.getApplicationUserGroups(this.applicationData.app).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.userGroups = response.data;
            this.userGroups.forEach((group) => {
              if (!group.recipients.email) {
                group.recipients.email = [];
              }
              if (!group.recipients.sms) {
                group.recipients.sms = [];
              }
              if (!group.recipients.whatsapp) {
                group.recipients.whatsapp = [];
              }
            });
          }
          this.isUserGroupsAPILoading = false;
        },
        (error) => (this.isUserGroupsAPILoading = false)
      )
    );
  }

  openAccordion(index) {
    this.appObj = this.userGroups[index];
  }

  addEmailRecipient(index) {
    if (!this.recipientemail[index]) {
      this.toasterService.showError('Email is required', 'Add Email');
    } else {
      if (!CONSTANTS.EMAIL_REGEX.test(this.recipientemail[index])) {
        this.toasterService.showError('Email address is not valid', 'Add Email');
        return;
      }
      if (!this.isAddUserGroup) {
        if (this.userGroups[index].recipients['email'].includes(this.recipientemail[index])) {
          this.toasterService.showError('Same email address exist in this group', 'Add Email');
          return;
        }
        this.userGroups[index].recipients['email'].splice(
          this.userGroups[index].recipients['email'].length,
          0,
          this.recipientemail[index]
        );
      } else {
        if (this.groupObj.recipients['email'].includes(this.recipientemail[index])) {
          this.toasterService.showError('Same email address exist in this group', 'Add Email');
          return;
        }
        this.groupObj.recipients['email'].splice(this.groupObj.recipients['email'].length, 0, this.recipientemail[index]);
      }
      this.recipientemail = {};
    }
  }

  removeEmailRecipient(index) {
    if (!this.isAddUserGroup) {
      this.appObj.recipients['email'].splice(index, 1);
    } else {
      this.groupObj.recipients['email'].splice(index, 1);
    }
  }

  addSMSRecipient(index) {
    if ($('#recipientsms_' + index).is(':invalid')) {
      this.toasterService.showError('Please enter valid user mobile number to receive SMS', 'Add SMS No');
      return;
    }
    if (!this.recipientsms[index]) {
      this.toasterService.showError('User mobile number is required to receive SMS', 'Add SMS No');
    } else {
      if (!this.isAddUserGroup) {
        if (this.userGroups[index].recipients['sms'].includes(this.recipientsms[index].e164Number)) {
          this.toasterService.showError('Same number exist in this group', 'Add SMS No');
          return;
        }
        this.userGroups[index].recipients['sms'].splice(
          this.userGroups[index].recipients['sms'].length,
          0,
          this.recipientsms[index].e164Number
        );
      } else {
        if (this.groupObj.recipients['sms'].includes(this.recipientsms[index].e164Number)) {
          this.toasterService.showError('Same number exist in this group', 'Add SMS No');
          return;
        }
        this.groupObj.recipients['sms'].splice(
          this.groupObj.recipients['sms'].length,
          0,
          this.recipientsms[index].e164Number
        );
      }
      this.recipientsms = {};
    }
  }

  removeSMSRecipient(index) {
    if (!this.isAddUserGroup) {
      this.appObj.recipients['sms'].splice(index, 1);
    } else {
      this.groupObj.recipients['sms'].splice(index, 1);
    }
  }

  addWhatsappRecipient(index) {
    if ($('#recipientwhatsapp_' + index).is(':invalid')) {
      this.toasterService.showError('Please enter valid user mobile number to receive Whatsapp', 'Add Whatsapp No');
      return;
    }
    if (!this.recipientwhatsapp[index]) {
      this.toasterService.showError('User mobile number is required to receive Whatsapp', 'Add Whatsapp No');
    } else {
      if (!this.isAddUserGroup) {
        if (this.userGroups[index].recipients['whatsapp'].includes(this.recipientwhatsapp[index].e164Number)) {
          this.toasterService.showError('Same number exist in this group', 'Add Whatsapp No');
          return;
        }
        this.userGroups[index]?.recipients['whatsapp'].splice(
          this.userGroups[index]?.recipients['whatsapp'].length,
          0,
          this.recipientwhatsapp[index].e164Number
        );
      } else {
        if (this.groupObj.recipients['whatsapp'].includes(this.recipientwhatsapp[index].e164Number)) {
          this.toasterService.showError('Same number exist in this group', 'Add Whatsapp No');
          return;
        }
        this.groupObj?.recipients['whatsapp'].splice(
          this.groupObj?.recipients['whatsapp'].length,
          0,
          this.recipientwhatsapp[index].e164Number
        );
      }
      this.recipientwhatsapp = {};
    }
  }

  removeWhatsappRecipient(index) {
    if (!this.isAddUserGroup) {
      this.appObj.recipients['whatsapp'].splice(index, 1);
    } else {
      this.groupObj.recipients['whatsapp'].splice(index, 1);
    }
  }

  openCreateUserGroupModal() {
    this.isAddUserGroup = true;
    this.groupObj = { group_name: null, recipients: { email: [], sms: [], whatsapp: [] } };
    this.recipientemail = {};
    this.recipientsms = {};
    this.recipientwhatsapp = {};
    $('#createUserGroupModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onCloseCreateUserGroupModal() {
    $('#createUserGroupModal').modal('hide');
    this.groupObj = undefined;
    this.isAddUserGroup = false;
  }

  onCreateUserGroup() {
    if (!this.groupObj.group_name) {
      this.toasterService.showError('User Group Name is Required', 'Create User Group');
      return;
    }
    if (!this.groupObj.recipients['email'] || this.groupObj.recipients['email'].length === 0) {
      this.toasterService.showError('At least one email address is required', 'Create User Group');
      return;
    }
    this.isCreateUserGroupAPILoading = true;
    this.apiSubscriptions.push(
      this.applicationService.createApplicationUserGroups(this.groupObj, this.applicationData.app).subscribe(
        (response: any) => {
          this.isCreateUserGroupAPILoading = false;
          this.toasterService.showSuccess(response.message, 'Create User Group');
          this.onCloseCreateUserGroupModal();
          this.getApplicationUserGroups();
        },
        (error) => {
          this.isCreateUserGroupAPILoading = false;
          this.toasterService.showError(error.message, 'Create User Group');
        }
      )
    );
  }

  onUpdateUserGroups() {
    if (!this.appObj.recipients['email'] || this.appObj.recipients['email'].length === 0) {
      this.toasterService.showError('At least one email address is required', 'Update User Group');
      return;
    }
    this.isUpdateUserGroupsLoading = true;
    this.apiSubscriptions.push(
      this.applicationService
        .updateApplicationUserGroups(this.appObj, this.applicationData.app, this.appObj.group_name)
        .subscribe(
          (response: any) => {
            this.isUpdateUserGroupsLoading = false;
            this.getApplicationUserGroups();
            this.toasterService.showSuccess(response.message, 'Update User Group');
          },
          (error) => {
            this.isUpdateUserGroupsLoading = false;
            this.toasterService.showError(error.message, 'Update User Group');
          }
        )
    );
  }

  deleteUserGroup() {
    const obj = {
      group_name: this.selectedUserGroup.group_name,
    };
    this.apiSubscriptions.push(
      this.applicationService.deleteApplicationUserGroups(this.applicationData.app, obj.group_name).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Delete User Group');
          this.onCloseModal();
          this.getApplicationUserGroups();
        },
        (error) => {
          this.toasterService.showError(error.message, 'Delete User Group');
        }
      )
    );
  }

  openConfirmModal(userGroup) {
    $('.panel-heading .close-btn').on('click', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    });
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.selectedUserGroup = userGroup;
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.selectedUserGroup = undefined;
      $('#confirmMessageModal').modal('hide');
    } else if (eventType === 'save') {
      this.deleteUserGroup();
    }
  }

  onCloseModal() {
    this.selectedUserGroup = undefined;
    $('#confirmMessageModal').modal('hide');
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
