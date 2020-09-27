import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ApplicationService } from 'src/app/services/application/application.service';

@Component({
  selector: 'app-application-metadata',
  templateUrl: './application-metadata.component.html',
  styleUrls: ['./application-metadata.component.css']
})
export class ApplicationMetadataComponent implements OnInit {

  @Input() applicationData: any;
  isFileUploading = false;
  saveMetadataAPILoading = false;
  originalApplicationData: any;
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
  }

  async onHeaderLogoFileSelected(files: FileList): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'app-images');
    if (data) {
      this.applicationData.metadata.header_logo = data;
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
      this.applicationData.metadata.logo = data;
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
      this.applicationData.metadata.icon = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  onSaveMetadata() {
    this.saveMetadataAPILoading = true;
    this.applicationData.id = this.applicationData.app;
    console.log(this.applicationData);
    this.applicationService.updateApp(this.applicationData).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Menu Settings');
        this.saveMetadataAPILoading = false;
        this.applicationService.refreshAppData.emit();
        this.commonService.refreshSideMenuData.emit(this.applicationData);
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Menu Settings');
        this.saveMetadataAPILoading = false;
      }
    );
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
  }

}
