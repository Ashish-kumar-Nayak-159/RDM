import { ToasterService } from './../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { HttpErrorResponse } from '@angular/common/http';
import * as datefns from 'date-fns';
import { AssetService } from 'src/app/services/assets/asset.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
  isCloneRule = false;
  isEdit = false;
  ruleData: any;
  isDeleteRuleLoading = false;
  userData: any;
  decodedToken: any;
  toggleRows = {};
  selectedrule: any;
  isView = false;
  btnClickType:any;
  confirmBodyMessage: any;
  confirmHeaderMessage:any;
  tabData: any;
  type:any;
  ruleType:any;
  // selectedRuleList : any
  filteredRuleList:  any = [];
  asset : any = [];
  ruleMappingForm;
  modalConfig: { cancelBtnText?:any;  saveBtnText?:any;stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) {}

  async ngOnInit(): Promise<void> {
    this.ruleMappingForm = new FormGroup({
      selectedRuleList: new FormControl("", [Validators.required]),
    });
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.onClickOfTab('Cloud');
  }
 
  addRule() {
    this.selectedTab = '';
    this.isEdit = false;
    this.isCloneRule = false;
    this.ruleData = {};
    this.isAddRule = true;
  }

  cloneRule() {
    this.selectedTab = '';
    this.isEdit = false;
    this.isAddRule = false;
    this.ruleData = {};
    this.isCloneRule = true;
  }

  onClickOfTab(type) {
    this.isAddRule = false;
    this.isCloneRule = false;
    this.selectedTab = type;
    this.toggleRows = {};
    this.getRules();
  }

  onToggleRows(i, rule, isView = true, isEdit = false, action) {
    if (this.toggleRows[this.selectedTab + '_' + i]) {
      if (action === 'toggle') {
        this.toggleRows = {};
      }
    } else {
      this.toggleRows = {};
      this.toggleRows[this.selectedTab + '_' + i] = true;
    }
    this.isEdit = isEdit;
    this.isView = isView;
    this.ruleData = rule;
    this.ruleType = rule?.rule_type;
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
    this.assetModelService
      .deployCloudModelRule(this.contextApp.app, this.assetModel.name, this.ruleData.rule_id, obj)
      .subscribe(
        (response: any) => {
          this.onCloseDeleteModal();
          this.getRules();
          this.toggleRows ={}
          this.isDeleteRuleLoading = false;
          this.toasterService.showSuccess(
            isRevert ? 'Rule reverted successfully' : response.message,
            isRevert ? 'Revert Rule' : 'Deploy Rule'
          );
        },
        (err: HttpErrorResponse) => {
          this.isDeleteRuleLoading = false;
          this.toasterService.showError(err.message, isRevert ? 'Revert Rule' : 'Deploy Rule');
          this.onCloseDeleteModal();
        }
      );
  }
  deployRuleed(rule, isRevert = false) {
    this.ruleData = rule;
    this.isDeleteRuleLoading = true;
    const obj = {
      deployed_by: this.userData.email + ' (' + this.userData.name + ')',
      is_revert: isRevert,
    };
    this.assetModelService
      .deployCloudModelRule(this.contextApp.app, this.assetModel.name, this.ruleData.rule_id, obj)
      .subscribe(
        (response: any) => {
          this.onCloseDeleteModal();
          this.getRules();
          this.toggleRows ={}
          this.isDeleteRuleLoading = false;
          this.toasterService.showSuccess(
            isRevert ? 'Rule Disabled successfully' : 'Rule Enabled successfully',
            isRevert ? 'Disable Rule' : 'Enable Rule'
          );
        },
        (err: HttpErrorResponse) => {
          this.isDeleteRuleLoading = false;
          this.toasterService.showError(err.message, isRevert  ? 'Disable Rule' : 'Enable Rule');
          this.onCloseDeleteModal();
        }
      );
  }

  getAssets(hierarchy) {
    return new Promise<void>((resolve1) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
      };
        this.assetService.getIPAndLegacyAssets(obj, this.contextApp.app).subscribe((response: any) => {
          if (response?.data) {
            this.asset = response.data;
          }
          resolve1();
        })
    });
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
      timestamp: datefns.getUnixTime(new Date()),
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
          this.toasterService.showError(err.message, isRevert ? 'Revert Rule' : 'Deploy Rule');
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

  async onMappingRule(rule) {
    this.ruleMappingForm.get('selectedRuleList').setValue(null);
    this.ruleMappingForm.get('selectedRuleList').updateValueAndValidity();
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.selectedrule = rule;
    this.filteredRuleList = [];
    await this.getAssets(this.contextApp.user.hierarchy);
    $('#RuleMappingModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.filteredRuleList = this.rules.filter((localRule)=> localRule.rule_id != rule.rule_id)
  }
  onJSONModalEvents($event) {

  }
  onCloseModal() {
    $('#RuleMappingModal').modal('hide');
  }
  onSaveModal(event) {
    const obj = {
      rule_code : this.selectedrule.code,
      model_name : this.assetModel.name,
      link_rule_code : this.ruleMappingForm.get('selectedRuleList').value,
    }
    this.assetModelService.assetModelRuleMapping(obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Mapping Rule');
        this.onCloseModal();
      },
      (err) => {
        this.toasterService.showError(err.message, 'Mapping Rule');
        this.onCloseModal();
      }
    );
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
        this.toasterService.showError(err.message, 'Delete Rule');
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
    this.isCloneRule = false;
    if (event.status) {
      this.onClickOfTab('Cloud');
    }
    this.toggleRows = {};
    this.isEdit = false;
    this.isView = false;
    this.ruleData = undefined;
  }
  
  onChangeOfRule() {
    // const rule = this.rules.find((rule) => rule.code === this.ruleModel.rule_code);
    // this.ruleData = rule;
    // delete this.ruleData.rule_id;
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
