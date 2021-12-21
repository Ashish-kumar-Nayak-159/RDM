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
  latitude= 23.0225;
  longitude= 72.5714;
  centerLatitude = 23.0225;
  centerLongitude = 72.5714;
  zoom = 8;
  uploadedLogoFile: any;
  uploadedIconFile: any;
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.latitude = this.applicationData.metadata?.latitude || this.latitude;
    this.longitude = this.applicationData.metadata?.longitude || this.longitude;
  }


  async uploadFile(file,type){
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(file, this.applicationData.app + '/app-images');
    if (data) {
      if(type=="header_logo"){
        this.applicationData.metadata.header_logo = data;
      }
      if(type == "icon"){
        this.applicationData.metadata.icon = data;
      }
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

  onFileSelected(files: FileList, type){
    if (type === "header_logo") {
      this.uploadedLogoFile = files.item(0);
      if (!this.applicationData.metadata.header_logo) {
        this.applicationData.metadata.header_logo = {};
      }
      // this.applicationData.metadata.header_logo.name = this.uploadedLogoFile.name;
      if (this.uploadedLogoFile.size > CONSTANTS.APP_LOGO_SIZE){
        this.toasterService.showError('File size exceeded' + " " + CONSTANTS.APP_LOGO_SIZE / 1000000 + " " + 'MB', 'Upload file');
      }
      else {
        const image = new Image();
        image.src = URL.createObjectURL(this.uploadedLogoFile);
        image.onload = (e: any) => {
          const selectedImage = e.path[0] as HTMLImageElement;
          if (selectedImage.width <= CONSTANTS.APP_LOGO_WIDTH && selectedImage.height <= CONSTANTS.APP_LOGO_HEIGHT){
            this.applicationData.metadata.header_logo.name = this.uploadedLogoFile.name;
          } else {
            this.toasterService.showError('Image size exceeded' + " " + CONSTANTS.APP_LOGO_WIDTH + " " + 'x' + " " + CONSTANTS.APP_LOGO_HEIGHT + " " + 'px', 'Upload file');
          }
        };
      }
    }
    if (type === "icon") {
      this.uploadedIconFile = files.item(0);
      if (!this.applicationData.metadata.icon) {
        this.applicationData.metadata.icon = {};
      }
      // this.applicationData.metadata.icon.name = this.uploadedIconFile.name;
      if (this.uploadedIconFile.size > CONSTANTS.APP_ICON_SIZE){
        this.toasterService.showError('File size exceeded' + " " + CONSTANTS.APP_ICON_SIZE / 1000000 + " " + 'MB', 'Upload file');
      }
      else {
        const image = new Image();
        image.src = URL.createObjectURL(this.uploadedIconFile);
        image.onload = (e: any) => {
          const selectedImage = e.path[0] as HTMLImageElement;
          if (selectedImage.width <= CONSTANTS.APP_ICON_WIDTH && selectedImage.height <= CONSTANTS.APP_ICON_HEIGHT){
            this.applicationData.metadata.icon.name = this.uploadedIconFile.name;
          } else {
            this.toasterService.showError('Image size exceeded' + " " +  CONSTANTS.APP_ICON_WIDTH  + " " + 'x' + " " + CONSTANTS.APP_ICON_HEIGHT  + " " +  'px', 'Upload file');
          }
        };
      }
    }
  }

  async onSaveMetadata() {
    if(this.uploadedLogoFile){
      await this.uploadFile(this.uploadedLogoFile,"header_logo");
    }
    if(this.uploadedIconFile){
      await this.uploadFile(this.uploadedIconFile,"icon");
    }

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
    //get user's location on map open
    navigator.geolocation.getCurrentPosition(this.showPosition)
    map.addListener('click', (e: google.maps.MouseEvent) => {
      this.centerLatitude = e.latLng.lat();
      this.centerLongitude = e.latLng.lng();
      this.latitude = e.latLng.lat();
      this.longitude = e.latLng.lng();
      this.zoom = 12;
    });
  }

  showPosition = (position)=> {
    console.log('in show position');
    
    this.latitude =  position?.coords?.latitude || this.latitude;  
    this.longitude = position.coords.longitude || this.longitude;
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
            console.log('place ',place);
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
    if((this.latitude && !this.longitude) || (!this.latitude && this.longitude)){
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
