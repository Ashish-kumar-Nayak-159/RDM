import { CommonService } from './../../../services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { ApplicationService } from 'src/app/services/application/application.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';

@Component({
  selector: 'app-application-dashboard-configuration',
  templateUrl: './application-dashboard-configuration.component.html',
  styleUrls: ['./application-dashboard-configuration.component.css']
})
export class ApplicationDashboardConfigurationComponent implements OnInit {

  @Input() applicationData: any;
  isConfigEditable = false;
  saveConfigAPILoading  = false;
  originalApplicationData: any;
  apiSubscriptions: Subscription[] = [];
  decodedToken: any;
  constructor(
    private assetService: AssetService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
    if (!this.applicationData.dashboard_config) {
      this.applicationData.dashboard_config = {};
      this.applicationData.dashboard_config.show_historical_widgets = false;
      this.applicationData.dashboard_config.show_live_widgets = true;
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
    this.applicationData.dashboard_config.show_live_widgets =
    !this.applicationData.dashboard_config.show_live_widgets;
    if (this.applicationData.dashboard_config.show_live_widgets) {
      this.applicationData.dashboard_config.show_historical_widgets = false;
    }
  }

  onSaveMetadata() {
    this.saveConfigAPILoading = true;
    this.applicationData.id = this.applicationData.app;
    this.apiSubscriptions.push(this.applicationService.updateApp(this.applicationData).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Dashboard Configuration');
        this.saveConfigAPILoading = false;
        this.applicationService.refreshAppData.emit();
        // this.commonService.refreshSideMenuData.emit(this.applicationData);
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Dashboard Configuration');
        this.saveConfigAPILoading = false;
      }
    ));
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
    this.isConfigEditable = false;
  }

}
