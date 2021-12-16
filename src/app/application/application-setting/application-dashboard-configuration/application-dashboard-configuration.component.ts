import { CommonService } from './../../../services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { ApplicationService } from 'src/app/services/application/application.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';

@Component({
  selector: 'app-application-dashboard-configuration',
  templateUrl: './application-dashboard-configuration.component.html',
  styleUrls: ['./application-dashboard-configuration.component.css'],
})
export class ApplicationDashboardConfigurationComponent implements OnInit {
  @Input() applicationData: any;
  isConfigEditable = false;
  saveConfigAPILoading = false;
  originalApplicationData: any;
  apiSubscriptions: Subscription[] = [];
  decodedToken: any;
  isFileUploading = false;
  widgetStringFromMenu: any;
  uploadedFiles: any = {};
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
    if (!this.applicationData.dashboard_config) {
      this.applicationData.dashboard_config = {};
      this.applicationData.dashboard_config.show_historical_widgets = false;
      this.applicationData.dashboard_config.show_live_widgets = true;
      this.applicationData.dashboard_config.map_icons = {};
    }
    if (!this.applicationData.dashboard_config.map_icons) {
      this.applicationData.dashboard_config.map_icons = {};
    }
  }

  toggleHistoryCheckbox() {
    this.applicationData.dashboard_config.show_historical_widgets =
      !this.applicationData.dashboard_config.show_historical_widgets;
    if (this.applicationData.dashboard_config.show_historical_widgets) {
      this.applicationData.dashboard_config.show_live_widgets = false;
    }
  }

  toggleLiveCheckbox() {
    this.applicationData.dashboard_config.show_live_widgets = !this.applicationData.dashboard_config.show_live_widgets;
    if (this.applicationData.dashboard_config.show_live_widgets) {
      this.applicationData.dashboard_config.show_historical_widgets = false;
    }
  }

  onMapIconFileSelected(files: FileList, assetType, iconType) {
    if (!this.applicationData.dashboard_config.map_icons[assetType]) {
      this.applicationData.dashboard_config.map_icons[assetType] = {};
    }
    if (!this.uploadedFiles[assetType]) this.uploadedFiles[assetType] = {}
    this.uploadedFiles[assetType][iconType] = files.item(0)
    this.applicationData.dashboard_config.map_icons[assetType][iconType] = files.item(0)
  }

  async uploadFile() {
    this.isFileUploading = true;
    const assetTypes = Object.keys(this.uploadedFiles);
    await Promise.all(assetTypes.map(async (assetType) => {
      const iconTypes = Object.keys(this.applicationData.dashboard_config.map_icons[assetType]);
      await Promise.all(iconTypes.map(async(iconType) => {
        const data = await this.commonService.uploadImageToBlob(this.applicationData.dashboard_config.map_icons[assetType][iconType], this.applicationData.app + '/app-images');
        if (data) {
          this.applicationData.dashboard_config.map_icons[assetType][iconType] = data;
        } else {
          this.toasterService.showError('Error in uploading file', 'Upload file');
        }
      }))
    }))
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  async onSaveMetadata() {
    await this.uploadFile();
    if (
      !this.applicationData.dashboard_config ||
      (!this.applicationData.dashboard_config.show_live_widgets &&
        !this.applicationData.dashboard_config.show_historical_widgets)
    ) {
      this.toasterService.showError('Please select one type of dashboard', 'Save Dashboard Configuration');
      return;
    }
    this.saveConfigAPILoading = true;
    this.applicationData.id = this.applicationData.app;
    this.apiSubscriptions.push(
      this.applicationService.updateApp(this.applicationData).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Save Dashboard Configuration');
          this.saveConfigAPILoading = false;
          this.applicationService.refreshAppData.emit();
          // this.commonService.refreshSideMenuData.emit(this.applicationData);
        },
        (error) => {
          this.toasterService.showError(error.message, 'Save Dashboard Configuration');
          this.saveConfigAPILoading = false;
        }
      )
    );
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
    this.isConfigEditable = false;
  }
}
