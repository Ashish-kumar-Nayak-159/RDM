import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { CONSTANTS } from 'src/app/app.constants';
import { ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
  selector: 'app-others',
  templateUrl: './others.component.html',
  styleUrls: ['./others.component.css']
})
export class OthersComponent implements OnInit, OnDestroy {

  otherFilter: any = {};
  othersList: any[] = [];
  @Input() device: Device = new Device();
  isOthersLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedOther: any;
  isFilterSelected = false;
  modalConfig: any;
  otherTableConfig: any = {};
  pageType: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
      this.otherFilter.gateway_id = this.device.device_id;
    } else {
      this.otherFilter.device_id = this.device.device_id;
    }
    this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.otherTableConfig = {
        type: 'other',
        headers: ['Timestamp', 'Message ID', 'Message Type', 'Other Message'],
        data: [
          {
            name: 'Timestamp',
            key: 'local_created_date',
          },
          {
            name: 'Message Type',
            key: 'type',
          },
          {
            name: 'Message ID',
            key: 'message_id',
          },
          {
            name: 'Other Message',
            key: undefined,
          }
        ]
      };
      if (this.pageType === 'gateway') {
        this.otherTableConfig.data.splice(1, 1);
        this.otherTableConfig.data.splice(1, 0, {
          name: 'Asset Name',
          key: 'device_id'
        });
      }
    });

  }

  searchOther(filterObj) {
    console.log(filterObj);
    this.isFilterSelected = true;
    this.isOthersLoading = true;
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
    } else if (filterObj.dateOption === 'custom') {
      if (filterObj.from_date) {
        obj.from_date = (filterObj.from_date.unix());
      }
      if (filterObj.to_date) {
        obj.to_date = filterObj.to_date.unix();
      }
    }
    delete obj.dateOption;
    this.otherFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceotherMessagesList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.othersList = response.data;
          this.othersList.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
        }
        this.isOthersLoading = false;
      }, error => this.isOthersLoading = false
    ));
  }

  openOtherMessageModal(obj) {
    if (obj.type === this.otherTableConfig.type) {
      this.selectedOther = obj.data;
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true
      };
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
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }
}
