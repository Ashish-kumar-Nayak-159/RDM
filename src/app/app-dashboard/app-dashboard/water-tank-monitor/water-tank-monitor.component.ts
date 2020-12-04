import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Component, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-water-tank-monitor',
  templateUrl: './water-tank-monitor.component.html',
  styleUrls: ['./water-tank-monitor.component.css']
})
export class WaterTankMonitorComponent implements OnInit, AfterViewInit, OnDestroy {

  appName: string;
  userData: any;
  @Input() contextApp: any;
  selectedHierarchy: any = {};
  selectedDevice: any;
  properties: any[] = [];
  telemetryData: any;
  telemetryRefreshInterval: NodeJS.Timeout;
  selectedTab = 'county';
  @Input() tileData: any;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.selectedHierarchy = {
        App: this.appName
      };
    });
  }


  ngAfterViewInit() {
    $('.tk').each(function(){
    const amount: any = $('.lq').attr('data-amount');
    const quantity = amount;
    $(this).find('.lq').animate({height : parseInt(amount, 10) + '%'}, 1000);
    $('.ring').css({height : 100 - amount + 10 + '%'});
    $('.text-tank').text(quantity  + '%');
      });
    $('.text-tank').each(function(){
      const $this = $(this);
      jQuery({ Counter: 0 }).animate({ Counter: $this.text() }, {
      duration: 1000,
      easing: 'swing',
      step() {
        $this.text(Math.ceil(this.Counter) + '%');
      }
      });
      });
  }
  onClickOfTab(type) {
    this.selectedTab = type;
    this.selectedDevice = undefined;
    this.selectedHierarchy = {
      App: this.appName
    };
  }

  onOptionChange(value) {
    $('.tk').each(function(){
      const amount: any = value;
      const quantity = amount;
      $(this).find('.lq').animate({height : parseInt(amount, 10) + '%'}, 1000);
      $('.ring').css({height : 100 - amount + 10 + '%'});
      $('.text-tank').text(quantity  + '%');
    });
    $('.text-tank').each(function(){
      const $this = $(this);
      jQuery({ Counter: 0 }).animate({ Counter: $this.text() }, {
      duration: 1000,
      easing: 'swing',
      step() {
        $this.text(Math.ceil(this.Counter) + '%');
      }
      });
      });
  }

  search() {
    clearInterval(this.telemetryRefreshInterval);
    console.log(this.selectedHierarchy);
    const obj = {
      app: this.appName,
      hierarchy: JSON.stringify(this.selectedHierarchy)
    };
    this.selectedDevice = undefined;
    this.deviceService.getDeviceList(obj).subscribe(
      async (response: any) => {
        if (response?.data?.length > 0) {
          this.selectedDevice = response.data[0];
          await this.getThingsModelProperties();
          this.getDeviceTelemetry();
          this.telemetryRefreshInterval = setInterval(() => {
            this.getDeviceTelemetry();
          }, 5500);
        }
      }
    );
  }

  getThingsModelProperties() {
    // this.properties = {};
    return new Promise((resolve, reject) => {
      const obj = {
        app: this.appName,
        name: this.selectedDevice.tags.device_type
      };
      this.properties = [];
      this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.properties = response.properties.measured_properties ? response.properties.measured_properties : [];
          resolve();
        }
      );
    });
  }


  getDeviceTelemetry() {
    const filterObj = {
      epoch: true,
      app: this.appName,
      device_id: this.selectedDevice.device_id,
      count: 1,
      message_props: '',
    };
    this.telemetryData = undefined;
    this.properties.forEach((prop, i) => filterObj.message_props += prop.json_key + (this.properties[i + 1] ? ',' : ''));
    this.deviceService.getDeviceTelemetry(filterObj).subscribe((response: any) => {
      if (response?.data?.length > 0) {
        this.telemetryData = response.data[0];
        this.onOptionChange(this.telemetryData['level']);
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.telemetryRefreshInterval);
  }

}
