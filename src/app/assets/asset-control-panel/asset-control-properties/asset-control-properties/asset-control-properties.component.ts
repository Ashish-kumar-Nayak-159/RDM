import { Component, OnInit, Input } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ToasterService } from 'src/app/services/toaster.service';
import * as datefns from 'date-fns';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-asset-control-properties',
  templateUrl: './asset-control-properties.component.html',
  styleUrls: ['./asset-control-properties.component.css']
})
export class AssetControlPropertiesComponent implements OnInit {
  @Input() asset: Asset = new Asset();
  @Input() componentState;
  propertyTableConfig: any = {};
  properties: any = [];
  isPropertiesLoading: boolean = false;
  isAPILoading: boolean = false;
  contextApp: any;
  selectedAssets: any = {};
  apiSubscriptions: Subscription[] = [];
  filterObj: any = {};
  lastTelemetryValue: any;
  isModelFreezeUnfreezeAPILoading = false;
  userData: any;
  isPasswordVisible = false;
  password: any;
  subscriptions: Subscription[] = [];
  setProperties: any;
  assetName: any


  constructor(private assetModelService: AssetModelService, private commonService: CommonService,
    private assetService: AssetService, private toasterService: ToasterService) { }

  async ngOnInit() {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    this.filterObj.dateOption = item.dateOption;
    this.assetName = this.asset?.tags?.display_name;
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.setUpPropertyData();
  }

  setUpPropertyData() {
    this.properties = [];
    this.propertyTableConfig = {
      tableTypeForCustomValidation: true,
      selectCheckBoxs: true,
      type: 'Properties',
      tableHeight: 'calc(100vh - 11rem)',
      hideSerialNum: true,
      data: [
        {
          name: 'checkbox',
          key: '',
          type: 'checkbox',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Property Name',
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
          name: ' Latest Telemetry Value',
          key: 'current_value',
          type: 'telmetry',
          headerClass: 'w-15',
          valueclass: '',
        },
        {
          name: 'New Value',
          key: 'new_value',
          type: 'input',
          headerClass: 'w-15',
          valueclass: 'form-control',
        },
        // {
        //   name: 'Actions',
        //   key: undefined,
        //   type: 'button',
        //   headerClass: 'w-10',
        //   btnData: [
        //     {
        //       icon: '',
        //       text: 'Sync',
        //       id: 'sync_control_properties',
        //       valueclass: 'rounded p-2 pr-4 pl-4 btn btn-primary btn-sm',
        //       tooltip: 'Sync Control Properties',
        //     },
        //   ],
        // },
      ],
    };
    this.getModelPropertyByAssetID();
    this.getLastTelmetry(this.asset)

  }

  async getModelPropertyByAssetID() {
    this.isPropertiesLoading = true;
    await this.assetModelService.getModelPropertiesByAssetsId(this.asset.asset_id).
      toPromise().then((response: any) => {
        response = response[0];
        response.measured_properties = response.measured_properties
          ? response.measured_properties
          : [];
        this.properties = response.measured_properties?.filter((detail) => { return detail && detail.metadata && (detail.metadata.rw == 'w' || detail.metadata.rw == 'rw') })
        response.measured_properties?.forEach((prop) => {
          prop.type = 'Measured Properties'
          // this.telemetryPropertyList.push(prop);
        });

        response.edge_derived_properties = response.edge_derived_properties
          ? response.edge_derived_properties
          : [];
        response.cloud_derived_properties = response.cloud_derived_properties
          ? response.cloud_derived_properties
          : [];
        response.edge_derived_properties?.forEach((prop) => {
          prop.type = 'Edge Derived Properties';
          let matchCount = 0
          prop.metadata?.properties?.forEach((actualProp) => {
            matchCount++
          })
          if (matchCount > 0) {
            //this.telemetryPropertyList.push(prop)
          }

        });
        response?.cloud_derived_properties?.forEach((prop) => {
          prop.type = 'Cloud Derived Properties';
          //this.telemetryPropertyList.push(prop);
        });
      })
    this.isPropertiesLoading = false;

  }

