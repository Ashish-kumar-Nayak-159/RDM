import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import * as moment from 'moment';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-specific-direct-method',
  templateUrl: './specific-direct-method.component.html',
  styleUrls: ['./specific-direct-method.component.css']
})
export class SpecificDirectMethodComponent implements OnInit {

  @Input() pageType: any;
  @Input() componentState: any;
  @Input() asset: Asset = new Asset();
  userData: any;
  displayType: string;
  contextApp: any;
  apiSubscriptions: Subscription[] = [];
  controlWidgets: any[] = [];
  @Input() selectedWidget: any;
  @Input() jsonModelKeys: any[] = [];
  isInvokeDirectMethod: boolean;
  responseMessage: any;
  constantData = CONSTANTS;
  selectedSlaveValue: any;
  selectedAssetValue: any;
  slaves = [];
  assets: any[] = [];
  constructor(

    private commonService: CommonService,
    private route: ActivatedRoute,
    private assetModelService: AssetModelService,
    private assetService: AssetService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.displayType = 'compose';
    this.jsonModelKeys = [];
    if (this.selectedWidget) {
      this.selectedWidget.response_timeout_in_sec = 30;
      this.selectedWidget.connection_timeout_in_sec = 30;
      const keys = Object.keys(this.selectedWidget.json);
      const index = keys.findIndex(key => key.toLowerCase() === 'timestamp');
      if (index > -1) {
        keys.splice(index, 1);
      }
      this.selectedWidget.method_name = keys[0];
      this.selectedWidget?.json[keys[0]]?.params?.forEach(obj => {
        if (obj.key) {
        obj.name = obj.key;
        obj.value = obj?.json?.defaultValue;
        this.jsonModelKeys.splice(this.jsonModelKeys.length, 0, obj);
        }
      });
      if (this.selectedWidget?.metadata?.widget_type === 'Slave') {
        this.getSlaveData();
      }
    }
    if (this.asset?.type === CONSTANTS.IP_GATEWAY && this.selectedWidget?.metadata?.widget_type === 'Asset') {
      this.getAssetsListByGateway();
    }
    // this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
    //   this.contextApp.app = params.get('applicationId');
    //   this.listName = params.get('listName');
    //   this.listName = this.listName.slice(0, -1);

    // }));
  }

  getAssetsListByGateway() {
    this.assets = [];
    const obj = {
      gateway_id: this.asset.asset_id,
      type: 'Legacy Asset'
    };
    this.apiSubscriptions.push(this.assetService.getLegacyAssets(obj, this.contextApp.app).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.assets = response.data;
          // this.assets.splice(0, 0, { asset_id: this.telemetryFilter.gateway_id});
        }
      }, errror => {}
    ));
  }


  getSlaveData() {
    this.slaves = [];
    this.assetService.getAssetSlaveDetails(this.contextApp.app, this.asset.asset_id, {}).subscribe(
      (response: any) => {
        this.slaves = response.data;
      }
    );
  }

  getControlWidgets() {
    const obj = {
      app: this.contextApp.app,
      asset_model: this.asset.tags?.asset_model
    };
    this.apiSubscriptions.push(this.assetModelService.getAssetsModelControlWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data.filter(widget => widget.metadata.communication_technique === 'Direct Method');
        }
      }
    ));
  }

  onWidgetSelection() {
    this.jsonModelKeys = [];
    if (this.selectedWidget) {
      this.selectedWidget.response_timeout_in_sec = 30;
      this.selectedWidget.connection_timeout_in_sec = 30;
      const keys = Object.keys(this.selectedWidget.json);
      const index = keys.findIndex(key => key.toLowerCase() === 'timestamp');
      if (index > -1) {
        keys.splice(index, 1);
      }
      this.selectedWidget.method_name = keys[0];
      this.selectedWidget.json[keys[0]].params.forEach(obj => {
        obj.name = obj.key;
        obj.value = obj.json.defaultValue;
        this.jsonModelKeys.splice(this.jsonModelKeys.length, 0, obj);
      });
    }
  }

  getConfigureWidgets() {
    const obj = {
      app: this.contextApp.app,
      asset_model: this.asset.tags?.asset_model
    };
    this.apiSubscriptions.push(this.assetModelService.getAssetsModelConfigurationWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data.filter(widget => widget.metadata.communication_technique === 'Direct Method');
        }
      }
    ));
  }

  invokeDirectMethod() {
    if (this.selectedWidget.response_timeout_in_sec < 5 || this.selectedWidget.response_timeout_in_sec > 300) {
      this.toasterService.showError('Response timeout must be between 5 to 300', 'Invoke Method');
      return;
    }
    if (this.selectedWidget.connection_timeout_in_sec < 5 || this.selectedWidget.connection_timeout_in_sec > 300) {
      this.toasterService.showError('Connection timeout must be between 5 to 300', 'Invoke Method');
      return;
    }
    this.responseMessage = undefined;
    const obj: any = {};
    obj.method = this.selectedWidget.method_name;
    obj.app = this.asset.app;
    obj.request_type = this.selectedWidget.name;
    obj.job_type = 'DirectMethod';
    obj.job_id = this.asset.asset_id + '_' + this.commonService.generateUUID();
    obj.sub_job_id = obj.job_id + '_1';
    if (this.componentState === CONSTANTS.IP_GATEWAY) {
      obj.gateway_id = this.asset.asset_id;
    } else {
      obj.asset_id = this.asset.asset_id;
      obj.gateway_id = this.asset.gateway_id;
    }
    obj.response_timeout_in_sec = this.selectedWidget.response_timeout_in_sec;
    obj.connection_timeout_in_sec = this.selectedWidget.connection_timeout_in_sec;
    obj.message = {};
    obj.message['slave_id'] = this.selectedSlaveValue;
    obj.message['asset_id'] = this.selectedAssetValue;
    this.jsonModelKeys.forEach(item => {
      if (item.value !== null || item.value !== undefined) {
        if (item.json.type === 'boolean') {
          obj.message[item.key] = item.value ? item.json.trueValue : item.json.falseValue;
        } else {
          obj.message[item.key] = item.value;
        }
      }
    });
    // obj.message['timestamp'] = timestamp;
    this.isInvokeDirectMethod = true;
    this.apiSubscriptions.push(this.assetService.callAssetMethod(obj, obj.app,
      this.asset?.gateway_id || this.asset.asset_id).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Invoke Direct Method');
        this.isInvokeDirectMethod = false;
        this.responseMessage = response;
      }, error => {
        this.toasterService.showError(error.message, 'Invoke Direct Method');
        this.isInvokeDirectMethod = false;
        this.responseMessage = error;
      }
    ));
  }

}
