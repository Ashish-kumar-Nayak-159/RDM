import { Component, OnInit, OnDestroy } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { DeviceService } from './../../services/devices/device.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Alert } from 'src/app/models/applicationDashboard.model';
import { GoogleChartInterface } from 'ng2-google-charts';
import * as moment from 'moment';

@Component({
  selector: 'app-application-visualization',
  templateUrl: './application-visualization.component.html',
  styleUrls: ['./application-visualization.component.css']
})
export class ApplicationVisualizationComponent implements OnInit, OnDestroy {

  userData: any;
  appData: any = {};
  latestAlerts: any[] = [];
  isAlertAPILoading = false;
  propertyList: any[] = [];
  selectedAlert: any;
  refreshInterval: any;
  lineGoogleChartConfig: GoogleChartInterface = {  // use :any or :GoogleChartInterface
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
      height: 280,
      curveType: 'function',
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 10.0}
    }
  };
  barGoogleChartConfig: GoogleChartInterface = {
    chartType: 'Gauge',
    dataTable: [
      ['Label', 'Value']
    ],
    options: {
      redFrom: 90, redTo: 100,
      yellowFrom: 75, yellowTo: 90,
      minorTicks: 5
    }
  };
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private route: ActivatedRoute

  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      if (params.get('applicationId')) {
        this.appData.app = params.get('applicationId');
      }
      this.commonService.breadcrumbEvent.emit({
        data: [
            {
              title: this.appData.app,
              url: 'applications/' + this.appData.app
            },
            {
              title: 'Visualization',
              url: 'applications/' + this.appData.app + '/visualization'
            }
        ]
      });
      this.getLatestAlerts();
      this.propertyList = CONSTANTS.APP_PROP_LIST[this.appData.app];
    });

  }

  getLatestAlerts() {
    this.latestAlerts = [];
    this.isAlertAPILoading = true;
    const filterObj = {
      app: this.appData.app,
      count: 10
    };
    this.deviceService.getDeviceAlerts(filterObj).subscribe(
      (response: any) => {
        this.latestAlerts = response.data;
        this.latestAlerts.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date));
        this.isAlertAPILoading = false;
      }, error => this.isAlertAPILoading = false
    );
  }

  onClickOfViewGraph(alert) {
    this.selectedAlert = alert;
    console.log(alert);
    this.lineGoogleChartConfig.dataTable = [];
    this.lineGoogleChartConfig.options.series = {};
    this.lineGoogleChartConfig.options.vAxes = {};
    const now = moment().utc();
    const filterObj = {
      epoch: true,
      app: this.appData.app,
      device_id: alert.device_id,
      message_props: '',
      from_date: ((moment.utc(alert.created_date, 'M/DD/YYYY h:mm:ss A')).subtract(30, 'minute')).unix(),
      to_date: ((moment.utc(alert.created_date, 'M/DD/YYYY h:mm:ss A')).add(30, 'minute')).unix()
    };
    this.propertyList.forEach((prop, index) => filterObj.message_props += prop + (index !== (this.propertyList.length - 1) ? ',' : ''));
    console.log(filterObj);
    this.deviceService.getDeviceTelemetry(filterObj).subscribe(
      (response: any) => {
        console.log(response);
        if (response && response.data) {
          const telemetryData = response.data;
          this.loadGaugeChart(telemetryData[0]);
          telemetryData.reverse();
          console.log('load line chart');
          this.loadLineChart(telemetryData);
        }
      }
    );
    clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => {
      filterObj.from_date = filterObj.to_date;
      filterObj.to_date = (moment().utc()).unix();
      this.deviceService.getDeviceTelemetry(filterObj).subscribe(
        (response: any) => {
          if (response && response.data) {
            const telemetryData = response.data;
            this.loadGaugeChart(telemetryData[0]);
            telemetryData.reverse();
            // this.updateLineChart(telemetryData);
          }
        });

    }, 20000);
  }

  loadLineChart(telemetryData) {
    console.log(telemetryData);
    const dataList = [];
    dataList.push('DateTime');
    let title = '';
    this.propertyList.forEach((prop, index) => {
      if (index % 2 !== 0) {
        dataList.splice(dataList.length, 0,  {label: prop, type: 'number'});
        title += prop + (prop[index + 2] ? ' & ' : '');
        this.lineGoogleChartConfig.options.series[Object.keys(this.lineGoogleChartConfig.options.series).length] = {targetAxisIndex: 0};
      }
    });
    if (title.charAt(title.length - 2) === '&') {
      title = title.substring(0, title.length - 2);
    }
    this.lineGoogleChartConfig.options.vAxes = {
      0: {title}
    };
    title = '';
    this.propertyList.forEach((prop, index) => {
      console.log('index   ', index);
      if (index % 2 === 0) {
        console.log('inn iff');
        dataList.splice(dataList.length, 0,  {label: prop, type: 'number'});
        title += prop + (prop[index + 2] ? ' & ' : '');
        this.lineGoogleChartConfig.options.series[(Object.keys(this.lineGoogleChartConfig.options.series).length)] =  {targetAxisIndex: 1};
      }
    });
    if (title.charAt(title.length - 2) === '&') {
      title = title.substring(0, title.length - 2);
    }
    this.lineGoogleChartConfig.options.vAxes['1'] = {title};
    this.lineGoogleChartConfig.dataTable.push(dataList);
    telemetryData.forEach(obj => {
      obj.local_created_date = this.commonService.convertUTCDateToLocal(obj.message_date);
      const list = [];
      list.splice(0, 0, new Date(obj.local_created_date));
      this.propertyList.forEach((prop, index) => {
        if (index % 2 !== 0) {
          list.splice(list.length, 0, parseFloat(obj[prop]));
        }
      });
      this.propertyList.forEach((prop, index) => {
        if (index % 2 === 0) {
          list.splice(list.length, 0, parseFloat(obj[prop]));
        }
      });
      this.lineGoogleChartConfig.dataTable.splice(this.lineGoogleChartConfig.dataTable.length, 0, list);
    });
    console.log(this.lineGoogleChartConfig);
    if (this.lineGoogleChartConfig.dataTable.length > 1) {
    const ccComponent = this.lineGoogleChartConfig.component;
    // force a redraw
    if (ccComponent) {
      ccComponent.draw();
    }
    }
  }

  updateLineChart(telemetryData) {
    telemetryData.forEach(obj => {
      obj.local_created_date = this.commonService.convertUTCDateToLocal(obj.message_date);
      const list = [];
      list.splice(0, 0, new Date(obj.local_created_date));
      this.propertyList.forEach((prop, index) => {
        if (index % 2 !== 0) {
          list.splice(list.length, 0, parseFloat(obj[prop]));
        }
      });
      this.propertyList.forEach((prop, index) => {
        if (index % 2 === 0) {
          list.splice(list.length, 0, parseFloat(obj[prop]));
        }
      });
      this.lineGoogleChartConfig.dataTable.splice(this.lineGoogleChartConfig.dataTable.length, 0, list);
    });
    console.log(this.lineGoogleChartConfig);
    const ccComponent = this.lineGoogleChartConfig.component;
    ccComponent.draw();
  }

  loadGaugeChart(telemetryData) {
    if (telemetryData) {
    this.barGoogleChartConfig.dataTable = [];
    this.barGoogleChartConfig.dataTable.push(['Label', 'Value']);
    this.propertyList.forEach(prop => {
      const list = [];
      list.push(prop);
      list.push(parseFloat(telemetryData[prop]));
      this.barGoogleChartConfig.dataTable.splice(this.barGoogleChartConfig.dataTable.length, 0, list);
    });
    console.log(this.barGoogleChartConfig);
    const component = this.barGoogleChartConfig.component;
    component.draw();
    }
  }

  updateGaugeChart(telemetryData) {
    this.barGoogleChartConfig.dataTable.forEach(data => {

    });
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }


}
