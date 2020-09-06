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
export class ApplicationDashboardComponent implements OnInit, OnDestroy, AfterViewInit {

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
  applicationData: any;
  blobToken = environment.blobKey;
  appName: string;
  contextApp: any;
  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.getApplicationData();
      this.getDashboardSnapshot();
      this.getLastNotificationData();
      this.getLastAlertData();
      this.getLastEventData();
      this.commonService.breadcrumbEvent.emit({
        type: 'replace',
        data: [
          {
            title: this.appName,
            url: 'applications/' + this.appName
          }
        ]
      });
      this.contextApp = this.userData.apps.filter(
        app => app.app === params.get('applicationId')
      )[0];
      console.log(this.contextApp);
    });

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const node = document.createElement('script');
      node.src = './assets/js/kdm.min.js';
      node.type = 'text/javascript';
      node.async = false;
      document.getElementsByTagName('head')[0].appendChild(node);
      }, 500);
  }

  getApplicationData() {
    this.applicationService.getApplications({}).subscribe(
      (response: any) => {
        if (response && response.data) {
          response.data.forEach(item => {
            if (item.app === this.appName) {
              this.applicationData = item;
            }
          });
        }
      }
    );
  }

  /**
   * It will call the application dashboard snapshot API
   */
  getDashboardSnapshot() {
    this.isDashboardSnapshotLoading = true;
    this.apiSubscriptions.push(this.applicationService.getApplicationDashboardSnapshot(this.appName)
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
    this.apiSubscriptions.push(this.applicationService.getLastAlerts(this.noOfRecordsToDisplay, this.appName)
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
    this.apiSubscriptions.push(this.applicationService.getLastNotifications(this.noOfRecordsToDisplay, this.appName)
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
    this.apiSubscriptions.push(this.applicationService.getLastEvents(this.noOfRecordsToDisplay, this.appName)
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
    const fromValue = (this.contextApp?.metadata?.contain_devices && this.contextApp?.metadata?.contain_gateways
      ? CONSTANTS.IP_DEVICES_GATEWAYS :
    (this.contextApp?.metadata?.contain_devices && !this.contextApp?.metadata?.contain_gateways ? CONSTANTS.IP_DEVICES :
    (!this.contextApp?.metadata?.contain_devices && this.contextApp?.metadata?.contain_gateways ? CONSTANTS.IP_GATEWAYS : '')));
    let obj;
    if (type || fromValue) {
      obj = {
        connection_state: type,
        state: fromValue
      };
    }
    this.router.navigate(['applications', this.appName, 'devices'], {queryParams: obj});
  }

  /**
   * It will unsubscribe all the subscription which were created from this component.
   * It will help preventing memory leak issue.
   */
  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
