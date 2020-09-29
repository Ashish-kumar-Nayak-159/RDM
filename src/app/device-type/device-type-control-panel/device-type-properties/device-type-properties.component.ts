import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

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
  constructor(
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
  ) { }

  ngOnInit(): void {
    this.setUpPropertyData();
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
          name: 'JSON Model',
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
      json_model : {}
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
  }

  onDataTypeChange() {
    const obj = {};
    if (this.propertyObj.data_type && this.propertyObj.json_key) {
      const validations = this.dataTypeList.find(type => type.name === this.propertyObj.data_type).validations;
      validations.forEach(item => {
        obj[item] = null;
      });
      this.propertyObj.json_model = {};
      this.propertyObj.json_model[this.propertyObj.json_key] =  obj;
    } else {
      this.propertyObj.json_model = {};
    }
  }

  onSavePropertyObj() {
    if (!this.propertyObj.name || !this.propertyObj.json_key || !this.propertyObj.data_type ) {
      this.toasterService.showError('Please fill the form correctly', 'Add Property');
      return;
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

  onCloseThingsPropertyModal() {
    $('#addPropertiesModal').modal('hide');
    this.propertyObj = undefined;
  }

  onTableFunctionCall(obj) {
    this.selectedProperty = obj.data;
    $('#PropJSONModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }
  onCloseModal() {
    $('#PropJSONModal').modal('hide');
    this.selectedProperty = undefined;
  }

}
