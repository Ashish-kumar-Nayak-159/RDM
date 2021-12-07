import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { AssetService } from 'src/app/services/assets/asset.service';
import { Asset } from 'src/app/models/asset.model';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { expInOut } from '@amcharts/amcharts4/.internal/core/utils/Ease';
declare var $: any;
@Component({
  selector: 'app-heartbeat',
  templateUrl: './heartbeat.component.html',
  styleUrls: ['./heartbeat.component.css'],
})
export class HeartbeatComponent implements OnInit, OnDestroy {
  @Input() heartBeatFilter: any = {};
  heartbeats: any[] = [];
  contextApp: any;
  @Input() asset: Asset = new Asset();
  @Input() componentState: any;
  isHeartbeatLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedHeartbeat: any;
  isFilterSelected = false;
  modalConfig: any;
  // pageType: string;
  heartbeatTableConfig: any = {};
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.apiSubscriptions.push(
      this.assetService.searchNotificationsEventEmitter.subscribe(() => this.searchHeartBeat(this.heartBeatFilter))
    );
    if (this.asset.tags.category === CONSTANTS.IP_GATEWAY) {
      this.heartBeatFilter.gateway_id = this.asset.asset_id;
    } else {
      this.heartBeatFilter.asset_id = this.asset.asset_id;
    }
    this.heartBeatFilter.count = 10;
    this.heartBeatFilter.app = this.contextApp.app;

    this.heartbeatTableConfig = {
      type: 'heartbeat',
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
    if (this.componentState === CONSTANTS.IP_GATEWAY) {
      this.heartbeatTableConfig.data.splice(1, 1);
      this.heartbeatTableConfig.data.splice(1, 0, {
        name: 'Asset Name',
        key: 'asset_id',
      });
    }
    // this.searchHeartBeat(this.heartBeatFilter);
    this.heartBeatFilter.epoch = true;
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.heartBeatFilter.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.heartBeatFilter.from_date = dateObj.from_date;
        this.heartBeatFilter.to_date = dateObj.to_date;
        this.heartBeatFilter.last_n_secs = dateObj.to_date - dateObj.from_date;
      } else {
        this.heartBeatFilter.from_date = item.from_date;
        this.heartBeatFilter.to_date = item.to_date;
      }
    }
    this.searchHeartBeat(this.heartBeatFilter, false);
  }

  searchHeartBeat(filterObj, updateFilterObj = true) {
    this.isFilterSelected = true;
    this.isHeartbeatLoading = true;
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    }
    const obj = { ...filterObj };
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'View Heartbeats');
      this.isHeartbeatLoading = false;
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
    this.heartBeatFilter = filterObj;
    this.apiSubscriptions.push(
      this.assetService.getAssetHeartBeats(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.heartbeats = response.data;
            this.heartbeats.forEach(
              (item) => (item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date))
            );
          }
          if (this.heartBeatFilter.dateOption !== 'Custom Range') {
            this.heartbeatTableConfig.dateRange = this.heartBeatFilter.dateOption;
          } else {
            this.heartbeatTableConfig.dateRange = 'this selected range';
          }
          this.isHeartbeatLoading = false;
        },
        (error) => (this.isHeartbeatLoading = false)
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
        this.assetService.getAssetMessageById(obj, 'heartbeat').subscribe((response: any) => {
          resolve(response.message);
        })
      );
    });
  }

  openHeratbeatMessageModal(obj) {
    if (obj.type === this.heartbeatTableConfig.type) {
      this.selectedHeartbeat = obj.data;
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true,
      };
      this.getMessageData(obj.data).then((message) => {
        this.selectedHeartbeat.message = message;
      });
      $('#heartbeatMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#heartbeatMessageModal').modal('hide');
      this.selectedHeartbeat = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
