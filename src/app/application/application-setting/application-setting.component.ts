import { filter } from 'rxjs/operators';
import { CONSTANTS } from './../../app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from 'src/app/services/application/application.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-application-setting',
  templateUrl: './application-setting.component.html',
  styleUrls: ['./application-setting.component.css']
})
export class ApplicationSettingComponent implements OnInit, OnDestroy {

  applicationData: any;
  activeTab: string;
  contextApp: any;
  userData: any;
  isApplicationDataLoading = false;
  apiSubscriptions: Subscription[] = [];
  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getApplicationData();
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

    this.apiSubscriptions.push(this.applicationService.refreshAppData.subscribe(() => {
      this.getApplicationData();
    }));
  }

  getApplicationData() {
    this.isApplicationDataLoading = true;
    this.applicationData = undefined;
    this.apiSubscriptions.push(this.applicationService.getApplicationDetail(this.contextApp.app).subscribe(
      (response: any) => {
          this.applicationData = response;
          this.applicationData.user = this.contextApp.user;
          this.applicationData.app = this.contextApp.app;
          this.commonService.refreshSideMenuData.emit(this.applicationData);
          this.contextApp = JSON.parse(JSON.stringify(this.applicationData));
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.contextApp);
          this.isApplicationDataLoading = false;
      }, error => this.isApplicationDataLoading = false
    ));
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    window.location.hash = tab;
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
