import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { HttpErrorResponse } from '@angular/common/http';
import * as datefns from 'date-fns';
import { FormControl, FormGroup, Validators } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css'],
})
export class RulesComponent implements OnInit {
  @Input() asset: Asset = new Asset();
  modelrules: any[] = [];
  assetRules: any[] = [];
  modeltoAssetrules:any [] = [];
  rulesTableConfig: any;
  isRulesLoading = false;
  contextApp: any;
  subscriptions: Subscription[] = [];
  selectedTab: any;
  isAddRule = false;
  isCloneRule = false;
  isEdit = false;
  isCloneEdit = false;
  ruleData: any;
  isDeleteRuleLoading = false;
  userData: any;
  decodedToken: any;
  toggleRows = {};
  selectedrule: any;
  isView = false;
  selectedAccrodionType = 'Asset';
  filteredRuleList : any = [];
  ruleMappingForm;
  isApiLoading : boolean = false;

  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.ruleMappingForm = new FormGroup({
      selectedRuleList: new FormControl("", [Validators.required]),
    });
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.onTabClick('Cloud');
    this.isAddRule = false;
    this.isCloneEdit = false;
    this.isCloneRule = false;
  }

  addRule() {
    this.selectedTab = '';
    this.isEdit = false;
    this.isCloneRule = false;
    this.ruleData = {};
    this.isAddRule = true;
    this.isCloneEdit = false;
  }

  onAccordionClick(type) {
    this.toggleRows = {};
    setTimeout(() => (this.selectedAccrodionType = type), 200);
  }

  accordionByCondition(val:any,str){
    if(val){
       this.onAccordionClick(str)
    }
  }
  
  cloneRule() {
    this.selectedTab = '';
    this.isEdit = false;
    this.isAddRule = false;
    this.ruleData = {};
    this.isCloneRule = true;
    this.isCloneEdit = false;
  }
 
  overRideRule(i, rule, type, isView = false, isEdit = true, isCloneEdit = true, action) {
    debugger
      this.onAccordionClick('Asset');
    if (this.toggleRows[this.selectedTab + '_' + type + '_' + i]) {
      if (action === 'toggle' || action === '') {
        this.toggleRows = {};
      }
    } else {
      this.toggleRows = {};
      this.toggleRows[this.selectedTab + '_' + type + '_' + i] = true;
    }
    delete rule["created_by"];
    delete rule["created_date"];
    delete rule["deployed_by"];
    delete rule["deployed_on"];
    delete rule["updated_by"];
    delete rule["updated_date"];
    this.modeltoAssetrules.push(rule);
    this.isEdit = isEdit;
    this.isView = isView;
    this.isCloneEdit = isCloneEdit;
    this.ruleData = rule;
  }
  
  onTabClick(type) {
    this.isAddRule = false;
    this.isCloneRule = false;
    this.selectedTab = type;
    this.toggleRows = {};
    this.getRules();
  }

  onToggleRows(i, rule, type, isView = false, isEdit = false, action) {
    if (this.toggleRows[this.selectedTab + '_' + type + '_' + i]) {
      if (action === 'toggle' || action === '') {
        this.toggleRows = {};
      }
    } else {
      this.toggleRows = {};
      this.toggleRows[this.selectedTab + '_' + type + '_' + i] = true;
    }
    this.isEdit = isEdit;
    this.isCloneEdit = false;
    this.isView = isView;
    this.ruleData = rule;
  }

  getRules() {
    this.modelrules = [];
    this.assetRules = [];
    this.isRulesLoading = true;
    const obj = {
      type: this.selectedTab,
    };
    this.subscriptions.push(
      this.assetService.getRules(this.contextApp.app, this.asset.asset_id, obj).subscribe(
        (response: any) => {
          if (response?.data) {
            // this.modelrules = response.data;
            response.data.forEach((rule) => {
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
              if (rule.source === 'Model') {
                this.modelrules.push(rule);
              } else {
                this.assetRules.push(rule);
              }
            });
            if (this.modelrules.length === 0) {
              this.selectedAccrodionType = 'Asset';
            }
          }
          this.isRulesLoading = false;
        },
        (error) => (this.isRulesLoading = false)
      )
    );
  }

  onCloseRuleModel(event) {
    this.isAddRule = false;
    this.isCloneRule = false;
    if (event.status) {
      this.onTabClick('Cloud');
    }
    this.toggleRows = {};
    this.isView = false;
    this.isEdit = false;
    this.ruleData = undefined;
    this.isCloneEdit = false;
  }

  deployRule(rule, isRevert = false) {
    this.ruleData = rule;
    this.isDeleteRuleLoading = true;
    const obj = {
      deployed_by: this.userData.email + ' (' + this.userData.name + ')',
      is_revert: isRevert,
    };
    this.assetService
      .deployCloudAssetRule(this.contextApp.app, this.asset.asset_id, this.ruleData.rule_id, obj)
      .subscribe(
        (response: any) => {
          this.onCloseDeleteModal();
          this.getRules();
          // this.toggleRows = {};
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
    this.assetService
      .deployCloudAssetRule(this.contextApp.app, this.asset.asset_id, this.ruleData.rule_id, obj)
      .subscribe(
        (response: any) => {
          this.onCloseDeleteModal();
          this.getRules();
          // this.toggleRows = {};
          this.isDeleteRuleLoading = false;
          this.toasterService.showSuccess(
            isRevert ? 'Rule Disabled successfully' : 'Rule Enabled successfully',
            isRevert ? 'Disable Rule' : 'Enable Rule'
          );
        },
        (err: HttpErrorResponse) => {
          this.isDeleteRuleLoading = false;
          this.toasterService.showError(err.message, isRevert ? 'Disable Rule' : 'Enable Rule');
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
        asset_id: this.asset.asset_id,
        command: isRevert ? 'delete_asset_rules' : 'set_asset_rules',
        rules: [],
      },
      asset_id: this.asset.asset_id,
      app: this.contextApp.app,
      timestamp: datefns.getUnixTime(new Date()),
      acknowledge: 'Full',
      expire_in_min: 2880,
      job_id: this.commonService.generateUUID(),
      request_type: 'Sync Rules',
      job_type: 'Message',
      sub_job_id: null,
      type: 'asset',
    };
    bodyObj.sub_job_id = bodyObj.job_id + '_1';
    if (isRevert) {
      bodyObj.message.rules = [rule.rule_id];
    } else {
      bodyObj.message.rules = [rule];
    }
    this.assetService
      .deployAssetEdgeRule(this.contextApp.app, this.asset.asset_id, rule.rule_id, bodyObj, obj)
      .subscribe(
        (response: any) => {
          this.onCloseDeleteModal();
          this.getRules();
          this.toggleRows = {};
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
        ? this.assetService.deleteEdgeAssetRule(
            this.contextApp.app,
            this.ruleData.rule_id,
            'asset',
            this.ruleData.updated_by,
            this.asset.asset_id
          )
        : this.assetService.deleteCloudAssetRule(
            this.contextApp.app,
            this.ruleData.rule_id,
            'asset',
            this.ruleData.updated_by,
            this.asset.asset_id
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
  async onMappingRule(rule,ruleType) {
    this.isApiLoading = false;
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.filteredRuleList = [];
    this.selectedrule = rule;
    if(this.selectedrule.link_rule_code && this.selectedrule.link_rule_code.length>0) {
      this.ruleMappingForm.get('selectedRuleList').setValue(this.selectedrule.link_rule_code);
    } else {
      this.ruleMappingForm.get('selectedRuleList').setValue(null);
    }
    this.ruleMappingForm.get('selectedRuleList').updateValueAndValidity();
    $('#RuleMappingModal').modal({ backdrop: 'static', keyboard: false, show: true });
    if(ruleType == 'assetRules') {
      //this.filteredRuleList = this.assetRules.filter((localRule)=> localRule.rule_id != rule.rule_id)
      let localAssetRules = this.assetRules.filter((localRule)=> localRule.rule_id != rule.rule_id)
      let localModelRules = this.modelrules.filter((localRule)=> localRule.rule_id != rule.rule_id)
      
      let codeList = [];
      localAssetRules.forEach((detail)=>{
        codeList.push(detail.code)
      });
      let localModelArray = [];
      localModelRules.forEach((detail)=>{
        if(codeList.indexOf(detail.code) <= -1) {
          localModelArray.push(detail);
        }
      })
      this.filteredRuleList = [...localAssetRules,...localModelArray]

    } else {
      this.filteredRuleList = this.modelrules.filter((localRule)=> localRule.rule_id != rule.rule_id)
    }
  }
  onCloseModal() {
    $('#RuleMappingModal').modal('hide');
  }
  onSaveModal(event) {
    this.isApiLoading = true;
    const obj = {
      rule_code : this.selectedrule.code,
      asset_id : this.asset.asset_id,
      link_rule_code : this.ruleMappingForm.get('selectedRuleList').value,
    }
    this.assetService.assetRuleMapping(obj).subscribe(
      (response: any) => {
        this.modelrules.map((detail)=>{
          if(detail.rule_id == this.selectedrule.rule_id) {
            detail.link_rule_code = obj.link_rule_code;
          }
          return detail;
        })
        this.isApiLoading = false;
        this.toasterService.showSuccess(response.message, 'Mapping Rule');
        this.onCloseModal();
      },
      (err) => {
        this.isApiLoading = false;
        this.toasterService.showError(err.message, 'Mapping Rule');
        this.onCloseModal();
      }
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
