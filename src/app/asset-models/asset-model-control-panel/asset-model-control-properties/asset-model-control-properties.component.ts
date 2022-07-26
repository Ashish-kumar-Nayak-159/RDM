import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';

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
  constructor(
    private assetModelService: AssetModelService,
  ) { 

  }

  ngOnInit(): void {
    this.assetSelectForm = new FormGroup({
      selected_asset: new FormControl("", []),
    });
    this.setUpPropertyData();
    this.getAssetModelData();
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
    // this.properties = {};
    this.isPropertiesLoading = true;
    const obj = {
      app: this.assetModel.app,
      name: this.assetModel.name,
    };
      this.assetModelService.getAssetsModelProperties(obj).subscribe((response: any) => {
        this.properties = response.properties['measured_properties'].filter((detail)=>{ return detail.rw == 'w' || detail.rw == 'rw'})
        this.isPropertiesLoading = false;
      })
  }
  getAssetModelData(callFromMenu = false) {
    this.assetModelData = [];
    const obj = {
      app: this.assetModel.app,
    };
    console.log("WITHIN OBJ>>>>>>>>>>>>>>>>>>>>.....", obj)

    this.assetModelService.getAssetsModelsList(obj.app).subscribe((response: any) => {
      if (response) {
        response.data.forEach((detail)=>{
          if(detail.model_type == this.assetModel.model_type) {
            this.assetModelData.push(detail)
          }
        })
        console.log(this.assetModel,"this is asset model data........", this.assetModelData)
      }
    })
  }
  singleSyncuoCall(event : any) {
    console.log("single or multi select... call back..........",event,this.selectedAssets)
    let setProperties : any = {};

    setProperties = {
      "asset_id": this.selectedAssets.id,
      "command": "write_data",
      "sub_job_id": "",
      properties : {}
    }
    if(event.length > 0) {
      event.forEach((detail)=>{
        if(detail?.syncUp == true && detail?.new_value?.toString().length > 0){
          setProperties['properties'][detail.data_type] = detail.new_value;
        }
      })
    } else {
      if(event?.data?.syncUp == true && event?.data?.new_value?.toString().length > 0){
        setProperties['properties'][event.data.data_type] = event.data.new_value;
      }
    }
    console.log(setProperties);
  }
  assetSelectionChangeFun(selected_asset) {
    this.selectedAssets = selected_asset;
  }
}
