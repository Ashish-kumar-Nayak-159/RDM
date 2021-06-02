import { DeviceService } from 'src/app/services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';

@Component({
  selector: 'app-device-messages-wrapper',
  templateUrl: './device-messages-wrapper.component.html',
  styleUrls: ['./device-messages-wrapper.component.css']
})
export class DeviceMessagesWrapperComponent implements OnInit {

  filterObj: any = {};
  originalFilterObj: any = {};
  notifications: any[] = [];
  @Input() device: Device = new Device();
  @Input() componentState: any;
  contextApp: any;
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.filterObj.device_id = this.device.device_id;
    this.filterObj.count = 10;
    this.filterObj.app = this.contextApp.app;
    this.filterObj.displayNotificationOptions = true;
    this.filterObj.source = 'Notification';
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    this.loadFromCache();
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
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    this.search(this.filterObj);
  }

  search(filterObj) {
    this.filterObj = filterObj;
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    setTimeout(() => this.deviceService.searchNotificationsEventEmitter.emit(), 100);

  }

}
