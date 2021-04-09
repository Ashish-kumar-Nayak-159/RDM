import { ToasterService } from './../../services/toaster.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DeviceService } from './../../services/devices/device.service';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { CONSTANTS } from 'src/app/app.constants';

declare var $: any;
@Component({
  selector: 'app-application-events',
  templateUrl: './application-events.component.html',
  styleUrls: ['./application-events.component.css']
})
export class ApplicationEventsComponent implements OnInit {

  contextApp: any;
  filterObj: any = {};
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;
  apiSubscriptions: Subscription[] = [];
  devices: any[] = [];
  originalDevices: any[] = [];
  isEventLoading = false;
  events: any[] = [];
  eventTableConfig: any;
  hierarchyArr: any = {};
  configureHierarchy: any = {};
  isFilterSelected = false;
  modalConfig: { jsonDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean; };
  selectedEvent: any;
  today = new Date();
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private toasterService: ToasterService
  ) { }

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.commonService.breadcrumbEvent.emit({
      type: 'replace',
      data: [
        {
          title: this.contextApp.user.hierarchyString,
          url: 'applications/' + this.contextApp.app
        },
          {
            title: 'Events',
            url: 'applications/' + this.contextApp.app + '/events'
          }
      ]
    });
    this.filterObj.count = 10;
    this.filterObj.app = this.contextApp.app;
    this.filterObj.epoch = true;
    this.eventTableConfig = {
      type: 'event',
      data: [
        {
          name: 'Timestamp',
          key: 'local_created_date',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Asset',
          key: 'display_name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Event',
          key: 'event_type',
          type: 'text',
          headerClass: '',
          valueclass: ''
        }
      ]
    };
    await this.getAllDevices();
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }


    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
      this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
      if (this.contextApp.user.hierarchy[level]) {
        this.onChangeOfHierarchy(index, false);
      }
      }
    });
  }

  async onChangeOfHierarchy(i, flag = true) {
    Object.keys(this.configureHierarchy).forEach(key => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach(key => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
    // let hierarchy = {...this.configureHierarchy};

    if (flag) {
      const hierarchyObj: any = { App: this.contextApp.app};
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
        }
      });
      if (Object.keys(hierarchyObj).length === 1) {
        this.devices = JSON.parse(JSON.stringify(this.originalDevices));
      } else {
      const arr = [];
      this.devices = [];
      this.originalDevices.forEach(device => {
        let flag1 = false;
        Object.keys(hierarchyObj).forEach(hierarchyKey => {
          if (device.hierarchy[hierarchyKey] && device.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
            flag1 = true;
          } else {
            flag1 = false;
          }
        });
        if (flag1) {
          arr.push(device);
        }
      });
      this.devices = JSON.parse(JSON.stringify(arr));
      }
      if (this.devices?.length === 1) {
        this.filterObj.device = this.devices[0];
      }
      // await this.getDevices(hierarchyObj);
    }
    let count = 0;
    Object.keys(this.configureHierarchy).forEach(key => {
      if (this.configureHierarchy[key]) {
        count ++;
      }
    });
    if (count === 0) {
      this.hierarchyArr = [];
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
    }

  }

  compareFn(c1, c2): boolean {
    return c1 && c2 ? c1.device_id === c2.device_id : c1 === c2;
  }

  getAllDevices() {
    return new Promise<void>((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
        type: CONSTANTS.IP_DEVICE + ',' + CONSTANTS.IP_GATEWAY
      };
      this.apiSubscriptions.push(this.deviceService.getIPDevicesAndGateways(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response?.data) {
            this.devices = response.data;
            this.originalDevices = JSON.parse(JSON.stringify(this.devices));
          }
          resolve();
        }
      ));
    });
  }

  onDateOptionChange() {
    if (this.filterObj.dateOption !== 'custom') {
      this.filterObj.from_date = undefined;
      this.filterObj.to_date = undefined;
    }
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
  }

  onDateChange(event) {
    this.filterObj.from_date = moment(event.value[0]).second(0).utc();
    this.filterObj.to_date = moment(event.value[1]).second(0).utc();
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
    if (this.filterObj.dateOption !== 'date range') {
      this.filterObj.dateOption = undefined;
    }
  }

  onSingleDateChange(event) {
    this.filterObj.from_date = moment(event.value).utc();
    this.filterObj.to_date = ((moment(event.value).add(23, 'hours')).add(59, 'minute')).utc();
    const to = this.filterObj.to_date.unix();
    const current = (moment().utc()).unix();
    if (current < to) {
      this.filterObj.to_date = moment().utc();
    }
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.filterObj.dateOption !== 'date') {
      this.filterObj.dateOption = undefined;
    }
  }

  searchEvents() {
    this.isFilterSelected = true;
    this.isEventLoading = true;
    const obj = {...this.filterObj};
    const now = moment().utc();
    if (this.filterObj.dateOption === '5 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(5, 'minute')).unix();
    } else if (this.filterObj.dateOption === '30 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(30, 'minute')).unix();
    } else if (this.filterObj.dateOption === '1 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(1, 'hour')).unix();
    } else if (this.filterObj.dateOption === '24 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(24, 'hour')).unix();
    } else {
      if (this.filterObj.from_date) {
        obj.from_date = (this.filterObj.from_date.unix());
      }
      if (this.filterObj.to_date) {
        obj.to_date = this.filterObj.to_date.unix();
      }
    }
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Asset Life cycle events');
      this.isEventLoading = false;
      this.isFilterSelected = false;
      return;
    }
    obj.hierarchy = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        obj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });
    obj.hierarchy = JSON.stringify(obj.hierarchy);
    obj.device_id = obj.device?.device_id;
    delete obj.device;
    delete obj.dateOption;
    this.apiSubscriptions.push(this.deviceService.getDeviceLifeCycleEvents(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.events = response.data;
          this.events.forEach(item => {
            const eventMsg = item.event_type.split('.');
            eventMsg[eventMsg.length - 1] = eventMsg[eventMsg.length - 1].replace('Asset', '');
            eventMsg[eventMsg.length - 1] = (item.category === CONSTANTS.IP_GATEWAY ? 'Gateway ' : 'Asset ' ) +
            eventMsg[eventMsg.length - 1];
            item.event_type = eventMsg[eventMsg.length - 1];
            item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date);
          });
        }
        this.isEventLoading = false;
      }, error => this.isEventLoading = false
    ));
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
