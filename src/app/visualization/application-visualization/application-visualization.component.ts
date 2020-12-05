import { ApplicationService } from 'src/app/services/application/application.service';
import { ColumnChartComponent } from './../../common/charts/column-chart/column-chart.component';
import { DataTableComponent } from './../../common/charts/data-table/data-table.component';
import { PieChartComponent } from './../../common/charts/pie-chart/pie-chart.component';
import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { ToasterService } from './../../services/toaster.service';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, NgZone, EmbeddedViewRef,
  ApplicationRef, ComponentFactoryResolver, Injector, Input } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { DeviceService } from './../../services/devices/device.service';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { isPlatformBrowser } from '@angular/common';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { ChartService } from 'src/app/chart/chart.service';
declare var $: any;
@Component({
  selector: 'app-application-visualization',
  templateUrl: './application-visualization.component.html',
  styleUrls: ['./application-visualization.component.css']
})
export class ApplicationVisualizationComponent implements OnInit, OnDestroy {

  @Input() device: any;
  @Input() pageType = 'side_menu';
  private chart: am4charts.XYChart;
  userData: any;
  contextApp: any = {};
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
  nonIPDevices: any[] = [];
  afterInterval = 10;
  seriesArr: any[] = [];
  isOpen = true;
  y2AxisProps: any[] = [];
  y1AxisProps: any[] = [];
  dropdownPropList: any[] = [];
  isTelemetryDataLoading = false;
  isTelemetryFilterSelected = false;
  acknowledgedAlert: any;
  dropdownWidgetList: any[];
  selectedWidgets: any[];
  propList: any[];
  showThreshold = false;
  selectedPropertyForChart: any[] = [];
  alertCondition: any = {};
  documents: any[] = [];
  configureHierarchy = {};
  hierarchyArr = {};
  tileData: any;
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private route: ActivatedRoute,
    private chartService: ChartService,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private applicationService: ApplicationService,
    @Inject(PLATFORM_ID) private platformId, private zone: NgZone

  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    this.getTileName();
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        if (this.contextApp.user.hierarchy[level]) {
          this.onChangeOfHierarchy(index);
        }
      }
    });
    if (this.pageType === 'history') {
      this.filterObj.device = this.device;
    }
    this.filterObj.app = this.contextApp.app;
    this.filterObj.count = 10;
    await this.getDevices(this.contextApp.user.hierarchy);
  }

  async onChangeOfHierarchy(i) {
    Object.keys(this.configureHierarchy).forEach(key => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach(key => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
    const hierarchyObj: any = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      console.log(hierarchyObj);
    });
    await this.getDevices(hierarchyObj);
  }

  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      if (item.system_name === 'Alert Visualization') {
        selectedItem = item.showAccordion;
        console.log(selectedItem);
      }
    });
    this.tileData = selectedItem;
  }

  ngAfterViewInit() {
    // Chart code goes in here

  }


  getDevices(hierarchy) {
    return new Promise((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
      };
      this.deviceService.getAllDevicesList(obj, this.contextApp.app).subscribe(
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
    this.filterObj.from_date = moment(event.value[0]).second(0).utc();
    this.filterObj.to_date = moment(event.value[1]).second(0).utc();
  }

  getLatestAlerts() {
    this.latestAlerts = [];
    this.isAlertAPILoading = true;
    // const filterObj = {
    //   app: this.contextApp.app,
    //   count: 10
    // };
    const obj = {...this.filterObj};
    obj.hierarchy = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      obj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      console.log(obj.hierarchy);
    });
    obj.hierarchy = JSON.stringify(obj.hierarchy);
    if (obj.device) {
      obj.device_id = obj.device.device_id;
      delete obj.device;
    }
    const now = moment().utc();
    if (this.filterObj.dateOption === '5 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(5, 'minute')).unix();
    } else if (this.filterObj.dateOption === '30 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(30, 'minute')).unix();
    } else if (this.filterObj.dateOption === '1 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(1, 'hour')).unix();
    } else if (this.filterObj.dateOption === '24 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(24, 'hour')).unix();
    } else {
      if (this.filterObj.from_date) {
        obj.from_date = (this.filterObj.from_date.unix());
      }
      if (this.filterObj.to_date) {
        obj.to_date = this.filterObj.to_date.unix();
      }
    }

    this.deviceService.getDeviceAlerts(obj).subscribe(
      (response: any) => {
        this.latestAlerts = response.data;
        this.latestAlerts.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
        this.isAlertAPILoading = false;
        if (this.pageType === 'live') {
        clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => {
          this.getLiveAlerts(obj);
        }, 5000);
        }
      }, () => this.isAlertAPILoading = false
    );
  }

  getLiveAlerts(obj) {
    obj.count = 1;
    this.deviceService.getDeviceAlerts(obj).subscribe(
      (response: any) => {
        if (response?.data?.length > 0) {
          if (this.latestAlerts.length > 0 && this.latestAlerts[0].message_id !== response.data[0].message_id) {
            this.latestAlerts.splice(this.latestAlerts.length - 1, 1);
            response.data[0].local_created_date = this.commonService.convertUTCDateToLocal(response.data[0].message_date);
            this.latestAlerts.splice(0, 0, response.data[0]);
          }
        }
      });
  }


  getDeviceData() {
    return new Promise((resolve) => {
      const obj = {
        app: this.contextApp.app,
        device_id: this.selectedAlert.device_id
      };
      const methodToCall = this.selectedAlert.gateway_id === this.selectedAlert.device_id || !this.selectedAlert.gateway_id ?
        this.deviceService.getDeviceData(obj.device_id, obj.app) :
        this.deviceService.getNonIPDeviceList(obj);
      methodToCall.subscribe(
        (response: any) => {
          if (response?.data?.length > 0) {
            this.selectedDevice = response.data[0];
          } else {
            this.selectedDevice = response;
          }
          resolve();
        }
      );
    });
  }

  getAlertConditions() {
    return new Promise((resolve, reject) => {
      const filterObj = {
        app: this.contextApp.app,
        device_id: this.selectedAlert.device_id,
        legacy: !(this.selectedAlert.device_id === this.selectedAlert.gateway_id),
        message: this.selectedAlert.message
      };
      this.alertCondition = undefined;
      this.deviceTypeService.getAlertConditions(this.contextApp.app, filterObj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.alertCondition = response.data[0];
            resolve();
          }
        }, error => reject()
      );
    });
  }

  getDocuments() {
    return new Promise((resolve) => {
      this.documents = [];
      const obj = {
        app: this.contextApp.app,
        device_type: this.alertCondition?.device_type ?  this.alertCondition.device_type : this.selectedDevice.tags.device_type
      };
      this.deviceTypeService.getThingsModelDocuments(obj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.documents = response.data;
            const arr = [];
            if (this.alertCondition) {
            this.alertCondition.reference_documents.forEach(refDoc => {
              this.documents.forEach(doc => {
                if (doc.id === refDoc) {
                  arr.push(doc.name);
                }
              });
            });
            this.alertCondition.reference_documents = arr;
            }
            resolve();
          }
        }
      );
    });
  }

  getThingsModelProperties() {
    return new Promise((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: this.selectedDevice?.tags?.device_type
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

  getLayout() {
    return new Promise((resolve) => {
    const params = {
      app: this.contextApp.app,
      name: this.alertCondition?.device_type ?  this.alertCondition.device_type : this.selectedDevice.tags.device_type
    };
    this.dropdownWidgetList = [];
    this.selectedWidgets = [];
    this.deviceTypeService.getThingsModelLayout(params).subscribe(
      async (response: any) => {
        if (response?.layout?.length > 0) {
          response.layout.forEach((item) => {
            this.dropdownWidgetList.push({
              id: item.title,
              value: item
            });
            if (this.alertCondition) {
            this.alertCondition.visualization_widgets.forEach(widget => {
              if (widget === item.title) {
                this.selectedWidgets.push({
                  id: item.title,
                  value: item
                });
              }
            });
          }
          });
          if (this.selectedWidgets.length > 0) {
            this.getDeviceTelemetryData();
          }
        }
        resolve();
      });
    });
  }

  async onClickOfViewGraph(alert) {
    this.isOpen = true;
    this.beforeInterval = 5;
    this.afterInterval = 5;
    this.y1AxisProps = [];
    this.y2AxisProps = [];
    this.selectedAlert = alert;
    this.isTelemetryFilterSelected = false;
    // this.selectedDevice = this.devices.find(device => device.device_id === this.selectedAlert.device_id);
    await this.getDeviceData();
   // await this.getThingsModelProperties();
    await this.getAlertConditions();
    await this.getDocuments();
    await this.getLayout();

  }

  getDeviceTelemetryData() {
    console.log(this.selectedWidgets);
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
    const children = $('#charts').children();
    for (const child of children) {
      $(child).remove();
    }
    this.telemetryData = [];
    const filterObj = {
      epoch: true,
      app: this.contextApp.app,
      device_id: this.selectedAlert.device_id,
      message_props: '',
      from_date: null,
      to_date: null,
      aggregation_format: this.filterObj.aggregation_format,
      aggregation_minutes: this.filterObj.aggregation_minutes
    };
    if (filterObj.aggregation_format && !filterObj.aggregation_minutes) {
      this.toasterService.showError('If Aggregation Format is set, Aggregation Time is required.', 'View Visualization');
      return;
    }
    if (filterObj.aggregation_minutes && !filterObj.aggregation_format) {
      this.toasterService.showError('If Aggregation Time is set, Aggregation Format is required.', 'View Visualization');
      return;
    }
    if (this.beforeInterval > 0) {
      filterObj.from_date = ((moment.utc(this.selectedAlert.message_date, 'M/DD/YYYY h:mm:ss A'))
      .subtract(this.beforeInterval, 'minute')).unix();
    } else {
      this.toasterService.showError('Minutes Before Alert value must be greater than 0.', 'View Visualization');
      return;
    }
    if (this.afterInterval > 0) {
      filterObj.to_date = ((moment.utc(this.selectedAlert.message_date, 'M/DD/YYYY h:mm:ss A')).add(this.afterInterval, 'minute')).unix();
    } else {
      this.toasterService.showError('Minutes After Alert value must be greater than 0.', 'View Visualization');
      return;
    }
    if (this.selectedWidgets.length === 0) {
      this.toasterService.showError('Please select at least one widget.', 'View Visualization');
      return;
    }
    this.isOpen = false;
    this.isTelemetryFilterSelected = true;
    this.isTelemetryDataLoading = true;
    this.propList.forEach((prop, index) =>
    filterObj.message_props += prop + (index !== (this.propList.length - 1) ? ',' : ''));
    // this.y2AxisProps.forEach((prop, index) =>
    // filterObj.message_props += prop.id + (index !== (this.y2AxisProps.length - 1) ? ',' : ''));
    // if (filterObj.message_props.charAt(filterObj.message_props.length - 1) === ',') {
    //   filterObj.message_props = filterObj.message_props.substring(0, filterObj.message_props.length - 1);
    // }
    this.deviceService.getDeviceTelemetry(filterObj).subscribe(
      (response: any) => {
        console.log(response);
        if (response && response.data) {
          this.telemetryData = response.data;
          const telemetryData = response.data;
          telemetryData.forEach(item => {
            item.message_date = this.commonService.convertUTCDateToLocal(item.message_date);
          });
          // this.loadGaugeChart(telemetryData[0]);
          telemetryData.reverse();
          // this.loadLineChart(telemetryData);
          this.isTelemetryDataLoading = false;
          this.selectedWidgets.forEach(widget => {
            let componentRef;
            if (widget.value.chartType === 'LineChart' || widget.value.chartType === 'AreaChart') {
              componentRef = this.factoryResolver.resolveComponentFactory(LiveChartComponent).create(this.injector);
            } else if (widget.value.chartType === 'ColumnChart') {
              componentRef = this.factoryResolver.resolveComponentFactory(ColumnChartComponent).create(this.injector);
            } else if (widget.value.chartType === 'BarChart') {
              componentRef = this.factoryResolver.resolveComponentFactory(BarChartComponent).create(this.injector);
            } else if (widget.value.chartType === 'PieChart') {
              componentRef = this.factoryResolver.resolveComponentFactory(PieChartComponent).create(this.injector);
            } else if (widget.value.chartType === 'Table') {
              componentRef = this.factoryResolver.resolveComponentFactory(DataTableComponent).create(this.injector);
            }
            componentRef.instance.telemetryData = JSON.parse(JSON.stringify(telemetryData));
            componentRef.instance.selectedAlert = JSON.parse(JSON.stringify(this.selectedAlert));
            componentRef.instance.propertyList = this.propertyList;
            componentRef.instance.y1AxisProps = widget.value.y1axis;
            componentRef.instance.y2AxisProps = widget.value.y2axis;
            componentRef.instance.xAxisProps = widget.value.xAxis;
            componentRef.instance.chartType = widget.value.chartType;
            componentRef.instance.chartHeight = '23rem';
            componentRef.instance.chartWidth = '100%';
            componentRef.instance.chartTitle = widget.value.title;
            componentRef.instance.chartId = widget.value.chart_Id;
            this.appRef.attachView(componentRef.hostView);
            const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;
            document.getElementById('charts').prepend(domElem);
          });
        }
      }
    );
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


  loadLineChart(telemetryData) {
    console.log(telemetryData);
    this.browserOnly(() => {
      // alert('here');
      am4core.useTheme(am4themes_animated);

      const chart = am4core.create('chartdiv', am4charts.XYChart);

      chart.paddingRight = 20;

      const data = [];
      telemetryData.forEach((obj) => {
        console.log(this.commonService.convertUTCDateToLocal(obj.message_date));
        obj.message_date = new Date(this.commonService.convertUTCDateToLocal(obj.message_date));
        delete obj.aggregation_end_time;
        delete obj.aggregation_start_time;
        data.splice(data.length, 0, obj);
      });
      console.log(data);

      chart.data = data;

      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.minGridDistance = 50;
      // const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      // valueAxis.tooltip.disabled = true;
      // valueAxis.renderer.minWidth = 35;
      this.createValueAxis(chart, 0);
      this.createValueAxis(chart, 1);


      chart.legend = new am4charts.Legend();

      chart.cursor = new am4charts.XYCursor();

      // const scrollbarX = new am4charts.XYChartScrollbar();
      // scrollbarX.series.push(series);
      // chart.scrollbarX = scrollbarX;

      const range = dateAxis.axisRanges.create();
      range.date = new Date(this.selectedAlert.local_created_date);
      range.grid.stroke = am4core.color('red');
      range.grid.strokeWidth = 2;
      range.grid.strokeOpacity = 1;
      range.axisFill.tooltip = new am4core.Tooltip();
      range.axisFill.tooltipText = 'Alert Time';
      range.axisFill.interactionsEnabled = true;
      range.axisFill.isMeasured = true;
      chart.legend.itemContainers.template.events.on('hit', (ev) => {
        let shownItem;
        let propObj;
        console.log(ev.target.dataItem.dataContext);
        let count = 0;
        this.seriesArr.forEach((item, index) => {
          console.log(item.isActive);
          console.log(chart.series);
          const seriesColumn = chart.series.getIndex(index);
          if (ev.target.dataItem.dataContext['name'] === item.name) {
            item.compareText = !item.compareText;
            seriesColumn.isActive = !seriesColumn.isActive;
          }
          if (item.compareText) {
            count += 1;
            shownItem = seriesColumn;
            this.propertyList.forEach(prop => {
              if (prop.json_key === item.name) {
                propObj = prop;
              }
            });
          }
        });
        if (count === 1) {
          this.createThresholdSeries(shownItem.yAxis, propObj);
        } else {
          this.seriesArr.forEach(series => series.yAxis.axisRanges.clear());
        }
        console.log(this.seriesArr);
      });

      chart.exporting.menu = new am4core.ExportMenu();
      chart.exporting.filePrefix = this.selectedAlert.device_id + '_Alert_' + this.selectedAlert.local_created_date;
      this.chart = chart;
    });
  }

  createThresholdSeries(valueAxis, propObj) {
    propObj.threshold = propObj.threshold ? propObj.threshold : {};

    if (propObj.threshold.l1 && propObj.threshold.h1) {
    const rangeL1H1 = valueAxis.axisRanges.create();
    rangeL1H1.value = propObj.threshold.l1;
    rangeL1H1.endValue = propObj.threshold.h1;
    rangeL1H1.axisFill.fill = am4core.color('#229954');
    rangeL1H1.axisFill.fillOpacity = 0.2;
    rangeL1H1.grid.strokeOpacity = 0;
    }
    if (propObj.threshold.l1 && propObj.threshold.l2) {
    const rangeL1L2 = valueAxis.axisRanges.create();
    rangeL1L2.value = propObj.threshold.l2;
    rangeL1L2.endValue = propObj.threshold.l1;
    rangeL1L2.axisFill.fill = am4core.color('#f6c23e');
    rangeL1L2.axisFill.fillOpacity = 0.2;
    rangeL1L2.grid.strokeOpacity = 0;
    }
    if (propObj.threshold.h1 && propObj.threshold.h2) {
    const rangeH1H2 = valueAxis.axisRanges.create();
    rangeH1H2.value = propObj.threshold.h1;
    rangeH1H2.endValue = propObj.threshold.h2;
    rangeH1H2.axisFill.fill = am4core.color('#f6c23e');
    rangeH1H2.axisFill.fillOpacity = 0.2;
    rangeH1H2.grid.strokeOpacity = 0;
    }
    if (propObj.threshold.l2 && propObj.threshold.l3) {
    const rangeL2L3 = valueAxis.axisRanges.create();
    rangeL2L3.value = propObj.threshold.l3;
    rangeL2L3.endValue = propObj.threshold.l2;
    rangeL2L3.axisFill.fill = am4core.color('#fb5515');
    rangeL2L3.axisFill.fillOpacity = 0.2;
    rangeL2L3.grid.strokeOpacity = 0;
    }
    if (propObj.threshold.h2 && propObj.threshold.h3) {
    const rangeH2H3 = valueAxis.axisRanges.create();
    rangeH2H3.value = propObj.threshold.h2;
    rangeH2H3.endValue = propObj.threshold.h3;
    rangeH2H3.axisFill.fill = am4core.color('#fb5515');
    rangeH2H3.axisFill.fillOpacity = 0.2;
    rangeH2H3.grid.strokeOpacity = 0;
    }
  }

  createValueAxis(chart, axis) {

    const valueYAxis = chart.yAxes.push(new am4charts.ValueAxis());
    if (chart.yAxes.indexOf(valueYAxis) !== 0){
      valueYAxis.syncWithAxis = chart.yAxes.getIndex(0);
    }
    const arr = axis === 0 ? this.y1AxisProps : this.y2AxisProps;
    arr.forEach((prop) => {
      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.dateX = 'message_date';
      series.name =  prop.id;
      // series.stroke = this.commonService.getRandomColor();
      series.yAxis = valueYAxis;
      series.dataFields.valueY =  prop.id;
      series.compareText = true;
      series.strokeWidth = 1;
      series.strokeOpacity = 1;
      series.tooltipText = '{name}: [bold]{valueY}[/]';
      this.seriesArr.push(series);
    });
    valueYAxis.tooltip.disabled = true;
    valueYAxis.renderer.opposite = (axis === 1);
    valueYAxis.renderer.minWidth = 35;
    if (this.y1AxisProps.length === 1 && this.y2AxisProps.length === 0) {
      const propObj = this.propertyList.filter(prop => prop.json_key === this.y1AxisProps[0].id)[0];
      this.createThresholdSeries(valueYAxis, propObj);
    }
  }


  onClickOfAcknowledgeAlert(alert): void {
    this.acknowledgedAlert = alert;
    $('#acknowledgemenConfirmModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  acknowledgeAlert(): void {
    const obj = {
      app: this.contextApp.app,
      device_id: this.acknowledgedAlert.device_id,
      message_id: this.acknowledgedAlert.message_id,
      message: this.acknowledgedAlert.message,
      metadata: this.acknowledgedAlert.metadata
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
    this.acknowledgedAlert = undefined;
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
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
