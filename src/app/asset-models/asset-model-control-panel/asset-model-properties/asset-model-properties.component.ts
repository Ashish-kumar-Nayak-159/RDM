import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { Component, Input, OnInit, OnChanges, ViewChild, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';

declare var $: any;
@Component({
  selector: 'app-asset-model-properties',
  templateUrl: './asset-model-properties.component.html',
  styleUrls: ['./asset-model-properties.component.css'],
})
export class AssetModelPropertiesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() assetModel: any;
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
  @ViewChild('jsEditor', { static: false }) jsEditor: any;
  constantData = CONSTANTS;
  slaveData: any[] = [];
  contextApp: any;
  options: any;
  userData: any;
  decodedToken: any;
  dependentProperties: any[] = [];
  constructor(
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'view';
    this.editorOptions.statusBar = false;
    this.getSlaveData();
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
    this.subscriptions.push(
      this.assetModelService
        .getModelSlaveDetails(this.contextApp.app, this.assetModel.name, filterObj)
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
      freezed: this.assetModel.freezed,
      data: [
        {
          name: 'Display Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'JSON Key',
          key: 'json_key',
          type: 'text',
          headerClass: 'w-15',
          valueclass: '',
        },

        {
          name: 'Data Type',
          key: 'data_type',
          type: 'text',
          headerClass: 'w-15',
          valueclass: '',
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
              tooltip: 'View JSON Model',
            },
            {
              icon: 'fa fa-fw fa-edit',
              text: '',
              id: 'Edit',
              valueclass: '',
              tooltip: 'Edit',
              privilege_key: 'ASMMM',
              disableConditions: {
                key: 'freezed',
                value: true,
              },
            },
            {
              icon: 'fa fa-fw fa-trash',
              text: '',
              id: 'Delete',
              valueclass: '',
              privilege_key: 'ASMMM',
              tooltip: 'Delete',
              disableConditions: {
                key: 'freezed',
                value: true,
              },
            },
          ],
        },
      ],
    };
    if (this.type.includes('measured')) {
      this.propertyTableConfig.data.splice(3, 0, {
        name: 'Group',
        key: 'group',
        type: 'text',
        headerClass: '',
        valueclass: '',
      });
      this.propertyTableConfig.data.splice(4, 0, {
        name: 'Source',
        key: 'metadata.slave_id',
        type: 'text',
        headerClass: '',
        valueclass: '',
      });
    }
    if (this.type.includes('derived')) {
      this.propertyTableConfig.data.splice(3, 0, {
        name: 'Formula',
        key: 'condition',
        type: 'text',
        headerClass: '',
        valueclass: '',
      });
      if (this.type.includes('cloud_derived')) {
        this.propertyTableConfig.data[4].btnData.splice(1);
        this.propertyTableConfig.data[4].btnData.splice(2);
      }
    }

    this.getAssetsModelProperties();
  }

  getAssetsModelProperties() {
    // this.properties = {};
    this.dependentProperty = [];
    this.isPropertiesLoading = true;
    const obj = {
      app: this.assetModel.app,
      name: this.assetModel.name,
    };
    this.subscriptions.push(
      this.assetModelService.getAssetsModelProperties(obj).subscribe((response: any) => {
        this.properties = response.properties;
        this.properties[this.type] = this.properties[this.type] ? this.properties[this.type] : [];
        if (this.type.includes('edge_derived')) {
          response.properties?.measured_properties?.forEach((prop) => (prop.type = 'Measured Properties'));
          this.dependentProperties = response.properties?.measured_properties
            ? response.properties?.measured_properties
            : [];
        }
        // if (this.type.includes('derived')) {
        //   this.properties[this.type] = this.properties[this.type].filter(
        //     (prop) => (prop.condition = '(' + prop.condition + ')')
        //   );
        // }
        this.isPropertiesLoading = false;
      })
    );
  }

  addPropertyToCondtion() {
    this.propertyObj.metadata.properties.push({
      property: null,
      value: null,
      operator: null,
      index: this.propertyObj.metadata.properties.length + 1,
    });
  }

  openAddPropertiesModal() {
    this.propertyObj = {
      json_model: {},
      threshold: {},
    };
    if (this.type === 'edge_derived_properties') {
      this.propertyObj.metadata = {
        properties: [
          {
            property: null,
            value: null,
            operator: null,
            index: 1,
          },
          {
            property: null,
            value: null,
            operator: null,
            index: 2,
          },
        ],
      };
    }
    if (this.type !== 'edge_derived_properties' && this.type !== 'cloud_derived_properties') {
      this.setupForm = new FormGroup({
        slave_id: new FormControl(null, [Validators.required]),
      });
      if (this.assetModel.metadata?.model_type === CONSTANTS.NON_IP_ASSET) {
        if (
          this.assetModel.tags.protocol === 'ModbusTCPMaster' ||
          this.assetModel.tags.protocol === 'ModbusRTUMaster'
        ) {
          this.setupForm = new FormGroup({
            slave_id: new FormControl(null, [Validators.required]),
            d: new FormControl(null, [Validators.required]),
            sa: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99999)]),
            a: new FormControl(false),
            fc: new FormControl(null, [Validators.required]),
          });
        } else if (this.assetModel.tags.protocol === 'SiemensTCPIP') {
          this.setupForm = new FormGroup({
            slave_id: new FormControl(null, [Validators.required]),
            d: new FormControl(null, [Validators.required]),
            sa: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99999)]),
            a: new FormControl(false),
            mt: new FormControl(null, [Validators.required]),
          });
        } else if (this.assetModel.tags.protocol === 'BlueNRG') {
          this.setupForm = new FormGroup({
            slave_id: new FormControl(null, [Validators.required]),
            sa: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(99999)]),
            a: new FormControl(false),
            p: new FormControl(2, [Validators.required]),
            t: new FormControl(null, [Validators.required]),
            pt: new FormControl(null, [Validators.required]),
          });
        } else if (this.assetModel.tags.protocol === 'AIoTInputs') {
          this.setupForm = new FormGroup({
            slave_id: new FormControl(null, [Validators.required]),
            cn: new FormControl(null, [Validators.required, Validators.min(0)]),
            a: new FormControl(false),
            d: new FormControl(null, [Validators.required]),
          });
        }
        console.log(this.setupForm);
      }
    }
    // this.assetModel.tags.app = this.contextApp.app;
    $('#addPropertiesModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onJSONKeyChange() {
    if (this.propertyObj.json_key) {
      console.log(this.propertyObj.json_key);
      const keys = Object.keys(this.propertyObj.json_model);
      console.log(keys);
      const obj = {};
      if (keys && keys.length > 0) {
        obj[this.propertyObj.json_key] = this.propertyObj.json_model[keys[0]];
        this.propertyObj.json_model = obj;
      } else {
        this.propertyObj.json_model = {};
        obj[this.propertyObj.json_key] = {};
        console.log(obj);
        console.log(this.propertyObj);
        if (this.propertyObj.data_type) {
          this.onDataTypeChange();
        } else {
          this.propertyObj.json_model = obj;
        }
      }
    } else {
      this.propertyObj.json_model = {};
    }
    console.log('aaaaaaaa   ', JSON.stringify(this.propertyObj));
    // this.editor.set(this.propertyObj.json_model);
  }

  onDataTypeChange() {
    const obj = {};
    console.log(this.propertyObj);
    if (this.propertyObj.data_type && this.propertyObj.json_key) {
      const validations = this.dataTypeList.find((type) => type.name === this.propertyObj.data_type).validations;
      validations.forEach((item) => {
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
      console.log(validations);
      this.propertyObj.json_model = {};
      this.propertyObj.json_model[this.propertyObj.json_key] = obj;
      this.propertyObj.json_model[this.propertyObj.json_key].type = this.propertyObj.data_type.toLowerCase();
    } else {
      this.propertyObj.json_model = {};
    }
    console.log('from data type', this.propertyObj.json_model);
    // this.editor.set(this.propertyObj.json_model);
  }

  onSavePropertyObj() {
    console.log(this.propertyObj.metadata);
    if (this.type !== 'edge_derived_properties' && this.type !== 'cloud_derived_properties') {
      this.propertyObj.metadata = this.setupForm?.value;
    }
    this.propertyObj.id = this.commonService.generateUUID();
    if (!this.propertyObj.name || !this.propertyObj.json_key || !this.propertyObj.data_type) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add Property');
      return;
    }
    if (
      this.assetModel.metadata?.model_type === this.constantData.NON_IP_ASSET &&
      Object.keys(this.propertyObj?.metadata).length === 0
    ) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add Property');
      return;
    }
    const index = this.properties[this.type].findIndex((prop) => prop.json_key === this.propertyObj.json_key);
    if (index > -1) {
      this.toasterService.showError('Property with same name already exist.', 'Add Property');
      return;
    }
    if (this.type === 'edge_derived_properties') {
      let flag = false;
      for (let i = 0; i < this.propertyObj.metadata.properties.length; i++) {
        const prop = this.propertyObj.metadata.properties[i];
        if (!prop.property && (prop.value === null || prop.value === undefined)) {
          this.toasterService.showError(
            'Please select property or add value in condition',
            'Add Edge Derived Properity'
          );
          flag = true;
          break;
        }
        if (this.propertyObj.metadata.properties[i + 1] && !prop.operator) {
          this.toasterService.showError('Please select operator in condition', 'Add Edge Derived Properity');
          flag = true;
          break;
        }
      }
      if (flag) {
        return;
      }
      this.propertyObj.metadata.condition = '';
      this.propertyObj.metadata.props = [];
      this.propertyObj.condition = '';
      this.propertyObj.metadata.properties.forEach((prop) => {
        if (prop.property) {
          const index = this.propertyObj.metadata.props.findIndex((prop1) => prop1 === prop.property.json_key);
          if (index === -1) {
            this.propertyObj.metadata.props.push(prop.property.json_key);
            this.propertyObj.metadata.condition +=
              '%' + this.propertyObj.metadata.props.length + '% ' + (prop.operator ? prop.operator + ' ' : '');
          } else {
            this.propertyObj.metadata.condition +=
              '%' + (index + 1) + '% ' + (prop.operator ? prop.operator + ' ' : '');
          }
          this.propertyObj.condition += prop.property.json_key + (prop.operator ? prop.operator + ' ' : '');
        } else if (prop.value !== null && prop.value !== undefined) {
          this.propertyObj.metadata.condition += prop.value + ' ' + (prop.operator ? prop.operator + ' ' : '');
          this.propertyObj.condition += prop.value + (prop.operator ? prop.operator + ' ' : '');
        }
      });
    }
    console.log(JSON.stringify(this.propertyObj.metadata));
    if (this.propertyObj.threshold && this.type === 'measured_properties') {
      if (
        this.propertyObj.threshold.l1 &&
        this.propertyObj.threshold.h1 &&
        this.propertyObj.threshold.h1 < this.propertyObj.threshold.l1
      ) {
        this.toasterService.showError('H1 must be greater than L1', 'Add Property');
        return;
      }
      if (
        this.propertyObj.threshold.l2 &&
        this.propertyObj.threshold.h2 &&
        this.propertyObj.threshold.h2 < this.propertyObj.threshold.l2
      ) {
        this.toasterService.showError('H2 must be greater than L2', 'Add Property');
        return;
      }
      if (
        this.propertyObj.threshold.l3 &&
        this.propertyObj.threshold.h3 &&
        this.propertyObj.threshold.h3 < this.propertyObj.threshold.l3
      ) {
        this.toasterService.showError('H3 must be greater than L3', 'Add Property');
        return;
      }
      if (
        this.propertyObj.threshold.l1 &&
        this.propertyObj.threshold.l2 &&
        this.propertyObj.threshold.l1 < this.propertyObj.threshold.l2
      ) {
        this.toasterService.showError('L1 must be greater than L2', 'Add Property');
        return;
      }
      if (
        this.propertyObj.threshold.l2 &&
        this.propertyObj.threshold.l3 &&
        this.propertyObj.threshold.l2 < this.propertyObj.threshold.l3
      ) {
        this.toasterService.showError('L2 must be greater than L3', 'Add Property');
        return;
      }
      if (
        this.propertyObj.threshold.h1 &&
        this.propertyObj.threshold.h2 &&
        this.propertyObj.threshold.h1 > this.propertyObj.threshold.h2
      ) {
        this.toasterService.showError('H2 must be greater than H1', 'Add Property');
        return;
      }
      if (
        this.propertyObj.threshold.h2 &&
        this.propertyObj.threshold.h3 &&
        this.propertyObj.threshold.h3 < this.propertyObj.threshold.h2
      ) {
        this.toasterService.showError('H3 must be greater than H2', 'Add Property');
        return;
      }
    }
    this.isCreatePropertyLoading = true;
    const obj = JSON.parse(JSON.stringify(this.assetModel));
    obj.properties = JSON.parse(JSON.stringify(this.properties));
    obj.properties[this.type].push(this.propertyObj);
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService.updateAssetsModel(obj, this.assetModel.app).subscribe(
        (response: any) => {
          this.isCreatePropertyLoading = false;
          this.onCloseAssetsPropertyModal();
          this.toasterService.showSuccess(response.message, 'Add Property');
          this.getAssetsModelProperties();
        },
        (error) => {
          this.isCreatePropertyLoading = false;
          this.toasterService.showError(error.message, 'Add Property');
        }
      )
    );
  }

  deleteProperty() {
    const obj = JSON.parse(JSON.stringify(this.assetModel));
    obj.properties = JSON.parse(JSON.stringify(this.properties));
    const index = obj.properties[this.type].findIndex((prop) => prop.json_key === this.selectedProperty.json_key);
    obj.properties[this.type].splice(index, 1);
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService.updateAssetsModel(obj, this.assetModel.app).subscribe(
        (response: any) => {
          this.isCreatePropertyLoading = false;
          this.onCloseModal('confirmMessageModal');
          this.toasterService.showSuccess(response.message, 'Delete Property');
          this.getAssetsModelProperties();
        },
        (error) => {
          this.isCreatePropertyLoading = false;
          this.toasterService.showError(error.message, 'Delete Property');
        }
      )
    );
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.onCloseModal('confirmMessageModal');
    } else if (eventType === 'save') {
      this.deleteProperty();
    }
  }

  onJSONModalEvents(eventType) {
    if (eventType === 'close') {
      this.onCloseModal('PropJSONModal');
    }
  }

  onCloseAssetsPropertyModal() {
    $('#addPropertiesModal').modal('hide');
    this.propertyObj = undefined;
    this.selectedProperty = undefined;
  }

  updatePropertyData() {
    if (!this.propertyObj.id) {
      this.propertyObj.id = this.commonService.generateUUID();
    }
    if (this.type !== 'edge_derived_properties' && this.type !== 'cloud_derived_properties') {
      this.propertyObj.metadata = this.setupForm?.value;
    }
    if (this.type === 'edge_derived_properties') {
      let flag = false;
      for (let i = 0; i < this.propertyObj.metadata.properties.length; i++) {
        const prop = this.propertyObj.metadata.properties[i];
        if (!prop.property && (prop.value === null || prop.value === undefined)) {
          this.toasterService.showError(
            'Please select property or add value in condition',
            'Add Edge Derived Properity'
          );
          flag = true;
          break;
        }
        if (this.propertyObj.metadata.properties[i + 1] && !prop.operator) {
          this.toasterService.showError('Please select operator in condition', 'Add Edge Derived Properity');
          flag = true;
          break;
        }
      }
      if (flag) {
        return;
      }
      this.propertyObj.metadata.condition = '';
      this.propertyObj.metadata.props = [];
      this.propertyObj.condition = '';
      this.propertyObj.metadata.properties.forEach((prop) => {
        if (prop.property) {
          const index = this.propertyObj.metadata.props.findIndex((prop1) => prop1 === prop.property.json_key);
          if (index === -1) {
            this.propertyObj.metadata.props.push(prop.property.json_key);
            this.propertyObj.metadata.condition +=
              '%' + this.propertyObj.metadata.props.length + '% ' + (prop.operator ? prop.operator + ' ' : '');
          } else {
            this.propertyObj.metadata.condition +=
              '%' + (index + 1) + '% ' + (prop.operator ? prop.operator + ' ' : '');
          }
          this.propertyObj.condition += prop.property.json_key + (prop.operator ? prop.operator + ' ' : '');
        } else if (prop.value !== null && prop.value !== undefined) {
          this.propertyObj.metadata.condition += prop.value + ' ' + (prop.operator ? prop.operator + ' ' : '');
          this.propertyObj.condition += prop.value + (prop.operator ? prop.operator + ' ' : '');
        }
      });
    }
    console.log(JSON.stringify(this.propertyObj.metadata));
    const index = this.properties[this.type].findIndex((prop) => prop.json_key === this.selectedProperty.json_key);
    this.properties[this.type].splice(index, 1);

    if (this.propertyObj?.edit) {
      // this.propertyObj.derived_function = this.code;
      this.properties[this.type].splice(index, 0, this.propertyObj);
    } else {
      // this.selectedProperty.derived_function = this.code;
      this.properties[this.type].splice(index, 0, this.selectedProperty);
    }
    this.isCreatePropertyLoading = true;
    const obj = JSON.parse(JSON.stringify(this.assetModel));
    obj.properties = JSON.parse(JSON.stringify(this.properties));
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService.updateAssetsModel(obj, this.assetModel.app).subscribe(
        (response: any) => {
          this.isCreatePropertyLoading = false;
          this.onCloseModal('configureDerivedPropModal');
          this.onCloseAssetsPropertyModal();
          this.toasterService.showSuccess(response.message, 'Edit Property');
          this.getAssetsModelProperties();
        },
        (error) => {
          this.isCreatePropertyLoading = false;
          this.toasterService.showError(error.message, 'Edit Property');
        }
      )
    );
  }

  onTableFunctionCall(obj) {
    this.selectedProperty = obj.data;
    if (obj.for === 'View JSON Model') {
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true,
      };
      $('#PropJSONModal').modal({ backdrop: 'static', keyboard: false, show: true });
    } else if (obj.for === 'Delete') {
      this.modalConfig = {
        stringDisplay: true,
        isDisplaySave: true,
        isDisplayCancel: true,
      };
      $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    } else if (obj.for === 'Configure Property') {
      $('#configureDerivedPropModal').modal({ backdrop: 'static', keyboard: false, show: true });
    } else if (obj.for === 'Edit') {
      this.propertyObj = JSON.parse(JSON.stringify(obj.data));
      this.propertyObj.edit = true;
      if (this.type !== 'edge_derived_properties' && this.type !== 'cloud_derived_properties') {
        this.setupForm = new FormGroup({
          slave_id: new FormControl(this.propertyObj?.metadata?.slave_id, [Validators.required]),
        });
        if (this.assetModel.metadata?.model_type === CONSTANTS.NON_IP_ASSET) {
          if (
            this.assetModel.tags.protocol === 'ModbusTCPMaster' ||
            this.assetModel.tags.protocol === 'ModbusRTUMaster'
          ) {
            this.setupForm = new FormGroup({
              slave_id: new FormControl(this.propertyObj?.metadata?.slave_id, [Validators.required]),
              d: new FormControl(this.propertyObj?.metadata?.d, [Validators.required]),
              sa: new FormControl(this.propertyObj?.metadata?.sa, [
                Validators.required,
                Validators.min(0),
                Validators.max(99999),
              ]),
              a: new FormControl(false),
              fc: new FormControl(this.propertyObj?.metadata?.fc, [Validators.required]),
            });
          } else if (this.assetModel.tags.protocol === 'SiemensTCPIP') {
            this.setupForm = new FormGroup({
              slave_id: new FormControl(this.propertyObj?.metadata?.slave_id, [Validators.required]),
              d: new FormControl(this.propertyObj?.metadata?.d, [Validators.required]),
              sa: new FormControl(this.propertyObj?.metadata?.sa, [
                Validators.required,
                Validators.min(0),
                Validators.max(99999),
              ]),
              a: new FormControl(false),
              mt: new FormControl(this.propertyObj?.metadata?.mt, [Validators.required]),
            });
          } else if (this.assetModel.tags.protocol === 'BlueNRG') {
            this.setupForm = new FormGroup({
              slave_id: new FormControl(this.propertyObj?.metadata?.slave_id, [Validators.required]),
              sa: new FormControl(this.propertyObj?.metadata?.sa, [
                Validators.required,
                Validators.min(0),
                Validators.max(99999),
              ]),
              a: new FormControl(false),
              p: new FormControl(this.propertyObj?.metadata?.p, [Validators.required]),
              t: new FormControl(this.propertyObj?.metadata?.t, [Validators.required]),
            });
          } else if (this.assetModel.tags.protocol === 'AIoTInputs') {
            this.setupForm = new FormGroup({
              slave_id: new FormControl(this.propertyObj?.metadata?.slave_id, [Validators.required]),
              cn: new FormControl(this.propertyObj?.metadata?.cn, [Validators.required, Validators.min(0)]),
              a: new FormControl(false),
              d: new FormControl(this.propertyObj?.metadata?.d, [Validators.required]),
            });
          }
        }
      }
      $('#addPropertiesModal').modal({ backdrop: 'static', keyboard: false, show: true });
      // setTimeout(() => {
      //   this.editor.set(this.propertyObj.json_model);
      // }, 1000);
    }
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
    this.selectedProperty = undefined;
    this.options = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
