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
  @Input() isCloneEdit : boolean = false;
  @Input() isClone: any;
  @Input() isView = false;
  @Input() ruleData: any;
  @Input() ruleTypee:any;
  @Output() onCloseRuleModel: EventEmitter<any> = new EventEmitter<any>();
  ruleModel: Rule = new Rule();
  contextApp: any;
  userData: any;
  addRuleCondition: any;
  propertyList: any[] = [];
  dropdownPropList: any[] = [];
  alertConditionList: any[] = [];
  isUpdateApiCall = false;
  isRulesLoading = false;
  slaveData: any[] = [];
  selectedAlertCondition: AlertCondition = new AlertCondition();
  rules: any[] = [];
  data_type: any;
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
  escalationTimeDropdown: { visibility: true; };
  typeRulesDropdown: { visibility: boolean; };
  overrideRuleMapping : boolean = false;
  serviceConnectionGroups: any[] = [];
  selectedServiceConnectionsGroup:any={
    'connections':[]
  }
  decodedToken: any;
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private assetModelService: AssetModelService,
    private assetService: AssetService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.title = this.isEdit ? 'Update' : 'Create';
    this.title = this.isCloneEdit ? 'Clone' : '';
    this.addRuleCondition = this.commonService.getItemFromLocalStorage("model_item").toString().substring(1, this.commonService.getItemFromLocalStorage("model_item").toString().length - 1);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.getSlaveData();
    this.DefaultRuleModelSetup();
    this.getEscalationTime();
    $('#addRuleModal').modal({ backdrop: 'static', keyboard: false, show: true });
    // this.addNewCondition();
    this.getAssetsModelProperties();
    if (this.isEdit || this.isView) {
      this.configureData();
    } else {
      this.ruleModel.escalation_time_in_sec = this.escalationTimeDropdown ? 300000000 : this.ruleModel.escalation_time_in_sec;
      this.getAlertConditions('Cloud');
    }
    if (this.isClone) {
      this.getRules();
    }
    this.getApplicationUserGroups();
    if(this.decodedToken?.privileges?.indexOf('SCV') > -1){
      this.getServiceConnectionGroups();
    }
  }

  getEscalationTime(){
        this.contextApp.menu_settings.miscellaneous_menu.forEach((item) => {
            if (item.page === 'escalationTime') {          
              this.escalationTimeDropdown = item.visible;
            }
            if (item.page === 'rulesType') {          
              this.typeRulesDropdown = item.visible;
            }
        });
  }

  private DefaultRuleModelSetup() {
    if (!this.ruleModel.actions) {
      this.ruleModel.actions = {
        alert_management: { enabled: false, alert_condition_code: null,severity:null },
        notification: { enabled: false, email: { subject: null, body: null, groups: [] } },
        asset_control: { enabled: false, disable: false },
      };
    }
    if (!this.ruleModel.actions.alert_management) {
      this.ruleModel.actions.alert_management = { enabled: false, alert_condition_code: null,severity:null };
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
    if (!this.ruleModel.actions.service_connection) {
      this.ruleModel.actions.service_connection = { enabled: false, connections: [] };
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
    this.ruleModel.isEdgeRule = this.ruleModel.type === 'Edge';
  }
  getRuleType() {
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
      obj.type = this.ruleModel.isEdgeRule ? 'Edge' : 'Cloud';
      obj.source = 'Asset';
      method = this.assetService.getRules(this.contextApp.addNewConditionapp, this.asset.asset_id, obj);
    } else {
      const asset_model = this.asset ? this.asset.tags.asset_model : this.name;
      const obj: any = {};
      obj.type = this.ruleModel.isEdgeRule ? 'Edge' : 'Cloud';
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
    this.ruleModel.condition_str = this.ruleData?.metadata?.condition_str;
    if (this.ruleData.type === 'Edge') {
      this.ruleModel.conditions = JSON.parse(this.ruleData.metadata.conditions);
    } else {
      this.ruleModel.conditions = this.ruleData.condition;
    }
    this.ruleModel.created_by = this.ruleData.created_by;
    if (this.ruleData?.metadata?.sid)
      this.ruleModel.metadata.sid = this.ruleData.metadata.sid;
    this.ruleModel.escalation_time_in_sec = this.ruleData?.escalation_time_in_sec;    
    this.ruleModel.properties = this.ruleData.properties;
    this.ruleModel.aggregation_enabled = this.ruleData.aggregation_enabled;
    this.ruleModel.updated_by = this.ruleData.updated_by;
    this.ruleModel.isEdgeRule = this.ruleData.type === 'Edge';
    this.ruleModel.type = this.ruleData.type;
    this.ruleModel.rule_type = this.ruleTypee;
    this.ruleModel.isKpixCategory = this.ruleData.rule_category === 'KPIX Analytics';
    this.getAlertConditions(this.ruleData.type);
    if (!this.ruleData.actions || Object.keys(this.ruleData.actions).length === 0) {
      this.ruleModel.actions = {
        alert_management: { enabled: false, alert_condition_code: '',severity:'' },
        notification: { enabled: false, email: { subject: '', body: '', groups: [] } },
        asset_control: { enabled: false, disable: false },
      };
    } else {
      this.ruleModel.actions = this.ruleData.actions;
    }
    if (!this.ruleModel.actions.alert_management) {
      this.ruleModel.actions.alert_management = { enabled: false, alert_condition_code: null,severity:null };
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

  getAssetsModelProperties(item:any = {}) {
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

      if (this.ruleModel.isEdgeRule === false) {
        response?.properties?.edge_derived_properties?.forEach((prop) => {
          prop.type = 'Edge Derived Properties';
          this.propertyList.push(prop);
        });
      }

      if (this.ruleModel.isEdgeRule === false && this.ruleModel.isKpixCategory) {
        response.properties?.cloud_derived_properties?.forEach((prop) => {
          prop.type = 'Cloud Derived Properties';
          this.propertyList.push(prop);
        });
      }
      let localDropDownPropList = [];
      this.dropdownPropList = [];
      this.propertyList.forEach((prop) => {
        if (prop.data_type === 'String' || prop.data_type === 'Number' || prop.data_type === 'Boolean') {
          if (!this.ruleModel?.metadata?.sid || (prop?.metadata?.slave_id == this.ruleModel?.metadata?.sid)) {
            localDropDownPropList.push({
              id: prop.name,
              type: prop.type,
              json_key: prop.json_key,
              value: prop,
            });
          }
        }
      });
      this.dropdownPropList = JSON.parse(JSON.stringify(localDropDownPropList));
    });
  }


  getPropertyName(id) {
    return this.propertyList.find((prop) => prop.json_key === id)?.name;
  }

  fillOperator(id) {
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
          var arrayOfID =  this.alertConditionList.map((item)=>{
            return item?.id
       })
          response.data.forEach((item,index) => {
            item.type = 'Asset Alert Conditions';
          if(!arrayOfID.includes(item?.id)){
            this.alertConditionList.push(item);
          }
          });
          this.alertConditionList = JSON.parse(JSON.stringify(this.alertConditionList));
          this.onChangeOfAssetCondition();
        });
      }
    });
  }

  getServiceConnectionGroups() {
    this.subscriptions.push(
      this.applicationService.getServiceConnection().subscribe((response: any) => {
        if (response && response.data) {
          this.serviceConnectionGroups=response.data;
          this.serviceConnectionGroups.forEach((element) => {
            element.type = this.organizeServiceConnectionsType(element.type);
          });
        }
      })
    );
  }

  organizeServiceConnectionsType(type) {
    if(type === 'Servicebus') {
      return 'Service Bus';
    }
    else{
      if(type === 'MicrosoftTeams') {
        return 'Microsoft Teams';
      }
      else{
        if(type === 'Webhook') {
          return 'Webhook';
        }
        else{
          if(type === 'Service Bus'){
            return 'Servicebus';
          }
          else{
            if(type === 'Microsoft Teams'){
              return 'MicrosoftTeams';
            }
            else{
              return "";
            }
          }
        }
      }
    }
  }

  onChangeOfSendAlertCheckbox() {
    this.ruleModel.actions.alert_management.alert_condition_code = null;
    this.ruleModel.actions.alert_management.severity = null;
  }
  onSlaveSelection(item) {
    this.ruleModel.conditions.map((detail)=>{
      detail.property = null;
      return detail;
    })
    this.getAssetsModelProperties(item);
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
  addserviceConnectionGroup(key){
    this.selectedServiceConnectionsGroup[key].forEach(connectionData => {
      const index = this.ruleModel.actions.service_connection.connections.findIndex((connection) => connection === connectionData.id);
      if (index > -1) {
        this.toasterService.showError('Same Service Connection is already added.', 'Add Service Connection');
        return;
      } else if (!connectionData.id) {
        this.toasterService.showError('Please select Service Connection to add', 'Add Service Connection');
        return;
      }
      if (connectionData.id && index === -1) {
        this.ruleModel.actions.service_connection.connections.splice(
          this.ruleModel.actions.service_connection.connections.length,
          0,
          connectionData.id
        );
      }
    });
    this.selectedServiceConnectionsGroup[key]=[];
  }
  removeServiceConnectionGroup(index) {
    this.ruleModel.actions.service_connection.connections.splice(index, 1);
  }
  onChangeOfServiceConnectionCheckbox(){
    this.ruleModel.actions.service_connection.connections = [];
  }

  onSwitchValueChange(event) {
    // this.ruleModel.rule_id ='';

    if (this.isClone) {
      this.ruleModel = new Rule();
      this.DefaultRuleModelSetup();
      this.addNewCondition();
    }
    this.ruleModel.rule_type = "THS";
    this.getAlertConditions(event ? 'Edge' : 'Cloud');
    this.getRules();
    if (event) {
      this.ruleModel.isKpixCategory = undefined;
    }
    this.dropdownPropList = [];
    this.getAlertConditions(event ? 'Edge' : 'Cloud');
    this.ruleModel.isEdgeRule = event;
    this.getAssetsModelProperties();
    this.ruleModel.actions.alert_management.enabled = event;
  }
  onRuleCategorySwitchChange(event) {
    this.dropdownPropList = [];
    this.ruleModel.rule_type = "THS";
    this.ruleModel.isKpixCategory = event;
    this.getAssetsModelProperties();
    this.ruleModel.actions.alert_management.enabled = event;

  }
  onChangeOfAssetCondition() {
    let alertCondition = this.alertConditionList.find(
      (condition) => condition.code === this.ruleModel.actions.alert_management.alert_condition_code
    );
    if(alertCondition)
    {
      this.ruleModel.actions.alert_management.severity =alertCondition.severity;
    }
    this.selectedAlertCondition = alertCondition;
    // this.selectedAlertCondition.actions.email = alertCondition.actions.email.enabled;
    // this.selectedAlertCondition.actions.sms = alertCondition.actions.sms.enabled;
    // this.selectedAlertCondition.actions.whatsapp = alertCondition.actions.whatsapp.enabled;
  }

  closeRuleModal(status) {
    this.isCloneEdit = false;
    if(this.overrideRuleMapping == true) {
      this.overrideRuleMapping = false;
      this.onCloseRuleModel.emit({
        status: status,
        selectedAssetModel:this.ruleModel,
        overrideRuleMapping:true,
      });
    } else {
      this.onCloseRuleModel.emit({
        status: status,
      });
    }

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
      type: '',
      bolCon: true,
      strText: null,
      newRuleForOverride:true
    };
    this.ruleModel.conditions.push(condition);
  }

  deleteCondition(index) {
    this.ruleModel.conditions.splice(index, 1);
  }

  createNewRule() {
    this.ruleModel.rule_category = this.ruleModel.isKpixCategory ? "KPIX Analytics" : "Stream Analytics";
    if (
      (!this.ruleModel.name ||
        !this.ruleModel.description ||
        !this.ruleModel.code ||
        !this.ruleModel.operator ||
        (!this.ruleModel.isEdgeRule && !this.ruleModel.escalation_time_in_sec))
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
      !this.ruleModel.actions.asset_control.disable &&
      !this.ruleModel.actions.service_connection.enabled
    ) {
      this.toasterService.showError('Please select any one of the actions', 'Add Rule');
      return;
    }
    this.isUpdateApiCall = true;
    let str = '';
    this.ruleModel.properties = [];
    // // Note : Remove adding new rule to fix rule_Category
    // this.ruleModel.rule_category = "Stream Analytics";
    this.ruleModel?.conditions?.forEach((element, index) => {
      let operator = this.findOperator(element.operator);
      if (this.data_type === 'Number') {
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
      if (this.data_type === 'Boolean') {
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
      if (this.data_type === 'String') {
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
      element["type"] = prop?.type === 'Cloud Derived Properties' ? 'cd' : (prop?.type === 'Edge Derived Properties' ? 'ed' : 'm'),
        this.ruleModel.properties.push({
          sid: prop?.value?.metadata?.slave_id,
          property: prop?.value?.json_key,
          type: prop?.type === 'Cloud Derived Properties' ? 'cd' : (prop?.type === 'Edge Derived Properties' ? 'ed' : 'm'),
        });
    });
    this.ruleModel.condition_str = str.slice(0, -2).trim();
    this.ruleModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
    if (this.ruleModel.rule_id) {
      this.ruleModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
      let method;
      this.ruleModel.isoverride = true;
      if (!this.asset) {
        method = !this.ruleModel.isEdgeRule
          ? this.assetModelService.updateCloudModelRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetModelService.updateEdgeModelRule(this.contextApp.app, this.name, this.ruleModel);
      } else {
        method = !this.ruleModel.isEdgeRule
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
      this.ruleModel.isoverride = false;
      if (!this.asset) {
        method = !this.ruleModel.isEdgeRule
          ? this.assetModelService.createNewCloudModelRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetModelService.createNewEdgeModelRule(this.contextApp.app, this.name, this.ruleModel);
      } else {
        method = !this.ruleModel.isEdgeRule
          ? this.assetService.createNewCloudAssetRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetService.createNewEdgeAssetRule(this.contextApp.app, this.name, this.ruleModel);
      }
      method.subscribe(
        (response: any) => {
          this.overrideRuleMapping = true;
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
    this.ruleModel.rule_category = this.ruleModel.isKpixCategory ? "KPIX Analytics" : "Stream Analytics";
    if (
      (!this.ruleModel.name ||
        !this.ruleModel.description ||
        !this.ruleModel.code ||
        !this.ruleModel.operator ||
        (!this.ruleModel.isEdgeRule && !this.ruleModel.escalation_time_in_sec))
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
      if (this.data_type === 'Number') {
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
      if (this.data_type === 'Boolean') {
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
      if (this.data_type === 'String') {
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
          sid: prop?.value?.metadata?.slave_id,
          property: prop.value.json_key,
          type: prop.type === 'Cloud Derived Properties' ? 'cd' : prop.type === 'Edge Derived Properties' ? 'ed' : 'm',
        });
    });

    this.ruleModel.condition_str = str.slice(0, -2).trim();
    this.ruleModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.ruleModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    let method;
    this.ruleModel.isoverride = true;
    method = !this.ruleModel.isEdgeRule
      ? this.assetService.createNewCloudAssetRule(this.contextApp.app, this.name, this.ruleModel)
      : this.assetService.createNewEdgeAssetRule(this.contextApp.app, this.name, this.ruleModel);
    method.subscribe(
      (response: any) => {
        this.overrideRuleMapping = true;
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
    this.ruleModel.rule_category = this.ruleModel.isKpixCategory ? "KPIX Analytics" : "Stream Analytics";
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
    this.ruleModel.conditions.push({
      property: "PT_102",
      operator: "EQUAL",
      threshold: "m",
      aggregation_type: null,
      strText: null,
      bolCon: null,
    });

    this.ruleModel.properties.push({
      property: "PT_102",
      type: 'm',
    });
    this.ruleModel.operator = "&&";
    this.ruleModel.condition_str = str.slice(0, -2).trim();
    this.ruleModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
    if (this.ruleModel.rule_id) {
      this.ruleModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
      let method;
      this.ruleModel.isoverride = true;
      if (!this.asset) {
        method = !this.ruleModel.isEdgeRule
          ? this.assetModelService.updateCloudModelRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetModelService.updateEdgeModelRule(this.contextApp.app, this.name, this.ruleModel);
      } else {
        method = !this.ruleModel.isEdgeRule
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
      this.ruleModel.isoverride = true;
      if (!this.asset) {
        method = !this.ruleModel.isEdgeRule
          ? this.assetModelService.createNewCloudModelRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetModelService.createNewEdgeModelRule(this.contextApp.app, this.name, this.ruleModel);
      } else {
        method = !this.ruleModel.isEdgeRule
          ? this.assetService.createNewCloudAssetRule(this.contextApp.app, this.name, this.ruleModel)
          : this.assetService.createNewEdgeAssetRule(this.contextApp.app, this.name, this.ruleModel);
      }
      method.subscribe(
        (response: any) => {
          this.overrideRuleMapping = true;
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
    if (this.data_type === 'Number') {
      return this.operatorList.find((optr) => optr.id === id).value;
    }
    if (this.data_type === 'Boolean') {
      return this.operatorList1.find((optr) => optr.id === id).value;
    }
    if (this.data_type === 'String') {
      return this.operatorList2.find((optr) => optr.id === id).value;
    }
  }
}