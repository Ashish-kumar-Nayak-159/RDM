import { Subscription } from 'rxjs';
import { MatNativeDateModule } from '@angular/material/core';
import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
export class DeviceTypeDeviceMethodsComponent implements OnInit, OnDestroy {

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
  deviceMethodsList: any = [];
  editorOptions: JsonEditorOptions;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  subscriptions: Subscription[] = [];
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
      freeze: this.deviceType.freeze,
      type: 'Device Methods',
      data: [
        {
          name: 'Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Method Name',
          key: 'method_name',
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
              tooltip: 'Delete',
              disableConditions: {
                key: 'freeze',
                value: true
              }
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
    this.subscriptions.push(this.deviceTypeService.getThingsModelDeviceMethods(obj).subscribe(
      (response: any) => {
        this.deviceMethods = response.device_methods;
        this.isDeviceMethodsLoading = false;
      }
    ));
  }

  addParameter() {
    this.deviceMethodObj.json_model.params.push({
      key: null,
      data_type: null,
      json: null
    });
  }

  openaddDeviceMethodModal() {
    this.deviceMethodObj = {
      json_model : {
        params: [
          {
            key: null,
            data_type: null,
            json: null
          }
        ]
      },
    };
   // this.thingsModel.tags.app = this.contextApp.app;
    $('#addDeviceMethodModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onDataTypeChange(index) {
    const obj = {};
    const param = this.deviceMethodObj.json_model.params[index];
    if (param.data_type && param.json) {
      const validations = this.dataTypeList.find(type => type.name === param.data_type).validations;
      validations.forEach(item => {
        if (item === 'enum') {
          obj[item] = [];
        } else if (item === 'trueValue') {
          obj[item] = true;
        } else if (item === 'falseValue') {
          obj[item] = false;
        } else {
          obj[item] = null;
        }
      });
      param.json = {};
      param.json =  obj;
      param.json.type = param.data_type.toLowerCase();
    } else {
      param.json = {};
    }
    this.editor.set(this.deviceMethodObj.json_model);
  }

  onParamKeyChange(index) {
    console.log(this.deviceMethodObj);
    console.log(index);
    const param = this.deviceMethodObj.json_model.params[index];
    console.log(param.json);
    if (param.json) {
      const keys = Object.keys(param.json);
      let obj: any = {};
      if (keys && keys.length > 0) {
        obj.key = param.json[keys[0]];
      } else {
        param.json = {};
        obj = {};
      }
      if (param.data_type) {
        this.onDataTypeChange(index);
      }
      param.json = obj;
    } else {
      param.json = {};
    }
    console.log(this.deviceMethodObj.json_model);
    this.editor.set(this.deviceMethodObj.json_model);
  }



  onJSONKeyChange() {
    if (this.deviceMethodObj.method_name) {
      this.deviceMethodObj.json_model.method = this.deviceMethodObj.method_name;
      // this.deviceMethodObj.json_model.message = {};
    } else {
      delete this.deviceMethodObj.json_model.method;
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
    const index = this.deviceMethods.findIndex(prop => prop.name === this.deviceMethodObj.name);
    console.log(index);
    if (index > -1) {
      this.toasterService.showError('Device Method with same method name already exist.', 'Add Device Method');
      return;
    }
    this.isCreateDeviceMethodLoading = true;
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.device_methods = JSON.parse(JSON.stringify(this.deviceMethods));
    obj.device_methods.push(this.deviceMethodObj);
    this.subscriptions.push(this.deviceTypeService.updateThingsModel(obj, this.deviceType.app).subscribe(
      (response: any) => {
        this.isCreateDeviceMethodLoading = false;
        this.onCloseThingsDeviceMethodModal();
        this.toasterService.showSuccess(response.message, 'Add Device Method');
        this.getThingsModelDeviceMethod();
      }, error => {
        this.isCreateDeviceMethodLoading = false;
        this.toasterService.showError(error.message, 'Add Device Method');
      }
    ));
  }

  deleteDeviceMethod() {
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.device_methods = JSON.parse(JSON.stringify(this.deviceMethods));
    const index = obj.device_methods.findIndex(prop => prop.json_key === this.selectedDeviceMethod.json_key);
    obj.device_methods.splice(index, 1);
    this.subscriptions.push(this.deviceTypeService.updateThingsModel(obj, this.deviceType.app).subscribe(
      (response: any) => {
        this.isCreateDeviceMethodLoading = false;
        this.onCloseModal('confirmMessageModal');
        this.toasterService.showSuccess(response.message, 'Delete Device Method');
        this.getThingsModelDeviceMethod();
      }, error => {
        this.isCreateDeviceMethodLoading = false;
        this.toasterService.showError(error.message, 'Delete Device Method');
      }
    ));
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


}
