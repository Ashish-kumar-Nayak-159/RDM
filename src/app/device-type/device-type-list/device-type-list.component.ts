import { Subscription } from 'rxjs';
import { ToasterService } from './../../services/toaster.service';
import { CONSTANTS } from './../../app.constants';
import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ApplicationService } from 'src/app/services/application/application.service';

declare var $: any;
@Component({
  selector: 'app-device-type-list',
  templateUrl: './device-type-list.component.html',
  styleUrls: ['./device-type-list.component.css']
})
export class DeviceTypeListComponent implements OnInit, OnDestroy {

  thingsModels: any[] = [];
  thingsModel: any;
  tableConfig: any;
  isFilterSelected = true;
  isthingsModelsListLoading = false;
  userData: any;
  contextApp: any;
  thingsModelFilterObj: any = {};
  isCreateThingsModelAPILoading = false;
  constantData = CONSTANTS;
  protocolList = CONSTANTS.PROTOCOLS;
  connectivityList: string[] = [];
  isFileUploading = false;
  originalThingsModelFilterObj: any;
  tileData: any;
  subscriptions: Subscription[] = [];
  iotAssetsTab: { visibility: any; tab_name: any; table_key: any; };
  legacyAssetsTab: { visibility: any; tab_name: any; table_key: any; };
  iotGatewaysTab: { visibility: any; tab_name: any; table_key: any; };
  componentState: any;
  constructor(
    private deviceTypeService: DeviceTypeService,
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
      this.thingsModelFilterObj.app = this.contextApp.app;
      this.originalThingsModelFilterObj = JSON.parse(JSON.stringify(this.thingsModelFilterObj));
      await this.getTileName();
      if (this.iotAssetsTab?.visibility) {
        this.componentState = CONSTANTS.IP_DEVICE;
      } else if (this.legacyAssetsTab?.visibility) {
        this.componentState = CONSTANTS.NON_IP_DEVICE;
      } else if (this.iotGatewaysTab?.visibility) {
        this.componentState = CONSTANTS.IP_GATEWAY;
      }
      this.tableConfig = {
        type:  (this.tileData && this.tileData[1] ? this.tileData[1]?.value : ''),
        is_table_data_loading: this.isthingsModelsListLoading,
        table_class: 'table-fix-head-device-model',
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
          data_key: 'inherited_device_count',
          btn_list: [
            {
              text: '',
              id: 'View Devices',
              valueclass: '',
              tooltip: 'View Devices'
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
      this.searchThingsModels();

      const obj = {
        type: 'replace',
        data: [
          {
            title: this.contextApp.user.hierarchyString,
            url: 'applications/' + this.contextApp.app
          },
            {
              title: (this.tileData && this.tileData[0] ? this.tileData[0]?.value : ''),
              url: 'applications/' + this.contextApp.app + '/' + 'things/model'
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
      this.searchThingsModels();
    }, 300);
  }

  getTileName() {
    let selectedItem;
    let deviceItem;
    const deviceDataItem = {};
    this.contextApp.configuration.main_menu.forEach(item => {
      if (item.system_name === 'Things Models') {
        selectedItem = item.showAccordion;
      }
      if (item.page === 'Assets') {
        deviceItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    deviceItem.forEach(item => {
      deviceDataItem[item.name] = item.value;
    });
    this.iotAssetsTab = {
      visibility: deviceDataItem['IOT Assets'],
      tab_name: deviceDataItem['IOT Assets Tab Name'],
      table_key: deviceDataItem['IOT Assets Table Key Name']
    };
    this.legacyAssetsTab = {
      visibility: deviceDataItem['Legacy Assets'],
      tab_name: deviceDataItem['Legacy Assets Tab Name'],
      table_key: deviceDataItem['Legacy Assets Table Key Name']
    };
    this.iotGatewaysTab = {
      visibility: deviceDataItem['IOT Gateways'],
      tab_name: deviceDataItem['IOT Gateways Tab Name'],
      table_key: deviceDataItem['IOT Gateways Table Key Name']
    };
  }

  searchThingsModels() {
    this.tableConfig.is_table_data_loading = true;
    this.isthingsModelsListLoading = true;
    this.isFilterSelected = true;
    this.thingsModels = [];
    const obj = JSON.parse(JSON.stringify(this.thingsModelFilterObj));
    // obj.model_type = this.componentState;
    this.subscriptions.push(this.deviceTypeService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          response.data.forEach(model => {
            if (model.model_type === this.componentState) {
              this.thingsModels.push(model);
            }
          });
        }
        this.thingsModels = JSON.parse(JSON.stringify(this.thingsModels));
        this.isthingsModelsListLoading = false;
        this.tableConfig.is_table_data_loading = false;
      }, error => {
        this.isthingsModelsListLoading = false;
        this.tableConfig.is_table_data_loading = false;
      }
    ));
  }

  clearFilter() {
    this.thingsModelFilterObj = undefined;
    this.thingsModelFilterObj = JSON.parse(JSON.stringify(this.originalThingsModelFilterObj));
  }

  onTableFunctionCall(obj) {
    if (obj.for === 'View Control Panel') {
      this.router.navigate(['applications', this.contextApp.app, 'things', 'model', obj.data.name, 'control-panel']);
    } else if (obj.for === 'View Devices') {
      let data = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_LIST_FILTER_FOR_GATEWAY);
      if (!data) {
        data = {};
      }
      data['device_type'] = obj.data.name;
      data['type'] = obj.data.model_type;
      console.log(data);
      this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_LIST_FILTER_FOR_GATEWAY, data);
      this.router.navigate(['applications', this.contextApp.app, 'devices']);
    }
  }

  async openCreateDeviceTypeModal(obj = undefined) {
    if (!obj) {
    this.thingsModel = {};
    this.thingsModel.app = this.contextApp.app;
    this.thingsModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.thingsModel.metadata = {};
    if (this.iotAssetsTab?.visibility) {
      this.thingsModel.metadata.model_type = CONSTANTS.IP_DEVICE;
    } else if (this.iotGatewaysTab?.visibility) {
      this.thingsModel.metadata.model_type = CONSTANTS.IP_GATEWAY;
    } else if (this.legacyAssetsTab?.visibility) {
      this.thingsModel.metadata.model_type = CONSTANTS.NON_IP_DEVICE;
    }
    this.thingsModel.tags = {};
    } else {
      this.thingsModel = JSON.parse(JSON.stringify(obj));
      this.thingsModel.metadata = {
        model_type: this.thingsModel.model_type,
        image: this.thingsModel.model_image
      };
      this.thingsModel.tags = {
        protocol: this.thingsModel.protocol,
        cloud_connectivity: this.thingsModel.cloud_connectivity,
        reserved_tags: []
      };
    }
    // await this.getProtocolList();
    if (this.thingsModel.id) {
      this.getConnectivityData();
      this.thingsModel.tags = {
        protocol: this.thingsModel.protocol,
        cloud_connectivity: this.thingsModel.cloud_connectivity
      };
    }
    $('#createDeviceTypeModal').modal({ backdrop: 'static', keyboard: false, show: true });
   // this.thingsModel.tags.app = this.contextApp.app;
  }

  // async onLogoFileSelected(files: FileList): Promise<void> {
  //   this.isFileUploading = true;
  //   const data = await this.commonService.uploadImageToBlob(files.item(0), 'device-type-images');
  //   if (data) {
  //     this.thingsModel.metadata.image = data;
  //   } else {
  //     this.toasterService.showError('Error in uploading file', 'Upload file');
  //   }
  //   this.isFileUploading = false;
  // }

  getConnectivityData() {
    this.thingsModel.tags.cloud_connectivity = undefined;
    if (this.thingsModel && this.thingsModel.tags && this.thingsModel.tags.protocol) {
      this.connectivityList = this.protocolList.find(protocol => protocol.name === this.thingsModel.tags.protocol)?.cloud_connectivity
       || [];
    }
  }

  createThingsModel() {
    if (!this.thingsModel.name || !this.thingsModel.tags.protocol || !this.thingsModel.tags.cloud_connectivity
    || !this.thingsModel.metadata.model_type) {
      this.toasterService.showError('Please enter all required fields', 'Create Things Model');
      return;
    }
    this.thingsModel.metadata.telemetry_mode_settings = {
      normal_mode_frequency: 60,
      turbo_mode_frequency: 5,
      turbo_mode_timeout_time: 120
    };
    this.thingsModel.metadata.measurement_settings = {
      measurement_frequency: 5
    };
    this.thingsModel.metadata.data_ingestion_settings = {
      type: 'all_props_at_fixed_interval',
      frequency_in_sec: 10
    };
    this.thingsModel.tags.reserved_tags = [];
    console.log(this.thingsModel.tags);
    this.thingsModel.tags.reserved_tags.push({
      name: 'Protocol',
      key: 'protocol',
      defaultValue: this.thingsModel.tags.protocol,
      nonEditable: true
    });
    console.log(this.thingsModel.tags);
    this.thingsModel.tags.reserved_tags.push({
      name: 'Cloud Connectivity',
      key: 'cloud_connectivity',
      defaultValue: this.thingsModel.tags.cloud_connectivity,
      nonEditable: true
    });
    this.isCreateThingsModelAPILoading = true;
    const method = this.thingsModel.id ? this.deviceTypeService.updateThingsModel(this.thingsModel, this.contextApp.app) :
    this.deviceTypeService.createThingsModel(this.thingsModel, this.contextApp.app);
    this.subscriptions.push(method.subscribe(
      (response: any) => {
        this.isCreateThingsModelAPILoading = false;
        this.onCloseThingsModelModal();
        this.toasterService.showSuccess(response.message, 'Create Things Model');
        this.searchThingsModels();
      }, error => {
        this.isCreateThingsModelAPILoading = false;
        this.toasterService.showError(error.message, 'Create Things Model');
      }
    ));
  }

  onCloseThingsModelModal() {
    $('#createDeviceTypeModal').modal('hide');
    this.thingsModel = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
