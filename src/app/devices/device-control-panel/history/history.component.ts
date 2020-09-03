import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { DeviceService } from './../../../services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import { Device } from 'src/app/models/device.model';
import { CONSTANTS } from './../../../app.constants';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import { GoogleChartInterface } from 'ng2-google-charts';
import * as moment from 'moment';
import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  historyFilter: any = {};
  apiSubscriptions: Subscription[] = [];
  historyData: any[] = [];
  isHistoryAPILoading = false;
  @Input() device = new Device();
  userData: any;
  isFilterSelected = false;
  propertyList: any[] = [];
  dropdownPropList = [];
  y1AxisProps = [];
  y2AxisProp = [];

  // google chart
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
        slantedTextAngle: 60
      },
      legend: {
        position: 'top'
      },
      series: {
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
    this.historyFilter.dateOption = '5 mins';
    this.propertyList.forEach(item => {
      this.dropdownPropList.push({
        id: item
      });
    });
    console.log(this.historyFilter);

  }

  onDateOptionChange() {
      this.historyFilter.from_date = undefined;
      this.historyFilter.to_date = undefined;
  }

  searchHistory() {
    this.historyFilter.y1AxisProperty = [];
    this.historyFilter.y2AxisProperty = [];
    this.y1AxisProps.forEach(item => {
      this.historyFilter.y1AxisProperty.push(item.id);
    });
    this.y2AxisProp.forEach(item => {
      this.historyFilter.y2AxisProperty.push(item.id);
    });
    if (!this.historyFilter.y1AxisProperty || (this.historyFilter.y1AxisProperty && this.historyFilter.y1AxisProperty.length === 0)) {
      this.toasterService.showError('Y1 Axis Property is required', 'Load Chart');
      return;
    }
    this.isHistoryAPILoading = true;
    this.lineGoogleChartData.dataTable = [];
    const obj = {...this.historyFilter};
    const now = moment().utc();
    if (this.historyFilter.dateOption === '5 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(5, 'minute')).unix();
    } else if (this.historyFilter.dateOption === '30 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(30, 'minute')).unix();
    } else if (this.historyFilter.dateOption === '1 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(1, 'hour')).unix();
    } else if (this.historyFilter.dateOption === '24 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(24, 'hour')).unix();
    } else {
      if (this.historyFilter.from_date) {
        obj.from_date = (this.historyFilter.from_date.unix());
      }
      if (this.historyFilter.to_date) {
        obj.to_date = this.historyFilter.to_date.unix();
      }
    }
    obj.message_props = '';
    obj.y1AxisProperty.forEach(prop => obj.message_props += prop + ',');
    if (obj.y2AxisProperty) {
      obj.y2AxisProperty.forEach(prop => obj.message_props += prop + ',');
    }
    if (obj.message_props.charAt(obj.message_props.length - 1) === ',') {
      obj.message_props = obj.message_props.substring(0, obj.message_props.length - 1);
    }
    console.log(this.historyFilter);
    delete obj.dateOption;
    delete obj.y1AxisProperty;
    delete obj.y2AxisProperty;
    this.apiSubscriptions.push(this.deviceService.getDeviceTelemetry(obj).subscribe(
      (response: any) => {
        this.isFilterSelected = true;
        if (response && response.data) {
          this.historyData = response.data;
          this.isHistoryAPILoading = false;
          this.historyData.reverse();

          const dataList = [];
          dataList.push('DateTime');
          let title = '';
          this.historyFilter.y1AxisProperty.forEach((prop, index) => {
            dataList.splice(dataList.length, 0,  {label: prop, type: 'number'});
            title += prop + (index !== this.historyFilter.y1AxisProperty.length - 1 ? ' & ' : '');
            this.lineGoogleChartData.options.series[index.toString()] = {targetAxisIndex: 0};
          });
          this.lineGoogleChartData.options.vAxes = {
            0: {title}
          };
          if (this.historyFilter.y2AxisProperty) {
            title = '';
            this.historyFilter.y2AxisProperty.forEach((prop, index) => {
              dataList.splice(dataList.length, 0,  {label: prop, type: 'number'});
              title += prop + (index !== this.historyFilter.y2AxisProperty.length - 1 ? ' & ' : '');
              this.lineGoogleChartData.options.series[(this.historyFilter.y1AxisProperty.length) + index] =  {targetAxisIndex: 1};
            });
            this.lineGoogleChartData.options.vAxes['1'] = {title};
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
          const ccComponent = this.lineGoogleChartData.component;
          // force a redraw
          ccComponent.draw();
          }
        }
      }, error => this.isHistoryAPILoading = false
    ));
  }

  clear() {
    this.historyFilter = {};
    this.historyFilter.epoch = true;
    this.historyFilter.device_id = this.device.device_id;
    this.historyFilter.app = this.appName;
  }

}
