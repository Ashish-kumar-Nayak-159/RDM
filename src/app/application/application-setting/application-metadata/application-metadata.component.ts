import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ApplicationService } from 'src/app/services/application/application.service';

@Component({
  selector: 'app-application-metadata',
  templateUrl: './application-metadata.component.html',
  styleUrls: ['./application-metadata.component.css']
})
export class ApplicationMetadataComponent implements OnInit, OnDestroy {

  @Input() applicationData: any;
  isFileUploading = false;
  saveMetadataAPILoading = false;
  originalApplicationData: any;
  apiSubscriptions: Subscription[] = [];
  @ViewChild('headerFileInput') headerFileInput: ElementRef;
  @ViewChild('logoFileInput') logoFileInput: ElementRef;
  @ViewChild('iconFileInput') iconFileInput: ElementRef;
  isMetadataEditable = false;
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
  }

  async onHeaderLogoFileSelected(files: FileList): Promise<void> {
    console.log('11111');
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'app-images/header-logo');
    if (data) {
      this.applicationData.metadata.header_logo = data;
      console.log(this.applicationData.metadata);
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  async onLogoFileSelected(files: FileList): Promise<void> {
    console.log('22222222');
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'app-images');
    if (data) {
      this.applicationData.metadata.logo = data;
      console.log(this.applicationData.metadata);
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  async onIconFileSelected(files: FileList): Promise<void> {
    console.log('33333333');
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'app-images');
    if (data) {
      this.applicationData.metadata.icon = data;
      console.log(this.applicationData.metadata);
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  onSaveMetadata() {
    this.saveMetadataAPILoading = true;
    this.applicationData.id = this.applicationData.app;
    this.apiSubscriptions.push(this.applicationService.updateApp(this.applicationData).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Menu Settings');
        this.saveMetadataAPILoading = false;
        this.applicationService.refreshAppData.emit();
        this.commonService.refreshSideMenuData.emit(this.applicationData);
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Menu Settings');
        this.saveMetadataAPILoading = false;
      }
    ));
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
    if (this.headerFileInput) {
      this.headerFileInput.nativeElement.value = '';
    }
    if (this.logoFileInput) {
      this.logoFileInput.nativeElement.value = '';
    }
    if (this.iconFileInput) {
      this.logoFileInput.nativeElement.value = '';
    }
    this.isMetadataEditable = false;
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }

}
