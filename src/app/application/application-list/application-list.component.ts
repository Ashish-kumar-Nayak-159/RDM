import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
export class ApplicationListComponent implements OnInit, AfterViewInit {

  userData: any;
  applicationFilterObj: any = {};
  applications: any[] = [];
  isApplicationListLoading = false;
  applicationDetail: any;
  isCreateAPILoading = false;
  isFileUploading = false;
  blobSASToken = environment.blobKey;
  appModalType: string;
  constructor(
    private applicationService: ApplicationService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('in app component');
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
    console.log(typeof this.userData);
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
    this.applicationService.getApplications(this.applicationFilterObj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.applications = response.data;
        }
        this.isApplicationListLoading = false;
      }, error => this.isApplicationListLoading = false
    );
  }

  clearFilter() {
    this.applicationFilterObj = {};
  }

  redirectToDevices(app) {

    this.router.navigate(['applications', app.app, 'devices'], {
      queryParams: { state: app.metadata.contain_gateways ? CONSTANTS.IP_GATEWAY : (
        app.metadata.contain_devices ? CONSTANTS.IP_DEVICE : undefined
      )}
    });
  }

  openCreateAppModal() {
    this.appModalType = 'Create';
    this.applicationDetail = {
      metadata: {
        contain_gateways: true,
        contain_devices: false
      }
    };
    $('#createAppModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openEditAppModal(app) {
    this.appModalType = 'Edit';
    console.log(app);
    app.id = app.app;
    this.applicationDetail = JSON.parse(JSON.stringify(app));
    $('#createAppModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openViewIconModal(app) {
    console.log(app);
    this.applicationDetail = app;
    $('#viewAppIconModal').modal({ backdrop: 'static', keyboard: false, show: true });

  }

  async onHeaderLogoFileSelected(files: FileList): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'app-images');
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

  // async upload(file, folderName) {
  //   const containerName = environment.blobContainerName;
  //   const pipeline = newPipeline(new AnonymousCredential(), {
  //   retryOptions: { maxTries: 2 }, // Retry options
  //   keepAliveOptions: {
  //       // Keep alive is enabled by default, disable keep alive by setting false
  //       enable: false
  //   }
  //   });
  //   const blobServiceClient = new BlobServiceClient(environment.blobURL +  environment.blobKey, pipeline);
  //   const containerClient = blobServiceClient.getContainerClient(containerName);
  //   if (!containerClient.exists()){
  //   console.log('the container does not exit');
  //   await containerClient.create();
  //   }
  //   console.log(folderName + '/' + file.name);
  //   const client = containerClient.getBlockBlobClient(file.name);
  //   const response = await client.uploadBrowserData(file, {
  //         blockSize: 4 * 1024 * 1024, // 4MB block size
  //         concurrency: 20, // 20 concurrency
  //         onProgress: (ev) => console.log(ev),
  //         blobHTTPHeaders : { blobContentType: file.type }
  //         });
  //   console.log(response._response);
  //   if (response._response.status === 201) {
  //     return {
  //       url: environment.blobURL + '/' + containerName + '/' + folderName + '/' + file.name,
  //       name: file.name
  //     };
  //   }
  //   this.toasterService.showError('Error in uploading file', 'Upload file');
  //   return null;
  // }


  async createApp() {
    console.log(this.applicationDetail);
    if (!this.applicationDetail.app || !this.applicationDetail.admin_email || !this.applicationDetail.admin_name
      || !(this.applicationDetail.metadata.contain_devices
        || this.applicationDetail.metadata.contain_gateways)) {
      this.toasterService.showError('Please fill all details', 'Create App');
    } else {
      this.isCreateAPILoading = true;
      this.applicationDetail.hierarchy = [{
        name: 'App',
        level: 0,
        tags: [this.applicationDetail.app]
      }];
      this.applicationDetail.roles = [{
        name: 'App Admin',
        level: 0
      }];
      const methodToCall = this.appModalType === 'Create' ? this.applicationService.createApp(this.applicationDetail) :
      (this.appModalType === 'Edit' ? this.applicationService.updateApp(this.applicationDetail) : null);
      if (methodToCall) {
        methodToCall.subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, this.appModalType + ' App');
            this.onCloseCreateAppModal('createAppModal');
            this.searchApplications();
            this.isCreateAPILoading = false;
          }, error => {
            this.toasterService.showError(error.message, this.appModalType + ' App');
            this.isCreateAPILoading = false;
          }
        );
      }

    }
  }
}
