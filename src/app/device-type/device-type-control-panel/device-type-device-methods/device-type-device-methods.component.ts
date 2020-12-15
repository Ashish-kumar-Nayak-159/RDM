import { MatNativeDateModule } from '@angular/material/core';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';

declare var $: any;
@Component({
  selector: 'app-device-type-device-methods',
  templateUrl: './device-type-device-methods.component.html',
  styleUrls: ['./device-type-device-methods.component.css']
})
export class DeviceTypeDeviceMethodsComponent implements OnInit {

  @Input() deviceType: any;
  deviceMethods: any = {};
  isDeviceMethodsLoading = false;
  selectedHeartbeat: any;
  isFilterSelected = true;
  modalConfig: any;
  pageType: string;
  deviceMethodTableConfig: any = {};
  deviceMethodObj: any;
  dataTypeList = CONSTANTS.PROPERTY_DATA_TYPE_LIST;
  isCreateDeviceMethodLoading = false;
  selectedDeviceMethod: any;
  deviceMethodsList = CONSTANTS.DEVICE_METHODS;
  editorOptions: JsonEditorOptions;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  constructor(
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
  ) { }

  ngOnInit(): void {
    this.setUpDeviceMethodsData();
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
    this.editorOptions.statusBar = false;
  }

  setUpDeviceMethodsData() {
    this.deviceMethods = [];
    this.deviceMethodTableConfig = {
      type: 'Device Methods',
      data: [
        {
          name: 'Method Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Actions',
          key: undefined,
          type: 'button',
          headerClass: '',
          btnData: [
            {
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'View JSON Model',
              valueclass: '',
              tooltip: 'View JSON Model'
            },
            {
              icon: 'fa fa-fw fa-trash',
              text: '',
              id: 'Delete',
              valueclass: '',
              tooltip: 'Delete'
            }
          ]
        }
      ]
    };
    this.getThingsModelDeviceMethod();
  }

  getThingsModelDeviceMethod() {
    // this.deviceMethods = {};
    this.isDeviceMethodsLoading = true;
    const obj = {
      app: this.deviceType.app,
      name: this.deviceType.name
    };
    this.deviceTypeService.getThingsModelDeviceMethods(obj).subscribe(
      (response: any) => {
        this.deviceMethods = response.device_methods;
        this.isDeviceMethodsLoading = false;
      }
    );
  }

  openaddDeviceMethodModal() {
    this.deviceMethodObj = {
      json_model : {
      }
    };
   // this.thingsModel.tags.app = this.contextApp.app;
    $('#addDeviceMethodModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onJSONKeyChange() {
    console.log(this.deviceMethodObj);
    if (this.deviceMethodObj.method_name) {
      this.deviceMethodObj.json_model.command = this.deviceMethodObj.method_name;
    } else {
      delete this.deviceMethodObj.json_model.command;
    }
    this.editor.set(this.deviceMethodObj.json_model);
  }


  onSavedeviceMethodObj() {
    if (!this.deviceMethodObj.name || !this.deviceMethodObj.method_name) {
      this.toasterService.showError('Please fill the form correctly', 'Add Device Method');
      return;
    }
    try {
      this.deviceMethodObj.json_model = this.editor.get();
    } catch (e) {
      this.toasterService.showError('Invalid JSON data', 'Add Device Method');
      return;
    }
    const index = this.deviceMethods.findIndex(prop => prop.method_name === this.deviceMethodObj.method_name);
    console.log(index);
    if (index > -1) {
      this.toasterService.showError('Device Method with same method name already exist.', 'Add Device Method');
      return;
    }
    this.isCreateDeviceMethodLoading = true;
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.device_methods = JSON.parse(JSON.stringify(this.deviceMethods));
    obj.device_methods.push(this.deviceMethodObj);
    this.deviceTypeService.updateThingsModel(obj, this.deviceType.app).subscribe(
      (response: any) => {
        this.isCreateDeviceMethodLoading = false;
        this.onCloseThingsDeviceMethodModal();
        this.toasterService.showSuccess(response.message, 'Add Device Method');
        this.getThingsModelDeviceMethod();
      }, error => {
        this.isCreateDeviceMethodLoading = false;
        this.toasterService.showError(error.message, 'Add Device Method');
      }
    );
  }

  deleteDeviceMethod() {
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.device_methods = JSON.parse(JSON.stringify(this.deviceMethods));
    const index = obj.device_methods.findIndex(prop => prop.json_key === this.selectedDeviceMethod.json_key);
    obj.device_methods.splice(index, 1);
    this.deviceTypeService.updateThingsModel(obj, this.deviceType.app).subscribe(
      (response: any) => {
        this.isCreateDeviceMethodLoading = false;
        this.onCloseModal('confirmMessageModal');
        this.toasterService.showSuccess(response.message, 'Delete Device Method');
        this.getThingsModelDeviceMethod();
      }, error => {
        this.isCreateDeviceMethodLoading = false;
        this.toasterService.showError(error.message, 'Delete Device Method');
      }
    );
  }

  onCloseThingsDeviceMethodModal() {
    $('#addDeviceMethodModal').modal('hide');
    this.deviceMethodObj = undefined;
  }

  onTableFunctionCall(obj) {
    this.selectedDeviceMethod = obj.data;
    if (obj.for === 'View JSON Model') {
      $('#PropJSONModal').modal({ backdrop: 'static', keyboard: false, show: true });
    } else if (obj.for === 'Delete') {
      $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }
  onCloseModal(id) {
    $('#' + id).modal('hide');
    this.selectedDeviceMethod = undefined;
  }


}
