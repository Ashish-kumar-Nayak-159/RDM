import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-battery-messages',
  templateUrl: './battery-messages.component.html',
  styleUrls: ['./battery-messages.component.css'],
})
export class BatteryMessagesComponent implements OnInit, OnDestroy {
  @Input() batteryMessageFilter: any = {};
  batteryMessageList: any[] = [];
  @Input() asset: Asset = new Asset();
  @Input() componentState: any;
  isBatteryMessageLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedBatteryMessage: any;
  isFilterSelected = false;
  modalConfig: any;
  batteryMessageTableConfig: any = {};
  pageType: any;
  contextApp: any;
  constructor(private assetService: AssetService, private commonService: CommonService) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.apiSubscriptions.push(
      this.assetService.searchNotificationsEventEmitter.subscribe(() =>
        this.searchBatteryMessage(this.batteryMessageFilter)
      )
    );
    // if (this.asset.tags.category === CONSTANTS.IP_GATEWAY) {
    //   this.batteryMessageFilter.gateway_id = this.asset.asset_id;
    // } else {
    //   this.batteryMessageFilter.asset_id = this.asset.asset_id;
    // }
    // this.batteryMessageFilter.count = 10;
    // this.batteryMessageFilter.app = this.contextApp.app;
    this.batteryMessageTableConfig = {
      type: 'battery',
      dateRange: '',
      headers: ['Timestamp', 'Message ID', 'Message'],
      data: [
        {
          name: 'Timestamp',
          key: 'local_created_date',
        },
        {
          name: 'Message ID',
          key: 'message_id',
        },
        {
          name: 'Message',
          key: undefined,
        },
      ],
    };
    // this.loadFromCache();
    if (this.componentState === CONSTANTS.IP_GATEWAY) {
      this.batteryMessageTableConfig.data.splice(1, 1);
      this.batteryMessageTableConfig.data.splice(1, 0, {
        name: 'Asset Name',
        key: 'asset_id',
      });
    }
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.batteryMessageFilter.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.batteryMessageFilter.from_date = dateObj.from_date;
        this.batteryMessageFilter.to_date = dateObj.to_date;
        this.batteryMessageFilter.last_n_secs = dateObj.to_date - dateObj.from_date;
      } else {
        this.batteryMessageFilter.from_date = item.from_date;
        this.batteryMessageFilter.to_date = item.to_date;
      }
    }
    this.searchBatteryMessage(this.batteryMessageFilter, false);
  }

  searchBatteryMessage(filterObj, updateFilterObj = true) {
    this.isFilterSelected = true;
    this.isBatteryMessageLoading = true;
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    }
    const obj = { ...filterObj };
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
      pagefilterObj['from_date'] = obj.from_date;
      pagefilterObj['to_date'] = obj.to_date;
      pagefilterObj['dateOption'] = obj.dateOption;
      this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, pagefilterObj);
    }
    this.batteryMessageFilter = filterObj;
    this.apiSubscriptions.push(
      this.assetService.getAssetBatteryMessagesList(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.batteryMessageList = response.data;
            this.batteryMessageList.forEach(
              (item) => (item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date))
            );
          }
          if (this.batteryMessageFilter.dateOption !== 'Custom Range') {
            this.batteryMessageTableConfig.dateRange = this.batteryMessageFilter.dateOption;
          } else {
            this.batteryMessageTableConfig.dateRange = 'this selected range';
          }
          this.isBatteryMessageLoading = false;
        },
        (error) => (this.isBatteryMessageLoading = false)
      )
    );
  }

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      const obj = {
        app: dataobj.app,
        id: dataobj.id,
      };
      this.apiSubscriptions.push(
        this.assetService.getAssetMessageById(obj, 'battery').subscribe((response: any) => {
          resolve(response.message);
        })
      );
    });
  }

  openBatteryMessageModal(obj) {
    if (obj.type === this.batteryMessageTableConfig.type) {
      this.selectedBatteryMessage = obj.data;
      this.getMessageData(obj.data).then((message) => {
        this.selectedBatteryMessage.message = message;
      });
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true,
      };
      $('#batteryMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#batteryMessageModal').modal('hide');
      this.selectedBatteryMessage = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
