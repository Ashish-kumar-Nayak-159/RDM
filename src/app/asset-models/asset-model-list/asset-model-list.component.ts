import { Subscription } from 'rxjs';
import { ToasterService } from './../../services/toaster.service';
import { CONSTANTS } from './../../app.constants';
import { AssetModelService } from './../../services/asset-model/asset-model.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ApplicationService } from 'src/app/services/application/application.service';

declare var $: any;
@Component({
  selector: 'app-asset-model-list',
  templateUrl: './asset-model-list.component.html',
  styleUrls: ['./asset-model-list.component.css']
})
export class AssetModelListComponent implements OnInit, OnDestroy {

  assetModels: any[] = [];
  assetModel: any;
  tableConfig: any;
  isFilterSelected = true;
  isassetModelsListLoading = false;
  userData: any;
  contextApp: any;
  assetModelFilterObj: any = {};
  isCreateAssetsModelAPILoading = false;
  constantData = CONSTANTS;
  protocolList = CONSTANTS.PROTOCOLS;
  connectivityList: string[] = [];
  isFileUploading = false;
  originalAssetsModelFilterObj: any;
  tileData: any;
  subscriptions: Subscription[] = [];
  iotAssetsTab: { visibility: any; tab_name: any; table_key: any; };
  legacyAssetsTab: { visibility: any; tab_name: any; table_key: any; };
  iotGatewaysTab: { visibility: any; tab_name: any; table_key: any; };
  componentState: any;
  constructor(
    private assetModelService: AssetModelService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.subscriptions.push(this.route.paramMap.subscribe(async params => {
      this.assetModelFilterObj.app = this.contextApp.app;
      this.originalAssetsModelFilterObj = JSON.parse(JSON.stringify(this.assetModelFilterObj));
      await this.getTileName();
      if (this.iotAssetsTab?.visibility) {
        this.componentState = CONSTANTS.IP_ASSET;
      } else if (this.legacyAssetsTab?.visibility) {
        this.componentState = CONSTANTS.NON_IP_ASSET;
      } else if (this.iotGatewaysTab?.visibility) {
        this.componentState = CONSTANTS.IP_GATEWAY;
      }
      this.tableConfig = {
        type:  (this.tileData && this.tileData[1] ? this.tileData[1]?.value : ''),
        is_table_data_loading: this.isassetModelsListLoading,
        table_class: 'table-fix-head-asset-model',
        no_data_message: '',
        data : [
        {
          header_name: (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '') + ' Name',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'name'
        },
        {
          header_name: 'Protocol',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'protocol'
        },
        {
          header_name: 'Type',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'model_type'
        },
        {
          header_name: 'Created By',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'created_by'
        },
        {
          header_name: 'Assets inherited',
          is_display_filter: true,
          value_type: 'number',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'inherited_asset_count',
          btn_list: [
            {
              text: '',
              id: 'View Assets',
              valueclass: '',
              tooltip: 'View Assets'
            }
          ]
        },
        {
          header_name: 'Actions',
          key: undefined,
          data_type: 'button',
          btn_list: [
            // {
            //   icon: 'fa fa-fw fa-edit',
            //   text: '',
            //   id: 'Change ' + (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '') + ' Image',
            //   valueclass: '',
            //   tooltip: 'Change ' + (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '') + ' Image'
            // },
            {
              icon: 'fa fa-fw fa-table',
              text: '',
              id: 'View Control Panel',
              valueclass: '',
              tooltip: 'View Control panel'
            }
          ]
        }
        ]
      };
      this.searchAssetsModels();

      const obj = {
        type: 'replace',
        data: [
          {
            title: this.contextApp.user.hierarchyString,
            url: 'applications/' + this.contextApp.app
          },
            {
              title: (this.tileData && this.tileData[0] ? this.tileData[0]?.value : ''),
              url: 'applications/' + this.contextApp.app + '/' + 'assets/model'
            }
        ]
      };
      this.commonService.breadcrumbEvent.emit(obj);
    }));
  }

  onTabChange(type) {
    this.componentState = undefined;
    setTimeout(() => {
      this.componentState = type;
      this.searchAssetsModels();
    }, 300);
  }

  getTileName() {
    let selectedItem;
    let assetItem;
    const assetDataItem = {};
    this.contextApp.menu_settings.main_menu.forEach(item => {
      if (item.system_name === 'Asset Models') {
        selectedItem = item.showAccordion;
      }
      if (item.page === 'Assets') {
        assetItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    assetItem.forEach(item => {
      assetDataItem[item.name] = item.value;
    });
    this.iotAssetsTab = {
      visibility: assetDataItem['IOT Assets'],
      tab_name: assetDataItem['IOT Assets Tab Name'],
      table_key: assetDataItem['IOT Assets Table Key Name']
    };
    this.legacyAssetsTab = {
      visibility: assetDataItem['Legacy Assets'],
      tab_name: assetDataItem['Legacy Assets Tab Name'],
      table_key: assetDataItem['Legacy Assets Table Key Name']
    };
    this.iotGatewaysTab = {
      visibility: assetDataItem['IOT Gateways'],
      tab_name: assetDataItem['IOT Gateways Tab Name'],
      table_key: assetDataItem['IOT Gateways Table Key Name']
    };
  }

  searchAssetsModels() {
    this.tableConfig.is_table_data_loading = true;
    this.isassetModelsListLoading = true;
    this.isFilterSelected = true;
    this.assetModels = [];
    const obj = JSON.parse(JSON.stringify(this.assetModelFilterObj));
    // obj.model_type = this.componentState;
    this.subscriptions.push(this.assetModelService.getAssetsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          response.data.forEach(model => {
            if (model.model_type === this.componentState) {
              this.assetModels.push(model);
            }
          });
        }
        this.assetModels = JSON.parse(JSON.stringify(this.assetModels));
        this.isassetModelsListLoading = false;
        this.tableConfig.is_table_data_loading = false;
      }, error => {
        this.isassetModelsListLoading = false;
        this.tableConfig.is_table_data_loading = false;
      }
    ));
  }

