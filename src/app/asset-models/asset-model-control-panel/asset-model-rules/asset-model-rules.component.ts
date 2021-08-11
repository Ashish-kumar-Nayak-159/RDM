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

  onClickOfTab(type) {
    if (type === 'Cloud') {
      this.rulesTableConfig = {
        type: 'Rules',
        tableHeight: 'calc(100vh - 11rem)',
        freezed: this.assetModel.freezed,
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
                privilege_key: 'RKPIM',
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
                privilege_key: 'RKPIM',
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
                privilege_key: 'RKPIM',
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
        freezed: this.assetModel.freezed,
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
                privilege_key: 'RKPIM',
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
                privilege_key: 'RKPIM',
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

  onTableFunctionCall(event) {
    this.ruleData = event.data;
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

  deleteRule() {
    this.isDeleteRuleLoading = true;
    const method = this.ruleData.type === 'Edge' ? this.assetModelService.deleteEdgeModelRule(this.contextApp.app, this.ruleData.rule_id, 'model', this.ruleData.updated_by, this.assetModel.name) :
    this.assetModelService.deleteCloudModelRule(this.contextApp.app, this.ruleData.rule_id, 'model', this.ruleData.updated_by, this.assetModel.name)
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

  addRule() {
    this.isAddRule = true;
    // this.toasterService.showWarning('Work in Progress', 'Add ' + this.selectedTab + ' Rule');
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
