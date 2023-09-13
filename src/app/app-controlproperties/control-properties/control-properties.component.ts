import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import * as datefns from 'date-fns';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-control-properties',
  templateUrl: './control-properties.component.html',
  styleUrls: ['./control-properties.component.css']
})
export class ControlPropertiesComponent implements OnInit {
  @Input() properties;
  @Input() filterObj;
  @Input() telemetryData: any;
  @Input() lastTelemetryValueControl: any;
  lastTelemetryValue: any;
  telemertyLiveData: any
  assetwiseData: any;
  controlproperties: any;
  // isAllSelected: boolean = false;
  selectedAssets: any = {};
  environmentApp = environment.app;
  masterSelected: boolean;
  checklist: any;
  checkedList: any;
  checkBoxvalue = false;
  // Property to store values from input fields
  newValues: any[] = [];
  isEnteredAnyValue: boolean = false;
  selectedProperty: any = null;
  // Property to store values from select elements
  selectedValues: any[] = [];
  contextApp: any;
  isPasswordVisible = false;
  password: any;
  userData: any;
  selectedItems: any[] = []; // Declare the selectedItems array
  isModelFreezeUnfreezeAPILoading = false;
  subscriptions: Subscription[] = [];
  setProperties: any;
  checkDefaultValue: boolean = false;
  assetModalname: any;

