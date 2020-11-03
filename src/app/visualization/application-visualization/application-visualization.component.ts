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
  telemetryData: any[] = [];
  filterObj: any = {};
  devices: any[] = [];
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
  y2AxisProps: any[] = [];
  y1AxisProps: any[] = [];
  dropdownPropList: any[] = [];
  isTelemetryDataLoading = false;
  isTelemetryFilterSelected = false;

  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private route: ActivatedRoute

  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(async params => {
      if (params.get('applicationId')) {
        this.appData = this.userData.apps.filter(
          app => app.app === params.get('applicationId')
        )[0];
        this.filterObj.app = this.appData.app;
        this.filterObj.count = 10;
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
     // this.getLatestAlerts();
      await this.getDevices();
     // this.propertyList = this.appData.metadata.properties ? this.appData.metadata.properties : [];
    });

  }

  getDevices() {
    return new Promise((resolve, reject) => {
      const obj = {
        app: this.appData.app,
        hierarchy: JSON.stringify(this.appData.user.hierarchy),
      };
      this.deviceService.getDeviceList(obj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.devices = response.data;
          }
          resolve();
        }
      );
    });
  }

  onDateOptionChange() {
    if (this.filterObj.dateOption !== 'custom') {
      this.filterObj.from_date = undefined;
      this.filterObj.to_date = undefined;
    }
  }

  onDateChange(event) {
    console.log(event);
    this.filterObj.from_date = moment(event.value[0]).utc();
    this.filterObj.to_date = moment(event.value[1]).utc();
  }

  getLatestAlerts() {
    this.latestAlerts = [];
    this.isAlertAPILoading = true;
    // const filterObj = {
    //   app: this.appData.app,
    //   count: 10
    // };
    this.deviceService.getDeviceAlerts(this.filterObj).subscribe(
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
          this.propertyList.forEach(item => {
            this.dropdownPropList.push({
              id: item.json_key
            });
          });
          resolve();
        }
      );
    });
  }



  async onClickOfViewGraph(alert) {
    this.selectedAlert = alert;
    this.isTelemetryFilterSelected = false;
    await this.getDeviceData();
    await this.getThingsModelProperties();
    if (this.propertyList.length > 0) {
      console.log(alert);
      this.lineGoogleChartConfig.dataTable = [];
      this.lineGoogleChartConfig.options.series = {};
      this.lineGoogleChartConfig.options.vAxes = {};
    }
  }

  getDeviceTelemetryData() {
    this.telemetryData = [];
    this.lineGoogleChartConfig.dataTable = [];
    this.lineGoogleChartConfig.options.series = {};
    this.lineGoogleChartConfig.options.vAxes = {};
    const now = moment().utc();
    const filterObj = {
      epoch: true,
      app: this.appData.app,
      device_id: this.selectedAlert.device_id,
      message_props: '',
      from_date: null,
      to_date: null
    };
    if (this.beforeInterval > 0) {
      filterObj.from_date = ((moment.utc(this.selectedAlert.created_date, 'M/DD/YYYY h:mm:ss A'))
      .subtract(this.beforeInterval, 'minute')).unix();
    } else {
      this.toasterService.showError('Minutes Before Alert value must be greater than 0.', 'View Visualization');
      return;
    }
    if (this.afterInterval > 0) {
      filterObj.to_date = ((moment.utc(this.selectedAlert.created_date, 'M/DD/YYYY h:mm:ss A')).add(this.afterInterval, 'minute')).unix();
    } else {
      this.toasterService.showError('Minutes After Alert value must be greater than 0.', 'View Visualization');
      return;
    }
    if (this.y1AxisProps.length === 0) {
      this.toasterService.showError('Please select Y1 Axis property.', 'View Visualization');
      return;
    }
    this.isTelemetryFilterSelected = true;
    this.isTelemetryDataLoading = true;
    this.y1AxisProps.forEach((prop, index) =>
    filterObj.message_props += prop.id + (index !== (this.y1AxisProps.length > 0 && this.y1AxisProps.length - 1) ? ',' : ''));
    this.y2AxisProps.forEach((prop, index) =>
    filterObj.message_props += prop.id + (index !== (this.y2AxisProps.length - 1) ? ',' : ''));
    console.log(filterObj);
    this.deviceService.getDeviceTelemetry(filterObj).subscribe(
      (response: any) => {
        console.log(response);
        if (response && response.data) {
          this.telemetryData = response.data;
          const telemetryData = response.data;
          // this.loadGaugeChart(telemetryData[0]);
          telemetryData.reverse();
          console.log('load line chart');
          this.loadLineChart(telemetryData);
        }
        this.isTelemetryDataLoading = false;
      }
    );
  }

  loadLineChart(telemetryData) {
    console.log(telemetryData);
    const dataList = [];
    dataList.push('DateTime');
    let title = '';
    const alertEpoch = this.commonService.convertDateToEpoch(this.selectedAlert.local_created_date);
    this.y1AxisProps.forEach((prop, index) => {
        dataList.splice(dataList.length, 0,  {label: prop.id, type: 'number'});
        title += prop.id + (this.y1AxisProps[index + 1] ? ' & ' : '');
        this.lineGoogleChartConfig.options.series[Object.keys(this.lineGoogleChartConfig.options.series).length] = {targetAxisIndex: 0};
    });

    if (title.charAt(title.length - 2) === '&') {
      title = title.substring(0, title.length - 2);
    }
    this.lineGoogleChartConfig.options.vAxes = {
      0: {title}
    };
    title = '';
    this.y2AxisProps.forEach((prop, index) => {
        console.log('index   ', index);
        console.log('inn iff');
        dataList.splice(dataList.length, 0,  {label: prop.id, type: 'number'});
        title += prop.id + (this.y2AxisProps[index + 1] ? ' & ' : '');
        this.lineGoogleChartConfig.options.series[(Object.keys(this.lineGoogleChartConfig.options.series).length)] =  {targetAxisIndex: 1};
    });
    this.lineGoogleChartConfig.options.series[(Object.keys(this.lineGoogleChartConfig.options.series).length)] =
    {type: 'Column', targetAxisIndex: 0, visibleInLegend: false};
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
      this.y1AxisProps.forEach((prop, index) => {
          list.splice(list.length, 0, parseFloat(obj[prop.id]));
      });
      this.y2AxisProps.forEach((prop, index) => {
          list.splice(list.length, 0, parseFloat(obj[prop.id]));
      });
      const epoch = this.commonService.convertDateToEpoch(obj.local_created_date);
      if ( epoch > alertEpoch - 5 && epoch <= alertEpoch + 5) {
        list.splice(list.length, 0, 500);
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
      metadata: this.selectedAlert.metadata
    };
    obj.metadata['user_id'] = this.userData.name;
    obj.metadata['acknowledged_date'] = (moment.utc(new Date(), 'M/DD/YYYY h:mm:ss A'));
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

  y1Deselect(e){
    if (e === [] || e.length === 0) {
      this.y1AxisProps = [];
    }
  }
  y2Deselect(e){
    if (e === [] || e.length === 0) {
      this.y2AxisProps = [];
    }
  }


}
