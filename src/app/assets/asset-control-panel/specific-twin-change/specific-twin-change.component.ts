import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-specific-twin-change',
  templateUrl: './specific-twin-change.component.html',
  styleUrls: ['./specific-twin-change.component.css'],
})
export class SpecificTwinChangeComponent implements OnInit {
  @Input() pageType: any;
  @Input() componentState: any;
  @Input() asset: Asset = new Asset();
  c2dMessageData: any = {};
  userData: any;
  isMessageValidated: string;
  iscalledTwinChangeMethod = false;
  sendMessageResponse: string;
  sendMessageStatus: string;
  messageIdInterval: any;
  noOfMessageInQueue: number;
  displayType: string;
  sentMessageData: any;
  remainingTime: any;
  apiSubscriptions: Subscription[] = [];
  timerInterval: any;
  timerObj: any;
  assets: any[] = [];
  constantData = CONSTANTS;
  controlWidgets: any[] = [];
  assetMethods: any[] = [];
  @Input() selectedWidget: any;
  @Input() jsonModelKeys: any[] = [];
  contextApp: any;
  selectedSlaveValue: any;
  selectedAssetValue: any;
  slaves = [];
  selectedLevel = 0;
  constructor(
    private toasterService: ToasterService,
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private assetModelService: AssetModelService
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.displayType = 'compose';
    this.c2dMessageData = {
      asset_id: this.asset.asset_id,
      gateway_id: this.asset.gateway_id || this.asset.tags.gateway_id,
      desired_properties: {},
      job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
      request_type: this.selectedWidget.name,
    };
    this.c2dMessageData.sub_job_id = this.c2dMessageData.job_id + '_1';
    if (this.asset?.type === CONSTANTS.IP_GATEWAY) {
      this.getAssetsListByGateway();
    }
    if (this.selectedWidget?.metadata?.widget_type === 'Slave') {
      this.getSlaveData();
    }
    // this.messageIdInterval = setInterval(() => {
    //   this.c2dMessageData.message_id = this.asset.asset_id + '_' + moment().unix();
    // }, 1000);
  }

  getSlaveData() {
    this.slaves = [];
    this.assetService.getAssetSlaveDetails({}, this.asset.asset_id).subscribe((response: any) => {
      this.slaves = response.data;
    });
  }

  getAssetsModelAssetMethod() {
    // this.assetMethods = {};
    const obj = {
      app: this.contextApp.app,
      name: this.asset.tags?.asset_model,
    };
    this.apiSubscriptions.push(
      this.assetModelService.getAssetsModelAssetMethods(obj).subscribe((response: any) => {
        response.direct_methods.forEach((item) => (item.type = 'asset_method'));
        this.controlWidgets = [...response.direct_methods, ...this.controlWidgets];
      })
    );
  }

  getAssetsListByGateway() {
    this.assets = [];
    const obj = {
      gateway_id: this.asset.asset_id,
      app: this.contextApp.app,
      type: CONSTANTS.NON_IP_ASSET,
    };
    this.apiSubscriptions.push(
      this.assetService.getIPAssetsAndGateways(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.assets = response.data;
            this.c2dMessageData.asset_id = this.asset.asset_id;
          }
        }
      )
    );
  }

  callTwinChange() {
    this.iscalledTwinChangeMethod = true;
    const obj = JSON.parse(JSON.stringify(this.c2dMessageData));
    obj['desired_properties'] = {};
    obj.desired_properties['slave_id'] = this.selectedSlaveValue;
    obj.desired_properties['asset_id'] = this.selectedAssetValue;
    this.jsonModelKeys.forEach((item) => {
      if (item.value !== null || item.value !== undefined) {
        if (item.json.type === 'boolean') {
          obj.desired_properties[item.key] = item.value ? item.json.trueValue : item.json.falseValue;
        } else {
          obj.desired_properties[item.key] = item.value;
        }
      }
    });
    if (!obj.desired_properties) {
      this.toasterService.showError('Please type JSON in given box', 'Validate Message Detail');
      this.iscalledTwinChangeMethod = false;
      return;
    }
    this.apiSubscriptions.push(
      this.assetService.updateAssetTwin(this.contextApp.app, this.asset.asset_id, obj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess('Request sent to Asset Successfully', 'Sent Twin Change Message');
          this.iscalledTwinChangeMethod = false;
        },
        (error) => {
          this.toasterService.showError(error.message, 'Sent Twin Change Message');
          this.iscalledTwinChangeMethod = false;
        }
      )
    );
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
