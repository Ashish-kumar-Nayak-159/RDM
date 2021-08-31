import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { noUndefined } from '@angular/compiler/src/util';
declare var $: any;
@Component({
  selector: 'app-register-assets',
  templateUrl: './register-assets.component.html',
  styleUrls: ['./register-assets.component.css']
})
export class RegisterAssetsComponent implements OnInit, OnDestroy {

  @Input() assetTwin: any;
  @Input() asset: any;
  @Output() refreshAssetTwin: EventEmitter<any> = new EventEmitter<any>();
  @Input() pageType: any;
  assets: any[] = [];
  contextApp: any;
  subscriptions: Subscription[] = [];
  selectedAssets: any[] = [];
  isAllAssetSelected = false;
  isAssetsAPILoading = false;
  assetApps: any[] = [];
  selectedApp: any;
  displyaMsgArr: any[] = [];
  isAPILoading = false;
  headerMessage: any;
  c2dResponseInterval: any;
  telemetrySettings: any = {};
  assetModels: any[] = [];
  applications = CONSTANTS.ASSETAPPPS;
  count = 0;
  c2dJobFilter: any = {};
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService,
    private assetModelService: AssetModelService
  ) { }

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getAssetsOfGateway();
    this.c2dJobFilter.request_type = 'register_assets,deregister_assets';
    this.c2dJobFilter.job_type = 'Message';
  }


  getAssetsOfGateway() {
    this.isAssetsAPILoading = true;
    this.assets = [];
    const obj = {
      gateway_id: this.asset.asset_id,
      type: CONSTANTS.NON_IP_ASSET,
    };
    this.subscriptions.push(
      this.assetService.getLegacyAssets(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response.data) {
            this.assets = response.data;
            this.assets.forEach(asset => {
              asset.register_enabled = false;
              asset.deregister_enabled = false;
              if (asset.metadata?.package_app) {
                asset.appObj = this.applications.find(appObj => appObj.name === asset.metadata.package_app);
                if (this.assetTwin.twin_properties.reported && this.assetTwin.twin_properties.reported[asset.appObj.type] &&
                  this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name]) {
                    if (this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name].status?.toLowerCase() !== 'running') {
                      asset.register_enabled = false;
                      asset.deregister_enabled = false;
                    } else {
                      if (this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name].asset_configuration
                      && this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name].asset_configuration[asset.asset_id]) {
                        asset.register_enabled = false;
                        asset.deregister_enabled = true;
                      } else {
                        asset.register_enabled = true;
                        asset.deregister_enabled = false;
                      }
                    }
                  }
              }
            });
          }
          this.isAssetsAPILoading = false;
        }, error => this.isAssetsAPILoading = false
      )
    );
  }

  onAssetSelection(asset, app) {
    if (this.selectedAssets.length === 0) {
      this.selectedAssets.push(asset);
    } else {
      const index = this.selectedAssets.findIndex(assetObj => assetObj.asset_id === asset.asset_id);
      if (index > -1) {
        this.selectedAssets.splice(index, 1);
      } else {
        this.selectedAssets.push(asset);
      }
    }
    const assets = this.assetApps.find(appObj => appObj.app === app)?.assets;
    if (this.selectedAssets.length === assets.length) {
      this.isAllAssetSelected = true;
    } else {
      this.isAllAssetSelected = false;
    }
  }

  onClickOfAssetAllCheckbox(app) {
    if (this.isAllAssetSelected) {
      const assets = this.assetApps.find(appObj => appObj.app === app)?.assets;
      this.selectedAssets = JSON.parse(JSON.stringify(assets));
    } else {
      this.selectedAssets = [];
    }
  }

  checkForAssetVisibility(asset) {
    const index = this.selectedAssets.findIndex(assetObj => assetObj.asset_id === asset.asset_id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  registerAssets(asset) {
    const obj = {
      command: 'register_assets',
      app_name: asset?.metadata?.package_app,
      assets: {}
    };
    obj.assets[asset.asset_id] = asset.metadata.setup_details;
    this.callC2dMethod(obj, 'Register Assets');
  }

  deregisterAssets(asset) {
    const obj = {
      command: 'deregister_assets',
      app_name: asset?.metadata?.package_app,
      assets: [
        asset.asset_id
      ]
    };
    this.callC2dMethod(obj, 'Deregister Assets');
  }

  changeTelemetrySetting() {
    const obj = {
      command: 'set_change_value_state',
      app_name: this.selectedApp,
      assets: {}
    };
    console.log(this.telemetrySettings);
    this.selectedAssets.forEach(asset => {
      obj.assets[asset.asset_id] = {scv: this.telemetrySettings[asset.asset_id] === 'changed' ? true :
      (this.telemetrySettings[asset.asset_id] === 'all' ? false : undefined) };
      obj.app_name = asset?.metadata?.package_app;
    });
    this.callC2dMethod(obj, 'Change Telemtry Settings');
  }

  callC2dMethod(obj, type) {
    console.log(obj);
    this.isAPILoading = true;
    this.headerMessage = type;
    // $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    const c2dObj = {
      asset_id: this.asset.asset_id,
      message: obj,
      app: this.contextApp.app,
      timestamp:  moment().unix(),
      acknowledge: 'Full',
      expire_in_min: 2880,
      job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
      request_type: obj.command,
      job_type: 'Message',
      sub_job_id: null
    };
    c2dObj.sub_job_id = c2dObj.job_id + '_1';
    this.subscriptions.push(
      this.assetService.sendC2DMessage(c2dObj, this.contextApp.app, this.asset.asset_id).subscribe(
        (response: any) => {
          this.toasterService.showSuccess('Request sent to gateway', type);
          this.assetService.refreshRecentJobs.emit();
          // this.displyaMsgArr.push({
          //   message: type + ' request sent to gateway.',
          //   error: false
          // });
          // clearInterval(this.c2dResponseInterval);
          // this.loadC2DResponse(c2dObj);
        }, error => {
          this.toasterService.showError(error.message, type);
          this.assetService.refreshRecentJobs.emit();
          this.isAPILoading = false;
          this.onModalClose();
          clearInterval(this.c2dResponseInterval);
        }
      )
    );
  }

  // loadC2DResponse(c2dObj) {
  //   const obj = {
  //     sub_job_id: c2dObj.sub_job_id,
  //     app: this.contextApp.app,
  //     from_date: c2dObj.timestamp - 5,
  //     to_date: moment().unix(),
  //     epoch: true,
  //     job_type: 'Message'
  //   };
  //   this.subscriptions.push(this.assetService.getMessageResponseDetails(this.contextApp.app, obj).subscribe(
  //     (response: any) => {
  //       // response.data = this.generateResponse();
  //       if (response.data?.length > 0 && this.displyaMsgArr.length <= response.data.length) {
  //         for (let i = this.displyaMsgArr.length - 1; i < response.data.length; i++) {
  //           this.displyaMsgArr.push({
  //             message:  response.data[i].asset_id + ': ' + response.data[i]?.payload?.message,
  //             error: response.data[i]?.payload?.status === 'failure' ? true : false
  //           });
  //         }
  //       }
  //       console.log(response.data.length, '======', this.selectedAssets.length);
  //       if (response?.data?.length < 1) {
  //         clearInterval(this.c2dResponseInterval);
  //         this.c2dResponseInterval = setInterval(
  //         () => {
  //           this.loadC2DResponse(c2dObj);
  //         }, 5000);
  //       } else {
  //         clearInterval(this.c2dResponseInterval);
  //         this.refreshAssetTwin.emit();
  //         setTimeout(() => {
  //           this.onModalClose();
  //           this.isAPILoading = false;
  //         }, 1000);
  //       }
  //     }
  //     ));
  // }

  generateResponse() {
    const rand = this.commonService.randomIntFromInterval(0, 1);
    const arr = [];
    for (let i = 0; i <= this.count; i++ ) {
      arr.push({
        asset_id: this.selectedAssets[i].asset_id,
        status: rand === 0 ? 'Success' : 'Failure',
        message: rand === 0 ? 'Asset registered successfully.' : 'Error in asset registration'
      });
    }
    this.count++;
    console.log(arr);
    return arr;
  }

  onModalClose() {
    $('#confirmMessageModal').modal('hide');
    this.selectedAssets = [];
    this.isAPILoading = false;
    this.count = 0;
    this.isAllAssetSelected = false;
    clearInterval(this.c2dResponseInterval);
    this.telemetrySettings = {};
    this.displyaMsgArr = [];
    this.headerMessage = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    clearInterval(this.c2dResponseInterval);
  }
}
