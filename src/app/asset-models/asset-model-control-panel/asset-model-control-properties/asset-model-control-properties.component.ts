import { Component, Input, OnInit } from '@angular/core';
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
  constructor(
    private assetModelService: AssetModelService,
  ) { 

  }

  ngOnInit(): void {
    
    this.setUpPropertyData();
  }
  setUpPropertyData() {
    this.properties = [];
    this.propertyTableConfig = {
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
          key: '',
          type: 'text',
          headerClass: 'w-15',
          valueclass: '',
        },
        {
          name: 'New Value',
          key: '',
          type: 'text',
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
              valueclass: 'btn btn-primary btn-sm',
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
        console.log('response.properties?...........',response.properties);
        
        this.properties = response.properties['measured_properties'].filter((detail)=>{ return detail.rw == 'w' || detail.rw == 'rw'})
        this.isPropertiesLoading = false;
      })
  }

}
