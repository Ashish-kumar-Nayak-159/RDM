import { AssetService } from 'src/app/services/assets/asset.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Component, Input, OnInit, Output } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { AlertCondition, Rule } from './add-rule.model';
import { ApplicationService } from 'src/app/services/application/application.service';
import { Subscription } from 'rxjs';
import { debugOutputAstAsTypeScript } from '@angular/compiler';
declare var $: any;

@Component({
  selector: 'app-add-rule',
  templateUrl: './add-rule.component.html',
  styleUrls: ['./add-rule.component.css'],
})
export class AddRuleComponent implements OnInit {
  @Input() isModel: any;
  @Input() asset: any;
  @Input() name: any;
  @Input() isEdit: any;
  @Input() isCloneEdit: any;
  @Input() isClone: any;
  @Input() isView = false;
  @Input() ruleData: any;
  @Output() onCloseRuleModel: EventEmitter<any> = new EventEmitter<any>();
  ruleModel: Rule = new Rule();
  contextApp: any;
  userData: any;
  addRuleCondition:any;
  propertyList: any[] = [];
  dropdownPropList: any[] = [];
  alertConditionList: any[] = [];
  isUpdateApiCall = false;
  isRulesLoading = false;
  slaveData: any[] = [];
  selectedAlertCondition: AlertCondition = new AlertCondition();
  rules: any[] = [];
  data_type : any;
  selectedRule: Rule = new Rule();
  title = 'Create';
  operatorList = [
    { id: 'GREATEROREQUAL', value: '>=' },
    { id: 'LESSOREQUAL', value: '<=' },
    { id: 'LESS', value: '<' },
    { id: 'GREATER', value: '>' },
    { id: 'EQUAL', value: '==' },
  ];
  operatorList1 = [
    { id: 'NOTEQUAL', value: '!=' },
    { id: 'EQUAL', value: '==' },
  ];
  operatorList2 = [
    { id: 'NOTEQUAL', value: '!=' },
    { id: 'EQUAL', value: '==' },
    { id: 'STARTSWITH', value: 'StartsWith' },
    { id: 'NOTSTARTSWITH', value: '!StartsWith' },
    { id: 'ENDSWITH', value: 'EndsWith' },
    { id: 'NOTENDSWITH', value: '!EndsWith' },
    { id: 'CONTAINS', value: 'Contains' },
    { id: 'NOTCONTAINS', value: '!Contains' },
  ];
  userGroups: any[] = [];
  subscriptions: Subscription[] = [];
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private assetModelService: AssetModelService,
    private assetService: AssetService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.title = this.isEdit ? 'Update' : 'Create';
    this.title = this.isCloneEdit ? 'Clone' : '';
    this.addRuleCondition = this.commonService.getItemFromLocalStorage("model_item").toString().substring(1,this.commonService.getItemFromLocalStorage("model_item").toString().length-1);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.getSlaveData();
    this.DefaultRuleModelSetup();
    $('#addRuleModal').modal({ backdrop: 'static', keyboard: false, show: true });
   // this.addNewCondition();
    this.getAssetsModelProperties();
    if (this.isEdit || this.isView) {
      this.configureData();
    } else {
      this.getAlertConditions('Cloud');
    }
    if (this.isClone) {
      this.getRules();
    }
    this.getApplicationUserGroups();    
  }

  private DefaultRuleModelSetup() {
    if (!this.ruleModel.actions) {
      this.ruleModel.actions = {
        alert_management: { enabled: false, alert_condition_code: null },
        notification: { enabled: false, email: { subject: null, body: null, groups: [] } },
        asset_control: { enabled: false, disable: false },
      };
    }
    if (!this.ruleModel.actions.alert_management) {
      this.ruleModel.actions.alert_management = { enabled: false, alert_condition_code: null };
    }
    if (!this.ruleModel.actions.alert_management.alert_condition_code) {
      this.ruleModel.actions.alert_management.alert_condition_code = null;
    }
    if (!this.ruleModel.actions.notification) {
      this.ruleModel.actions.notification = { enabled: false, email: { subject: null, body: null, groups: [] } };
    }
    if (!this.ruleModel.actions.notification.email) {
      this.ruleModel.actions.notification.email = { subject: null, body: null, groups: [] };
    }
    if (!this.ruleModel.actions.notification.email.groups) {
      this.ruleModel.actions.notification.email.groups = [];
    }
    if (!this.ruleModel.actions.asset_control) {
      this.ruleModel.actions.asset_control = { enabled: false, disable: false };
    }
    $('#addRuleModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.addNewCondition();
    this.getAssetsModelProperties();
    if (this.isEdit || this.isView) {
      this.configureData();
    } else {
      this.getAlertConditions('Cloud');
    }
    if (this.isClone) {
      this.getRules();
    }
    this.getApplicationUserGroups();  
    if(this.ruleModel.type==='Cloud')
    {
      this.ruleModel.rules_type = false;   
    }
  }
  getRuleType()
  {
    this.ruleModel.rule_type = $('#kpixruleType option:selected').val();
  }
  getSlaveData() {
    this.slaveData = [];
    const filterObj = {};
    this.subscriptions.push(
      this.assetModelService
        .getModelSlaveDetails(this.contextApp.app, this.asset ? this.asset.tags.asset_model : this.name, filterObj)
        .subscribe((response: any) => {
          if (response?.data) {
            this.slaveData = response.data;
          }
        })
    );
  }

  getApplicationUserGroups() {
    this.userGroups = [];
    this.subscriptions.push(
      this.applicationService.getApplicationUserGroups(this.contextApp.app).subscribe((response: any) => {
        if (response && response.data) {
          this.userGroups = response.data;
        }
        this.userGroups.splice(0, 0, {
          group_name: 'Client Field Support',
        });
        this.ruleModel.actions = {
          ...this.ruleModel?.actions,
          notification: {
            ...this.ruleModel?.actions?.notification,
            email: {
              ...this.ruleModel?.actions?.notification?.email,
              groups: this.ruleModel?.actions?.notification?.email?.groups?.filter(v => this.userGroups.map(ug => ug.group_name).includes(v))
            }
          }
        }
      })
    );
  }

  async getRules() {
    this.isRulesLoading = true;
    this.rules = [];
    let method;
    if (this.asset) {
      const obj: any = {};
      obj.type =  this.ruleModel.rules_type ? 'Edge' : 'Cloud';
      obj.source = 'Asset';
      method = this.assetService.getRules(this.contextApp.addNewConditionapp, this.asset.asset_id, obj);
    } else {
      const asset_model = this.asset ? this.asset.tags.asset_model : this.name;
      const obj: any = {};
      obj.type =  this.ruleModel.rules_type ? 'Edge' : 'Cloud';
      method = this.assetModelService.getRules(this.contextApp.app, asset_model, obj);
    }

    this.subscriptions.push(
      method.subscribe((response: any) => {
        if (response?.data) {
          this.rules = response.data;
          this.isRulesLoading = false;
        }
      })
    );
  }

  onChangeOfRule() {
    const rule = this.rules.find((rule) => rule.code === this.ruleModel.rule_code);
    this.ruleData = rule;
    delete this.ruleData.rule_id;
    this.configureData();
  }

  configureData() {
    
    if (this.ruleData.rule_id) {
      this.ruleModel.rule_id = this.ruleData.rule_id;
    }
    this.ruleModel.name = this.ruleData.name;
    this.ruleModel.operator = this.ruleData.operator;
    this.ruleModel.code = this.ruleData.code;
    this.ruleModel.description = this.ruleData.description;
    this.ruleModel.aggregation_window_in_sec = this.ruleData.aggregation_window_in_sec;
    this.ruleModel.alert_condition_id = this.ruleData.alert_condition_id;
    this.ruleModel.condition_str = this.ruleData.metadata.condition_str;
    this.ruleModel.rule_category = "Stream Analytics";
    if (this.ruleData.type === 'Edge') {
      this.ruleModel.conditions = JSON.parse(this.ruleData.metadata.conditions);
       } else {
      this.ruleModel.conditions = this.ruleData.condition;
    }
    this.ruleModel.created_by = this.ruleData.created_by;
    if (this.ruleData?.metadata?.sid)
    this.ruleModel.metadata.sid = this.ruleData.metadata.sid;
    this.ruleModel.escalation_time_in_sec = this.ruleData.escalation_time_in_sec;
    this.ruleModel.properties = this.ruleData.properties;
    this.ruleModel.aggregation_enabled = this.ruleData.aggregation_enabled;
    this.ruleModel.updated_by = this.ruleData.updated_by;
    this.ruleModel.rules_type = this.ruleData.type === 'Edge' ? true : false;
    this.ruleModel.type = this.ruleData.type;
    this.ruleModel.category_type = this.ruleData.rule_category === 'Stream Analytics' ? false : true;
    this.getAlertConditions(this.ruleData.type);
    if (!this.ruleData.actions || Object.keys(this.ruleData.actions).length === 0) {
      this.ruleModel.actions = {
        alert_management: { enabled: false, alert_condition_code: '' },
        notification: { enabled: false, email: { subject: '', body: '', groups: [] } },
        asset_control: { enabled: false, disable: false },
      };
    } else {
      this.ruleModel.actions = this.ruleData.actions;
    }
    if (!this.ruleModel.actions.alert_management) {
      this.ruleModel.actions.alert_management = { enabled: false, alert_condition_code: null };
    }
    if (!this.ruleModel.actions.alert_management.alert_condition_code) {
      this.ruleModel.actions.alert_management.alert_condition_code = null;
    }
    if (!this.ruleModel.actions.notification) {
      this.ruleModel.actions.notification = { enabled: false, email: { subject: null, body: null, groups: [] } };
    }
    if (!this.ruleModel.actions.notification.email) {
      this.ruleModel.actions.notification.email = { subject: null, body: null, groups: [] };
    }
    if (!this.ruleModel.actions.notification.email.groups) {
      this.ruleModel.actions.notification.email.groups = [];
    }
    if (!this.ruleModel.actions.asset_control) {
      this.ruleModel.actions.asset_control = { enabled: false, disable: false };
    }
   
  }

  getAssetsModelProperties() {
    let obj = {
      app: this.contextApp.app,
      name: this.asset ? this.asset.tags.asset_model : this.name,
    };
    this.propertyList = [];
    this.assetModelService.getAssetsModelProperties(obj).subscribe((response: any) => {
      response.properties.measured_properties = response.properties.measured_properties
        ? response.properties.measured_properties
        : [];
      response.properties?.measured_properties?.forEach((prop) => (prop.type = 'Measured Properties'));
      this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
      response.properties.edge_derived_properties = response.properties.edge_derived_properties
        ? response.properties.edge_derived_properties
        : [];
      // response.properties.cloud_derived_properties = response.properties.cloud_derived_properties
      //   ? response.properties.cloud_derived_properties
      //   : [];
      if((this.ruleModel.category_type===undefined) || this.ruleModel.rules_type!==undefined && !this.ruleModel.rules_type)
      { 
        if(this.ruleModel.rules_type )
        {
          response.properties.edge_derived_properties.forEach((prop) => {
            prop.type = 'Edge Derived Properties';
            this.propertyList.push(prop);
         });
        }  
      }
      if((this.ruleModel.category_type===undefined && this.ruleModel.rules_type===undefined))
      {
        response.properties.edge_derived_properties.forEach((prop) => {
          prop.type = 'Edge Derived Properties';
          this.propertyList.push(prop);
       });
      
      }
      if(this.ruleModel.category_type!==undefined && !this.ruleModel.category_type && (
        this.ruleModel.rules_type==undefined || !this.ruleModel.rules_type))
      {
        if((this.ruleModel.category_type!==undefined && this.ruleModel.rules_type!==undefined && !this.ruleModel.category_type))
        {
        response.properties.edge_derived_properties.forEach((prop) => {
          prop.type = 'Edge Derived Properties';
          this.propertyList.push(prop);
        });
        response.properties?.cloud_derived_properties?.forEach((prop) => {
           prop.type = 'Cloud Derived Properties';
           this.propertyList.push(prop);
        });
       }
      }
      // response.properties.cloud_derived_properties.forEach((prop) => {
      //   prop.type = 'Cloud Derived Properties';
      //   this.propertyList.push(prop);
      // });
      this.dropdownPropList = [];
      this.propertyList.forEach((prop) => { 
         if (prop.data_type === 'String' || prop.data_type === 'Number' || prop.data_type === 'Boolean') { 
          if(!this.ruleModel?.metadata?.sid ||  prop?.metadata?.slave_id == this.ruleModel?.metadata?.sid){
                this.dropdownPropList.push({
                  id: prop.name,
                  type: prop.type,
                  json_key: prop.json_key,
                  value: prop,
                  });
                }
              }
         });
      this.dropdownPropList = JSON.parse(JSON.stringify(this.dropdownPropList));

    });
  }

  getPropertyName(id) {
    return this.propertyList.find((prop) => prop.json_key === id)?.name;
  }
  
  fillOperator(id)
  {
    this.getPropertyType(id);

  }
  getPropertyType(id) {
    this.data_type = this.propertyList.find((prop) => prop.json_key === id)?.data_type;
    return this.propertyList.find((prop) => prop.json_key === id)?.data_type;
  }


  getAlertConditions(alert_type) {
    let obj = {
      asset_model: this.asset ? this.asset.tags.asset_model : this.name,
      alert_type: alert_type,
    };
    this.assetModelService.getAlertConditions(this.contextApp.app, obj).subscribe((response: any) => {
      response.data.forEach((element) => (element.type = 'Model Alert Conditions'));
      this.alertConditionList = response.data;
      this.onChangeOfAssetCondition();
      if (this.asset) {
        let obj1 = {
          asset_id: this.asset.asset_id,
          alert_type: alert_type,
        };
        this.assetService.getAlertConditions(this.contextApp.app, obj1).subscribe((response: any) => {
          response.data.forEach((item) => {
            item.type = 'Asset Alert Conditions';

            this.alertConditionList.push(item);
          });
          this.alertConditionList = JSON.parse(JSON.stringify(this.alertConditionList));
          console.log("CheckingalertConditionList", JSON.stringify(this.alertConditionList ))

          this.onChangeOfAssetCondition();
        });
      }
    });
  }

  onChangeOfSendAlertCheckbox() {
    this.ruleModel.actions.alert_management.alert_condition_code = null;
  }
  onSlaveSelection()
  {
    this.getAssetsModelProperties();
  }

  onChangeOfSendEmailCheckbox() {
    this.ruleModel.actions.notification.email.groups = [];
    this.ruleModel.actions.notification.email.subject = null;
    this.ruleModel.actions.notification.email.body = null;
  }

  onChangeOfDisableAssetCheckbox() {
    if (this.ruleModel.actions.asset_control.enabled) {
      this.ruleModel.actions.asset_control.disable = true;
    } else {
      this.ruleModel.actions.asset_control.disable = false;
    }
  }

  onSwitchValueChange(event) {
    // this.ruleModel.rule_id ='';

    if(this.isClone)
    {
    this.ruleModel = new Rule();
    this.DefaultRuleModelSetup();
    this.addNewCondition();
    }
    this.ruleModel.rule_type = event;
    this.getAlertConditions(event ? 'Edge' : 'Cloud');
    this.getRules();    
    if(event)
    {
      this.ruleModel.category_type =  undefined ;
    }
    this.dropdownPropList = [];
    this.getAlertConditions(event ? 'Edge' : 'Cloud');
    this.getAssetsModelProperties();
    this.ruleModel.rules_type = event;
    this.ruleModel.actions.alert_management.enabled = event;
  }
  onRuleCategorySwitchChange(event) {
    this.dropdownPropList = [];
    this.ruleModel.rule_type= "THS";
    this.ruleModel.category_type = event;
    this.ruleModel.actions.alert_management.enabled = event;
  }
  onChangeOfAssetCondition() {
    let alertCondition = this.alertConditionList.find(
      (condition) => condition.code === this.ruleModel.actions.alert_management.alert_condition_code
    );
    this.selectedAlertCondition = alertCondition;
    // this.selectedAlertCondition.actions.email = alertCondition.actions.email.enabled;
    // this.selectedAlertCondition.actions.sms = alertCondition.actions.sms.enabled;
    // this.selectedAlertCondition.actions.whatsapp = alertCondition.actions.whatsapp.enabled;
  }

  closeRuleModal(status) {
    this.isCloneEdit = false;
    this.onCloseRuleModel.emit({
      status: status,
    });
    $('#addRuleModal').modal('hide');
    this.isEdit = false;
   }

  onChangeTimeAggregation(event) {
    this.ruleModel.aggregation_window_in_sec = null;
    this.ruleModel.conditions.forEach((condition) => {
      condition.aggregation_type = null;
    });
  }

  addNewCondition() {
    let condition = {
      property: null,
      operator: '',
      threshold: 0,
      aggregation_type: null,
      type:'',
      bolCon:true,
      strText:null,
    };
    this.ruleModel.conditions.push(condition);
  }

  deleteCondition(index) {
    this.ruleModel.conditions.splice(index, 1);
  }

  createNewRule() {
    this.ruleModel.rule_category = "Stream Analytics";
    if(this.ruleModel.category_type)
    {
       this.ruleModel.rule_category = "KPIX Analytics"
    }
    if (
      (!this.ruleModel.name ||
        !this.ruleModel.description ||
        !this.ruleModel.code ||
        !this.ruleModel.operator ||
        (!this.ruleModel.rules_type && !this.ruleModel.escalation_time_in_sec))
      || (
        this.ruleModel.name?.trim()?.length <= 0 ||
        this.ruleModel.description?.trim()?.length <= 0 ||
        this.ruleModel.code?.trim()?.length <= 0
      )
    ) {
      this.toasterService.showError('Please fill all required details', 'Add Rule');
      return;
    } else if (
      !this.ruleModel.actions.alert_management.enabled &&
      !this.ruleModel.actions.notification.enabled &&
      !this.ruleModel.actions.asset_control.disable
    ) {
      this.toasterService.showError('Please select any one of the actions', 'Add Rule');
      return;
    }
    this.isUpdateApiCall = true;
    let str = '';
    this.ruleModel.properties = [];
    // Note : Remove adding new rule to fix rule_Category
    this.ruleModel.rule_category = "Stream Analytics";
    this.ruleModel.conditions.forEach((element, index) => {
      let operator = this.findOperator(element.operator);
      if(this.data_type==='Number')
      {
        str +=
        ' %' +
        (index + 1) +
        '% ' +
        operator +
        ' ' +
        element.threshold +
        ' ' +
        this.ruleModel.operator;
      }
      if(this.data_type ==='Boolean')
      {
        str +=
        ' %' +
        (index + 1) +
        '% ' +
        operator +
        ' ' +
        element.bolCon +
        ' ' +
        this.ruleModel.operator;
      }
      if(this.data_type ==='String')
      {
        str +=
        ' %' +
        (index + 1) +
        '% ' +
        operator +
        ' ' +
        element.strText +
        ' ' +
        this.ruleModel.operator;
      }
      
      let prop = this.dropdownPropList.find((p) => p.value.json_key == element.property);
      element["type"] = prop.type === 'Cloud Derived Properties' ? 'cd' : prop.type === 'Edge Derived Properties' ? 'ed' : 'm',
      this.ruleModel.properties.push({
        property: prop.value.json_key,
        type: prop.type === 'Cloud Derived Properties' ? 'cd' : prop.type === 'Edge Derived Properties' ? 'ed' : 'm',
      });
    });
    this.ruleModel.condition_str = str.slice(0, -2).trim();
    this.ruleModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
    if (this.ruleModel.rule_id) {
      this.ruleModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
      let method;
      if (!this.asset) {
        method = !this.ruleModel.rules_type
          ? this.assetModelService.updateCloudModelRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetModelService.updateEdgeModelRule(this.contextApp.app, this.name, this.ruleModel);
      } else {
        method = !this.ruleModel.rules_type
          ? this.assetService.updateCloudAssetRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetService.updateEdgeAssetRule(this.contextApp.app, this.name, this.ruleModel);
      }
      method.subscribe(
        (response: any) => {
          // this.onCloseRuleModel.emit({
          //   status: true,
          // });
          // $('#addRuleModal').modal('hide');
          // this.isEdit = false;
          this.toasterService.showSuccess(response.message, this.title + 'Rule');
          this.closeRuleModal(true);
          this.isUpdateApiCall = false;
        },
        (err: HttpErrorResponse) => {
          this.isUpdateApiCall = false;
          this.toasterService.showError(err.message, this.title + 'Rule');
        }
      );
    } else {
      let method;
      if (!this.asset) {
        method = !this.ruleModel.rules_type
          ? this.assetModelService.createNewCloudModelRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetModelService.createNewEdgeModelRule(this.contextApp.app, this.name, this.ruleModel);
      } else {
        method = !this.ruleModel.rules_type
          ? this.assetService.createNewCloudAssetRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetService.createNewEdgeAssetRule(this.contextApp.app, this.name, this.ruleModel);
      }
      method.subscribe(
        (response: any) => {
          // this.onCloseRuleModel.emit({
          //   status: true,
          // });
          this.toasterService.showSuccess(response.message, this.title + 'Rule');
          this.closeRuleModal(true);
          this.isUpdateApiCall = false;
        },
        (err: HttpErrorResponse) => {
          this.isUpdateApiCall = false;
          this.toasterService.showError(err.message, this.title + 'Rule');
        }
      );
    }
  }
  cloneRules() {
    this.ruleModel.rule_category = "Stream Analytics";
    if(this.ruleModel.category_type)
    {
       this.ruleModel.rule_category = "KPIX Analytics"
    }
    if (
      (!this.ruleModel.name ||
        !this.ruleModel.description ||
        !this.ruleModel.code ||
        !this.ruleModel.operator ||
        (!this.ruleModel.rules_type && !this.ruleModel.escalation_time_in_sec))
      || (
        this.ruleModel.name?.trim()?.length <= 0 ||
        this.ruleModel.description?.trim()?.length <= 0 ||
        this.ruleModel.code?.trim()?.length <= 0
      )
    ) {
      this.toasterService.showError('Please fill all required details', 'Add Rule');
      return;
    } else if (
      !this.ruleModel.actions.alert_management.enabled &&
      !this.ruleModel.actions.notification.enabled &&
      !this.ruleModel.actions.asset_control.disable
    ) {
      this.toasterService.showError('Please select any one of the actions', 'Add Rule');
      return;
    }
    this.isUpdateApiCall = true;
    let str = '';
    this.ruleModel.properties = [];
    this.ruleModel.conditions.forEach((element, index) => {
      let operator = this.findOperator(element.operator);
      if(this.data_type==='Number')
      {
        str +=
        ' %' +
        (index + 1) +
        '% ' +
        operator +
        ' ' +
        element.threshold +
        ' ' +
        this.ruleModel.operator;
      }
      if(this.data_type ==='Boolean')
      {
        str +=
        ' %' +
        (index + 1) +
        '% ' +
        operator +
        ' ' +
        element.bolCon +
        ' ' +
        this.ruleModel.operator;
      }
      if(this.data_type ==='String')
      {
        str +=
        ' %' +
        (index + 1) +
        '% ' +
        operator +
        ' ' +
        element.strText +
        ' ' +
        this.ruleModel.operator;
      }
      let prop = this.dropdownPropList.find((p) => p.value.json_key == element.property);
      element["type"] = prop.type === 'Cloud Derived Properties' ? 'cd' : prop.type === 'Edge Derived Properties' ? 'ed' : 'm',
      this.ruleModel.properties.push({
        property: prop.value.json_key,
        type: prop.type === 'Cloud Derived Properties' ? 'cd' : prop.type === 'Edge Derived Properties' ? 'ed' : 'm',
      });
    });
    
    this.ruleModel.condition_str = str.slice(0, -2).trim();
    this.ruleModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.ruleModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    let method;
    
      method = !this.ruleModel.rules_type
         ? this.assetService.createNewCloudAssetRule(this.contextApp.app, this.name, this.ruleModel)
         : this.assetService.createNewEdgeAssetRule(this.contextApp.app, this.name, this.ruleModel);
      method.subscribe(
        (response: any) => {
          // this.onCloseRuleModel.emit({
          //   status: true,
          // });
          // $('#addRuleModal').modal('hide');
          // this.isEdit = false;
          this.toasterService.showSuccess(response.message, this.title + 'Rule');
          this.closeRuleModal(true);
          this.isUpdateApiCall = false;
        },
        (err: HttpErrorResponse) => {
          this.isUpdateApiCall = false;
          this.toasterService.showError(err.message, this.title + 'Rule');
        }
      );
   }
  createNewRule_timeThre() {
    this.ruleModel.rule_category = "Stream Analytics";
    if(this.ruleModel.category_type)
    {
       this.ruleModel.rule_category = "KPIX Analytics"
    }
  if (
      !this.ruleModel.actions.alert_management.enabled &&
      !this.ruleModel.actions.notification.enabled &&
      !this.ruleModel.actions.asset_control.disable
    ) {
      this.toasterService.showError('Please select any one of the actions', 'Add Rule');
      return;
    }
    this.isUpdateApiCall = true;
    let str = '';
    this.ruleModel.properties = [];
    this.ruleModel.conditions = [];
    this.ruleModel.conditions.push( {
      property: "PT_102",
      operator: "EQUAL",
      threshold: "m",
      aggregation_type:null,
      strText:null,
      bolCon:null,
  });
    
      this.ruleModel.properties.push({
        property: "PT_102",
        type: 'm',
      });
    this.ruleModel.operator ="&&";  
    this.ruleModel.condition_str = str.slice(0, -2).trim();
    this.ruleModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
    if (this.ruleModel.rule_id) {
      this.ruleModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
      let method;
      if (!this.asset) {
        method = !this.ruleModel.rules_type
          ? this.assetModelService.updateCloudModelRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetModelService.updateEdgeModelRule(this.contextApp.app, this.name, this.ruleModel);
      } else {
        method = !this.ruleModel.rules_type
          ? this.assetService.updateCloudAssetRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetService.updateEdgeAssetRule(this.contextApp.app, this.name, this.ruleModel);
      }
      method.subscribe(
        (response: any) => {
          // this.onCloseRuleModel.emit({
          //   status: true,
          // });
          // $('#addRuleModal').modal('hide');
          // this.isEdit = false;
          this.toasterService.showSuccess(response.message, this.title + 'Rule');
          this.closeRuleModal(true);
          this.isUpdateApiCall = false;
        },
        (err: HttpErrorResponse) => {
          this.isUpdateApiCall = false;
          this.toasterService.showError(err.message, this.title + 'Rule');
        }
      );
    } else {
      let method;
      if (!this.asset) {
        method = !this.ruleModel.rules_type
          ? this.assetModelService.createNewCloudModelRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetModelService.createNewEdgeModelRule(this.contextApp.app, this.name, this.ruleModel);
      } else {
        method = !this.ruleModel.rules_type
          ? this.assetService.createNewCloudAssetRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetService.createNewEdgeAssetRule(this.contextApp.app, this.name, this.ruleModel);
      }
      method.subscribe(
        (response: any) => {
          // this.onCloseRuleModel.emit({
          //   status: true,
          // });
          this.toasterService.showSuccess(response.message, this.title + 'Rule');
          this.closeRuleModal(true);
          this.isUpdateApiCall = false;
        },
        (err: HttpErrorResponse) => {
          this.isUpdateApiCall = false;
          this.toasterService.showError(err.message, this.title + 'Rule');
        }
      );
    }
  }
  findOperator(id) {
    if(this.data_type === 'Number')
    {
      return this.operatorList.find((optr) => optr.id === id).value;
    }
    if(this.data_type === 'Boolean')
    {
       return this.operatorList1.find((optr) => optr.id === id).value;
    }
    if(this.data_type === 'String')
    {
      return this.operatorList2.find((optr) => optr.id === id).value;
    }
  }
}