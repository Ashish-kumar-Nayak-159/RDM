import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';

@Component({
  selector: 'app-specific-direct-method',
  templateUrl: './specific-direct-method.component.html',
  styleUrls: ['./specific-direct-method.component.css']
})
export class SpecificDirectMethodComponent implements OnInit {

  @Input() pageType: any;
  @Input() device: Device = new Device();
  userData: any;
  displayType: string;
  listName: string;
  appName: string;
  apiSubscriptions: Subscription[] = [];
  controlWidgets: any[] = [];
  selectedWidget: any;
  constructor(

    private commonService: CommonService,
    private route: ActivatedRoute,
    private deviceTypeService: DeviceTypeService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.displayType = 'compose';
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.listName = params.get('listName');
      this.listName = this.listName.slice(0, -1);
      if (this.pageType.includes('control')) {
        this.getControlWidgets();
      } else {
        this.getConfigureWidgets();
      }
    });
  }

  getControlWidgets() {
    const obj = {
      app: this.appName,
      device_type: this.device.tags?.device_type
    };
    this.apiSubscriptions.push(this.deviceTypeService.getThingsModelControlWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data.filter(widget => widget.metadata.communication_technique === 'Direct Method');
        }
      }
    ));
  }

  getConfigureWidgets() {
    const obj = {
      app: this.appName,
      device_type: this.device.tags?.device_type
    };
    this.apiSubscriptions.push(this.deviceTypeService.getThingsModelConfigurationWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data.filter(widget => widget.metadata.communication_technique === 'Direct Method');
        }
      }
    ));
  }

}
