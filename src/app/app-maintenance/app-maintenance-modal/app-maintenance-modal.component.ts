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
  formData;
  payload: any;
  contextApp: any = {}
  uploadedFileDetails: any = [];
  storefileType:string;

  constructor(private toasterService: ToasterService, private commonService: CommonService, private maintenanceService: MaintenanceService) { }

  ngOnInit(): void {
    this.formReset()
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);

  }


  ngOnChanges(changes: SimpleChanges): void {
   
  }

  formReset() {
    this.formData = new FormGroup({
      description: new FormControl('',Validators.required),
      files: new FormArray([
        new FormGroup({
          filetype: new FormControl("",Validators.required),
          uploadedFile: new FormControl("",Validators.required)
        })
      ])
    
    })

  }

  onClose() {
    this.fileName = 'Choose File'
    this.formReset();
    this.modalEmit.emit()
    this.uploadedFile = [];
  }

  async uploadFile() {
    this.isFileUploading = true;
    // let uploadedFiles = [];
    await Promise.all(this.uploadedFile.map(async (file) => {
      const data = await this.commonService.uploadImageToBlob(
        file.file,
        this.contextApp.app + '/assets/' + this.assetId + '/maintenance/' + this.maintenanceRegistryId
      );

      if (data) {
        var eachOne = {
          document_name: data.name,
          document_file_url: data.url,
          document_type: file.filetype
        }
        console.log("eachone",eachOne)
        this.uploadedFileDetails.push(eachOne)
        console.log("uploadedFile",this.uploadedFileDetails)
       
      }
      else {
        this.toasterService.showError('Error in uploading file', 'Upload file');
      }

    }))
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  async onSave() {
    await this.uploadFile()
    this.payload = {
      "maintenance_notification_id": this.maintenanceNotificationId,
      "maintenance_registry_id": this.maintenanceRegistryId,
      "acknowledgement_message": this.formData.value.description,
      "maintenance_notification_acknowledge_files": this.uploadedFileDetails
    }
    this.maintenanceService.createAckMaintenance(this.payload).subscribe((response) => {
      this.toasterService.showSuccess('Maintenance notification acknowledgement created successfully', 'Maintenance')
    })
    this.formData.reset();
    this.fileName = ''
    this.fileName = 'Choose File'
    this.modalEmit.emit(false)
  }

  onFileSelected(event,i:number) {
    debugger
    this.isCanUploadFile = false;
    let allowedZipMagicNumbers = ["504b34", "d0cf11e0", "89504e47", "25504446","00020"];    
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
          // this.uploadedFile.splice(0, 1, {
          //   'file': fileList?.item(0),
          //   'index': 0
          // })
          // this.uploadedFile = file;
          let control = (this.formData.get('files') as FormArray).controls[i].get('filetype'); 
           this.storefileType = (this.formData.get('files') as FormArray).controls[i].get('filetype').value; 
          this.uploadedFile.push({ 'index' : i, 'file': fileList?.item(0),'fileName' :file.name , 'filetype': control.value})
          // this.uploadedFile.push({'file':fileList?.item(0)})
          this.isCanUploadFile = true;
          // this.fileName = file.name;
        }
        else {
          this.toasterService.showError('Only Image, Video & PDF files are allowed', 'Select File');
          // this.fileName = 'Choose File';
        }
        return;
      }
      filereader.readAsArrayBuffer(file);
    }
  }

  addDocument() {
    const control = this.formData.get('files');
    console.log("control",control)
    control.controls.forEach((formGroup)=>{
        if(! formGroup.get('filetype').value || ! formGroup.get('uploadedFile').value){
          this.toasterService.showError('Please select file',' Add Acknowledge')
        }
        else{
          let newFormObj = new FormGroup({
            filetype: new FormControl("", Validators.required),
            uploadedFile: new FormControl('', Validators.required)
          });
          control.push(newFormObj);
        }
    })
  
  }

}