  constructor(private commonService: CommonService, private assetModelService: AssetModelService,
    private assetService: AssetService, private toasterService: ToasterService) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);

    // if (changes.telemetryData && changes.telemetryData?.currentValue !== changes.telemetryData.previousValue) {
    //   const lastObject = changes?.telemetryData.currentValue[changes?.telemetryData.currentValue.length - 1];
    //   this.telemertyLiveData = lastObject
    // } else {
    //   this.telemertyLiveData = this.telemetryData
    // }
    this.assetwiseData = this.filterObj.asset
    this.assetModalname = this.filterObj?.asset?.display_name
    this.lastTelemetryValue = this.lastTelemetryValueControl;

  }

  ngOnInit(): void {
    this.controlproperties = this.properties
      ?.filter((detail) => { return detail && detail.metadata && (detail.metadata.rw == 'w' || detail.metadata.rw == 'rw') })
    this.controlproperties = this.controlproperties.map((prop) => { return { ...prop, new_value: prop["json_model"][prop.json_key].defaultValue } });
    this.properties?.map((detail) => {
      detail['isSelected'] = false;
      detail['clicked'] = false;
      detail['new_value'] = undefined;
      detail['syncUp'] = false;
      return detail;
    });
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.lastTelemetryValue = this.lastTelemetryValueControl;

  }

  checkUncheckAll() {
    for (var i = 0; i < this.controlproperties.length; i++) {
      this.controlproperties[i].isSelected = this.masterSelected;
      this.controlproperties[i].syncUp = true;
    }
    this.selectedProperty = this.controlproperties;
    this.getCheckedItemList();
  }

  getMeasuredTelemetryValue(telemetryObj: any, properties: any[], jsonKey: string) {
    const propObj = properties.find(p => p.json_key === jsonKey);
    if (!propObj) return undefined;
    if (propObj.type === "Measured Properies") {
      return telemetryObj["m"][jsonKey];
    }
  }

  isAllSelected(property: any) {
    this.selectedProperty = property;
    this.controlproperties.forEach(function (item) {
      item.syncUp = true; // Set item.syncUp to true
    });
    this.masterSelected = this.controlproperties.every(function (item: any) {
      return item.isSelected == true
    })
    this.getCheckedItemList();

  }

  getCheckedItemList() {
    this.selectedItems = this.controlproperties.filter(item => item.isSelected);
    this.checkedList = [];
    for (var i = 0; i < this.controlproperties.length; i++) {
      if (this.controlproperties[i].isSelected)
        this.checkedList.push(this.controlproperties[i]);
    }

    this.checkedList = JSON.stringify(this.checkedList);

    this.selectedItems.forEach(item => {
      const jsonKey = item.json_key;
      if (item.json_model && item.json_model[jsonKey] && item.json_model[jsonKey].defaultValue !== undefined && item.json_model[jsonKey].defaultValue !== null) {
        item.defaultValue = item.json_model[jsonKey].defaultValue;
        // this.properties?.map((property) => {
        //   property['new_value'] = item.defaultValue;
        //   return property;
        // });
        this.isEnteredAnyValue = true;
      }
    });
    if (this.checkedList && JSON.parse(this.checkedList).length > 0) {
      this.checkBoxvalue = true

    } else {
      this.checkBoxvalue = false

    }
  }

  inputBoxValueChange(data, value: string) {
    this.isEnteredAnyValue = false;
    this.controlproperties.map((detail) => {
      if (data.metadata.sd) {
        if (detail.id == data.id) {
          if (data.metadata.sd == 1 || data.metadata.sd == 7) {
            if (typeof detail.new_value === 'string') {
              detail.new_value = detail.new_value.replace(/[^0-9-+]+/gi, "");
              value = value?.replace(/[^0-9-+]+/gi, "");
            }
          }
          if (data.metadata.sd == 2 || data.metadata.sd == 8) {
            if (typeof detail.new_value === 'string') {
              detail.new_value = detail.new_value.replace(/[^0-9-+]+/gi, "");
              value = value?.replace(/[^0-9-+]+/gi, "");
            }
          }
          if (data.metadata.sd == 3 || data.metadata.sd == 4) {
            if (typeof detail.new_value === 'string') {
              detail.new_value = detail.new_value.replace(/[^0-9-+]+/gi, "");
              value = value?.replace(/[^0-9-+]+/gi, "");
            }
          }
          if (data.metadata.sd == 5 || data.metadata.sd == 6) {
            if (typeof detail.new_value === 'string') {
              detail.new_value = detail.new_value.replace(/[^0-9-+]+/gi, "");
              value = value?.replace(/[^0-9-+]+/gi, "");
            }
          }
        }
        if (detail?.new_value?.toString()?.length > 0) {
          this.isEnteredAnyValue = true;
        }
      } else {
        if (data.metadata.d != 'd') {
          if (detail.id == data.id && data.data_type == 'Number') {
            detail.new_value = detail?.new_value?.replace(/[^0-9.]+/gi, "");
            value = value?.replace(/[^0-9.]+/gi, "");
          }
          if (detail.id == data.id && data.data_type == 'String') {
            detail.new_value = detail?.new_value?.replace(/[^a-zA-Z_]+/gi, "");
            value = value?.replace(/[^a-zA-Z_]+/gi, "");
          }
        }
        if (detail?.new_value?.toString()?.length > 0) {
          this.isEnteredAnyValue = true;
        }
      }
      return detail;
    })
  }

  // inputBoxValueChange(data, value: string) {
  //   this.isEnteredAnyValue = false;
  //   this.controlproperties.map((detail) => {
  //     if (data.metadata.sd) {
  //       if (detail.id == data.id) {
  //         if (data.metadata.sd == 1 || data.metadata.sd == 7) {
  //           if (typeof detail.new_value === 'string') {
  //             detail.new_value = detail.new_value.replace(/[^0-9.]+/gi, "");
  //           }
  //           if (typeof value === 'string') {
  //             value = value.replace(/[^0-9.]+/gi, "");
  //           }
  //         }
  //         if (data.metadata.sd == 2 || data.metadata.sd == 8) {
  //           detail.new_value = detail?.new_value?.replace(/[^0-9]+/gi, "");
  //           value = value?.replace(/[^0-9]+/gi, "");
  //         }
  //         if (data.metadata.sd == 3 || data.metadata.sd == 4) {
  //           detail.new_value = detail?.new_value?.replace(/[^0-9-+]+/gi, "");
  //           value = value?.replace(/[^0-9-+]+/gi, "");
  //         }
  //         if (data.metadata.sd == 5 || data.metadata.sd == 6) {
  //           detail.new_value = detail?.new_value?.replace(/[^0-9-+.]+/gi, "");
  //           value = value?.replace(/[^0-9-+.]+/gi, "");
  //         }
  //         if (detail?.new_value !== null && detail?.new_value !== undefined && detail?.new_value.trim() !== '') {
  //           this.isEnteredAnyValue = true;
  //           // new_value has a value
  //           // You can further process it here
  //         }
  //         // if (detail?.new_value?.length > 0) {
  //         //   this.isEnteredAnyValue = true;
  //         // }
  //       }
  //     } else {
  //       if (data.metadata.d != 'd') {
  //         if (detail.id == data.id && data.data_type == 'Number') {
  //           detail.new_value = detail?.new_value?.replace(/[^0-9.]+/gi, "");
  //           value = value?.replace(/[^0-9.]+/gi, "");
  //         }
  //         if (detail.id == data.id && data.data_type == 'String') {
  //           detail.new_value = detail?.new_value?.replace(/[^a-zA-Z_]+/gi, "");
  //           value = value?.replace(/[^a-zA-Z_]+/gi, "");
  //         }
  //       }
  //       if (detail?.new_value?.toString()?.length > 0) {
  //         this.isEnteredAnyValue = true;
  //       }

  //     }
  //     return detail;
  //   })
  // }

  SyncuoCall(event: any) {
    if (this.selectedItems?.hasOwnProperty('new_value') || this.selectedItems?.length > 0) {
      let uniqueId = (this.selectedAssets.type !== CONSTANTS.NON_IP_ASSET ? this.assetwiseData?.asset_id : this.selectedAssets.gateway_id) + '_' + this.commonService.generateUUID();
      this.setProperties = {
        "asset_id": this.assetwiseData.asset_id,
        "message": {
          "command": "write_data",
          "asset_id": "TempAsset",
          "properties": {}
        },
        "app": "Indygo",
        "timestamp": datefns.getUnixTime(new Date()),
        "acknowledge": "Full",
        "expire_in_min": 1,
        "job_id": uniqueId,
        "request_type": 'Sync Control Properties',
        "job_type": "Message",
        "sub_job_id": uniqueId + "_1",
      }

      if (this.selectedItems?.length > 0) {
        this.selectedItems?.forEach((detail) => {
          if (detail?.syncUp == true && detail?.new_value?.toString().length > 0) {
            if (detail?.metadata.d != 'd') {
              if (detail.data_type == 'Number') {
                let newValue = detail?.new_value;
                newValue = newValue.toString();
                if (newValue.indexOf('.') > -1) {
                  detail.new_value = parseFloat(detail.new_value);
                } else {
                  detail.new_value = parseInt(detail.new_value);
                }
              }
              if (detail.data_type == 'Float') {
                detail.new_value = parseFloat(detail.new_value);
              }
            }
          }
          this.setProperties['message']['properties'][detail.json_key] = detail.new_value != undefined && detail.new_value.toString().length > 0 ? detail.new_value : this.selectedItems.find((propObj) => propObj.json_key == detail.json_key)?.defaultValue;

        })
      } else {
        if (this.selectedProperty?.new_value?.toString().length > 0) {
          if (this.selectedProperty?.metadata.d != 'd') {
            if (this.selectedProperty?.data_type == 'Number') {
              let newValue = this.selectedProperty?.new_value;
              newValue = newValue.toString();
              if (newValue.indexOf('.') > -1) {
                this.selectedProperty.new_value = parseFloat(this.selectedProperty.new_value);
              } else {
                this.selectedProperty.new_value = parseInt(this.selectedProperty.new_value);
              }
            }

            if (this.selectedProperty.data_type == 'Float') {
              this.selectedProperty.new_value = parseFloat(this.selectedProperty.new_value);
            }
          }
          this.setProperties['message']['properties'][this.selectedProperty.json_key] = this.selectedProperty.new_value ? this.selectedItems.find((propObj) => propObj.json_key == this.selectedProperty.json_key)?.defaultValue : this.selectedProperty.new_value;
        }
      }
      const propertiesObject = this.setProperties?.message?.properties;
      const isEmpty = propertiesObject &&
        Object.keys(propertiesObject).every(key => propertiesObject[key] === undefined);
      if (isEmpty) {
        this.toasterService.showError('To  Sync Control Properties select checkbox and value', 'Check Box Selection');
      } else {
        let isMfaEnabled = false;
        this.selectedItems.forEach(item => {
          const matchingKey = Object.keys(item.json_model)[0]; // Assuming there's only one key
          if (matchingKey in this.setProperties.message.properties && item.mfa_enabled) {
            isMfaEnabled = true
          }
        });

        if (isMfaEnabled) {
          this.password = undefined;
          this.isModelFreezeUnfreezeAPILoading = false;
          $('#passwordCheckModal').modal({ backdrop: 'static', keyboard: false, show: true });
        } else {
          this.syncControlProperties(this.setProperties);
        }
      }
    }
    // debugger
    // let setProperties: any = {};
    // let uniqueId = (this.selectedAssets.type !== CONSTANTS.NON_IP_ASSET ? this.filterObj?.asset_id : this.selectedAssets.gateway_id) + '_' + this.commonService.generateUUID();

    // setProperties = {
    //   "asset_id": this.filterObj.asset_id,
    //   "message": {
    //     "command": "write_data",
    //     "asset_id": "TempAsset",
    //     "properties": {}
    //   },
    //   "app": this.environmentApp ? this.environmentApp : 'Indygo',
    //   "timestamp": datefns.getUnixTime(new Date()),
    //   "acknowledge": "Full",
    //   "expire_in_min": 1,
    //   "job_id": uniqueId,
    //   "request_type": 'Sync Control Properties',
    //   "job_type": "Message",
    //   "sub_job_id": uniqueId + "_1",
    // }
    // console.log("Checkinggggg", JSON.stringify(setProperties))

  }

  resetData() {
    this.controlproperties?.map((detail) => {
      detail['isSelected'] = false;
      detail['clicked'] = false;
      detail['new_value'] = null;
      detail['syncUp'] = false;
      return detail;
    });
    this.isEnteredAnyValue = false;
    this.checkBoxvalue = false;
    this.masterSelected = false;
    $('#exampleModal').modal('hide');

  }
  syncControlProperties(propertyObject) {
    this.assetService
      .sendC2DMessage(
        propertyObject,
        this.contextApp.app,
        this.assetwiseData.type !== CONSTANTS.NON_IP_ASSET ? this.assetwiseData.asset_id : this.assetwiseData.gateway_id
      )
      .subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Sync Control Properties');
          this.controlproperties?.map((detail) => {
            detail['isSelected'] = false;
            detail['clicked'] = false;
            detail['new_value'] = null;
            detail['syncUp'] = false;
            return detail;
          });
          this.masterSelected = false;
          this.isEnteredAnyValue = false;
          this.checkBoxvalue = false;
          $('#exampleModal').modal('hide');
        },
        (error) => {
          this.isEnteredAnyValue = false;
          this.masterSelected = false;
          this.checkBoxvalue = false;
          this.toasterService.showError(error.message, 'Sync Control Properties');
        }
      )
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
    this.isPasswordVisible = false;

  }
  twoFactorAuth() {
    if (!this.password) {
      this.toasterService.showError('Password is compulsory.', 'Password');
      return;
    }
    this.isModelFreezeUnfreezeAPILoading = true;
    const obj = {
      email: this.userData.email,
      password: this.password,
      app: environment.app
    };

    this.subscriptions.push(
      this.commonService.loginUser(obj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess('Requested properties value is updated successfully', 'Update Property Values');
          this.isModelFreezeUnfreezeAPILoading = false;
          this.syncControlProperties(this.setProperties);
          this.onCloseModal('passwordCheckModal');
        },
        (error) => {
          this.toasterService.showError(error.message, 'Password');
          this.isModelFreezeUnfreezeAPILoading = false;
        }
      )
    );

  }
  getTelemetryValue(property: any): any {
    if (this.telemetryData && property?.json_key in this.telemetryData) {
      return this.telemetryData[property?.json_key];
    }
    return this.lastTelemetryValue?.[property?.json_key]?.toString() || '-';
  }
}
