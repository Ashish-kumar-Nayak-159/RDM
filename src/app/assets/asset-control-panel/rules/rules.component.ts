import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { HttpErrorResponse } from '@angular/common/http';
declare var $: any;

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {

  @Input() asset: Asset = new Asset();
  rules: any[] = [];
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
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

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
    this.isRulesLoading = true;
    const obj = {
      type: this.selectedTab
    };
    this.subscriptions.push(this.assetService.getRules(this.contextApp.app, this.asset.asset_id, obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.rules = response.data;
          console.log(this.rules);
        }
        this.isRulesLoading = false;
      }, error => this.isRulesLoading = false
    ));
  }

  onCloseRuleModel(event) {
    this.isAddRule = false;
    if (event.status) {
      this.getRules();
    }
    this.isEdit = false;
    this.ruleData = undefined;
  }

  deployRule(rule) {
    this.ruleData = rule;
    this.isDeleteRuleLoading = true;
    const obj = {
      deployed_by: this.userData.email + ' (' + this.userData.name + ')'
    };
    console.log(this.ruleData);
    console.log(obj);
    this.assetService.deployCloudAssetRule(this.contextApp.app, this.asset.asset_id, this.ruleData.rule_id, obj)
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
    const method = this.ruleData.type === 'Edge' ? this.assetService.deleteEdgeAssetRule(this.contextApp.app, this.ruleData.rule_id, 'asset', this.ruleData.updated_by, this.asset.asset_id) :
    this.assetService.deleteCloudAssetRule(this.contextApp.app, this.ruleData.rule_id, 'asset', this.ruleData.updated_by, this.asset.asset_id)
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

