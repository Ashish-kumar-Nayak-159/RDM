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
  selector: 'app-others',
  templateUrl: './others.component.html',
  styleUrls: ['./others.component.css'],
})
export class OthersComponent implements OnInit, OnDestroy {
  @Input() otherFilter: any = {};
  othersList: any[] = [];
  @Input() asset: Asset = new Asset();
  @Input() componentState: any;
  isOthersLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedOther: any;
  isFilterSelected = false;
  modalConfig: any;
  otherTableConfig: any = {};
  pageType: any;
  contextApp: any;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.apiSubscriptions.push(
      this.assetService.searchNotificationsEventEmitter.subscribe(() => this.searchOther(this.otherFilter))
    );
    // if (this.asset.tags.category === CONSTANTS.IP_GATEWAY) {
    //   this.otherFilter.gateway_id = this.asset.asset_id;
    // } else {
    //   this.otherFilter.asset_id = this.asset.asset_id;
    // }
    // this.otherFilter.count = 10;
    // this.otherFilter.app = this.contextApp.app;
    this.otherTableConfig = {
      type: 'other',
      dateRange: '',
      headers: ['Timestamp', 'Message ID', 'Message Type', 'Other Message'],
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
          name: 'Other Message',
          key: undefined,
        },
      ],
    };
    // this.loadFromCache();
  }

  searchOther(filterObj, updateFilterObj = true) {
    console.log(filterObj);
    this.isFilterSelected = true;
    this.isOthersLoading = true;
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
    this.otherFilter = filterObj;
    this.apiSubscriptions.push(
      this.assetService.getAssetotherMessagesList(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.othersList = response.data;
            this.othersList.forEach(
              (item) => (item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date))
            );
          }
          if (this.otherFilter.dateOption !== 'Custom Range') {
            this.otherTableConfig.dateRange = this.otherFilter.dateOption;
          } else {
            this.otherTableConfig.dateRange = 'this selected range';
          }
          this.isOthersLoading = false;
        },
        (error) => (this.isOthersLoading = false)
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
        this.assetService.getAssetMessageById(obj, 'other').subscribe((response: any) => {
          resolve(response.message);
        })
      );
    });
  }

  openOtherMessageModal(obj) {
    if (obj.type === this.otherTableConfig.type) {
      this.selectedOther = obj.data;
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true,
      };
      this.getMessageData(obj.data).then((message) => {
        this.selectedOther.message = message;
      });
      $('#otherMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#otherMessageModal').modal('hide');
      this.selectedOther = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
