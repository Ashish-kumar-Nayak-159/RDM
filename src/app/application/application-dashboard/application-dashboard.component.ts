import { Component, OnInit, ElementRef, ViewChildren, OnDestroy, AfterViewInit } from '@angular/core';
import { ApplicationService } from './../../services/application/application.service';
import { ApplicationDashboardSnapshot, Alert, Event, Notification } from 'src/app/models/applicationDashboard.model';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from './../../app.constants';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-application-dashboard',
  templateUrl: './application-dashboard.component.html',
  styleUrls: ['./application-dashboard.component.css']
})
export class ApplicationDashboardComponent implements OnInit, OnDestroy {

  @ViewChildren('c2dChart') c2dChart: ElementRef;
  @ViewChildren('d2cChart') d2cChart: ElementRef;
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false
  };
  public barChartLabels = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  public barChartType = 'bar';
  public barChartLegend = false;
  public barChartData = [
    {
      data: [65, 59, 32, 81, 56, 55, 30],
      label: 'D2C Messages',
      backgroundColor: '#505c80',
      hoverBackgroundColor: '#809eb9',
      hoverBorderColor: '#505c80',
      hoverBorderWidth: 2,
    }
  ];
  public barChartData1 = [
    {
      data: [15, 29, 10, 41, 72, 15, 30],
      label: 'C2D Messages',
      backgroundColor: '#505c80',
      hoverBackgroundColor: '#809eb9',
      hoverBorderColor: '#505c80',
    }
  ];
  dashboardSnapshot: ApplicationDashboardSnapshot; // to store application dashboard snapshot
  isDashboardSnapshotLoading = false; // flag to identify dashboard snapshot API call is completed or not
  noOfRecordsToDisplay = 5; // for alerts, notifications and events
  lastGeneratedAlerts: Alert[] = []; // last generated alerts for application
  isLastAlertDataLoading = false; // flag to identify last {noOfRecordsToDisplay} alerts API call is completed or not
  lastGeneratedEvents: Event[] = []; // last generated events for application
  isLastEventDataLoading = false; // flag to identify last {noOfRecordsToDisplay} events API call is completed or not
  lastGeneratedNotifications: Notification[] = []; // last generated notifications for application
  isLastNotificationDataLoading = false; // flag to identify last {noOfRecordsToDisplay} notifications API call is completed or not
  apiSubscriptions: Subscription[] = []; // to store all the API subscriptions
  userData: any;
  blobToken = environment.blobKey;
  contextApp: any;
  constantData = CONSTANTS;
  tileName: string;
  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.route.paramMap.subscribe(async params => {
      console.log(this.contextApp);
      this.tileName = this.getTileName('IoT Gateways');
      if (this.contextApp && this.contextApp.metadata && !this.contextApp.metadata.logo) {
        this.contextApp.metadata.logo = {
          url : CONSTANTS.DEFAULT_APP_LOGO
        };
      }
      if (this.contextApp && this.contextApp.metadata && !this.contextApp.metadata.icon) {
        this.contextApp.metadata.icon = {
          url : CONSTANTS.DEFAULT_APP_ICON
        };
      }
      this.commonService.breadcrumbEvent.emit({
        type: 'replace',
        data: [
          {
            title: this.contextApp.user.hierarchyString,
            url: 'applications/' + this.contextApp.app
          }
        ]
      });
      console.log(this.contextApp);
      this.getDashboardSnapshot();
      this.getLastNotificationData();
      this.getLastAlertData();
      this.getLastEventData();
    });

  }


  getTileName(type) {
    let name;
    this.contextApp.configuration.main_menu.forEach(item => {
      console.log((item.system_name === type));
      if (item.system_name === type) {
        name = item.display_name;
      }
    });
    console.log(name);
    return name;
  }

  /**
   * It will call the application dashboard snapshot API
   */
  getDashboardSnapshot() {
    console.log(this.contextApp);
    this.isDashboardSnapshotLoading = true;
    const obj = {
      app: this.contextApp.app,
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy)
    };
    this.apiSubscriptions.push(this.applicationService.getApplicationDashboardSnapshot(obj, obj.app)
    .subscribe(
      (response: ApplicationDashboardSnapshot) => {
        this.dashboardSnapshot = response;
        this.isDashboardSnapshotLoading = false;
      }, error => {
        this.isDashboardSnapshotLoading = false;
      }
    ));
  }

  /**
   * It will call the last generated alerts with limit set as 5.
   */
  getLastAlertData() {
    this.isLastAlertDataLoading = true;
    const obj = {
      app: this.contextApp.app,
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
      count: this.noOfRecordsToDisplay
    };
    this.apiSubscriptions.push(this.applicationService.getLastAlerts(obj)
    .subscribe(
      (response: any) => {
        if (response.data) {
          this.lastGeneratedAlerts = response.data;
          this.lastGeneratedAlerts.forEach(alert => alert.time_diff = this.calculateTimeDifference(alert.message_date));
        }
        this.isLastAlertDataLoading = false;
      }, error => {
        this.isLastAlertDataLoading = false;
      }
    ));
  }

  /**
   * It will call the last generated notifications with limit set as 5.
   */
  getLastNotificationData() {
    this.isLastNotificationDataLoading = true;
    const obj = {
      app: this.contextApp.app,
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
      count: this.noOfRecordsToDisplay
    };
    this.apiSubscriptions.push(this.applicationService.getLastNotifications(obj)
    .subscribe(
      (response: any) => {
        if (response.data) {
          this.lastGeneratedNotifications = response.data;
          this.lastGeneratedNotifications.forEach(
            notification => notification.time_diff = this.calculateTimeDifference(notification.message_date)
          );
        }
        this.isLastNotificationDataLoading = false;
      }, error => {
        this.isLastNotificationDataLoading = false;
      }
    ));
  }

  /**
   * It will call the last generated events with limit set as 5.
   */
  getLastEventData() {
    this.isLastEventDataLoading = true;
    const obj = {
      app: this.contextApp.app,
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
      count: this.noOfRecordsToDisplay
    };
    this.apiSubscriptions.push(this.applicationService.getDeviceLifeCycleEvents(obj)
    .subscribe(
      (response: any) => {
        if (response.data) {
          this.lastGeneratedEvents = response.data;
          this.lastGeneratedEvents.forEach(event => {
            event.time_diff = this.calculateTimeDifference(event.created_date);
            const eventMsg = event.event_type.split('.');
            eventMsg[eventMsg.length - 1] = eventMsg[eventMsg.length - 1].replace('Device', '');
            eventMsg[eventMsg.length - 1] = (event.category === CONSTANTS.IP_GATEWAY ? 'Gateway ' : 'Device ' ) +
            eventMsg[eventMsg.length - 1];
            event.event_type = eventMsg[eventMsg.length - 1];
          });
        }
        this.isLastEventDataLoading = false;
      }, error => {
        this.isLastEventDataLoading = false;
      }
    ));
  }

  calculateTimeDifference(startDate) {
    const date = moment().utc().format('M/DD/YYYY h:mm:ss A');
    const today = moment(this.commonService.convertUTCDateToLocal(date));
    const startime = moment(this.commonService.convertUTCDateToLocal(startDate));
    let timeString = '';
    let diff = today.diff(startime, 'minute');
    timeString = diff + ' minutes ago';
    if (diff > 60) {
      diff = today.diff(startime, 'hours');
      timeString = diff + ' hours ago';
      if (diff > 24) {
        diff = today.diff(startime, 'days');
        timeString = diff + ' days ago';
      }
    }
    return timeString;
  }

  redirectToDevice(type?: string) {
    const fromValue = CONSTANTS.IP_GATEWAY;
    let obj;
    if (type || fromValue) {
      obj = {
        connection_state: type
      };
    }
    this.router.navigate(['applications', this.contextApp.app, 'gateways'], {queryParams: obj});
  }

  /**
   * It will unsubscribe all the subscription which were created from this component.
   * It will help preventing memory leak issue.
   */
  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
