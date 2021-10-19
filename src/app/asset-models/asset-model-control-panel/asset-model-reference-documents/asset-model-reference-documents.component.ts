import { CONSTANTS } from 'src/app/constants/app.constants';
import { Subscription } from 'rxjs';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { FileSaverService } from 'ngx-filesaver';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';

declare var $: any;
@Component({
  selector: 'app-asset-model-reference-documents',
  templateUrl: './asset-model-reference-documents.component.html',
  styleUrls: ['./asset-model-reference-documents.component.css'],
})
export class AssetModelReferenceDocumentsComponent implements OnInit, OnDestroy {
  @Input() assetModel: any;
  documents: any[] = [];
  docTableConfig: any;
  isDocumentsLoading = false;
  documentObj: any;
  isCreateDocumentLoading = false;
  isFileUploading = false;
  sasToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  selectedDocument: any;
  subscriptions: Subscription[] = [];
  contextApp: any;
  decodedToken: any;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  headerMessage: string;
  bodyMessage: string;
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private fileSaverService: FileSaverService,
    private sanitizer: DomSanitizer,
    private assetModelService: AssetModelService
  ) {}

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.setUpDocumentData();
    this.getDocuments();
  }

  setUpDocumentData() {
    this.docTableConfig = {
      type: 'Documents',
      tableHeight: 'calc(100vh - 11rem)',
      freezed: this.assetModel.freezed,
      data: [
        {
          name: 'Display Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Type',
          key: 'type',
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
            {
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'View Document',
              valueclass: '',
              tooltip: 'View Document',
            },
            {
              icon: 'fa fa-fw fa-edit',
              text: '',
              id: 'Edit',
              valueclass: '',
              tooltip: 'Edit',
              privilege_key: 'ASMMM',
              disableConditions: {
                key: 'freezed',
                value: true,
              },
            },
            {
              icon: 'fa fa-fw fa-trash',
              text: '',
              id: 'Delete',
              valueclass: '',
              tooltip: 'Delete',
              privilege_key: 'ASMMM',
              disableConditions: {
                key: 'freezed',
                value: true,
              },
            },
          ],
        },
      ],
    };
  }

  getDocuments() {
    this.documents = [];
    this.isDocumentsLoading = true;
    const obj = {
      app: this.assetModel.app,
      asset_model: this.assetModel.name,
    };
    this.subscriptions.push(
      this.assetModelService.getAssetsModelDocuments(obj).subscribe((response: any) => {
        if (response?.data) {
          this.documents = response.data;
        }
        this.isDocumentsLoading = false;
      })
    );
  }

  openAddDocumentModal(obj = undefined) {
    if (!obj) {
      this.documentObj = {
        metadata: {},
      };
    } else {
      this.documentObj = JSON.parse(JSON.stringify(obj));
    }
    $('#addDocumentModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onTableFunctionCall(obj) {
    if (obj.for === 'Download') {
      this.headerMessage = 'Download Document';
      this.bodyMessage = 'Downloading Document...';
      this.modalConfig = {
        stringDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: false,
      };
      this.downloadFile(obj.data.metadata);
    } else if (obj.for === 'Delete') {
      this.headerMessage = 'Remove Document';
      this.bodyMessage = 'Are you sure you want to remove this document?';
      this.modalConfig = {
        stringDisplay: true,
        isDisplaySave: true,
        isDisplayCancel: true,
      };
      this.openModal('confirmMessageModal');
      this.selectedDocument = obj.data;
    } else if (obj.for === 'View Document') {
      this.openModal('viewDocModal');
      this.selectedDocument = obj.data;
      this.selectedDocument.sanitizedURL = this.sanitizeURL();
    } else if (obj.for === 'Edit') {
      this.openAddDocumentModal(obj.data);
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.closeModal('confirmMessageModal');
    } else if (eventType === 'save') {
      this.deleteDocument();
    }
  }

  downloadFile(fileObj) {
    this.openModal('confirmMessageModal');
    const url = this.blobStorageURL + fileObj.url + this.sasToken;
    setTimeout(() => {
      this.subscriptions.push(
        this.commonService.getFileData(url).subscribe(
          (response) => {
            this.fileSaverService.save(response, fileObj.name);
            this.closeDownloadModal();
          },
          (error) => {
            this.closeDownloadModal();
          }
        )
      );
    }, 500);
    // $('#downloadDocumentModal').modal('toggle');
    // setTimeout(() => {
    //   this.closeDownloadModal();
    // }, 4000);
  }

  sanitizeURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.blobStorageURL + this.selectedDocument.metadata.url + this.sasToken
    );
  }

  openModal(id) {
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  closeModal(id) {
    console.log('hereeee');
    $('#' + id).modal('hide');
    this.selectedDocument = undefined;
  }

  closeDownloadModal() {
    this.selectedDocument = undefined;
    $('#confirmMessageModal').modal('hide');
  }

  onCloseAddDocModal() {
    this.documentObj = undefined;
    $('#addDocumentModal').modal('hide');
  }

  async onDocumentFileSelected(files: FileList): Promise<void> {
    const arr = files?.item(0)?.name?.split('.') || [];
    if (!files?.item(0).type.includes(this.documentObj.type?.toLowerCase())) {
      this.toasterService.showError('This file is not valid for selected document type', 'Select File');
      return;
    }
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(
      files.item(0),
      this.contextApp.app + '/models/' + this.assetModel.name + '/reference-material'
    );
    if (data) {
      this.documentObj.metadata = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  deleteDocument() {
    this.subscriptions.push(
      this.assetModelService
        .deleteAssetsModelDocument(this.selectedDocument.id, this.assetModel.app, this.assetModel.name)
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Remove Document');
            this.closeModal('confirmMessageModal');
            this.getDocuments();
          },
          (error) => {
            this.toasterService.showError(error.message, 'Remove Document');
            this.closeModal('confirmMessageModal');
          }
        )
    );
  }

  onDocumentTypeChange() {
    this.documentObj.metadata = undefined;
  }

  onSaveDocumentObj() {
    if (
      !this.documentObj.name ||
      this.documentObj.name.trim().length === 0 ||
      !this.documentObj.type ||
      !this.documentObj.metadata
    ) {
      this.toasterService.showError(
        UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED,
        (this.documentObj.id ? 'Edit' : 'Add') + ' Document'
      );
      return;
    }
    let flag = false;
    this.documents.forEach((doc) => {
      if (this.documentObj.name === doc.name && this.documentObj.id !== undefined && this.documentObj.id !== doc.id) {
        flag = true;
      }
    });
    if (flag) {
      this.toasterService.showError(
        'Document with same name is already exists',
        (this.documentObj.id ? 'Edit' : 'Add') + ' Document'
      );
      return;
    }
    this.isCreateDocumentLoading = true;
    const method = this.documentObj.id
      ? this.assetModelService.updateAssetsModelDocument(
          this.documentObj,
          this.assetModel.app,
          this.assetModel.name,
          this.documentObj.id
        )
      : this.assetModelService.createAssetsModelDocument(this.documentObj, this.assetModel.app, this.assetModel.name);
    this.subscriptions.push(
      method.subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, (this.documentObj.id ? 'Edit' : 'Add') + ' Document');
          this.isCreateDocumentLoading = false;
          this.onCloseAddDocModal();
          this.getDocuments();
        },
        (error) => {
          this.toasterService.showError(error.message, (this.documentObj.id ? 'Edit' : 'Add') + ' Document');
          this.isCreateDocumentLoading = false;
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
