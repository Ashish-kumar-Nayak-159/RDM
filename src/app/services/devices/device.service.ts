import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppUrls } from '../../app-url.constants';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  url = environment.appServerURL;
  reloadDeviceInControlPanelEmitter: EventEmitter<any> = new EventEmitter<any>();
  composeC2DMessageStartEmitter: EventEmitter<any> = new EventEmitter<any>();
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

  getDeviceData(deviceId, app) {
    let params = new HttpParams().set('device_id', deviceId);
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.GET_DEVICE_DATA, { params });
  }

  createDevice(deviceObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    return this.http.post(this.url + AppUrls.CREATE_DEVICE, deviceObj, {params});
  }

  enableDevice(deviceId, appId) {
    let params = new HttpParams().set('device_id', deviceId);
    params = params.set('app', appId);
    return this.http.patch(this.url + AppUrls.ENABLE_DEVICE, {}, { params });
  }

  disableDevice(deviceId, appId) {
    let params = new HttpParams().set('device_id', deviceId);
    params = params.set('app', appId);
    return this.http.patch(this.url + AppUrls.DISABLE_DEVICE, {}, { params });
  }

  deleteDevice(deviceId, appId) {
    let params = new HttpParams().set('device_id', deviceId);
    params = params.set('app', appId);
    return this.http.delete(this.url + AppUrls.DELETE_DEVICE, { params });
  }

  getDeviceCredentials(deviceId, appId) {
    let params = new HttpParams().set('device_id', deviceId);
    params = params.set('app', appId);
    return this.http.get(this.url + AppUrls.GET_DEVICE_CREDENTIALS, { params });
  }

  getDeviceConnectionStatus(deviceId, app) {
    let params = new HttpParams().set('device_id', deviceId);
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.GET_DEVICE_CONNECTION_STATUS, { params });
  }

  updateDeviceTags(deviceObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    return this.http.post(this.url + AppUrls.UPDATE_DEVICE_TAGS, deviceObj, {params});
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

  getDeviceError(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ERROR_LIST, { params });
  }

  getDeviceotherMessagesList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_OTHER_MESSAGE_LIST, { params });
  }

  getDeviceBatteryMessagesList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_DEVICE_BATTERY_LIST, { params });
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

  getQueueMessagesCount(deviceId, app) {
    let params = new HttpParams();
    params = params.set('device_id', deviceId);
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.GET_QUEUE_MESSAGE_COUNT, { params });
  }

  purgeQueueMessages(deviceId, app) {
    let params = new HttpParams();
    params = params.set('device_id', deviceId);
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.PURGE_QUEUE_MESSAGE, { params });
  }

  getC2dMessageJSON(messageId, app) {
    let params = new HttpParams();
    params = params.set('message_id', messageId);
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.GET_C2D_MESSAGE_JSON, { params });
  }

  getC2dResponseJSON(messageId, app) {
    let params = new HttpParams();
    params = params.set('correlation_id', messageId);
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.GET_C2D_RESPONSE_JSON, { params });
  }

  sendC2DMessage(message, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    return this.http.post(this.url + AppUrls.SEND_C2D_MESSAGE, message, {params});
  }
}
