import { DeviceTypeService } from './../../../../services/device-type/device-type.service';
import { Device } from './../../../../models/device.model';
import { ApplicationRef, Component, ComponentFactoryResolver, EmbeddedViewRef, Injector, OnChanges, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Input } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import * as moment from 'moment';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { ColumnChartComponent } from 'src/app/common/charts/column-chart/column-chart.component';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from 'src/app/common/charts/pie-chart/pie-chart.component';
import { DataTableComponent } from 'src/app/common/charts/data-table/data-table.component';
import { ApplicationService } from 'src/app/services/application/application.service';
declare var $: any;

@Component({
  selector: 'app-device-type-history-layout',
  templateUrl: './device-type-history-layout.component.html',
  styleUrls: ['./device-type-history-layout.component.css']
})
export class DeviceTypeHistoryLayoutComponent implements OnInit, OnChanges, OnDestroy {

  @Input() deviceType: any;
  apiSubscriptions: Subscription[] = [];
  historyData: any[] = [];
  isHistoryAPILoading = false;
  @Input() device = new Device();
  userData: any;
  isFilterSelected = false;
  propertyList: any[] = [];
  dropdownPropList = [];
  y1AxisProps = [];
  y2AxisProps = [];
  // y1AxisProps = "";
  // y2AxisProp = "";
  xAxisProps = '';
  // chart selection
  chartCount = 0;
  chartTypes = ['Bar Chart', 'Column Chart', 'Line Chart', 'Area Chart', 'Pie Chart', 'Data Table'];
  chartTypeValues = [{
    name: 'Bar Chart',
    value: 'BarChart',
    icon: 'fa-bar-chart fa-rotate-90'
  },
  {
    name: 'Column Chart',
    value: 'ColumnChart',
    icon: 'fa-bar-chart'
  },
  {
    name: 'Line Chart',
    value: 'LineChart',
    icon: 'fa-line-chart'
  },
  {
    name: 'Area Chart',
    value: 'AreaChart',
    icon: 'fa-area-chart'
  },
  {
    name: 'Pie Chart',
    value: 'PieChart',
    icon: 'fa-pie-chart'
  },
  {
    name: 'Data Table',
    value: 'Table',
    icon: 'fa-table'
  }];
  chartIcons = ['fa-bar-chart fa-rotate-90', 'fa-bar-chart', 'fa-line-chart', 'fa-area-chart', 'fa-pie-chart', 'fa-table'];
  public selectedChartType = 'Widget Type';
  columnNames = [];
  layoutJson = [];
  storedLayout: any[] = [];
  chartTitle = '';
  showDataTable = false;
  selectedHierarchy = '';
  renderCount = 0;
  selectedWidgets = [];
  dropdownWidgetList = [];
  contextApp: any;
  fromDate: any;
  toDate: any;
  subscriptions: Subscription[] = [];

  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private deviceTypeService: DeviceTypeService,
    private applicationService: ApplicationService
  ) {

  }
  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getThingsModelProperties();
    if (this.propertyList) {
      this.propertyList.forEach(item => {
        this.dropdownPropList.push({
          id: item.name,
          value: item
        });
      });
      console.log(this.dropdownPropList);
    }
    this.isHistoryAPILoading = true;
    this.getLayout();

  }

  getThingsModelProperties() {
    // this.properties = {};
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: this.deviceType.name
      };
      this.subscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
          response.properties.derived_properties.forEach(prop => this.propertyList.push(prop));
          console.log(this.propertyList);
          resolve();
        }
      ));
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isLayout && !changes.isLayout.currentValue && this.contextApp.app) {
      this.getLayout();
    }
    this.clear();
  }

  clear() {
    this.selectedChartType = 'Widget Type';
    this.chartTitle = '';
    this.xAxisProps = '';
    this.y1AxisProps = [];
    this.y2AxisProps = [];
  }

  setChartType() {
    return this.chartTypeValues.find(type => {
      console.log(type.name, '======', this.selectedChartType, '======', type);
      return type.name === this.selectedChartType;
    })?.value;
  }

  async addChart() {
    if (!this.chartTitle || !this.selectedChartType || this.y1AxisProps.length === 0) {
      this.toasterService.showError('Please select all the data to add widget', 'Add Widget');
      return;
    }
    if (this.y1AxisProps.length + this.y2AxisProps.length > 4) {
      this.toasterService.showError('Max 4 properties are allowed in a widget', 'Add Widget');
      return;
    }
    let arr = [];
    this.y1AxisProps.forEach(prop => arr.push(prop.json_key));
    this.y1AxisProps = [...arr];
    arr = [];
    this.y2AxisProps.forEach(prop => arr.push(prop.json_key));
    this.y2AxisProps = [...arr];
    const obj = {
      title: this.chartTitle,
      chartType: this.setChartType(),
      chartCount: this.chartCount,
      chart_Id: 'chart_' + moment().utc().unix(),
      showDataTable: this.showDataTable,
      y1axis: this.y1AxisProps,
      y2axis: this.y2AxisProps,
      xAxis: this.xAxisProps
    };
    const index = this.layoutJson.findIndex(widget => widget.title.toLowerCase() === obj.title.toLowerCase());
    if (index === -1) {
      await this.plotChart(obj);
      this.clear();
      this.layoutJson.splice(0, 0, obj);
    } else {
      this.toasterService.showError('Widget with same title is already exist.', 'Add Widget');
    }
  }

  plotChart(layoutJson) {
    return new Promise<void>((resolve) => {
      $('.overlay').show();
      this.chartCount++;
      const y1Axis = layoutJson.y1axis;
      const y2Axis = layoutJson.y2axis;
      const data = [];
      const currentDate = moment();
      for (let i = 0; i < 10; i++) {
        const obj = {
          message_date: currentDate.subtract(i, 'minute').format('DD-MMM-YYYY hh:mm:ss A')
        };
        y1Axis.forEach(element => {
          this.propertyList.forEach(prop => {
            if ( element === prop.json_key) {
              if (prop.data_type === 'Number') {
                obj[prop.json_key] = this.commonService.randomIntFromInterval(
                  prop.json_model[prop.json_key].minValue ? prop.json_model[prop.json_key].minValue : 0,
                  prop.json_model[prop.json_key].maxValue ? prop.json_model[prop.json_key].maxValue : 100
                );
              } else if (prop.data_type === 'Enum') {
                obj[prop.json_key] = prop.json_model[prop.json_key].enum[this.commonService.randomIntFromInterval(
                  0,
                  prop.json_model[prop.json_key].enum ? prop.json_model[prop.json_key].enum.length : 0
                )];
              }
            }
          });
        });
        y2Axis.forEach(element => {
          this.propertyList.forEach(prop => {
            if (element === prop.json_key) {
              if (prop.data_type === 'Number') {
                obj[prop.json_key] = this.commonService.randomIntFromInterval(
                  prop.json_model[prop.json_key].minValue ? prop.json_model[prop.json_key].minValue : 0,
                  prop.json_model[prop.json_key].maxValue ? prop.json_model[prop.json_key].maxValue : 100
                );
              }
            }
          });
        });
        data.splice(0, 0, obj);
      }
      let componentRef;
      if (layoutJson.chartType === 'LineChart' || layoutJson.chartType === 'AreaChart') {
        componentRef = this.factoryResolver.resolveComponentFactory(LiveChartComponent).create(this.injector);
      } else if (layoutJson.chartType === 'ColumnChart') {
        componentRef = this.factoryResolver.resolveComponentFactory(ColumnChartComponent).create(this.injector);
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
      componentRef.instance.device = this.device;
      // componentRef.instance.chartStartdate = this.fromDate;
      // componentRef.instance.chartEnddate = this.toDate;
      componentRef.instance.chartTitle = layoutJson.title;
      componentRef.instance.chartId = layoutJson.chart_Id;
      componentRef.instance.isOverlayVisible = true;
      componentRef.instance.hideCancelButton = !this.deviceType.freezed;
      componentRef.instance.removeWidget = id => this.removeWidget(id);
      this.appRef.attachView(componentRef.hostView);
      const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
      document.getElementById('layoutWidgetContainer').prepend(domElem);
      resolve();
    });
  }

  renderLayout() {
    const layoutChildren: any = $('#layoutWidgetContainer').children();
    for (const child of layoutChildren) {
      $(child).remove();
    }
    let widgetsToLoad = [];
    widgetsToLoad = this.layoutJson;
    if (this.layoutJson) {
      widgetsToLoad.map(async (currentChart) => {
        this.renderCount++;
        currentChart['chartCount'] = this.renderCount;
        await this.plotChart(currentChart);
      });
    } else {
      this.toasterService.showError('Layout not defined', 'Layout');
    }
  }

  removeWidget(chartId) {
    for (let i = 0; i < this.layoutJson.length; i++) {
      if (this.layoutJson[i].chart_Id === chartId) {
        this.layoutJson.splice(i, 1);
        $('#' + chartId + '_' + chartId).remove();
      }
    }
  }

  saveLayout() {
    for (let i = 0; i < this.layoutJson.length; i++) {
      if (document.getElementById(this.layoutJson[i].chart_Id) == null) {
        this.layoutJson.splice(i, 1);
      }
    }
    // this.layoutJson.reverse();
    this.deviceType.historical_widgets = this.layoutJson;
    this.deviceType.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(this.deviceTypeService.updateThingsModel(this.deviceType, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Layout');
        this.getLayout();
      },
      (err) => {
        this.toasterService.showError(err.message, 'Save Layout');
      }
    ));

  }

  getLayout() {
    const params = {
      app: this.contextApp.app,
      name: this.deviceType.name
    };
    this.dropdownWidgetList = [];
    this.selectedWidgets = [];
    this.layoutJson = [];
    this.subscriptions.push(this.deviceTypeService.getThingsModelLayout(params).subscribe(
      async (response: any) => {
        if (response?.historical_widgets?.length > 0) {
          this.layoutJson = response.historical_widgets;
          this.storedLayout = response.historical_widgets;
          this.layoutJson.forEach((item) => {
            this.dropdownWidgetList.push({
              id: item.title,
              value: item
            });
          });
          this.renderLayout();
        }
        this.isHistoryAPILoading = false;
      }, () => this.isHistoryAPILoading = false
    ));
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


}
