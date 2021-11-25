import { CommonService } from 'src/app/services/common.service';
import { Subscription } from 'rxjs';
import { MatNativeDateModule } from '@angular/material/core';
import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
import { constants } from 'buffer';

declare var $: any;
@Component({
  selector: 'app-asset-model-device-methods',
  templateUrl: './asset-model-device-methods.component.html',
  styleUrls: ['./asset-model-device-methods.component.css'],
})
export class AssetModelDeviceMethodsComponent implements OnInit, OnDestroy {
  @Input() assetModel: any;
  assetMethods: any = {};
  isAssetMethodsLoading = false;
  selectedHeartbeat: any;
  isFilterSelected = true;
  modalConfig: any;
  pageType: string;
  assetMethodTableConfig: any = {};
  assetMethodObj: any;
  dataTypeList = CONSTANTS.PROPERTY_DATA_TYPE_LIST;
  isCreateAssetMethodLoading = false;
  selectedAssetMethod: any;
  assetMethodsList: any = [];
  editorOptions: JsonEditorOptions;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  subscriptions: Subscription[] = [];
  contextApp: any;
  userData: any;
  decodedToken: any;
  constructor(
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.setUpAssetMethodsData();
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
    this.editorOptions.statusBar = false;
  }

  setUpAssetMethodsData() {
    this.assetMethods = [];
    this.assetMethodTableConfig = {
      freezed: this.assetModel.freezed,
      tableHeight: 'calc(100vh - 11rem)',
      type: 'Direct Methods',
      data: [
        {
          name: 'Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Method Name',
          key: 'method_name',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Actions',
          key: undefined,
          type: 'button',
          isColumnHidden: false,
          headerClass: '',
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
    this.getAssetsModelAssetMethod();
  }

  getAssetsModelAssetMethod() {
    // this.assetMethods = {};
    this.isAssetMethodsLoading = true;
    const obj = {
      app: this.contextApp.app,
      name: this.assetModel.name,
    };
    this.subscriptions.push(
      this.assetModelService.getAssetsModelAssetMethods(obj).subscribe((response: any) => {
        this.assetMethods = response.direct_methods;
        this.isAssetMethodsLoading = false;
      })
    );
  }

  addParameter() {
    let flag = false;
    this.assetMethodObj.json_model.params.forEach((param) => {
      if (!param.key || !param.data_type) {
        flag = true;
      }
    });
    if (flag) {
      this.toasterService.showError('Please fill the previous parameters correctly', 'Add Parameter');
      return;
    }
    const data = this.assetMethodObj.json_model;
    const list = data?.params || [];
    list.forEach((item, i) => {
      this.assetMethodObj.json_model.params[i] = item;
    });
    this.assetMethodObj.json_model.params.push({
      key: null,
      data_type: null,
      json: null,
    });
    // this.editor.set(this.assetMethodObj.json_model);
  }

  removeParameter(index) {
    console.log(index);
    this.assetMethodObj.json_model.params.splice(index, 1);
    // this.editor.set(this.assetMethodObj.json_model);
  }

  openaddAssetMethodModal() {
    this.assetMethodObj = {
      json_model: {
        params: [
          {
            key: null,
            data_type: null,
            json: null,
          },
        ],
      },
    };
    // this.assetModel.tags.app = this.contextApp.app;
    $('#addAssetMethodModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onDataTypeChange(index) {
    const obj = {};
    const param = this.assetMethodObj.json_model.params[index];
    if (param.data_type) {
      const validations = this.dataTypeList.find((type) => type.name === param.data_type).validations;
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
      param.json = {};
      param.json = obj;
      param.json.type = param.data_type.toLowerCase();
    } else {
      param.json = {};
    }
    // this.editor.set(this.assetMethodObj.json_model);
  }

  onParamKeyChange(index) {
    const param = this.assetMethodObj.json_model.params[index];
    const data = this.assetMethodObj.json_model;
    const list = data?.params || [];
    let flag = false;

    list.forEach((item, i) => {
      if (i !== index && (param.key === item.key || param.name === item.name)) {
        flag = true;
      }
    });
    if (flag) {
      this.toasterService.showError('Parameter with same key or name already exists.', 'Add Parameter');
      // this.assetMethodObj.json_model.params.splice(index, 1);
      param.name = null;
      param.key = null;
      param.json = {};
      param.data_type = null;
      return;
    }
    // this.assetMethodObj.json_model = this.editor.get();
    if (param.json) {
      const keys = Object.keys(param.json);
      if (!keys || keys.length === 0) {
        if (param.data_type) {
          this.onDataTypeChange(index);
        } else {
          param.json = {};
        }
      }
    } else {
      param.json = {};
    }
    console.log(JSON.stringify(this.assetMethodObj));
    // this.editor.set(this.assetMethodObj.json_model);
  }
  onKeyPressAlphaNumericWithCharacters(event) {
    var inp = String.fromCharCode();
    if (CONSTANTS.METHODNAME_REGEX.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      this.toasterService.showError('Method name only allow alphabet, numbers and underscore.', 'Add Method');
      return false;
    }
  }

  onJSONKeyChange() {
    if (this.assetMethodObj.method_name) {
      this.assetMethodObj.json_model.method = this.assetMethodObj.method_name;
      // this.assetMethodObj.json_model.message = {};
    } else {
      delete this.assetMethodObj.json_model.method;
    }
    // this.editor.set(this.assetMethodObj.json_model);
  }

  onSaveassetMethodObj() {
    if (!this.assetMethodObj.name || !this.assetMethodObj.method_name) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add Direct Method');
      return;
    }
    // try {
    //   this.assetMethodObj.json_model = this.editor.get();
    // } catch (e) {
    //   this.toasterService.showError('Invalid JSON data', 'Add Direct Method');
    //   return;
    // }
    if (this.assetMethodObj.json_model.params) {
      const arr = [];
      this.assetMethodObj.json_model.params.forEach((param) => {
        if (param.key && param.data_type) {
          arr.push(param);
        }
      });
      this.assetMethodObj.json_model.params = arr;
    }
    if (this.assetMethodObj.edit) {
      const index1 = this.assetMethods.findIndex((prop) => prop.method_name === this.assetMethodObj.method_name);
      if (index1 > -1) {
        this.assetMethods.splice(index1, 1);
      }
    }
    const index = this.assetMethods.findIndex((prop) => prop.method_name === this.assetMethodObj.method_name);
    if (index > -1) {
      this.toasterService.showError('Direct Method with same method name already exist.', 'Add Direct Method');
      return;
    }
    this.isCreateAssetMethodLoading = true;
    const obj = JSON.parse(JSON.stringify(this.assetModel));
    obj.direct_methods = JSON.parse(JSON.stringify(this.assetMethods));
    obj.direct_methods.push(this.assetMethodObj);
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService.updateAssetsModel(obj, this.assetModel.app).subscribe(
        (response: any) => {
          this.isCreateAssetMethodLoading = false;
          this.onCloseAssetsAssetMethodModal();
          this.toasterService.showSuccess(response.message, 'Add Direct Method');
          this.getAssetsModelAssetMethod();
        },
        (error) => {
          this.isCreateAssetMethodLoading = false;
          this.toasterService.showError(error.message, 'Add Direct Method');
        }
      )
    );
  }

  deleteDirectMethod() {
    const obj = JSON.parse(JSON.stringify(this.assetModel));
    obj.direct_methods = JSON.parse(JSON.stringify(this.assetMethods));
    const index = obj.direct_methods.findIndex((prop) => prop.name === this.selectedAssetMethod.name);
    obj.direct_methods.splice(index, 1);
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService.updateAssetsModel(obj, this.assetModel.app).subscribe(
        (response: any) => {
          this.isCreateAssetMethodLoading = false;
          this.onCloseModal('confirmMessageModal');
          this.toasterService.showSuccess(response.message, 'Delete Direct Method');
          this.getAssetsModelAssetMethod();
        },
        (error) => {
          this.isCreateAssetMethodLoading = false;
          this.toasterService.showError(error.message, 'Delete Direct Method');
        }
      )
    );
  }

  onCloseAssetsAssetMethodModal() {
    $('#addAssetMethodModal').modal('hide');
    this.assetMethodObj = undefined;
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.onCloseModal('confirmMessageModal');
    } else if (eventType === 'save') {
      this.deleteDirectMethod();
    }
  }

  onJSONModalEvents(eventType) {
    if (eventType === 'close') {
      this.onCloseModal('PropJSONModal');
    }
  }

  onTableFunctionCall(obj) {
    this.selectedAssetMethod = obj.data;
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
    } else if (obj.for === 'Edit') {
      this.assetMethodObj = JSON.parse(JSON.stringify(obj.data));
      this.assetMethodObj.edit = true;
      $('#addAssetMethodModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }
  onCloseModal(id) {
    $('#' + id).modal('hide');
    this.selectedAssetMethod = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
