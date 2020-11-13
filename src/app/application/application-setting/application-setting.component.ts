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

  appName: string;
  applicationData: any;
  activeTab: string;
  contextApp: any;
  userData: any;
  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.contextApp = this.userData.apps.filter(app => app.app === this.appName)[0];
      this.getApplicationData();
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
    this.applicationData = undefined;
    this.applicationService.getApplicationDetail(this.appName).subscribe(
      (response: any) => {
          this.applicationData = response;
          this.applicationData.app = this.appName;
          const index = this.userData.apps.findIndex(app => app.app === this.applicationData.app);
          const obj = JSON.parse(JSON.stringify(this.applicationData));
          obj.user = this.userData.apps[index].user;
          this.userData.apps.splice(index, 1);
          this.userData.apps.splice(index, 0, obj);
          this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, this.userData);

      }
    );
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    window.location.hash = tab;
  }
}
