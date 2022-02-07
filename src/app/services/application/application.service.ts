import { CommonService } from 'src/app/services/common.service';
import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AppUrls } from 'src/app/constants/app-url.constants';
import { String } from 'typescript-string-operations';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  url = environment.appServerURL;
  refreshAppData: EventEmitter<any> = new EventEmitter<any>();
  constructor(private http: HttpClient, private commonService: CommonService) { }

  getApplicationOfUser(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_USERS_APPLICATION, { params });
  }

  getApplicationDashboardSnapshot(filterObj, app) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_APPLICATION_DASHBOARD_SNAPSHOT, encodeURIComponent(app)),
      { params }
    );
  }

  getApplications(filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_APPLICATIONS_LIST, { params }).pipe(
      map((data: any) => {
        data.data.forEach((item) => {
          item.local_created_date = this.commonService.convertUTCDateToLocalDate(item.created_date);
          item.local_updated_date = this.commonService.convertUTCDateToLocalDate(item.updated_date);
        });
        return data;
      }),
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  getDatabasePartition(obj) {
    let params = new HttpParams();
    Object.keys(obj).forEach((key) => {
      if (obj[key]) {
        params = params.set(key, obj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_DBPARTITION, { params });
  }

  getAllPriviledges() {
    return this.http.get(this.url + String.Format(AppUrls.GET_ALL_PRIVILEDGES)).pipe(
      map((data: any) => {        
        if (data?.count > 0) {     
          let priviledgeGroup = this.GroupPriviledges(data);
          let priviledges = this.Refactorriviledges(data);
          // Note : Bifurecate PriviledgeGroup and priviledges seperately
          data.data = { PrivilegeGroup: priviledgeGroup, Priviledges: priviledges }
          return data;
        }
        return new Observable((observer) => {
          observer.next({
            data: { PrivilegeGroup: CONSTANTS.PRIVILEGE_GROUPS, Priviledges: CONSTANTS.DEFAULT_PRIVILEGES },
          });
        });
      }),
      catchError((error) => {
        return new Observable((observer) => {
          observer.next({
            data: { PrivilegeGroup: CONSTANTS.PRIVILEGE_GROUPS, Priviledges: CONSTANTS.DEFAULT_PRIVILEGES },
          });
        });
      })
    );
  }
  private GroupPriviledges(data: any) {
    return data.data.reduce((acc, value) => {
      // Group initialization
      if (!acc[value.module]) {
        acc[value.module] = [];
      }
      // Grouping
      acc[value.module].push(value.key);
      return acc;
    }, {});
  }
  private Refactorriviledges(data: any) {
    return data.data.reduce((acc, value) => {
      // Group initialization
      if (!acc[value.key]) {
        value.display_name = value.module + ' - ' + value.type;
        value.enabled = value.default_enabled;
        acc[value.key] = value;
      }                    
      return acc;
    }, {});
  }

  getAppPriviledges(app) {
    return this.http.get(this.url + String.Format(AppUrls.GET_APP_PRIVILEDGES, encodeURIComponent(app))).pipe(
      map((data: any) => {        
        if (data?.count > 0) {                         
          data.data = { Priviledges: data.data }
          return data;
        }
        return new Observable((observer) => {
          observer.next({
            data: { Priviledges: CONSTANTS.DEFAULT_PRIVILEGES },
          });
        });
      }),
      catchError((error) => {
        return new Observable((observer) => {
          observer.next({
            data: { Priviledges: CONSTANTS.DEFAULT_PRIVILEGES },
          });
        });
      })
    );
  }

  getApplicationDetail(app) {
    return this.http.get(this.url + String.Format(AppUrls.GET_APP_DETAILS, encodeURIComponent(app)));
  }

  createApp(appObj) {
    return this.http.post(this.url + AppUrls.CREATE_APP, appObj);
  }

  updateApp(appObj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_APP, encodeURIComponent(appObj.app)), appObj);
  }

  updateAppHierarchy(appObj) {
    localStorage.removeItem(CONSTANTS.APP_USERS);
    return this.http.put(
      this.url + String.Format(AppUrls.UPDATE_APP_HIERARCHY, encodeURIComponent(appObj.app)),
      appObj
    );
  }

  updatePrivilege(app,roleId,obj) {
    return this.http.put(this.url + String.Format(AppUrls.UPDATE_APPADMIN_PRIVILEGE, encodeURIComponent(app),roleId),obj );
  }

  getLastAlerts(filterObj: any) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_ALERTS_LIST, { params });
  }

  getLastNotifications(filterObj: any) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + AppUrls.GET_NOTIFICAION_LIST, { params });
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

  getApplicationUsers(app) {
    const users = this.commonService.getItemFromLocalStorage(CONSTANTS.APP_USERS);
    if (users) {
      return new Observable((observer) => {
        observer.next({
          data: users,
        });
      });
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_APP_USERS, encodeURIComponent(app))).pipe(
        map((data: any) => {
          this.commonService.setItemInLocalStorage(CONSTANTS.APP_USERS, data.data);
          return data;
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
    }
  }
  getApplicationUserGroups(app) {
    return this.http.get(this.url + String.Format(AppUrls.GET_APP_USERGROUPS, encodeURIComponent(app)));
  }

  createApplicationUserGroups(appObj, app) {
    return this.http.post(this.url + String.Format(AppUrls.GET_APP_USERGROUPS, encodeURIComponent(app)), appObj);
  }

  updateApplicationUserGroups(appObj, app, group_name) {
    return this.http.put(
      this.url + String.Format(AppUrls.UPDATE_APP_USERGROUPS, encodeURIComponent(app), encodeURIComponent(group_name)),
      appObj
    );
  }

  deleteApplicationUserGroups(app, group_name) {
    return this.http.delete(
      this.url + String.Format(AppUrls.UPDATE_APP_USERGROUPS, encodeURIComponent(app), encodeURIComponent(group_name))
    );
  }

  getApplicationUserRoles(app) {
    return this.http.get(this.url + String.Format(AppUrls.GET_APP_USERROLES, encodeURIComponent(app)));
  }

  addUserRoles(app, obj) {
    return this.http.post(this.url + String.Format(AppUrls.ADD_APP_USERROLES, encodeURIComponent(app)), obj);
  }

  updateUserRoles(app, obj) {
    return this.http.put(
      this.url + String.Format(AppUrls.UPDATE_APP_USERROLES, encodeURIComponent(app), encodeURIComponent(obj.id)),
      obj
    );
  }

  deleteUserRoles(app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.delete(
      this.url +
      String.Format(
        AppUrls.DELETE_APP_USERROLES,
        encodeURIComponent(app),
        encodeURIComponent(filterObj.id),
        filterObj.role
      ),
      { params }
    );
    // return this.http.delete(this.url + String.Format(AppUrls.DELETE_APP_USERROLES, encodeURIComponent(app),
    // encodeURIComponent(obj.id)), obj);
  }
}
