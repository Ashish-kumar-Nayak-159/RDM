import { CommonService } from 'src/app/services/common.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
  constructor(
    private http: HttpClient,
    private commonService: CommonService
  ) { }

  getThingsModelsList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    const deviceModels = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODELS_LIST);
    if (deviceModels && (filterObj['id'] || filterObj['name'])) {
      if (filterObj['id']) {
        const model = deviceModels.filter(modelObj => modelObj.id === filterObj['id']);
        return new Observable((observer) => {
          observer.next({
            data: model
          });
        });
      } else if (filterObj['name']) {
        const model = deviceModels.filter(modelObj => modelObj.name === filterObj['name']);
        console.log(model);
        return new Observable((observer) => {
          observer.next({
            data: model
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
      return this.http.get(this.url + AppUrls.GET_THINGS_MODELS, { params })
      .pipe( map((data: any) => {
        this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_MODELS_LIST, data.data);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }


  createThingsModel(modelObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    return this.http.post(this.url + AppUrls.CREATE_THINGS_MODEL, modelObj, {params});
  }

  updateThingsModel(modelObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
    return this.http.patch(this.url + AppUrls.UPDATE_THINGS_MODEL, modelObj, {params});
  }

  getThingsModelProperties(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
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
      return this.http.get(this.url + AppUrls.GET_THINGS_MODEL_PROPERTIES, { params })
      .pipe( map((data: any) => {
        let obj = {};
        if (deviceModel) {
          obj = {...deviceModel};
        }
        if (Object.keys(obj).length === 0) {
          obj = {
            id: data.id,
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
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    let deviceModel = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_MODEL_DATA);
    if (deviceModel?.id !== filterObj.id || deviceModel?.name !== filterObj.name) {
      deviceModel = undefined;
    }
    if (deviceModel && deviceModel.layout && (filterObj['id'] || filterObj['name'])) {
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
      return this.http.get(this.url + AppUrls.GET_THINGS_MODEL_LAYOUT, { params })
      .pipe( map((data: any) => {
        let obj = {};
        if (deviceModel) {
          obj = {...deviceModel};
        }
        if (Object.keys(obj).length === 0) {
          obj = {
            id: data.id,
            name: data.name,
            layout: data.layout
          };
        } else {
          obj['layout'] = data.layout;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_MODEL_DATA, obj);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }


  getThingsModelDeviceMethods(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    return this.http.get(this.url + AppUrls.GET_THINGS_MODEL_DEVICE_METHODS, { params });
  }

  getThingsModelControlWidgets(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    return this.http.get(this.url + AppUrls.GET_THINGS_MODEL_CONTROL_WIDGETS, { params });
  }

  createThingsModelControlWidget(modelObj) {
    return this.http.post(this.url + AppUrls.CREATE_THINGS_MODEL_CONTROL_WIDGETS, modelObj);
  }

  updateThingsModelControlWidget(modelObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    return this.http.patch(this.url + AppUrls.UPDATE_THINGS_MODEL_CONTROL_WIDGETS, modelObj, {params});
  }

  deleteThingsModelControlWidget(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    return this.http.delete(this.url + AppUrls.DELETE_CONTROL_WIDGET, { params });
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
      params = params.set(key, filterObj[key]);
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ALERT_CONDITIONS, app), { params });
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
}
