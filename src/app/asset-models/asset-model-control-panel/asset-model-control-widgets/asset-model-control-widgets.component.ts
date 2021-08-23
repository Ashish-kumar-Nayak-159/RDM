import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';
import { CONSTANTS } from 'src/app/app.constants';
import { APIMESSAGES } from 'src/app/api-messages.constants';

declare var $: any;
@Component({
  selector: 'app-asset-model-control-widgets',
  templateUrl: './asset-model-control-widgets.component.html',
  styleUrls: ['./asset-model-control-widgets.component.css']
})
export class AssetModelControlWidgetsComponent implements OnInit, OnDestroy {

  @Input() assetModel: any;
  viewType: string;
  controlWidget: any;
  controlWidgets: any[] = [];
  properties: any;
  isCreateWidgetAPILoading = false;
  assetMethods: any[] = [];
  editorOptions: JsonEditorOptions;
  selectedWidget: any;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  isGetControlWidgetAPILoading = false;
  subscriptions: Subscription[] = [];
  extraParams: any[] = [];
  originalExtraParams: any[] = [];
  dataTypeList = CONSTANTS.PROPERTY_DATA_TYPE_LIST;
  decodedToken: any;
  constantData = CONSTANTS;
  constructor(
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
    this.editorOptions.statusBar = false;
    this.getAssetsModelProperties();
    this.getAssetsModelAssetMethod();
    this.getControlWidgets();
  }


  getAssetsModelProperties() {
    // this.properties = {};
    const obj = {
      app: this.assetModel.app,
      name: this.assetModel.name
    };
    this.subscriptions.push(this.assetModelService.getAssetsModelProperties(obj).subscribe(
      (response: any) => {
        this.properties = response.properties;
      }
    ));
  }

  getAssetsModelAssetMethod() {
    // this.assetMethods = {};
    const obj = {
      app: this.assetModel.app,
      name: this.assetModel.name
    };
    this.subscriptions.push(this.assetModelService.getAssetsModelAssetMethods(obj).subscribe(
      (response: any) => {
        this.assetMethods = response.direct_methods;
      }
    ));
  }


