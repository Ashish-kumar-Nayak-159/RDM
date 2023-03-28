import { FormGroup, FormControl, Validators, RequiredValidator } from '@angular/forms';
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
  selector: 'app-newasset-model-properties',
  templateUrl: './newasset-model-properties.component.html',
  styleUrls: ['./newasset-model-properties.component.css']
})
export class NewassetModelPropertiesComponent implements OnInit, OnChanges, OnDestroy {
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
  formula: String;
  isDisabled = false;
  displaybutton = false;
  setBasedOnSelection: boolean = false;
  viewModelData: any;
  customeType: string;
  constructor(
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) {
    this.setType();
  }
  setType() {
    if (this.type == 'newmeasured') {
      this.type = "measured_properties";
    }
    else if (this.type == 'edge_derived_measured') {
      this.type = "edge_derived_properties";
    }
    else if (this.type == 'controllable_measured') {
      this.type = "controllable_properties";
      this.customeType = "measured_properties";
      // setTimeout(() => {
      //   if (this.properties['measured_properties'] && this.properties['measured_properties']?.length > 0) {
      //     this.type = "controllable_properties";
      //     this.getModelProperties();
      //   }
      // }, 1000);
    }
    else if (this.type == 'configurable_measured') {
      this.type = "configurable_properties";
    }
  }
  ngOnInit(): void {
    this.setType();
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.modes = ['code', 'view'];
    this.editorOptions.mode = 'view';
    this.editorOptions.expandAll = true;
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
          name: 'Units',
          key: 'unit',
          type: 'text',
          headerClass: 'w-15',
          valueclass: '',
        },

        {
          name: 'Data Type',
          key: 'datatype',
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
    if (this.type.includes('measured') || this.type.includes('controllable')) {
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
        this.propertyTableConfig.data[5].btnData.splice(1);
        this.propertyTableConfig.data[5].btnData.splice(2);
      }
    }

