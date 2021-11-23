import { Subscription } from 'rxjs';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { MapsAPILoader } from '@agm/core';
declare var $: any;
@Component({
  selector: 'app-application-metadata',
  templateUrl: './application-metadata.component.html',
  styleUrls: ['./application-metadata.component.css'],
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
  @ViewChild('search') searchElementRef: ElementRef;
  isMetadataEditable = false;
  decodedToken: any;
  changeLocationOption: any;
  latitude: any;
  longitude: any;
  centerLatitude = 23.0225;
  centerLongitude = 72.5714;
  zoom = 8;
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.latitude = this.applicationData.metadata?.latitude;
    this.longitude = this.applicationData.metadata?.longitude;
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
    const data = await this.commonService.uploadImageToBlob(files.item(0), this.applicationData.app + '/app-images');
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
    this.apiSubscriptions.push(
      this.applicationService.updateApp(this.applicationData).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Save Menu Settings');
          this.saveMetadataAPILoading = false;
          this.applicationService.refreshAppData.emit();
          this.commonService.refreshSideMenuData.emit(this.applicationData);
        },
        (error) => {
          this.toasterService.showError(error.message, 'Save Menu Settings');
          this.saveMetadataAPILoading = false;
        }
      )
    );
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

  openModal(id) {
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalClose(id) {
    this.changeLocationOption = undefined;
    $('#' + id).modal('hide');
  }

  public mapReadyHandler(map: google.maps.Map): void {
    map.addListener('click', (e: google.maps.MouseEvent) => {
      this.centerLatitude = e.latLng.lat();
      this.centerLongitude = e.latLng.lng();
      this.latitude = e.latLng.lat();
      this.longitude = e.latLng.lng();
      this.zoom = 12;
    });
  }

  onRadioChange() {
    setTimeout(() => {
      this.mapsAPILoader.load().then(() => {
        const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
          types: ['geocode'],
        });
        autocomplete.addListener('place_changed', () => {
          this.ngZone.run(() => {
            const place: google.maps.places.PlaceResult = autocomplete.getPlace();
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }
            this.zoom = 12;
            this.centerLatitude = place.geometry.location.lat();
            this.centerLongitude = place.geometry.location.lng();
            this.latitude = place.geometry.location.lat();
            this.longitude = place.geometry.location.lng();
          });
        });
      });
    }, 500);
  }

  setDefaultLocation() {
    if(!this.latitude || !this.longitude){
      this.toasterService.showError("Select proper location", 'Save Menu Settings');
      return;
    }
    this.applicationData.metadata['latitude'] = this.latitude;
    this.applicationData.metadata['longitude'] = this.longitude;
    this.onModalClose('changeLocationModal');
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
