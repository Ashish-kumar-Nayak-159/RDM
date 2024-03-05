import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from './../../../services/common.service';
import { ToasterService } from './../../../services/toaster.service';

@Component({
  selector: 'app-gateway-settings',
  templateUrl: './gateway-settings.component.html',
  styleUrls: ['./gateway-settings.component.css'],
})
export class GatewaySettingsComponent implements OnInit {
  @Input() asset: any;
  @Input() tileData: any;
  @Input() componentState: any;
  @Input() menuDetail: any;
  subscriptions: Subscription[] = [];
  contextApp: any;
  userData: any;
  selectedTab: string;
  isSaveSettingAPILoading = false;
  isTestConnectionAPILoading = false;
  testConnectionMessage: string;
  assetTwin: any;
  constantData = CONSTANTS;
  c2dJobFilter: any = {};
  c2dJobFilter1: any = {};
  decodedToken: any;
  activeClass = false;
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.asset = JSON.parse(JSON.stringify(this.asset));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.getAssetTwinData();
    this.getAssetData();
    this.c2dJobFilter.request_type = 'Test Connection';
    this.c2dJobFilter.job_type = 'DirectMethod';
    if (this.menuDetail?.accordion_value?.test_connection) {
      this.selectedTab = 'Test Connection';

    } else if (this.menuDetail?.accordion_value?.fota) {
      this.selectedTab = 'FOTA';

    } else if (this.menuDetail?.accordion_value?.manage_application) {
      this.selectedTab = 'Manage Applications';

    } else if (this.menuDetail?.accordion_value?.manage_assets) {
      this.selectedTab = 'Manage Assets';

    } else if (this.menuDetail?.accordion_value?.sync_slaves) {
      this.selectedTab = 'Register Slaves';
    }
    else if (this.menuDetail?.accordion_value?.sync_properties) {
      this.selectedTab = 'Register Properties';
    }
    else if (this.menuDetail?.accordion_value?.sync_rules) {
      this.selectedTab = 'Register Rules';
    }
    else if (this.menuDetail?.accordion_value?.settings) {
      this.selectedTab = 'Settings';
    }
    else {
      if (this.componentState === this.constantData.NON_IP_ASSET) {
        this.selectedTab = 'Manage Assets'
      } else {
        this.selectedTab = 'Test Connection'
      }
    }
  }


  getAssetData() {
    this.subscriptions.push(
      this.assetService
        .getAssetDetailById(this.contextApp.app, this.asset.asset_id)
        .subscribe(async (response: any) => {
          this.asset = JSON.parse(JSON.stringify(response));
          if (!this.asset.tags.settings) {
            this.asset.tags.settings = {
              normal_mode: {
                frequency: 60,
              },
              turbo_mode: {
                frequency: 1,
                timeout_time: 120,
              },
            };
          }
          if (!this.asset.tags.settings.normal_mode) {
            this.asset.tags.settings.normal_mode = {
              frequency: 60,
            };
          }
          if (!this.asset.tags.settings.turbo_mode) {
            this.asset.tags.settings.turbo_mode = {
              frequency: 1,
              timeout_time: 120,
            };
          }
          if (this.componentState === this.constantData.NON_IP_ASSET) {
            this.onClickOfTab(this.selectedTab);
          } else {
            this.onClickOfTab(this.selectedTab);
          }
        })
    );
  }

  getAssetTwinData() {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.assetService
          .getAssetTwin(
            this.contextApp.app,
            this.componentState === this.constantData.NON_IP_ASSET ? this.asset.gateway_id : this.asset.asset_id
          )
          .subscribe((response) => {
            this.assetTwin = response;
            if (!this.assetTwin.twin_properties) {
              this.assetTwin.twin_properties = {};
            }
            if (!this.assetTwin.twin_properties.reported) {
              this.assetTwin.twin_properties.reported = {};
            }
            if (!this.assetTwin.twin_properties.reported.registered_assets) {
              this.assetTwin.twin_properties.reported.registered_assets = {};
            }
            if (!this.assetTwin.twin_properties.reported.apps) {
              this.assetTwin.twin_properties.reported.apps = {};
            }
            if (!this.assetTwin.twin_properties.reported.system_apps) {
              this.assetTwin.twin_properties.reported.system_apps = {};
            }
            resolve();
          })
      );
    });
  }

  async onClickOfTab(type) {
    this.selectedTab = undefined;
    await this.getAssetTwinData();
    this.selectedTab = type;
  }

  testConnectionWithGateway() {
    this.testConnectionMessage = undefined;
    this.isTestConnectionAPILoading = true;
    const obj = {
      method: 'test_gateway_connection',
      app: this.contextApp.app,
      gateway_id: this.asset.asset_id,
      message: {},
      job_type: 'DirectMethod',
      request_type: 'Test Connection',
      job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
      sub_job_id: null,
    };
    obj.sub_job_id = obj.job_id + '_1';
    this.subscriptions.push(
      this.assetService.callAssetMethod(obj, obj.app, this.asset?.gateway_id || this.asset.asset_id).subscribe(
        (response: any) => {
          if (response?.asset_response?.status?.toLowerCase() === 'connected') {
            this.testConnectionMessage =
              (this.asset.type === this.constantData.IP_ASSET ? 'Asset' : 'Gateway') + ' connection is successful';
            this.assetService.refreshRecentJobs.emit();
          }
          this.isTestConnectionAPILoading = false;
        },
        (error) => {
          this.testConnectionMessage =
            (this.asset.type === this.constantData.IP_ASSET ? 'Asset' : 'Gateway') + ' is not connected';
          this.assetService.refreshRecentJobs.emit();
          this.isTestConnectionAPILoading = false;
        }
      )
    );
  }
}
