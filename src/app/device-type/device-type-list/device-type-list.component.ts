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
      this.getTileName();
      this.tableConfig = {
        type:  (this.tileData && this.tileData[1] ? this.tileData[1]?.value : ''),
        is_table_data_loading: this.isthingsModelsListLoading,
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
          data_key: 'inherited_device_count'
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

  getTileName() {
    let name;
    this.contextApp.configuration.main_menu.forEach(item => {
      if (item.system_name === 'Things Models') {
        name = item.showAccordion;
      }
    });
    this.tileData = name;
  }

  searchThingsModels() {
    this.tableConfig.is_table_data_loading = true;
    this.isthingsModelsListLoading = true;
    this.isFilterSelected = true;
    this.thingsModels = [];
    const obj = JSON.parse(JSON.stringify(this.thingsModelFilterObj));
    this.subscriptions.push(this.deviceTypeService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.thingsModels = response.data;
        }
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
    } else {
      this.openCreateDeviceTypeModal(obj.data);
    }
  }

  async openCreateDeviceTypeModal(obj = undefined) {
    if (!obj) {
    this.thingsModel = {};
    this.thingsModel.app = this.contextApp.app;
    this.thingsModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.thingsModel.metadata = {};
    this.thingsModel.metadata.model_type = CONSTANTS.IP_DEVICE;
    this.thingsModel.tags = {};
    } else {
      this.thingsModel = JSON.parse(JSON.stringify(obj));
      this.thingsModel.metadata = {
        model_type: this.thingsModel.model_type,
        image: this.thingsModel.model_image
      };
      this.thingsModel.tags = {
        protocol: this.thingsModel.protocol,
        cloud_connectivity: this.thingsModel.cloud_connectivity
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

  async onLogoFileSelected(files: FileList): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'device-type-images');
    if (data) {
      this.thingsModel.metadata.image = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

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
      this.toasterService.showError('Please fill all the fieds', 'Create Things Model');
      return;
    }
    this.thingsModel.metadata.measurement_frequency = {
      min: 1,
      max: 10,
      average: 5
    };
    this.thingsModel.metadata.telemetry_frequency = {
      min: 1,
      max: 60,
      average: 30
    };
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
