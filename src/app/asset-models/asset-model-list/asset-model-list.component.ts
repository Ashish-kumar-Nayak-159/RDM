import { Subscription } from 'rxjs';
import { ToasterService } from './../../services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from './../../services/asset-model/asset-model.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ApplicationService } from 'src/app/services/application/application.service';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';

declare var $: any;
@Component({
  selector: 'app-asset-model-list',
  templateUrl: './asset-model-list.component.html',
  styleUrls: ['./asset-model-list.component.css'],
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
  addOptionBtn: { visibility: any; name: any };
  iotAssetsTab: { visibility: any; tab_name: any; table_key: any; name: any };
  legacyAssetsTab: { visibility: any; tab_name: any; table_key: any; name: any };
  iotGatewaysTab: { visibility: any; tab_name: any; table_key: any; name: any };
  componentState: any;
  decodedToken: any;
  constructor(
    private assetModelService: AssetModelService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.subscriptions.push(
      this.route.paramMap.subscribe(async (params) => {
        this.assetModelFilterObj.app = this.contextApp.app;
        this.originalAssetsModelFilterObj = JSON.parse(JSON.stringify(this.assetModelFilterObj));
        this.getTileName();
        if (this.iotAssetsTab?.visibility) {
          this.componentState = CONSTANTS.IP_ASSET;
        } else if (this.legacyAssetsTab?.visibility) {
          this.componentState = CONSTANTS.NON_IP_ASSET;
        } else if (this.iotGatewaysTab?.visibility) {
          this.componentState = CONSTANTS.IP_GATEWAY;
        }else{
          this.decodedToken = null;
        }
        this.tableConfig = {
          type: this.tileData && this.tileData[1] ? this.tileData[1]?.value : '',
          is_table_data_loading: this.isassetModelsListLoading,
          table_class: 'table-fix-head-asset-model',
          no_data_message: '',
          data: [
            {
              header_name: (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '') + ' Name',
              is_display_filter: true,
              value_type: 'string',
              is_sort_required: true,
              fixed_value_list: [],
              data_type: 'text',
              data_key: 'name',
            },
            {
              header_name: 'Protocol',
              is_display_filter: true,
              value_type: 'string',
              is_sort_required: true,
              fixed_value_list: [],
              data_type: 'text',
              data_key: 'protocol',
            },
            {
              header_name: 'Type',
              is_display_filter: true,
              value_type: 'string',
              is_sort_required: true,
              fixed_value_list: [],
              data_type: 'text',
              data_key: 'local_model_type',
            },
            {
              header_name: 'Created By',
              is_display_filter: true,
              value_type: 'string',
              is_sort_required: true,
              fixed_value_list: [],
              data_type: 'text',
              data_key: 'created_by',
            },
            {
              header_name: 'Assets Inherited',
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
                  tooltip: 'View Assets',
                },
              ],
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
                  id: 'View Model Panel',
                  valueclass: '',
                  tooltip: 'View Model Panel',
                },
              ],
            },
          ],
        };
        this.searchAssetsModels();

        const obj = {
          type: 'replace',
          data: [
            {
              title: this.contextApp.user.hierarchyString,
              url: 'applications/' + this.contextApp.app,
            },
            {
              title: this.tileData && this.tileData[0] ? this.tileData[0]?.value : '',
              url: 'applications/' + this.contextApp.app + '/' + 'assets/model',
            },
          ],
        };
        this.commonService.breadcrumbEvent.emit(obj);
      })
    );
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
    let addBtnItem;
    const addBtnDataItem = {};
    const assetDataItem = {};
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.system_name === 'Asset Models') {
        selectedItem = item.showAccordion;
      }
      if (item.page === 'Assets') {
        assetItem = item.showAccordion;
      }
      if (item.page === 'Asset Models') {
        addBtnItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    assetItem.forEach((item) => {
      assetDataItem[item.name] = item.value;
    });
    addBtnItem.forEach((item) => {
      addBtnDataItem[item.name] = item.value;
    });
    this.addOptionBtn = {
        visibility: addBtnDataItem['Add Option'],
        name: addBtnDataItem['Add Option'],
    };
    this.iotAssetsTab = {
      visibility: assetDataItem['IoT Assets'],
      tab_name: assetDataItem['IoT Assets Tab Name'],
      table_key: assetDataItem['IoT Assets Table Key Name'],
      name: assetDataItem['IoT Asset'],
    };
    this.legacyAssetsTab = {
      visibility: assetDataItem['Legacy Assets'],
      tab_name: assetDataItem['Legacy Assets Tab Name'],
      table_key: assetDataItem['Legacy Assets Table Key Name'],
      name: assetDataItem['Legacy Asset'],
    };
    this.iotGatewaysTab = {
      visibility: assetDataItem['IoT Gateways'],
      tab_name: assetDataItem['IoT Gateways Tab Name'],
      table_key: assetDataItem['IoT Gateways Table Key Name'],
      name: assetDataItem['IoT Gateway'],
    };
  }

  searchAssetsModels() {
    this.tableConfig.is_table_data_loading = true;
    this.isassetModelsListLoading = true;
    this.isFilterSelected = true;
    this.assetModels = [];
    const obj = JSON.parse(JSON.stringify(this.assetModelFilterObj));
    // obj.model_type = this.componentState;
    this.subscriptions.push(
      this.assetModelService.getAssetsModelsList(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            response.data.forEach((model) => {
              if (model.model_type === this.componentState) {
                if (model.model_type === CONSTANTS.IP_ASSET) {
                  model.local_model_type = this.iotAssetsTab?.name || CONSTANTS.IP_ASSET;
                } else if (model.model_type === CONSTANTS.IP_GATEWAY) {
                  model.local_model_type = this.iotGatewaysTab?.name || CONSTANTS.IP_GATEWAY;
                } else if (model.model_type === CONSTANTS.NON_IP_ASSET) {
                  model.local_model_type = this.legacyAssetsTab?.name || CONSTANTS.NON_IP_ASSET;
                }
                this.assetModels.push(model);
              }
            });
          }
          this.assetModels = JSON.parse(JSON.stringify(this.assetModels));
          this.commonService.setItemInLocalStorage("model_item",JSON.stringify(this.assetModels[0]?.model_type));
          this.isassetModelsListLoading = false;
          this.tableConfig.is_table_data_loading = false;
        },
        (error) => {
          this.isassetModelsListLoading = false;
          this.tableConfig.is_table_data_loading = false;
        }
      )
    );
  }

  clearFilter() {
    this.assetModelFilterObj = undefined;
    this.assetModelFilterObj = JSON.parse(JSON.stringify(this.originalAssetsModelFilterObj));
  }

  onTableFunctionCall(obj) {
    if (obj.for === 'View Model Panel') {
      this.router.navigate(['applications', this.contextApp.app, 'assets', 'model', obj.data.name, 'control-panel']);
    } else if (obj.for === 'View Assets') {
      let data = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_LIST_FILTER_FOR_GATEWAY);
      if (!data) {
        data = {};
      }
      data['asset_model'] = obj.data.name;
      data['type'] = obj.data.model_type;
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
      this.assetModel.metadata.model_type = this.componentState;
      this.assetModel.tags = {};
    } else {
      this.assetModel = JSON.parse(JSON.stringify(obj));
      this.assetModel.metadata = {
        model_type: this.componentState,
        image: this.assetModel.model_image,
      };
      this.assetModel.tags = {
        protocol: this.assetModel.protocol,
        cloud_connectivity: this.assetModel.cloud_connectivity,
        reserved_tags: [],
      };
    }
    // await this.getProtocolList();
    if (this.assetModel.id) {
      this.getConnectivityData();
      this.assetModel.tags = {
        protocol: this.assetModel.protocol,
        cloud_connectivity: this.assetModel.cloud_connectivity,
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
      this.connectivityList =
        this.protocolList.find((protocol) => protocol.name === this.assetModel.tags.protocol)?.cloud_connectivity || [];
    }
  }

  createAssetsModel() {
    let assetModelMsg = `Create ${this.assetModel.metadata.model_type} Model`;
    if (
      !this.assetModel.name ||
      !this.assetModel.tags.protocol ||
      !this.assetModel.tags.cloud_connectivity ||
      !this.assetModel.metadata.model_type
    ) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED,assetModelMsg );
      return;
    }
    this.assetModel.metadata.telemetry_mode_settings = {
      turbo_mode_timeout_time: 120,
      g1_turbo_mode_frequency_in_ms: 60,
      g2_turbo_mode_frequency_in_ms: 120,
      g3_turbo_mode_frequency_in_ms: 180,
      g1_ingestion_frequency_in_ms: 600,
      g2_ingestion_frequency_in_ms: 1200,
      g3_ingestion_frequency_in_ms: 1800,
    };
    this.assetModel.metadata.measurement_settings = {
      g1_measurement_frequency_in_ms: 60,
      g2_measurement_frequency_in_ms: 120,
      g3_measurement_frequency_in_ms: 180,
    };
    this.assetModel.metadata.data_ingestion_settings = {
      type: 'all_props_at_fixed_interval',
    };
    this.assetModel.tags.reserved_tags = [];
    this.assetModel.tags.reserved_tags.push({
      name: 'Protocol',
      key: 'protocol',
      defaultValue: this.assetModel.tags.protocol,
      nonEditable: true,
    });
    this.assetModel.tags.reserved_tags.push({
      name: 'Cloud Connectivity',
      key: 'cloud_connectivity',
      defaultValue: this.assetModel.tags.cloud_connectivity,
      nonEditable: true,
    });
    this.isCreateAssetsModelAPILoading = true;
    const method = this.assetModel.id
      ? this.assetModelService.updateAssetsModel(this.assetModel, this.contextApp.app)
      : this.assetModelService.createAssetsModel(this.assetModel, this.contextApp.app);
    this.subscriptions.push(
      method.subscribe(
        (response: any) => {
          this.isCreateAssetsModelAPILoading = false;
          this.onCloseAssetsModelModal();
          this.toasterService.showSuccess(response.message, assetModelMsg);
          this.searchAssetsModels();
        },
        (error) => {
          this.isCreateAssetsModelAPILoading = false;
          this.toasterService.showError(error.message, assetModelMsg);
        }
      )
    );
  }

  onCloseAssetsModelModal() {
    $('#createAssetModelModal').modal('hide');
    this.assetModel = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
