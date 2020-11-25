import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { environment } from './../../../../environments/environment.prod';
import { CONSTANTS } from 'src/app/app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { FileSaverService } from 'ngx-filesaver';
import { DomSanitizer } from '@angular/platform-browser';

declare var $: any;
@Component({
  selector: 'app-device-type-reference-documents',
  templateUrl: './device-type-reference-documents.component.html',
  styleUrls: ['./device-type-reference-documents.component.css']
})
export class DeviceTypeReferenceDocumentsComponent implements OnInit {

  @Input() deviceType: any;
  documents: any[] = [
    {metadata: {url: 'https://storageaccountkemsy96a3.blob.core.windows.net/rdm-images/models/23_Residential 2000 Liters/reference-material/Company Leave policy 2020.pdf', name: 'Company Leave policy 2020.pdf'}, name: 'PDF Doc 1', type: 'PDF'},
    {metadata: {url: 'https://storageaccountkemsy96a3.blob.core.windows.net/rdm-images/models/23_Residential 2000 Liters/reference-material/chrome_awXj87XP7N.png', name: 'chrome_awXj87XP7N.png'}, name: 'Image Doc 1', type: 'Image'},
    {metadata: {url: 'https://storageaccountkemsy96a3.blob.core.windows.net/rdm-images/models/23_Residential 2000 Liters/reference-material/8aPu277x69.mp4', name: '8aPu277x69.mp4'}, name: 'Video Doc 1', type: 'Video'}
  ];
  docTableConfig: any;
  isDocumentsLoading = false;
  documentObj: any;
  isCreateDocumentLoading = false;
  isFileUploading = false;
  sasToken = environment.blobKey;
  selectedDocument: any;

  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private fileSaverService: FileSaverService,
    private sanitizer: DomSanitizer,
    private deviceTypeService: DeviceTypeService
  ) { }

  ngOnInit(): void {
    this.setUpDocumentData();
    this.getDocuments();
  }

  setUpDocumentData() {
    this.docTableConfig = {
      type: 'Documents',
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
              icon: 'fas fa-fw fa-download',
              text: '',
              id: 'Download',
              valueclass: '',
              tooltip: 'Download'
            },
            {
              icon: 'fas fa-fw fa-eye',
              text: '',
              id: 'View Document',
              valueclass: '',
              tooltip: 'View Document'
            },
            {
              icon: 'fas fa-fw fa-trash',
              text: '',
              id: 'Delete',
              valueclass: '',
              tooltip: 'Delete'
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
    this.deviceTypeService.getThingsModelDocuments(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.documents = response.data;
        }
        this.isDocumentsLoading = false;
      }
    );
  }

  openAddDocumentModal() {
    this.documentObj = {
      metadata: {}
    };
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
    }
  }

  downloadFile(fileObj) {
    // const link = document.createElement('a');
    // link.setAttribute('target', '_blank');
    // link.setAttribute('href', fileObj.url + this.sasToken);
    // link.setAttribute('download', fileObj.name);
    // document.body.appendChild(link);
    // link.click();
    // link.remove();
    const url = fileObj.url + this.sasToken;
    this.commonService.getFileData(url).subscribe(
      response => {
        this.fileSaverService.save(response, fileObj.name);
      }
    );
  }

  sanitizeURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedDocument.metadata.url + this.sasToken);
  }

  openModal(id) {
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  closeModal(id) {
    $('#' + id).modal('hide');
    this.selectedDocument = undefined;
  }

  onCloseAddDocModal() {
    this.documentObj = undefined;
    $('#addDocumentModal').modal('hide');
  }

  async onDocumentFileSelected(files: FileList): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'models/' + this.deviceType.id + '_' + this.deviceType.name + '/reference-material');
    if (data) {
      this.documentObj.metadata = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  deleteDocument() {
    this.deviceTypeService.deleteThingsModelDocument(this.selectedDocument.id, this.deviceType.app, this.deviceType.name).
      subscribe((response: any) => {
        this.toasterService.showSuccess(response.message, 'Remove Document');
        this.closeModal('confirmMessageModal');
        this.getDocuments();
      }, error => {
        this.toasterService.showSuccess(error.message, 'Remove Document');
        this.closeModal('confirmMessageModal');
      });
  }

  onSaveDocumentObj() {
    console.log(JSON.stringify(this.documentObj));
    this.isCreateDocumentLoading = true;
    this.deviceTypeService.createThingsModelDocument(this.documentObj,
      this.deviceType.app, this.deviceType.name).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Add Document');
          this.isCreateDocumentLoading = false;
          this.onCloseAddDocModal();
          this.getDocuments();
        }, error => {
          this.toasterService.showSuccess(error.message, 'Add Document');
          this.isCreateDocumentLoading = false;
        }
    );
  }

}
