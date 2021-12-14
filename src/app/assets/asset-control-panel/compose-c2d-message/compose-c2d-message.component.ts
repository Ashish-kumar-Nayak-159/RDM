import { HttpParams } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as datefns from 'date-fns';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from './../../../services/common.service';
import { ToasterService } from './../../../services/toaster.service';

@Component({
  selector: 'app-compose-c2d-message',
  templateUrl: './compose-c2d-message.component.html',
  styleUrls: ['./compose-c2d-message.component.css'],
})
export class ComposeC2DMessageComponent implements OnInit, OnDestroy {
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
  subscriptions: Subscription[] = [];
  timerInterval: any;
  appName: any;
  timerObj: any;
  listName: string;
  assets: any[] = [];
  constructor(
    private toasterService: ToasterService,
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.displayType = 'compose';
    this.subscriptions.push(
      this.route.paramMap.subscribe((params) => {
        this.appName = params.get('applicationId');
        this.listName = params.get('listName');
        this.listName = this.listName.slice(0, -1);
        this.c2dMessageData = {
          asset_id: this.asset.asset_id,
          gateway_id: this.asset.gateway_id,
          app: this.appName,
          timestamp: datefns.getUnixTime(new Date()),
          message: null,
          acknowledge: 'Full',
          expire_in_min: 1,
        };
        if (this.listName === 'gateway') {
          this.getAssetsListByGateway();
        }
      })
    );
    // this.messageIdInterval = setInterval(() => {
    //   this.c2dMessageData.message_id = this.asset.asset_id + '_' + moment().unix();
    // }, 1000);
  }

  getAssetsListByGateway() {
    this.assets = [];
    const obj = {
      gateway_id: this.asset.asset_id,
      app: this.appName,
      type: CONSTANTS.NON_IP_ASSET,
    };
    this.subscriptions.push(
      this.assetService.getIPAssetsAndGateways(obj, this.appName).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.assets = response.data;
            this.c2dMessageData.asset_id = this.assets.length > 0 ? this.assets[0].asset_id : undefined;
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
    if (!this.c2dMessageData.message) {
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
    this.displayType = 'compose';
    this.isMessageValidated = undefined;
    this.remainingTime = null;
    this.c2dMessageData.message_id = this.c2dMessageData.asset_id + '_' + this.c2dMessageData.timestamp;
    if (this.listName === 'gateway') {
      this.c2dMessageData.gateway_id = this.asset.asset_id;
    }
    this.sentMessageData = undefined;
    this.c2dMessageData.request_type = 'Custom';
    if (!this.c2dMessageData.message) {
      this.toasterService.showError('Please type JSON in given box', 'Validate Message Detail');
      return;
    }
    try {
      this.sentMessageData = JSON.parse(JSON.stringify(this.c2dMessageData));
      this.sentMessageData.message = JSON.parse(this.sentMessageData.message);
    } catch (e) {
      this.isMessageValidated = 'invalid';
      this.sentMessageData = undefined;
      return;
    }
    this.isSendC2DMessageAPILoading = true;
    this.subscriptions.push(
      this.assetService
        .sendC2DMessage(this.sentMessageData, this.appName, this.asset?.gateway_id || this.asset.asset_id)
        .subscribe(
          (response: any) => {
            this.isMessageValidated = undefined;
            this.sendMessageResponse = 'Successfully sent.';
            this.sendMessageStatus = 'success';
            this.toasterService.showSuccess('C2D message sent successfully', 'Send C2D Message');
            this.isSendC2DMessageAPILoading = false;
            const expiryDate = datefns.addMinutes(new Date(),this.sentMessageData.expire_in_min);
            this.timerInterval = setInterval(() => {
              const time = Math.floor((expiryDate.getTime() - new Date().getTime()) / 1000);
              this.timerObj = this.dhms(time);
            }, 1000);
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

  verifyQueueMessages() {
    this.noOfMessageInQueue = null;
    let params = new HttpParams();
    params = params.set(
      this.asset.tags.category === CONSTANTS.IP_GATEWAY ? 'gateway_id' : 'asset_id',
      this.asset.asset_id
    );
    // params = params.set('app', this.appName);
    this.subscriptions.push(
      this.assetService.getQueueMessagesCount(params, this.appName).subscribe((response: any) => {
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
    // params = params.set('app', this.appName);
    this.subscriptions.push(
      this.assetService.purgeQueueMessages(params, this.appName).subscribe(
        (response) => {
          this.toasterService.showSuccess('Messages purged successfully', 'Purge Messages');
          this.verifyQueueMessages();
        },
        (error) => this.toasterService.showError('Error in purging messages', 'Purge messages')
      )
    );
  }

  onClickOfFeedback() {
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
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
