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
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.onTabClick('Cloud');
  }



  addRule() {
    this.isAddRule = true;
    // this.toasterService.showWarning('Work in Progress', 'Add ' + this.selectedTab + ' Rule');
  }

  onTabClick(type) {
    if (type === 'Cloud') {
      this.rulesTableConfig = {
        type: 'Rules',
        tableHeight: 'calc(100vh - 11rem)',
        data: [
          {
            name: 'Name',
            key: 'name',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'Category',
            key: 'rule_category',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'Type',
            key: 'type',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'Actions',
            key: undefined,
            type: 'button',
            headerClass: 'w-10',
            btnData: [
              // {
              //   icon: 'fa fa-fw fa-eye',
              //   text: '',
              //   id: 'View JSON Model',
              //   valueclass: '',
              //   tooltip: 'View JSON Model'
              // },
              {
                icon: 'fa fa-fw fa-edit',
                text: '',
                id: 'Edit',
                valueclass: '',
                tooltip: 'Edit',
                disableConditions: {
                  key: 'freezed',
                  value: true
                }
              },
              {
                icon: 'fa fa-fw fa-trash',
                text: '',
                id: 'Delete',
                valueclass: '',
                tooltip: 'Delete',
                disableConditions: {
                  key: 'freezed',
                  value: true
                }
              },
              {
                icon: 'fa fa-fw fa-sync',
                text: '',
                id: 'Deploy',
                valueclass: '',
                tooltip: 'Deploy',
                disableConditions: {
                  key: 'freezed',
                  value: true
                }
              }
            ]
          }
        ]
      };
    } else {
      this.rulesTableConfig = {
        type: 'Rules',
        tableHeight: 'calc(100vh - 11rem)',
        data: [
          {
            name: 'Name',
            key: 'name',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'Category',
            key: 'rule_category',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'Type',
            key: 'type',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'Actions',
            key: undefined,
            type: 'button',
            headerClass: 'w-10',
            btnData: [
              // {
              //   icon: 'fa fa-fw fa-eye',
              //   text: '',
              //   id: 'View JSON Model',
              //   valueclass: '',
              //   tooltip: 'View JSON Model'
              // },
              {
                icon: 'fa fa-fw fa-edit',
                text: '',
                id: 'Edit',
                valueclass: '',
                tooltip: 'Edit',
                disableConditions: {
                  key: 'freezed',
                  value: true
                }
              },
              {
                icon: 'fa fa-fw fa-trash',
                text: '',
                id: 'Delete',
                valueclass: '',
                tooltip: 'Delete',
                disableConditions: {
                  key: 'freezed',
                  value: true
                }
              }
            ]
          }
        ]
      };
    }
    this.selectedTab = type;
    this.getRules();
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

  onTableFunctionCall(event) {
    this.ruleData = event.data;
    console.log(event);
    if (event.for === 'Delete') {
      console.log('hereeeeeeeee');
      $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
      return;
    } else if (event.for === 'Deploy') {
      this.deployRule();
      return;
    }
    this.isEdit = event.for === 'Edit' ? true : false;
    this.isAddRule = true;
    // this.toasterService.showWarning('Work in Progress', 'Manage ' + this.selectedTab + ' Rule');
  }

  deployRule() {
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

  deleteRule() {
    this.isDeleteRuleLoading = true;
    const method = this.ruleData.type === 'Edge' ? this.assetService.deleteEdgeAssetRule(this.contextApp.app, this.ruleData.rule_id, 'asset', this.ruleData.updated_by, this.asset.asset_id) :
    this.assetService.deleteCloudAssetRule(this.contextApp.app, this.ruleData.rule_id, 'asset', this.ruleData.updated_by, this.asset.asset_id)
    method.subscribe((response: any) => {
      this.onCloseDeleteModal();
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

