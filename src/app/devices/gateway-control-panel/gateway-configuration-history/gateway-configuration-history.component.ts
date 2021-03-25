import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Device } from 'src/app/models/device.model';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';

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
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {

    this.filterObj.gateway_id = this.device.device_id;

    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.configHistoryTableConfig = {
        type: 'configuration history',
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

    }));
    this.filterObj.epoch = true;

  }

  searchConfigHistory(filterObj) {
    console.log(filterObj);
    this.isFilterSelected = true;
    this.isConfigHistoryLoading = true;
    const obj = {...filterObj};
    const now = moment().utc();
    if (filterObj.dateOption === '5 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(5, 'minute')).unix();
    } else if (filterObj.dateOption === '30 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(30, 'minute')).unix();
    } else if (filterObj.dateOption === '1 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(1, 'hour')).unix();
    } else if (filterObj.dateOption === '24 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(24, 'hour')).unix();
    } else {
      if (filterObj.from_date) {
        obj.from_date = (filterObj.from_date.unix());
      }
      if (filterObj.to_date) {
        obj.to_date = filterObj.to_date.unix();
      }
    }
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Alert Data');
      this.isConfigHistoryLoading = false;
      this.isFilterSelected = false;
      return;
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
