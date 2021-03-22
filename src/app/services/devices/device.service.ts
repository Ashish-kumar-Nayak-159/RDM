import { CONSTANTS } from './../../app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppUrls } from '../../app-url.constants';
import { Observable, throwError } from 'rxjs';
import { String } from 'typescript-string-operations';
import { catchError, map, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  url = environment.appServerURL;
  reloadDeviceInControlPanelEmitter: EventEmitter<any> = new EventEmitter<any>();
  composeC2DMessageStartEmitter: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private http: HttpClient,
    private commonService: CommonService
  ) { }

  getAllDevicesList(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    const devices = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICES_LIST);
    if (devices) {
      return new Observable((observer) => {
        observer.next({
          data: devices
        });
      });
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_DEVICES, encodeURI(app)), { params })
      .pipe( map((data: any) => {
        this.commonService.setItemInLocalStorage(CONSTANTS.DEVICES_LIST, data.data);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  getAllGatewaysAndDevicesList(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    const devices = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICES_GATEWAYS_LIST);
    if (devices) {
      return new Observable((observer) => {
        observer.next({
          data: devices
        });
      });
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_DEVICES, encodeURI(app)), { params })
      .pipe( map((data: any) => {
        this.commonService.setItemInLocalStorage(CONSTANTS.DEVICES_GATEWAYS_LIST, data.data);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  getDeviceList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        console.log(key, '=====', filterObj[key]);
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    console.log(params);
    return this.http.get(this.url + AppUrls.GET_DEVICE_FILTER_LIST, { params });
  }

  getNonIPDeviceList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    console.log(params);
    return this.http.get(this.url + String.Format(AppUrls.GET_NON_IP_DEVICE, filterObj.app), { params });
  }

  getDeviceDetailById(app, deviceId) {
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_DETAIL, encodeURI(app), encodeURI(deviceId)));
  }

  getDeviceData(deviceId, app) {
    // let params = new HttpParams().set('device_id', deviceId);
    // params = params.set('app', app);
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_DATA, encodeURI(app), encodeURI(deviceId)));
  }

  createDevice(deviceObj, app) {
    let params = new HttpParams();
    params = params.set('app', encodeURI(app));
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    return this.http.post(this.url + AppUrls.CREATE_DEVICE, deviceObj, {params});
  }

  createNonIPDevice(deviceObj, app) {
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    return this.http.post(this.url + String.Format(AppUrls.CREATE_NON_IP_DEVICE, encodeURI(app)), deviceObj);
  }

  enableDevice(deviceId, appId) {
    let params = new HttpParams().set('device_id', encodeURI(deviceId));
    params = params.set('app', encodeURI(appId));
    return this.http.patch(this.url + AppUrls.ENABLE_DEVICE, {}, { params });
  }

  disableDevice(deviceId, appId) {
    let params = new HttpParams().set('device_id', encodeURI(deviceId));
    params = params.set('app', encodeURI(appId));
    return this.http.patch(this.url + AppUrls.DISABLE_DEVICE, {}, { params });
  }

  deleteDevice(deviceId, appId) {
    let params = new HttpParams().set('device_id', encodeURI(deviceId));
    params = params.set('app', encodeURI(appId));
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    return this.http.delete(this.url + AppUrls.DELETE_DEVICE, { params });
  }

  deleteNonIPDevice(deviceId, appId) {
    // let params = new HttpParams().set('device_id', deviceId);
    // params = params.set('app', appId);
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_NON_IP_DEVICE, encodeURI(appId), encodeURI(deviceId)));
  }

  getDeviceCredentials(deviceId, appId) {
    let params = new HttpParams().set('device_id', encodeURI(deviceId));
    params = params.set('app', encodeURI(appId));
    return this.http.get(this.url + AppUrls.GET_DEVICE_CREDENTIALS, { params });
  }

  getDeviceConnectionStatus(deviceId, app) {
    let params = new HttpParams().set('device_id', encodeURI(deviceId));
    params = params.set('app', encodeURI(app));
    return this.http.get(this.url + AppUrls.GET_DEVICE_CONNECTION_STATUS, { params });
  }

  updateDeviceTags(deviceObj, app) {
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_DEVICE_TAGS, encodeURI(app), encodeURI(deviceObj.device_id)), deviceObj);
  }

  updateNonIPDeviceTags(deviceObj, app) {
    let params = new HttpParams();
    params = params.set('app', encodeURI(app));
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    return this.http.post(this.url + String.Format(AppUrls.UPDATE_NON_IP_DEVICE_TAGS,
      encodeURI(app), encodeURI(deviceObj.device_id)), deviceObj, {params});
  }

  getDeviceHeartBeats(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_HEARTBEAT_LIST, { params });
  }

  getDeviceNotifications(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_NOTIFICAION_LIST, { params });
  }

  getDeviceAlerts(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_ALERTS_LIST, { params });
  }

  getDeviceAlertEndEvents(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_ALERT_END_EVENT_LIST, { params });
  }

  getDeviceTelemetry(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_TELEMETRY_LIST, { params });
  }

  getDeviceSamplingTelemetry(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_SAMPLING_DEVICE_TELEMETRY, encodeURI(app)), { params });
  }

  getDeviceTelemetryForReport(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_REPORT_TELEMETRY_DATA, encodeURI(app)), { params });
  }

  getDeviceError(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_ERROR_LIST, { params });
  }

  getDeviceotherMessagesList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_OTHER_MESSAGE_LIST, { params });
  }

  getDeviceBatteryMessagesList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_DEVICE_BATTERY_LIST, { params });
  }

  getDeviceC2DMessages(filterObj) {
    const app = filterObj.app;
    delete filterObj.app;
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_C2D_MESSAGE_LIST, encodeURI(app)), { params });
  }

  getDeviceDirectMethods(filterObj) {
    const app = filterObj.app;
    delete filterObj.app;
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_METHODS, encodeURI(app)), { params });
  }

  getQueueMessagesCount(params, app) {
    return this.http.get(this.url + String.Format(AppUrls.GET_QUEUE_MESSAGE_COUNT, encodeURI(app)), { params });
  }

  purgeQueueMessages(params, app) {
    return this.http.get(this.url + String.Format(AppUrls.PURGE_QUEUE_MESSAGE, encodeURI(app)), { params });
  }

  getC2dMessageJSON(messageId, app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_C2D_MESSAGE_JSON, encodeURI(app), encodeURI(messageId)), { params });
  }

  getDirectMethodJSON(messageId, app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_METHOD_BY_ID, encodeURI(app), encodeURI(messageId)), { params });
  }

  getC2dResponseJSON(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_C2D_RESPONSE_JSON, { params });
  }

  sendC2DMessage(message, app) {
    return this.http.post(this.url + String.Format(AppUrls.SEND_C2D_MESSAGE, encodeURI(app)), message);
  }

  getNonIPDeviceCount(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GE_NON_IP_DEVICES_COUNT, filterObj.app), { params });
  }

  createLayout(layoutObj) {
    return this.http.post(this.url + AppUrls.CREATE_LAYOUT, layoutObj);
  }

  getLayout(filterObj){
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_LAYOUT, { params });
  }

  editLayout(layoutObj){
    return this.http.patch(this.url + AppUrls.CREATE_LAYOUT, layoutObj);
  }

  acknowledgeDeviceAlert(obj): Observable<any> {
    return this.http.put(this.url + AppUrls.ACKNOWLEGE_DEVICE_ALERT, obj);
  }

  getNonIPDeviceTags(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_NON_IP_DEVICE_TAGS, filterObj.app, filterObj.device_id), { params });
  }

  getDeviceMessageById(filterObj, type) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    let url;
    if (type === 'alert') {
      url = AppUrls.GET_ALERT_MESSAGE_BY_ID;
    } else if (type === 'alertendevent') {
      url = AppUrls.GET_ALERT_END_EVENT_MESSAGE_BY_ID;
    } else if (type === 'telemetry') {
      url = AppUrls.GET_TELEMETRY_MESSAGE_BY_ID;
    } else if (type === 'battery') {
      url = AppUrls.GET_BATTERY_MESSAGE_BY_ID;
    } else if (type === 'heartbeat') {
      url = AppUrls.GET_HEARTBEAT_MESSAGE_BY_ID;
    } else if (type === 'log') {
      url = AppUrls.GET_LOG_MESSAGE_BY_ID;
    } else if (type === 'notification') {
      url = AppUrls.GET_NOTIFICATION_MESSAGE_BY_ID;
    } else if (type === 'other') {
      url = AppUrls.GET_OTHER_MESSAGE_BY_ID;
    } else if (type === 'error') {
      url = AppUrls.GET_ERROR_MESSAGE_BY_ID;
    } else if (type === 'cached_alert') {
      url = String.Format(AppUrls.GET_CACHED_ALERT_BY_ID, filterObj.id);
    }
    return this.http.get(this.url + url, { params });
  }

  getDeviceSignalRMode(app, deviceId) {
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_SIGNALR_MODE, encodeURI(app), encodeURI(deviceId)));
  }

  changeTelemetryMode(msgObj, app) {
    return this.http.post(this.url + String.Format(AppUrls.CHANGE_TELEMETRY_MODE, encodeURI(app)), msgObj);
  }

  getGatewayCachedTelemetry(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_CACHED_TELEMETRY, { params });
  }

  getGatewayCachedAlerts(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_CACHED_ALERTS, { params });
  }

  getDeviceLifeCycleEvents(filterObj: any) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + AppUrls.GET_DEVICE_LIFECYCLE_EVENTS, { params });
  }

  getAssetConfigurationHistory(filterObj: any) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_CONFIGURATION_HISTORY, filterObj.app), { params });
  }

  callDeviceMethod(obj, app) {
    console.log(app);
    console.log(obj);
    return this.http.post(this.url + String.Format(AppUrls.CALL_DEVICE_METHOD, encodeURI(app)), obj);
  }

  syncDeviceCache(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.SYNC_DEVICE_CACHE, encodeURI(app)), { params });
  }

  getLastTelmetry(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_LAST_TELEMETRY, encodeURI(app)), { params });
  }

  getFirstTelmetry(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_FIRST_TELEMETRY, encodeURI(app)), { params });
  }

  getDeviceMaintenanceActivityData(app, deviceId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        console.log(filterObj[key]);
        params = params.set(key, encodeURI(filterObj[key]));
      }
    });

    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_MAINTENANCE_DATA, encodeURI(app), encodeURI(deviceId)), {params});
  }

  createDeviceMaintenanceActivityData(app, deviceId, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_DEVICE_MAINTENANCE_DATA, encodeURI(app), encodeURI(deviceId)), obj);
  }

  deleteDeviceMaintenanceActivityData(app, deviceId, maintenanceId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_DEVICE_MAINTENANCE_DATA,
      encodeURI(app), encodeURI(deviceId), encodeURI(maintenanceId)));
  }

  updateDeviceMaintenanceActivityData(app, deviceId, maintenanceId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_DEVICE_MAINTENANCE_DATA,
      encodeURI(app), encodeURI(deviceId), encodeURI(maintenanceId)), obj);
  }

}
