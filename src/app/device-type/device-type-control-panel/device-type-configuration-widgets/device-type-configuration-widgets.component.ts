import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';
import { Subscription } from 'rxjs';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { ToasterService } from 'src/app/services/toaster.service';

declare var $: any;
@Component({
  selector: 'app-device-type-configuration-widgets',
  templateUrl: './device-type-configuration-widgets.component.html',
  styleUrls: ['./device-type-configuration-widgets.component.css']
})
export class DeviceTypeConfigurationWidgetsComponent implements OnInit {

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
  constructor(
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    console.log(this.deviceType);
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
    this.deviceMethods = [];
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
    this.subscriptions.push(this.deviceTypeService.getThingsModelConfigurationWidgets(obj).subscribe(
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
      metadata: {},
      json: {
        timestamp: {
          type: 'string'
        }
      }
    };
    this.viewType = 'add';
    $('#createWidgetModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onPropertyChecked(event) {
    console.log(event);
    const propObj = event;
    if (this.controlWidget.json[propObj.json_key]) {
      delete this.controlWidget.json[propObj.json_key];
      const index =  this.controlWidget.properties.findIndex(prop => prop.json_key === propObj.json_key);
      // this.controlWidget.properties.splice(index, 1);
    } else {
      this.controlWidget.json[propObj.json_key] =
      propObj.json_model[propObj.json_key];
      // this.controlWidget.properties.push(propObj);
    }
    this.editor.set(this.controlWidget.json);
    console.log(this.controlWidget);
  }

  selectAllProps(event) {
    this.controlWidget.json = {
      timestamp: {
        type: 'string'
      }
    };
    this.controlWidget.properties.forEach(propObj => {
      this.controlWidget.json[propObj.json_key] =
      propObj.json_model[propObj.json_key];
    });
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
    if (!this.controlWidget.name) {
      this.toasterService.showError('Please add widget name', 'Create Configuration Widget');
      return;
    }
    if (this.controlWidget.properties.length === 0) {
      this.toasterService.showError('Please select at least one property', 'Create Configuration Widget');
      return;
    }
    try {
      this.controlWidget.json = this.editor.get();
    } catch (e) {
      this.toasterService.showError('Invalid JSON data', 'Create Configuration Widget');
      return;
    }
    this.isCreateWidgetAPILoading = true;
    this.controlWidget.app = this.deviceType.app;
    this.controlWidget.device_type = this.deviceType.name;
    this.subscriptions.push(this.deviceTypeService.createThingsModelConfigurationWidget(this.controlWidget).subscribe(
      (response: any) => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showSuccess(response.message, 'Create Configuration Widget');
        this.closeCreateWidgetModal();
        this.getControlWidgets();
      }, error => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showError(error.message, 'Create Configuration Widget');
      }
    ));
  }


  deleteControlWidget() {
    const obj = {
      app: this.deviceType.app,
      id: this.selectedWidget.id,
      device_type: this.deviceType.id
    };
    this.subscriptions.push(this.deviceTypeService.deleteThingsModelConfigurationWidget(obj).subscribe(
      (response: any) => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showSuccess(response.message, 'Delete Configuration Widget');
        this.onCloseModal();
        this.getControlWidgets();
      }, error => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showError(error.message, 'Delete Configuration Widget');
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
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
