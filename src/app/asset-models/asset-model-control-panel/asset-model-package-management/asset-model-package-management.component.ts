import { FileSaverService } from 'ngx-filesaver';
import { ToasterService } from './../../../services/toaster.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Subscription } from 'rxjs';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { CommonService } from './../../../services/common.service';
import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
declare var $: any;
@Component({
  selector: 'app-asset-model-package-management',
  templateUrl: './asset-model-package-management.component.html',
  styleUrls: ['./asset-model-package-management.component.css'],
})
export class AssetModelPackageManagementComponent implements OnInit {
  @Input() assetModel: any;
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
  applicationList = CONSTANTS.ASSETAPPPS;
  decodedToken: any;
  headerMessage: string;
  bodyMessage: string;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  uploadedFile: any = []
  constructor(
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private sanitizer: DomSanitizer,
    private toasterService: ToasterService,
    private fileSaverService: FileSaverService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    if (this.assetModel.metadata.model_type !== this.constantData.NON_IP_ASSET) {
      this.setUpPackageData();
      this.getPackages();
    } else {
      let assetItem;
      const assetDataItem = {};
      this.contextApp.menu_settings.main_menu.forEach((item) => {
        if (item.page === 'Assets') {
          assetItem = item.showAccordion;
        }
      });
      assetItem.forEach((item) => {
        assetDataItem[item.name] = item.value;
      });
      this.assetModel.metadata.local_model_type = assetDataItem['Legacy Asset'] || CONSTANTS.NON_IP_ASSET;
    }
  }

  setUpPackageData() {
    this.packageTableConfig = {
      type: 'Packages',
      tableHeight: 'calc(100vh - 11rem)',
      freezed: this.assetModel.freezed,
      data: [
        {
          name: 'Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Display Name',
          key: 'display_name',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Version',
          key: 'version',
          type: 'text',
          headerClass: '',
          valueclass: '',
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
              tooltip: 'Download',
            },
          ],
        },
      ],
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
      this.assetModelService.getPackages(this.contextApp.app, this.assetModel.name, {}).subscribe((response: any) => {
        if (response.data?.length > 0) {
          this.packages = response.data;
        }
        this.isPackagesAPILoading = false;
      })
    );
  }

  openAddPackageModal(obj = undefined) {
    if (!obj) {
      this.packageObj = {
        metadata: {},
      };
    } else {
      this.packageObj = JSON.parse(JSON.stringify(obj));
    }
    $('#addPackageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  sanitizeURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.blobStorageURL + this.selectedPackage.url + this.sasToken
    );
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
      this.headerMessage = 'Delete Package';
      this.bodyMessage = 'Are you sure you want to remove this package?';
      this.modalConfig = {
        stringDisplay: true,
        isDisplaySave: true,
        isDisplayCancel: true,
      };
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
    if (!files?.item(0).type.includes('zip')) {
      this.toasterService.showError('Only .zip files are allowed', 'Select File');
      return;
    }
    this.uploadedFile = files?.item(0) || [];
    this.packageObj.metadata.file_name = this.uploadedFile.name;
  }
  onFileSelected(event) {
    let allowedZipMagicNumbers = ["504b34", "504B03", "504B0304"];
    this.uploadedFile = [];
    if (event?.target?.files) {
      let fileList = event.target.files as FileList;
      let file = fileList.item(0);
      let filereader = new FileReader();
      filereader.onloadend = () => {
        let contentHeader = filereader.result as ArrayBufferLike;
        let arr = (new Uint8Array(contentHeader)).subarray(0, 4);
        let header = '';
        for (let arrvalue of arr) {
          header += arrvalue.toString(16);
        }
        if (allowedZipMagicNumbers.includes(header)) {
          this.uploadedFile = file;                   
        }
        else {          
          this.toasterService.showError('Only .zip files are allowed', 'Select File');          
        }
        this.packageObj.metadata.file_name = this.uploadedFile.name;
        return;
      }
      filereader.readAsArrayBuffer(file);
    }
  }

  async uploadDocument() {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(
      this.uploadedFile,
      this.contextApp.app + '/models/' + this.assetModel.name + '/packages',
      environment.packageManagementContainer
    );
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

  async onSavePackageObj() {
    await this.uploadDocument();
    if (
      !this.packageObj.name ||
      this.packageObj.name.trim().length === 0 ||
      !this.packageObj.display_name ||
      this.packageObj.display_name.trim().length === 0 ||
      this.packageObj.metadata.major === undefined ||
      this.packageObj.metadata.major === 0 ||
      !this.packageObj.url ||
      this.packageObj.metadata.minor === undefined ||
      this.packageObj.metadata.patch === undefined
    ) {
      this.toasterService.showError(
        UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED,
        (this.packageObj.id ? 'Edit' : 'Add') + ' Package'
      );
      return;
    }

    this.packageObj.version =
      this.packageObj.metadata.major + '.' + this.packageObj.metadata.minor + '.' + this.packageObj.metadata.patch;
    this.isCreatePackageAPILoading = true;
    const method = this.packageObj.id
      ? this.assetModelService.updatePackage(
        this.assetModel.app,
        this.assetModel.name,
        this.packageObj.id,
        this.packageObj
      )
      : this.assetModelService.createPackage(this.assetModel.app, this.assetModel.name, this.packageObj);
    this.subscriptions.push(
      method.subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, (this.packageObj.id ? 'Edit' : 'Add') + ' Package');
          this.isCreatePackageAPILoading = false;
          this.onCloseAddPackageModal();
          this.getPackages();
        },
        (error) => {
          this.toasterService.showError(error.message, (this.packageObj.id ? 'Edit' : 'Add') + ' Package');
          this.isCreatePackageAPILoading = false;
        }
      )
    );
  }

  downloadFile(packageObj) {
    this.headerMessage = 'Download Package';
    this.bodyMessage = 'Downloading Package. Please wait...';
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: false,
    };
    this.openModal('confirmMessageModal');
    setTimeout(() => {
      const url = this.blobStorageURL + packageObj.url + this.sasToken;
      this.subscriptions.push(
        this.commonService.getFileData(url).subscribe(
          (response) => {
            this.fileSaverService.save(response, packageObj.metadata.file_name);
            this.closeConfirmModal();
          },
          (error) => {
            this.closeConfirmModal();
          }
        )
      );
    }, 1000);
  }

  closeConfirmModal() {
    $('#confirmMessageModal').modal('hide');
    this.selectedPackage = undefined;
    this.modalType = undefined;
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.closeConfirmModal();
    } else if (eventType === 'save') {
      this.deletePackage();
    }
  }

  deletePackage() {
    this.isCreatePackageAPILoading = true;
    this.subscriptions.push(
      this.assetModelService
        .deletePackage(this.assetModel.app, this.assetModel.name, this.selectedPackage.id)
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Remove Document');
            this.closeConfirmModal();
            this.getPackages();
            this.isCreatePackageAPILoading = false;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Remove Document');
            this.closeConfirmModal();
            this.isCreatePackageAPILoading = false;
          }
        )
    );
  }
}
