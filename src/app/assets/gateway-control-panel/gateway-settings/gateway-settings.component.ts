import { ToasterService } from './../../../services/toaster.service';
import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetService } from 'src/app/services/assets/asset.service';
import * as moment from 'moment';

@Component({
  selector: 'app-gateway-settings',
  templateUrl: './gateway-settings.component.html',
  styleUrls: ['./gateway-settings.component.css'],
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
  c2dJobFilter: any = {};
  c2dJobFilter1: any = {};
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.asset = JSON.parse(JSON.stringify(this.asset));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getAssetTwinData();
    this.getAssetData();
    this.c2dJobFilter.request_type = 'Test Connection';
    this.c2dJobFilter.job_type = 'DirectMethod';
    // this.c2dJobFilter1.request_type = 'Sync Rules';
    // this.c2dJobFilter1.job_type = 'Message';
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
            this.onClickOfTab('Manage Assets');
          } else {
            this.onClickOfTab('Test Connection');
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
