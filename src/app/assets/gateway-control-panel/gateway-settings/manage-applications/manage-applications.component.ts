import { ToasterService } from 'src/app/services/toaster.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { EventEmitter, Output } from '@angular/core';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-manage-applications',
  templateUrl: './manage-applications.component.html',
  styleUrls: ['./manage-applications.component.css']
})
export class ManageApplicationsComponent implements OnInit {

  @Input() assetTwin: any;
  @Input() asset: any;
  @Output() refreshAssetTwin: EventEmitter<any> = new EventEmitter<any>();
  contextApp: any;
  applications = CONSTANTS.ASSETAPPPS;
  isAPILoading: any = {};

  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
  }

  startApp(app, index) {
    const obj = {
      asset_id: this.asset.asset_id,
      method: 'START_APP',
      message: {
      command: 'START_APP',
      app_name: app.name
      },
      app: this.contextApp.app,
      job_type: 'DirectMethod',
      request_type: 'START_APP',
      job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
      sub_job_id: null
    };
    obj.sub_job_id = obj.job_id + '_1';
    this.callDirectMethod(obj, 'Start', index);
  }

  stopApp(app, index) {
    const obj = {
      asset_id: this.asset.asset_id,
      method: 'STOP_APP',
      message: {
      command: 'STOP_APP',
      app_name: app.name
      },
      app: this.contextApp.app,
      job_type: 'DirectMethod',
      request_type: 'STOP_APP',
      job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
      sub_job_id: null
    };
    obj.sub_job_id = obj.job_id + '_1';
    this.callDirectMethod(obj, 'Stop', index);
  }

  restartApp(app, index) {
    const obj = {
      asset_id: this.asset.asset_id,
      method: 'RESTART_APP',
      message: {
      command: 'RESTART_APP',
      app_name: app.name
      },
      app: this.contextApp.app,
      job_type: 'DirectMethod',
      request_type: 'RESTART_APP',
      job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
      sub_job_id: null
    };
    obj.sub_job_id = obj.job_id + '_1';
    this.callDirectMethod(obj, 'Restart', index);
  }

  callDirectMethod(obj, type, index) {
    this.isAPILoading = {};
    this.isAPILoading[index] = true;
    this.assetService.callAssetMethod(obj, this.contextApp.app,
      this.asset?.gateway_id || this.asset.asset_id).subscribe(
      (response: any) => {
        this.isAPILoading[index] = false;
        this.toasterService.showSuccess(response?.asset_response?.message, type + ' App');
        setTimeout(() => {
        this.refreshAssetTwin.emit();
        }, 500);
      }, error => {
        this.isAPILoading[index] = false;
        this.toasterService.showError(error?.asset_response?.message || error?.message, type + ' App');
      }
      );
  }

}
