import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-specific-c2d-message',
  templateUrl: './specific-c2d-message.component.html',
  styleUrls: ['./specific-c2d-message.component.css']
})
export class SpecificC2dMessageComponent implements OnInit {

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
  appName: any;
  timerObj: any;
  pageType: string;
  devices: any[] = [];
  controlWidgets: any[] = [];
  deviceMethods: any[] = [];
  selectedWidget: any;

  constructor(
    private toasterService: ToasterService,
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private deviceTypeService: DeviceTypeService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.displayType = 'compose';
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.c2dMessageData = {
        device_id: this.device.device_id,
        gateway_id: this.device.gateway_id,
        app: this.appName,
        timestamp:  moment().unix(),
        message: null,
        acknowledge: 'Full',
        expire_in_min: 1
      };
      if (this.pageType === 'gateway') {
        this.getDevicesListByGateway();
      }
      this.getControlWidgets();
    });

    // this.messageIdInterval = setInterval(() => {
    //   this.c2dMessageData.message_id = this.device.device_id + '_' + moment().unix();
    // }, 1000);
  }

  getControlWidgets() {
    const obj = {
      app: this.appName,
      device_type: this.device.tags?.device_type
    };
    this.deviceTypeService.getThingsModelControlWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          response.data.forEach(item => item.type = 'control_widget');
          this.controlWidgets = response.data;
          this.getThingsModelDeviceMethod();
        }
      }
    );
  }

  getThingsModelDeviceMethod() {
    // this.deviceMethods = {};
    const obj = {
      app: this.appName,
      name: this.device.tags?.device_type
    };
    this.deviceTypeService.getThingsModelDeviceMethods(obj).subscribe(
      (response: any) => {
        response.device_methods.forEach(item => item.type = 'device_method');
        this.controlWidgets = [...response.device_methods, ...this.controlWidgets];
      }
    );
  }

  onChangeOfDropdownData() {

  }

  getDevicesListByGateway() {
    this.devices = [];
    const obj = {
      gateway_id: this.device.device_id,
      app: this.appName
    };
    this.deviceService.getNonIPDeviceList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.devices = response.data;
          this.c2dMessageData.device_id = this.devices.length > 0 ? this.devices[0].device_id : undefined;
        }
      }, errror => {}
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
      console.log('in catch');
      this.isMessageValidated = 'invalid';
    }
  }

  sentC2DMessage() {
    this.displayType = 'compose';
    this.isMessageValidated = undefined;
    this.remainingTime = null;
    this.c2dMessageData.message_id = this.c2dMessageData.device_id + '_' + this.c2dMessageData.timestamp;
    if (this.pageType === 'gateway') {
      this.c2dMessageData.gateway_id = this.device.device_id;
    }
    this.sentMessageData = undefined;
    this.c2dMessageData.message = this.selectedWidget.json_model;
    if (!this.c2dMessageData.message) {
      this.toasterService.showError('Please type JSON in given box', 'Validate Message Detail');
      return;
    }
    try {
      this.sentMessageData = JSON.parse(JSON.stringify(this.c2dMessageData));
      console.log(this.sentMessageData);
     // this.sentMessageData.message = JSON.parse(this.sentMessageData.message);
    } catch (e) {
      this.isMessageValidated = 'invalid';
      this.sentMessageData = undefined;
      return;
    }
    this.isSendC2DMessageAPILoading = true;
    this.deviceService.sendC2DMessage(this.sentMessageData, this.appName).subscribe(
      (response: any) => {
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
      }, error => {
        this.sendMessageResponse = error.message && error.message.includes('Queue') ? 'Device Queue size exceeded.' : 'Not Successful';
        this.sendMessageStatus = 'error';
        this.toasterService.showError(error.message, 'Send C2D Message');
        this.isSendC2DMessageAPILoading = false;
        this.sentMessageData = undefined;
      }
    );
  }

  verifyQueueMessages() {
    this.noOfMessageInQueue = null;
    let params = new HttpParams();
    params = params.set(this.device.tags.category === CONSTANTS.IP_GATEWAY ? 'gateway_id' : 'device_id', this.device.device_id);
    params = params.set('app', this.appName);
    this.deviceService.getQueueMessagesCount(params).subscribe(
      (response: any) => {
        this.noOfMessageInQueue = response.count;
      }
    );
  }

  purgeQueueMessages() {
    let params = new HttpParams();
    params = params.set(this.device.tags.category === CONSTANTS.IP_GATEWAY ? 'gateway_id' : 'device_id', this.device.device_id);
    params = params.set('app', this.appName);
    this.deviceService.purgeQueueMessages(params).subscribe(
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
        seconds
      };
    }
    return {
      hours,
      minutes,
      seconds
    };
}

  ngOnDestroy() {
    clearInterval(this.messageIdInterval);
    clearInterval(this.timerInterval);
  }


}
