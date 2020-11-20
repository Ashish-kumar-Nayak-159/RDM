import { ToasterService } from './../../services/toaster.service';
import { CONSTANTS } from './../../app.constants';
import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ApplicationService } from 'src/app/services/application/application.service';

declare var $: any;
@Component({
  selector: 'app-device-type-list',
  templateUrl: './device-type-list.component.html',
  styleUrls: ['./device-type-list.component.css']
})
export class DeviceTypeListComponent implements OnInit {

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
  protocolList = CONSTANTS.PROTOCOL_CONNECTIVITY_LIST;
  connectivityList: string[] = [];
  isFileUploading = false;
  originalThingsModelFilterObj: any;
  appName: any;
  applicationData: any;
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
    this.route.paramMap.subscribe(async params => {
      this.appName = params.get('applicationId');
      this.applicationData = this.userData.apps.filter(
        app => app.app === params.get('applicationId')
      )[0];
      await this.getApplicationData();
      this.thingsModelFilterObj.app = this.applicationData.app;
      this.originalThingsModelFilterObj = JSON.parse(JSON.stringify(this.thingsModelFilterObj));
      this.searchThingsModels();
      const obj = {
        type: 'replace',
        data: [
          {
            title: this.contextApp.user.hierarchyString,
            url: 'applications/' + this.contextApp.app
          },
            {
              title: 'Asset Models',
              url: 'applications/' + this.contextApp.app + '/' + 'things/model'
            }
        ]
      };
      this.commonService.breadcrumbEvent.emit(obj);
    });
    this.tableConfig = {
      type: 'Things Model',
      data: [
        {
          name: 'Model Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Template',
          key: 'tags.cloud_connectivity',
          type: 'text',
          headerClass: 'w-10',
          valueclass: ''
        },
        {
          name: 'Created By',
          key: 'created_by',
          type: 'text',
          headerClass: 'w-30',
          valueclass: ''
        },
        {
          name: 'No of Devices inherited',
          key: 'inherited_device_count',
          type: 'text',
          headerClass: 'w-30',
          valueclass: ''
        },
        {
          name: 'Actions',
          key: undefined,
          type: 'button',
          headerClass: '',
          btnData: [
            {
              icon: 'fas fa-fw fa-table',
              text: '',
              id: 'View Control Panel',
              valueclass: '',
              tooltip: 'View Control panel'
            }
          ]
        }
      ]
    };
    
    
  }

  getApplicationData() {
    return new Promise((resolve) => {
      this.applicationService.getApplicationDetail(this.appName).subscribe(
        (response: any) => {
            this.contextApp = response;
            this.contextApp.user = this.applicationData.user;
            resolve();
        });
    });
  }

  searchThingsModels() {
    this.isthingsModelsListLoading = true;
    this.isFilterSelected = true;
    this.thingsModels = [];
    const obj = JSON.parse(JSON.stringify(this.thingsModelFilterObj));
    this.deviceTypeService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.thingsModels = response.data;
        }
        this.isthingsModelsListLoading = false;
      }, error => this.isthingsModelsListLoading = false
    );
  }

  clearFilter() {
    this.thingsModelFilterObj = undefined;
    this.thingsModelFilterObj = JSON.parse(JSON.stringify(this.originalThingsModelFilterObj));
  }

  onTableFunctionCall(obj) {
    this.router.navigate(['applications', this.contextApp.app, 'things', 'model', obj.data.name, 'control-panel']);
  }

  openCreateDeviceTypeModal() {
    this.thingsModel = {};
    this.thingsModel.app = this.contextApp.app;
    this.thingsModel.created_by = this.userData.name;
    this.thingsModel.metadata = {};
    this.thingsModel.metadata.model_type = CONSTANTS.IP_DEVICE;
    this.thingsModel.tags = {};
    this.getProtocolList();

   // this.thingsModel.tags.app = this.contextApp.app;
    $('#createDeviceTypeModal').modal({ backdrop: 'static', keyboard: false, show: true });
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

  getProtocolList() {
    const data = JSON.parse(JSON.stringify(CONSTANTS.PROTOCOL_CONNECTIVITY_LIST));
    data.forEach(protocol => {
      if (this.thingsModel.metadata.model_type === CONSTANTS.IP_DEVICE || this.thingsModel.metadata.model_type === CONSTANTS.IP_GATEWAY) {
        if (!protocol.name.includes('IP')) {
          protocol.display = false;
        }
        if (this.thingsModel.metadata.model_type === CONSTANTS.IP_GATEWAY && protocol.name.includes('IP')) {
          protocol.name = protocol.name.replace('Device', 'Gateway');
          const list = [];
          protocol.connectivity.forEach(item => {
            list.push(item.replace('Device', 'Gateway'));
          });
          protocol.connectivity = JSON.parse(JSON.stringify(list));
        }
      } else {
        if (protocol.name.includes('IP')) {
          protocol.display = false;
        }
      }
    });
    console.log(JSON.stringify(data));
    this.protocolList = JSON.parse(JSON.stringify(data));
  }

  getConnectivityData() {
    this.thingsModel.tags.cloud_connectivity = undefined;
    if (this.thingsModel && this.thingsModel.tags && this.thingsModel.tags.protocol) {
      this.connectivityList = (this.protocolList.filter(protocol => protocol.name === this.thingsModel.tags.protocol)[0]).connectivity;
    }
  }

  createThingsModel() {
    if (!this.thingsModel.name || !this.thingsModel.tags.protocol || !this.thingsModel.tags.cloud_connectivity
    || !this.thingsModel.metadata.model_type) {
      this.toasterService.showError('Please fill all the fieds', 'Create Things Model');
      return;
    }
    console.log(this.thingsModel);
    this.isCreateThingsModelAPILoading = true;
    this.deviceTypeService.createThingsModel(this.thingsModel, this.contextApp.app).subscribe(
      (response: any) => {
        this.isCreateThingsModelAPILoading = false;
        this.onCloseThingsModelModal();
        this.toasterService.showSuccess(response.message, 'Create Things Model');
        this.searchThingsModels();
      }, error => {
        this.isCreateThingsModelAPILoading = false;
        this.toasterService.showError(error.message, 'Create Things Model');
      }
    );
  }


  onCloseThingsModelModal() {
    $('#createDeviceTypeModal').modal('hide');
    this.thingsModel = undefined;
  }

}
