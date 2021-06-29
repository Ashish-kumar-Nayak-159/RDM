import { CONSTANTS } from './../../../app.constants';
import { Subscription } from 'rxjs';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { CONSTANTS } from 'src/app/app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { FileSaverService } from 'ngx-filesaver';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

declare var $: any;
@Component({
  selector: 'app-device-type-reference-documents',
  templateUrl: './device-type-reference-documents.component.html',
  styleUrls: ['./device-type-reference-documents.component.css']
})
export class DeviceTypeReferenceDocumentsComponent implements OnInit, OnDestroy {

  @Input() deviceType: any;
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
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private fileSaverService: FileSaverService,
    private sanitizer: DomSanitizer,
    private deviceTypeService: DeviceTypeService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.setUpDocumentData();
    this.getDocuments();
  }

  setUpDocumentData() {
    this.docTableConfig = {
      type: 'Documents',
      tableHeight: 'calc(100vh - 11rem)',
      freezed: this.deviceType.freezed,
      data: [
        {
          name: 'Display Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Type',
          key: 'type',
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
            {
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'View Document',
              valueclass: '',
              tooltip: 'View Document'
            },
            {
              icon: 'fa fa-fw fa-edit',
              text: '',
              id: 'Edit',
              valueclass: '',
              tooltip: 'Edit',
              disableConditions: {
                key: 'freezed',
                value: true
              }
            },
            {
              icon: 'fa fa-fw fa-trash',
              text: '',
              id: 'Delete',
              valueclass: '',
              tooltip: 'Delete',
              disableConditions: {
                key: 'freezed',
                value: true
              }
            }
          ]
        }
      ]
    };
  }

  getDocuments() {
    this.documents = [];
    this.isDocumentsLoading = true;
    const obj = {
      app: this.deviceType.app,
      device_type: this.deviceType.name
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelDocuments(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.documents = response.data;
        }
        this.isDocumentsLoading = false;
      }
    ));
  }

  openAddDocumentModal(obj = undefined) {
    if (!obj) {
    this.documentObj = {
      metadata: {}
    };
    } else {
      this.documentObj = JSON.parse(JSON.stringify(obj));
    }
    $('#addDocumentModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onTableFunctionCall(obj) {
    if (obj.for === 'Download') {
      this.downloadFile(obj.data.metadata);
    } else if (obj.for === 'Delete') {
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

  downloadFile(fileObj) {
    this.openModal('downloadDocumentModal');
    const url = this.blobStorageURL + fileObj.url + this.sasToken;
    this.subscriptions.push(this.commonService.getFileData(url).subscribe(
      response => {
        this.fileSaverService.save(response, fileObj.name);
        this.closeModal('downloadDocumentModal');
      }
    ));
  }

  sanitizeURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.blobStorageURL + this.selectedDocument.metadata.url + this.sasToken);
  }

  openModal(id) {
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  closeModal(id) {
    console.log('hereeee');
    $('#' + id).modal('hide');
    this.selectedDocument = undefined;
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
    const data = await this.commonService.uploadImageToBlob(files.item(0),
    this.contextApp.app + '/models/' + this.deviceType.name + '/reference-material');
    if (data) {
      this.documentObj.metadata = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  deleteDocument() {
    this.subscriptions.push(this.deviceTypeService.deleteThingsModelDocument
      (this.selectedDocument.id, this.deviceType.app, this.deviceType.name).
      subscribe((response: any) => {
        this.toasterService.showSuccess(response.message, 'Remove Document');
        this.closeModal('confirmMessageModal');
        this.getDocuments();
      }, error => {
        this.toasterService.showError(error.message, 'Remove Document');
        this.closeModal('confirmMessageModal');
      }));
  }

  onDocumentTypeChange() {
    this.documentObj.metadata = undefined;
  }

  onSaveDocumentObj() {
    if (!this.documentObj.name || (this.documentObj.name.trim()).length === 0 || !this.documentObj.type || !this.documentObj.metadata) {
      this.toasterService.showError('Please enter all required fields', ((this.documentObj.id ? 'Edit' : 'Add') + ' Document'));
      return;
    }
    let flag = false;
    this.documents.forEach(doc => {
      if (this.documentObj.name === doc.name && this.documentObj.id !== undefined &&  this.documentObj.id !== doc.id) {
        flag = true;
      }
    });
    if (flag) {
      this.toasterService.showError('Document with same name is already exists', ((this.documentObj.id ? 'Edit' : 'Add') + ' Document'));
      return;
    }
    this.isCreateDocumentLoading = true;
    const method = this.documentObj.id ? this.deviceTypeService.updateThingsModelDocument(this.documentObj, this.deviceType.app,
      this.deviceType.name, this.documentObj.id) : this.deviceTypeService.createThingsModelDocument(this.documentObj,
        this.deviceType.app, this.deviceType.name);
    this.subscriptions.push(method.subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, ((this.documentObj.id ? 'Edit' : 'Add') + ' Document'));
          this.isCreateDocumentLoading = false;
          this.onCloseAddDocModal();
          this.getDocuments();
        }, error => {
          this.toasterService.showError(error.message, ((this.documentObj.id ? 'Edit' : 'Add') + ' Document'));
          this.isCreateDocumentLoading = false;
        }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