    this.getModelProperties();
    // this.getAssetsModelProperties();
  }

  getModelProperties() {
    this.setType();

    this.dependentProperties = [];
    this.dependentProperty = [];
    this.isPropertiesLoading = true;
    const obj = {
      app: this.assetModel.app,
      name: this.assetModel.name,
    };

    let cType = (this.type == 'controllable_properties' ? 'measured_properties' : this.type);
    this.subscriptions.push(
      this.assetModelService.getModelProperties(this.assetModel.name, cType).subscribe((response: any) => {
        // this.properties = response.data;
        this.properties[cType] = response.data;

        if (this.type === 'measured_properties' || this.type == 'controllable_properties') {
          response?.data?.forEach(element => {
            element.unit = element?.json_model[element.json_key]?.unit;
          });
        } else if (this.type === 'cloud_derived_properties') {
          response?.data?.forEach(element => {
            element.unit = element?.json_model[element.json_key]?.unit;
          });

        } else if (this.type === 'edge_derived_properties') {
          response?.data?.forEach(element => {
            element.unit = element?.json_model[element.json_key]?.unit;
          });

        }
        this.properties[this.type] = this.properties[this.type] ? this.properties[this.type] : [];
        if (this.type.includes('edge_derived')) {
          response?.data?.forEach((prop) => (prop.type = 'Measured Properties'));
          if (response.properties?.measured_properties) {
            response.properties?.measured_properties.forEach(element => {
              if (element.datatype == "Number") {
                this.dependentProperties.push(element)
              }
            });
          }
          // this.dependentProperties = response.properties?.measured_properties
          //   ? response.properties?.measured_properties
          //   : [];
        }
        // if (this.type.includes('derived')) {
        //   this.properties[this.type] = this.properties[this.type].filter(
        //     (prop) => (prop.condition = '(' + prop.condition + ')')
        //   );
        // }
        this.isPropertiesLoading = false;
        if (this.type == 'measured_properties' || this.type == 'controllable_properties') {
          if (this.properties['measured_properties'] && this.properties['measured_properties']?.length > 0) {
            this.properties['measured_properties'] = this.properties['measured_properties'].map((detail: any) => {
              if (!detail?.metadata?.rw) {
                if (!("metadata" in detail)) {
                  detail.metadata = {};
                }
                detail.metadata.rw = 'r';
                detail.is_read = true;
              } else {
                if (detail.metadata.fc_r == "0" || detail.metadata.fc_r == 0) {
                  detail.metadata.fc_r = null;
                  detail.metadata.fc = null;
                }
                if (detail.metadata.rw == 'rw') {
                  detail.is_read = true;
                  detail.is_write = true;
                } else if (detail.metadata.rw == 'r') {
                  detail.is_read = true;
                } else if (detail.metadata.rw == 'w') {
                  detail.is_write = true;
                }
              }
              if (!("fc_r" in detail.metadata)) {
                if (("fc" in detail.metadata)) {
                  detail.metadata.fc_r = detail.metadata.fc;
                }
              }
              if (("fc_w" in detail.metadata) && typeof (detail.metadata.fc_w) == 'string') {
                detail.metadata.fc_w = parseInt(detail.metadata.fc_w);
              }
              return detail;
            })
            //do not change the order of this two line.. because in this some case what it doest it will filter of r | rw and assined again to measured properties 
            //and then we are again finding from meassured properties so here what happes, now it list we doent find the w | rw values  
            this.properties['controllable_properties'] = this.properties['measured_properties'].filter((detail) => { return detail.metadata.rw == 'w' || detail.metadata.rw == 'rw' })
            this.properties['measured_properties'] = this.properties['measured_properties'].filter((detail: any) => { return detail.metadata.rw == 'r' || detail.metadata.rw == 'rw' })

          } else {
            this.properties[this.type] = [];
          }
        }
      })
    );
  }

  getAssetsModelProperties() {
    // this.properties = {};
    this.dependentProperties = [];
    this.dependentProperty = [];
    this.isPropertiesLoading = true;
    const obj = {
      app: this.assetModel.app,
      name: this.assetModel.name,
    };
    this.subscriptions.push(
      this.assetModelService.getAssetsModelProperties(obj).subscribe((response: any) => {
        this.properties = response.properties;

        if (this.type === 'measured_properties' || this.type == 'controllable_properties') {
          response.properties?.measured_properties?.forEach(element => {
            element.unit = element?.json_model[element.json_key]?.unit;
          });
        } else if (this.type === 'cloud_derived_properties') {
          response.properties?.cloud_derived_properties?.forEach(element => {
            element.unit = element?.json_model[element.json_key]?.unit;
          });

        } else if (this.type === 'edge_derived_properties') {
          response.properties?.edge_derived_properties?.forEach(element => {
            element.unit = element?.json_model[element.json_key]?.unit;
          });

        }
        this.properties[this.type] = this.properties[this.type] ? this.properties[this.type] : [];
        if (this.type.includes('edge_derived')) {
          response.properties?.measured_properties?.forEach((prop) => (prop.type = 'Measured Properties'));
          if (response.properties?.measured_properties) {
            response.properties?.measured_properties.forEach(element => {
              if (element.datatype == "Number") {
                this.dependentProperties.push(element)
              }
            });
          }
          // this.dependentProperties = response.properties?.measured_properties
          //   ? response.properties?.measured_properties
          //   : [];
        }
        // if (this.type.includes('derived')) {
        //   this.properties[this.type] = this.properties[this.type].filter(
        //     (prop) => (prop.condition = '(' + prop.condition + ')')
        //   );
        // }
        this.isPropertiesLoading = false;
        if (this.type == 'measured_properties' || this.type == 'controllable_properties') {
          if (this.properties['measured_properties'] && this.properties['measured_properties']?.length > 0) {
            this.properties['measured_properties'] = this.properties['measured_properties'].map((detail: any) => {
              if (!detail?.metadata?.rw) {
                if (!("metadata" in detail)) {
                  detail.metadata = {};
                }
                detail.metadata.rw = 'r';
                detail.is_read = true;
              } else {
                if (detail.metadata.fc_r == "0" || detail.metadata.fc_r == 0) {
                  detail.metadata.fc_r = null;
                  detail.metadata.fc = null;
                }
                if (detail.metadata.rw == 'rw') {
                  detail.is_read = true;
                  detail.is_write = true;
                } else if (detail.metadata.rw == 'r') {
                  detail.is_read = true;
                } else if (detail.metadata.rw == 'w') {
                  detail.is_write = true;
                }
              }
              if (!("fc_r" in detail.metadata)) {
                if (("fc" in detail.metadata)) {
                  detail.metadata.fc_r = detail.metadata.fc;
                }
              }
              if (("fc_w" in detail.metadata) && typeof (detail.metadata.fc_w) == 'string') {
                detail.metadata.fc_w = parseInt(detail.metadata.fc_w);
              }
              return detail;
            })
            //do not change the order of this two line.. because in this some case what it doest it will filter of r | rw and assined again to measured properties 
            //and then we are again finding from meassured properties so here what happes, now it list we doent find the w | rw values  
            this.properties['controllable_properties'] = this.properties['measured_properties'].filter((detail) => { return detail.metadata.rw == 'w' || detail.metadata.rw == 'rw' })
            this.properties['measured_properties'] = this.properties['measured_properties'].filter((detail: any) => { return detail.metadata.rw == 'r' || detail.metadata.rw == 'rw' })

          } else {
            this.properties[this.type] = [];
          }
        }
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
  deletePropertyCondtion(propindex: number, propObj) {
    const index = this.propertyObj.metadata.properties.indexOf(propindex);
    this.propertyObj.metadata.properties.splice(index, 1);
    propObj.operator = ' ';
    this.formula = '';
  }
  readWriteValue(type) {
    if (this.propertyObj.is_write == true) {
      this.setupForm.controls["fc_w"].setValidators([Validators.required]);
      this.setupForm.get('fc_w').updateValueAndValidity();
    } else if (this.propertyObj.is_write == false) {
      this.setupForm.get('fc_w').setValidators([]); // or clearValidators()
      this.setupForm.get('fc_w').setValue(null); // or clear Values()
      this.setupForm.get('fc_w').updateValueAndValidity();
    }
    if (this.propertyObj.is_read == true) {
      this.setupForm.controls["fc_r"].setValidators([Validators.required]);
      this.setupForm.get('fc_r').updateValueAndValidity();
    } else if (this.propertyObj.is_read == false) {
      this.setupForm.get('fc_r').setValidators([]); // or clearValidators()
      this.setupForm.get('fc_r').setValue(null);
      this.setupForm.get('fc_r').updateValueAndValidity();
    }
    if (this.propertyObj.is_read == false && this.propertyObj.is_write == false) {
      this.setBasedOnSelection = true;
    } else {
      this.setBasedOnSelection = false;
    }
  }
  openAddPropertiesModal() {
    this.isDisabled = false;
    this.displaybutton = false;
    this.formula = '';
    this.propertyObj = {
      json_model: {},
      threshold: {},
      is_read: true,
      is_write: false,
    };
    if (this.type == 'controllable_properties') {
      this.propertyObj.is_read = false;
      this.propertyObj.is_write = true;
    }
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
        slave_id: new FormControl("", [Validators.required]),
      });
      if (this.assetModel.metadata?.model_type === CONSTANTS.NON_IP_ASSET) {
        if (
          this.assetModel.tags.protocol === 'ModbusTCPMaster' ||
          this.assetModel.tags.protocol === 'ModbusRTUMaster'
        ) {
          if (this.propertyObj.is_read == true) {
            this.setupForm = new FormGroup({
              slave_id: new FormControl("", [Validators.required]),
              d: new FormControl(null, [Validators.required]),
              sa: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99999)]),
              a: new FormControl(false),
              fc_r: new FormControl(null, [Validators.required]),
              fc_w: new FormControl(null),
            });
          } else {
            this.setupForm = new FormGroup({
              slave_id: new FormControl("", [Validators.required]),
              d: new FormControl(null, [Validators.required]),
              sa: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99999)]),
              a: new FormControl(false),
              fc_r: new FormControl(null),
              fc_w: new FormControl(null, [Validators.required]),
            });
          }

        } else if (this.assetModel.tags.protocol === 'SiemensTCPIP') {
          this.setupForm = new FormGroup({
            slave_id: new FormControl("", [Validators.required]),
            d: new FormControl(null, [Validators.required]),
            sa: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99999)]),
            a: new FormControl(false),
            mt: new FormControl(null, [Validators.required]),
          });
        } else if (this.assetModel.tags.protocol === 'BlueNRG') {
          this.setupForm = new FormGroup({
            slave_id: new FormControl("", [Validators.required]),
            sa: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(99999)]),
            a: new FormControl(false),
            p: new FormControl(2, [Validators.required]),
            t: new FormControl(null, [Validators.required]),
            pt: new FormControl(null, [Validators.required]),
          });
        } else if (this.assetModel.tags.protocol === 'AIoTInputs') {
          this.setupForm = new FormGroup({
            slave_id: new FormControl("", [Validators.required]),
            cn: new FormControl(null, [Validators.required, Validators.min(0)]),
            a: new FormControl(false),
            d: new FormControl(null, [Validators.required]),
          });
        }
      }
    }

    // this.assetModel.tags.app = this.contextApp.app;
    $('#addPropertiesModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onJSONKeyChange() {
    if (this.propertyObj.json_key) {
      const keys = Object.keys(this.propertyObj.json_model);
      const obj = {};
      if (keys && keys.length > 0) {
        obj[this.propertyObj.json_key] = this.propertyObj.json_model[keys[0]];
        this.propertyObj.json_model = obj;
      } else {
        this.propertyObj.json_model = {};
        obj[this.propertyObj.json_key] = {};
        if (this.propertyObj.datatype) {
          this.onDataTypeChange();
        } else {
          this.propertyObj.json_model = obj;
        }
      }
    } else {
      this.propertyObj.json_model = {};
    }
    // this.editor.set(this.propertyObj.json_model);
  }

  onDataTypeChange() {
    const obj = {};
    if (this.propertyObj.datatype && this.propertyObj.json_key) {
      const validations = this.dataTypeList.find((type) => type.name === this.propertyObj.datatype).validations;
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
      this.propertyObj.json_model = {};
      this.propertyObj.json_model[this.propertyObj.json_key] = obj;
      this.propertyObj.json_model[this.propertyObj.json_key].type = this.propertyObj.datatype.toLowerCase();



    } else {
      this.propertyObj.json_model = {};
    }
    // this.editor.set(this.propertyObj.json_model);
  }



  ValidateallInputField() {
    if (this.type !== 'edge_derived_properties' && this.type !== 'cloud_derived_properties') {
      this.propertyObj.metadata = this.setupForm?.value;
    }
    this.propertyObj.id = this.commonService.generateUUID();
    if (!this.propertyObj.name || !this.propertyObj.json_key || !this.propertyObj.datatype) {
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
              '%' + (this.propertyObj.metadata.props.length + '% ' + (prop.operator ? prop.operator + ' ' : ''));
          } else {
            this.propertyObj.metadata.condition +=
              '%' + (index + 1) + '% ' + (prop.operator ? prop.operator + ' ' : '');
          }
          // this.formula.push(this.propertyObj.metadata.condition)
          this.propertyObj.condition += prop.property.json_key + (prop.operator ? prop.operator + ' ' : '');
          this.formula = '(' + ' ' + this.propertyObj.metadata.condition + ')'

        } else if (prop.value !== null && prop.value !== undefined) {
          this.propertyObj.metadata.condition += prop.value + ' ' + (prop.operator ? prop.operator + ' ' : '');
          this.propertyObj.condition += prop.value + (prop.operator ? prop.operator + ' ' : '');
          this.formula = '(' + ' ' + this.propertyObj.metadata.condition + ')'

        }
      });
    }
    else if (this.type === 'measured_properties' && (!this.propertyObj.hasOwnProperty('group') || this.propertyObj.group === 'undefined')) {
      this.toasterService.showError(
        UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED,
        'Add ' + this.getPropertyNameToAddOrUpdate()
      );
      return;
    }
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
      this.validateSetThreshold();
    }
    this.isDisabled = true;
    //this.onSavePropertyObj()
  }

  clearInputField() {
    this.isDisabled = false;
  }

  onSavePropertyObj() {
    if (this.isDisabled === false) {
      if (this.type !== 'edge_derived_properties' && this.type !== 'cloud_derived_properties') {
        this.propertyObj.metadata = this.setupForm?.value;
      }
      this.propertyObj.id = this.commonService.generateUUID();
      if (!this.propertyObj.name || !this.propertyObj.json_key || !this.propertyObj.datatype) {
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
      else if (this.type === 'measured_properties' && (!this.propertyObj.hasOwnProperty('group') || this.propertyObj.group === 'undefined')) {
        this.toasterService.showError(
          UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED,
          'Add ' + this.getPropertyNameToAddOrUpdate()
        );
        return;
      }
      if (this.propertyObj.threshold && this.type === 'measured_properties') {
        if (this.propertyObj.threshold.l1 && this.propertyObj.threshold.h1 && this.propertyObj.threshold.h1 < this.propertyObj.threshold.l1) {
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
        this.validateSetThreshold();
      }

      this.isCreatePropertyLoading = true;
      var obj = JSON.parse(JSON.stringify(this.assetModel));
      obj.properties = JSON.parse(JSON.stringify(this.properties));
      if (this.type == 'measured_properties' || this.type == 'controllable_properties') {
        if (this.propertyObj.is_read == true && this.propertyObj.is_write == true) {
          this.propertyObj['metadata']['rw'] = 'rw'
        } else if (this.propertyObj.is_read == true) {
          this.propertyObj['metadata']['rw'] = 'r'
        } else if (this.propertyObj.is_write == true) {
          this.propertyObj['metadata']['rw'] = 'w'
        }
        this.propertyObj['metadata']['fc'] = this.propertyObj['metadata']['fc_r'];
        // let mergedObject = [...(obj?.properties?.measured_properties)]
        // if (obj?.properties?.controllable_properties) {

        //   mergedObject = [...mergedObject, ...(obj?.properties?.controllable_properties)];
        // }

        // const unique = [...new Map(mergedObject.map(item => [item.json_key, item])).values()];

        // obj.properties['measured_properties'] = unique;

        // obj.properties['measured_properties'].push(this.propertyObj);
      } else {
        // obj.properties[this.type].push(this.propertyObj);
      }

      obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';

      if (this.propertyObj.json_model && this.propertyObj?.datatype?.toLowerCase() == "enum") {
        if (this.propertyObj.json_model[this.propertyObj.json_key].enum.length == 0) {
          this.isCreatePropertyLoading = false;
          this.toasterService.showError('please enter all enum property', 'Add Property');
          return;
        }
        // if (this.propertyObj.json_model[this.propertyObj.json_key].enum.length > 0) {
        //   let enumIsValid = true;
        //   this.propertyObj.json_model[this.propertyObj.json_key].enum.forEach(element => {
        //     if (!element.label || element.label == "") {
        //       enumIsValid = false;
        //     }
        //     if (!element.data_type || element.data_type == "") {
        //       enumIsValid = false;
        //     }
        //     if (!element.value || element.value == "") {
        //       enumIsValid = false;
        //     }
        //   });
        //   if (!enumIsValid) {
        //     this.isCreatePropertyLoading = false;
        //     this.toasterService.showError('please enter all enum property', 'Add Property');
        //     return;
        //   }
        // }
      }

      let reqObj =
      {
        "type": this.type == 'controllable_properties' ? 'measured_properties' : this.type,
        "name": this.propertyObj.name,
        "json_key": this.propertyObj.json_key,
        "datatype": this.propertyObj.datatype,
        "metadata": this.propertyObj.metadata,
        "unit": this.propertyObj.json_model[this.propertyObj.json_key].unit,
        "group": this.type == "configurable_properties" ? "NA" : this.propertyObj.group,
        "threshold": this.propertyObj.threshold,
        "json_model": this.propertyObj.json_model,
        "condition": this.propertyObj.condition,
        "is_read": this.propertyObj.is_read,
        "is_write": this.propertyObj.is_write
      }


      this.upsertModelProperty(reqObj, 0);

    } else {
      let condition = this.formula;
      this.propertyObj.metadata.properties?.forEach((prop) => {
        const index = this.propertyObj.metadata.props.findIndex((prop1) => prop1 === prop?.property?.json_key);
        condition = condition.replace(`%${index + 1}%`, prop?.property?.json_key);
        this.propertyObj.condition = condition;
      });
      this.propertyObj.metadata.condition = this.formula;
      this.isCreatePropertyLoading = true;
      const obj = JSON.parse(JSON.stringify(this.assetModel));
      obj.properties = JSON.parse(JSON.stringify(this.properties));
      obj.properties[this.type].push(this.propertyObj);
      obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
      return
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
  }

  validateSetThreshold() {
    if (this.propertyObj.threshold.l1 == null && this.propertyObj.threshold.l2 == null && this.propertyObj.threshold.l3 == null && this.propertyObj.threshold.h1 == null && this.propertyObj.threshold.h2 == null && this.propertyObj.threshold.h3 == null) {
      this.propertyObj.threshold = {};
    }
  }

  deleteProperty() {
    const obj = JSON.parse(JSON.stringify(this.assetModel));
    obj.properties = JSON.parse(JSON.stringify(this.properties));

    // const index = obj.properties[this.type].findIndex((prop) => prop.json_key === this.selectedProperty.json_key);
    // obj.properties[this.type].splice(index, 1);

    if (this.type == 'controllable_properties' || this.type == 'measured_properties') {
      let mergedObject = [...obj.properties['measured_properties'], ...obj.properties['controllable_properties']];
      const unique = [...new Map(mergedObject.map(item => [item.json_key, item])).values()];
      obj.properties['measured_properties'] = unique;
      const index = obj.properties['measured_properties'].findIndex((prop) => prop.json_key === this.selectedProperty.json_key);
      obj.properties['measured_properties'].splice(index, 1);
    } else {
      const index = obj.properties[this.type].findIndex((prop) => prop.json_key === this.selectedProperty.json_key);
      obj.properties[this.type].splice(index, 1);

    }
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';


    this.subscriptions.push(
      this.assetModelService.deleteModelProperty(this.selectedProperty.id, this.assetModel.name).subscribe(
        (response: any) => {
          this.isCreatePropertyLoading = false;
          this.onCloseModal('confirmMessageModal');
          this.toasterService.showSuccess(response.message, 'Delete Property');
          this.getModelProperties();
        },
        (error) => {
          this.isCreatePropertyLoading = false;
          this.toasterService.showError(error.message, 'Delete Property');
        }
      )
    );

    // this.subscriptions.push(
    //   this.assetModelService.updateAssetsModel(obj, this.assetModel.app).subscribe(
    //     (response: any) => {
    //       this.isCreatePropertyLoading = false;
    //       this.onCloseModal('confirmMessageModal');
    //       this.toasterService.showSuccess(response.message, 'Delete Property');
    //       this.getAssetsModelProperties();
    //     },
    //     (error) => {
    //       this.isCreatePropertyLoading = false;
    //       this.toasterService.showError(error.message, 'Delete Property');
    //     }
    //   )
    // );
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
    this.isDisabled = false;
  }

  updatePropertyData() {
    if (!this.propertyObj.id) {
      this.propertyObj.id = this.commonService.generateUUID();
    }
    if (this.type !== 'edge_derived_properties' && this.type !== 'cloud_derived_properties') {
      this.propertyObj.metadata = this.setupForm?.value;
    }
    if (this.propertyObj.json_key.length <= 0 || this.propertyObj.name.length <= 0
      || this.propertyObj.datatype.length <= 0 || this.propertyObj.datatype === 'undefined') {
      this.toasterService.showError(
        UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED,
        'Add ' + this.getPropertyNameToAddOrUpdate()
      );
      return;
    }
    if (this.type === 'edge_derived_properties') {
      let condition = this.formula;
      this.propertyObj.metadata.properties?.forEach((prop) => {
        const index = this.propertyObj.metadata.props.findIndex((prop1) => prop1 === prop?.property?.json_key);
        condition = condition.replace(`%${index + 1}%`, prop?.property?.json_key);
        this.propertyObj.condition = condition;
      });
      this.propertyObj.metadata.condition = this.formula;

    }
    else if (this.type === 'measured_properties' && (!this.propertyObj.hasOwnProperty('group') || this.propertyObj.group === 'undefined')) {
      this.toasterService.showError(
        UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED,
        'Add ' + this.getPropertyNameToAddOrUpdate()
      );
      return;
    }
    var index;
    if (this.type == 'measured_properties' || this.type == 'controllable_properties') {
      let mergedObject = [...this.properties['measured_properties'], ...this.properties['controllable_properties']];
      const unique = [...new Map(mergedObject.map(item => [item.json_key, item])).values()];

      this.properties['measured_properties'] = unique;

      index = this.properties['measured_properties'].findIndex((prop) => prop.json_key === this.selectedProperty.json_key);
      this.properties['measured_properties'].splice(index, 1);

    } else {
      index = this.properties[this.type].findIndex((prop) => prop.json_key === this.selectedProperty.json_key);
      this.properties[this.type].splice(index, 1);
    }

    this.validateSetThreshold();
    if (this.propertyObj?.edit) {
      // this.propertyObj.derived_function = this.code;
      if (this.type == 'measured_properties' || this.type == 'controllable_properties') {
        this.properties['measured_properties'].splice(index, 0, this.propertyObj);
      } else {
        this.properties[this.type].splice(index, 0, this.propertyObj);
      }
    } else {
      // this.selectedProperty.derived_function = this.code;
      if (this.type == 'measured_properties' || this.type == 'controllable_properties') {
        this.properties['measured_properties'].splice(index, 0, this.propertyObj);
      } else {
        this.properties[this.type].splice(index, 0, this.propertyObj);
      }
    }
    this.isCreatePropertyLoading = true;
    const obj = JSON.parse(JSON.stringify(this.assetModel));
    obj.properties = JSON.parse(JSON.stringify(this.properties));
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';



    if (this.type == 'measured_properties' || this.type == 'controllable_properties') {
      obj.properties['measured_properties'].map((detail) => {
        if (detail.json_key == this.selectedProperty.json_key) {
          if (detail.is_read == true && detail.is_write == true) {
            detail['metadata']['rw'] = 'rw'
          } else if (detail.is_read == true) {
            detail['metadata']['rw'] = 'r'
          } else if (detail.is_write == true) {
            detail['metadata']['rw'] = 'w'
          }
          detail['metadata']['fc'] = detail['metadata']['fc_r'];
          return detail;
        } else {
          return detail;
        }
      });
      this.propertyObj = obj.properties['measured_properties'].find(x => x.id == this.propertyObj.id);
    }

    if (this.propertyObj.json_model && this.propertyObj?.datatype?.toLowerCase() == "enum") {
      if (this.propertyObj.json_model[this.propertyObj.json_key].enum.length > 0) {
        let enumIsValid = true;
        this.propertyObj.json_model[this.propertyObj.json_key].enum.forEach(element => {
          if (!element.label || element.label == "") {
            enumIsValid = false;
          }
          if (!element.enum_type || element.enum_type == "") {
            enumIsValid = false;
          }
          if (!element.value || element.value == "") {
            enumIsValid = false;
          }
        });
        if (!enumIsValid) {
          this.isCreatePropertyLoading = false;
          this.toasterService.showError('please enter all enum property', 'Add Property');
          return;
        }
      }
    }

    let reqObj =
    {
      "type": this.type == 'controllable_properties' ? 'measured_properties' : this.type,
      "name": this.propertyObj.name,
      "json_key": this.propertyObj.json_key,
      "datatype": this.propertyObj.datatype,
      "metadata": this.propertyObj.metadata,
      "unit": this.propertyObj.json_model[this.propertyObj.json_key].unit,
      "group": this.type == "configurable_properties" ? "NA" : this.propertyObj.group,
      "threshold": this.propertyObj.threshold,
      "json_model": this.propertyObj.json_model,
      // "condition": this.propertyObj.condition,
      "is_read": this.propertyObj.is_read,
      "is_write": this.propertyObj.is_write
    }

    this.upsertModelProperty(reqObj, this.propertyObj.id);

  }
  updatePropertyDataValidate() {
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
          this.formula = '(' + ' ' + this.propertyObj.metadata.condition + ')'

        } else if (prop.value !== null && prop.value !== undefined) {
          this.propertyObj.metadata.condition += prop.value + ' ' + (prop.operator ? prop.operator + ' ' : '');
          this.propertyObj.condition += prop.value + (prop.operator ? prop.operator + ' ' : '');
          this.formula = '(' + ' ' + this.propertyObj.metadata.condition + ')'

        }
      });
    }

    this.isDisabled = true;

    // this.updatePropertyData()
  }

  UpdatePropertyAfterValidate() {
    this.propertyObj.metadata.condition = this.formula;
    const index = this.properties[this.type].findIndex((prop) => prop.json_key === this.selectedProperty.json_key);
    this.properties[this.type].splice(index, 1);
    this.validateSetThreshold();
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
    return
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
      this.getModelPropertybyId(obj.data.id);
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
      this.formula = obj?.data?.metadata?.condition;
      this.isDisabled = false;
      this.propertyObj = JSON.parse(JSON.stringify(obj.data));
      if (!this.propertyObj.threshold) {
        this.propertyObj.threshold = {};
      }
      if (this.propertyObj?.group) {
        this.propertyObj.group = this.propertyObj?.group.toUpperCase() ? this.propertyObj?.group.toUpperCase() : 'undefined';
      }
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
            if (this.propertyObj.is_write == true && this.propertyObj.is_read == true) {
              this.setupForm = new FormGroup({
                slave_id: new FormControl(this.propertyObj?.metadata?.slave_id, [Validators.required]),
                d: new FormControl(this.propertyObj?.metadata?.d, [Validators.required]),
                sa: new FormControl(this.propertyObj?.metadata?.sa, [
                  Validators.required,
                  Validators.min(0),
                  Validators.max(99999),
                ]),
                a: new FormControl(false),
                fc_r: new FormControl(this.propertyObj?.metadata?.fc_r, [Validators.required]),
                fc_w: new FormControl(this.propertyObj?.metadata?.fc_w, [Validators.required]),
              });
            } else if (this.propertyObj.is_read == true) {
              this.setupForm = new FormGroup({
                slave_id: new FormControl(this.propertyObj?.metadata?.slave_id, [Validators.required]),
                d: new FormControl(this.propertyObj?.metadata?.d, [Validators.required]),
                sa: new FormControl(this.propertyObj?.metadata?.sa, [
                  Validators.required,
                  Validators.min(0),
                  Validators.max(99999),
                ]),
                a: new FormControl(false),
                fc_r: new FormControl(this.propertyObj?.metadata?.fc_r, [Validators.required]),
                fc_w: new FormControl(this.propertyObj?.metadata?.fc_w, []),
              });
            } else if (this.propertyObj.is_write == true) {
              this.setupForm = new FormGroup({
                slave_id: new FormControl(this.propertyObj?.metadata?.slave_id, [Validators.required]),
                d: new FormControl(this.propertyObj?.metadata?.d, [Validators.required]),
                sa: new FormControl(this.propertyObj?.metadata?.sa, [
                  Validators.required,
                  Validators.min(0),
                  Validators.max(99999),
                ]),
                a: new FormControl(false),
                fc_r: new FormControl(this.propertyObj?.metadata?.fc_r, []),
                fc_w: new FormControl(this.propertyObj?.metadata?.fc_w, [Validators.required]),
              });
            }

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
    this.isDisabled = false
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  getPropertyNameToAddOrUpdate() {
    return (this.type.includes('measured') ? 'Measured Property' : (
      this.type.includes('controllable') ? 'Controllable Property' : (
        this.type.includes('configurable') ? 'Configurable Property' : (
          this.type.includes('edge_derived') ? 'Edge Derived Property' : (
            this.type.includes('cloud_derived') ? 'Cloud Derived Property' : ''
          )
        )
      )
    ))
  }

  upsertModelProperty(reqObj, id) {
    if (id > 0) {
      reqObj.id = id;
      this.subscriptions.push(
        this.assetModelService.updateModelProperty(reqObj, this.assetModel.name).subscribe(
          (response: any) => {
            this.isCreatePropertyLoading = false;
            this.onCloseAssetsPropertyModal();
            this.toasterService.showSuccess(response.message, 'Update Property');
            this.getModelProperties();
            // this.getAssetsModelProperties();
          },
          (error) => {
            this.isCreatePropertyLoading = false;
            this.toasterService.showError(error.message, 'Update Property');
          }
        )
      );
    }
    else {
      this.subscriptions.push(
        this.assetModelService.createModelProperty(reqObj, this.assetModel.name).subscribe(
          (response: any) => {
            this.isCreatePropertyLoading = false;
            this.onCloseAssetsPropertyModal();
            this.toasterService.showSuccess(response.message, 'Add Property');
            this.getModelProperties();
            // this.getAssetsModelProperties();
          },
          (error) => {
            this.isCreatePropertyLoading = false;
            this.toasterService.showError(error.message, 'Add Property');
          }
        )
      );
    }

  }

  getModelPropertybyId(id) {
    this.subscriptions.push(
      this.assetModelService.getModelProperty(id, this.assetModel.name).subscribe((response: any) => {
        this.viewModelData = response;
      }))
  }
}

