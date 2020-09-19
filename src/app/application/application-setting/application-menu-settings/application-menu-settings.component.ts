import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { Component, Input, OnInit } from '@angular/core';
import { ToasterService } from 'src/app/services/toaster.service';
import { ApplicationService } from 'src/app/services/application/application.service';

@Component({
  selector: 'app-application-menu-settings',
  templateUrl: './application-menu-settings.component.html',
  styleUrls: ['./application-menu-settings.component.css']
})
export class ApplicationMenuSettingsComponent implements OnInit {

  @Input() applicationData: any;
  saveMenuSettingAPILoading = false;
  originalApplicationData: any;
  constructor(
    private toasterService: ToasterService,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    if (this.applicationData.configuration && this.applicationData.configuration.length === 0) {
      this.applicationData.configuration = CONSTANTS.SIDE_MENU_LIST;
    }
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));

  }

  onSaveMenuSettings() {
    this.saveMenuSettingAPILoading = true;
    this.applicationData.id = this.applicationData.app;
    this.applicationService.updateApp(this.applicationData).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Menu Settings');
        this.saveMenuSettingAPILoading = false;
        this.applicationService.refreshAppData.emit();
        this.commonService.refreshSideMenuData.emit(this.applicationData);
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Menu Settings');
        this.saveMenuSettingAPILoading = false;
      }
    );
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
  }


}
