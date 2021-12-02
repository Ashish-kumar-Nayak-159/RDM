import { ToasterService } from './../../../services/toaster.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Asset } from './../../../models/asset.model';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { environment } from 'src/environments/environment';
import { FileSaverService } from 'ngx-filesaver';
import { JsonEditorOptions } from 'ang-jsoneditor';

declare var $: any;
@Component({
  selector: 'app-gateway-cached-telemetry',
  templateUrl: './gateway-cached-telemetry.component.html',
  styleUrls: ['./gateway-cached-telemetry.component.css'],
})
export class GatewayCachedTelemetryComponent implements OnInit, OnDestroy {
  filterObj: any = {};
  telemetryList: any[] = [];
  @Input() asset: Asset = new Asset();
  isTelemetryLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedTelemetry: any;
  isFilterSelected = false;
  modalConfig: any;
  pageType: string;
  telemetryTableConfig: any = {};
  sasToken = environment.blobKey;
  fileData: any;
  isFileDataLoading: boolean;
  editorOptions: JsonEditorOptions;
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
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
    this.editorOptions.statusBar = false;
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.asset.type === CONSTANTS.IP_GATEWAY) {
      this.filterObj.gateway_id = this.asset.asset_id;
    } else {
      this.filterObj.asset_id = this.asset.asset_id;
    }
    this.filterObj.app = this.contextApp.app;
    this.filterObj.count = 10;
    this.assets = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSETS_LIST);
    this.telemetryTableConfig = {
      type: 'cached telemetry',
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
          name: 'Asset',
          key: 'display_name',
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
            {
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'View Document',
              valueclass: '',
              tooltip: 'View Document',
            },
          ],
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
    this.searchTelemetry(this.filterObj, false);
  }

  searchTelemetry(filterObj, updateFilterObj = true) {
    this.isFilterSelected = true;
    this.isTelemetryLoading = true;
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    }
    const obj = { ...filterObj };

    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Cached Telemetry');
      this.isTelemetryLoading = false;
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
      this.assetService.getGatewayCachedTelemetry(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.telemetryList = response.data;
            this.telemetryList.forEach((item) => {
              item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date);
              item.local_upload_date = this.commonService.convertUTCDateToLocal(item.upload_date);
              if (this.assets?.length > 0 && item.asset) {
                const assetObj = this.assets.find((asset) => asset.asset_id === item.asset_id);
                item.display_name = assetObj?.display_name || item.asset_id;
              } else {
                item.display_name = item.asset_id;
              }
            });
          }
          if (this.filterObj.dateOption !== 'Custom Range') {
            this.telemetryTableConfig.dateRange = this.filterObj.dateOption;
          } else {
            this.telemetryTableConfig.dateRange = 'this selected range';
          }
          this.isTelemetryLoading = false;
        },
        (error) => (this.isTelemetryLoading = false)
      )
    );
  }

  downloadFile(fileObj, type) {
    // const link = document.createElement('a');
    // link.setAttribute('target', '_blank');
    // link.setAttribute('href', fileObj.url + this.sasToken);
    // link.setAttribute('download', fileObj.name);
    // document.body.appendChild(link);
    // link.click();
    return new Promise<void>((resolve) => {
      this.isFileDataLoading = true;
      // link.remove();
      this.fileData = undefined;
      const url =
        environment.blobURL +
        environment.cachedTelemetryContainer +
        '/' +
        fileObj.file_path +
        '/' +
        fileObj.file_name +
        this.sasToken;
      let method;
      if (type === 'download') {
        method = this.commonService.getFileData(url);
      } else {
        method = this.commonService.getFileOriginalData(url);
      }
      this.apiSubscriptions.push(
        method.subscribe(
          (response) => {
            this.fileData = response;
            if (type === 'download') {
              this.fileSaverService.save(response, fileObj.file_name);
            }
            this.isFileDataLoading = false;
            resolve();
          },
          (error) => (this.isFileDataLoading = false)
        )
      );
    });
  }

  async openTelemetryMessageModal(obj) {
    if (obj.for === 'Download') {
      this.downloadFile(obj.data, 'download');
    } else if (obj.for === 'View Document') {
      this.selectedTelemetry = obj.data;
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true,
      };
      $('#telemetryMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
      await this.downloadFile(obj.data, 'view');
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#telemetryMessageModal').modal('hide');
      this.selectedTelemetry = undefined;
    }
  }

  sanitizeURL() {
    const url =
      environment.blobURL +
      '/' +
      environment.cachedTelemetryContainer +
      '/' +
      this.selectedTelemetry.file_path +
      '/' +
      this.selectedTelemetry.file_name +
      this.sasToken;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
