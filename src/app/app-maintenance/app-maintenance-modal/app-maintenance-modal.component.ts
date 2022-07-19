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

  async uploadFile():Promise<any> {
    this.isFileUploading = true;
    // let uploadedFiles = [];
    return await Promise.all(this.uploadedFile.map(async (file) => {
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
        this.uploadedFileDetails.push(eachOne)
      }
      else {
        this.toasterService.showError('Error in uploading file', 'Upload file');
      }

    })).then(()=>{
      this.uploadedFile = []
    })
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
      this.uploadedFileDetails = [];
    },(err)=>{
      this.uploadedFileDetails = []
    })

    this.fileName = 'Choose File'
    this.formReset();
    this.modalEmit.emit()
    this.uploadedFile = []
  }

  onFileSelected(event,i:number) {
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
        // if (allowedZipMagicNumbers.includes(header)) {  //[0,1,2]
          
          // this.uploadedFile[i].fileName = fileList?.item(0).name;
          let control = (this.formData.get('files') as FormArray).controls[i].get('filetype'); 
           this.storefileType = (this.formData.get('files') as FormArray).controls[i].get('filetype').value; 
           this.uploadedFile.splice(i, 1,{
             'index': i,
             'file': fileList?.item(0),
             'fileName': file.name,
             'filetype': control.value
           })
          // this.uploadedFile.push({ 'index' : i, 'file': fileList?.item(0),'fileName' :file.name , 'filetype': control.value})
          // this.uploadedFile.push({'file':fileList?.item(0)})
          this.isCanUploadFile = true;
          // this.fileName = file.name;
       
      
        return;
      }
      filereader.readAsArrayBuffer(file);
    }
  }

  addDocument() {
    let msg = '';
    const control = this.formData.get('files');
    control.controls.forEach((formGroup)=>{
        if(! formGroup.get('filetype').value || ! formGroup.get('uploadedFile').value){
          msg = 'Please select file.';
        }
    })

    if(msg){
      this.toasterService.showError('Please select file',' Add Acknowledge')
      return;
    }

    let newFormObj = new FormGroup({
      filetype: new FormControl("", Validators.required),
      uploadedFile: new FormControl('', Validators.required)
    });
    control.push(newFormObj);
  
  }

  deleteFormGroup(index:number){
    this.formData.get('files').removeAt(index)
    this.uploadedFile.splice(index,1)
    this.uploadedFile.forEach((file,index)=>{
         file.index = index
    })
  }

}
