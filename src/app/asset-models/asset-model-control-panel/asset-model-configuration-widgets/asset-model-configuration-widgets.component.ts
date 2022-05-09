import { CommonService } from './../../../services/common.service';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';

declare var $: any;
@Component({
  selector: 'app-asset-model-configuration-widgets',
  templateUrl: './asset-model-configuration-widgets.component.html',
  styleUrls: ['./asset-model-configuration-widgets.component.css'],
})
export class AssetModelConfigurationWidgetsComponent implements OnInit, OnDestroy {
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
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.modes = ['code','view'];
    this.editorOptions.expandAll = true;
    this.editorOptions.mode = 'view';
    this.editorOptions.statusBar = false;
    this.getAssetsModelProperties();
    this.getAssetsModelAssetMethod();
    this.getControlWidgets();
  }

  getAssetsModelProperties() {
    // this.properties = {};
    const obj = {
      app: this.assetModel.app,
      name: this.assetModel.name,
    };
    this.subscriptions.push(
      this.assetModelService.getAssetsModelProperties(obj).subscribe((response: any) => {
        this.properties = response.properties;
      })
    );
  }

  onCommunicationTechniqueChange() {
    this.controlWidget.properties = [];
    this.controlWidget.json = {
      params: [],
    };
    this.extraParams = [];
    if (
      this.controlWidget.metadata?.communication_technique === 'C2D Message' ||
      this.controlWidget.metadata?.communication_technique === 'Twin Change'
    ) {
      this.addParameter();
    }
  }

  getAssetsModelAssetMethod() {
    // this.assetMethods = {};
    this.assetMethods = [];
    const obj = {
      app: this.assetModel.app,
      name: this.assetModel.name,
    };
    this.subscriptions.push(
      this.assetModelService.getAssetsModelAssetMethods(obj).subscribe((response: any) => {
        this.assetMethods = response.direct_methods;
      })
    );
  }

  getControlWidgets() {
    this.isGetControlWidgetAPILoading = true;
    const obj = {
      app: this.assetModel.app,
      asset_model: this.assetModel.name,
    };
    this.subscriptions.push(
      this.assetModelService.getAssetsModelConfigurationWidgets(obj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.controlWidgets = response.data;
          }
          this.isGetControlWidgetAPILoading = false;
        },
        (error) => (this.isGetControlWidgetAPILoading = false)
      )
    );
  }

  openAddWidgetModal(widget = null) {
    if (widget != null) {
      this.controlWidget = JSON.parse(JSON.stringify(widget));
      if (this.controlWidget.metadata.communication_technique === 'Direct Method') {
        this.controlWidget.properties = { ...widget.properties[0] };
        this.extraParams = [];
      } else {
        this.extraParams = this.controlWidget.json?.params;
        this.controlWidget.json.params = [];
      }
      for (var index = 0; index < this.extraParams.length; index++) {
        const param = this.extraParams[index];
        this.controlWidget.properties.forEach((prop) => {
          if (prop.json_key === param.key) {
            this.extraParams.splice(index, 1);
            index--;
          }
        });
      }
      this.viewType = 'edit';
    } else {
      this.controlWidget = {
        properties: [],
        metadata: {
          communication_technique: 'C2D Message',
          widget_type: undefined,
        },
        json: {
          params: [],
        },
      };
      this.addParameter();
      this.viewType = 'add';
    }
    $('#createWidgetModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  addParameter() {
    this.extraParams.push({
      name: undefined,
      key: undefined,
      data_type: undefined,
    });
    // this.originalExtraParams = JSON.parse(JSON.stringify(this.extraParams));
  }

  removeParameter(index) {
    // const obj = this.extraParams[index];
    // delete this.controlWidget.json[obj.name];
    this.extraParams.splice(index, 1);
    // this.editor.set(this.controlWidget.json);
    // this.originalExtraParams = JSON.parse(JSON.stringify(this.extraParams));
  }

  onDataTypeChange(index) {
    const obj = {};
    const param = this.extraParams[index];
    if (param.data_type) {
      const validations = this.dataTypeList.find((type) => type.name === param.data_type).validations;
      validations.forEach((item) => {
        if (item === 'enum') {
          obj[item] = [];
        } else if (item === 'trueValue') {
          obj[item] = true;
        } else if (item === 'falseValue') {
          obj[item] = false;
        }else if (item === 'required') {
          obj[item] = false;
        } else {
          obj[item] = null;
        }
      });
      param.json = {};
      param.json = obj;
      param.json.type = param.data_type.toLowerCase();
    } else {
      param.json = {};
    }
  }

  onParamKeyChange(index) {
    const param = this.extraParams[index];
    let flag = false;

    this.extraParams.forEach((item, i) => {
      if (i !== index && (param.key === item.key || param.name === item.name)) {
        flag = true;
      }
    });
    if (flag) {
      this.toasterService.showError('Parameter with same key or name already exists.', 'Add Parameter');
      param.name = null;
      param.key = null;
      param.json = {};
      param.data_type = null;
      return;
    }
    if (param.json) {
      const keys = Object.keys(param.json);
      if (!keys || keys.length === 0) {
        if (param.data_type) {
          this.onDataTypeChange(index);
        } else {
          param.json = {};
        }
      }
    } else {
      param.json = {};
    }
    // this.editor.set(this.assetMethodObj.json_model);
  }

  onPropertyChecked(event) {
    if (this.controlWidget?.metadata?.communication_technique === 'Direct Method') {
      const propObj = event.value || event;
      this.controlWidget.json = {
        method_name: propObj.method_name,
        params: propObj?.json_model?.params || [],
      };
      // if (this.controlWidget.json[propObj.method_name]) {
      //   delete this.controlWidget.json[propObj.method_name];
      //   // const index =  this.controlWidget.properties.findIndex(prop => prop.name === propObj.name);
      //   // this.controlWidget.properties.splice(index, 1);
      // } else {
      //   this.controlWidget.json = {};
      //   this.controlWidget.json[propObj.method_name] = propObj.json_model;
      //   // this.controlWidget.properties.push(propObj);
      // }
    } else {
      const propObj = event.value || event;
      const index = this.controlWidget.json.params.findIndex((param) => param.key === propObj.json_key);
      if (index > -1) {
        this.controlWidget.json.params.splice(index, 1);
      } else {
        this.controlWidget.json.params.push({
          id: propObj.id,
          name: propObj.name,
          key: propObj.json_key,
          json: propObj.json_model[propObj.json_key],
          data_type: propObj.data_type,
        });
      }
    }
  }

  createControlWidget() {
    if (
      !this.controlWidget.name ||
      !this.controlWidget.metadata ||
      !this.controlWidget.metadata?.communication_technique ||
      (this.controlWidget.properties.length == 0 &&
        (!this.extraParams[0].key || !this.extraParams[0].name || !this.extraParams[0].data_type))
    ) {
      this.toasterService.showError(
        UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED,
        (this.viewType == 'add' ? 'Create' : 'Update') + 'Configuration Widget'
      );
      return;
    }
    // try {
    //   this.controlWidget.json = this.editor.get();
    // } catch (e) {
    //   this.toasterService.showError('Invalid JSON data', 'Create Configuration Widget');
    //   return;
    // }

    this.extraParams.forEach((param) => this.controlWidget.json.params.push(param));
    if (this.controlWidget.metadata.communication_technique === 'Direct Method') {
      const prop = JSON.parse(JSON.stringify(this.controlWidget.properties));
      this.controlWidget.properties = [prop];
    }
    if (
      this.controlWidget.metadata.communication_technique !== 'Direct Method' &&
      this.controlWidget.json.params?.length < 1
    ) {
      this.toasterService.showError(
        'Please select at least one property/parameter',
        (this.viewType == 'add' ? 'Create' : 'Update') + 'Configuration Widget'
      );
      return;
    }
    this.isCreateWidgetAPILoading = true;
    this.controlWidget.app = this.assetModel.app;
    this.controlWidget.asset_model = this.assetModel.name;
    let method;
    if (this.viewType == 'add') {
      method = this.assetModelService.createAssetsModelConfigurationWidget(this.controlWidget);
    } else {
      method = this.assetModelService.updateAssetsModelConfigurationWidget(this.controlWidget, this.assetModel.app);
    }

    this.subscriptions.push(
      method.subscribe(
        (response: any) => {
          this.isCreateWidgetAPILoading = false;
          this.toasterService.showSuccess(
            response.message,
            (this.viewType == 'add' ? 'Create' : 'Update') + 'Configuration Widget'
          );
          this.closeCreateWidgetModal();
          this.getControlWidgets();
        },
        (error) => {
          this.isCreateWidgetAPILoading = false;
          this.toasterService.showError(
            error.message,
            (this.viewType == 'add' ? 'Create' : 'Update') + 'Configuration Widget'
          );
        }
      )
    );
  }

  deleteControlWidget() {
    const obj = {
      app: this.assetModel.app,
      id: this.selectedWidget.id,
      asset_model: this.assetModel.id,
    };
    this.subscriptions.push(
      this.assetModelService.deleteAssetsModelConfigurationWidget(obj).subscribe(
        (response: any) => {
          this.isCreateWidgetAPILoading = false;
          this.toasterService.showSuccess(response.message, 'Delete Configuration Widget');
          this.onCloseModal();
          this.getControlWidgets();
        },
        (error) => {
          this.isCreateWidgetAPILoading = false;
          this.toasterService.showError(error.message, 'Delete Configuration Widget');
        }
      )
    );
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.onCloseModal();
    } else if (eventType === 'save') {
      this.deleteControlWidget();
    }
  }

  openConfirmModal(widget) {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
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
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
