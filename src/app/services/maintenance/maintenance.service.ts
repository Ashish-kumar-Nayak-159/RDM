import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppUrls } from 'src/app/constants/app-url.constants';
import { String } from 'typescript-string-operations';
@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  url = environment.appServerURL

  constructor(private http: HttpClient) { }

  getMaintenance(){
    return this.http.get(this.url + AppUrls.GET_MAINTENANCE)
  }
  getMaintenancedata(id){
    return this.http.get(
      this.url + String.Format(AppUrls.GET_MAINTENANCEDATA, encodeURIComponent(id))
    );
  }
  getUserGroup(app){
    return this.http.get(
      this.url + String.Format(AppUrls.GET_APP_USERGROUPS, encodeURIComponent(app))
    );
  }
  deleteMaintenance(id:any){
    return this.http.delete(this.url + AppUrls.GET_MAINTENANCE + id)
  }
  createNewMaintenanceRule(app,modelName,maintenanceModel) {
    return this.http.post(
      this.url + String.Format(AppUrls.POST_MAINTENANCE,encodeURIComponent(app),encodeURIComponent(modelName)),
      JSON.stringify(maintenanceModel))
      ;
  }
  updateNewMaintenanceRule(id,maintenanceModel) {
    return this.http.put(
      this.url + String.Format(AppUrls.PUT_MAINTENANCE,encodeURIComponent(id)),
      JSON.stringify(maintenanceModel))
      ;
  }
  enableDisable(id:any){
    var payLoad = {
      is_maintenance_required : true,
      start_date : "2022-05-30 13:00"
    }
    return this.http.patch(this.url + AppUrls.GET_MAINTENANCE + id, payLoad)
  }

}
