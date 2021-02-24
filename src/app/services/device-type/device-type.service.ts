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
    console.log(filterObj);
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
      console.log(models);
      if (filterObj['created_by']) {
        models = models.filter(modelObj => modelObj.created_by === filterObj['created_by']);
      }
      console.log(models);
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
      return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODELS, filterObj.app), { params })
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
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_DETAILS, app, name));
  }

  createThingsModel(modelObj, app) {
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    return this.http.post(this.url + String.Format(AppUrls.CREATE_THINGS_MODEL, app), modelObj);
  }

  updateThingsModel(modelObj, app) {
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
    console.log(localStorage.getItem(CONSTANTS.DEVICE_MODEL_DATA));
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_THINGS_MODEL, app, modelObj.name), modelObj);
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
      return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_PROPERTIES, filterObj.app, filterObj.name))
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
    console.log('in funnnnnnn');
    let deviceModel = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODEL_DATA);
    console.log(deviceModel);
    if (deviceModel?.id !== filterObj.id || deviceModel?.name !== filterObj.name) {
      deviceModel = undefined;
    }
    console.log(deviceModel);
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
      return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_LAYOUT, filterObj.app, filterObj.name))
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
    console.log('in fun');
    let deviceModel = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODEL_DATA);
    console.log(deviceModel);
    if (deviceModel?.id !== filterObj.id || deviceModel?.name !== filterObj.name) {
      deviceModel = undefined;
    }
    console.log(deviceModel);
    if (deviceModel && deviceModel.live_widgets && (filterObj['id'] || filterObj['name'])) {
      console.log('in if');
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
      return this.http.get(this.url + String.Format(AppUrls.GET_LIVE_WIDGETS_FOR_MODEL, filterObj.app, filterObj.name))
      .pipe( map((data: any) => {
        let obj = {};
        if (deviceModel) {
          obj = {...deviceModel};
        }
        if (Object.keys(obj).length === 0) {
          console.log('keys === 0');
          obj = {
            name: data.name,
            live_widgets: data.live_widgets
          };
        } else {
          console.log('keys > 0');
          obj['live_widgets'] = data.live_widgets;
        }
        console.log(obj);
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
    return this.http.get(this.url + String.Format(AppUrls.FREEZE_THINGS_MODEL, app, deviceType));
  }

  unfreezeDeviceModel(app, deviceType, obj) {
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
    return this.http.post(this.url + String.Format(AppUrls.UNFREEZE_THINGS_MODEL, app, deviceType), obj);
  }


  getThingsModelDeviceMethods(filterObj) {
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_DEVICE_METHODS, filterObj.app, filterObj.name));
  }

  getThingsModelControlWidgets(filterObj) {
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_CONTROL_WIDGETS,
      filterObj.app, filterObj.device_type));
  }

  createThingsModelControlWidget(modelObj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_THINGS_MODEL_CONTROL_WIDGETS,
      modelObj.app, modelObj.device_type), modelObj);
  }

  updateThingsModelControlWidget(modelObj, app) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_THINGS_MODEL_CONTROL_WIDGETS,
      app, modelObj.deviceType, modelObj.id), modelObj);
  }

  deleteThingsModelControlWidget(filterObj) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_CONTROL_WIDGET, filterObj.app, filterObj.device_type, filterObj.id));
  }

  getThingsModelConfigurationWidgets(filterObj) {
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_CONFIGURATION_WIDGETS, filterObj.app, filterObj.device_type));
  }

  createThingsModelConfigurationWidget(modelObj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_THINGS_MODEL_CONFIGURATION_WIDGETS,
      modelObj.app, modelObj.device_type), modelObj);
  }

  updateThingsModelConfigurationWidget(modelObj, app) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_THINGS_MODEL_CONFIGURATION_WIDGETS,
      app, modelObj.deviceType, modelObj.id), modelObj);
  }

  deleteThingsModelConfigurationWidget(filterObj) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_CONFIGURATION_WIDGET,
      filterObj.app, filterObj.device_type, filterObj.id));
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
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_REFERENCE_DOCUMENTS, filterObj.app, filterObj.device_type))
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
    return this.http.post(this.url + String.Format(AppUrls.CREATE_MODEL_REFERENCE_DOCUMENTS, app, deviceType), modelObj);
  }

  updateThingsModelDocument(modelObj, app, deviceType, documentId) {
    localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_MODEL_REFERENCE_DOCUMENTS, app, deviceType, documentId), modelObj);
  }

  deleteThingsModelDocument(id, app, deviceType) {
    const params = new HttpParams().set('id', id);
    console.log(params);
    const deviceModel = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODEL_DATA);
    if (deviceModel && deviceModel.documents && deviceModel.name === deviceType) {
      delete deviceModel.documents;
      this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_MODEL_DATA, deviceModel);
    }
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_MODEL_REFERENCE_DOCUMENTS, app, deviceType, id), {});
  }

  getAlertConditions(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ALERT_CONDITIONS, app, filterObj.device_type), {params});
  }

  createAlertCondition(modelObj, app, deviceType) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_ALERT_CONDITION, app, deviceType), modelObj);
  }

  updateAlertCondition(modelObj, app, deviceType, alertConditionId) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_ALERT_CONDITION, app, deviceType, alertConditionId), modelObj);
  }

  deleteAlertCondition(app, deviceType, alertConditionId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_ALERT_CONDITION, app, deviceType, alertConditionId), {});
  }

  getModelReasons(app, deviceType) {
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_ALERT_REASONS, app, deviceType));
  }

  syncModelCache(app, deviceType) {
    let params = new HttpParams();
    params = params.set('device_type', deviceType);
    return this.http.get(this.url + String.Format(AppUrls.SYNC_MODEL_CACHE, app), { params });
  }
}
