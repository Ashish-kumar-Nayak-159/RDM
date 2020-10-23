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
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
  ) {
  }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.contextApp = this.userData.apps.filter(
        app => app.app === params.get('applicationId')
      )[0];
    });
    this.commonService.breadcrumbEvent.emit({
      type: 'replace',
      data: [
        {
          title: this.contextApp.user.hierarchyString,
          url: 'applications/' + this.appName
        }
      ]
    });

  }


}