  async getLastTelmetry(obj) {
    const midnight = datefns.getUnixTime(datefns.startOfDay(new Date()));
    const now = datefns.getUnixTime(new Date());
    obj.asset_id = obj.asset_id

    obj.count = 1;

    obj.from_date = midnight;
    obj.to_date = now;
    obj.app = this.contextApp.app;
    obj.partition_key = obj.asset_id;
    this.apiSubscriptions.push(
      this.assetService.getLastTelmetry(this.contextApp.app, obj).subscribe(
        (response: any) => {
          if (response?.message) {
            response.message.date = this.commonService.convertUTCDateToLocal(response.message_date);
            response.message.message_date = this.commonService.convertUTCDateToLocal(response.message_date)
            this.lastTelemetryValue = response.message;
          }

        },
        (error) => (console.log('error'))
      )
    );

  }

  singleSyncupCall(event: any) {
    if (event?.data?.hasOwnProperty('new_value') || event.length > 0) {

      let uniqueId = (this.asset.type !== CONSTANTS.NON_IP_ASSET ? this.asset.asset_id : this.asset.gateway_id) + '_' + this.commonService.generateUUID();
      this.setProperties = {
        "asset_id": this.asset.asset_id,
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


      if (event.length > 0) {
        event.forEach((detail) => {
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
            this.setProperties['message']['properties'][detail.json_key] = detail.new_value;
          }
        })
      } else {
        if (event?.data?.new_value?.toString().length > 0) {
          if (event?.data?.metadata.d != 'd') {
            if (event.data.data_type == 'Number') {
              let newValue = event?.data?.new_value;
              newValue = newValue.toString();
              if (newValue.indexOf('.') > -1) {
                event.data.new_value = parseFloat(event.data.new_value);
              } else {
                event.data.new_value = parseInt(event.data.new_value);
              }
            }

            if (event.data.data_type == 'Float') {
              event.data.new_value = parseFloat(event.data.new_value);
            }
          }
          this.setProperties['message']['properties'][event.data.json_key] = event.data.new_value;
        }
      }
      const isEmpty = Object.keys(this.setProperties?.message?.properties).length === 0;
      if (isEmpty) {
        this.toasterService.showError('To Sync Control Properties select checkbox', 'Check Box Selection');
      } else {
        let isMfaEnabled = false;
        event?.forEach(item => {
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
        // this.syncControlProperties(this.setProperties);
      }
    }
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
  }

  twoFactorAuth() {
    if (!this.password) {
      this.toasterService.showError('Password is compulsory.', 'Unfreeze Model');
      return;
    }
    this.isModelFreezeUnfreezeAPILoading = true;
    const obj = {
      email: this.userData.email,
      password: this.password,
      updated_by: this.userData.email + ' (' + this.userData.name + ')',
    };
    this.subscriptions.push(
      this.assetModelService.unfreezeAssetModel(this.contextApp.app, this.asset.tags.asset_model, obj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess('Requested properties value is updated successfully', 'Update Property Values');
          this.isModelFreezeUnfreezeAPILoading = false;
          setTimeout(() => {
            this.syncControlProperties(this.setProperties);
          }, 300);
          this.isAPILoading = true;
          this.onCloseModal('passwordCheckModal');
        },
        (error) => {
          this.toasterService.showError(error.message, 'Update Property Values');
          this.isModelFreezeUnfreezeAPILoading = false;
        }
      )
    );

  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }



  syncControlProperties(propertyObject) {
    this.isAPILoading = true;
    this.assetService
      .sendC2DMessage(
        propertyObject,
        this.contextApp.app,
        this.asset.type !== CONSTANTS.NON_IP_ASSET ? this.asset.asset_id : this.asset.gateway_id
      )
      .subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Sync Control Properties');
          this.assetService.refreshRecentJobs.emit();
          this.isAPILoading = false;
        },
        (error) => {
          this.toasterService.showError(error.message, 'Sync Control Properties');
          this.assetService.refreshRecentJobs.emit();
          this.isAPILoading = false;
        }
      )
  }

}
