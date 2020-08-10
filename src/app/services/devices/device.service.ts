import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppUrls } from '../../app-url.constants';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  url = environment.appServerURL;
  constructor(
    private http: HttpClient
  ) { }

  getDeviceList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    return this.http.get(this.url + AppUrls.GET_DEVICE_FILTER_LIST, { params });
  }

  getDeviceData(deviceId) {
    const params = new HttpParams().set('device_id', deviceId);
    return this.http.get(this.url + AppUrls.GET_DEVICE_DATA, { params });
  }

  getDeviceCredentials(deviceId, appId) {
    let params = new HttpParams().set('device_id', deviceId);
    params = params.set('app', appId);
    return this.http.get(this.url + AppUrls.GET_DEVICE_CREDENTIALS, { params });
  }

  getDeviceConnectionStatus(deviceId) {
    const params = new HttpParams().set('device_id', deviceId);
    return this.http.get(this.url + AppUrls.GET_DEVICE_CONNECTION_STATUS, { params });
  }

  updateDeviceTags(deviceObj) {
    return this.http.post(this.url + AppUrls.UPDATE_DEVICE_TAGS, deviceObj);
  }

  getDeviceHeartBeats(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_HEARTBEAT_LIST, { params });
  }

  getDeviceNotifications(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_NOTIFICAION_LIST, { params });
  }

  getDeviceAlerts(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ALERTS_LIST, { params });
  }

  getDeviceTelemetry(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_TELEMETRY_LIST, { params });
  }

  getDeviceC2DMessages(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_C2D_MESSAGE_LIST, { params });
  }

  getQueueMessagesCount(deviceId) {
    let params = new HttpParams();
    params = params.set('device_id', deviceId);
    return this.http.get(this.url + AppUrls.GET_QUEUE_MESSAGE_COUNT, { params });
  }

  purgeQueueMessages(deviceId) {
    let params = new HttpParams();
    params = params.set('device_id', deviceId);
    return this.http.get(this.url + AppUrls.PURGE_QUEUE_MESSAGE, { params });
  }

  getC2dMessageJSON(messageId) {
    let params = new HttpParams();
    params = params.set('message_id', messageId);
    return this.http.get(this.url + AppUrls.GET_C2D_MESSAGE_JSON, { params });
  }

  getC2dResponseJSON(messageId) {
    let params = new HttpParams();
    params = params.set('correlation_id', messageId);
    return this.http.get(this.url + AppUrls.GET_C2D_RESPONSE_JSON, { params });
  }
}
