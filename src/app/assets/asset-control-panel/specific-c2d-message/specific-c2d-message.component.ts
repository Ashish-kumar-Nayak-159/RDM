import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-specific-c2d-message',
  templateUrl: './specific-c2d-message.component.html',
  styleUrls: ['./specific-c2d-message.component.css'],
})
export class SpecificC2dMessageComponent implements OnInit, OnDestroy {
  @Input() pageType: any;
  @Input() componentState: any;
  @Input() asset: Asset = new Asset();
  c2dMessageData: any = {};
  userData: any;
  isMessageValidated: string;
  isSendC2DMessageAPILoading = false;
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
      timestamp: moment().unix(),
      message: null,
      job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
      acknowledge: 'Full',
      expire_in_min: 1,
      request_type: this.selectedWidget.name,
    };
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
    this.assetService.getAssetSlaveDetails(this.contextApp.app, this.asset.asset_id, {}).subscribe((response: any) => {
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

  validateMessage() {
    this.displayType = 'compose';
    this.remainingTime = null;
    this.sentMessageData = undefined;
    this.isMessageValidated = undefined;
    if (!this.selectedWidget.json_model) {
      this.toasterService.showError('Please type JSON in given box', 'Validate Message Detail');
      return;
    }
    try {
      this.isMessageValidated = 'valid';
      JSON.parse(this.c2dMessageData.message);
    } catch (e) {
      this.isMessageValidated = 'invalid';
    }
  }

  sentC2DMessage() {
    this.selectedLevel = 1;
    this.displayType = 'compose';
    this.isMessageValidated = undefined;
    this.remainingTime = null;
    const obj = JSON.parse(JSON.stringify(this.c2dMessageData));
    // this.c2dMessageData.job_id = this.c2dMessageData.asset_id + '_' + this.commonService.generateUUID();
    obj.sub_job_id = obj.job_id + '_1';
    if (this.componentState === CONSTANTS.IP_GATEWAY) {
      obj.gateway_id = this.asset.asset_id;
    }
    this.sentMessageData = undefined;
    obj.message = {};
    obj.message['slave_id'] = this.selectedSlaveValue;
    obj.message['asset_id'] = this.selectedAssetValue;
    this.jsonModelKeys.forEach((item) => {
      if (item.value !== null || item.value !== undefined) {
        if (item.json.type === 'boolean') {
          obj.message[item.key] = item.value ? item.json.trueValue : item.json.falseValue;
        } else {
          obj.message[item.key] = item.value;
        }
      }
    });
    // obj.request_type = 'Custom';
    // obj.message['timestamp'] = moment().unix();
    if (!obj.message) {
      this.toasterService.showError('Please type JSON in given box', 'Validate Message Detail');
      return;
    }
    try {
      obj.timestamp = moment().unix();
      this.sentMessageData = JSON.parse(JSON.stringify(obj));
      // this.sentMessageData.message = JSON.parse(this.sentMessageData.message);
    } catch (e) {
      this.isMessageValidated = 'invalid';
      this.sentMessageData = undefined;
      return;
    }
    delete obj.gateway_id;
    this.isSendC2DMessageAPILoading = true;
    this.apiSubscriptions.push(
      this.assetService
        .sendC2DMessage(this.sentMessageData, this.contextApp.app, this.asset?.gateway_id || this.asset.asset_id)
        .subscribe(
          (response: any) => {
            this.getMessageDetails();
            this.isMessageValidated = undefined;
            this.sendMessageResponse = 'Successfully sent.';
            this.sendMessageStatus = 'success';
            this.toasterService.showSuccess('C2D message sent successfully', 'Send C2D Message');
            this.isSendC2DMessageAPILoading = false;
            const expiryDate = moment().add(this.sentMessageData.expire_in_min, 'minutes').toDate();
            this.timerInterval = setInterval(() => {
              const time = Math.floor((expiryDate.getTime() - new Date().getTime()) / 1000);
              this.timerObj = this.dhms(time);
            }, 1000);
            this.onClickOfFeedback();
          },
          (error) => {
            this.sendMessageResponse =
              error.message && error.message.includes('Queue') ? 'Asset Queue size exceeded.' : 'Not Successful';
            this.sendMessageStatus = 'error';
            this.toasterService.showError(error.message, 'Send C2D Message');
            this.isSendC2DMessageAPILoading = false;
            this.sentMessageData = undefined;
          }
        )
    );
  }

  getMessageDetails() {
    const filterObj = {
      asset_id: this.asset.asset_id,
      from_date: null,
      to_date: null,
      epoch: true,
      job_type: 'Message',
      sub_job_id: this.sentMessageData.sub_job_id,
      app: this.contextApp.app,
    };
    const epoch = this.sentMessageData.timestamp;
    filterObj.from_date = epoch ? epoch - 5 : null;
    filterObj.to_date =
      (epoch ? epoch + (this.sentMessageData?.expire_in_min ? this.sentMessageData.expire_in_min * 60 : 300) : null) +
      5;
    this.apiSubscriptions.push(
      this.assetService.getAssetC2DMessages(filterObj).subscribe((response: any) => {
        if (response && response.data) {
          this.sentMessageData = response.data[0];
        }
      })
    );
  }

  verifyQueueMessages() {
    this.noOfMessageInQueue = null;
    let params = new HttpParams();
    params = params.set(
      this.asset.tags.category === CONSTANTS.IP_GATEWAY ? 'gateway_id' : 'asset_id',
      this.asset.asset_id
    );
    // params = params.set('app', this.contextApp.app);
    this.apiSubscriptions.push(
      this.assetService.getQueueMessagesCount(params, this.contextApp.app).subscribe((response: any) => {
        this.noOfMessageInQueue = response.count;
      })
    );
  }

  purgeQueueMessages() {
    let params = new HttpParams();
    params = params.set(
      this.asset.tags.category === CONSTANTS.IP_GATEWAY ? 'gateway_id' : 'asset_id',
      this.asset.asset_id
    );
    // params = params.set('app', this.contextApp.app);
    this.apiSubscriptions.push(
      this.assetService.purgeQueueMessages(params, this.contextApp.app).subscribe(
        (response) => {
          this.toasterService.showSuccess('Messages purged successfully', 'Purge Messages');
          this.verifyQueueMessages();
        },
        (error) => this.toasterService.showError('Error in purging messages', 'Purge messages')
      )
    );
  }

  onClickOfFeedback() {
    this.selectedLevel = 2;
    this.displayType = undefined;
    if (!this.sentMessageData) {
      this.displayType = 'compose';
      this.toasterService.showError('Please send the message first', 'C2D Feedback');
      return;
    }
    setTimeout(() => {
      this.displayType = 'feedback';
    }, 500);
  }

  onClickOfResponse() {
    this.selectedLevel = 3;
    this.displayType = undefined;
    if (!this.sentMessageData) {
      this.displayType = 'compose';
      this.toasterService.showError('Please send the message first', 'C2D Response');
      return;
    }
    setTimeout(() => {
      this.displayType = 'response';
    }, 500);
  }

  dhms(t) {
    let hours;
    let minutes;
    let seconds;
    hours = Math.floor(t / 3600) % 24;
    t -= hours * 3600;
    minutes = Math.floor(t / 60) % 60;
    t -= minutes * 60;
    seconds = t % 60;
    if (hours === 0 && minutes === 0 && seconds === 0) {
      clearInterval(this.timerInterval);
      this.onClickOfFeedback();
      return {
        hours,
        minutes,
        seconds,
      };
    }
    return {
      hours,
      minutes,
      seconds,
    };
  }

  ngOnDestroy() {
    clearInterval(this.messageIdInterval);
    clearInterval(this.timerInterval);
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
