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

  disable(id:number,payload:any){
    return this.http.patch(this.url + AppUrls.GET_MAINTENANCE + id, payload)
  }

  Trigger(id:number){
    return this.http.get(this.url + AppUrls.GET_MAINTENANCE_NOTIFICATION + id)
  }

  createAckMaintenance(payload:any){
    return this.http.post(this.url + AppUrls.GET_ACK_MAINTENANCE, payload)
  }

}
