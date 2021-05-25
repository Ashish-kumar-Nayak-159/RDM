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
  @Input() pageType: string;
  contextApp: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.c2dMsgFilter.displayOptions = true;
    this.c2dMsgFilter.tableType = 'All';
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.c2dMsgFilter.device_id = this.device.device_id;
    this.c2dMsgFilter.epoch = true;
    this.c2dMsgFilter.app = this.contextApp.app;
    this.c2dMsgFilter.count = 10;
    if (this.type === 'feedback') {
      this.c2dMsgFilter.tableType = 'Message';
      this.loadMessageDetail(this.message, false);
      this.isFilterSelected = true;
    } else if (this.type === 'response') {
      this.c2dMsgFilter.tableType = 'Message';
      this.loadResponseDetail(this.message, false);
      this.isFilterSelected = true;
    } else {
      this.c2dMsgFilter.tableType = 'All';
      this.loadFromCache();
    }
    this.previousMsgFilter = JSON.parse(JSON.stringify(this.c2dMsgFilter));
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.c2dMsgFilter.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.c2dMsgFilter.from_date = dateObj.from_date;
        this.c2dMsgFilter.to_date = dateObj.to_date;
      } else {
        this.c2dMsgFilter.from_date = item.from_date;
        this.c2dMsgFilter.to_date = item.to_date;
      }
    }
    this.searchTableData(this.c2dMsgFilter, false);
  }

  searchTableData(filterObj, updateFilterObj = true) {
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
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
      pagefilterObj['from_date'] = obj.from_date;
      pagefilterObj['to_date'] = obj.to_date;
      pagefilterObj['dateOption'] = obj.dateOption;
      this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, pagefilterObj);
    }
    delete obj.dateOption;
    obj.app = this.device.app;
    if (obj.tableType !== 'All') {
      obj.job_type = obj.tableType;
    }
    this.c2dMsgFilter = filterObj;
    this.previousMsgFilter = JSON.parse(JSON.stringify(filterObj));
    this.searchMessages(obj);
  }

  searchMessages(filterObj) {
    this.c2dMsgs = [];
    delete filterObj.tableType;
    delete filterObj.displayOptions;
    this.apiSubscriptions.push(this.deviceService.getDeviceC2DMessages(filterObj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.c2dMsgs = response.data;
          this.c2dMsgs.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.request_date));
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
      from_date: null,
      to_date: null,
      epoch: true,
      job_type: message.job_type
    };
    if (message.job_type === 'Message') {
      const epoch =  message.request_date ? this.commonService.convertDateToEpoch(message.request_date) : message.timestamp;
      obj.from_date = epoch ? (epoch - 5) : null;
      obj.to_date = (epoch ? (epoch + (message?.metadata?.expire_in_min ? message.metadata.expire_in_min * 60 : 300)) : null) + 5;
    } else {
      const epoch =  this.commonService.convertDateToEpoch(message.request_date);
      obj.from_date = epoch ? (epoch - 300) : null;
      obj.to_date = (epoch ? (epoch + 300) : null);
    }
    this.apiSubscriptions.push(this.deviceService.getMessageRequestDetails(message.id, this.contextApp.app, obj).subscribe(
      (response: any) => {
        if (openModalFlag) {
        this.c2dMessageDetail = response;
        this.openC2DMessageModal();
        } else {
          const arr = [];
          response.local_created_date = this.commonService.convertUTCDateToLocal(response.request_date);
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
    console.log(message.job_type);
    if ((this.type !== 'response' || !openModalFlag) && message.job_type !== 'DirectMethod') {
      const obj = {
        sub_job_id: message.sub_job_id,
        from_date: null,
        to_date: null,
        epoch: true
      };
      const epoch =  message.request_date ? this.commonService.convertDateToEpoch(message.request_date) : message.timestamp;
      obj.from_date = epoch ? (epoch - 5) : null;
      obj.to_date = (moment().utc()).unix();
      this.apiSubscriptions.push(this.deviceService.getMessageResponseDetails(this.contextApp.app, obj).subscribe(
        (response: any) => {
          if (response.data) {
            if (openModalFlag) {
              this.c2dResponseDetail = response.data;
              this.openC2DMessageModal();
            } else {
              this.c2dMsgs = response.data;
              this.c2dMsgs.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
              this.isC2dMsgsLoading = false;
            }
          }
        }, error => this.isC2dMsgsLoading = false
      ));
    } else if ((this.type === 'response' && openModalFlag) || message.job_type === 'DirectMethod'){
      this.c2dResponseDetail = message;
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
