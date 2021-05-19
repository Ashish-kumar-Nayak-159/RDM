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
  @Input() componentState: any;
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
    if (this.componentState === CONSTANTS.IP_GATEWAY) {
      this.otherTableConfig.data.splice(1, 1);
      this.otherTableConfig.data.splice(1, 0, {
        name: 'Asset Name',
        key: 'device_id'
      });
    }

  }

  searchOther(filterObj) {
    console.log(filterObj);
    this.isFilterSelected = true;
    this.isOthersLoading = true;
    const obj = {...filterObj};
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

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      const obj = {
        app: dataobj.app,
        id: dataobj.id
      };
      this.apiSubscriptions.push(this.deviceService.getDeviceMessageById(obj, 'other').subscribe(
        (response: any) => {
          resolve(response.message);
        }
      ));
    });
  }

  openOtherMessageModal(obj) {
    if (obj.type === this.otherTableConfig.type) {
      this.selectedOther = obj.data;
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true
      };
      this.getMessageData(obj.data).then(message => {
        this.selectedOther.message = message;
      });
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
