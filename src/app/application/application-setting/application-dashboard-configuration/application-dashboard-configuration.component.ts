import { ToasterService } from 'src/app/services/toaster.service';
import { ApplicationService } from 'src/app/services/application/application.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

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
  constructor(
    private assetService: AssetService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
    if (!this.applicationData.metadata?.dashboard_config) {
      this.applicationData.metadata.dashboard_config = {};
      this.applicationData.metadata.dashboard_config.show_historical_widgets = false;
      this.applicationData.metadata.dashboard_config.show_live_widgets = true;
    }
  }

  toggleHistoryCheckbox() {
    this.applicationData.metadata.dashboard_config.show_historical_widgets =
    !this.applicationData.metadata.dashboard_config.show_historical_widgets;
    if (this.applicationData.metadata.dashboard_config.show_historical_widgets) {
      this.applicationData.metadata.dashboard_config.show_live_widgets = false;
    }
  }

  toggleLiveCheckbox() {
    this.applicationData.metadata.dashboard_config.show_live_widgets =
    !this.applicationData.metadata.dashboard_config.show_live_widgets;
    if (this.applicationData.metadata.dashboard_config.show_live_widgets) {
      this.applicationData.metadata.dashboard_config.show_historical_widgets = false;
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
