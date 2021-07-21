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
export class AssetService {

  url = environment.appServerURL;
  reloadAssetInControlPanelEmitter: EventEmitter<any> = new EventEmitter<any>();
  composeC2DMessageStartEmitter: EventEmitter<any> = new EventEmitter<any>();
  searchNotificationsEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private http: HttpClient,
    private commonService: CommonService
  ) { }


  getIPAndLegacyAssets(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    const assets = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSETS_LIST);
    if (assets) {
      return new Observable((observer) => {
        observer.next({
          data: assets
        });
      });
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_ASSETS, encodeURIComponent(app)), { params })
      .pipe( map((data: any) => {
        this.commonService.setItemInLocalStorage(CONSTANTS.ASSETS_LIST, data.data);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  getAllGatewaysAndAssetsList(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    const assets = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSETS_GATEWAYS_LIST);
    if (assets) {
      return new Observable((observer) => {
        observer.next({
          data: assets
        });
      });
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_ASSETS, encodeURIComponent(app)), { params })
      .pipe( map((data: any) => {
        this.commonService.setItemInLocalStorage(CONSTANTS.ASSETS_GATEWAYS_LIST, data.data);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  getIPAssetsAndGateways(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_ASSETS, encodeURIComponent(app)), { params });
  }

  getLegacyAssets(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_ASSETS, encodeURIComponent(app)), { params });
  }

  getAssetList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ASSET_FILTER_LIST, { params });
  }

  getNonIPAssetList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_NON_IP_ASSET, encodeURIComponent(filterObj.app)), { params });
  }

  getAssetDetailById(app, assetId) {
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_DETAIL, encodeURIComponent(app), encodeURIComponent(assetId)));
  }

  getAssetData(assetId, app) {
    // let params = new HttpParams().set('asset_id', assetId);
    // params = params.set('app', app);
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_DATA, encodeURIComponent(app), encodeURIComponent(assetId)));
  }

  createAsset(assetObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    localStorage.removeItem(CONSTANTS.ASSETS_LIST);
    localStorage.removeItem(CONSTANTS.ASSETS_GATEWAYS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.post(this.url + AppUrls.CREATE_ASSET, assetObj, {params});
  }

  createNonIPAsset(assetObj, app) {
    localStorage.removeItem(CONSTANTS.ASSETS_LIST);
    localStorage.removeItem(CONSTANTS.ASSETS_GATEWAYS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.post(this.url + String.Format(AppUrls.CREATE_NON_IP_ASSET, encodeURIComponent(app)), assetObj);
  }

  enableAsset(assetId, appId) {
    let params = new HttpParams().set('asset_id', assetId);
    params = params.set('app', appId);
    return this.http.patch(this.url + AppUrls.ENABLE_ASSET, {}, { params });
  }

  disableAsset(assetId, appId) {
    let params = new HttpParams().set('asset_id', assetId);
    params = params.set('app', appId);
    return this.http.patch(this.url + AppUrls.DISABLE_ASSET, {}, { params });
  }

  deleteAsset(assetId, appId) {
    let params = new HttpParams().set('asset_id', assetId);
    params = params.set('app', appId);
    localStorage.removeItem(CONSTANTS.ASSETS_LIST);
    localStorage.removeItem(CONSTANTS.ASSETS_GATEWAYS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.delete(this.url + AppUrls.DELETE_ASSET, { params });
  }

  deleteNonIPAsset(assetId, appId) {
    // let params = new HttpParams().set('asset_id', assetId);
    // params = params.set('app', appId);
    localStorage.removeItem(CONSTANTS.ASSETS_LIST);
    localStorage.removeItem(CONSTANTS.ASSETS_GATEWAYS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_NON_IP_ASSET,
      encodeURIComponent(appId), encodeURIComponent(assetId)));
  }

  getAssetCredentials(assetId, appId) {
    let params = new HttpParams().set('asset_id', assetId);
    params = params.set('app', appId);
    return this.http.get(this.url + AppUrls.GET_ASSET_CREDENTIALS, { params });
  }

  getAssetConnectionStatus(assetId, app) {
    let params = new HttpParams().set('asset_id', assetId);
    params = params.set('app', app);
    return this.http.get(this.url + AppUrls.GET_ASSET_CONNECTION_STATUS, { params });
  }

  updateAssetTags(assetObj, app) {
    localStorage.removeItem(CONSTANTS.ASSETS_LIST);
    localStorage.removeItem(CONSTANTS.ASSETS_GATEWAYS_LIST);
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_ASSET_TAGS,
      encodeURIComponent(app), encodeURIComponent(assetObj.asset_id)), assetObj);
  }

  updateNonIPAssetTags(assetObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    localStorage.removeItem(CONSTANTS.ASSETS_LIST);
    localStorage.removeItem(CONSTANTS.ASSETS_GATEWAYS_LIST);
    return this.http.post(this.url + String.Format(AppUrls.UPDATE_NON_IP_ASSET_TAGS,
      encodeURIComponent(app), encodeURIComponent(assetObj.asset_id)), assetObj, {params});
  }

  getAssetHeartBeats(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_HEARTBEAT_LIST, { params });
  }

  getAssetNotifications(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_NOTIFICAION_LIST, { params });
  }

  getAssetAlerts(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ALERTS_LIST, { params });
  }

  getAssetAlertEndEvents(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ALERT_END_EVENT_LIST, { params });
  }

  getAssetTelemetry(filterObj) {
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

  getAssetSamplingTelemetry(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_SAMPLING_ASSET_TELEMETRY, encodeURIComponent(app)), { params })
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

  getAssetTelemetryForReport(filterObj, app) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_REPORT_TELEMETRY_DATA, encodeURIComponent(app)), { params });
  }

  getAssetError(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ERROR_LIST, { params });
  }

  getAssetotherMessagesList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_OTHER_MESSAGE_LIST, { params });
  }

  getAssetBatteryMessagesList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ASSET_BATTERY_LIST, { params });
  }

  getAssetC2DMessages(filterObj) {
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

  getAssetDirectMethods(filterObj) {
    const app = filterObj.app;
    delete filterObj.app;
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_METHODS, encodeURIComponent(app)), { params });
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
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_METHOD_BY_ID,
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

  sendC2DMessage(message, app, assetId) {
    return this.http.post(this.url + String.Format(AppUrls.SEND_C2D_MESSAGE, encodeURIComponent(app),
    encodeURIComponent(assetId)), message);
  }

  getNonIPAssetCount(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GE_NON_IP_ASSETS_COUNT, encodeURIComponent(filterObj.app)), { params });
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

  acknowledgeAssetAlert(obj): Observable<any> {
    return this.http.put(this.url + AppUrls.ACKNOWLEGE_ASSET_ALERT, obj);
  }

  getNonIPAssetTags(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_NON_IP_ASSET_TAGS,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.asset_id)), { params });
  }

  getAssetMessageById(filterObj, type) {
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

  getAssetSignalRMode(app, assetId) {
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_SIGNALR_MODE, encodeURIComponent(app), encodeURIComponent(assetId)));
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

  getAssetLifeCycleEvents(filterObj: any) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ASSET_LIFECYCLE_EVENTS, { params });
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

  callAssetMethod(obj, app, assetId) {
    return this.http.post(this.url + String.Format(AppUrls.CALL_ASSET_METHOD, encodeURIComponent(app),
    encodeURIComponent(assetId)), obj);
  }

  syncAssetCache(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.SYNC_ASSET_CACHE, encodeURIComponent(app)), { params });
  }

  getLastTelmetry(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_LAST_TELEMETRY, encodeURIComponent(app)), { params })
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
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_FIRST_TELEMETRY, encodeURIComponent(app)), { params })
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

  getAssetMaintenanceActivityData(app, assetId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });

    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_MAINTENANCE_DATA,
      encodeURIComponent(app), encodeURIComponent(assetId)), {params});
  }

  createAssetMaintenanceActivityData(app, assetId, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_ASSET_MAINTENANCE_DATA,
      encodeURIComponent(app), encodeURIComponent(assetId)), obj);
  }

  deleteAssetMaintenanceActivityData(app, assetId, maintenanceId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_ASSET_MAINTENANCE_DATA,
      encodeURIComponent(app), encodeURIComponent(assetId), encodeURIComponent(maintenanceId)));
  }

  updateAssetMaintenanceActivityData(app, assetId, maintenanceId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_ASSET_MAINTENANCE_DATA,
      encodeURIComponent(app), encodeURIComponent(assetId), encodeURIComponent(maintenanceId)), obj);
  }

  updateAssetMetadata(obj, app, assetId) {
    localStorage.removeItem(CONSTANTS.ASSETS_LIST);
    localStorage.removeItem(CONSTANTS.ASSETS_GATEWAYS_LIST);
    return this.http.put(this.url + String.Format(AppUrls.UPDATE_ASSET_METADATA,
      encodeURIComponent(app), encodeURIComponent(assetId)), obj);
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

  getAssetTwin(app, assetId) {
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_TWIN,
      encodeURIComponent(app), encodeURIComponent(assetId)));
  }

  updateAssetTwin(app, assetId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_ASSET_TWIN,
      encodeURIComponent(app), encodeURIComponent(assetId)), obj);
  }

  getAssetTwinHistory(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_TWIN_HISTORY,
      encodeURIComponent(app)), {params});
  }


  attachLegacyAssetToGateway(app, gatewayId, obj) {
    return this.http.post(this.url + String.Format(AppUrls.ATTACH_LEGACY_ASSET_TO_GATEWAY,
      encodeURIComponent(app), encodeURIComponent(gatewayId)), obj);
  }

  getDerivedKPIs(app, assetId) {
    return this.http.get(this.url + String.Format(AppUrls.GET_DERIVEDKPI_LIST,
      encodeURIComponent(app), encodeURIComponent(assetId)));
  }

  getRules(app, assetModel, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_RULES_LIST, encodeURIComponent(app),
    encodeURIComponent(assetModel)), {params});
  }

  getAssetNetworkFailureEvents(app, assetId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_NETWORK_FAILURE_EVENT,
      encodeURIComponent(app), encodeURIComponent(assetId)), {params});
  }

  getAssetMachineFailureEvents(app, assetId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_MACHINE_FAILURE_EVENT,
      encodeURIComponent(app), encodeURIComponent(assetId)), {params});
  }
  updateAssetMTTRData(app, assetId, mttrId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_MTTR_RECORD,
      encodeURIComponent(app), encodeURIComponent(assetId), encodeURIComponent(mttrId)), obj);
  }

  getAssetMTBFEvents(app, assetId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_MTBF_EVENTS,
      encodeURIComponent(app), encodeURIComponent(assetId)), {params});
  }

  getHistoricalMTTRData(app, assetId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_HISTORICAL_MTTR_DATA,
      encodeURIComponent(app), encodeURIComponent(assetId)), {params});
  }

  getHistoricalMTBFData(app, assetId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_HISTORICAL_MTBF_DATA,
      encodeURIComponent(app), encodeURIComponent(assetId)), {params});
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

  getAssetSlaveDetails(app, assetId, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_SLAVE_DETAILS,
      encodeURIComponent(app), encodeURIComponent(assetId)), {params});
  }

  createAssetSlaveDetail(app, assetId, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_ASSET_SLAVE_DETAILS,
      encodeURIComponent(app), encodeURIComponent(assetId)), obj);
  }

  updateAssetSlaveDetail(app, assetId, slaveId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_ASSET_SLAVE_DETAILS,
      encodeURIComponent(app), encodeURIComponent(assetId),
    encodeURIComponent(slaveId)), obj);
  }

  deleteAssetSlaveDetail(app, assetId, slaveId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_ASSET_SLAVE_DETAILS, encodeURIComponent(app),
    encodeURIComponent(assetId), encodeURIComponent(slaveId)), {});
  }

}
