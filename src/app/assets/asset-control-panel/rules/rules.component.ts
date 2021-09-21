import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
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
  rulesTableConfig: any;
  isRulesLoading = false;
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
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.onTabClick('Cloud');
    this.isAddRule = false;
  }

  addRule() {
    this.selectedTab = '';
    this.isEdit = false;
    this.ruleData = {};
    this.isAddRule = true;
  }

  onTabClick(type) {
    this.isAddRule = false;
    this.selectedTab = type;
    this.toggleRows = {};
    this.getRules();
  }

  onToggleRows(i, rule, type, isView = false, isEdit = false) {
    if (this.toggleRows[this.selectedTab + '_' + type + '_' + i]) {
      this.toggleRows = {};
    } else {
      this.toggleRows = {};
      this.toggleRows[this.selectedTab + '_' + type + '_' + i] = true;
      this.isEdit = isEdit;
      this.isView = isView;
      this.ruleData = rule;
    }
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
              if (rule.source === 'Model') {
                this.modelrules.push(rule);
              } else {
                this.assetRules.push(rule);
              }
            });
            console.log(this.modelrules);
          }
          this.isRulesLoading = false;
        },
        (error) => (this.isRulesLoading = false)
      )
    );
  }

  onCloseRuleModel(event) {
    this.isAddRule = false;
    if (event.status) {
      this.onTabClick('Cloud');
    }
    this.toggleRows = {};
    this.isView = false;
    this.isEdit = false;
    this.ruleData = undefined;
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
    this.assetService
      .deployCloudAssetRule(this.contextApp.app, this.asset.asset_id, this.ruleData.rule_id, obj)
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
    console.log(this.ruleData);
    this.isDeleteRuleLoading = true;
    const obj = {
      is_revert: isRevert,
    };
    const bodyObj = {
      asset_id: this.asset.asset_id,
      message: {
        command: 'set_asset_rules',
        rules: [],
      },
      app: this.contextApp.app,
      timestamp: moment().unix(),
      acknowledge: 'Full',
      expire_in_min: 2880,
      job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
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
    this.selectedrule = rule;
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
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
        this.toasterService.showSuccess(err.message, 'Delete Rule');
        this.onCloseDeleteModal();
      }
    );
  }

  onCloseDeleteModal() {
    $('#confirmMessageModal').modal('hide');
    this.isDeleteRuleLoading = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
