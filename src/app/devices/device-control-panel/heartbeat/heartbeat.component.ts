import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Device } from 'src/app/models/device.model';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;
@Component({
  selector: 'app-heartbeat',
  templateUrl: './heartbeat.component.html',
  styleUrls: ['./heartbeat.component.css']
})
export class HeartbeatComponent implements OnInit, OnDestroy {

  heartBeatFilter: any = {};
  heartbeats: any[] = [];
  @Input() device: Device = new Device();
  isHeartbeatLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedHeartbeat: any;
  isFilterSelected = false;
  modalConfig: any;
  pageType: string;
  heartbeatTableConfig: any = {};
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY ) {
      this.heartBeatFilter.gateway_id = this.device.device_id;
    } else {
      this.heartBeatFilter.device_id = this.device.device_id;
    }
    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.heartbeatTableConfig = {
        type: 'heartbeat',
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
          }
        ]
      };
      if (this.pageType === 'gateway') {
        this.heartbeatTableConfig.data.splice(1, 1);
        this.heartbeatTableConfig.data.splice(1, 0, {
          name: 'Asset Name',
          key: 'device_id'
        });
      }
    }));
    this.heartBeatFilter.epoch = true;

  }

  searchHeartBeat(filterObj) {
    this.isFilterSelected = true;
    this.isHeartbeatLoading = true;
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
    delete obj.dateOption;
    this.heartBeatFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceHeartBeats(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.heartbeats = response.data;
          this.heartbeats.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
        }
        this.isHeartbeatLoading = false;
      }, error => this.isHeartbeatLoading = false
    ));
  }

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      const obj = {
        app: dataobj.app,
        id: dataobj.id
      };
      this.apiSubscriptions.push(this.deviceService.getDeviceMessageById(obj, 'heartbeat').subscribe(
        (response: any) => {
          resolve(response.message);
        }
      ));
    });
  }

  openHeratbeatMessageModal(obj) {
    if (obj.type === this.heartbeatTableConfig.type) {
      this.selectedHeartbeat = obj.data;
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true
      };
      this.getMessageData(obj.data).then(message => {
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
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }
}
