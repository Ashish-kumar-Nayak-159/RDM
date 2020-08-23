import { Component, OnInit, ElementRef, ViewChildren, OnDestroy } from '@angular/core';
import { ApplicationService } from './../../services/application/application.service';
import { ApplicationDashboardSnapshot, Alert, Event, Notification } from 'src/app/models/applicationDashboard.model';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { Router } from '@angular/router';
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
  applicationData: {logo: string, icon: string};
  blobToken = environment.blobKey;
  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private commonService: CommonService,

  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.applicationData = CONSTANTS.APP_DATA[this.userData.app];
    this.getDashboardSnapshot();
    this.getLastNotificationData();
    this.getLastAlertData();
    this.getLastEventData();
    this.commonService.breadcrumbEvent.emit({
      data: [
        {
          title: this.userData.app,
          url: 'applications/' + this.userData.app
        }
      ]
    });

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      let node = document.createElement('script');
      node.src = './assets/js/kdm.min.js';
      node.type = 'text/javascript';
      node.async = false;
      node.charset = 'utf-8';
      document.getElementsByTagName('head')[0].appendChild(node);
      }, 500);
  }

  /**
   * It will call the application dashboard snapshot API
   */
  getDashboardSnapshot() {
    this.isDashboardSnapshotLoading = true;
    this.apiSubscriptions.push(this.applicationService.getApplicationDashboardSnapshot(this.userData.app)
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
    this.apiSubscriptions.push(this.applicationService.getLastAlerts(this.noOfRecordsToDisplay, this.userData.app)
    .subscribe(
      (response: any) => {
        if (response.data) {
          this.lastGeneratedAlerts = response.data;
          this.lastGeneratedAlerts.forEach(alert => alert.time_diff = this.calculateTimeDifference(alert.created_date));
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
    this.apiSubscriptions.push(this.applicationService.getLastNotifications(this.noOfRecordsToDisplay, this.userData.app)
    .subscribe(
      (response: any) => {
        if (response.data) {
          this.lastGeneratedNotifications = response.data;
          this.lastGeneratedNotifications.forEach(
            notification => notification.time_diff = this.calculateTimeDifference(notification.created_date)
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
    this.apiSubscriptions.push(this.applicationService.getLastEvents(this.noOfRecordsToDisplay, this.userData.app)
    .subscribe(
      (response: any) => {
        if (response.data) {
          this.lastGeneratedEvents = response.data;
          this.lastGeneratedEvents.forEach(event => {
            event.time_diff = this.calculateTimeDifference(event.created_date);
            const eventMsg = event.event_type.split('.');
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
    console.log(today);
    console.log(startime);
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
    console.log(timeString);
    return timeString;
  }

  redirectToDevice(type?: string) {
    let obj;
    if (type) {
      obj = {
        state: type
      };
    }
    console.log(obj);
    this.router.navigate(['applications', this.userData.app, 'devices'], {queryParams: obj});
  }

  /**
   * It will unsubscribe all the subscription which were created from this component.
   * It will help preventing memory leak issue.
   */
  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
