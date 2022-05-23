import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppUrls } from 'src/app/constants/app-url.constants';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  url = environment.appServerURL

  constructor(private http: HttpClient) { }

  getMaintenance(){
    return this.http.get(this.url + AppUrls.GET_MAINTENANCE)
  }

  deleteMaintenance(id:any){
    return this.http.delete(this.url + AppUrls.GET_MAINTENANCE + id)
  }

  enableDisable(id:any){
    var payLoad = {
      is_maintenance_required : true,
      start_date : "2022-05-30 13:00"
    }
    return this.http.patch(this.url + AppUrls.GET_MAINTENANCE + id, payLoad)
  }

}
