import { Subscription } from 'rxjs';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { CommonService } from './../../../services/common.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';

declare var $: any;
@Component({
  selector: 'app-cloud-derived-properties',
  templateUrl: './cloud-derived-properties.component.html',
  styleUrls: ['./cloud-derived-properties.component.css'],
})
export class CloudDerivedPropertiesComponent implements OnInit, OnDestroy {
  @Input() asset: any;
  contextApp: any;
  propertyTableConfig: any;
  isPropertiesLoading = false;
  subscriptions: Subscription[] = [];
  properties = {};
  selectedProperty: any;
  constantData = CONSTANTS;
  modalConfig: { jsonDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(private commonService: CommonService, private assetModelService: AssetModelService) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.propertyTableConfig = {
      type: 'Properties',
      tableHeight: 'calc(100vh - 11rem)',
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
          name: 'Formula',
          key: 'condition',
          type: 'text',
          headerClass: '',
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
          ],
        },
      ],
    };
    this.getCloudDerivedProperties();
  }

  getCloudDerivedProperties() {
    this.isPropertiesLoading = true;
    const obj = {
      app: this.contextApp.app,
      name: this.asset.tags?.asset_model,
    };
    this.properties = {
      cloud_derived_properties: [],
    };
    this.subscriptions.push(
      this.assetModelService.getAssetsModelProperties(obj).subscribe((response: any) => {
        this.properties = response.properties;
        this.properties['cloud_derived_properties'] = this.properties['cloud_derived_properties']
          ? this.properties['cloud_derived_properties']
          : [];
        this.isPropertiesLoading = false;
      })
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
    }
  }

  onJSONModalEvents(eventType) {
    if (eventType === 'close') {
      this.onCloseModal('PropJSONModal');
    }
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
    this.selectedProperty = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