  getControlWidgets() {
    this.isGetControlWidgetAPILoading = true;
    const obj = {
      app: this.assetModel.app,
      asset_model: this.assetModel.name
    };
    this.subscriptions.push(this.assetModelService.getAssetsModelControlWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data;
        }
        this.isGetControlWidgetAPILoading = false;
      }, error => this.isGetControlWidgetAPILoading = false
    ));
  }

  openAddWidgetModal() {
    this.controlWidget = {
      properties: [],
      metadata: {
        communication_technique: 'C2D Message',
        widget_type: undefined
      },
      json: {
        timestamp: {
          type: 'string'
        }
      }
    };
    this.addParameter();
    this.viewType = 'add';
    $('#createWidgetModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onCommunicationTechniqueChange() {
    this.controlWidget.properties = [];
    this.controlWidget.json = {
      timestamp: {
        type: 'string'
      }
    };
  }

  onPropertyChecked(event) {
    if (this.controlWidget?.metadata?.communication_technique === 'Direct Method') {
      const propObj = event.value || event;
      if (this.controlWidget.json[propObj.method_name]) {
        delete this.controlWidget.json[propObj.method_name];
        const index =  this.controlWidget.properties.findIndex(prop => prop.name === propObj.name);
        // this.controlWidget.properties.splice(index, 1);
      } else {
        this.controlWidget.json[propObj.method_name] = propObj.json_model;
        // this.controlWidget.properties.push(propObj);
      }
    } else {
    const propObj = event.value || event;
    if (this.controlWidget.json[propObj.json_key]) {
      delete this.controlWidget.json[propObj.json_key];
      const index =  this.controlWidget.properties.findIndex(prop => prop.json_key === propObj.json_key);
      // this.controlWidget.properties.splice(index, 1);
    } else {
      this.controlWidget.json[propObj.json_key] =
      propObj.json_model[propObj.json_key];
      // this.controlWidget.properties.push(propObj);
    }
    }
    this.editor.set(this.controlWidget.json);
  }

  addParameter() {
    this.extraParams.push({
      name: undefined,
      type: undefined
    });
    this.originalExtraParams = JSON.parse(JSON.stringify(this.extraParams));
  }

  removeParameter(index) {
    const obj = this.extraParams[index];
    delete this.controlWidget.json[obj.name];
    this.extraParams.splice(index, 1);
    this.editor.set(this.controlWidget.json);
    this.originalExtraParams = JSON.parse(JSON.stringify(this.extraParams));
  }

  onKeyChange(event, i) {
    this.controlWidget.json = this.editor.get();
    console.log(event);
    const obj = this.extraParams[i];
    const originalObj = this.originalExtraParams[i];
    console.log(obj);
    console.log(originalObj);
    let valueObj;
    if (originalObj.name && originalObj.type  && originalObj.name !== obj.name) {
      valueObj = JSON.parse(JSON.stringify(this.controlWidget.json[originalObj.name]));
      console.log(valueObj);
      delete this.controlWidget.json[originalObj.name];
    }
    if (obj.name && obj.type) {
      if (valueObj) {
        this.controlWidget.json[obj.name] = valueObj;
      } else {
        const propObj = {};
        propObj['type'] = obj.type.toLowerCase();
        const validations = this.dataTypeList.find(type => type.name === obj.type).validations;
        validations.forEach(item => {
          if (item === 'enum') {
            propObj[item] = [];
          } else if (item === 'trueValue') {
            propObj[item] = true;
          } else if (item === 'falseValue') {
            propObj[item] = false;
          } else {
            propObj[item] = null;
          }
        });
        this.controlWidget.json[obj.name] = propObj;
      }
    }
    this.originalExtraParams = JSON.parse(JSON.stringify(this.extraParams));
    this.editor.set(this.controlWidget.json);
  }

  selectAllProps(event) {
    this.controlWidget.json = {
      timestamp: {
        type: 'string'
      }
    };
    if (this.controlWidget?.metadata?.communication_technique === 'Direct Method') {
      this.controlWidget.properties.forEach(propObj => {
        this.controlWidget.json[propObj.method_name] = propObj.json_model;
      });
    } else {
    this.controlWidget.properties.forEach(propObj => {
      this.controlWidget.json[propObj.json_key] =
      propObj.json_model[propObj.json_key];
    });
    }
    this.editor.set(this.controlWidget.json);
  }

  deselectAllProps(event) {
    this.controlWidget.json = {
      timestamp: {
        type: 'string'
      }
    };
    this.editor.set(this.controlWidget.json);
  }

  createControlWidget() {

    if (!this.controlWidget.name || !this.controlWidget.metadata || !this.controlWidget.metadata?.communication_technique) {
      this.toasterService.showError(APIMESSAGES.ALL_FIELDS_REQUIRED, 'Create Control Widget');
      return;
    }
    try {
      this.controlWidget.json = this.editor.get();
    } catch (e) {
      this.toasterService.showError('Invalid JSON data', 'Create Control Widget');
      return;
    }
    console.log(this.controlWidget);
    console.log(Object.keys(this.controlWidget.json).length );
    if (Object.keys(this.controlWidget.json).length < 2) {
      this.toasterService.showError('Please select at least one property/parameter', 'Create Control Widget');
      return;
    }
    this.isCreateWidgetAPILoading = true;
    this.controlWidget.app = this.assetModel.app;
    this.controlWidget.asset_model = this.assetModel.name;
    this.subscriptions.push(this.assetModelService.createAssetsModelControlWidget(this.controlWidget).subscribe(
      (response: any) => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showSuccess(response.message, 'Create Control Widget');
        this.closeCreateWidgetModal();
        this.getControlWidgets();
      }, error => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showError(error.message, 'Create Control Widget');
      }
    ));
  }

  deleteControlWidget() {
    const obj = {
      app: this.assetModel.app,
      id: this.selectedWidget.id,
      asset_model: this.assetModel.id
    };
    this.subscriptions.push(this.assetModelService.deleteAssetsModelControlWidget(obj).subscribe(
      (response: any) => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showSuccess(response.message, 'Delete Control Widget');
        this.onCloseModal();
        this.getControlWidgets();
      }, error => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showError(error.message, 'Delete Control Widget');
      }
    ));
  }

  openConfirmModal(widget) {
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.selectedWidget = widget;
  }

  onCloseModal() {
    this.selectedWidget = undefined;
    $('#confirmMessageModal').modal('hide');
  }

  closeCreateWidgetModal() {
    this.controlWidget = {};
    $('#createWidgetModal').modal('hide');
    this.viewType = undefined;
    this.extraParams = [];
    this.originalExtraParams = [];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
