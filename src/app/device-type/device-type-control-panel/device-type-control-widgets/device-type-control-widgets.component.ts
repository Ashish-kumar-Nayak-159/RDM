import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';
import { CONSTANTS } from 'src/app/app.constants';

declare var $: any;
@Component({
  selector: 'app-device-type-control-widgets',
  templateUrl: './device-type-control-widgets.component.html',
  styleUrls: ['./device-type-control-widgets.component.css']
})
export class DeviceTypeControlWidgetsComponent implements OnInit, OnDestroy {

  @Input() deviceType: any;
  viewType: string;
  controlWidget: any;
  controlWidgets: any[] = [];
  properties: any;
  isCreateWidgetAPILoading = false;
  deviceMethods: any[] = [];
  editorOptions: JsonEditorOptions;
  selectedWidget: any;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  isGetControlWidgetAPILoading = false;
  subscriptions: Subscription[] = [];
  extraParams: any[] = [];
  originalExtraParams: any[] = [];
  dataTypeList = CONSTANTS.PROPERTY_DATA_TYPE_LIST;
  constructor(
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
    this.editorOptions.statusBar = false;
    this.getThingsModelProperties();
    this.getThingsModelDeviceMethod();
    this.getControlWidgets();
  }


  getThingsModelProperties() {
    // this.properties = {};
    const obj = {
      app: this.deviceType.app,
      name: this.deviceType.name
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
      (response: any) => {
        this.properties = response.properties;
      }
    ));
  }

  getThingsModelDeviceMethod() {
    // this.deviceMethods = {};
    const obj = {
      app: this.deviceType.app,
      name: this.deviceType.name
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelDeviceMethods(obj).subscribe(
      (response: any) => {
        this.deviceMethods = response.device_methods;
      }
    ));
  }


  getControlWidgets() {
    this.isGetControlWidgetAPILoading = true;
    const obj = {
      app: this.deviceType.app,
      device_type: this.deviceType.name
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelControlWidgets(obj).subscribe(
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
        communication_technique: 'C2D Message'
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
      this.toasterService.showError('Please enter all required fields', 'Create Control Widget');
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
    this.controlWidget.app = this.deviceType.app;
    this.controlWidget.device_type = this.deviceType.name;
    this.subscriptions.push(this.deviceTypeService.createThingsModelControlWidget(this.controlWidget).subscribe(
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
      app: this.deviceType.app,
      id: this.selectedWidget.id,
      device_type: this.deviceType.id
    };
    this.subscriptions.push(this.deviceTypeService.deleteThingsModelControlWidget(obj).subscribe(
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
