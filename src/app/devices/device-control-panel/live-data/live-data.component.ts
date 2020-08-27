import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Device } from 'src/app/models/device.model';
import { GoogleChartInterface } from 'ng2-google-charts';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import * as moment from 'moment';

@Component({
  selector: 'app-live-data',
  templateUrl: './live-data.component.html',
  styleUrls: ['./live-data.component.css']
})
export class LiveDataComponent implements OnInit {

  historyFilter: any = {};
  apiSubscriptions: Subscription[] = [];
  historyData: any[] = [];
  isHistoryAPILoading = false;
  @Input() device = new Device();
  userData: any;
  isFilterSelected = false;
  propertyList: any[] = [];
  //google chart
  public lineGoogleChartData: GoogleChartInterface = {  // use :any or :GoogleChartInterface
    chartType: 'LineChart',
    dataTable: [],
    options: {
      interpolateNulls: true,
      hAxis: {
        viewWindowMode: 'pretty',
        slantedText: true,
        textStyle: {
          fontSize: 10
        },
        slantedTextAngle:60
      },
      legend: {
        position: 'top'
      },
      series:{
      },
      vAxes: {
          // Adds titles to each axis.
        },
      height: 300,
      width: 900,
      curveType: 'function',
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 10.0}
    }
};
  appName: any;
  refreshInterval: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);

    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.propertyList = CONSTANTS.APP_PROP_LIST[this.appName];
      this.historyFilter.app = this.appName;
    });
    this.historyFilter.epoch = true;
    this.historyFilter.device_id = this.device.device_id;
    const now = moment().utc();
    this.historyFilter.to_date = now.unix();
    this.historyFilter.from_date = (now.subtract(1, 'minute')).unix();

    console.log(this.historyFilter);
  }

  searchData() {
    if (!this.historyFilter.y1AxisProperty || (this.historyFilter.y1AxisProperty && this.historyFilter.y1AxisProperty.length === 0)) {
      this.toasterService.showError('Y1 Axis Property is required', 'Load Chart');
      return;
    }
    this.isHistoryAPILoading = true;
    this.lineGoogleChartData.dataTable = [];
    const obj = {...this.historyFilter};
    obj.message_props = '';
    obj.y1AxisProperty.forEach(prop => obj.message_props += prop + ',');
    if (obj.y2AxisProperty) {
      obj.y2AxisProperty.forEach(prop => obj.message_props += prop + ',');
    }
    if (obj.message_props.charAt(obj.message_props.length - 1) === ',') {
      obj.message_props = obj.message_props.substring(0, obj.message_props.length - 1);
    }
    console.log(this.historyFilter);
    delete obj.y1AxisProperty;
    delete obj.y2AxisProperty;
    this.apiSubscriptions.push(this.deviceService.getDeviceTelemetry(obj).subscribe(
      (response: any) => {
        this.isFilterSelected = true;
        if (response && response.data) {
          console.log(response);
          this.historyData = response.data;
          this.isHistoryAPILoading = false;
          this.historyData.reverse();

          console.log('before interval');
          this.refreshInterval = setInterval(() => {
            console.log('in interval');
            obj.from_date = obj.to_date;
            obj.to_date = (moment().utc()).unix();
            this.deviceService.getDeviceTelemetry(obj).subscribe(
              (response: any) => {
                if (response && response.data) {
                  let telemetryData = response.data;
                  telemetryData.reverse();
                  this.updateChart(telemetryData);
                }
              });
          }, 15000);
          this.loadChart();
        }
      }, error => this.isHistoryAPILoading = false
    ));
  }

  loadChart() {
    const dataList = [];
    dataList.push('DateTime');
    let title = '';
    this.historyFilter.y1AxisProperty.forEach((prop, index) => {
      dataList.splice(dataList.length, 0, prop);
      title += prop + (index !== this.historyFilter.y1AxisProperty.length - 1 ? ' & ' : '');
      this.lineGoogleChartData.options.series[index.toString()] = {targetAxisIndex: 0};
    });
    this.lineGoogleChartData.options.vAxes = {
      1: {title:  title}
    }
    if (this.historyFilter.y2AxisProperty) {
      title = '';
      this.historyFilter.y2AxisProperty.forEach((prop, index) => {
        dataList.splice(dataList.length, 0, prop);
        title += prop + (index !== this.historyFilter.y2AxisProperty.length - 1 ? ' & ' : '');
        this.lineGoogleChartData.options.series[(this.historyFilter.y1AxisProperty.length - 1) + index] =  {targetAxisIndex:1};
      });
      this.lineGoogleChartData.options.vAxes['0'] ={title: title};
    }
    this.lineGoogleChartData.dataTable.push(dataList);
    this.historyData.forEach(history =>  {
      history.local_created_date = this.commonService.convertUTCDateToLocal(history.message_date);

      const list = [];
      list.splice(0, 0, new Date(history.local_created_date));
      this.historyFilter.y1AxisProperty.forEach(prop => {
        if (!isNaN(parseFloat(history[prop]))) {
          list.splice(list.length, 0, parseFloat(history[prop]));
        } else {
          list.splice(list.length, 0, null);
        }
      });
      if (this.historyFilter.y2AxisProperty) {
        this.historyFilter.y2AxisProperty.forEach(prop => {
          if (!isNaN(parseFloat(history[prop]))) {
            list.splice(list.length, 0, parseFloat(history[prop]));
          } else {
            list.splice(list.length, 0, null);
          }
        });
      }
      this.lineGoogleChartData.dataTable.splice(this.lineGoogleChartData.dataTable.length, 0, list);
    });
    console.log(this.lineGoogleChartData);
    if (this.lineGoogleChartData.dataTable.length > 1) {
    let ccComponent = this.lineGoogleChartData.component;
    let ccWrapper = ccComponent.wrapper;

    //force a redraw
    ccComponent.draw();
    }
  }

  updateChart(telemetryData) {
    telemetryData.forEach(obj => {
      obj.local_created_date = this.commonService.convertUTCDateToLocal(obj.message_date);
      const list = [];
      list.splice(0, 0, new Date(obj.local_created_date));
      this.historyFilter.y1AxisProperty.forEach(prop => {
        if (!isNaN(parseFloat(obj[prop]))) {
          list.splice(list.length, 0, parseFloat(obj[prop]));
        } else {
          list.splice(list.length, 0, null);
        }
      });
      if (this.historyFilter.y2AxisProperty) {
        this.historyFilter.y2AxisProperty.forEach(prop => {
          if (!isNaN(parseFloat(obj[prop]))) {
            list.splice(list.length, 0, parseFloat(obj[prop]));
          } else {
            list.splice(list.length, 0, null);
          }
        });
      }
      this.lineGoogleChartData.dataTable.splice(this.lineGoogleChartData.dataTable.length, 0, list);
    });
    console.log(this.lineGoogleChartData);
    if (this.lineGoogleChartData.dataTable.length > 1) {
      let ccComponent = this.lineGoogleChartData.component;
      let ccWrapper = ccComponent.wrapper;

      //force a redraw
      ccComponent.draw();
      }
  }

  clear() {
    this.historyFilter = {};
    this.historyFilter.epoch = true;
    this.historyFilter.device_id = this.device.device_id;
    this.historyFilter.app = this.appName;
    const now = moment().utc();
    this.historyFilter.to_date = now.unix();
    this.historyFilter.from_date = (now.subtract(1, 'minute')).unix();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    clearInterval(this.refreshInterval);
  }

}
