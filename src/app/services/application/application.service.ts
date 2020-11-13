import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppUrls } from '../../app-url.constants';
import { String } from 'typescript-string-operations';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  url = environment.appServerURL;
  refreshAppData: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private http: HttpClient
  ) { }

  getApplicationDashboardSnapshot(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_APPLICATION_DASHBOARD_SNAPSHOT, {params});
  }

  getApplications(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_APPLICATIONS_LIST, {params});
  }

  getApplicationDetail(app) {
    return this.http.get(this.url + String.Format(AppUrls.GET_APP_DETAILS, app));
  }

  createApp(appObj) {
    return this.http.post(this.url + AppUrls.CREATE_APP, appObj);
  }

  updateApp(appObj) {
    return this.http.patch(this.url + AppUrls.UPDATE_APP, appObj);
  }

  updateAppHierarchy(appObj) {
    return this.http.put(this.url + AppUrls.UPDATE_APP_HIERARCHY, appObj);
  }

  updateAppRoles(appObj) {
    return this.http.put(this.url + AppUrls.UPDATE_APP_ROLES, appObj);
  }

  getLastAlerts(filterObj: any) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ALERTS_LIST, { params });
  }

  getLastNotifications(filterObj: any) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_NOTIFICAION_LIST, { params });
  }

  getLastEvents(filterObj: any) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_DEVICE_LIFECYCLE_EVENTS, { params });
  }

  getApplicationUsers(app) {
    let params = new HttpParams();
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.GET_APP_USERS, { params });
  }
}
