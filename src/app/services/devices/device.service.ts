import { CONSTANTS } from 'src/app/app.constants';
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
  searchNotificationsEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private http: HttpClient,
    private commonService: CommonService
  ) { }


  getIPAndLegacyDevices(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
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
      return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_DEVICES, encodeURIComponent(app)), { params })
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
        params = params.set(key, filterObj[key]);
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
      return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_DEVICES, encodeURIComponent(app)), { params })
      .pipe( map((data: any) => {
        this.commonService.setItemInLocalStorage(CONSTANTS.DEVICES_GATEWAYS_LIST, data.data);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  getIPDevicesAndGateways(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_DEVICES, encodeURIComponent(app)), { params });
  }

  getLegacyDevices(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_DEVICES, encodeURIComponent(app)), { params });
  }

  getDeviceList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_DEVICE_FILTER_LIST, { params });
  }

  getNonIPDeviceList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_NON_IP_DEVICE, encodeURIComponent(filterObj.app)), { params });
  }

  getDeviceDetailById(app, deviceId) {
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_DETAIL, encodeURIComponent(app), encodeURIComponent(deviceId)));
  }

  getDeviceData(deviceId, app) {
    // let params = new HttpParams().set('device_id', deviceId);
    // params = params.set('app', app);
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_DATA, encodeURIComponent(app), encodeURIComponent(deviceId)));
  }

  createDevice(deviceObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
    return this.http.post(this.url + AppUrls.CREATE_DEVICE, deviceObj, {params});
  }

  createNonIPDevice(deviceObj, app) {
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
    return this.http.post(this.url + String.Format(AppUrls.CREATE_NON_IP_DEVICE, encodeURIComponent(app)), deviceObj);
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
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
    return this.http.delete(this.url + AppUrls.DELETE_DEVICE, { params });
  }

  deleteNonIPDevice(deviceId, appId) {
    // let params = new HttpParams().set('device_id', deviceId);
    // params = params.set('app', appId);
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_NON_IP_DEVICE,
      encodeURIComponent(appId), encodeURIComponent(deviceId)));
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
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_DEVICE_TAGS,
      encodeURIComponent(app), encodeURIComponent(deviceObj.device_id)), deviceObj);
  }

  updateNonIPDeviceTags(deviceObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    return this.http.post(this.url + String.Format(AppUrls.UPDATE_NON_IP_DEVICE_TAGS,
      encodeURIComponent(app), encodeURIComponent(deviceObj.device_id)), deviceObj, {params});
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

  getDeviceAlertEndEvents(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ALERT_END_EVENT_LIST, { params });
  }

  getDeviceTelemetry(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_TELEMETRY_LIST, encodeURIComponent(filterObj.app)), { params })
    .pipe( map((data: any) => {
      const arr = [];
      data.data.forEach(item => {
        // let obj = {...item.m, ...item.d};
        // delete item.m;
        // delete item.d;
        // arr.push({...item, ...obj});
        let obj = JSON.parse(JSON.stringify(item));
        delete obj.m;
        delete obj.d;
        obj = {...obj, ...item?.m, ...item?.d};
        arr.push(obj);
      });
      data.data = JSON.parse(JSON.stringify(arr));
      return data;
    }), catchError( error => {
      return throwError( error);
    })
    );
  }

  getDeviceSamplingTelemetry(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_SAMPLING_DEVICE_TELEMETRY, encodeURIComponent(app)), { params })
    .pipe( map((data: any) => {
      const arr = [];
      data.data.forEach(item => {
        let obj = JSON.parse(JSON.stringify(item));
        delete obj.m;
        delete obj.d;
        obj = {...obj, ...item?.m, ...item?.d};
        arr.push(obj);
      });
      data.data = JSON.parse(JSON.stringify(arr));
      return data;
    }), catchError( error => {
      return throwError( error);
    })
    );
  }

  getDeviceTelemetryForReport(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_REPORT_TELEMETRY_DATA, encodeURIComponent(app)), { params });
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
    const app = filterObj.app;
    delete filterObj.app;
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_C2D_MESSAGE_LIST, encodeURIComponent(app)), { params });
  }

  getDeviceDirectMethods(filterObj) {
    const app = filterObj.app;
    delete filterObj.app;
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_METHODS, encodeURIComponent(app)), { params });
  }

  getQueueMessagesCount(params, app) {
    return this.http.get(this.url + String.Format(AppUrls.GET_QUEUE_MESSAGE_COUNT, encodeURIComponent(app)), { params });
  }

  purgeQueueMessages(params, app) {
    return this.http.delete(this.url + String.Format(AppUrls.PURGE_QUEUE_MESSAGE, encodeURIComponent(app)), { params });
  }

  getC2dMessageJSON(messageId, app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_C2D_MESSAGE_JSON,
      encodeURIComponent(app), encodeURIComponent(messageId)), { params });
  }

  getDirectMethodJSON(messageId, app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_METHOD_BY_ID,
      encodeURIComponent(app), encodeURIComponent(messageId)), { params });
  }

  getC2dResponseJSON(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_C2D_RESPONSE_JSON, { params });
  }

  sendC2DMessage(message, app, deviceId) {
    return this.http.post(this.url + String.Format(AppUrls.SEND_C2D_MESSAGE, encodeURIComponent(app),
    encodeURIComponent(deviceId)), message);
  }

  getNonIPDeviceCount(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GE_NON_IP_DEVICES_COUNT, encodeURIComponent(filterObj.app)), { params });
  }

  createLayout(layoutObj) {
    return this.http.post(this.url + AppUrls.CREATE_LAYOUT, layoutObj);
  }

  getLayout(filterObj){
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
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
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_NON_IP_DEVICE_TAGS,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.device_id)), { params });
  }

  getDeviceMessageById(filterObj, type) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    let url;
    if (type === 'alert') {
      url = AppUrls.GET_ALERT_MESSAGE_BY_ID;
    } else if (type === 'alertendevent') {
      url = AppUrls.GET_ALERT_END_EVENT_MESSAGE_BY_ID;
    } else if (type === 'telemetry') {
      url = String.Format(AppUrls.GET_TELEMETRY_MESSAGE_BY_ID, filterObj.app, filterObj.id);
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
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_SIGNALR_MODE, encodeURIComponent(app), encodeURIComponent(deviceId)));
  }

  changeTelemetryMode(msgObj, app) {
    return this.http.post(this.url + String.Format(AppUrls.CHANGE_TELEMETRY_MODE, encodeURIComponent(app)), msgObj);
  }

  getGatewayCachedTelemetry(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_CACHED_TELEMETRY, { params });
  }

  getGatewayCachedAlerts(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_CACHED_ALERTS, { params });
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

  getAssetConfigurationHistory(filterObj: any) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_CONFIGURATION_HISTORY, encodeURIComponent(filterObj.app)), { params });
  }

  callDeviceMethod(obj, app, deviceId) {
    return this.http.post(this.url + String.Format(AppUrls.CALL_DEVICE_METHOD, encodeURIComponent(app),
    encodeURIComponent(deviceId)), obj);
  }

  syncDeviceCache(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.SYNC_DEVICE_CACHE, encodeURIComponent(app)), { params });
  }

  getLastTelmetry(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_LAST_TELEMETRY, encodeURIComponent(app)), { params })
    .pipe( map((data: any) => {
      if (data.message) {
        let obj = JSON.parse(JSON.stringify(data.message));
        delete obj.m;
        delete obj.d;
        obj = {...obj, ...data.message?.m, ...data.message?.d};
        data.message = JSON.parse(JSON.stringify(obj));
      }
      return data;
    }), catchError( error => {
      return throwError( error);
    })
    );
  }

  getFirstTelmetry(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_FIRST_TELEMETRY, encodeURIComponent(app)), { params })
    .pipe( map((data: any) => {
      if (data.message) {
        let obj = JSON.parse(JSON.stringify(data.message));
        delete obj.m;
        delete obj.d;
        obj = {...obj, ...data.message?.m, ...data.message?.d};
        data.message = JSON.parse(JSON.stringify(obj));
      }
      return data;
    }), catchError( error => {
      return throwError( error);
    })
    );
  }

  getDeviceMaintenanceActivityData(app, deviceId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });

    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_MAINTENANCE_DATA,
      encodeURIComponent(app), encodeURIComponent(deviceId)), {params});
  }

  createDeviceMaintenanceActivityData(app, deviceId, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_DEVICE_MAINTENANCE_DATA,
      encodeURIComponent(app), encodeURIComponent(deviceId)), obj);
  }

  deleteDeviceMaintenanceActivityData(app, deviceId, maintenanceId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_DEVICE_MAINTENANCE_DATA,
      encodeURIComponent(app), encodeURIComponent(deviceId), encodeURIComponent(maintenanceId)));
  }

  updateDeviceMaintenanceActivityData(app, deviceId, maintenanceId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_DEVICE_MAINTENANCE_DATA,
      encodeURIComponent(app), encodeURIComponent(deviceId), encodeURIComponent(maintenanceId)), obj);
  }

  updateDeviceMetadata(obj, app, deviceId) {
    localStorage.removeItem(CONSTANTS.DEVICES_LIST);
    localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
    return this.http.put(this.url + String.Format(AppUrls.UPDATE_DEVICE_METADATA,
      encodeURIComponent(app), encodeURIComponent(deviceId)), obj);
  }

  getPregeneratedReports(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key] !== undefined || filterObj[key] !== null) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_PRE_GENERATED_REPORTS,
      encodeURIComponent(app)), {params});
  }

  getDeviceTwin(app, deviceId) {
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_TWIN,
      encodeURIComponent(app), encodeURIComponent(deviceId)));
  }

  updateDeviceTwin(app, deviceId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_DEVICE_TWIN,
      encodeURIComponent(app), encodeURIComponent(deviceId)), obj);
  }

  getDeviceTwinHistory(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_TWIN_HISTORY,
      encodeURIComponent(app)), {params});
  }


  attachLegacyDeviceToGateway(app, gatewayId, obj) {
    return this.http.post(this.url + String.Format(AppUrls.ATTACH_LEGACY_DEVICE_TO_GATEWAY,
      encodeURIComponent(app), encodeURIComponent(gatewayId)), obj);
  }

  getDerivedKPIs(app, deviceId) {
    return this.http.get(this.url + String.Format(AppUrls.GET_DERIVEDKPI_LIST,
      encodeURIComponent(app), encodeURIComponent(deviceId)));
  }

  getRules(app, deviceType, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_RULES_LIST, encodeURIComponent(app),
    encodeURIComponent(deviceType)), {params});
  }

  getDeviceNetworkFailureEvents(app, deviceId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_NETWORK_FAILURE_EVENT,
      encodeURIComponent(app), encodeURIComponent(deviceId)), {params});
  }

  getDeviceMachineFailureEvents(app, deviceId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_MACHINE_FAILURE_EVENT,
      encodeURIComponent(app), encodeURIComponent(deviceId)), {params});
  }
  updateDeviceMTTRData(app, deviceId, mttrId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_MTTR_RECORD,
      encodeURIComponent(app), encodeURIComponent(deviceId), encodeURIComponent(mttrId)), obj);
  }

  getDeviceMTBFEvents(app, deviceId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_MTBF_EVENTS,
      encodeURIComponent(app), encodeURIComponent(deviceId)), {params});
  }

  getHistoricalMTTRData(app, deviceId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_HISTORICAL_MTTR_DATA,
      encodeURIComponent(app), encodeURIComponent(deviceId)), {params});
  }

  getHistoricalMTBFData(app, deviceId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_HISTORICAL_MTBF_DATA,
      encodeURIComponent(app), encodeURIComponent(deviceId)), {params});
  }

  getMessageRequestDetails(jobId, app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_MESSAGE_REQUEST_DETAILS,
      encodeURIComponent(app), encodeURIComponent(jobId)), { params });
  }

  getMessageResponseDetails(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_MESSAGE_RESPONSE_DETAILS,
      encodeURIComponent(app)), { params });
  }

  getDerivedKPILatestData(app, kpiCode, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DERIVED_KPI_LATEST_DATA,
      encodeURIComponent(app), encodeURIComponent(kpiCode)), { params });
  }


  getDerivedKPIHistoricalData(app, kpiCode, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DERIVED_KPI_HISTORICAL_DATA,
      encodeURIComponent(app), encodeURIComponent(kpiCode)), { params });
  }

  getAssetSlaveDetails(app, deviceId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_SLAVE_DETAILS,
      encodeURIComponent(app), encodeURIComponent(deviceId)), {params});
  }

  createAssetSlaveDetail(app, deviceId, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_DEVICE_SLAVE_DETAILS,
      encodeURIComponent(app), encodeURIComponent(deviceId)), obj);
  }

  updateAssetSlaveDetail(app, deviceId, slaveId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_DEVICE_SLAVE_DETAILS,
      encodeURIComponent(app), encodeURIComponent(deviceId),
    encodeURIComponent(slaveId)), obj);
  }

  deleteAssetSlaveDetail(app, deviceId, slaveId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_DEVICE_SLAVE_DETAILS, encodeURIComponent(app),
    encodeURIComponent(deviceId), encodeURIComponent(slaveId)), {});
  }

}
