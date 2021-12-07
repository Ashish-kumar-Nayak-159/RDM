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
  selector: 'app-gateway-cached-alerts',
  templateUrl: './gateway-cached-alerts.component.html',
  styleUrls: ['./gateway-cached-alerts.component.css'],
})
export class GatewayCachedAlertsComponent implements OnInit, OnDestroy {
  filterObj: any = {};
  alertsList: any[] = [];
  @Input() asset: Asset = new Asset();
  isAlertLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedAlert: any;
  isFilterSelected = false;
  modalConfig: any;
  pageType: string;
  alertTableConfig: any = {};
  assets: any[] = [];
  contextApp: any;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.asset.type === CONSTANTS.IP_GATEWAY) {
      this.filterObj.gateway_id = this.asset.asset_id;
    } else {
      this.filterObj.asset_id = this.asset.asset_id;
    }
    this.filterObj.app = this.contextApp.app;
    this.filterObj.count = 10;
    this.assets = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSETS_LIST);
    this.alertTableConfig = {
      type: 'cached alerts',
      dateRange: '',
      headers: ['Timestamp', 'Asset Name', 'File Name', 'Process Status', 'View'],
      data: [
        {
          name: 'Uploaded At',
          key: 'local_upload_date',
        },
        {
          name: 'Processed At',
          key: 'local_created_date',
        },
        {
          name: 'Asset Name',
          key: 'display_name',
        },
        {
          name: '',
          key: undefined,
        },
      ],
      rowHighlight: {
        param: 'process_status',
        value: 'Success',
      },
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
    this.searchAlerts(this.filterObj, false);
  }

  searchAlerts(filterObj, updateFilterObj = true) {
    this.isFilterSelected = true;
    this.isAlertLoading = true;
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    }
    const obj = { ...filterObj };

    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Cached Alerts');
      this.isAlertLoading = false;
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
      this.assetService.getGatewayCachedAlerts(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.alertsList = response.data;
            this.alertsList.forEach((item) => {
              item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date);
              item.local_upload_date = this.commonService.convertUTCDateToLocal(item.iothub_date);
              if (this.assets?.length > 0 && item.asset) {
                const assetObj = this.assets.find((asset) => asset.asset_id === item.asset_id);
                item.display_name = assetObj?.display_name || item.asset_id;
              } else {
                item.display_name = item.asset_id;
              }
            });
          }
          if (this.filterObj.dateOption !== 'Custom Range') {
            this.alertTableConfig.dateRange = this.filterObj.dateOption;
          } else {
            this.alertTableConfig.dateRange = 'this selected range';
          }
          this.isAlertLoading = false;
        },
        (error) => (this.isAlertLoading = false)
      )
    );
  }

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      const obj = {
        app: dataobj.app,
        id: dataobj.id,
        from_date: null,
        to_date: null,
        epoch: true,
      };
      const epoch = this.commonService.convertDateToEpoch(dataobj.created_date);
      obj.from_date = epoch ? epoch - 300 : null;
      obj.to_date = epoch ? epoch + 300 : null;
      this.apiSubscriptions.push(
        this.assetService.getAssetMessageById(obj, 'cached_alert').subscribe((response: any) => {
          resolve(response.raw_data);
        })
      );
    });
  }

  openAlertMessageModal(obj) {
    if (obj.type === this.alertTableConfig.type) {
      this.selectedAlert = obj.data;
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true,
      };
      this.getMessageData(obj.data).then((message) => {
        this.selectedAlert.message = message;
      });
      $('#alertMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#alertMessageModal').modal('hide');
      this.selectedAlert = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
