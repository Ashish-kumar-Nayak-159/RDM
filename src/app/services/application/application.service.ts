import { CommonService } from 'src/app/services/common.service';
import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppUrls } from '../../app-url.constants';
import { String } from 'typescript-string-operations';
import { CONSTANTS } from 'src/app/app.constants';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  url = environment.appServerURL;
  refreshAppData: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private http: HttpClient,
    private commonService: CommonService
  ) { }

  getApplicationDashboardSnapshot(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_APPLICATION_DASHBOARD_SNAPSHOT, encodeURIComponent(app)), {params});
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
    return this.http.get(this.url + String.Format(AppUrls.GET_APP_DETAILS, encodeURIComponent(app)));
  }

  createApp(appObj) {
    return this.http.post(this.url + AppUrls.CREATE_APP, appObj);
  }

  updateApp(appObj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_APP, encodeURIComponent(appObj.app)), appObj);
  }

  updateAppHierarchy(appObj) {
    return this.http.put(this.url + String.Format(AppUrls.UPDATE_APP_HIERARCHY, encodeURIComponent(appObj.app)), appObj);
  }

  updateAppRoles(appObj) {
    return this.http.put(this.url + String.Format(AppUrls.UPDATE_APP_ROLES, encodeURIComponent(appObj.app)), appObj);
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

  getDeviceLifeCycleEvents(filterObj: any) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_DEVICE_LIFECYCLE_EVENTS, { params });
  }

  getApplicationUsers(app) {
    const users = this.commonService.getItemFromLocalStorage(CONSTANTS.APP_USERS);
    if (users) {
      return new Observable((observer) => {
        observer.next({
          data: users
        });
      });
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_APP_USERS, encodeURIComponent(app))).pipe( map((data: any) => {
        this.commonService.setItemInLocalStorage(CONSTANTS.APP_USERS, data.data);
        return data;
      }), catchError( error => {
        return throwError( error);
      }));
    }
  }
}




