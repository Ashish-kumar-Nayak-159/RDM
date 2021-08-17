import { ToasterService } from './../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { HttpErrorResponse } from '@angular/common/http';
declare var $: any;
@Component({
  selector: 'app-asset-model-rules',
  templateUrl: './asset-model-rules.component.html',
  styleUrls: ['./asset-model-rules.component.css']
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
  constructor(
    private assetModelService: AssetModelService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) { }

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

  onToggleRows(i, rule) {
    if (this.toggleRows[this.selectedTab + '_' + i]) {
        this.toggleRows = {};
    } else {
        this.toggleRows = {};
        this.toggleRows[this.selectedTab + '_' + i] = true;
        this.isEdit = true;
        this.ruleData = rule;
    }
  }

  getRules() {
    this.rules = [];
    this.isRulesLaoading = true;
    const obj = {
      type: this.selectedTab
    };
    this.subscriptions.push(this.assetModelService.getRules(this.contextApp.app, this.assetModel.name, obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.rules = response.data;
        }
        this.isRulesLaoading = false;
      }, error => this.isRulesLaoading = false
    ));
  }

  deployRule(rule) {
    this.ruleData = rule;
    this.isDeleteRuleLoading = true;
    const obj = {
      deployed_by: this.userData.email + ' (' + this.userData.name + ')'
    };
    console.log(this.ruleData);
    console.log(obj);
    this.assetModelService.deployCloudModelRule(this.contextApp.app, this.assetModel.name, this.ruleData.rule_id, obj)
    .subscribe((response: any) => {
      this.onCloseDeleteModal();
      this.getRules();
      this.isDeleteRuleLoading = false;
      this.toasterService.showSuccess(response.message, 'Deploy Rule');
    }, (err: HttpErrorResponse) => {
      this.isDeleteRuleLoading = false;
      this.toasterService.showSuccess(err.message, 'Deploy Rule');
      this.onCloseDeleteModal();
    });
  }

  onDeleteRule(rule) {
    this.selectedrule = rule;
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  deleteRule() {
    this.ruleData = this.selectedrule;
    this.isDeleteRuleLoading = true;
    const method = this.ruleData.type === 'Edge' ? this.assetModelService.deleteEdgeModelRule(this.contextApp.app, this.ruleData.rule_id, 'model', this.ruleData.updated_by, this.assetModel.name) :
    this.assetModelService.deleteCloudModelRule(this.contextApp.app, this.ruleData.rule_id, 'model', this.ruleData.updated_by, this.assetModel.name)
    method.subscribe((response: any) => {
      this.onCloseDeleteModal();
      this.toggleRows = {};
      this.getRules();
      this.isDeleteRuleLoading = false;
      this.toasterService.showSuccess(response.message, 'Delete Rule');
    }, (err: HttpErrorResponse) => {
      this.isDeleteRuleLoading = false;
      this.toasterService.showSuccess(err.message, 'Delete Rule');
      this.onCloseDeleteModal();
    });
  }

  onCloseDeleteModal() {
    $('#confirmMessageModal').modal('hide');
    this.isDeleteRuleLoading = false;
  }

  onCloseRuleModel(event) {
    this.isAddRule = false;
    if (event.status) {
      this.getRules();
    }
    this.isEdit = false;
    this.ruleData = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
