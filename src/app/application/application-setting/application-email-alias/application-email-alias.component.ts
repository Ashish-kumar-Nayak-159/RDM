import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit } from '@angular/core';
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
  appObj: { group_name?: string; recipients?: any[]; email?: any[]; sms?: any[]; whatsapp?: any[];push_notification?: any[] };
  groupObj: { group_name?: string; recipients?: {}; email?: any[]; sms?: any[]; whatsapp?: any[]; push_notification?: any[] };
  userGroups: any[] = [];
  isUserGroupsAPILoading = false;
  isUpdateUserGroupsLoading = false;
  apiSubscriptions: Subscription[] = [];
  sMS_recipientsForm: { visibility: any; };
  whatsapp_recipientsForm: { visibility: any; };
  push_notification_recipientsForm: { visibility: any; };
  recipientemail: any = {};
  recipientemailpush: any = {};
  recipientsms: any = {};
  recipientwhatsapp: any = {};
  decodedToken: any;
  searchCountryField = SearchCountryField;
  countryISO = CountryISO;
  isCreateUserGroupAPILoading = false;
  selectedUserGroup: any;
  isAddUserGroup = false;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  contextApp: any;
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.getApplicationUserGroups();
    this.getTileName();
  }

  getTileName(){
    let sMS_recipientsItem;
    let whatsapp_recipientsItem;
    let push_notification_recipientsItem;
    this.contextApp.menu_settings.miscellaneous_menu.forEach((item) => {
      if (item.system_name === 'SMS Recipients') {
        if (item.page === 'sMS_recipients') {          
          sMS_recipientsItem = item.visible;
          this.sMS_recipientsForm = sMS_recipientsItem;
        }
      }
      if (item.system_name === 'Whatsapp Recipients') {
        if (item.page === 'whatsapp_recipients') {          
          whatsapp_recipientsItem = item.visible;
          this.whatsapp_recipientsForm = whatsapp_recipientsItem;
        }
      }
      if (item.system_name === 'Push Notification Recipients') {
        if (item.page === 'push_notification_recipients') {          
          push_notification_recipientsItem = item.visible;
          this.push_notification_recipientsForm = push_notification_recipientsItem;
        }
      }
    });
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
              if (!group.recipients.push_notification) {
                group.recipients.push_notification = [];
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


  
  addPushRecipient(index) {
    if (!this.recipientemailpush[index]) {
      this.toasterService.showError('Email is required', 'Add Email');
    } else {
      if (!CONSTANTS.EMAIL_REGEX.test(this.recipientemailpush[index])) {
        this.toasterService.showError('Email address is not valid', 'Add Email');
        return;
      }
      if (!this.isAddUserGroup) {
        if (this.userGroups[index].recipients['push_notification'].includes(this.recipientemailpush[index])) {
          this.toasterService.showError('Same email address exist in this group', 'Add Email');
          return;
        }
        this.userGroups[index].recipients['push_notification'].splice(
          this.userGroups[index].recipients['push_notification'].length,
          0,
          this.recipientemailpush[index]
        );
      } else {
        if (this.groupObj.recipients['push_notification'].includes(this.recipientemailpush[index])) {
          this.toasterService.showError('Same email address exist in this group', 'Add Email');
          return;
        }
        this.groupObj.recipients['push_notification'].splice(this.groupObj.recipients['push_notification'].length, 0, this.recipientemailpush[index]);
      }
      this.recipientemailpush = {};
    }
  }



  removePushRecipient(index) {
    if (!this.isAddUserGroup) {
      this.appObj.recipients['push_notification'].splice(index, 1);
    } else {
      this.groupObj.recipients['push_notification'].splice(index, 1);
    }
  }


  openCreateUserGroupModal() {
    this.isAddUserGroup = true;
    this.groupObj = { group_name: null, recipients: { email: [], sms: [], whatsapp: [],push_notification :[] } };
    this.recipientemail = {};
    this.recipientsms = {};
    this.recipientwhatsapp = {};
    this.recipientemailpush ={};
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
