import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import * as datefns from 'date-fns';

@Component({
  selector: 'app-asset-model-control-properties',
  templateUrl: './asset-model-control-properties.component.html',
  styleUrls: ['./asset-model-control-properties.component.css']
})
export class AssetModelControlPropertiesComponent implements OnInit {
  @Input() assetModel: any;
  properties : any = [];
  propertyTableConfig : any = {};
  isPropertiesLoading : boolean = false;
  assetModelData : any = [];
  assetSelectForm: FormGroup;
  selectedAssets : any = {};
  isAPILoading : boolean = false;
  contextApp: any;
  asset : any = [];
  constructor(
    private toasterService: ToasterService,
    private commonService: CommonService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
  ) { 

  }

  async ngOnInit(): Promise<void> {

    
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.assetSelectForm = new FormGroup({
      selected_asset: new FormControl("", []),
    });
    this.setUpPropertyData();
    this.getAssetModelData();
    await this.getAssets(this.contextApp.user.hierarchy);
  }
  getAssets(hierarchy) {
    return new Promise<void>((resolve1) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
      };
        this.assetService.getIPAndLegacyAssets(obj, this.contextApp.app).subscribe((response: any) => {
          if (response?.data) {
            response.data.forEach((detail)=>{
              if(detail.type == 'Legacy Asset') {
                this.asset.push(detail);
              }
            })
          }
          resolve1();
        })
    });
  }

  setUpPropertyData() {
    this.properties = [];
    this.propertyTableConfig = {
      tableTypeForCustomValidation : true,
      selectCheckBoxs : true,
      type: 'Properties',
      tableHeight: 'calc(100vh - 11rem)',
      freezed: this.assetModel.freezed,
      hideSerialNum : true,
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
          name: 'Current Value',
          key: 'current_value',
          type: 'text',
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
        {
          name: 'Actions',
          key: undefined,
          type: 'button',
          headerClass: 'w-10',
          btnData: [
            {
              icon: '',
              text: 'Sync',
              id: 'sync_control_properties',
              valueclass: 'rounded p-2 pr-4 pl-4 btn btn-primary btn-sm',
              tooltip: 'Sync Control Properties',
            },
          ],
        },
      ],
    };
    this.getAssetsModelProperties();
  }
  getAssetsModelProperties() {
    this.isPropertiesLoading = true;
    const obj = {
      app: this.assetModel.app,
      name: this.assetModel.name,
    };
      this.assetModelService.getAssetsModelProperties(obj).subscribe((response: any) => {
        // let localObject = [...response.properties['measured_properties'] , ...response.properties['controllable_properties']]
        if(response?.properties['measured_properties'] && response?.properties['measured_properties'].length>0) {
          this.properties = response?.properties?.['measured_properties']?.filter((detail)=>{ return detail && detail.metadata && (detail.metadata.rw == 'w' || detail.metadata.rw == 'rw')})
          this.properties.map((detail:any)=>{ 
            if(!("current_value" in detail)) {
              detail.current_value = "-";
            }
            return detail;
          })
        }
        this.isPropertiesLoading = false;
      })
  }
  getAssetModelData(callFromMenu = false) {
    this.assetModelData = [];
    const obj = {
      app: this.assetModel.app,
    };
    this.assetModelService.getAssetsModelsList(obj.app).subscribe((response: any) => {
      if (response) {
        response.data.forEach((detail)=>{
          if(detail.model_type == this.assetModel.model_type) {
            this.assetModelData.push(detail)
          }
        })
      }
    })
  }
  singleSyncuoCall(event : any) {
    if(event?.data?.new_value || event.length > 0) {
      let setProperties : any = {};
      
      let uniqueId = (this.selectedAssets.type !== CONSTANTS.NON_IP_ASSET ? this.selectedAssets.asset_id : this.selectedAssets.gateway_id) +'_' +this.commonService.generateUUID();
  
      setProperties = {
        "asset_id":this.selectedAssets.asset_id,
        "message":{
          "command":"write_data",
          "asset_id": "TempAsset",
          "properties": {}
        },
        "app":"Indygo",
        "timestamp":datefns.getUnixTime(new Date()),
        "acknowledge":"Full",
        "expire_in_min":1,
        "job_id": uniqueId,
        "request_type": 'Sync Control Properties',
        "job_type":"Message",
        "sub_job_id": uniqueId + "_1",
      }
  
  
      if(event.length > 0) {
        event.forEach((detail)=>{
          if(detail?.syncUp == true && detail?.new_value?.toString().length > 0){
            if(detail.data_type == 'Number') {
              let newValue = detail?.new_value;
              newValue = newValue.toString();
              if(newValue.indexOf('.') > -1) {
                detail.new_value = parseFloat(detail.new_value);
              } else {
                detail.new_value = parseInt(detail.new_value);
              }
            }
            if(detail.data_type == 'Float') {
              detail.new_value = parseFloat(detail.new_value);
            }
            setProperties['message']['properties'][detail.json_key] = detail.new_value;
          }
        })
      } else {
          if(event?.data?.new_value?.toString().length > 0){
            if(event.data.data_type == 'Number') {
              let newValue = event?.data?.new_value;
              newValue = newValue.toString();
              if(newValue.indexOf('.') > -1) {
                event.data.new_value = parseFloat(event.data.new_value);
              } else {
                event.data.new_value = parseInt(event.data.new_value);
              }
            }
            if(event.data.data_type == 'Float') {
              event.data.new_value = parseFloat(event.data.new_value);
            }
            setProperties['message']['properties'][event.data.json_key] = event.data.new_value;
          }
      }
      const isEmpty = Object.keys(setProperties?.message?.properties).length === 0;
      if(isEmpty) {
        this.toasterService.showError('To Multi Sync Control Properties select checkbox','Check Box Selection');
      } else {
        this.syncControlProperties(setProperties);
      }
    }

  }
  async assetSelectionChangeFun(selected_asset) {
    this.selectedAssets = selected_asset;
    
    //await this.getAssets(this.contextApp.user.hierarchy);
  }

  syncControlProperties(propertyObject) {
    this.isAPILoading = true;

    this.assetService
      .sendC2DMessage(
        propertyObject,
        this.contextApp.app,
        this.selectedAssets.type !== CONSTANTS.NON_IP_ASSET ? this.selectedAssets.asset_id : this.selectedAssets.gateway_id
      )
      .subscribe(
        (response: any) => {
          console.log("this.table.........",this.properties,propertyObject)
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