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
  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.getApplicationData();
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
    })
  }

  getApplicationData() {
    this.applicationData = undefined;
    this.applicationService.getApplications({
      app: this.appName
    }).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.applicationData = response.data[0];
        }
      }
    );
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    window.location.hash = tab;
  }
}
