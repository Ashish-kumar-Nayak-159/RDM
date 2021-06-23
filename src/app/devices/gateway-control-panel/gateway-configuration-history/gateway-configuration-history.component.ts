import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Device } from 'src/app/models/device.model';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CONSTANTS } from 'src/app/app.constants';

declare var $: any;
@Component({
  selector: 'app-gateway-configuration-history',
  templateUrl: './gateway-configuration-history.component.html',
  styleUrls: ['./gateway-configuration-history.component.css']
})
export class GatewayConfigurationHistoryComponent implements OnInit, OnDestroy {

  filterObj: any = {};
  confighistory: any[] = [];
  @Input() device: Device = new Device();
  isConfigHistoryLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedConfigHistory: any;
  isFilterSelected = false;
  modalConfig: any;
  pageType: string;
  configHistoryTableConfig: any = {};
  contextApp: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.filterObj.gateway_id = this.device.device_id;
    this.filterObj.app = this.contextApp.app;
    this.filterObj.count = 10;
    this.configHistoryTableConfig = {
      type: 'configuration history',
      dateRange: '',
      headers: ['Timestamp', 'Asset Name', 'File Name', 'Process Status', 'View'],
      data: [

        {
          name: 'Timestamp',
          key: 'local_created_date',
        },
        // {
        //   name: 'Asset Name',
        //   key: 'device_id',
        // },
        {
          name: 'Configuration',
          key: undefined,
        }
      ]
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
      } else {
        this.filterObj.from_date = item.from_date;
        this.filterObj.to_date = item.to_date;
      }
    }
    this.searchConfigHistory(this.filterObj, false);
  }

  searchConfigHistory(filterObj, updateFilterObj = true) {
    this.isFilterSelected = true;
    this.isConfigHistoryLoading = true;
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    } else {
      filterObj.from_date = filterObj.from_date;
      filterObj.to_date = filterObj.to_date;
    }
    const obj = {...filterObj};
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Alert Data');
      this.isConfigHistoryLoading = false;
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
    this.apiSubscriptions.push(this.deviceService.getAssetConfigurationHistory(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.confighistory = response.data;
          this.confighistory.forEach(item => {
            item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date);
          });
        }
        if (this.filterObj.dateOption !== 'Custom Range') {
          this.configHistoryTableConfig.dateRange = this.filterObj.dateOption;
        }
        else {
          this.configHistoryTableConfig.dateRange = 'this selected range';
        }
        this.isConfigHistoryLoading = false;
      }, error => this.isConfigHistoryLoading = false
    ));
  }

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      resolve(dataobj.configuration);
    });
  }

  openConfigHistoryMessageModal(obj) {
    if (obj.type === this.configHistoryTableConfig.type) {
      this.selectedConfigHistory = obj.data;
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true
      };
      this.getMessageData(obj.data).then(message => {
        this.selectedConfigHistory.configuration = message;
      });
      $('#configHistoryMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }


  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#configHistoryMessageModal').modal('hide');
      this.selectedConfigHistory = undefined;
    }
  }



  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }



}
