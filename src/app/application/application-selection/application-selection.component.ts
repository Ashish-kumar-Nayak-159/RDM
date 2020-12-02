import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application-selection',
  templateUrl: './application-selection.component.html',
  styleUrls: ['./application-selection.component.css']
})
export class ApplicationSelectionComponent implements OnInit {

  userData: any;
  constantData = CONSTANTS;
  blobToken = environment.blobKey;
  applicationData: any;
  constructor(
    private commonService: CommonService,
    private router: Router,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
  }

  async redirectToApp(app) {
    await this.getApplicationData(app);
    this.commonService.refreshSideMenuData.emit(this.applicationData);
    const menu = this.applicationData.configuration.main_menu.length > 0 ?
    this.applicationData.configuration.main_menu : CONSTANTS.SIDE_MENU_LIST;
    let i = 0;
    menu.forEach(menuObj => {
      if ( i === 0 && menuObj.visible) {
        i++;
        const url = menuObj.url;
        if (menuObj.url?.includes(':appName')) {
          menuObj.url = menuObj.url.replace(':appName', this.applicationData.app);
          this.router.navigateByUrl(menuObj.url);
        }
      }
    });
  }

  getApplicationData(app) {
    return new Promise((resolve) => {
    this.applicationData = undefined;
    this.applicationService.getApplicationDetail(app.app).subscribe(
      (response: any) => {
          this.applicationData = response;
          this.applicationData.app = app.app;
          this.applicationData.user = app.user;
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.applicationData);
          resolve();
      });
    });
  }
}
