import { filter } from 'rxjs/operators';
import { CONSTANTS } from './../../app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from 'src/app/services/application/application.service';

@Component({
  selector: 'app-application-setting',
  templateUrl: './application-setting.component.html',
  styleUrls: ['./application-setting.component.css']
})
export class ApplicationSettingComponent implements OnInit {

  applicationData: any;
  activeTab: string;
  contextApp: any;
  userData: any;
  isApplicationDataLoading = false;
  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.route.paramMap.subscribe(params => {
      this.commonService.breadcrumbEvent.emit({
        type: 'replace',
        data: [
          {
            title: this.contextApp.user.hierarchyString,
            url: 'applications/' + this.contextApp.app
          }
        ]
      });
    });
    this.route.fragment.subscribe(
      fragment => {
        if (fragment) {
          this.activeTab = fragment;
        } else {
          this.activeTab = 'meta-data';
        }
      }
    );

    this.applicationService.refreshAppData.subscribe(() => {
      this.getApplicationData();
    });
  }

  getApplicationData() {
    this.isApplicationDataLoading = true;
    this.applicationData = undefined;
    this.applicationService.getApplicationDetail(this.contextApp.app).subscribe(
      (response: any) => {
          this.applicationData = response;
          this.applicationData.user = this.contextApp.user;
          this.applicationData.app = this.contextApp.app;
          this.contextApp = JSON.parse(JSON.stringify(this.applicationData));
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.contextApp);
          this.isApplicationDataLoading = false;
          // const index = this.userData.apps.findIndex(app => app.app === this.applicationData.app);
          // const obj = JSON.parse(JSON.stringify(this.applicationData));
          // obj.user = this.userData.apps[index].user;
          // this.userData.apps.splice(index, 1);
          // this.userData.apps.splice(index, 0, obj);
          // this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, this.userData);

      }, error => this.isApplicationDataLoading = false
    );
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    window.location.hash = tab;
  }
}
