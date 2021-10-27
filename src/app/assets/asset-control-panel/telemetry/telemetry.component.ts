import { filter } from 'rxjs/operators';
import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
declare var $: any;
@Component({
  selector: 'app-telemetry',
  templateUrl: './telemetry.component.html',
  styleUrls: ['./telemetry.component.css'],
})
export class TelemetryComponent implements OnInit, OnDestroy, AfterViewInit {
  telemetryFilter: any = {};
  telemetry: any[] = [];
  @Input() asset: Asset = new Asset();
  @Input() componentState: any;
  isTelemetryLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedTelemetry: any;
  isFilterSelected = false;
  modalConfig: any;
  telemetryTableConfig: any = {};
  pageType: string;
  assets: any[] = [];
  originalTelemetryFilter: any;
  today = new Date();
  contextApp: any;
  selectedDateRange: string;
  activeColumn: string;
  directionColumn: string;
  frequency: any;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) {}

  sortOn(key: string, directionColumn: string) {
    this.activeColumn = key;
    this.directionColumn = directionColumn;
    const isAscending = directionColumn === 'asc';
    const sortedArray = this.telemetry.sort((a, b) => {
      if (a[key] > b[key]) {
        return isAscending ? 1 : -1;
      }
      if (a[key] < b[key]) {
        return isAscending ? -1 : 1;
      }
      return 0;
    });
    return sortedArray;
  }

  getClass(columnID: string) {
    if (this.activeColumn === columnID && this.directionColumn === 'asc') {
      return 'asc';
    } else if (this.activeColumn === columnID && this.directionColumn === 'desc') {
      return 'desc';
    } else {
      return 'default';
    }
  }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.asset.tags.category === CONSTANTS.IP_GATEWAY) {
      this.telemetryFilter.gateway_id = this.asset.asset_id;
    } else {
      this.telemetryFilter.asset_id = this.asset.asset_id;
    }
    const frequencyArr = [];
    frequencyArr.push(this.asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
    frequencyArr.push(this.asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
    frequencyArr.push(this.asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
    this.frequency = this.commonService.getLowestValueFromList(frequencyArr);
    this.telemetryTableConfig = {
      type: 'process parameter',
      tableHeight: 'calc(100vh - 13.5rem)',
      dateRange: '',
      headers: ['Timestamp', 'Message ID', 'Message'],
      data: [
        {
          name: 'Timestamp',
          key: 'local_message_date',
          type: 'text',
          headerClass: 'w-15',
          valueclass: '',
        },
        // {
        //   name: 'Message ID',
        //   key: 'message_id',
        // },
        {
          name: 'IOT Hub Date',
          key: 'local_iothub_date',
          type: 'text',
          headerClass: 'w-15',
          valueclass: '',
        },
        {
          name: 'Database Record Date',
          key: 'local_created_date',
          type: 'text',
          headerClass: 'w-15',
          valueclass: '',
        },
        {
          name: 'Message',
          key: undefined,
          type: 'button',
          btnData: [
            {
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'View Process Parameter Message',
              valueclass: '',
              tooltip: 'View Process Parameter Message',
            },
          ],
        },
      ],
    };

    if (this.telemetryFilter.gateway_id) {
      this.getAssetsListByGateway();
    }
    // this.telemetryFilter.type = true;
    this.telemetryFilter.sampling_format = 'minute';
    this.telemetryFilter.sampling_time = 1;

    this.telemetryFilter.count = 10;
    this.telemetryFilter.app = this.contextApp.app;
    this.telemetryFilter.epoch = true;
    this.originalTelemetryFilter = { ...this.telemetryFilter };
  }

  ngAfterViewInit() {
    this.loadFromCache();
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.telemetryFilter.dateOption = item.dateOption;
      if (item.dateOption === 'Custom Range') {
        this.telemetryFilter.from_date = item.from_date;
        this.telemetryFilter.to_date = item.to_date;
        this.selectedDateRange =
          moment.unix(this.telemetryFilter.from_date).format('DD-MM-YYYY HH:mm') +
          ' to ' +
          moment.unix(this.telemetryFilter.to_date).format('DD-MM-YYYY HH:mm');
      } else {
        const dateObj = this.commonService.getMomentStartEndDate(this.telemetryFilter.dateOption);
        this.telemetryFilter.from_date = dateObj.from_date;
        this.telemetryFilter.to_date = dateObj.to_date;
        this.selectedDateRange = this.telemetryFilter.dateOption;
        this.telemetryFilter.last_n_secs = item.to_date - item.from_date;
      }
      // if (this.telemetryFilter.to_date - this.telemetryFilter.from_date > 3600) {
      //   this.telemetryFilter.isTypeEditable = true;
      // } else {
      //   this.telemetryFilter.isTypeEditable = false;
      // }
      const records = this.commonService.calculateEstimatedRecords(
        this.frequency,
        this.telemetryFilter.from_date,
        this.telemetryFilter.to_date
      );
      if (records > CONSTANTS.NO_OF_RECORDS) {
        this.telemetryFilter.isTypeEditable = true;
      } else {
        this.telemetryFilter.isTypeEditable = false;
      }
    }
    this.originalTelemetryFilter = JSON.parse(JSON.stringify(this.telemetryFilter));
    this.searchTelemetry(this.telemetryFilter, false);
  }

  getAssetsListByGateway() {
    this.assets = [];
    const obj = {
      gateway_id: this.telemetryFilter.gateway_id,
      app: this.asset?.tags?.app,
      type: CONSTANTS.NON_IP_ASSET,
    };
    this.apiSubscriptions.push(
      this.assetService.getIPAssetsAndGateways(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.assets = response.data;
            this.assets.splice(0, 0, { asset_id: this.telemetryFilter.gateway_id });
          }
        },
        (errror) => {}
      )
    );
  }

  selectedDate(filterObj) {
    this.telemetryFilter.from_date = filterObj.from_date;
    this.telemetryFilter.to_date = filterObj.to_date;
    this.telemetryFilter.dateOption = filterObj.dateOption;
    this.telemetryFilter.last_n_secs = filterObj.last_n_secs;
    const records = this.commonService.calculateEstimatedRecords(
      this.frequency,
      this.telemetryFilter.from_date,
      this.telemetryFilter.to_date
    );
    if (records > CONSTANTS.NO_OF_RECORDS) {
      this.telemetryFilter.isTypeEditable = true;
    } else {
      this.telemetryFilter.isTypeEditable = false;
    }
  }

  clear() {
    console.log('before', JSON.stringify(this.originalTelemetryFilter));
    this.telemetryFilter = {};
    this.telemetryFilter = JSON.parse(JSON.stringify(this.originalTelemetryFilter));
    this.telemetryFilter.dateOption = 'Last 30 Mins';
    if (this.telemetryFilter.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.telemetryFilter.dateOption;
      const dateObj = this.commonService.getMomentStartEndDate(this.telemetryFilter.dateOption);
      this.telemetryFilter.from_date = dateObj.from_date;
      this.telemetryFilter.to_date = dateObj.to_date;
      this.telemetryFilter.last_n_secs = dateObj.to_date - dateObj.from_date;
    } else {
      const dateObj = this.commonService.getMomentStartEndDate(this.telemetryFilter.dateOption);
      this.telemetryFilter.from_date = dateObj.from_date;
      this.telemetryFilter.to_date = dateObj.to_date;
      this.selectedDateRange =
        moment.unix(this.telemetryFilter.from_date).format('DD-MM-YYYY HH:mm') +
        ' to ' +
        moment.unix(this.telemetryFilter.to_date).format('DD-MM-YYYY HH:mm');
    }

    // if (this.telemetryFilter.to_date - this.telemetryFilter.from_date > 3600) {
    //   this.telemetryFilter.isTypeEditable = true;
    // } else {
    //   this.telemetryFilter.isTypeEditable = false;
    // }
    const records = this.commonService.calculateEstimatedRecords(
      this.frequency,
      this.telemetryFilter.from_date,
      this.telemetryFilter.to_date
    );
    if (records > CONSTANTS.NO_OF_RECORDS) {
      this.telemetryFilter.isTypeEditable = true;
    } else {
      this.telemetryFilter.isTypeEditable = false;
    }
    console.log(this.telemetryFilter);
  }

  searchTelemetry(filterObj, updateFilterObj = true) {
    this.telemetry = [];
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    } else {
      filterObj.from_date = filterObj.from_date;
      filterObj.to_date = filterObj.to_date;
    }
    const obj = { ...filterObj };
    obj.partition_key = this.asset?.tags?.partition_key;

    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Telemetry Data');
      this.isTelemetryLoading = false;
      this.isFilterSelected = false;
      return;
    }
    obj.app = this.contextApp.app;
    delete obj.isTypeEditable;
    let method;
    // if (obj.to_date - obj.from_date > 3600 && !this.telemetryFilter.isTypeEditable) {
    //     this.toasterService.showError('Please select sampling filters.', 'View Telemetry');
    //     return;
    // }
    const records = this.commonService.calculateEstimatedRecords(this.frequency, obj.from_date, obj.to_date);
    if (records > CONSTANTS.NO_OF_RECORDS && !this.telemetryFilter.isTypeEditable) {
      this.toasterService.showError('Please select sampling filters.', 'View Telemetry');
      return;
    }
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
      pagefilterObj['from_date'] = obj.from_date;
      pagefilterObj['to_date'] = obj.to_date;
      pagefilterObj['dateOption'] = obj.dateOption;
      this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, pagefilterObj);
    }
    if (this.telemetryFilter.isTypeEditable) {
      if (!this.telemetryFilter.sampling_time || !this.telemetryFilter.sampling_format) {
        this.toasterService.showError('Sampling time and format is required.', 'View Telemetry');
        return;
      } else {
        method = this.assetService.getAssetSamplingTelemetry(obj, this.asset?.tags?.app);
      }
    } else {
      delete obj.sampling_time;
      delete obj.sampling_format;
      method = this.assetService.getAssetTelemetry(obj);
    }
    this.isFilterSelected = true;
    this.isTelemetryLoading = true;
    this.telemetryFilter = filterObj;

    this.apiSubscriptions.push(
      method.subscribe(
        (response: any) => {
          if (response && response.data) {
            this.telemetry = response.data;
            this.telemetry.forEach((item) => {
              item.local_message_date = this.commonService.convertUTCDateToLocal(item.message_date);
              item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date);
              item.local_iothub_date = this.commonService.convertUTCDateToLocal(item.iothub_date);
            });
          }
          if (this.telemetryFilter.dateOption !== 'Custom Range') {
            this.telemetryTableConfig.dateRange = this.telemetryFilter.dateOption;
          } else {
            this.telemetryTableConfig.dateRange = 'this selected range';
          }
          this.isTelemetryLoading = false;
        },
        (error) => (this.isTelemetryLoading = false)
      )
    );
  }

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      const obj = {
        app: dataobj.app,
        id: dataobj.id,
        asset_id: this.asset.asset_id,
        from_date: null,
        to_date: null,
        epoch: true,
        partition_key: this.asset?.tags?.partition_key,
      };
      const epoch = this.commonService.convertDateToEpoch(dataobj.message_date);
      obj.from_date = epoch ? epoch - 300 : null;
      obj.to_date = epoch ? epoch + 300 : null;
      this.apiSubscriptions.push(
        this.assetService.getAssetMessageById(obj, 'telemetry').subscribe((response: any) => {
          resolve(response.message);
        })
      );
    });
  }

  onNumberChange(event, type) {
    if (Number(event.target.value) % 1 !== 0) {
      this.toasterService.showError('Decimal values are not allowed.', 'View Report');
      if (type === 'aggregation') {
        this.telemetryFilter.aggregation_minutes = Math.floor(Number(event.target.value));
      } else {
        this.telemetryFilter.sampling_time = Math.floor(Number(event.target.value));
      }
    }
  }

  openTelemetryMessageModal(obj) {
    // if (obj.type === this.telemetryTableConfig.type) {
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true,
    };
    this.selectedTelemetry = obj;
    this.getMessageData(obj).then((message) => {
      this.selectedTelemetry.message = message;
    });
    $('#telemetryMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    // }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#telemetryMessageModal').modal('hide');
      this.selectedTelemetry = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
