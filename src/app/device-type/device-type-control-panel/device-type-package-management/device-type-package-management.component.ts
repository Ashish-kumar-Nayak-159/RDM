import { FileSaverService } from 'ngx-filesaver';
import { ToasterService } from './../../../services/toaster.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CONSTANTS } from './../../../app.constants';
import { Subscription } from 'rxjs';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { CommonService } from './../../../services/common.service';
import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'app-device-type-package-management',
  templateUrl: './device-type-package-management.component.html',
  styleUrls: ['./device-type-package-management.component.css']
})
export class DeviceTypePackageManagementComponent implements OnInit {

  @Input() deviceType: any;
  packages: any[] = [];
  isPackagesAPILoading = false;
  packageTableConfig: any;
  packageObj: any;
  isCreatePackageAPILoading = false;
  isFileUploading = false;
  selectedPackage: any;
  blobStorageURL = environment.blobURL;
  sasToken = environment.blobKey;
  filterObj: any = {};
  subscriptions: Subscription[] = [];
  contextApp: any;
  modalType: string;
  constantData = CONSTANTS;
  appPackages: any[] = [];
  applicationList = CONSTANTS.DEVICEAPPPS;
  constructor(
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private sanitizer: DomSanitizer,
    private toasterService: ToasterService,
    private fileSaverService: FileSaverService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.deviceType.metadata.model_type !== this.constantData.NON_IP_DEVICE) {
      this.setUpPackageData();
      this.getPackages();
    }
  }

  setUpPackageData() {
    this.packageTableConfig = {
      type: 'Packages',
      tableHeight: 'calc(100vh - 11rem)',
      freezed: this.deviceType.freezed,
      data: [
        {
          name: 'Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Display Name',
          key: 'display_name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Version',
          key: 'version',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Actions',
          key: undefined,
          type: 'button',
          headerClass: '',
          btnData: [
            {
              icon: 'fa fa-fw fa-download',
              text: '',
              id: 'Download',
              valueclass: '',
              tooltip: 'Download'
            },

          ]
        }
      ]
    };
  }

  // {
  //   icon: 'fa fa-fw fa-edit',
  //   text: '',
  //   id: 'Edit',
  //   valueclass: '',
  //   tooltip: 'Edit',
  //   disableConditions: {
  //     key: 'freezed',
  //     value: true
  //   }
  // },
  // {
  //   icon: 'fa fa-fw fa-trash',
  //   text: '',
  //   id: 'Delete',
  //   valueclass: '',
  //   tooltip: 'Delete',
  //   disableConditions: {
  //     key: 'freezed',
  //     value: true
  //   }
  // }

  getPackages() {
    this.packages = [];
    this.isPackagesAPILoading = true;
    this.subscriptions.push(
      this.deviceTypeService.getPackages(this.contextApp.app, this.deviceType.name, {}).subscribe(
        (response: any) => {
          if (response.data?.length > 0) {
            this.packages = response.data;
          }
          this.isPackagesAPILoading = false;
        }
      )
    );

  }

  openAddPackageModal(obj = undefined) {
    if (!obj) {
      this.packageObj = {
        metadata: {}
      };
    } else {
        this.packageObj = JSON.parse(JSON.stringify(obj));
    }
    $('#addPackageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  sanitizeURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.blobStorageURL + this.selectedPackage.url + this.sasToken);
  }

  onAppChange() {
    // if (this.packageObj.name) {
    //   this.appPackages = this.packages.filter(obj => obj.name === this.packageObj.name);
    // } else {
    //   this.appPackages = [];
    // }
  }

  onTableFunctionCall(obj) {
    if (obj.for === 'Download') {
      this.downloadFile(obj.data);
      this.modalType = 'download';
    } else if (obj.for === 'Delete') {
      this.openModal('confirmMessageModal');
      this.modalType = 'delete';
      this.selectedPackage = obj.data;
    } else if (obj.for === 'Edit') {
      this.openAddPackageModal(obj.data);
    }
  }

  openModal(id) {
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onCloseAddPackageModal() {
    this.packageObj = undefined;
    $('#addPackageModal').modal('hide');
  }

  async onDocumentFileSelected(files: FileList): Promise<void> {
    console.log('hereeeee');
    const arr = files?.item(0)?.name?.split('.') || [];
    if (!files?.item(0).type.includes('zip') && !files?.item(0).type.includes('rar')) {
      this.toasterService.showError('Only .zip and .rar files are allowed', 'Select File');
      return;
    }
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0),
    this.contextApp.app + '/models/' + this.deviceType.name + '/packages', environment.packageManagementContainer);
    if (data) {
      this.packageObj.url = data.url;
      if (!this.packageObj.metadata) {
        this.packageObj.metadata = {};
      }
      this.packageObj.metadata.file_name = data.name;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  onSavePackageObj() {
    if (!this.packageObj.name || (this.packageObj.name.trim()).length === 0 || !this.packageObj.display_name ||
    (this.packageObj.display_name.trim()).length === 0  || this.packageObj.metadata.major === undefined
    || this.packageObj.metadata.major === 0
    || !this.packageObj.url || this.packageObj.metadata.minor  === undefined || this.packageObj.metadata.patch  === undefined) {
      this.toasterService.showError('Please enter all required fields', ((this.packageObj.id ? 'Edit' : 'Add') + ' Package'));
      return;
    }
    this.packageObj.version = this.packageObj.metadata.major + '.' + this.packageObj.metadata.minor
    + '.' + this.packageObj.metadata.patch;
    this.isCreatePackageAPILoading = true;
    const method = this.packageObj.id ? this.deviceTypeService.updatePackage(this.deviceType.app,
      this.deviceType.name, this.packageObj.id, this.packageObj) : this.deviceTypeService.createPackage(
        this.deviceType.app, this.deviceType.name, this.packageObj);
    this.subscriptions.push(method.subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, ((this.packageObj.id ? 'Edit' : 'Add') + ' Package'));
          this.isCreatePackageAPILoading = false;
          this.onCloseAddPackageModal();
          this.getPackages();
        }, error => {
          this.toasterService.showError(error.message, ((this.packageObj.id ? 'Edit' : 'Add') + ' Package'));
          this.isCreatePackageAPILoading = false;
        }
    ));
  }

  downloadFile(packageObj) {
    this.openModal('confirmMessageModal');
    setTimeout(() => {
      const url = this.blobStorageURL + packageObj.url + this.sasToken;
      this.subscriptions.push(this.commonService.getFileData(url).subscribe(
        response => {
          this.fileSaverService.save(response, packageObj.metadata.file_name);
          this.closeConfirmModal();
        }
      ));
    }, 1000);
  }

  closeConfirmModal() {
    $('#confirmMessageModal').modal('hide');
    this.selectedPackage = undefined;
    this.modalType = undefined;
  }

  deletePackage() {
    this.isCreatePackageAPILoading = true;
    this.subscriptions.push(this.deviceTypeService.deletePackage
      (this.deviceType.app, this.deviceType.name, this.selectedPackage.id).
      subscribe((response: any) => {
        this.toasterService.showSuccess(response.message, 'Remove Document');
        this.closeConfirmModal();
        this.getPackages();
        this.isCreatePackageAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Remove Document');
        this.closeConfirmModal();
        this.isCreatePackageAPILoading = false;
      }));
  }

}
