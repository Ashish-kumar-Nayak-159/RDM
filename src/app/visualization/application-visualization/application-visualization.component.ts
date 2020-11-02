import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { Device } from './../../models/device.model';
import { ToasterService } from './../../services/toaster.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { DeviceService } from './../../services/devices/device.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Alert } from 'src/app/models/applicationDashboard.model';
import { GoogleChartInterface } from 'ng2-google-charts';
import * as moment from 'moment';

declare var $: any;
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
  selectedDevice: any;
  refreshInterval: any;
  beforeInterval = 10;
  afterInterval = 10;
  lineGoogleChartConfig: GoogleChartInterface = {  // use :any or :GoogleChartInterface
    chartType: 'ComboChart',
    dataTable: [],
    options: {
      interpolateNulls: true,
      pointSize: 0.5,
      hAxis: {
        viewWindowMode: 'pretty',
        slantedText: true,
        textStyle: {
          fontSize: 10
        },
        slantedTextAngle: 60
      },
      seriesType: 'line',
      legend: {
        position: 'top'
      },
      series: {
      },
      vAxes: {
          // Adds titles to each axis.
        },
      height: 280,
      width: 1000,
      curveType: 'function',
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 10.0}
    }
  };

  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private route: ActivatedRoute

  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      if (params.get('applicationId')) {
        this.appData = this.userData.apps.filter(
          app => app.app === params.get('applicationId')
        )[0];
      }
      this.commonService.breadcrumbEvent.emit({
        type: 'replace',
        data: [
          {
            title: this.appData.user.hierarchyString,
            url: 'applications/' + this.appData.app
          },
            {
              title: 'Visualization',
              url: 'applications/' + this.appData.app + '/visualization'
            }
        ]
      });
      this.getLatestAlerts();
     // this.propertyList = this.appData.metadata.properties ? this.appData.metadata.properties : [];
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

  getDeviceData() {
    return new Promise((resolve, reject) => {
      const obj = {
        app: this.appData.app,
        name: this.selectedAlert.device_id
      };
      this.deviceService.getDeviceData(obj.name, obj.app).subscribe(
        (response: any) => {
          this.selectedDevice = response;
          resolve();
        }
      );
    });
  }

  getThingsModelProperties() {
    return new Promise((resolve, reject) => {
      const obj = {
        app: this.appData.app,
        name: this.selectedDevice.tags.device_type
      };
      this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          resolve();
        }
      );
    });
  }

  async onClickOfViewGraph(alert) {
    this.selectedAlert = alert;
    await this.getDeviceData();
    await this.getThingsModelProperties();
    if (this.propertyList.length > 0) {
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
      from_date: null,
      to_date: null
    };
    if (this.beforeInterval > 0) {
      filterObj.from_date = ((moment.utc(alert.created_date, 'M/DD/YYYY h:mm:ss A')).subtract(this.beforeInterval, 'minute')).unix();
    } else {
      this.toasterService.showError('Minutes Before Alert value must be greater than 0.', 'View Visualization');
      return;
    }
    if (this.afterInterval > 0) {
      filterObj.to_date = ((moment.utc(alert.created_date, 'M/DD/YYYY h:mm:ss A')).add(this.afterInterval, 'minute')).unix();
    } else {
      this.toasterService.showError('Minutes After Alert value must be greater than 0.', 'View Visualization');
      return;
    }
    this.propertyList.forEach((prop, index) => filterObj.message_props += prop.json_key + (index !== (this.propertyList.length - 1) ? ',' : ''));
    console.log(filterObj);
    this.deviceService.getDeviceTelemetry(filterObj).subscribe(
      (response: any) => {
        console.log(response);
        if (response && response.data) {
          const telemetryData = response.data;
          // this.loadGaugeChart(telemetryData[0]);
          telemetryData.reverse();
          console.log('load line chart');
          this.loadLineChart(telemetryData);
        }
      }
    );
    // clearInterval(this.refreshInterval);
    // this.refreshInterval = setInterval(() => {
    //   filterObj.from_date = filterObj.to_date;
    //   filterObj.to_date = (moment().utc()).unix();
    //   this.deviceService.getDeviceTelemetry(filterObj).subscribe(
    //     (response: any) => {
    //       if (response && response.data) {
    //         const telemetryData = response.data;
    //         this.loadGaugeChart(telemetryData[0]);
    //         telemetryData.reverse();
    //         // this.updateLineChart(telemetryData);
    //       }
    //     });

    // }, 20000);
  }
  }

  loadLineChart(telemetryData) {
    console.log(telemetryData);
    const dataList = [];
    dataList.push('DateTime');
    let title = '';
    const alertEpoch = this.commonService.convertDateToEpoch(this.selectedAlert.local_created_date);
    this.propertyList.forEach((prop, index) => {
      if (index % 2 !== 0) {
        dataList.splice(dataList.length, 0,  {label: prop.json_key, type: 'number'});
        title += prop.json_key + (this.propertyList[index + 2] ? ' & ' : '');
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
        dataList.splice(dataList.length, 0,  {label: prop.json_key, type: 'number'});
        title += prop.json_key + (this.propertyList[index + 2] ? ' & ' : '');
        this.lineGoogleChartConfig.options.series[(Object.keys(this.lineGoogleChartConfig.options.series).length)] =  {targetAxisIndex: 1};
      }
    });
    this.lineGoogleChartConfig.options.series[(Object.keys(this.lineGoogleChartConfig.options.series).length)] = {type: 'Bar'};
    if (title.charAt(title.length - 2) === '&') {
      title = title.substring(0, title.length - 2);
    }
    this.lineGoogleChartConfig.options.vAxes['1'] = {title};
    dataList.splice(dataList.length, 0,  'Alert Time');
    this.lineGoogleChartConfig.dataTable.push(dataList);
    telemetryData.forEach((obj, i) => {
      obj.local_created_date = this.commonService.convertUTCDateToLocal(obj.message_date);
      const list = [];
      list.splice(0, 0, new Date(obj.local_created_date));
      this.propertyList.forEach((prop, index) => {
        if (index % 2 !== 0) {
          list.splice(list.length, 0, parseFloat(obj[prop.json_key]));
        }
      });
      this.propertyList.forEach((prop, index) => {
        if (index % 2 === 0) {
          list.splice(list.length, 0, parseFloat(obj[prop.json_key]));
        }
      });
      const epoch = this.commonService.convertDateToEpoch(obj.local_created_date);
      if ( epoch > alertEpoch - 10 && epoch <= alertEpoch + 10) {
        list.splice(list.length, 0, 300);
      } else {
        list.splice(list.length, 0, null);
      }
      this.lineGoogleChartConfig.dataTable.splice(this.lineGoogleChartConfig.dataTable.length, 0, list);
    });
    console.log(this.lineGoogleChartConfig);

    if (this.lineGoogleChartConfig.dataTable.length > 1) {
    const ccComponent = this.lineGoogleChartConfig.component;
    // force a redraw
    if (ccComponent) {
      ccComponent.draw();
      // const chart = ccComponent.wrapper;
      // chart.setSelection([{row: 10, column: 1}]);
    }
    }
  }


  onClickOfAcknowledgeAlert(alert): void {
    this.selectedAlert = alert;
    $('#acknowledgemenConfirmModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  acknowledgeAlert(): void {
    const obj = {
      app: this.appData.app,
      device_id: this.selectedAlert.device_id,
      message_id: this.selectedAlert.message_id,
      message: this.selectedAlert.message,
    };
    obj.message['user_id'] = this.userData.name;
    obj.message['acknowledged_date'] = (moment.utc(new Date(), 'M/DD/YYYY h:mm:ss A'));
    this.deviceService.acknowledgeDeviceAlert(obj).subscribe(
      response => {
        this.toasterService.showSuccess(response.message, 'Acknowledge Alert');
        this.closeAcknowledgementModal();
       // this.getAlarms();
      }, (error) => {
        this.toasterService.showError(error.message, 'Acknowledge Alert');
      }
    );
  }



  closeAcknowledgementModal(): void {
    $('#acknowledgemenConfirmModal').modal('hide');
    this.selectedAlert = undefined;
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }


}
