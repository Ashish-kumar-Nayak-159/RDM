import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { Component, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';

declare var $: any;
@Component({
  selector: 'app-device-type-properties',
  templateUrl: './device-type-properties.component.html',
  styleUrls: ['./device-type-properties.component.css']
})
export class DeviceTypePropertiesComponent implements OnInit, OnChanges {

  @Input() deviceType: any;
  @Input() type: any;
  properties: any = {};
  isPropertiesLoading = false;
  selectedHeartbeat: any;
  isFilterSelected = true;
  modalConfig: any;
  pageType: string;
  propertyTableConfig: any = {};
  propertyObj: any;
  dataTypeList = CONSTANTS.PROPERTY_DATA_TYPE_LIST;
  isCreatePropertyLoading = false;
  selectedProperty: any;
  editorOptions: JsonEditorOptions;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  constructor(
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
  ) { }

  ngOnInit(): void {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
    this.editorOptions.statusBar = false;
  }

  ngOnChanges(changes): void {
    console.log(changes);
    if (changes.type) {
      this.type = changes.type.currentValue;
      this.setUpPropertyData();
    }
  }

  setUpPropertyData() {
    this.properties[this.type] = [];
    this.propertyTableConfig = {
      type: 'Properties',
      data: [
        {
          name: 'Display Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'JSON Key',
          key: 'json_key',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Data Type',
          key: 'data_type',
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
              icon: 'fas fa-fw fa-eye',
              text: '',
              id: 'View JSON Model',
              valueclass: '',
              tooltip: 'View JSON Model'
            },
            {
              icon: 'fas fa-fw fa-trash',
              text: '',
              id: 'Delete',
              valueclass: '',
              tooltip: 'Delete'
            }
          ]
        }
      ]
    };
    this.getThingsModelProperties();
  }

  getThingsModelProperties() {
    // this.properties = {};
    this.isPropertiesLoading = true;
    const obj = {
      app: this.deviceType.app,
      id: this.deviceType.id
    };
    this.deviceTypeService.getThingsModelProperties(obj).subscribe(
      (response: any) => {
        this.properties = response.properties;
        this.properties[this.type] = this.properties[this.type] ? this.properties[this.type] : [];
        this.isPropertiesLoading = false;
      }
    );
  }

  openAddPropertiesModal() {
    this.propertyObj = {
      json_model : {},
      threshold: {}
    };
   // this.thingsModel.tags.app = this.contextApp.app;
    $('#addPropertiesModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onJSONKeyChange() {
    if (this.propertyObj.json_key) {
      const keys = Object.keys(this.propertyObj.json_model);
      const obj = {};
      if (keys && keys.length > 0) {
        obj[this.propertyObj.json_key] = this.propertyObj.json_model[keys[0]];
      } else {
        this.propertyObj.json_model = {};
        obj[this.propertyObj.json_key] = {};
      }
      if (this.propertyObj.data_type) {
        this.onDataTypeChange();
      }
      this.propertyObj.json_model = obj;
    } else {
      this.propertyObj.json_model = {};
    }
    this.editor.set(this.propertyObj.json_model);
  }

  onDataTypeChange() {
    const obj = {};
    if (this.propertyObj.data_type && this.propertyObj.json_key) {
      const validations = this.dataTypeList.find(type => type.name === this.propertyObj.data_type).validations;
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
      this.propertyObj.json_model = {};
      this.propertyObj.json_model[this.propertyObj.json_key] =  obj;
      this.propertyObj.json_model[this.propertyObj.json_key].type = this.propertyObj.data_type.toLowerCase();
    } else {
      this.propertyObj.json_model = {};
    }
    this.editor.set(this.propertyObj.json_model);
  }



  onSavePropertyObj() {
    if (!this.propertyObj.name || !this.propertyObj.json_key || !this.propertyObj.data_type ) {
      this.toasterService.showError('Please fill the form correctly', 'Add Property');
      return;
    }
    try {
      this.propertyObj.json_model = this.editor.get();
    } catch (e) {
      this.toasterService.showError('Invalid JSON data', 'Add Property');
      return;
    }
    const index = this.properties[this.type].findIndex(prop => prop.json_key === this.propertyObj.json_key);
    console.log(index);
    if (index > -1) {
      this.toasterService.showError('Property with same name already exist.', 'Add Property');
      return;
    }
    if (this.propertyObj.threshold && this.type === 'measured_properties') {
      if (this.propertyObj.threshold.l1 && this.propertyObj.threshold.h1 && this.propertyObj.threshold.h1 < this.propertyObj.threshold.l1) {
        this.toasterService.showError('H1 must be greater than L1', 'Add Property');
        return;
      }
      if (this.propertyObj.threshold.l2 && this.propertyObj.threshold.h2 && this.propertyObj.threshold.h2 < this.propertyObj.threshold.l2) {
        this.toasterService.showError('H2 must be greater than L2', 'Add Property');
        return;
      }
      if (this.propertyObj.threshold.l3 && this.propertyObj.threshold.h3 && this.propertyObj.threshold.h3 < this.propertyObj.threshold.l3) {
        this.toasterService.showError('H3 must be greater than L3', 'Add Property');
        return;
      }
      if (this.propertyObj.threshold.l1 && this.propertyObj.threshold.l2 && this.propertyObj.threshold.l1 < this.propertyObj.threshold.l2) {
        this.toasterService.showError('L1 must be greater than L2', 'Add Property');
        return;
      }
      if (this.propertyObj.threshold.l2 && this.propertyObj.threshold.l3 && this.propertyObj.threshold.l2 < this.propertyObj.threshold.l3) {
        this.toasterService.showError('L2 must be greater than L3', 'Add Property');
        return;
      }
      if (this.propertyObj.threshold.h1 && this.propertyObj.threshold.h2 && this.propertyObj.threshold.h1 > this.propertyObj.threshold.h2) {
        this.toasterService.showError('H2 must be greater than H1', 'Add Property');
        return;
      }
      if (this.propertyObj.threshold.h2 && this.propertyObj.threshold.h3 && this.propertyObj.threshold.h3 < this.propertyObj.threshold.h2) {
        this.toasterService.showError('H3 must be greater than H2', 'Add Property');
        return;
      }
    }
    this.isCreatePropertyLoading = true;
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.properties = JSON.parse(JSON.stringify(this.properties));
    obj.properties[this.type].push(this.propertyObj);
    this.deviceTypeService.updateThingsModel(obj, this.deviceType.app).subscribe(
      (response: any) => {
        this.isCreatePropertyLoading = false;
        this.onCloseThingsPropertyModal();
        this.toasterService.showSuccess(response.message, 'Add Property');
        this.getThingsModelProperties();
      }, error => {
        this.isCreatePropertyLoading = false;
        this.toasterService.showError(error.message, 'Add Property');
      }
    );
  }

  deleteProperty() {
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.properties = JSON.parse(JSON.stringify(this.properties));
    const index = obj.properties[this.type].findIndex(prop => prop.json_key === this.selectedProperty.json_key);
    obj.properties[this.type].splice(index, 1);
    this.deviceTypeService.updateThingsModel(obj, this.deviceType.app).subscribe(
      (response: any) => {
        this.isCreatePropertyLoading = false;
        this.onCloseModal('confirmMessageModal');
        this.toasterService.showSuccess(response.message, 'Delete Property');
        this.getThingsModelProperties();
      }, error => {
        this.isCreatePropertyLoading = false;
        this.toasterService.showError(error.message, 'Delete Property');
      }
    );
  }

  onCloseThingsPropertyModal() {
    $('#addPropertiesModal').modal('hide');
    this.propertyObj = undefined;
  }

  onTableFunctionCall(obj) {
    this.selectedProperty = obj.data;
    if (obj.for === 'View JSON Model') {
      $('#PropJSONModal').modal({ backdrop: 'static', keyboard: false, show: true });
    } else if (obj.for === 'Delete') {
      $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
    this.selectedProperty = undefined;
  }

}
