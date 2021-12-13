import { ToasterService } from './../../../../services/toaster.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { Subscription } from 'rxjs';
import * as datefns from 'date-fns';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-c2d-jobs',
  templateUrl: './c2d-jobs.component.html',
  styleUrls: ['./c2d-jobs.component.css'],
})
export class C2dJobsComponent implements OnInit {
  @Input() filterObj: any;
  c2dJobFilter: any = {};
  c2dMsgs: any[] = [];
  isC2dMsgsLoading = false;
  isC2dMsgRequestLoading = false;
  isC2dMsgResponsesLoading = false;
  @Input() asset: Asset = new Asset();
  apiSubscriptions: Subscription[] = [];
  c2dMessageDetail: any;
  c2dResponseDetail: any[];
  modalConfig: any;
  userData: any;
  selectedMessage: any;

  contextApp: any;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    
    if (this.asset.type === CONSTANTS.IP_GATEWAY) {
      this.c2dJobFilter.iot_asset_id = this.asset.asset_id;
    } else {
      this.c2dJobFilter.asset_id = this.asset.asset_id;
    }
    this.c2dJobFilter.epoch = true;
    this.c2dJobFilter.app = this.contextApp.app;
    this.c2dJobFilter.count = 3;
    this.apiSubscriptions.push(
      this.assetService.refreshRecentJobs.subscribe(() => {
        this.getRecentJobs();
      })
    );
    this.getRecentJobs();
  }

  getRecentJobs() {
    this.isC2dMsgsLoading = true;
    this.c2dMsgs = [];
    this.c2dJobFilter.from_date = datefns.getUnixTime(datefns.startOfDay(new Date()));
    this.c2dJobFilter.to_date = datefns.getUnixTime(new Date()) + 3;
    const obj = { ...this.c2dJobFilter };
    obj.app = this.asset.app;
    obj.request_type = this.filterObj.request_type;
    obj.job_type = this.filterObj.job_type;
    this.apiSubscriptions.push(
      this.assetService.getAssetC2DMessages(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.c2dMsgs = response.data;
            this.c2dMsgs.forEach(
              (item) => (item.local_created_date = this.commonService.convertUTCDateToLocal(item.request_date))
            );
          }
          this.isC2dMsgsLoading = false;
        },
        (error) => (this.isC2dMsgsLoading = false)
      )
    );
  }

  loadMessageDetail(message, openModalFlag) {
    this.isC2dMsgRequestLoading = true;
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
          this.c2dMessageDetail = response;
          this.openC2DMessageModal();
          this.isC2dMsgRequestLoading = false;
        },
        (error) => (this.isC2dMsgRequestLoading = false)
      )
    );
  }

  loadResponseDetail(message) {
    this.openC2DMessageModal();
    this.selectedMessage = message;
    this.c2dResponseDetail = [];
    console.log(message);
    this.isC2dMsgResponsesLoading = true;
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
          }
          if (this.c2dResponseDetail.length === 0) {
            this.modalConfig.jsonDisplay = false;
            this.modalConfig.stringDisplay = true;
          } else {
            this.modalConfig.jsonDisplay = true;
            this.modalConfig.stringDisplay = false;
          }
          this.isC2dMsgResponsesLoading = false;
        },
        (error) => (this.isC2dMsgResponsesLoading = false)
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
