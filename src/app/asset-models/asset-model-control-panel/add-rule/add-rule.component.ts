import { AssetService } from 'src/app/services/assets/asset.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { Component, Input, OnInit, Output } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { AlertCondition, Conditions, Rule } from './add-rule.model';
declare var $: any;

@Component({
  selector: 'app-add-rule',
  templateUrl: './add-rule.component.html',
  styleUrls: ['./add-rule.component.css']
})
export class AddRuleComponent implements OnInit {

  @Input() isModel: any;
  @Input() asset: any;
  @Input() name: any;
  @Input() isEdit: any;
  @Input() isView = false;
  @Input() ruleData: any;
  @Output() onCloseRuleModel: EventEmitter<any> = new EventEmitter<any>();
  ruleModel: Rule = new Rule();
  contextApp: any;
  userData: any;
  propertyList: any[] = [];
  dropdownPropList: any[] = [];
  alertConditionList: any[] = [];
  isUpdateApiCall = false;
  selectedAlertCondition: AlertCondition = new AlertCondition();
  title = 'Create';
  operatorList = [
    { id: 'GREATEROREQUAL', value: '>=' },
    { id: 'LESSOREQUAL', value: '<=' },
    { id: 'LESS', value: '<' },
    { id: 'GREATER', value: '>' },
    { id: 'EQUAL', value: '=' }
  ]
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private assetModelService: AssetModelService,
    private assetService: AssetService) { }

  ngOnInit(): void {
    this.title = this.isEdit ? 'Update' : 'Create';
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    $('#addRuleModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.addNewCondition();
    this.getAssetsModelProperties();
    if (this.isEdit) {
      this.configureData();
    } else {
      this.getAlertConditions('Cloud');
    }
  }

  configureData() {
    this.ruleModel.rule_id = this.ruleData.rule_id;
    this.ruleModel.name = this.ruleData.name;
    this.ruleModel.operator = this.ruleData.operator;
    this.ruleModel.code = this.ruleData.code;
    this.ruleModel.description = this.ruleData.description;
    this.ruleModel.aggregation_window_in_sec = this.ruleData.aggregation_window_in_sec;
    this.ruleModel.alert_condition_code = this.ruleData.alert_condition_code;
    this.ruleModel.alert_condition_id = this.ruleData.alert_condition_id;
    this.ruleModel.condition_str = this.ruleData.metadata.condition_str;
    if ( this.ruleData.type === 'Edge') {
      this.ruleModel.conditions = JSON.parse(this.ruleData.metadata.conditions);
    } else {
      this.ruleModel.conditions = this.ruleData.condition;
    }
    this.ruleModel.created_by = this.ruleData.created_by;
    this.ruleModel.escalation_time_in_sec = this.ruleData.escalation_time_in_sec;
    this.ruleModel.properties = this.ruleData.properties;
    this.ruleModel.aggregation_enabled = this.ruleData.aggregation_enabled;
    this.ruleModel.updated_by = this.ruleData.updated_by;
    this.ruleModel.rule_type = this.ruleData.type === 'Edge' ? true : false;
    this.getAlertConditions(this.ruleData.type);
  }

  getAssetsModelProperties() {
    let obj = {
      app: this.contextApp.app,
      name: this.asset ? this.asset.tags.asset_model : this.name
    }
    this.assetModelService.getAssetsModelProperties(obj).subscribe((response: any) => {
      response.properties?.measured_properties.forEach(prop => prop.type = 'Measured Properties');
      this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
      response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
      response.properties.derived_properties.forEach(prop => {
        prop.type = 'Derived Properties';
        this.propertyList.push(prop);
      });
      this.dropdownPropList = [];
      this.propertyList.forEach(prop => {
        this.dropdownPropList.push({
          id: prop.name,
          type: prop.type,
          json_key: prop.json_key,
          value: prop
        });
      });
      this.dropdownPropList = JSON.parse(JSON.stringify(this.dropdownPropList));
    });
  }

  getAlertConditions(alert_type) {
    let obj = {
      asset_model: this.asset ? this.asset.tags.asset_model : this.name,
      alert_type: alert_type
    }
    this.assetModelService.getAlertConditions(this.contextApp.app, obj).subscribe((response: any) => {
      response.data.forEach(element => element.type = 'Model Alert Conditions');
      this.alertConditionList = response.data;
      this.onChangeOfAssetCondition();
      if (this.asset) {
        let obj1 = {
          asset_id: this.asset.asset_id,
          alert_type: alert_type
        };
        this.assetService.getAlertConditions(this.contextApp.app, obj1).subscribe((response: any) => {
          response.data.forEach(item => {
            item.type = 'Asset Alert Conditions';
            this.alertConditionList.push(item);
          });
          this.alertConditionList = JSON.parse(JSON.stringify(this.alertConditionList));
          this.onChangeOfAssetCondition();
        });
      }
    });


  }

  onSwitchValueChange(event) {
    this.getAlertConditions(event ? 'Edge' : 'Cloud');
    this.ruleModel.rule_type = event;
  }

  onChangeOfAssetCondition() {
    let alertCondition = this.alertConditionList.find(condition => condition.code == this.ruleModel.alert_condition_code);
    this.selectedAlertCondition = alertCondition;
    // this.selectedAlertCondition.actions.email = alertCondition.actions.email.enabled;
    // this.selectedAlertCondition.actions.sms = alertCondition.actions.sms.enabled;
    // this.selectedAlertCondition.actions.whatsapp = alertCondition.actions.whatsapp.enabled;
  }

  closeRuleModal(status) {
    this.onCloseRuleModel.emit({
      status: status
    });
    $('#addRuleModal').modal('hide');
    this.isEdit = false;
  }

  onChangeTimeAggregation(event) {
    if (!event) {
      this.ruleModel.aggregation_window_in_sec = undefined;
    } else {
      this.ruleModel.aggregation_window_in_sec = '300';
    }
  }

  addNewCondition() {
    let condition = {
      property: '',
      operator: '',
      threshold: 0,
      aggregation_type: ''
    }
    this.ruleModel.conditions.push(condition);
  }

  deleteCondition(index) {
    this.ruleModel.conditions.splice(index, 1);
  }

  createNewRule() {
    console.log(this.ruleModel);
    if (!this.ruleModel.alert_condition_code || !this.ruleModel.name || !this.ruleModel.description || !this.ruleModel.code
      || !this.ruleModel.operator  || !this.ruleModel.escalation_time_in_sec ) {
        this.toasterService.showError('Please fill all required details', 'Add Rule');
      }
    this.isUpdateApiCall = true;
    let str = '';
    this.ruleModel.properties = [];
    this.ruleModel.conditions.forEach(element => {
      str += ' %' + element.property + '% ' + this.findOperator(element.operator) + ' ' + element.threshold + ' ' + this.ruleModel.operator;
      let prop = this.dropdownPropList.find(p => p.value.json_key == element.property);
      this.ruleModel.properties.push({ property: prop.value.json_key, type: prop.type.charAt(0).toLowerCase() });
    })
    this.ruleModel.condition_str = str.slice(0, -2).trim();
    this.ruleModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
    if (this.isEdit) {
      this.ruleModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
      let method;
      if (!this.asset) {
        method = !this.ruleModel.rule_type ? this.assetModelService.updateCloudModelRule(this.contextApp.app, this.name, this.ruleModel) :
        this.assetModelService.updateEdgeModelRule(this.contextApp.app, this.name, this.ruleModel);
      } else {
        method = !this.ruleModel.rule_type ? this.assetService.updateCloudAssetRule(this.contextApp.app, this.name, this.ruleModel) :
        this.assetService.updateEdgeAssetRule(this.contextApp.app, this.name, this.ruleModel);
      }
      method.subscribe((response: any) => {
        this.onCloseRuleModel.emit({
          status: true
        });
        this.toasterService.showSuccess(response.message, this.title + 'Rule');
        this.closeRuleModal(true);
        this.isUpdateApiCall = false;
      }, (err: HttpErrorResponse) => {
        this.isUpdateApiCall = false;
        this.toasterService.showError(err.message, this.title + 'Rule');
      });
    } else {
      let method;
      if (!this.asset) {
      method = !this.ruleModel.rule_type ? this.assetModelService.createNewCloudModelRule(this.contextApp.app, this.name, this.ruleModel) :
      this.assetModelService.createNewEdgeModelRule(this.contextApp.app, this.name, this.ruleModel);
      } else {
        method = !this.ruleModel.rule_type ? this.assetService.createNewCloudAssetRule(this.contextApp.app, this.name, this.ruleModel) :
      this.assetService.createNewEdgeAssetRule(this.contextApp.app, this.name, this.ruleModel);
      }
      method.subscribe((response: any) => {
        this.onCloseRuleModel.emit({
          status: true
        });
        this.toasterService.showSuccess(response.message, this.title + 'Rule');
        this.closeRuleModal(true);
        this.isUpdateApiCall = false;
      }, (err: HttpErrorResponse) => {
        this.isUpdateApiCall = false;
        this.toasterService.showError(err.message, this.title + 'Rule');
      });
    }
  }

  findOperator(id) {
    return this.operatorList.find(optr => optr.id === id).value;
  }



}
