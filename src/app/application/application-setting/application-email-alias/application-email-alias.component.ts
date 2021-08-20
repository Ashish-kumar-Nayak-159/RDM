import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;

@Component({
  selector: 'app-application-email-alias',
  templateUrl: './application-email-alias.component.html',
  styleUrls: ['./application-email-alias.component.css']
})
export class ApplicationEmailAliasComponent implements OnInit {
  @Input() applicationData: any;
  appObj: { group_name: string, recipients?: any[], emails?: any[], sms?: any[], whatsapp?: any[] };
  userGroups: any[] = [];
  isUserGroupsAPILoading = false;
  isUpdateUserGroupsLoading = false;
  apiSubscriptions: Subscription[] = [];
  recipientemail: string;
  recipientsms: string;
  recipientwhatsapp: string;
  emailObj: any;
  smsObj: any;
  whatsappObj: any;
  decodedToken: any;
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.getApplicationUserGroups();
  }

  getApplicationUserGroups() {
    this.isUserGroupsAPILoading = true;
    this.apiSubscriptions.push(this.applicationService.getApplicationUserGroups(this.applicationData.app).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.userGroups = response.data;
          this.userGroups.forEach(group => {
            if (!group.recipients.emails) {
              group.recipients.emails = [];
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
      }, error => this.isUserGroupsAPILoading = false
    ));
  }

  openAccordion(index) {
    this.appObj = this.userGroups[index];
  }

  addEmailRecipient(index) {
    this.emailObj = this.userGroups[index].recipients['emails'];
    if (!this.recipientemail) {
      this.toasterService.showError('Email is required', 'Add Email');
    } else {
    this.emailObj.splice(this.emailObj.length, 0, this.recipientemail)
    this.emailObj = [];
   }
  }

  removeEmailRecipient(index) {
    this.appObj.recipients['emails'].splice(index, 1);
  }

  addSMSRecipient(index) {
    this.smsObj = this.userGroups[index].recipients['sms'];
    if (!this.recipientsms) {
      this.toasterService.showError('Phone Number is required', 'Add Phone No');
    } else {
    this.smsObj.splice(this.smsObj.length, 0, this.recipientsms);
    this.smsObj = [];
   }
  }

  removeSMSRecipient(index) {
    this.appObj.recipients['sms'].splice(index, 1);
  }

  addWhatsappRecipient(index) {
    this.whatsappObj = this.userGroups[index]?.recipients['whatsapp'];
    if (!this.recipientwhatsapp) {
      this.toasterService.showError('Whatsapp No is required', 'Add Whatsapp No');
    } else {
    this.whatsappObj.splice(this.whatsappObj.length, 0, this.recipientwhatsapp);
    this.whatsappObj = [];
   }
  }

  removeWhatsappRecipient(index) {
    this.appObj.recipients['whatsapp'].splice(index, 1);
  }

  onUpdateUserGroups() {
     this.isUpdateUserGroupsLoading = true;
     this.apiSubscriptions.push(this.applicationService.updateApplicationUserGroups(
       this.appObj, this.applicationData.app, this.appObj.group_name).subscribe(
      (response: any) => {
        this.isUpdateUserGroupsLoading = false;
        this.getApplicationUserGroups();
        this.toasterService.showSuccess(response.message, 'Update User Group');
      }, error => {
        this.isUpdateUserGroupsLoading = false;
        this.toasterService.showError(error.message, 'Update User Group');
      }));
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }

}
