import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { ToasterService } from './../../../services/toaster.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { environment } from 'src/environments/environment';
import { FileSaverService } from 'ngx-filesaver';
declare var $: any;
@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css'],
})
export class LogsComponent implements OnInit {
  @Input() asset = new Asset();
  filterObj: any = {};
  logList: any[] = [];
  isLogLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedLog: any;
  isFilterSelected = false;
  modalConfig: any;
  pageType: string;
  logTableConfig: any = {};
  sasToken = environment.blobKey;
  fileData: any;
  isFileDataLoading: boolean;
  assets: any[] = [];
  contextApp: any;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private fileSaverService: FileSaverService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.asset.type === CONSTANTS.IP_GATEWAY) {
      this.filterObj.gateway_id = this.asset.asset_id;
    } else {
      this.filterObj.asset_id = this.asset.asset_id;
    }
    // this.filterObj.app = this.contextApp.app;
    this.filterObj.count = 10;
    this.assets = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSETS_LIST);
    this.logTableConfig = {
      type: 'Logs',
      dateRange: '',
      data: [
        {
          name: 'Uploaded At',
          key: 'local_upload_date',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Processed At',
          key: 'local_created_date',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'File',
          key: 'file_name',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Actions',
          key: undefined,
          type: 'button',
          headerClass: '',
          btnData: [
            {
              icon: 'fa fa-fw fa-download',
              text: '',
              id: 'Download',
              valueclass: '',
              tooltip: 'Download',
            },
          ],
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
    this.searchLogs(this.filterObj, false);
  }

  searchLogs(filterObj, updateFilterObj = true) {
    this.isFilterSelected = true;
    this.isLogLoading = true;
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    }
    const obj = { ...filterObj };

    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is required.', 'Get Logs');
      this.isLogLoading = false;
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
      this.assetService.getLogs(this.contextApp.app, obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.logList = response.data;
            this.logList.forEach((item) => {
              item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date);
              item.local_upload_date = this.commonService.convertUTCDateToLocal(item.upload_date);
            });
          }
          if (this.filterObj.dateOption !== 'Custom Range') {
            this.logTableConfig.dateRange = this.filterObj.dateOption;
          } else {
            this.logTableConfig.dateRange = 'this selected range';
          }
          this.isLogLoading = false;
        },
        (error) => (this.isLogLoading = false)
      )
    );
  }

  openLogMessageModal(obj) {
    if (obj.for === 'Download') {
      this.isFileDataLoading = true;
      this.fileData = undefined;
      const url =
        environment.blobURL +
        environment.cachedTelemetryContainer +
        '/' +
        obj.data.file_path +
        '/' +
        obj.data.file_name +
        this.sasToken;
      this.apiSubscriptions.push(
        this.commonService.getFileData(url).subscribe(
          (response) => {
            this.fileData = response;
            this.fileSaverService.save(response, obj.data.file_name);
            this.isFileDataLoading = false;
          },
          (error) => (this.isFileDataLoading = false)
        )
      );
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#LogMessageModal').modal('hide');
      this.selectedLog = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
