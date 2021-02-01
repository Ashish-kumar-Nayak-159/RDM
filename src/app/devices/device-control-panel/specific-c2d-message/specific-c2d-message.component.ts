import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
export class SpecificC2dMessageComponent implements OnInit, OnDestroy {

  @Input() pageType: any;
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
  apiSubscriptions: Subscription[] = [];
  timerInterval: any;
  appName: any;
  timerObj: any;
  listName: string;
  devices: any[] = [];
  controlWidgets: any[] = [];
  deviceMethods: any[] = [];
  selectedWidget: any;
  jsonModelKeys: any[] = [];

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
      this.listName = params.get('listName');
      this.listName = this.listName.slice(0, -1);
      this.c2dMessageData = {
        device_id: this.device.device_id,
        gateway_id: this.device.gateway_id,
        app: this.appName,
        timestamp:  moment().unix(),
        message: null,
        metadata: {
        acknowledge: 'Full',
        expire_in_min: 1,
        type: this.pageType.includes('configure') ? 'configuration_widget' : 'control_widget'
        }
      };
      if (this.listName === 'gateway') {
        this.getDevicesListByGateway();
      }
      if (this.pageType.includes('control')) {
        this.getControlWidgets();
      } else {
        this.getConfigureWidgets();
      }
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
    this.apiSubscriptions.push(this.deviceTypeService.getThingsModelControlWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data.filter(widget => widget.metadata.communication_technique === 'C2D Message');
        }
      }
    ));
  }

  getConfigureWidgets() {
    const obj = {
      app: this.appName,
      device_type: this.device.tags?.device_type
    };
    this.apiSubscriptions.push(this.deviceTypeService.getThingsModelConfigurationWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data.filter(widget => widget.metadata.communication_technique === 'C2D Message');
        }
      }
    ));
  }

  getThingsModelDeviceMethod() {
    // this.deviceMethods = {};
    const obj = {
      app: this.appName,
      name: this.device.tags?.device_type
    };
    this.apiSubscriptions.push(this.deviceTypeService.getThingsModelDeviceMethods(obj).subscribe(
      (response: any) => {
        response.device_methods.forEach(item => item.type = 'device_method');
        this.controlWidgets = [...response.device_methods, ...this.controlWidgets];
      }
    ));
  }

  onSwitchValueChange(event, index) {
    console.log(event);
    console.log(event.target.value);
  }

  onChangeOfDropdownData() {
    this.jsonModelKeys = [];
    const keys =  Object.keys(this.selectedWidget.json);
    const index = keys.findIndex(key => key === 'timestamp');
    keys.splice(index, 1);
    keys.forEach(key => {
      const obj = {
        key,
        json: {},
        name: null,
        value: null
      };
      this.selectedWidget.properties.forEach(prop => {
        if (prop.json_key === key) {
          obj.name = prop.name;
          obj.json = this.selectedWidget.json[key];
          if (obj.json['type'] === 'boolean') {
            obj.value = obj.json['defaultValue'] === obj.json['trueValue'] ? true : false;
          } else {
            obj.value = this.selectedWidget.json[key].defaultValue;
          }
        }
      });
      this.jsonModelKeys.splice(this.jsonModelKeys.length, 0, obj);
    });
    console.log(this.jsonModelKeys);
  }

  getDevicesListByGateway() {
    this.devices = [];
    const obj = {
      gateway_id: this.device.device_id,
      app: this.appName
    };
    this.apiSubscriptions.push(this.deviceService.getNonIPDeviceList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.devices = response.data;
          this.c2dMessageData.device_id = this.devices.length > 0 ? this.devices[0].device_id : undefined;
        }
      }, errror => {}
    ));
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
    if (this.listName === 'gateway') {
      this.c2dMessageData.gateway_id = this.device.device_id;
    }
    this.sentMessageData = undefined;
    this.c2dMessageData.message = {};
    this.jsonModelKeys.forEach(item => {
      if (item.value !== null || item.value !== undefined) {
        if (item.json.type === 'boolean') {
          this.c2dMessageData.message[item.key] = item.value ? item.json.trueValue : item.json.falseValue;
        } else {
          this.c2dMessageData.message[item.key] = item.value;
        }
      }
    });
    this.c2dMessageData.message['timestamp'] = this.c2dMessageData.timestamp;
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
    console.log(this.sentMessageData);
    this.apiSubscriptions.push(this.deviceService.sendC2DMessage(this.sentMessageData, this.appName).subscribe(
      (response: any) => {
        this.isMessageValidated = undefined;
        this.sendMessageResponse = 'Successfully sent.';
        this.sendMessageStatus = 'success';
        this.toasterService.showSuccess('C2D message sent successfully', 'Send C2D Message');
        this.isSendC2DMessageAPILoading = false;
        const expiryDate = moment().add(this.sentMessageData.metadata.expire_in_min, 'minutes').toDate();
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
    ));
  }

  verifyQueueMessages() {
    this.noOfMessageInQueue = null;
    let params = new HttpParams();
    params = params.set(this.device.tags.category === CONSTANTS.IP_GATEWAY ? 'gateway_id' : 'device_id', this.device.device_id);
    // params = params.set('app', this.appName);
    this.apiSubscriptions.push(this.deviceService.getQueueMessagesCount(params, this.appName).subscribe(
      (response: any) => {
        this.noOfMessageInQueue = response.count;
      }
    ));
  }

  purgeQueueMessages() {
    let params = new HttpParams();
    params = params.set(this.device.tags.category === CONSTANTS.IP_GATEWAY ? 'gateway_id' : 'device_id', this.device.device_id);
    // params = params.set('app', this.appName);
    this.apiSubscriptions.push(this.deviceService.purgeQueueMessages(params, this.appName).subscribe(
      response => {
        this.toasterService.showSuccess('Messages purged successfully', 'Purge Messages');
        this.verifyQueueMessages();
      }, error => this.toasterService.showError('Error in purging messages', 'Purge messages')
    ));
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
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }


}
