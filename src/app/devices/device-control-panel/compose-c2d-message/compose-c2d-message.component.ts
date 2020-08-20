import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import * as moment from 'moment';
import { ToasterService } from './../../../services/toaster.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CommonService } from './../../../services/common.service';
import { CONSTANTS } from './../../../app.constants';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription, interval } from 'rxjs';


@Component({
  selector: 'app-compose-c2d-message',
  templateUrl: './compose-c2d-message.component.html',
  styleUrls: ['./compose-c2d-message.component.css']
})
export class ComposeC2DMessageComponent implements OnInit, OnDestroy {

  @Input() device: Device = new Device();
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
  apiSubscription: Subscription[] = [];
  timerInterval: any;
  constructor(
    private toasterService: ToasterService,
    private deviceService: DeviceService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.displayType = 'compose';
    this.c2dMessageData = {
      device_id: this.device.device_id,
      app: this.userData.app,
      message_id: this.device.device_id + '_' + moment().unix(),
      message: null,
      acknowledge: 'Full',
      expire_in_min: 1
    };
    this.messageIdInterval = setInterval(() => {
      this.c2dMessageData.message_id = this.device.device_id + '_' + moment().unix();
    }, 1000);
  }

  validateMessage() {
    this.displayType = 'compose';
    this.remainingTime = null;
    this.sentMessageData = undefined;
    this.isMessageValidated = undefined;
    if (!this.c2dMessageData.message) {
      this.toasterService.showError('Please type JSON in given box', "Validate Message Detail");
      return;
    }
    try {
      this.isMessageValidated = 'valid';
      JSON.parse(this.c2dMessageData.message);
    } catch (e) {
      console.log('in catch');
        this.isMessageValidated = 'invalid';
    }
  }

  sentC2DMessage() {
    this.displayType = 'compose';
    this.isMessageValidated = undefined;
    this.remainingTime = null;
    this.sentMessageData = undefined;
    if (!this.c2dMessageData.message) {
      this.toasterService.showError('Please type JSON in given box', "Validate Message Detail");
      return;
    }
    this.sentMessageData = JSON.parse(JSON.stringify(this.c2dMessageData));
    this.sentMessageData.message = JSON.parse(this.sentMessageData.message);
    this.isSendC2DMessageAPILoading = true;
    this.deviceService.sendC2DMessage(this.sentMessageData, this.userData.app).subscribe(
      (response: any) => {
        this.sendMessageResponse = 'Successfully  sent.';
        this.sendMessageStatus = 'success';
        this.toasterService.showSuccess('C2D message sent successfully', 'Send C2D Message');
        this.isSendC2DMessageAPILoading = false;
        const expiryDate = moment().add(this.sentMessageData.expire_in_min, 'minutes').toDate();
        this.timerInterval = setInterval(() => {
          const time = Math.floor((expiryDate.getTime() - new Date().getTime()) / 1000);
          this.remainingTime = this.dhms(time);
        }, 1000);
      }, error => {
        this.sendMessageResponse = error.message && error.message.includes('Queue') ? 'Device Queue size exceeded.': 'Not Successful';
        this.sendMessageStatus = 'error';
        this.toasterService.showError(error.message, 'Send C2D Message');
        this.isSendC2DMessageAPILoading = false;
      }
    );
  }

  verifyQueueMessages() {
    this.noOfMessageInQueue = null;
    this.deviceService.getQueueMessagesCount(this.device.device_id, this.userData.app).subscribe(
      (response: any) => {
        this.noOfMessageInQueue = response.count;
      }
    );
  }

  purgeQueueMessages() {
    this.deviceService.purgeQueueMessages(this.device.device_id, this.userData.app).subscribe(
      response => {
        this.toasterService.showSuccess('Messages purged successfully', 'Purge Messages');
        this.verifyQueueMessages();
      }, error => this.toasterService.showError('Error in purging messages', 'Purge messages')
    );
  }

  onClickOfFeedback() {
    this.displayType = undefined;
    if (!this.sentMessageData) {
      this.displayType = 'compose';
      this.toasterService.showError('Please send the message first', 'C2D Feedback');
      return;
    }
    this.displayType = 'feedback';
  }

  onClickOfResponse() {
    this.displayType = undefined;
    if (!this.sentMessageData) {
      this.displayType = 'compose';
      this.toasterService.showError('Please send the message first', 'C2D Response');
      return;
    }
    this.displayType = 'response';
  }

  dhms(t) {
    let days;
    let hours;
    let minutes;
    let seconds;
    days = Math.floor(t / 86400);
    t -= days * 86400;
    hours = Math.floor(t / 3600) % 24;
    t -= hours * 3600;
    minutes = Math.floor(t / 60) % 60;
    t -= minutes * 60;
    seconds = t % 60;
    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      clearInterval(this.timerInterval);
      return 'Message Expired';
    }
    return [
        days + 'd',
        hours + 'h',
        minutes + 'm',
        seconds + 's'
    ].join(' ');
}

  ngOnDestroy() {
    clearInterval(this.messageIdInterval);
    clearInterval(this.timerInterval);
  }

}
