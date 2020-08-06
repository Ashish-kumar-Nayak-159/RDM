import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { APP_URLS } from '../../app-url.constants';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  url = environment.appServerURL;
  constructor(
    private http: HttpClient
  ) { }

  getApplicationDashboardSnapshot() {
    return this.http.get(this.url + APP_URLS.GET_APPLICATION_DASHBOARD_SNAPSHOT);
  }

  getLastAlerts(limit: number) {
    const params = new HttpParams().set('count', limit.toString());
    return this.http.get(this.url + APP_URLS.GET_LAST_N_ALERTS, { params });
  }

  getLastNotifications(limit: number) {
    const params = new HttpParams().set('count', limit.toString());
    return this.http.get(this.url + APP_URLS.GET_LAST_N_NOTIFICATIONS, { params });
  }

  getLastEvents(limit: number) {
    const params = new HttpParams().set('count', limit.toString());
    return this.http.get(this.url + APP_URLS.GET_LAST_N_EVENTS, { params });
  }
}
