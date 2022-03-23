import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JsonEditorOptions } from 'ang-jsoneditor';
import * as datefns from 'date-fns';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from './../../../services/toaster.service';
declare var $: any;
@Component({
  selector: 'app-c2d-message',
  templateUrl: './c2d-message.component.html',
  styleUrls: ['./c2d-message.component.css'],
})
export class C2dMessageComponent implements OnInit, OnDestroy {
  c2dMsgFilter: any = {};
  previousMsgFilter: any = {};
  c2dMsgs: any[] = [];
  isC2dMsgsLoading = false;
  @Input() asset: Asset = new Asset();
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
  isC2dMsgResponsesLoading = false;
  editorOptions: JsonEditorOptions;

  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
    this.editorOptions.statusBar = false;
    this.c2dMsgFilter.displayJobOptions = true;
    this.c2dMsgFilter.tableType = 'All';
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.c2dMsgFilter.asset_id = this.asset.asset_id;
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
        // this.c2dMsgFilter.last_n_secs = dateObj.to_date - dateObj.from_date;
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
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    }
    const obj = { ...filterObj };
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
    obj.app = this.asset.app;
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
    delete filterObj.displayJobOptions;
    this.apiSubscriptions.push(
      this.assetService.getAssetC2DMessages(filterObj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.c2dMsgs = response.data;
            this.c2dMsgs.forEach(
              (item) => (item.local_created_date = this.commonService.convertUTCDateToLocal(item.request_date))
            );
          }
          if (this.c2dMsgFilter.dateOption === 'Custom Range') {
            this.previousMsgFilter.dateOption = 'this selected range';
          }
          this.isC2dMsgsLoading = false;
        },
        (error) => (this.isC2dMsgsLoading = false)
      )
    );
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
      job_type: message.job_type,
    };
    if (message.job_type === 'Message') {
      const epoch = message.request_date
        ? this.commonService.convertDateToEpoch(message.request_date)
        : message.timestamp;
      obj.from_date = epoch ? epoch - 5 : null;
      obj.to_date =
        (epoch ? epoch + (message?.metadata?.expire_in_min ? message.metadata.expire_in_min * 60 : 300) : null) + 5;
    } else {
      const epoch = this.commonService.convertDateToEpoch(message.request_date);
      obj.from_date = epoch ? epoch - 300 : null;
      obj.to_date = epoch ? epoch + 300 : null;
    }
    this.apiSubscriptions.push(
      this.assetService.getMessageRequestDetails(message.id, this.contextApp.app, obj).subscribe(
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
        },
        (error) => (this.isC2dMsgsLoading = false)
      )
    );
  }

  loadResponseDetail(message, openModalFlag) {
    if (openModalFlag) {
      this.isC2dMsgResponsesLoading = true;
      this.openC2DMessageModal();
    }
    this.selectedMessage = message;
    this.c2dResponseDetail = [];
    const obj = {
      sub_job_id: message.sub_job_id,
      from_date: null,
      to_date: null,
      epoch: true,
    };
    const epoch = message.request_date
      ? this.commonService.convertDateToEpoch(message.request_date)
      : message.timestamp;
    obj.from_date = epoch ? epoch - 5 : null;
    obj.to_date = datefns.getUnixTime(new Date());
    this.apiSubscriptions.push(
      this.assetService.getMessageResponseDetails(this.contextApp.app, obj).subscribe(
        (response: any) => {
          if (response.data) {
            this.c2dResponseDetail = response.data;
            if (this.c2dResponseDetail.length === 0) {
              this.modalConfig.jsonDisplay = false;
              this.modalConfig.stringDisplay = true;
            } else {
              this.modalConfig.jsonDisplay = true;
              this.modalConfig.stringDisplay = false;
            }
          }
          this.isC2dMsgResponsesLoading = false;
        },
        (error) => {
          this.isC2dMsgResponsesLoading = false;
        }
      )
    );
  }

  openC2DMessageModal() {
    $('#c2dmessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true,
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
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
