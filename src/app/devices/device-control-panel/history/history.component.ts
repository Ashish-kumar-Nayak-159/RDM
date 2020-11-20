import { ApplicationService } from 'src/app/services/application/application.service';
import { ChartService } from './../../../chart/chart.service';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { Component, OnInit, Input, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DeviceService } from './../../../services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import { Device } from 'src/app/models/device.model';
import { CONSTANTS } from './../../../app.constants';
import * as moment from 'moment';
import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from 'src/app/common/charts/pie-chart/pie-chart.component';
import { DataTableComponent } from 'src/app/common/charts/data-table/data-table.component';
declare var $: any;
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
  isLayout = false;
  userData: any;
  isFilterSelected = false;
  propertyList: any[] = [];
  dropdownPropList = [];
  y1AxisProps = [];
  y2AxisProp = [];
  // y1AxisProps = "";
  // y2AxisProp = "";
  xAxisProps = '';

  // chart selection
  chartCount = 0;
  columnNames = [];
  layoutJson = [];
  storedLayout = {};
  chartTitle = '';
  showDataTable = false;
  appData: any = {};
  appName: any;
  selectedHierarchy = '';
  renderCount = 0;
  selectedWidgets = [];
  dropdownWidgetList = [];
  propList: any[];
  selectedPropertyForChart: any[];
  showThreshold = false;
  applicationData: any;
  constructor(
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private route: ActivatedRoute,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private chartService: ChartService,
    private applicationService: ApplicationService
  ) {

  }
  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(async params => {
      this.appName = params.get('applicationId');
      this.applicationData = this.userData.apps.filter(
        app => app.app === params.get('applicationId')
      )[0];
      await this.getApplicationData();
      await this.getThingsModelProperties();
      this.historyFilter.app = this.appName;
    });
    this.historyFilter.epoch = true;
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
      this.historyFilter.gateway_id = this.device.device_id;
    } else {
      this.historyFilter.device_id = this.device.device_id;
    }
    if (this.propertyList) {
      this.propertyList.forEach(item => {
        this.dropdownPropList.push({
          id: item.json_key
        });
      });
    }
    this.isHistoryAPILoading = true;
    this.getLayout();
  }

  getApplicationData() {
    return new Promise((resolve) => {
      this.applicationService.getApplicationDetail(this.appName).subscribe(
        (response: any) => {
            this.appData = response;
            this.appData.user = this.applicationData.user;
            resolve();
        });
    });
  }

  getThingsModelProperties() {
    // this.properties = {};
    return new Promise((resolve) => {
      const obj = {
        app: this.appName,
        name: this.device.tags.device_type
      };
      this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          resolve();
        }
      );
    });
  }

  toggleProperty(prop) {
    const index = this.selectedPropertyForChart.indexOf(prop);
    if (index === -1) {
      this.selectedPropertyForChart.push(prop);
    } else {
      this.selectedPropertyForChart.splice(index, 1);
    }
    this.chartService.togglePropertyEvent.emit(prop);
  }

  toggleThreshold() {
    console.log(this.showThreshold);
    // this.showThreshold = !this.showThreshold;
    this.chartService.toggleThresholdEvent.emit(this.showThreshold);
  }

  onDateOptionChange() {
    this.historyFilter.from_date = undefined;
    this.historyFilter.to_date = undefined;
    $('#txtDt1').val('');
  }


  searchHistory() {
    return new Promise((resolve) => {
      this.propList = [];
      this.selectedWidgets.forEach(widget => {
        widget.value.y1axis.forEach(prop => {
          if (this.propList.indexOf(prop) === -1) {
            this.propList.push(prop);
          }
        });
        widget.value.y2axis.forEach(prop => {
          if (this.propList.indexOf(prop) === -1) {
            this.propList.push(prop);
          }
        });
      });
      this.selectedPropertyForChart = [];
      this.selectedPropertyForChart = [...this.propList];
      this.historyFilter.app = this.appName;
      const currentHistoryFilter = { ...this.historyFilter };

      if (currentHistoryFilter.aggregation_format && !currentHistoryFilter.aggregation_minutes) {
        this.toasterService.showError('If Aggregation Format is set, Aggregation Time is required.', 'View Visualization');
        return;
      }
      if (currentHistoryFilter.aggregation_minutes && !currentHistoryFilter.aggregation_format) {
        this.toasterService.showError('If Aggregation Time is set, Aggregation Format is required.', 'View Visualization');
        return;
      }
      currentHistoryFilter.to_date = this.historyFilter.to_date;
      currentHistoryFilter.from_date = this.historyFilter.from_date;
      this.isHistoryAPILoading = true;
      const obj = { ...currentHistoryFilter };
      const now = moment().utc();
      obj.to_date = now.unix();
      if (this.historyFilter.dateOption === '5 mins') {
        obj.from_date = (now.subtract(5, 'minute')).unix();
      } else if (this.historyFilter.dateOption === '30 mins') {
        obj.from_date = (now.subtract(30, 'minute')).unix();
      } else if (this.historyFilter.dateOption === '1 hour') {
        obj.from_date = (now.subtract(1, 'hour')).unix();
      } else if (this.historyFilter.dateOption === '24 hour') {
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
      this.propList.forEach((prop, index) =>
      obj.message_props += prop + (index !== (this.propList.length - 1) ? ',' : ''));
      delete obj.dateOption;
      // delete obj.y1AxisProperty;
      // delete obj.y2AxisProperty;
      // delete obj.xAxisProps;
      console.log(obj);
      this.apiSubscriptions.push(this.deviceService.getDeviceTelemetry(obj).subscribe(
        (response: any) => {
          this.isFilterSelected = true;
          if (response && response.data) {
            let historyData = [];
            historyData = response.data;
            this.historyData = historyData;
            this.isHistoryAPILoading = false;
            historyData.reverse();
            resolve();
          }
        }, () => this.isHistoryAPILoading = false
      ));
    });
  }

  clear() {
    this.historyFilter = {};
    this.historyFilter.from_date = undefined;
    this.historyFilter.to_date = undefined;
    this.historyFilter.epoch = true;
    this.historyFilter.device_id = this.device.device_id;
    this.historyFilter.app = this.appName;
    this.chartTitle = '';
    this.xAxisProps = '';
    this.y1AxisProps = [];
    this.y2AxisProp = [];
  }

  onDateChange(event) {
    this.historyFilter.from_date = moment(event.value[0]).utc();
    this.historyFilter.to_date = moment(event.value[1]).utc();
    this.historyFilter.dateOption = undefined;
  }

  setChartType() {
   // this.selectedChartType = this.chartTypeValues[chartTypeIndex];
    // if (this.selectedChartType.indexOf('Pie') >= 0) {
    //   document.getElementById("y1AxisProperty")['disabled'] = true
    //   document.getElementById("y2AxisProperty")['disabled'] = true
    //   document.getElementById("y1AxisProperty")['value'] = ""
    //   document.getElementById("y2AxisProperty")['value'] = ""
    // } else {
    //   document.getElementById("y1AxisProperty")['disabled'] = false
    //   document.getElementById("y2AxisProperty")['disabled'] = false
    // }
  }

  addChart() {
    console.log(this.y1AxisProps, '====', this.y2AxisProp);
    this.plotChart(null).then((chart: any) => {
      if (!chart.y1axis) {
        chart.y1axis = [];
      }
      if (!chart.y2axis) {
        chart.y2axis = [];
      }
      console.log('add chart ', chart, this.layoutJson);
      this.layoutJson.push(chart);
    }, (err) => {
      this.toasterService.showError(err, 'Load Chart');
    });
  }

  plotChart(layoutJson) {
    return new Promise((resolve) => {
      $('.overlay').show();
      this.chartCount++;
      console.log(layoutJson);
      const y1Axis = layoutJson.y1axis;
      const y2Axis = layoutJson.y2axis;
      const data = [];
      this.historyData.forEach(item => {
        const obj = {
          message_date: this.commonService.convertUTCDateToLocal(item.message_date)
        };
        y1Axis.forEach(element =>
          obj[element] = item[element]
        );
        y2Axis.forEach(element =>
          obj[element] = item[element]
        );
        data.splice(data.length, 0, obj);
      });
      console.log(data);
      let componentRef;
      if (layoutJson.chartType === 'LineChart' || layoutJson.chartType === 'AreaChart') {
        componentRef = this.factoryResolver.resolveComponentFactory(LiveChartComponent).create(this.injector);
      } else if (layoutJson.chartType === 'ColumnChart') {
        componentRef = this.factoryResolver.resolveComponentFactory(LiveChartComponent).create(this.injector);
      } else if (layoutJson.chartType === 'BarChart') {
        componentRef = this.factoryResolver.resolveComponentFactory(BarChartComponent).create(this.injector);
      } else if (layoutJson.chartType === 'PieChart') {
        componentRef = this.factoryResolver.resolveComponentFactory(PieChartComponent).create(this.injector);
      } else if (layoutJson.chartType === 'Table') {
        componentRef = this.factoryResolver.resolveComponentFactory(DataTableComponent).create(this.injector);
      }
      componentRef.instance.telemetryData = JSON.parse(JSON.stringify(data));
      componentRef.instance.propertyList = this.propertyList;
      componentRef.instance.y1AxisProps = layoutJson.y1axis;
      componentRef.instance.y2AxisProps = layoutJson.y2axis;
      componentRef.instance.xAxisProps = layoutJson.xAxis;
      componentRef.instance.chartType = layoutJson.chartType;
      componentRef.instance.chartHeight = '23rem';
      componentRef.instance.chartWidth = '100%';
      componentRef.instance.chartTitle = layoutJson.title;
      componentRef.instance.chartId = layoutJson.chart_Id;
      this.appRef.attachView(componentRef.hostView);
      const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
      document.getElementById('widgetContainer').prepend(domElem);
      resolve();
    });
  }


  async renderLayout() {
    await this.searchHistory();
    const children = $('#widgetContainer').children();
    for (const child of children) {
      $(child).remove();
    }
    let widgetsToLoad = [];
    if (this.selectedWidgets.length > 0) {
      this.selectedWidgets.forEach((item) => {
        widgetsToLoad.push(item.value);
      });
    } else {
      widgetsToLoad = this.layoutJson;
    }

    if (this.layoutJson && this.historyData.length > 0) {
      widgetsToLoad.map(async (currentChart) => {
        this.renderCount++;
        currentChart['chartCount'] = this.renderCount;
        await this.plotChart(currentChart);
      });
    }
    else {
      this.toasterService.showError('Layout not defined', 'Layout');
    }
  }

  getLayout() {
    const params = {
      app: this.appName,
      name: this.device?.tags?.device_type
    };
    this.dropdownWidgetList = [];
    this.selectedWidgets = [];
    this.layoutJson = [];
    this.apiSubscriptions.push(this.deviceTypeService.getThingsModelLayout(params).subscribe(
      async (response: any) => {
        if (response?.layout?.length > 0) {
          this.layoutJson = response.layout;
          this.storedLayout = response.layout[0];
          this.layoutJson.forEach((item) => {
            this.dropdownWidgetList.push({
              id: item.title,
              value: item
            });
          });
        }
        this.isHistoryAPILoading = false;
      }
    ));
  }

  y1Deselect(e){
    if (e === [] || e.length === 0) {
      this.y1AxisProps = [];
    }
  }
  y2Deselect(e){
    console.log('e ', e);
    if (e === [] || e.length === 0) {
      this.y2AxisProp = [];
    }
  }
}
