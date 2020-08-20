import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppUrls } from '../../app-url.constants';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  url = environment.appServerURL;
  constructor(
    private http: HttpClient
  ) { }

  getApplicationDashboardSnapshot(app) {
    let params = new HttpParams();
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.GET_APPLICATION_DASHBOARD_SNAPSHOT, {params});
  }

  getLastAlerts(limit: number, app) {
    let params = new HttpParams().set('count', limit.toString());
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.GET_ALERTS_LIST, { params });
  }

  getLastNotifications(limit: number, app) {
    let params = new HttpParams().set('count', limit.toString());
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.GET_NOTIFICAION_LIST, { params });
  }

  getLastEvents(limit: number, app) {
    let params = new HttpParams().set('count', limit.toString());
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.GET_DEVICE_LIFECYCLE_EVENTS, { params });
  }
}
