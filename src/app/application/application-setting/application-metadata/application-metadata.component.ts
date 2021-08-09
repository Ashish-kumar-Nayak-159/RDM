import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/app.constants';

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
  decodedToken: any;
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
  }

  async onHeaderLogoFileSelected(files: FileList): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), this.applicationData.app + '/app-images');
    if (data) {
      this.applicationData.metadata.header_logo = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  // async onLogoFileSelected(files: FileList): Promise<void> {
  //   this.isFileUploading = true;
  //   const data = await this.commonService.uploadImageToBlob(files.item(0), 'app-images');
  //   if (data) {
  //     this.applicationData.metadata.logo = data;
  //   } else {
  //     this.toasterService.showError('Error in uploading file', 'Upload file');
  //   }
  //   this.isFileUploading = false;
  //   // this.blobState.uploadItems(files);
  // }

  async onIconFileSelected(files: FileList): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), this.applicationData.app + '/app-images'  );
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
