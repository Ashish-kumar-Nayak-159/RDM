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
  providedIn: 'root',
})
export class AssetService {
  url = environment.appServerURL;
  reloadAssetInControlPanelEmitter: EventEmitter<any> = new EventEmitter<any>();
  composeC2DMessageStartEmitter: EventEmitter<any> = new EventEmitter<any>();
  searchNotificationsEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  refreshRecentJobs: EventEmitter<any> = new EventEmitter<any>();
  constructor(private http: HttpClient, private commonService: CommonService) {}

  getIPAndLegacyAssets(filterObj, app) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    const assets = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSETS_LIST);
    if (assets) {
      return new Observable((observer) => {
        observer.next({
          data: assets,
        });
      });
    } else {
      return this.http
        .get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_ASSETS, encodeURIComponent(app)), { params })
        .pipe(
          map((data: any) => {
            this.commonService.setItemInLocalStorage(CONSTANTS.ASSETS_LIST, data.data);
            return data;
          }),
          catchError((error) => {
            return throwError(error);
          })
        );
    }
  }

  getAllGatewaysAndAssetsList(filterObj, app) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    const assets = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSETS_GATEWAYS_LIST);
    if (assets) {
      return new Observable((observer) => {
        observer.next({
          data: assets,
        });
      });
    } else {
      return this.http
        .get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_ASSETS, encodeURIComponent(app)), { params })
        .pipe(
          map((data: any) => {
            this.commonService.setItemInLocalStorage(CONSTANTS.ASSETS_GATEWAYS_LIST, data.data);
            return data;
          }),
          catchError((error) => {
            return throwError(error);
          })
        );
    }
  }

  getNonProvisionedAsset(filterObj, app) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.NON_PROVISIONED_ASSETS, encodeURIComponent(app)), { params });
  }

  getIPAssetsAndGateways(filterObj, app) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_ASSETS, encodeURIComponent(app)), { params });
  }

  getLegacyAssets(filterObj, app) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_IOT_LEGACY_ASSETS, encodeURIComponent(app)), { params });
  }

  getAssetList(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ASSET_FILTER_LIST, { params });
  }

  getNonIPAssetList(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_NON_IP_ASSET, encodeURIComponent(filterObj.app)), {
      params,
    });
  }

  getAssetDetailById(app, assetId) {
    return this.http.get(
      this.url + String.Format(AppUrls.GET_ASSET_DETAIL, encodeURIComponent(app), encodeURIComponent(assetId))
    );
  }

  getAssetData(assetId, app) {
    // let params = new HttpParams().set('asset_id', assetId);
    // params = params.set('app', app);
    return this.http.get(
      this.url + String.Format(AppUrls.GET_ASSET_DATA, encodeURIComponent(app), encodeURIComponent(assetId))
    );
  }

  createAsset(assetObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    localStorage.removeItem(CONSTANTS.ASSETS_LIST);
    localStorage.removeItem(CONSTANTS.ASSETS_GATEWAYS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.post(this.url + AppUrls.CREATE_ASSET, assetObj, { params });
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
    return this.http.delete(
      this.url + String.Format(AppUrls.DELETE_NON_IP_ASSET, encodeURIComponent(appId), encodeURIComponent(assetId))
    );
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
    return this.http.patch(
      this.url +
        String.Format(AppUrls.UPDATE_ASSET_TAGS, encodeURIComponent(app), encodeURIComponent(assetObj.asset_id)),
      assetObj
    );
  }

  updateNonIPAssetTags(assetObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    localStorage.removeItem(CONSTANTS.ASSETS_LIST);
    localStorage.removeItem(CONSTANTS.ASSETS_GATEWAYS_LIST);
    return this.http.post(
      this.url +
        String.Format(AppUrls.UPDATE_NON_IP_ASSET_TAGS, encodeURIComponent(app), encodeURIComponent(assetObj.asset_id)),
      assetObj,
      { params }
    );
  }

  getAssetHeartBeats(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_HEARTBEAT_LIST, { params });
  }

  getAssetNotifications(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_NOTIFICAION_LIST, { params });
  }

  getAssetAlerts(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ALERTS_LIST, { params });
  }

  getAssetAlertAndAlertEndEvents(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ALERT_ALERT_END_EVENTS_LIST, { params });
  }

  getAssetAlertEndEvents(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ALERT_END_EVENT_LIST, { params });
  }

  getAssetTelemetry(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http
      .get(this.url + String.Format(AppUrls.GET_TELEMETRY_LIST, encodeURIComponent(filterObj.app)), { params })
      .pipe(
        map((data: any) => {
          const arr = [];
          data.data.forEach((item) => {
            // let obj = {...item.m, ...item.d};
            // delete item.m;
            // delete item.d;
            // arr.push({...item, ...obj});
            let obj = JSON.parse(JSON.stringify(item));
            delete obj.m;
            delete obj.ed;
            delete obj.cd;
            obj = { ...obj, ...item?.m, ...item?.ed, ...item?.cd };
            arr.push(obj);
          });
          data.data = JSON.parse(JSON.stringify(arr));
          return data;
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  getAssetSamplingTelemetry(filterObj, app) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http
      .get(this.url + String.Format(AppUrls.GET_SAMPLING_ASSET_TELEMETRY, encodeURIComponent(app)), { params })
      .pipe(
        map((data: any) => {
          const arr = [];
          data.data.forEach((item) => {
            let obj = JSON.parse(JSON.stringify(item));
            delete obj.m;
            delete obj.ed;
            delete obj.cd;
            obj = { ...obj, ...item?.m, ...item?.ed, ...item?.cd };
            arr.push(obj);
          });
          data.data = JSON.parse(JSON.stringify(arr));
          return data;
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  getAssetTelemetryForReport(filterObj, app) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_REPORT_TELEMETRY_DATA, encodeURIComponent(app)), {
      params,
    });
  }

  getAssetError(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ERROR_LIST, { params });
  }

  getAssetotherMessagesList(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_OTHER_MESSAGE_LIST, { params });
  }

  getAssetBatteryMessagesList(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
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
    Object.keys(filterObj).forEach((key) => {
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
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_METHODS, encodeURIComponent(app)), { params });
  }

  getQueueMessagesCount(params, app) {
    return this.http.get(this.url + String.Format(AppUrls.GET_QUEUE_MESSAGE_COUNT, encodeURIComponent(app)), {
      params,
    });
  }

  purgeQueueMessages(params, app) {
    return this.http.delete(this.url + String.Format(AppUrls.PURGE_QUEUE_MESSAGE, encodeURIComponent(app)), { params });
  }

  getC2dMessageJSON(messageId, app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_C2D_MESSAGE_JSON, encodeURIComponent(app), encodeURIComponent(messageId)),
      { params }
    );
  }

  getDirectMethodJSON(messageId, app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_ASSET_METHOD_BY_ID, encodeURIComponent(app), encodeURIComponent(messageId)),
      { params }
    );
  }

  getC2dResponseJSON(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_C2D_RESPONSE_JSON, { params });
  }

  sendC2DMessage(message, app, assetId) {
    return this.http.post(
      this.url + String.Format(AppUrls.SEND_C2D_MESSAGE, encodeURIComponent(app), encodeURIComponent(assetId)),
      message
    );
  }

  getNonIPAssetCount(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GE_NON_IP_ASSETS_COUNT, encodeURIComponent(filterObj.app)), {
      params,
    });
  }

  createLayout(layoutObj) {
    return this.http.post(this.url + AppUrls.CREATE_LAYOUT, layoutObj);
  }

  getLayout(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_LAYOUT, { params });
  }

  editLayout(layoutObj) {
    return this.http.patch(this.url + AppUrls.CREATE_LAYOUT, layoutObj);
  }

  acknowledgeAssetAlert(obj): Observable<any> {
    return this.http.put(this.url + AppUrls.ACKNOWLEGE_ASSET_ALERT, obj);
  }

  getNonIPAssetTags(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url +
        String.Format(
          AppUrls.GET_NON_IP_ASSET_TAGS,
          encodeURIComponent(filterObj.app),
          encodeURIComponent(filterObj.asset_id)
        ),
      { params }
    );
  }

  getAssetMessageById(filterObj, type) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
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

  getTelemetryMode(app, assetId) {
    return this.http.get(
      this.url + String.Format(AppUrls.GET_ASSET_SIGNALR_MODE, encodeURIComponent(app), encodeURIComponent(assetId))
    );
  }

  changeTelemetryMode(msgObj, app) {
    return this.http.post(this.url + String.Format(AppUrls.CHANGE_TELEMETRY_MODE, encodeURIComponent(app)), msgObj);
  }

  getGatewayCachedTelemetry(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_CACHED_TELEMETRY, { params });
  }

  getGatewayCachedAlerts(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_CACHED_ALERTS, { params });
  }

  getLogs(app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_LOGS, encodeURIComponent(app)), { params });
    // return this.http.get(this.url + AppUrls.GET_LOGS, { params });
  }

  getAssetLifeCycleEvents(filterObj: any) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ASSET_LIFECYCLE_EVENTS, { params });
  }

  getAssetConfigurationHistory(filterObj: any) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_ASSET_CONFIGURATION_HISTORY, encodeURIComponent(filterObj.app)),
      { params }
    );
  }

  callAssetMethod(obj, app, assetId) {
    return this.http.post(
      this.url + String.Format(AppUrls.CALL_ASSET_METHOD, encodeURIComponent(app), encodeURIComponent(assetId)),
      obj
    );
  }

  syncAssetCache(app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.SYNC_ASSET_CACHE, encodeURIComponent(app)), { params });
  }

  getLastTelmetry(app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http
      .get(this.url + String.Format(AppUrls.GET_ASSET_LAST_TELEMETRY, encodeURIComponent(app)), { params })
      .pipe(
        map((data: any) => {
          if (data.message) {
            let obj = JSON.parse(JSON.stringify(data.message));
            delete obj.m;
            delete obj.ed;
            delete obj.cd;
            obj = { ...obj, ...data.message?.m, ...data.message?.ed, ...data.message?.cd };
            data.message = JSON.parse(JSON.stringify(obj));
          }
          return data;
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  getFirstTelmetry(app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http
      .get(this.url + String.Format(AppUrls.GET_ASSET_FIRST_TELEMETRY, encodeURIComponent(app)), { params })
      .pipe(
        map((data: any) => {
          if (data.message) {
            let obj = JSON.parse(JSON.stringify(data.message));
            delete obj.m;
            delete obj.ed;
            delete obj.cd;
            obj = { ...obj, ...data.message?.m, ...data.message?.ed, ...data.message?.cd };
            data.message = JSON.parse(JSON.stringify(obj));
          }
          return data;
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  getAssetMaintenanceActivityData(app, assetId, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });

    return this.http.get(
      this.url +
        String.Format(AppUrls.GET_ASSET_MAINTENANCE_DATA, encodeURIComponent(app), encodeURIComponent(assetId)),
      { params }
    );
  }

  createAssetMaintenanceActivityData(app, assetId, obj) {
    return this.http.post(
      this.url +
        String.Format(AppUrls.CREATE_ASSET_MAINTENANCE_DATA, encodeURIComponent(app), encodeURIComponent(assetId)),
      obj
    );
  }

  deleteAssetMaintenanceActivityData(app, assetId, maintenanceId) {
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_ASSET_MAINTENANCE_DATA,
          encodeURIComponent(app),
          encodeURIComponent(assetId),
          encodeURIComponent(maintenanceId)
        )
    );
  }

  updateAssetMaintenanceActivityData(app, assetId, maintenanceId, obj) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_ASSET_MAINTENANCE_DATA,
          encodeURIComponent(app),
          encodeURIComponent(assetId),
          encodeURIComponent(maintenanceId)
        ),
      obj
    );
  }

  updateAssetMetadata(obj, app, assetId) {
    localStorage.removeItem(CONSTANTS.ASSETS_LIST);
    localStorage.removeItem(CONSTANTS.ASSETS_GATEWAYS_LIST);
    return this.http.put(
      this.url + String.Format(AppUrls.UPDATE_ASSET_METADATA, encodeURIComponent(app), encodeURIComponent(assetId)),
      obj
    );
  }

  createReportSubscription(app, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_REPORT_SUBSCRIPTION, encodeURIComponent(app)), obj);
  }

  getPregeneratedReports(filterObj, app) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key] !== undefined || filterObj[key] !== null) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_PRE_GENERATED_REPORTS, encodeURIComponent(app)), {
      params,
    });
  }

  getAssetTwin(app, assetId) {
    return this.http.get(
      this.url + String.Format(AppUrls.GET_ASSET_TWIN, encodeURIComponent(app), encodeURIComponent(assetId))
    );
  }

  updateAssetTwin(app, assetId, obj) {
    return this.http.patch(
      this.url + String.Format(AppUrls.UPDATE_ASSET_TWIN, encodeURIComponent(app), encodeURIComponent(assetId)),
      obj
    );
  }

  getAssetTwinHistory(app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_TWIN_HISTORY, encodeURIComponent(app)), { params });
  }

  attachLegacyAssetToGateway(app, gatewayId, obj) {
    return this.http.post(
      this.url +
        String.Format(AppUrls.ATTACH_LEGACY_ASSET_TO_GATEWAY, encodeURIComponent(app), encodeURIComponent(gatewayId)),
      obj
    );
  }

  getDerivedKPIs(app, assetModelName) {
    return this.http.get(
      this.url + String.Format(AppUrls.GET_DERIVEDKPI_LIST, encodeURIComponent(app), encodeURIComponent(assetModelName))
    );
  }

  getDerivedKPISHistoricalData(app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_DERIVED_KPIS_HISTORICAL_DATA, encodeURIComponent(app)), {
      params,
    });
  }

  getRules(app, assetModel, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_RULES_LIST, encodeURIComponent(app), encodeURIComponent(assetModel)),
      { params }
    );
  }

  getAlertConditions(app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_ASSET_ALERT_CONDITIONS, encodeURIComponent(app), filterObj.asset_id),
      { params }
    );
  }

  createAlertCondition(modelObj, app, assetModel) {
    return this.http.post(
      this.url +
        String.Format(AppUrls.CREATE_ASSET_ALERT_CONDITION, encodeURIComponent(app), encodeURIComponent(assetModel)),
      modelObj
    );
  }

  updateAlertCondition(modelObj, app, assetModel, alertConditionId) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_ASSET_ALERT_CONDITION,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(alertConditionId)
        ),
      modelObj
    );
  }

  deleteAlertCondition(app, assetModel, alertConditionId) {
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_ASSET_ALERT_CONDITION,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(alertConditionId)
        ),
      {}
    );
  }

  getAssetsModelLayout(filterObj) {
    let assetModel = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODEL_DATA);
    if (assetModel?.id !== filterObj.id || assetModel?.name !== filterObj.name) {
      assetModel = undefined;
    }
    if (assetModel && assetModel.historical_widgets && (filterObj['id'] || filterObj['name'])) {
      let flag = false;
      if (filterObj['id']) {
        flag = assetModel.id === filterObj.id;
      } else if (filterObj['name']) {
        flag = assetModel.name === filterObj.name;
      }
      if (flag) {
        return new Observable((observer) => {
          observer.next(assetModel);
        });
      }
    } else {
      return this.http
        .get(
          this.url +
            String.Format(
              AppUrls.GET_ASSETS_MODEL_LAYOUT,
              encodeURIComponent(filterObj.app),
              encodeURIComponent(filterObj.name)
            )
        )
        .pipe(
          map((data: any) => {
            let obj = {};
            if (assetModel) {
              obj = { ...assetModel };
            }
            if (Object.keys(obj).length === 0) {
              obj = {
                name: data.name,
                historical_widgets: data.historical_widgets,
              };
            } else {
              obj['historical_widgets'] = data.historical_widgets;
            }
            this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, obj);
            return data;
          }),
          catchError((error) => {
            return throwError(error);
          })
        );
    }
  }

  getModelSlaveDetails(app, assetModel, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url +
        String.Format(AppUrls.GET_MODEL_SLAVE_DETAILS, encodeURIComponent(app), encodeURIComponent(assetModel)),
      { params }
    );
  }

  getAssetsModelDocuments(filterObj) {
    let assetModel = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODEL_DATA);
    if (assetModel?.id !== filterObj.id || assetModel?.name !== filterObj.asset_model) {
      assetModel = undefined;
    }
    if (assetModel && assetModel.documents && (filterObj['id'] || filterObj['asset_model'])) {
      let flag = false;
      if (filterObj['id']) {
        flag = assetModel.id === filterObj.id;
      } else if (filterObj['asset_model']) {
        flag = assetModel.name === filterObj.asset_model;
      }
      if (flag) {
        return new Observable((observer) => {
          observer.next(assetModel.documents);
        });
      }
    } else {
      return this.http
        .get(
          this.url +
            String.Format(
              AppUrls.GET_MODEL_REFERENCE_DOCUMENTS,
              encodeURIComponent(filterObj.app),
              encodeURIComponent(filterObj.asset_model)
            )
        )
        .pipe(
          map((data: any) => {
            let obj = {};
            if (assetModel) {
              obj = { ...assetModel };
            }
            if (Object.keys(obj).length === 0) {
              obj = {
                id: filterObj?.id,
                name: filterObj?.asset_model,
                documents: data,
              };
            } else {
              obj['documents'] = data;
            }
            this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, obj);
            return data;
          }),
          catchError((error) => {
            return throwError(error);
          })
        );
    }
  }

  getAssetNetworkFailureEvents(app, assetId, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_NETWORK_FAILURE_EVENT, encodeURIComponent(app), encodeURIComponent(assetId)),
      { params }
    );
  }

  getAssetMachineFailureEvents(app, assetId, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_MACHINE_FAILURE_EVENT, encodeURIComponent(app), encodeURIComponent(assetId)),
      { params }
    );
  }
  updateAssetMTTRData(app, assetId, mttrId, obj) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_MTTR_RECORD,
          encodeURIComponent(app),
          encodeURIComponent(assetId),
          encodeURIComponent(mttrId)
        ),
      obj
    );
  }

  getAssetMTBFEvents(app, assetId, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_MTBF_EVENTS, encodeURIComponent(app), encodeURIComponent(assetId)),
      { params }
    );
  }

  getHistoricalMTTRData(app, assetId, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_HISTORICAL_MTTR_DATA, encodeURIComponent(app), encodeURIComponent(assetId)),
      { params }
    );
  }

  getHistoricalMTBFData(app, assetId, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_HISTORICAL_MTBF_DATA, encodeURIComponent(app), encodeURIComponent(assetId)),
      { params }
    );
  }

  getMessageRequestDetails(jobId, app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_MESSAGE_REQUEST_DETAILS, encodeURIComponent(app), encodeURIComponent(jobId)),
      { params }
    );
  }

  getMessageResponseDetails(app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_MESSAGE_RESPONSE_DETAILS, encodeURIComponent(app)), {
      params,
    });
  }

  getDerivedKPILatestData(app, kpiCode, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url +
        String.Format(AppUrls.GET_DERIVED_KPI_LATEST_DATA, encodeURIComponent(app), encodeURIComponent(kpiCode)),
      { params }
    );
  }

  getDerivedKPIHistoricalData(app, kpiCode, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url +
        String.Format(AppUrls.GET_DERIVED_KPI_HISTORICAL_DATA, encodeURIComponent(app), encodeURIComponent(kpiCode)),
      { params }
    );
  }

  getAssetSlaveDetails(app, assetId, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_ASSET_SLAVE_DETAILS, encodeURIComponent(app), encodeURIComponent(assetId)),
      { params }
    );
  }

  createAssetSlaveDetail(app, assetId, obj) {
    return this.http.post(
      this.url +
        String.Format(AppUrls.CREATE_ASSET_SLAVE_DETAILS, encodeURIComponent(app), encodeURIComponent(assetId)),
      obj
    );
  }

  updateAssetSlaveDetail(app, assetId, slaveId, obj) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_ASSET_SLAVE_DETAILS,
          encodeURIComponent(app),
          encodeURIComponent(assetId),
          encodeURIComponent(slaveId)
        ),
      obj
    );
  }

  deleteAssetSlaveDetail(app, assetId, slaveId) {
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_ASSET_SLAVE_DETAILS,
          encodeURIComponent(app),
          encodeURIComponent(assetId),
          encodeURIComponent(slaveId)
        ),
      {}
    );
  }

  // Non Provisioned Assets
  
  getNonProvisionedAssets(app) {
    return this.http.get(this.url + String.Format(AppUrls.NON_PROVISIONED_ASSETS, encodeURIComponent(app)));
  }

  updateNonProvisionedAsset(app, assetId, obj) {
    return this.http.patch(
      this.url +
        String.Format(AppUrls.UPDATE_NON_PROVISIONED_ASSETS, encodeURIComponent(app), encodeURIComponent(assetId)),
      obj
    );
  }

  createNewCloudAssetRule(app, modelName, ruleModel) {
    return this.http.post(
      this.url + String.Format(AppUrls.UPDATE_CLOUD_ASSET_RULE, encodeURIComponent(app), encodeURIComponent(modelName)),
      ruleModel
    );
  }

  updateCloudAssetRule(app, modelName, ruleModel) {
    return this.http.put(
      this.url + String.Format(AppUrls.UPDATE_CLOUD_ASSET_RULE, encodeURIComponent(app), encodeURIComponent(modelName)),
      ruleModel
    );
  }

  deleteCloudAssetRule(app, id, rule_type, updated_by, rule_type_id) {
    let params = new HttpParams();
    params = params
      .set('id', id)
      .set('rule_type', rule_type)
      .set('updated_by', updated_by)
      .set('rule_type_id', rule_type_id);

    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_CLOUD_ASSET_RULE,
          encodeURIComponent(app),
          encodeURIComponent(id),
          encodeURIComponent(rule_type),
          encodeURIComponent(updated_by),
          encodeURIComponent(rule_type_id)
        ),
      { params }
    );
  }
  createNewEdgeAssetRule(app, modelName, ruleModel) {
    return this.http.post(
      this.url + String.Format(AppUrls.UPDATE_EDGE_ASSET_RULE, encodeURIComponent(app), encodeURIComponent(modelName)),
      ruleModel
    );
  }

  updateEdgeAssetRule(app, modelName, ruleModel) {
    return this.http.put(
      this.url + String.Format(AppUrls.UPDATE_EDGE_ASSET_RULE, encodeURIComponent(app), encodeURIComponent(modelName)),
      ruleModel
    );
  }

  deleteEdgeAssetRule(app, id, rule_type, updated_by, rule_type_id) {
    let params = new HttpParams();
    params = params
      .set('id', id)
      .set('rule_type', rule_type)
      .set('updated_by', updated_by)
      .set('rule_type_id', rule_type_id);

    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_EDGE_ASSET_RULE,
          encodeURIComponent(app),
          encodeURIComponent(id),
          encodeURIComponent(rule_type),
          encodeURIComponent(updated_by),
          encodeURIComponent(rule_type_id)
        ),
      { params }
    );
  }

  deployCloudAssetRule(app, modelName, ruleModelId, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.post(
      this.url +
        String.Format(
          AppUrls.DEPLOY_CLOUD_ASSET_RULE,
          encodeURIComponent(app),
          encodeURIComponent(modelName),
          encodeURIComponent(ruleModelId)
        ),
      {},
      { params }
    );
  }

  deployAssetEdgeRule(app, assetId, ruleId, bodyObj, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.post(
      this.url +
        String.Format(
          AppUrls.DEPLOY_EDGE_RULE,
          encodeURIComponent(app),
          encodeURIComponent(assetId),
          encodeURIComponent(ruleId)
        ),
      bodyObj,
      { params }
    );
  }
}
