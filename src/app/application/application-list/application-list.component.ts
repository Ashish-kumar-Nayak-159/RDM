import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonService } from './../../services/common.service';
import { CONSTANTS } from './../../app.constants';
import { Router } from '@angular/router';
import { ApplicationService } from './../../services/application/application.service';
import { environment } from 'src/environments/environment';
import { BlobServiceClient, AnonymousCredential, newPipeline } from '@azure/storage-blob';
import { ToasterService } from './../../services/toaster.service';
import { UserService } from './../../services/user.service';
declare var $: any;
@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css']
})
export class ApplicationListComponent implements OnInit, AfterViewInit, OnDestroy {

  userData: any;
  applicationFilterObj: any = {};
  applications: any[] = [];
  isApplicationListLoading = false;
  applicationDetail: any;
  isCreateAPILoading = false;
  isFileUploading = false;
  blobSASToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  appModalType: string;
  apiSubscriptions: Subscription[] = [];
  constructor(
    private applicationService: ApplicationService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.commonService.breadcrumbEvent.emit({
      type: 'replace',
      data: [
        {
          title: 'Applications',
          url: 'applications'
        }
      ]
    });
    this.searchApplications();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const node = document.createElement('script');
      node.src = './assets/js/kdm.min.js';
      node.type = 'text/javascript';
      node.async = false;
      document.getElementsByTagName('head')[0].appendChild(node);
      }, 500);
  }

  searchApplications() {
    this.isApplicationListLoading = true;
    this.applications = [];
    this.apiSubscriptions.push(this.applicationService.getApplications(this.applicationFilterObj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.applications = response.data;
        }
        this.isApplicationListLoading = false;
      }, error => this.isApplicationListLoading = false
    ));
  }

  clearFilter() {
    this.applicationFilterObj = {};
  }

  redirectToDevices(app) {
  }

  onCheckboxValueChange() {
    if (!this.applicationDetail.metadata.app_specific_schema && !this.applicationDetail.metadata.app_specific_db &&
      !this.applicationDetail.metadata.app_telemetry_specific_schema) {
      this.applicationDetail.metadata.partition.telemetry.partition_strategy = undefined;
      this.applicationDetail.metadata.partition.telemetry.sub_partition_strategy = undefined;
    }
  }

  openCreateAppModal() {
    this.appModalType = 'Create';
    this.applicationDetail = {
      metadata: {
        customer: {},
        database_settings: {},
        app_specific_schema: true,
        partition: { telemetry: {}}
      }
    };
    $('#createAppModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openEditAppModal(app) {
    this.appModalType = 'Edit';
    app.id = app.app;
    this.applicationDetail = JSON.parse(JSON.stringify(app));
    $('#createAppModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openViewIconModal(app) {
    this.applicationDetail = app;
    if (!this.applicationDetail.customer) {
      this.applicationDetail.customer = {};
    }
    if (!this.applicationDetail.partition) {
      this.applicationDetail.partition = { telemetry: {}};
    }
    $('#viewAppIconModal').modal({ backdrop: 'static', keyboard: false, show: true });

  }

  async onHeaderLogoFileSelected(files: FileList): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'app-images/header-logo');
    if (data) {
      this.applicationDetail.metadata.header_logo = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  async onLogoFileSelected(files: FileList): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'app-images');
    if (data) {
      this.applicationDetail.metadata.logo = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  async onIconFileSelected(files: FileList): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'app-images');
    if (data) {
      this.applicationDetail.metadata.icon = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  onCloseCreateAppModal(modalId) {
    $('#' + modalId).modal('hide');
    this.applicationDetail = undefined;
    this.appModalType = undefined;
  }


  async createApp() {

    if (!this.applicationDetail.metadata.app_specific_schema && !this.applicationDetail.metadata.app_specific_db &&
      !this.applicationDetail.metadata.app_telemetry_specific_schema) {
      this.applicationDetail.metadata.partition.telemetry.partition_strategy = 'Device ID';
      this.applicationDetail.metadata.partition.telemetry.sub_partition_strategy = 'Weekly';
    }
    if (!this.applicationDetail.app || !this.applicationDetail.admin_email || !this.applicationDetail.admin_name ||
      !this.applicationDetail.metadata.partition.telemetry.partition_strategy
      || !this.applicationDetail.metadata.partition.telemetry.sub_partition_strategy
      ) {
      this.toasterService.showError('Please fill all details', 'Create App');
    } else {
      if (!CONSTANTS.ONLY_NOS_AND_CHARS.test(this.applicationDetail.app)) {
        this.toasterService.showError('App name only contains numbers and characters.',
          'Create App');
        return;
      }
      if (!CONSTANTS.EMAIL_REGEX.test(this.applicationDetail.admin_email)) {
        this.toasterService.showError('Email address is not valid',
          'Create App');
        return;
      }
      this.isCreateAPILoading = true;
      this.applicationDetail.hierarchy = {
        levels: ['App'],
        tags: {}
      };
      this.applicationDetail.roles = [{
        name: 'App Admin',
        level: 0
      }];
      const env = environment.environment;
      if (env) {
        this.applicationDetail.environment = env;
      }
      this.applicationDetail.configuration = {main_menu: [], device_control_panel_menu : [],
        model_control_panel_menu: [], gateway_control_panel_menu: [], legacy_device_control_panel_menu: []};
      const methodToCall = this.appModalType === 'Create' ? this.applicationService.createApp(this.applicationDetail) :
      (this.appModalType === 'Edit' ? this.applicationService.updateApp(this.applicationDetail) : null);
      if (methodToCall) {
        this.apiSubscriptions.push(methodToCall.subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, this.appModalType + ' App');
            this.onCloseCreateAppModal('createAppModal');
            this.searchApplications();
            this.isCreateAPILoading = false;
          }, error => {
            this.toasterService.showError(error.message, this.appModalType + ' App');
            this.isCreateAPILoading = false;
          }
        ));
      }

    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
