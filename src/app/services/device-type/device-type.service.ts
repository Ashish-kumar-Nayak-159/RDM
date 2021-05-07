import { CommonService } from 'src/app/services/common.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { AppUrls } from 'src/app/app-url.constants';
import { CONSTANTS } from 'src/app/app.constants';
import { environment } from 'src/environments/environment';
import { String } from 'typescript-string-operations';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeviceTypeService {

  url = environment.appServerURL;
  deviceModelRefreshData: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private http: HttpClient,
    private commonService: CommonService
  ) { }

  getThingsModelsList(filterObj) {
    const deviceModels = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODELS_LIST);
    if (deviceModels) {
      if (filterObj['id'] || filterObj['name'] || filterObj['model_type'] || filterObj['created_by']) {
      let models = deviceModels;
      if (filterObj['id']) {
        models = models.filter(modelObj => modelObj.id === filterObj['id']);
      }
      if (filterObj['name']) {
        models = models.filter(modelObj => modelObj.name === filterObj['name']);
      }
      if (filterObj['model_type']) {
        models = models.filter(modelObj => modelObj.model_type === filterObj['model_type']);
      }
      if (filterObj['created_by']) {
        models = models.filter(modelObj => modelObj.created_by === filterObj['created_by']);
      }
      return new Observable((observer) => {
        observer.next({
          data: models
        });
      });
    } else {
        return new Observable((observer) => {
          observer.next({
            data: deviceModels
          });
        });
      }
    } else {
      let params = new HttpParams();
      (Object.keys(filterObj)).forEach(key => {
        if (filterObj[key]) {
          params = params.set(key, filterObj[key]);
        }
      });

      return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODELS, encodeURIComponent(filterObj.app)), { params })
      .pipe( map((data: any) => {
        if (!filterObj['id'] && !filterObj['name'] && !filterObj['model_type'] && !filterObj['created_by']) {
          this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_MODELS_LIST, data.data);
        }
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  getThingsModelDetails(app, name) {
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_DETAILS, encodeURIComponent(app), encodeURIComponent(name)));
  }

  createThingsModel(modelObj, app) {
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    return this.http.post(this.url + String.Format(AppUrls.CREATE_THINGS_MODEL, encodeURIComponent(app)), modelObj);
  }

  updateThingsModel(modelObj, app) {
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_THINGS_MODEL, encodeURIComponent(app),
    encodeURIComponent(modelObj.name)), modelObj);
  }

  getThingsModelProperties(filterObj) {
    let deviceModel = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODEL_DATA);
    if (deviceModel?.id !== filterObj.id || deviceModel?.name !== filterObj.name) {
      deviceModel = undefined;
    }
    if (deviceModel && deviceModel.properties && (filterObj['id'] || filterObj['name'])) {
      let flag = false;
      if (filterObj['id']) {
        flag = deviceModel.id === filterObj.id;
      } else if (filterObj['name']) {
        flag = deviceModel.name === filterObj.name;
      }
      if (flag) {
        return new Observable((observer) => {
          observer.next(
            deviceModel
          );
        });
      }
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_PROPERTIES,
        encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.name)))
      .pipe( map((data: any) => {
        let obj = {};
        if (deviceModel) {
          obj = {...deviceModel};
        }
        if (Object.keys(obj).length === 0) {
          obj = {
            name: data.name,
            properties: data.properties
          };
        } else {
          obj['properties'] = data.properties;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_MODEL_DATA, obj);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  getThingsModelLayout(filterObj) {
    let deviceModel = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODEL_DATA);
    if (deviceModel?.id !== filterObj.id || deviceModel?.name !== filterObj.name) {
      deviceModel = undefined;
    }
    if (deviceModel && deviceModel.historical_widgets && (filterObj['id'] || filterObj['name'])) {
      let flag = false;
      if (filterObj['id']) {
        flag = deviceModel.id === filterObj.id;
      } else if (filterObj['name']) {
        flag = deviceModel.name === filterObj.name;
      }
      if (flag) {
        return new Observable((observer) => {
          observer.next(
            deviceModel
          );
        });
      }
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_LAYOUT,
        encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.name)))
      .pipe( map((data: any) => {
        let obj = {};
        if (deviceModel) {
          obj = {...deviceModel};
        }
        if (Object.keys(obj).length === 0) {
          obj = {
            name: data.name,
            historical_widgets: data.historical_widgets
          };
        } else {
          obj['historical_widgets'] = data.historical_widgets;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_MODEL_DATA, obj);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  getThingsModelLiveWidgets(filterObj) {
    let deviceModel = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODEL_DATA);
    if (deviceModel?.id !== filterObj.id || deviceModel?.name !== filterObj.name) {
      deviceModel = undefined;
    }
    if (deviceModel && deviceModel.live_widgets && (filterObj['id'] || filterObj['name'])) {
      let flag = false;
      if (filterObj['id']) {
        flag = deviceModel.id === filterObj.id;
      } else if (filterObj['name']) {
        flag = deviceModel.name === filterObj.name;
      }
      if (flag) {
        return new Observable((observer) => {
          observer.next(
            deviceModel
          );
        });
      }
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_LIVE_WIDGETS_FOR_MODEL,
        encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.name)))
      .pipe( map((data: any) => {
        let obj = {};
        if (deviceModel) {
          obj = {...deviceModel};
        }
        if (Object.keys(obj).length === 0) {
          obj = {
            name: data.name,
            live_widgets: data.live_widgets
          };
        } else {
          obj['live_widgets'] = data.live_widgets;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_MODEL_DATA, obj);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  freezeDeviceModel(app, deviceType) {
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
    return this.http.get(this.url + String.Format(AppUrls.FREEZE_THINGS_MODEL, encodeURIComponent(app), encodeURIComponent(deviceType)));
  }

  unfreezeDeviceModel(app, deviceType, obj) {
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
    return this.http.post(this.url + String.Format(AppUrls.UNFREEZE_THINGS_MODEL,
      encodeURIComponent(app), encodeURIComponent(deviceType)), obj);
  }


  getThingsModelDeviceMethods(filterObj) {
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_DEVICE_METHODS,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.name)));
  }

  getThingsModelControlWidgets(filterObj) {
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_CONTROL_WIDGETS,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.device_type)));
  }

  createThingsModelControlWidget(modelObj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_THINGS_MODEL_CONTROL_WIDGETS,
      encodeURIComponent(modelObj.app), encodeURIComponent(modelObj.device_type)), modelObj);
  }

  updateThingsModelControlWidget(modelObj, app) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_THINGS_MODEL_CONTROL_WIDGETS,
      encodeURIComponent(app), encodeURIComponent(modelObj.deviceType), encodeURIComponent(modelObj.id)), modelObj);
  }

  deleteThingsModelControlWidget(filterObj) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_CONTROL_WIDGET,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.device_type), encodeURIComponent(filterObj.id)));
  }

  getThingsModelConfigurationWidgets(filterObj) {
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_CONFIGURATION_WIDGETS,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.device_type)));
  }

  createThingsModelConfigurationWidget(modelObj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_THINGS_MODEL_CONFIGURATION_WIDGETS,
      encodeURIComponent(modelObj.app), encodeURIComponent(modelObj.device_type)), modelObj);
  }

  updateThingsModelConfigurationWidget(modelObj, app) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_THINGS_MODEL_CONFIGURATION_WIDGETS,
      encodeURIComponent(app), encodeURIComponent(modelObj.deviceType), encodeURIComponent(modelObj.id)), modelObj);
  }

  deleteThingsModelConfigurationWidget(filterObj) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_CONFIGURATION_WIDGET,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.device_type), encodeURIComponent(filterObj.id)));
  }

  getThingsModelDocuments(filterObj) {
    let deviceModel = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODEL_DATA);
    if (deviceModel?.id !== filterObj.id || deviceModel?.name !== filterObj.device_type) {
      deviceModel = undefined;
    }
    if (deviceModel && deviceModel.documents && (filterObj['id'] || filterObj['device_type'])) {
      let flag = false;
      if (filterObj['id']) {
        flag = deviceModel.id === filterObj.id;
      } else if (filterObj['device_type']) {
        flag = deviceModel.name === filterObj.device_type;
      }
      if (flag) {
        return new Observable((observer) => {
          observer.next(
            deviceModel.documents
          );
        });
      }
    } else {
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_REFERENCE_DOCUMENTS,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.device_type)))
      .pipe( map((data: any) => {
        let obj = {};
        if (deviceModel) {
          obj = {...deviceModel};
        }
        if (Object.keys(obj).length === 0) {
          obj = {
            id: filterObj?.id,
            name: filterObj?.device_type,
            documents: data
          };
        } else {
          obj['documents'] = data;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_MODEL_DATA, obj);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  createThingsModelDocument(modelObj, app, deviceType) {
    const deviceModel = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODEL_DATA);
    if (deviceModel && deviceModel.documents && deviceModel.name === deviceType) {
      delete deviceModel.documents;
      this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_MODEL_DATA, deviceModel);
    }
    return this.http.post(this.url + String.Format(AppUrls.CREATE_MODEL_REFERENCE_DOCUMENTS,
      encodeURIComponent(app), encodeURIComponent(deviceType)), modelObj);
  }

  updateThingsModelDocument(modelObj, app, deviceType, documentId) {
    localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_MODEL_REFERENCE_DOCUMENTS,
      encodeURIComponent(app), encodeURIComponent(deviceType), encodeURIComponent(documentId)), modelObj);
  }

  deleteThingsModelDocument(id, app, deviceType) {
    const params = new HttpParams().set('id', id);
    const deviceModel = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODEL_DATA);
    if (deviceModel && deviceModel.documents && deviceModel.name === deviceType) {
      delete deviceModel.documents;
      this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_MODEL_DATA, deviceModel);
    }
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_MODEL_REFERENCE_DOCUMENTS,
      encodeURIComponent(app), encodeURIComponent(deviceType), encodeURIComponent(id)), {});
  }

  getAlertConditions(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ALERT_CONDITIONS, encodeURIComponent(app), filterObj.device_type), {params});
  }

  createAlertCondition(modelObj, app, deviceType) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_ALERT_CONDITION,
      encodeURIComponent(app), encodeURIComponent(deviceType)), modelObj);
  }

  updateAlertCondition(modelObj, app, deviceType, alertConditionId) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_ALERT_CONDITION,
      encodeURIComponent(app), encodeURIComponent(deviceType), encodeURIComponent(alertConditionId)), modelObj);
  }

  deleteAlertCondition(app, deviceType, alertConditionId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_ALERT_CONDITION,
      encodeURIComponent(app), encodeURIComponent(deviceType), encodeURIComponent(alertConditionId)), {});
  }

  getModelReasons(app, deviceType) {
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_ALERT_REASONS,
      encodeURIComponent(app), encodeURIComponent(deviceType)));
  }

  syncModelCache(app, deviceType) {
    let params = new HttpParams();
    params = params.set('device_type', deviceType);
    return this.http.get(this.url + String.Format(AppUrls.SYNC_MODEL_CACHE, encodeURIComponent(app)), { params });
  }

  getPackages(app, deviceType, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_PACKAGES, encodeURIComponent(app), encodeURIComponent(deviceType)), {params});
  }

  createPackage(app, deviceType, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_PACKAGE, encodeURIComponent(app), encodeURIComponent(deviceType)), obj);
  }

  updatePackage(app, deviceType, packageId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_PACKAGE, encodeURIComponent(app), encodeURIComponent(deviceType),
    encodeURIComponent(packageId)), obj);
  }

  deletePackage(app, deviceType, packageId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_PACKAGE, encodeURIComponent(app),
    encodeURIComponent(deviceType), encodeURIComponent(packageId)), {});
  }

  getRules(app, deviceType) {
    return this.http.get(this.url + String.Format(AppUrls.GET_DEVICE_MODEL_RULES, encodeURIComponent(app),
    encodeURIComponent(deviceType)));
  }
}
