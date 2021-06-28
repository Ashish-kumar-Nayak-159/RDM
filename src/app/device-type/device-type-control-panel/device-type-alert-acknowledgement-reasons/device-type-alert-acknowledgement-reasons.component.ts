import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;

@Component({
  selector: 'app-device-type-alert-acknowledgement-reasons',
  templateUrl: './device-type-alert-acknowledgement-reasons.component.html',
  styleUrls: ['./device-type-alert-acknowledgement-reasons.component.css']
})
export class DeviceTypeAlertAcknowledgementReasonsComponent implements OnInit {

  @Input() deviceType: any;
  ackReasons: any[] = [];
  isAckReasonsLoading = false;
  isUpdateReasonsAPILoading = false;
  userData: any;
  contextApp: any;
  reasonObj: any;
  originalReasonObj: any;
  firstReasonAdded = false;
  ReasonBtnClicked = false;
  isEnableEdit: any = {};
  deleteTagIndex: any;
  selectedid: any;
  subscriptions: Subscription[] = [];
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
  ) { }

  ngOnInit(): void {
    this.deviceType = JSON.parse(JSON.stringify(this.deviceType));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getAckReasons();
  }

  getAckReasons() {
    this.ackReasons = [];
    this.isAckReasonsLoading = true;
    const modelObj = {
      app: this.contextApp.app,
      name: this.deviceType.name
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelAckReasons(modelObj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.ackReasons = response.data;
        }
        this.isAckReasonsLoading = false;
      }, error => {
        this.isAckReasonsLoading = false;
      }
    ));
  }

  addReason() {
    this.ReasonBtnClicked = true;
    if (this.reasonObj) {
      if (!this.reasonObj.reason) {
        this.toasterService.showError('Please add reason', 'Add Reason');
        return;
      }
      // this.ackReasons.push(this.reasonObj);
      this.originalReasonObj = this.reasonObj;
    }
    this.firstReasonAdded = true;
    this.reasonObj = {};
  }

  async updateReason() {
    this.isUpdateReasonsAPILoading = true;
    await this.addReason();
    // const obj = JSON.parse(JSON.stringify(this.ackReasons));
    const obj = JSON.parse(JSON.stringify(this.originalReasonObj));
    const modelObj = {
      app: this.contextApp.app,
      name: this.deviceType.name
    };
    this.subscriptions.push(this.deviceTypeService.createThingsModelAckReasons(obj, modelObj).subscribe(
      (response: any) => {
        this.reasonObj = undefined;
        this.toasterService.showSuccess(response.message, 'Add Reasons');
        this.getAckReasons();
        this.firstReasonAdded = false;
        this.isUpdateReasonsAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Add Reasons');
        this.isUpdateReasonsAPILoading = false;
      }
    ));
    this.ReasonBtnClicked = false;
  }

  enableEditMethod(i) {
    this.originalReasonObj = JSON.parse(JSON.stringify(this.ackReasons[i]));
    this.isEnableEdit = {};
    this.isEnableEdit[i] = true;
  }

  onCancelClick(r, e, i) {
    this.ackReasons[i].reason = this.originalReasonObj.reason;
    this.isEnableEdit[i] = false;
  }

  onSaveReason(r, e, i) {
    const id = e;
    const obj = { reason: r };
    const modelObj = {
      app: this.contextApp.app,
      name: this.deviceType.name
    };
    this.subscriptions.push(this.deviceTypeService.updateThingsModelAckReasons(id, obj, modelObj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Update Reasons');
        this.getAckReasons();
        this.isUpdateReasonsAPILoading = false;
        this.isEnableEdit[i] = false;
      }, error => {
        this.toasterService.showError(error.message, 'Update Reasons');
        this.isUpdateReasonsAPILoading = false;
        this.isEnableEdit[i] = false;
      }
    ));
  }

  deleteReason() {
    // this.ackReasons.splice(this.deleteTagIndex, 1);
    const id = this.selectedid;
    const modelObj = {
      app: this.contextApp.app,
      name: this.deviceType.name
    };
    this.subscriptions.push(this.deviceTypeService.deleteThingsModelAckReasons
      (id, modelObj).
      subscribe((response: any) => {
        this.toasterService.showSuccess(response.message, 'Remove Reason');
        this.closeModal('confirmMessageModal');
        this.getAckReasons();
      }, error => {
        this.toasterService.showError(error.message, 'Remove Reason');
        this.closeModal('confirmMessageModal');
      }));
  }

  openModal(id, e, i) {
    this.deleteTagIndex =  i;
    this.selectedid = e;
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  closeModal(id) {
    this.deleteTagIndex = undefined;
    $('#' + id).modal('hide');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
