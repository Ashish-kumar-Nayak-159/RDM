import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { Component, Input, OnInit, OnChanges, ViewChild, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';

declare var $: any;
@Component({
  selector: 'app-device-type-properties',
  templateUrl: './device-type-properties.component.html',
  styleUrls: ['./device-type-properties.component.css']
})
export class DeviceTypePropertiesComponent implements OnInit, OnChanges, OnDestroy {

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
  dependentProperty: any[] = [];
  setupForm: FormGroup;
  editorOptions: JsonEditorOptions;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  subscriptions: Subscription[] = [];
  @ViewChild('jsEditor', {static: false}) jsEditor: any;
  constantData = CONSTANTS;
  code = `function calculate () {
  return null;
}`;
  slaveData: any[] = [];
  contextApp: any;
  options: any;
  userData: any;
  constructor(
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
    this.editorOptions.statusBar = false;
    this.getSlaveData();
  }

  onMonacoInit(editorInstance) {
    setTimeout(() => {
      editorInstance.layout();
    }, 50);
  }

  ngOnChanges(changes): void {
    if (changes.type) {
      this.type = changes.type.currentValue;
      this.setUpPropertyData();
    }
  }

  getSlaveData() {
    this.slaveData = [];
    const filterObj = {};
    this.subscriptions.push(this.deviceTypeService.getModelSlaveDetails(this.contextApp.app, this.deviceType.name, filterObj)
    .subscribe((response: any) => {
      if (response?.data) {
        this.slaveData = response.data;
      }
    })
    );
  }

  setUpPropertyData() {
    this.properties[this.type] = [];
    this.propertyTableConfig = {
      type: 'Properties',
      tableHeight: 'calc(100vh - 11rem)',
      freezed: this.deviceType.freezed,
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
          headerClass: 'w-15',
          valueclass: ''
        },
        {
          name: 'Data Type',
          key: 'data_type',
          type: 'text',
          headerClass: 'w-15',
          valueclass: ''
        },
        {
          name: 'Actions',
          key: undefined,
          type: 'button',
          headerClass: 'w-10',
          btnData: [
            {
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'View JSON Model',
              valueclass: '',
              tooltip: 'View JSON Model'
            },
            {
              icon: 'fa fa-fw fa-edit',
              text: '',
              id: 'Edit',
              valueclass: '',
              tooltip: 'Edit',
              disableConditions: {
                key: 'freezed',
                value: true
              }
            },
            {
              icon: 'fa fa-fw fa-trash',
              text: '',
              id: 'Delete',
              valueclass: '',
              tooltip: 'Delete',
              disableConditions: {
                key: 'freezed',
                value: true
              }
            }
          ]
        }
      ]
    };
    if (this.type.includes('Derived Properties')) {
      // this.propertyTableConfig.data[3].btnData.splice(1, 0, {
      //   icon: 'fa fa-fw fa-cog',
      //   text: '',
      //   id: 'Configure Property',
      //   valueclass: '',
      //   tooltip: 'Configure Property'
      // });
      this.propertyTableConfig.data.splice(3, 0, {
        name: 'Condition',
        key: 'condition',
        type: 'text',
        headerClass: '',
        valueclass: ''
      });
      this.propertyTableConfig.data[4].btnData.splice(1);
      this.propertyTableConfig.data[4].btnData.splice(2);
    }
    this.getThingsModelProperties();
  }

  getThingsModelProperties() {
    // this.properties = {};
    this.dependentProperty = [];
    this.isPropertiesLoading = true;
    const obj = {
      app: this.deviceType.app,
      name: this.deviceType.name
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
      (response: any) => {
        this.properties = response.properties;
        this.properties[this.type] = this.properties[this.type] ? this.properties[this.type] : [];
        if (this.type === 'derived_properties' && this.properties['measured_properties']) {
          this.dependentProperty = JSON.parse(JSON.stringify(this.properties['measured_properties']));
          this.properties[this.type].forEach(prop => this.dependentProperty.push(prop));
        }
        this.isPropertiesLoading = false;
      }
    ));
  }


  onPropertyChecked(event) {
    const propObj = event;
    const index = this.selectedProperty.dependent_properties.findIndex(prop => prop.json_key === propObj.json_key);
    if (index > -1) {
      this.selectedProperty.dependent_properties.splice(index, 1);
    }
    this.onPropParamAddedForFun();
  }

  selectAllProps() {
    this.selectedProperty.dependent_properties = JSON.parse(JSON.stringify(this.dependentProperty));
    this.onPropParamAddedForFun();
  }

  deselectAllProps() {
    this.selectedProperty.dependent_properties = [];
    this.onPropParamAddedForFun();
  }

  openAddPropertiesModal() {
    this.propertyObj = {
      json_model : {},
      threshold: {}
    };
    console.log(this.setupForm);
    if (this.deviceType.metadata?.model_type === CONSTANTS.NON_IP_DEVICE) {
    if (this.deviceType.tags.protocol === 'ModbusTCPMaster' || this.deviceType.tags.protocol === 'ModbusRTUMaster') {
      this.setupForm = new FormGroup({
        slave: new FormControl(null, [Validators.required]),
        d: new FormControl(null, [Validators.required]),
        sa: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99999)]),
        a: new FormControl(false),
        fc: new FormControl(null, [Validators.required]),
      });
    } else if (this.deviceType.tags.protocol === 'SiemensTCPIP') {
      this.setupForm = new FormGroup({
        slave: new FormControl(null, [Validators.required]),
        d: new FormControl(null, [Validators.required]),
        sa: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99999)]),
        a: new FormControl(false),
        mt: new FormControl(null, [Validators.required]),
      });
    }
    console.log(this.setupForm);
    }
   // this.thingsModel.tags.app = this.contextApp.app;
    $('#addPropertiesModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onChangeOfSetupType(obj = undefined) {
    if (this.setupForm.value.d !== 'a') {
      this.setupForm.removeControl('sd');
    } else {
      this.setupForm.addControl('sd', new FormControl(obj?.sd || null, [Validators.required]));
    }
    if (this.setupForm.value.d !== 's') {
      this.setupForm.removeControl('la');
    } else {
      this.setupForm.addControl('la', new FormControl(obj?.la || null, [Validators.required, Validators.min(1), Validators.max(99999)]));
    }
    if (this.setupForm.value.d === 'a' &&
    (this.setupForm.value.sd === 5 || this.setupForm.value.sd === 6)) {
      this.setupForm.removeControl('p');
      this.setupForm.addControl('p', new FormControl(obj?.p || null, [Validators.required, Validators.min(1), Validators.max(5)]));
    } else {
      this.setupForm.removeControl('p');
      this.setupForm.addControl('p', new FormControl(0, [Validators.required]));
    }
    if (this.deviceType.tags.protocol === 'SiemensTCPIP' && this.setupForm.value.d === 'd') {
      this.setupForm.removeControl('bn');
      this.setupForm.addControl('bn', new FormControl(obj?.bn || null, [Validators.required, Validators.min(0), Validators.max(15)]));
    } else {
      this.setupForm.removeControl('bn');
    }
  }

  onChangeOfSetupSecondaryType(obj = undefined) {
    if (this.setupForm.value.d === 'a' &&
    (this.setupForm.value.sd === 5 || this.setupForm.value.sd === 6)) {
      this.setupForm.removeControl('p');
      this.setupForm.addControl('p', new FormControl(obj?.p || null, [Validators.required, Validators.min(1), Validators.max(5)]));
    } else {
      this.setupForm.removeControl('p');
      this.setupForm.addControl('p', new FormControl(0, [Validators.required]));
    }
    if (this.setupForm.value.d === 'a' &&
    this.setupForm.value.sd === 9) {
      this.setupForm.removeControl('bytn');
      this.setupForm.addControl('bytn', new FormControl(obj?.bytn || null, [Validators.required]));
    } else {
      this.setupForm.removeControl('bytn');
    }
  }

  onChageOfMemoryType(obj = undefined) {
    if (this.setupForm.value.mt === 'DB') {
      this.setupForm.addControl('dbn', new FormControl(obj?.dbn || null, [Validators.required, Validators.min(1)]));
    } else {
      this.setupForm.removeControl('dbn');
    }
  }

  onChangeOfSetupFunctionCode(obj = undefined) {
    if (this.setupForm.value.d === 'd' && (this.setupForm.value.fc === 3 || this.setupForm.value.fc === 4)) {
      this.setupForm.removeControl('bn');
      this.setupForm.addControl('bn', new FormControl(obj?.bn || null, [Validators.required, Validators.min(0), Validators.max(15)]));
    } else {
      this.setupForm.removeControl('bn');
      this.setupForm.addControl('bn', new FormControl(-1, [Validators.required]));
    }
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
    this.propertyObj.metadata = this.setupForm?.value;
    this.propertyObj.id = this.commonService.generateUUID();
    if (!this.propertyObj.name || !this.propertyObj.json_key || !this.propertyObj.data_type ) {
      this.toasterService.showError('Please enter all required fields', 'Add Property');
      return;
    }
    if (this.deviceType.metadata?.model_type === this.constantData.NON_IP_DEVICE && Object.keys(this.propertyObj?.metadata).length === 0) {
      this.toasterService.showError('Please enter all required fields', 'Add Property');
      return;
    }
    try {
      this.propertyObj.json_model = this.editor.get();
    } catch (e) {
      this.toasterService.showError('Invalid JSON data', 'Add Property');
      return;
    }
    const index = this.properties[this.type].findIndex(prop => prop.json_key === this.propertyObj.json_key);
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
    if (this.propertyObj.isAdd) {
      if (this.type.includes('read')) {
        this.properties.controllable_properties = this.properties.controllable_properties ? this.properties.controllable_properties : [];
        const windex = this.properties.controllable_properties.findIndex(prop => prop.json_key === this.propertyObj.json_key);
        delete this.propertyObj.isAdd;
        if (windex === -1) {
          this.properties.controllable_properties.push(this.propertyObj);
        }
      }
      if (this.type.includes('writ')) {
        this.properties.configurable_properties = this.properties.configurable_properties ? this.properties.configurable_properties : [];
        const windex = this.properties.configurable_properties.findIndex(prop => prop.json_key === this.propertyObj.json_key);
        delete this.propertyObj.isAdd;
        if (windex === -1) {
          this.properties.configurable_properties.push(this.propertyObj);
        }
      }
    }
    this.isCreatePropertyLoading = true;
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.properties = JSON.parse(JSON.stringify(this.properties));
    obj.properties[this.type].push(this.propertyObj);
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(this.deviceTypeService.updateThingsModel(obj, this.deviceType.app).subscribe(
      (response: any) => {
        this.isCreatePropertyLoading = false;
        this.onCloseThingsPropertyModal();
        this.toasterService.showSuccess(response.message, 'Add Property');
        this.getThingsModelProperties();
      }, error => {
        this.isCreatePropertyLoading = false;
        this.toasterService.showError(error.message, 'Add Property');
      }
    ));
  }

  deleteProperty() {
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.properties = JSON.parse(JSON.stringify(this.properties));
    const index = obj.properties[this.type].findIndex(prop => prop.json_key === this.selectedProperty.json_key);
    obj.properties[this.type].splice(index, 1);
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(this.deviceTypeService.updateThingsModel(obj, this.deviceType.app).subscribe(
      (response: any) => {
        this.isCreatePropertyLoading = false;
        this.onCloseModal('confirmMessageModal');
        this.toasterService.showSuccess(response.message, 'Delete Property');
        this.getThingsModelProperties();
      }, error => {
        this.isCreatePropertyLoading = false;
        this.toasterService.showError(error.message, 'Delete Property');
      }
    ));
  }

  onCloseThingsPropertyModal() {
    $('#addPropertiesModal').modal('hide');
    this.propertyObj = undefined;
    this.selectedProperty = undefined;
  }

  onPropParamAddedForFun() {
    let propKeys = '';
    this.selectedProperty.dependent_properties.forEach((prop, index) =>
      propKeys += (prop.json_key + (this.selectedProperty.dependent_properties[index + 1] ? ',' : '')));
    this.code =   `function calculate (` + propKeys + `) {
  return null;
}`;
  }

  updatePropertyData() {
    if (!this.propertyObj.id) {
      this.propertyObj.id = this.commonService.generateUUID();
    }
    try {
      this.propertyObj.json_model = this.editor.get();
    } catch (e) {
      this.toasterService.showError('Invalid JSON data', 'Edit Property');
      return;
    }
    this.propertyObj.metadata = this.setupForm?.value;
    const index = this.properties[this.type].findIndex(prop => prop.json_key === this.selectedProperty.json_key);
    this.properties[this.type].splice(index, 1);

    if (this.propertyObj?.edit) {
      // this.propertyObj.derived_function = this.code;
      this.properties[this.type].splice(index, 0, this.propertyObj);
    } else {
      // this.selectedProperty.derived_function = this.code;
      this.properties[this.type].splice(index, 0, this.selectedProperty);
    }
    this.isCreatePropertyLoading = true;
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.properties = JSON.parse(JSON.stringify(this.properties));
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(this.deviceTypeService.updateThingsModel(obj, this.deviceType.app).subscribe(
      (response: any) => {
        this.isCreatePropertyLoading = false;
        this.onCloseModal('configureDerivedPropModal');
        this.onCloseThingsPropertyModal();
        this.toasterService.showSuccess(response.message, 'Edit Property');
        this.getThingsModelProperties();
      }, error => {
        this.isCreatePropertyLoading = false;
        this.toasterService.showError(error.message, 'Edit Property');
      }
    ));
  }

  onTableFunctionCall(obj) {
    this.selectedProperty = obj.data;
    if (obj.for === 'View JSON Model') {
      $('#PropJSONModal').modal({ backdrop: 'static', keyboard: false, show: true });
    } else if (obj.for === 'Delete') {
      $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    } else if (obj.for === 'Configure Property') {
      $('#configureDerivedPropModal').modal({ backdrop: 'static', keyboard: false, show: true });
      this.options = {
        theme: 'vs-dark',
        language: 'javascript'
      };
      if (!this.selectedProperty.derived_function) {
        this.onPropParamAddedForFun();
      } else {
        this.code = this.selectedProperty.derived_function;
      }
      // setTimeout(() => {
      //   if (this.jsEditor) {
      //     this.jsEditor.editor?.layout();
      //   }
      // }, 50);
    } else if (obj.for === 'Edit') {
      this.propertyObj = JSON.parse(JSON.stringify(obj.data));
      this.propertyObj.edit = true;
      if (this.deviceType.metadata?.model_type === CONSTANTS.NON_IP_DEVICE) {
      if (this.deviceType.tags.protocol === 'ModbusTCPMaster' || this.deviceType.tags.protocol === 'ModbusRTUMaster') {
        this.setupForm = new FormGroup({
          slave: new FormControl(this.propertyObj?.metadata?.slave, [Validators.required]),
          d: new FormControl(this.propertyObj?.metadata?.d, [Validators.required]),
          sa: new FormControl(this.propertyObj?.metadata?.sa, [Validators.required, Validators.min(0), Validators.max(99999)]),
          a: new FormControl(true),
          fc: new FormControl(this.propertyObj?.metadata?.fc, [Validators.required]),
        });
      } else if (this.deviceType.tags.protocol === 'SiemensTCPIP') {
        this.setupForm = new FormGroup({
          slave: new FormControl(this.propertyObj?.metadata?.slave, [Validators.required]),
          d: new FormControl(this.propertyObj?.metadata?.d, [Validators.required]),
          sa: new FormControl(this.propertyObj?.metadata?.sa, [Validators.required, Validators.min(0), Validators.max(99999)]),
          a: new FormControl(true),
          mt: new FormControl(this.propertyObj?.metadata?.mt, [Validators.required]),
        });
      }
      this.onChangeOfSetupType(this.propertyObj.metadata);
      this.onChangeOfSetupSecondaryType(this.propertyObj.metadata);
      this.onChangeOfSetupFunctionCode(this.propertyObj.metadata);
      if (this.deviceType.tags.protocol === 'SiemensTCPIP') {
        this.onChageOfMemoryType(this.propertyObj.metadata);
      }
      }

      $('#addPropertiesModal').modal({ backdrop: 'static', keyboard: false, show: true });
      setTimeout(() => {
      this.editor.set(this.propertyObj.json_model);
      }, 1000);
    }
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
    this.selectedProperty = undefined;
    this.options = undefined;
    this.code = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
