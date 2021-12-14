import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';

declare var $: any;
@Component({
  selector: 'app-rdmasset-control-panel-error',
  templateUrl: './rdmasset-control-panel-error.component.html',
  styleUrls: ['./rdmasset-control-panel-error.component.css'],
})
export class RDMAssetControlPanelErrorComponent implements OnInit, OnDestroy {
  @Input() errorFilter: any = {};
  errors: any[] = [];
  @Input() asset: Asset = new Asset();
  @Input() componentState: any;
  isErrorLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedError: any;
  isFilterSelected = false;
  modalConfig: any;
  errorTableConfig: any = {};
  pageType: string;
  contextApp: any;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.apiSubscriptions.push(
      this.assetService.searchNotificationsEventEmitter.subscribe(() => this.searchError(this.errorFilter))
    );
    // if (this.asset?.tags?.category === CONSTANTS.IP_GATEWAY) {
    //   this.errorFilter.gateway_id = this.asset.asset_id;
    // } else {
    //   this.errorFilter.asset_id = this.asset.asset_id;
    // }
    // this.errorFilter.count = 10;
    // this.errorFilter.app = this.contextApp.app;
    this.errorTableConfig = {
      type: 'error',
      dateRange: '',
      headers: ['Timestamp', 'Message ID', 'Error Code', 'Message'],
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
          name: 'Error Code',
          key: 'error_code',
        },
        {
          name: 'Message',
          key: undefined,
        },
      ],
    };
    // this.loadFromCache();
    this.errorFilter.epoch = true;
  }

  searchError(filterObj, updateFilterObj = true) {
    this.isFilterSelected = true;
    this.isErrorLoading = true;
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
    this.errorFilter = filterObj;
    this.apiSubscriptions.push(
      this.assetService.getAssetError(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.errors = response.data;
            this.errors.forEach(
              (item) => (item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date))
            );
          }
          if (this.errorFilter.dateOption !== 'Custom Range') {
            this.errorTableConfig.dateRange = this.errorFilter.dateOption;
          } else {
            this.errorTableConfig.dateRange = 'this selected range';
          }
          this.isErrorLoading = false;
        },
        (error) => (this.isErrorLoading = false)
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
        this.assetService.getAssetMessageById(obj, 'error').subscribe((response: any) => {
          resolve(response.message);
        })
      );
    });
  }

  openErrorMessageModal(obj) {
    if (obj.type === this.errorTableConfig.type) {
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true,
      };
      this.selectedError = obj.data;
      this.getMessageData(obj.data).then((message) => {
        this.selectedError.message = message;
      });
      $('#errorMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#errorMessageModal').modal('hide');
      this.selectedError = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
