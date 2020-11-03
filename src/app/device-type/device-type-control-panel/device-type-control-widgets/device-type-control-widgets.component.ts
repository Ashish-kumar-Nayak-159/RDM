import { ToasterService } from './../../../services/toaster.service';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';

declare var $: any;
@Component({
  selector: 'app-device-type-control-widgets',
  templateUrl: './device-type-control-widgets.component.html',
  styleUrls: ['./device-type-control-widgets.component.css']
})
export class DeviceTypeControlWidgetsComponent implements OnInit {

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
    this.getControlWidgets();
  }


  getThingsModelProperties() {
    // this.properties = {};
    const obj = {
      app: this.deviceType.app,
      id: this.deviceType.id
    };
    this.deviceTypeService.getThingsModelProperties(obj).subscribe(
      (response: any) => {
        this.properties = response.properties;
      }
    );
  }

  getThingsModelDeviceMethod() {
    // this.deviceMethods = {};
    const obj = {
      app: this.deviceType.app,
      id: this.deviceType.id
    };
    this.deviceTypeService.getThingsModelDeviceMethods(obj).subscribe(
      (response: any) => {
        this.deviceMethods = response.device_methods;
      }
    );
  }


  getControlWidgets() {
    this.isGetControlWidgetAPILoading = true;
    const obj = {
      app: this.deviceType.app,
      device_type: this.deviceType.name
    };
    this.deviceTypeService.getThingsModelControlWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data;
        }
        this.isGetControlWidgetAPILoading = false;
      }, error => this.isGetControlWidgetAPILoading = false
    );
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
      this.toasterService.showError('Please add widget name', 'Create Control Widget');
      return;
    }
    if (this.controlWidget.properties.length === 0) {
      this.toasterService.showError('Please select at least one property', 'Create Control Widget');
      return;
    }
    try {
      this.controlWidget.json = this.editor.get();
    } catch (e) {
      this.toasterService.showError('Invalid JSON data', 'Create Control Widget');
      return;
    }
    this.isCreateWidgetAPILoading = true;
    this.controlWidget.app = this.deviceType.app;
    this.controlWidget.device_type = this.deviceType.name;
    this.deviceTypeService.createThingsModelControlWidget(this.controlWidget).subscribe(
      (response: any) => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showSuccess(response.message, 'Create Control Widget');
        this.closeCreateWidgetModal();
        this.getControlWidgets();
      }, error => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showError(error.message, 'Create Control Widget');
      }
    );
  }


  deleteControlWidget() {
    const obj = {
      app: this.deviceType.app,
      id: this.selectedWidget.id
    };
    this.deviceTypeService.deleteThingsModelControlWidget(obj).subscribe(
      (response: any) => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showSuccess(response.message, 'Delete Control Widget');
        this.onCloseModal();
        this.getControlWidgets();
      }, error => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showError(error.message, 'Delete Control Widget');
      }
    );
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

}
