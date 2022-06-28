import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import * as datefns from 'date-fns';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
declare var $: any;
@Component({
  selector: 'app-register-assets',
  templateUrl: './register-assets.component.html',
  styleUrls: ['./register-assets.component.css'],
})
export class RegisterAssetsComponent implements OnInit, OnDestroy {
  @Input() assetTwin: any;
  @Input() asset: any;
  @Output() refreshAssetTwin: EventEmitter<any> = new EventEmitter<any>();
  @Input() pageType: any;
  @Input() componentstate: any;
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
  assetModels: any[] = [];
  applications = CONSTANTS.ASSETAPPPS;
  c2dJobFilter: any = {};
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService,
    private assetModelService: AssetModelService
  ) {}

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);

    this.c2dJobFilter.request_type = 'Register Asset,Deregister Asset';
    this.c2dJobFilter.job_type = 'Message';
    if (this.componentstate === CONSTANTS.IP_GATEWAY) {
      this.getAssetsOfGateway();
    } else {
      this.asset.register_enabled = false;
      this.asset.deregister_enabled = false;
      if (this.asset.metadata?.package_app) {
        this.asset.appObj = this.applications.find((appObj) => appObj.name === this.asset.metadata.package_app);
        if (
          this.assetTwin.twin_properties.reported &&
          this.assetTwin.twin_properties.reported[this.asset?.appObj?.type] &&
          this.assetTwin.twin_properties.reported[this.asset?.appObj?.type][this.asset?.appObj?.name]
        ) {
          if (
            this.assetTwin.twin_properties.reported[this.asset?.appObj?.type][
              this.asset.appObj.name
            ].status?.toLowerCase() !== 'running'
          ) {
            this.asset.register_enabled = false;
            this.asset.deregister_enabled = false;
          } else {
            if (
              this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
                .asset_configuration &&
              this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
                .asset_configuration[this.asset.asset_id]
            ) {
              this.asset.register_enabled = false;
              this.asset.deregister_enabled = true;
            } else {
              this.asset.register_enabled = true;
              this.asset.deregister_enabled = false;
            }
          }
        }
      }
      this.asset.display_name = this.asset.tags.display_name;
      this.assets.push(this.asset);
    }
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
            this.assets.forEach((asset) => {
              asset.register_enabled = false;
              asset.deregister_enabled = false;
              if (asset.metadata?.package_app) {
                asset.appObj = this.applications.find((appObj) => appObj.name === asset.metadata.package_app);
                if (
                  this.assetTwin.twin_properties.reported &&
                  this.assetTwin.twin_properties.reported[asset.appObj.type] &&
                  this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name]
                ) {
                  if (
                    this.assetTwin.twin_properties.reported[asset.appObj.type][
                      asset.appObj.name
                    ].status?.toLowerCase() !== 'running'
                  ) {
                    asset.register_enabled = false;
                    asset.deregister_enabled = false;
                  } else {
                    if (
                      this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name]
                        .asset_configuration &&
                      this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name].asset_configuration[
                        asset.asset_id
                      ]
                    ) {
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
        },
        (error) => (this.isAssetsAPILoading = false)
      )
    );
  }

  onAssetSelection(asset, app) {
    if (this.selectedAssets.length === 0) {
      this.selectedAssets.push(asset);
    } else {
      const index = this.selectedAssets.findIndex((assetObj) => assetObj.asset_id === asset.asset_id);
      if (index > -1) {
        this.selectedAssets.splice(index, 1);
      } else {
        this.selectedAssets.push(asset);
      }
    }
    const assets = this.assetApps.find((appObj) => appObj.app === app)?.assets;
    if (this.selectedAssets.length === assets.length) {
      this.isAllAssetSelected = true;
    } else {
      this.isAllAssetSelected = false;
    }
  }

  onClickOfAssetAllCheckbox(app) {
    if (this.isAllAssetSelected) {
      const assets = this.assetApps.find((appObj) => appObj.app === app)?.assets;
      this.selectedAssets = JSON.parse(JSON.stringify(assets));
    } else {
      this.selectedAssets = [];
    }
  }

  checkForAssetVisibility(asset) {
    const index = this.selectedAssets.findIndex((assetObj) => assetObj.asset_id === asset.asset_id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  registerAssets(asset) {
    const obj = {
      command: 'register_assets',
      app_name: asset?.metadata?.package_app,
      assets: {},
    };
    obj.assets[asset.asset_id] = asset?.metadata?.setup_details || {};
    this.callC2dMethod(obj, asset, 'Register Assets');
  }

  deregisterAssets(asset) {
    const obj = {
      command: 'deregister_assets',
      app_name: asset?.metadata?.package_app,
      assets: [asset.asset_id],
    };
    this.callC2dMethod(obj, asset, 'Deregister Assets');
  }

  callC2dMethod(obj, asset, type) {
    this.isAPILoading = true;
    this.headerMessage = type;
    const c2dObj = {
      asset_id: this.componentstate !== CONSTANTS.IP_GATEWAY ? asset.asset_id : asset.gateway_id,
      message: obj,
      app: this.contextApp.app,
      timestamp: datefns.getUnixTime(new Date()),
      acknowledge: 'Full',
      expire_in_min: 2880,
      job_id: asset.asset_id + '_' + this.commonService.generateUUID(),
      request_type: null,
      job_type: 'Message',
      sub_job_id: null,
    };
    if (obj.command === 'register_assets') {
      c2dObj.request_type = 'Register Asset';
    } else if (obj.command === 'deregister_assets') {
      c2dObj.request_type = 'Deregister Asset';
    }
    c2dObj.sub_job_id = c2dObj.job_id + '_1';
    this.subscriptions.push(
      this.assetService
        .sendC2DMessage(
          c2dObj,
          this.contextApp.app,
          asset.type !== CONSTANTS.NON_IP_ASSET ? asset.asset_id : asset.gateway_id
        )
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess('Request sent to gateway', type);
            this.assetService.refreshRecentJobs.emit();
          },
          (error) => {
            this.toasterService.showError(error.message, type);
            this.assetService.refreshRecentJobs.emit();
            this.isAPILoading = false;
            this.onModalClose();
            clearInterval(this.c2dResponseInterval);
          }
        )
    );
  }

  onModalClose() {
    this.selectedAssets = [];
    this.isAPILoading = false;
    this.isAllAssetSelected = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    clearInterval(this.c2dResponseInterval);
  }
}
