import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;

@Component({
  selector: 'app-asset-model-alert-acknowledgement-reasons',
  templateUrl: './asset-model-alert-acknowledgement-reasons.component.html',
  styleUrls: ['./asset-model-alert-acknowledgement-reasons.component.css'],
})
export class AssetModelAlertAcknowledgementReasonsComponent implements OnInit {
  @Input() assetModel: any;
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
  decodedToken: any;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.assetModel = JSON.parse(JSON.stringify(this.assetModel));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.getAckReasons();
  }

  getAckReasons() {
    this.ackReasons = [];
    this.isAckReasonsLoading = true;
    const modelObj = {
      app: this.contextApp.app,
      name: this.assetModel.name,
    };
    this.subscriptions.push(
      this.assetModelService.getAssetsModelAckReasons(modelObj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.ackReasons = response.data;
          }
          this.isAckReasonsLoading = false;
        },
        (error) => {
          this.isAckReasonsLoading = false;
        }
      )
    );
  }

  addReason() {
    if (this.reasonObj) {
      if (!this.reasonObj.reason) {
        this.toasterService.showError('Please add reason', 'Add Reason');
        return false;
      }
      // this.ackReasons.push(this.reasonObj);
      this.originalReasonObj = this.reasonObj;
    }
    this.ReasonBtnClicked = true;
    this.firstReasonAdded = true;
    this.reasonObj = {};
    return true;
  }

  async updateReason() {
    const flag = await this.addReason();
    if (!flag) {
      return;
    }
    this.isUpdateReasonsAPILoading = true;
    // const obj = JSON.parse(JSON.stringify(this.ackReasons));
    let obj = {};
    if (this.originalReasonObj) {
      obj = JSON.parse(JSON.stringify(this.originalReasonObj));
    }
    const modelObj = {
      app: this.contextApp.app,
      name: this.assetModel.name,
    };
    this.subscriptions.push(
      this.assetModelService.createAssetsModelAckReasons(obj, modelObj).subscribe(
        (response: any) => {
          this.reasonObj = undefined;
          this.toasterService.showSuccess(response.message, 'Add Reasons');
          this.getAckReasons();
          this.firstReasonAdded = false;
          this.isUpdateReasonsAPILoading = false;
        },
        (error) => {
          this.toasterService.showError(error.message, 'Add Reasons');
          this.isUpdateReasonsAPILoading = false;
        }
      )
    );
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
      name: this.assetModel.name,
    };
    this.subscriptions.push(
      this.assetModelService.updateAssetsModelAckReasons(id, obj, modelObj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Update Reasons');
          this.getAckReasons();
          this.isUpdateReasonsAPILoading = false;
          this.isEnableEdit[i] = false;
        },
        (error) => {
          this.toasterService.showError(error.message, 'Update Reasons');
          this.isUpdateReasonsAPILoading = false;
          this.isEnableEdit[i] = false;
        }
      )
    );
  }

  deleteReason() {
    // this.ackReasons.splice(this.deleteTagIndex, 1);
    const id = this.selectedid;
    const modelObj = {
      app: this.contextApp.app,
      name: this.assetModel.name,
    };
    this.subscriptions.push(
      this.assetModelService.deleteAssetsModelAckReasons(id, modelObj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Remove Reason');
          this.closeModal('confirmMessageModal');
          this.getAckReasons();
        },
        (error) => {
          this.toasterService.showError(error.message, 'Remove Reason');
          this.closeModal('confirmMessageModal');
        }
      )
    );
  }

  openModal(id, e, i) {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.deleteTagIndex = i;
    this.selectedid = e;
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.closeModal('confirmMessageModal');
    } else if (eventType === 'save') {
      this.deleteReason();
    }
  }

  closeModal(id) {
    this.deleteTagIndex = undefined;
    $('#' + id).modal('hide');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
