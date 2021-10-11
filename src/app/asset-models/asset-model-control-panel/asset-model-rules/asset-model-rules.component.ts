import { ToasterService } from './../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
declare var $: any;
@Component({
  selector: 'app-asset-model-rules',
  templateUrl: './asset-model-rules.component.html',
  styleUrls: ['./asset-model-rules.component.css'],
})
export class AssetModelRulesComponent implements OnInit, OnDestroy {
  @Input() assetModel: any;
  rules: any[] = [];
  rulesTableConfig: any;
  isRulesLaoading = false;
  contextApp: any;
  subscriptions: Subscription[] = [];
  selectedTab: any;
  isAddRule = false;
  isEdit = false;
  ruleData: any;
  isDeleteRuleLoading = false;
  userData: any;
  decodedToken: any;
  toggleRows = {};
  selectedrule: any;
  isView = false;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private assetModelService: AssetModelService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.onClickOfTab('Cloud');
  }

  addRule() {
    this.selectedTab = '';
    this.isEdit = false;
    this.ruleData = {};
    this.isAddRule = true;
  }

  onClickOfTab(type) {
    this.isAddRule = false;
    this.selectedTab = type;
    this.toggleRows = {};
    this.getRules();
  }

  onToggleRows(i, rule, isView = false, isEdit = false) {
    if (this.toggleRows[this.selectedTab + '_' + i]) {
      this.toggleRows = {};
    } else {
      this.toggleRows = {};
      this.toggleRows[this.selectedTab + '_' + i] = true;
      this.isEdit = isEdit;
      this.isView = isView;
      this.ruleData = rule;
    }
  }

  getRules() {
    this.rules = [];
    this.isRulesLaoading = true;
    const obj = {
      type: this.selectedTab,
    };
    this.subscriptions.push(
      this.assetModelService.getRules(this.contextApp.app, this.assetModel.name, obj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.rules = response.data;
            this.rules.forEach((rule) => {
              if (rule.updated_date) {
                rule.local_updated_date = this.commonService.convertUTCDateToLocal(rule.updated_date);
                rule.epoch_updated_date = this.commonService.convertDateToEpoch(rule.updated_date);
              }
              if (rule.deployed_on) {
                rule.local_deployed_on = this.commonService.convertUTCDateToLocal(rule.deployed_on);
                rule.epoch_deployed_on = this.commonService.convertDateToEpoch(rule.deployed_on);
              }
              if (rule.synced_on) {
                rule.local_synced_on = this.commonService.convertUTCDateToLocal(rule.synced_on);
                rule.epoch_synced_on = this.commonService.convertDateToEpoch(rule.synced_on);
              }
            });
          }
          this.isRulesLaoading = false;
        },
        (error) => (this.isRulesLaoading = false)
      )
    );
  }

  deployRule(rule, isRevert = false) {
    this.ruleData = rule;
    this.isDeleteRuleLoading = true;
    const obj = {
      deployed_by: this.userData.email + ' (' + this.userData.name + ')',
      is_revert: isRevert,
    };
    console.log(this.ruleData);
    console.log(obj);
    this.assetModelService
      .deployCloudModelRule(this.contextApp.app, this.assetModel.name, this.ruleData.rule_id, obj)
      .subscribe(
        (response: any) => {
          this.onCloseDeleteModal();
          this.getRules();
          this.isDeleteRuleLoading = false;
          this.toasterService.showSuccess(
            isRevert ? 'Rule reverted successfully' : response.message,
            isRevert ? 'Revert Rule' : 'Deploy Rule'
          );
        },
        (err: HttpErrorResponse) => {
          this.isDeleteRuleLoading = false;
          this.toasterService.showSuccess(err.message, isRevert ? 'Revert Rule' : 'Deploy Rule');
          this.onCloseDeleteModal();
        }
      );
  }

  deployEdgeRule(rule, isRevert = false) {
    this.ruleData = rule;
    this.isDeleteRuleLoading = true;
    const obj = {};
    const bodyObj = {
      message: {
        command: isRevert ? 'delete_asset_rules' : 'set_asset_rules',
        rules: [],
      },
      app: this.contextApp.app,
      timestamp: moment().unix(),
      acknowledge: 'Full',
      expire_in_min: 2880,
      job_id: this.commonService.generateUUID(),
      request_type: 'Sync Rules',
      job_type: 'Message',
      sub_job_id: null,
      type: 'model',
    };
    bodyObj.sub_job_id = bodyObj.job_id + '_1';
    if (isRevert) {
      bodyObj.message.rules = [rule.rule_id];
    } else {
      bodyObj.message.rules = [rule];
    }
    this.assetModelService
      .deployModelEdgeRule(this.contextApp.app, this.assetModel.name, rule.rule_id, bodyObj, obj)
      .subscribe(
        (response: any) => {
          this.onCloseDeleteModal();
          this.getRules();
          this.isDeleteRuleLoading = false;
          this.toasterService.showSuccess(
            isRevert ? 'Rule reverted successfully' : response.message,
            isRevert ? 'Revert Rule' : 'Sync Rule'
          );
        },
        (err: HttpErrorResponse) => {
          this.isDeleteRuleLoading = false;
          this.toasterService.showSuccess(err.message, isRevert ? 'Revert Rule' : 'Deploy Rule');
          this.onCloseDeleteModal();
        }
      );
  }

  onDeleteRule(rule) {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.selectedrule = rule;
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.onCloseDeleteModal();
    } else if (eventType === 'save') {
      this.deleteRule();
    }
  }

  deleteRule() {
    this.ruleData = this.selectedrule;
    this.isDeleteRuleLoading = true;
    const method =
      this.ruleData.type === 'Edge'
        ? this.assetModelService.deleteEdgeModelRule(
            this.contextApp.app,
            this.ruleData.rule_id,
            'model',
            this.ruleData.updated_by,
            this.assetModel.name
          )
        : this.assetModelService.deleteCloudModelRule(
            this.contextApp.app,
            this.ruleData.rule_id,
            'model',
            this.ruleData.updated_by,
            this.assetModel.name
          );
    method.subscribe(
      (response: any) => {
        this.onCloseDeleteModal();
        this.toggleRows = {};
        this.getRules();
        this.isDeleteRuleLoading = false;
        this.toasterService.showSuccess(response.message, 'Delete Rule');
      },
      (err: HttpErrorResponse) => {
        this.isDeleteRuleLoading = false;
        this.toasterService.showSuccess(err.message, 'Delete Rule');
        this.onCloseDeleteModal();
      }
    );
  }

  onCloseDeleteModal() {
    $('#confirmMessageModal').modal('hide');
    this.isDeleteRuleLoading = false;
  }

  onCloseRuleModel(event) {
    this.isAddRule = false;
    if (event.status) {
      this.onClickOfTab('Cloud');
    }
    this.toggleRows = {};
    this.isEdit = false;
    this.isView = false;
    this.ruleData = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
