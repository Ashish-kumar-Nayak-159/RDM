import { ToasterService } from './../../../services/toaster.service';
import { filter } from 'rxjs/operators';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { ActivatedRoute } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-c2d-message',
  templateUrl: './c2d-message.component.html',
  styleUrls: ['./c2d-message.component.css']
})
export class C2dMessageComponent implements OnInit, OnDestroy {

  c2dMsgFilter: any = {};
  previousMsgFilter: any = {};
  c2dMsgs: any[] = [];
  isC2dMsgsLoading = false;
  @Input() device: Device = new Device();
  @Input() type = 'all';
  @Input() message: any;
  apiSubscriptions: Subscription[] = [];
  displayMode: string;
  isFilterSelected = false;
  c2dMessageDetail: any;
  c2dResponseDetail: any[];
  modalConfig: any;
  userData: any;
  selectedMessage: any;
  appName: string;
  pageType: string;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.c2dMsgFilter.displayOptions = true;
    this.c2dMsgFilter.tableType = 'C2D Message';

    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.c2dMsgFilter.device_id = this.device.device_id;
    this.c2dMsgFilter.epoch = true;
    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      if (this.type === 'feedback') {
        this.loadMessageDetail(this.message, false);
        this.isFilterSelected = true;
      } else if (this.type === 'response') {
        this.loadResponseDetail(this.message, false);
        this.isFilterSelected = true;
      }
    }));

    this.previousMsgFilter = JSON.parse(JSON.stringify(this.c2dMsgFilter));
  }

  searchTableData(filterObj) {
    this.isFilterSelected = true;
    this.isC2dMsgsLoading = true;
    const obj = {...filterObj};
    delete obj.displayOptions;
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'View ' + obj.tableType);
      this.isC2dMsgsLoading = false;
      this.isFilterSelected = false;
      return;
    }
    delete obj.dateOption;
    obj.app = this.device.app;
    this.c2dMsgFilter = filterObj;
    this.previousMsgFilter = JSON.parse(JSON.stringify(filterObj));
    if (obj.tableType === 'C2D Message') {
      this.searchC2DMessages(obj);
    } else if (obj.tableType === 'Direct Method') {
      this.searchDirectMethods(obj);
    }
  }

  searchC2DMessages(filterObj) {
    this.c2dMsgs = [];
    delete filterObj.tableType;
    delete filterObj.displayOptions;
    this.apiSubscriptions.push(this.deviceService.getDeviceC2DMessages(filterObj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.c2dMsgs = response.data;
          this.c2dMsgs.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date));
        }
        this.isC2dMsgsLoading = false;
      }, error => this.isC2dMsgsLoading = false
    ));
  }

  searchDirectMethods(filterObj) {
    delete filterObj.tableType;
    delete filterObj.displayOptions;
    this.apiSubscriptions.push(this.deviceService.getDeviceDirectMethods(filterObj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.c2dMsgs = response.data;
          this.c2dMsgs.forEach(item => {
            item.local_request_date = this.commonService.convertUTCDateToLocal(item.request_date);
            item.local_response_date = this.commonService.convertUTCDateToLocal(item.response_date);
          });
        }
        this.isC2dMsgsLoading = false;
      }, error => this.isC2dMsgsLoading = false
    ));
  }

  loadMessageDetail(message, openModalFlag) {
    if (!openModalFlag) {
      this.isC2dMsgsLoading = true;
    }
    this.selectedMessage = message;
    this.c2dMessageDetail = undefined;
    const obj = {
      device_id: this.device.device_id,
      from_date: null,
      to_date: null,
      epoch: true
    };

    let method;
    if (this.previousMsgFilter.tableType === 'Direct Method') {
      const epoch =  this.commonService.convertDateToEpoch(message.request_date);
      obj.from_date = epoch ? (epoch - 300) : null;
      obj.to_date = (epoch ? (epoch + 300) : null);
      method = this.deviceService.getDirectMethodJSON(message.id, this.appName, obj);
    } else {
      const epoch =  message.created_date ? this.commonService.convertDateToEpoch(message.created_date) : message.timestamp;
      obj.from_date = epoch ? (epoch - 5) : null;
      obj.to_date = (epoch ? (epoch + (message?.metadata?.expire_in_min ? message.metadata.expire_in_min * 60 : 300)) : null) + 5;
      method = this.deviceService.getC2dMessageJSON(message.message_id, this.appName, obj);
    }
    this.apiSubscriptions.push(method.subscribe(
      (response: any) => {
        if (openModalFlag) {
        this.c2dMessageDetail = response;
        this.openC2DMessageModal();
        } else {
          const arr = [];
          response.local_created_date = this.commonService.convertUTCDateToLocal(response.created_date);
          arr.push(response);
          this.c2dMsgs = arr;
          this.isC2dMsgsLoading = false;
        }
      }, error => this.isC2dMsgsLoading = false
    ));
  }

  loadResponseDetail(message, openModalFlag) {
    if (!openModalFlag) {
      this.isC2dMsgsLoading = true;
    }
    this.selectedMessage = message;
    this.c2dResponseDetail = [];
    if (this.type !== 'response' || !openModalFlag) {
      const obj = {
        correlation_id: message.message_id,
        app: this.appName,
        device_id: this.device.type !== CONSTANTS.IP_GATEWAY ? this.device.device_id : undefined,
        gateway_id: this.device.type === CONSTANTS.IP_GATEWAY ? this.device.device_id : undefined,
        from_date: null,
        to_date: null,
        epoch: true
      };
      const epoch =  message.created_date ? this.commonService.convertDateToEpoch(message.created_date) : message.timestamp;
      obj.from_date = epoch ? (epoch - 5) : null;
      obj.to_date = (moment().utc()).unix();
      this.apiSubscriptions.push(this.deviceService.getC2dResponseJSON(obj).subscribe(
        (response: any) => {
          if (response.data) {
            if (openModalFlag) {
              response.data.forEach(item => {
                this.c2dResponseDetail.push(item.message);
              });
              this.openC2DMessageModal();
            } else {
              this.c2dMsgs = response.data;
              this.c2dMsgs.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
              this.isC2dMsgsLoading = false;
            }
          }
        }, error => this.isC2dMsgsLoading = false
      ));
    } else if (this.type === 'response' && openModalFlag){
      this.c2dResponseDetail = message.message;
      this.openC2DMessageModal();
    }
  }

  openC2DMessageModal() {
    $('#c2dmessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true
    };
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#c2dmessageModal').modal('hide');
      this.c2dMessageDetail = undefined;
      this.c2dResponseDetail = undefined;
      this.selectedMessage = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }
}
