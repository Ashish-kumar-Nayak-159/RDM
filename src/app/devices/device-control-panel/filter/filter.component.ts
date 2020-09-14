import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from './../../../app.constants';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from 'src/app/services/devices/device.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @Input() filterObj: any;
  originalFilterObj: any = {};
  userData: any;
  @Output() filterSearch: EventEmitter<any> = new EventEmitter<any>();
  appName: any;
  pageType: string;
  constantData: CONSTANTS;
  devices: any[] = [];
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private deviceService: DeviceService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.filterObj.app = this.appName;
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
    });

    if (this.filterObj.gateway_id) {
      this.getDevicesListByGateway();
    }
    this.filterObj.count = 10;
    this.originalFilterObj = {};
    this.originalFilterObj = {...this.filterObj};
  }

  getDevicesListByGateway() {
    this.devices = [];
    const obj = {
      gateway_id: this.filterObj.gateway_id,
      app: this.appName
    };
    this.deviceService.getNonIPDeviceList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.devices = response.data;
        }
      }, errror => {}
    );
  }

  onDateOptionChange() {
    if (this.filterObj.dateOption !== 'custom') {
      this.filterObj.from_date = undefined;
      this.filterObj.to_date = undefined;
    }
  }

  search() {
    this.filterSearch.emit(this.filterObj);
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    this.filterObj = {};
    this.filterObj = {...this.originalFilterObj};
  }
}