  clearFilter() {
    this.assetModelFilterObj = undefined;
    this.assetModelFilterObj = JSON.parse(JSON.stringify(this.originalAssetsModelFilterObj));
  }

  onTableFunctionCall(obj) {
    if (obj.for === 'View Control Panel') {
      this.router.navigate(['applications', this.contextApp.app, 'assets', 'model', obj.data.name, 'control-panel']);
    } else if (obj.for === 'View Assets') {
      let data = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_LIST_FILTER_FOR_GATEWAY);
      if (!data) {
        data = {};
      }
      data['asset_model'] = obj.data.name;
      data['type'] = obj.data.model_type;
      console.log(data);
      this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_LIST_FILTER_FOR_GATEWAY, data);
      this.router.navigate(['applications', this.contextApp.app, 'assets']);
    }
  }

  async openCreateAssetModelModal(obj = undefined) {
    if (!obj) {
    this.assetModel = {};
    this.assetModel.app = this.contextApp.app;
    this.assetModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.assetModel.metadata = {};
    if (this.iotAssetsTab?.visibility) {
      this.assetModel.metadata.model_type = CONSTANTS.IP_ASSET;
    } else if (this.iotGatewaysTab?.visibility) {
      this.assetModel.metadata.model_type = CONSTANTS.IP_GATEWAY;
    } else if (this.legacyAssetsTab?.visibility) {
      this.assetModel.metadata.model_type = CONSTANTS.NON_IP_ASSET;
    }
    this.assetModel.tags = {};
    } else {
      this.assetModel = JSON.parse(JSON.stringify(obj));
      this.assetModel.metadata = {
        model_type: this.assetModel.model_type,
        image: this.assetModel.model_image
      };
      this.assetModel.tags = {
        protocol: this.assetModel.protocol,
        cloud_connectivity: this.assetModel.cloud_connectivity,
        reserved_tags: []
      };
    }
    // await this.getProtocolList();
    if (this.assetModel.id) {
      this.getConnectivityData();
      this.assetModel.tags = {
        protocol: this.assetModel.protocol,
        cloud_connectivity: this.assetModel.cloud_connectivity
      };
    }
    $('#createAssetModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
   // this.assetModel.tags.app = this.contextApp.app;
  }

  // async onLogoFileSelected(files: FileList): Promise<void> {
  //   this.isFileUploading = true;
  //   const data = await this.commonService.uploadImageToBlob(files.item(0), 'asset-model-images');
  //   if (data) {
  //     this.assetModel.metadata.image = data;
  //   } else {
  //     this.toasterService.showError('Error in uploading file', 'Upload file');
  //   }
  //   this.isFileUploading = false;
  // }

  getConnectivityData() {
    this.assetModel.tags.cloud_connectivity = undefined;
    if (this.assetModel && this.assetModel.tags && this.assetModel.tags.protocol) {
      this.connectivityList = this.protocolList.find(protocol => protocol.name === this.assetModel.tags.protocol)?.cloud_connectivity
       || [];
    }
  }

  createAssetsModel() {
    if (!this.assetModel.name || !this.assetModel.tags.protocol || !this.assetModel.tags.cloud_connectivity
    || !this.assetModel.metadata.model_type) {
      this.toasterService.showError('Please enter all required fields', 'Create Asset Model');
      return;
    }
    this.assetModel.metadata.telemetry_mode_settings = {
      normal_mode_frequency: 60,
      turbo_mode_frequency: 5,
      turbo_mode_timeout_time: 120
    };
    this.assetModel.metadata.measurement_settings = {
      measurement_frequency: 5
    };
    this.assetModel.metadata.data_ingestion_settings = {
      type: 'all_props_at_fixed_interval',
      frequency_in_sec: 10
    };
    this.assetModel.tags.reserved_tags = [];
    console.log(this.assetModel.tags);
    this.assetModel.tags.reserved_tags.push({
      name: 'Protocol',
      key: 'protocol',
      defaultValue: this.assetModel.tags.protocol,
      nonEditable: true
    });
    console.log(this.assetModel.tags);
    this.assetModel.tags.reserved_tags.push({
      name: 'Cloud Connectivity',
      key: 'cloud_connectivity',
      defaultValue: this.assetModel.tags.cloud_connectivity,
      nonEditable: true
    });
    this.isCreateAssetsModelAPILoading = true;
    const method = this.assetModel.id ? this.assetModelService.updateAssetsModel(this.assetModel, this.contextApp.app) :
    this.assetModelService.createAssetsModel(this.assetModel, this.contextApp.app);
    this.subscriptions.push(method.subscribe(
      (response: any) => {
        this.isCreateAssetsModelAPILoading = false;
        this.onCloseAssetsModelModal();
        this.toasterService.showSuccess(response.message, 'Create Asset Model');
        this.searchAssetsModels();
      }, error => {
        this.isCreateAssetsModelAPILoading = false;
        this.toasterService.showError(error.message, 'Create Asset Model');
      }
    ));
  }

  onCloseAssetsModelModal() {
    $('#createAssetModelModal').modal('hide');
    this.assetModel = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
