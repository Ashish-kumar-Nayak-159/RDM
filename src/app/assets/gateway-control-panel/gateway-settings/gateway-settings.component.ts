import { ToasterService } from './../../../services/toaster.service';
import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { AssetService } from 'src/app/services/assets/asset.service';
import * as moment from 'moment';

@Component({
  selector: 'app-gateway-settings',
  templateUrl: './gateway-settings.component.html',
  styleUrls: ['./gateway-settings.component.css']
})
export class GatewaySettingsComponent implements OnInit {

  @Input() asset: any;
  @Input() tileData: any;
  @Input() componentState: any;
  subscriptions: Subscription[] = [];
  contextApp: any;
  userData: any;
  selectedTab: string;
  isSaveSettingAPILoading = false;
  isTestConnectionAPILoading = false;
  testConnectionMessage: string;
  assetTwin: any;
  constantData = CONSTANTS;
  isRuleSyncAPILoading = false;
  rules: any[] = [];
  c2dJobFilter: any = {};
  c2dJobFilter1: any = {};
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.asset = JSON.parse(JSON.stringify(this.asset));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getAssetTwinData();
    this.getAssetData();
    this.c2dJobFilter.request_type = 'test_gateway_connection';
    this.c2dJobFilter.job_type = 'DirectMethod';
    this.c2dJobFilter1.request_type = 'set_device_rules';
    this.c2dJobFilter1.job_type = 'Message';
  }

  getAssetData() {
    this.subscriptions.push(
      this.assetService.getAssetDetailById(this.contextApp.app, this.asset.asset_id).subscribe(
      async (response: any) => {
        this.asset = JSON.parse(JSON.stringify(response));
        if (!this.asset.tags.settings) {
          this.asset.tags.settings = {
            normal_mode: {
              frequency: 60
            },
            turbo_mode: {
              frequency: 1,
              timeout_time: 120
            }
          };
        }
        if (!this.asset.tags.settings.normal_mode) {
          this.asset.tags.settings.normal_mode = {
            frequency: 60
        };
        }
        if (!this.asset.tags.settings.turbo_mode) {
          this.asset.tags.settings.turbo_mode = {
            frequency: 1,
            timeout_time: 120
          };
        }
        if (this.componentState === this.constantData.NON_IP_ASSET) {
          this.onClickOfTab('Register Properties');
        } else {
          this.onClickOfTab('Test Connection');
        }
      }));
  }

  getAssetTwinData() {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.assetService.getAssetTwin(this.contextApp.app,
          this.componentState === this.constantData.NON_IP_ASSET ? this.asset.gateway_id : this.asset.asset_id).subscribe(
          (response) => {
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
          }
        ));
    });
  }

  getEdgeRules() {
    return new Promise<void>((resolve1, reject) => {
    this.rules = [];
    this.isRuleSyncAPILoading = true;
    const obj = {
      type: 'Edge'
    };
    this.subscriptions.push(this.assetService.getRules(this.contextApp.app, this.asset.asset_id, obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.rules = response.data;
          console.log(this.rules);
        }
        resolve1();
      }, error => this.isRuleSyncAPILoading = false
    ));
    });
  }

  async syncRules() {
    await this.getEdgeRules();
    const obj = {
      asset_id: this.asset.type !== CONSTANTS.NON_IP_ASSET ? this.asset.asset_id : this.asset.gateway_id,
      message: {
        command: "set_device_rules",
        rules: this.rules
      },
      app: this.contextApp.app,
      timestamp:  moment().unix(),
      acknowledge: 'Full',
      expire_in_min: 2880,
      job_id: (this.asset.type !== CONSTANTS.NON_IP_ASSET ? this.asset.asset_id : this.asset.gateway_id)
      + '_' + this.commonService.generateUUID(),
      request_type: "set_device_rules",
      job_type: 'Message',
      sub_job_id: null
    };
    obj.sub_job_id = obj.job_id + '_1';
    this.subscriptions.push(
      this.assetService.sendC2DMessage(obj, this.contextApp.app,
        this.asset.type !== CONSTANTS.NON_IP_ASSET ? this.asset.asset_id : this.asset.gateway_id).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Sync Rules');
          this.assetService.refreshRecentJobs.emit();
          this.isRuleSyncAPILoading = false;
        }, error => {
          this.toasterService.showError(error.message, 'Sync Rules');
          this.assetService.refreshRecentJobs.emit();
          this.isRuleSyncAPILoading = false;
        }
      )
    );
  }

  onClickOfTab(type) {
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
      request_type: 'test_gateway_connection',
      job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
      sub_job_id: null
    };
    obj.sub_job_id = obj.job_id + '_1';
    this.subscriptions.push(
      this.assetService.callAssetMethod(obj, obj.app,
        this.asset?.gateway_id || this.asset.asset_id).subscribe(
        (response: any) => {
          if (response?.asset_response?.status?.toLowerCase() === 'connected') {
            this.testConnectionMessage = 'Gateway connection is successful';
            this.assetService.refreshRecentJobs.emit();
          }
          this.isTestConnectionAPILoading = false;
        }, error => {
          this.testConnectionMessage = 'Gateway is not connected';
          this.assetService.refreshRecentJobs.emit();
          this.isTestConnectionAPILoading = false;
        }
      )
    );
  }
}
