import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import * as datefns from 'date-fns';
import { CONSTANTS } from 'src/app/constants/app.constants';
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

  constructor(private commonService: CommonService, private assetService: AssetService, private toasterService: ToasterService) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.properties?.map((detail) => {
      detail['isSelected'] = false;
      detail['clicked'] = false;
      detail['new_value'] = undefined;
      detail['syncUp'] = false;
      return detail;
    });
    if (changes.telemetryData && changes.telemetryData?.currentValue !== changes.telemetryData.previousValue) {
      // this.telemertyLiveData = changes?.telemetryData[changes.telemetryData.currentValue.length - 1]
      const lastObject = changes?.telemetryData.currentValue[changes?.telemetryData.currentValue.length - 1];
      this.telemertyLiveData = lastObject
    } else {
      this.telemertyLiveData = this.telemetryData[0]
    }
    this.assetwiseData = this.filterObj.asset
    this.controlproperties = this.properties?.filter((detail) => { return detail && detail.metadata && (detail.metadata.rw == 'w' || detail.metadata.rw == 'rw') })
  }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
  }

  checkUncheckAll() {
    for (var i = 0; i < this.controlproperties.length; i++) {
      this.controlproperties[i].isSelected = this.masterSelected;
      this.controlproperties[i].syncUp = true;
    }
    this.selectedProperty = this.controlproperties;
    this.getCheckedItemList();
  }

  isAllSelected(property: any) {
    this.selectedProperty = property;
    this.masterSelected = this.controlproperties.every(function (item: any) {
      item.syncUp == true;
      return item.isSelected == true
    })
    this.getCheckedItemList();

  }

  getCheckedItemList() {
    this.checkedList = [];
    for (var i = 0; i < this.controlproperties.length; i++) {
      if (this.controlproperties[i].isSelected)
        this.checkedList.push(this.controlproperties[i]);
    }
    this.checkedList = JSON.stringify(this.checkedList);
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
            detail.new_value = detail?.new_value?.replace(/[^0-9-+]+/gi, "");
            value = value?.replace(/[^0-9-+]+/gi, "");
          }
          if (data.metadata.sd == 2 || data.metadata.sd == 8) {
            detail.new_value = detail?.new_value?.replace(/[^0-9]+/gi, "");
            value = value?.replace(/[^0-9]+/gi, "");
          }
          if (data.metadata.sd == 3 || data.metadata.sd == 4) {
            detail.new_value = detail?.new_value?.replace(/[^0-9-+]+/gi, "");
            value = value?.replace(/[^0-9-+]+/gi, "");
          }
          if (data.metadata.sd == 5 || data.metadata.sd == 6) {
            detail.new_value = detail?.new_value?.replace(/[^0-9-+.]+/gi, "");
            value = value?.replace(/[^0-9-+.]+/gi, "");
          }
          if (detail?.new_value?.toString()?.length > 0) {
            this.isEnteredAnyValue = true;
          }
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

  SyncuoCall(event: any) {
    if (this.selectedProperty?.hasOwnProperty('new_value') || this.selectedProperty?.length > 0) {
      let setProperties: any = {};

      let uniqueId = (this.selectedAssets.type !== CONSTANTS.NON_IP_ASSET ? this.assetwiseData?.asset_id : this.selectedAssets.gateway_id) + '_' + this.commonService.generateUUID();
      setProperties = {
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

      if (this.selectedProperty?.length > 0) {
        this.selectedProperty?.forEach((detail) => {
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
            setProperties['message']['properties'][detail.json_key] = detail.new_value;
          }
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
          setProperties['message']['properties'][this.selectedProperty.json_key] = this.selectedProperty.new_value;
        }
      }
      const isEmpty = Object.keys(setProperties?.message?.properties).length === 0;
      if (isEmpty) {
        this.toasterService.showError('To  Sync Control Properties select checkbox', 'Check Box Selection');
      } else {
        this.syncControlProperties(setProperties);
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
          this.properties?.map((detail) => {
            detail['isSelected'] = false;
            detail['clicked'] = false;
            detail['new_value'] = undefined;
            detail['syncUp'] = false;
            return detail;
          });
          $('#exampleModal').modal('hide');

        },
        (error) => {
          this.toasterService.showError(error.message, 'Sync Control Properties');
        }
      )
  }
}
