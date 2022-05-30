import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { MaintenanceService } from 'src/app/services/maintenance/maintenance.service';

@Component({
  selector: 'app-app-maintenance-modal',
  templateUrl: './app-maintenance-modal.component.html',
  styleUrls: ['./app-maintenance-modal.component.css']
})
export class AppMaintenanceModalComponent implements OnInit, OnChanges {

  @Input() assetId;
  @Input() maintenanceRegistryId;
  @Input() maintenanceNotificationId;
  @Output() modalEmit = new EventEmitter();
  isCanUploadFile: boolean = false;
  uploadedFile: any = [];
  fileName: string = 'Choose File';
  isFileUploading = false;
  filetype: string;
  formData;
  payload: any;
  contextApp: any = {}
  uploadedFileDetails: any = [];
  constructor(private toasterService: ToasterService, private commonService: CommonService, private maintenanceService: MaintenanceService) { }

  ngOnInit(): void {
    this.formReset()
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);

  }


  ngOnChanges(changes: SimpleChanges): void {
    // console.log("assetId",this.assetId)
    // console.log("maintenanceRegisterID",this.maintenanceRegistryId)
  }

  formReset() {
    this.formData = new FormGroup({
      description: new FormControl('', Validators.required),
      files: new FormArray([
        new FormGroup({
          filetype: new FormControl(undefined, Validators.required),
          uploadedFile: new FormControl('', Validators.required)
        })
      ])
    })
  }

  onClose() {
    this.fileName = ''
    this.fileName = 'Choose File'
    this.formReset();
    this.modalEmit.emit(false)
    this.uploadedFile = [];
  }

  async uploadFile() {
    this.isFileUploading = true;

    await Promise.all(this.uploadedFile.map(async (file) => {
      const data = await this.commonService.uploadImageToBlob(
        file.file,
        this.contextApp.app + '/assets/' + this.assetId + '/maintenance/' + this.maintenanceRegistryId
      );
      if (data) {
        console.log("data upload file", data)
        var eachOne = {
          document_name: data.name,
          document_file_url: data.url,
          document_type:''
        }
        this.uploadedFileDetails.push(data)
      }
      else {
        this.toasterService.showError('Error in uploading file', 'Upload file');
      }

    }))
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  async onSave() {
    debugger
    console.log("formData",this.formData.value)
    await this.uploadFile()
    console.log("uploaded file",this.uploadedFileDetails)
    this.payload = {
      "maintenance_notification_id": this.maintenanceNotificationId,
      "maintenance_registry_id": this.maintenanceRegistryId,
      "acknowledgement_message": this.formData.value.description,
      "maintenance_notification_acknowledge_files": [
        {
          "document_type": this.formData.value.filetype,
          "document_name": this.uploadedFileDetails.name,
          "document_file_url": this.uploadedFileDetails.url
        }
      ]
    }
    console.log("payload", this.payload)
    this.maintenanceService.createAckMaintenance(this.payload).subscribe((response) => {
      console.log("ack-API-RESPONSE", response)
      this.toasterService.showSuccess('Maintenance notification acknowledgement created successfully', 'Maintenance')
    })
    this.formData.reset();
    this.fileName = ''
    this.fileName = 'Choose File'
    this.modalEmit.emit(false)
  }

  onFileSelected(event,i) {
    this.isCanUploadFile = false;
    let allowedZipMagicNumbers = ["504b34", "d0cf11e0", "89504e47", "25504446"];    
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
          debugger
          // this.uploadedFile.splice(0, 1, {
          //   'file': fileList?.item(0),
          //   'index': 0
          // })
          // this.uploadedFile = file;
          this.uploadedFile.push({ 'index' : i, 'file': fileList?.item(0),'fileName' :file.name  })
          // console.log("uploaded file",this.uploadedFile)
          this.isCanUploadFile = true;
          //this.fileName = file.name;
        }
        else {
          debugger
          this.toasterService.showError('Only .xls or .xlsx files are allowed', 'Select File');
          //this.fileName = 'Choose File';
        }
        return;
      }
      filereader.readAsArrayBuffer(file);
    }
  }

  addDocument() {
    const control = this.formData.get('files');
    let newFormObj = new FormGroup({
      filetype: new FormControl(undefined, Validators.required),
      uploadedFile: new FormControl('', Validators.required)
    });
    control.push(newFormObj);
  }

}
