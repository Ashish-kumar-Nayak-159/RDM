import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';

declare var $: any;
@Component({
  selector: 'app-asset-life-cycle-events',
  templateUrl: './asset-life-cycle-events.component.html',
  styleUrls: ['./asset-life-cycle-events.component.css'],
})
export class AssetLifeCycleEventsComponent implements OnInit, OnDestroy {
  filterObj: any = {};
  lifeCycleEvents: any[] = [];
  @Input() asset: Asset = new Asset();
  isLifeCycleEventsLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedEvent: any;
  isFilterSelected = false;
  modalConfig: any;
  pageType: string;
  eventTableConfig: any = {};
  contextApp: any;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.filterObj.asset_id = this.asset.asset_id;
    this.filterObj.app = this.contextApp.app;
    this.filterObj.count = 10;
    this.eventTableConfig = {
      type: 'life cycle events',
      dateRange: '',
      headers: ['Timestamp', 'View'],
      data: [
        {
          name: 'Timestamp',
          key: 'local_created_date',
        },
        {
          name: 'Event',
          key: 'event_type',
        },
      ],
    };
    this.loadFromCache();
    this.filterObj.epoch = true;
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.filterObj.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.filterObj.from_date = dateObj.from_date;
        this.filterObj.to_date = dateObj.to_date;
        this.filterObj.last_n_secs = dateObj.to_date - dateObj.from_date;
      } else {
        this.filterObj.from_date = item.from_date;
        this.filterObj.to_date = item.to_date;
      }
    }
    this.searchLifeCycleEvents(this.filterObj, false);
  }

  searchLifeCycleEvents(filterObj, updateFilterObj = true) {
    this.isFilterSelected = true;
    this.isLifeCycleEventsLoading = true;
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    }
    const obj = { ...filterObj };

    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Asset Life cycle events');
      this.isLifeCycleEventsLoading = false;
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
    this.filterObj = filterObj;
    this.apiSubscriptions.push(
      this.assetService.getAssetLifeCycleEvents(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.lifeCycleEvents = response.data;
            this.lifeCycleEvents.forEach((item) => {
              const eventMsg = item.event_type.split('.');
              eventMsg[eventMsg.length - 1] = eventMsg[eventMsg.length - 1].replace('Device', '');
              eventMsg[eventMsg.length - 1] =
                (item.category === CONSTANTS.IP_GATEWAY ? 'Gateway ' : 'Asset ') + eventMsg[eventMsg.length - 1];
              item.event_type = eventMsg[eventMsg.length - 1];
              item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date);
            });
          }
          if (this.filterObj.dateOption !== 'Custom Range') {
            this.eventTableConfig.dateRange = this.filterObj.dateOption;
          } else {
            this.eventTableConfig.dateRange = 'this selected range';
          }
          this.isLifeCycleEventsLoading = false;
        },
        (error) => (this.isLifeCycleEventsLoading = false)
      )
    );
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
