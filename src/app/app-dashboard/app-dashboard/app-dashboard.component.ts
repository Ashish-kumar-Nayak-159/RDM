import { ApplicationService } from 'src/app/services/application/application.service';
import { Component, OnInit, OnDestroy, AfterViewInit, EmbeddedViewRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';


@Component({
  selector: 'app-app-dashboard',
  templateUrl: './app-dashboard.component.html',
  styleUrls: ['./app-dashboard.component.css']
})
export class AppDashboardComponent implements OnInit {

  appName: string;
  userData: any;
  contextApp: any;
  applicationData: any;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private applicationService: ApplicationService
  ) {
  }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(async params => {
      this.appName = params.get('applicationId');
      this.applicationData = this.userData.apps.filter(
        app => app.app === params.get('applicationId')
      )[0];
      await this.getApplicationData();
      this.commonService.breadcrumbEvent.emit({
        type: 'replace',
        data: [
          {
            title: this.contextApp.user.hierarchyString,
            url: 'applications/' + this.appName
          }
        ]
      });
    });
  }

  getApplicationData() {
    return new Promise((resolve) => {
      this.applicationService.getApplicationDetail(this.appName).subscribe(
        (response: any) => {
            this.contextApp = response;
            this.contextApp.user = this.applicationData.user;
            resolve();
        });
    });
  }


}
