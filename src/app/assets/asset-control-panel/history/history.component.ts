import { ColumnChartComponent } from 'src/app/common/charts/column-chart/column-chart.component';
import { ChartService } from './../../../chart/chart.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { Component, OnInit, Input, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AssetService } from './../../../services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { Asset } from 'src/app/models/asset.model';
import { CONSTANTS } from './../../../app.constants';
import * as moment from 'moment';
import { ToasterService } from './../../../services/toaster.service';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from 'src/app/common/charts/pie-chart/pie-chart.component';
import { DataTableComponent } from 'src/app/common/charts/data-table/data-table.component';
import { DaterangepickerComponent } from 'ng2-daterangepicker';
declare var $: any;
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit, OnDestroy {

  historyFilter: any = {};
  apiSubscriptions: Subscription[] = [];
  historyData: any[] = [];
  isHistoryAPILoading = false;
  loadingMessage: string;
  @Input() asset = new Asset();
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
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;

  // chart selection
  chartCount = 0;
  columnNames = [];
  layoutJson = [];
  storedLayout = {};
  chartTitle = '';
  showDataTable = false;
  selectedHierarchy = '';
  renderCount = 0;
  selectedWidgets = [];
  dropdownWidgetList = [];
  propList: any[];
  selectedPropertyForChart: any[];
  showThreshold = false;
  contextApp: any;
  fromDate: any;
  toDate: any;
  today = new Date();
  daterange: any = {};
  dateRange: string;
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: moment(),
    timePicker: true,
    ranges: CONSTANTS.DATE_OPTIONS
  };
  @ViewChild(DaterangepickerComponent) private picker: DaterangepickerComponent;
  selectedDateRange: string;
  constructor(
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private chartService: ChartService  ) {

  }
  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getAssetsModelProperties();
    this.historyFilter.app = this.contextApp.app;
    this.historyFilter.epoch = true;
    if (this.asset.tags.category === CONSTANTS.IP_GATEWAY) {
      this.historyFilter.gateway_id = this.asset.asset_id;
    } else {
      this.historyFilter.asset_id = this.asset.asset_id;
    }
    this.historyFilter.sampling_format = 'minute';
    this.historyFilter.sampling_time = 1;
    this.historyFilter.aggregation_minutes = 1;
    this.historyFilter.aggregation_format = 'AVG';
    this.historyFilter.type = true;
    if (this.propertyList) {
      this.propertyList.forEach(item => {
        this.dropdownPropList.push({
          id: item.json_key
        });
      });
    }
    this.isHistoryAPILoading = true;
    this.getLayout();
    this.loadFromCache();
    this.historyFilter.type = true;
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.historyFilter.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.historyFilter.from_date = dateObj.from_date;
        this.historyFilter.to_date = dateObj.to_date;
      } else {
        this.historyFilter.from_date = item.from_date;
        this.historyFilter.to_date = item.to_date;
      }
      this.picker.datePicker.setStartDate(moment.unix(this.historyFilter.from_date));
      this.picker.datePicker.setEndDate(moment.unix(this.historyFilter.to_date));
      if (this.historyFilter.dateOption !== 'Custom Range') {
        this.selectedDateRange = this.historyFilter.dateOption;
      } else {
        this.selectedDateRange = moment.unix(this.historyFilter.from_date).format('DD-MM-YYYY HH:mm') + ' to ' +
        moment.unix(this.historyFilter.to_date).format('DD-MM-YYYY HH:mm');
      }
      if (this.historyFilter.to_date - this.historyFilter.from_date > 3600) {
        this.historyFilter.isTypeEditable = true;
      } else {
        this.historyFilter.isTypeEditable = false;
      }
    }
    this.historyFilter.type = true;
    console.log(this.historyFilter);
  }

  onNumberChange(event, type) {
    if (Number(event.target.value) % 1 !== 0) {
      this.toasterService.showError('Decimal values are not allowed.', 'View History');
      if (type === 'aggregation') {
        this.historyFilter.aggregation_minutes = Math.floor(Number(event.target.value));
      } else {
        this.historyFilter.sampling_time = Math.floor(Number(event.target.value));
      }
    }
  }

  getAssetsModelProperties() {
    // this.properties = {};
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: this.asset.tags.asset_model
      };
      this.apiSubscriptions.push(this.assetModelService.getAssetsModelProperties(obj).subscribe(
        (response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
          response.properties.derived_properties.forEach(prop => {
            prop.type = 'Derived Properties';
            this.propertyList.push(prop);
          });
          resolve();
        }
      ));
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
    this.chartService.toggleThresholdEvent.emit(this.showThreshold);
  }

  selectedDate(value: any, datepicker?: any) {
    // this.historyFilter.from_date = moment(value.start).utc().unix();
    // this.historyFilter.to_date = moment(value.end).utc().unix();
    this.historyFilter.dateOption = value.label;
    if (this.historyFilter.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.historyFilter.dateOption);
      this.historyFilter.from_date = dateObj.from_date;
      this.historyFilter.to_date = dateObj.to_date;
    } else {
      this.historyFilter.from_date = moment(value.start).utc().unix();
      this.historyFilter.to_date = moment(value.end).utc().unix();
    }
    console.log(this.historyFilter);
    if (value.label === 'Custom Range') {
      this.selectedDateRange = moment(value.start).format('DD-MM-YYYY HH:mm') + ' to ' + moment(value.end).format('DD-MM-YYYY HH:mm');
    } else {
      this.selectedDateRange = value.label;
    }
    if (this.historyFilter.to_date - this.historyFilter.from_date > 3600) {
      this.historyFilter.isTypeEditable = true;
    } else {
      this.historyFilter.isTypeEditable = false;
    }
  }


  searchHistory() {
    return new Promise<void>((resolve) => {
      const children = $('#widgetContainer').children();
      for (const child of children) {
        $(child).remove();
      }
      console.log('wdigetssss', this.selectedWidgets);
      this.propList = [];
      if (this.selectedWidgets.length === 0) {
        this.toasterService.showError('Please select widgets first.', 'View Widget');
        return;
      }

      this.selectedWidgets.forEach(widget => {
        widget.y1axis.forEach(prop => {
          if (this.propList.indexOf(prop) === -1) {
            this.propList.push(prop);
          }
        });
        widget.y2axis.forEach(prop => {
          if (this.propList.indexOf(prop) === -1) {
            this.propList.push(prop);
          }
        });
      });
      if (this.selectedWidgets.length > 3) {
        this.toasterService.showWarning('Select max 3 widgets for better performance.', 'Historical Visualization');
      }
      this.selectedPropertyForChart = [];
      this.selectedPropertyForChart = [...this.propList];
      this.historyFilter.app = this.contextApp.app;
      const currentHistoryFilter = { ...this.historyFilter };

      // if (currentHistoryFilter.aggregation_format && !currentHistoryFilter.aggregation_minutes) {
      //   this.toasterService.showError('If Aggregation Format is set, Aggregation Time is required.', 'View Visualization');
      //   return;
      // }
      // if (currentHistoryFilter.aggregation_minutes && !currentHistoryFilter.aggregation_format) {
      //   this.toasterService.showError('If Aggregation Time is set, Aggregation Format is required.', 'View Visualization');
      //   return;
      // }
      currentHistoryFilter.to_date = this.historyFilter.to_date;
      currentHistoryFilter.from_date = this.historyFilter.from_date;

      if (currentHistoryFilter.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(currentHistoryFilter.dateOption);
        currentHistoryFilter.from_date = dateObj.from_date;
        currentHistoryFilter.to_date = dateObj.to_date;
      } else {
        currentHistoryFilter.from_date = currentHistoryFilter.from_date;
        currentHistoryFilter.to_date = currentHistoryFilter.to_date;
      }
      const obj = { ...currentHistoryFilter };
      obj.partition_key = this.asset?.tags?.partition_key;
      delete obj.dateOption;
      obj.order_dir = 'ASC';
      const propArr = [];
      this.propertyList.forEach(propObj => {
        this.propList.forEach(prop => {
          if (prop === propObj.json_key) {
            propArr.push(propObj);
          }
        });
      });
      let method;
      if (!obj.to_date || !obj.from_date) {
        this.toasterService.showError('Date Selection is required', 'View Trend Analysis');
        return;
      }
      if (obj.to_date - obj.from_date > 3600 && !this.historyFilter.isTypeEditable) {
          this.historyFilter.isTypeEditable = true;
          this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
          return;
      }
      if (this.historyFilter.isTypeEditable) {
      if (this.historyFilter.type) {
        if (!this.historyFilter.sampling_time || !this.historyFilter.sampling_format ) {
          this.toasterService.showError('Sampling time and format is required.', 'View Telemetry');
          return;
        } else {
          delete obj.aggregation_minutes;
          delete obj.aggregation_format;
          // obj.message_props = '';
          // this.propList.forEach((prop, index) =>
          // obj.message_props += prop + (index !== (this.propList.length - 1) ? ',' : ''));
          let measured_message_props = '';
          let derived_message_props = '';
          propArr.forEach((prop, index) => {
            if (prop.type === 'Derived Properties') {
              derived_message_props = derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
            } else {
              measured_message_props = measured_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
            }
          });
          measured_message_props = measured_message_props.replace(/,\s*$/, '');
          derived_message_props = derived_message_props.replace(/,\s*$/, '');
          obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
          obj['derived_message_props'] = derived_message_props ? derived_message_props : undefined;
          const records = this.commonService.calculateEstimatedRecords(this.historyFilter.sampling_time * 60, obj.from_date, obj.to_date);
          if (records > 500 ) {
            this.loadingMessage = 'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
          }
          method = this.assetService.getAssetSamplingTelemetry(obj, this.contextApp.app);
        }
      } else {
        if (!this.historyFilter.aggregation_minutes || !this.historyFilter.aggregation_format ) {
          this.toasterService.showError('Aggregation time and format is required.', 'View Telemetry');
          return;
        } else {
          delete obj.sampling_time;
          delete obj.sampling_format;
          let measured_message_props = '';
          let derived_message_props = '';
          propArr.forEach((prop, index) => {
            if (prop.type === 'Derived Properties') {
              derived_message_props = derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
            } else {
              measured_message_props = measured_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
            }
          });
          measured_message_props = measured_message_props.replace(/,\s*$/, '');
          derived_message_props = derived_message_props.replace(/,\s*$/, '');
          obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
          obj['derived_message_props'] = derived_message_props ? derived_message_props : undefined;
          const records = this.commonService.calculateEstimatedRecords
          (this.historyFilter.aggregation_minutes * 60, obj.from_date, obj.to_date);
          if (records > 500 ) {
            this.loadingMessage = 'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
          }
          method = this.assetService.getAssetTelemetry(obj);
        }
      }
      } else {
        delete obj.aggregation_minutes;
        delete obj.aggregation_format;
        delete obj.sampling_time;
        delete obj.sampling_format;
        if (this.propList.length === this.propertyList.length) {
          obj['all_message_props'] = true;
        } else {
          let measured_message_props = '';
          let derived_message_props = '';
          propArr.forEach((prop, index) => {
            if (prop.type === 'Derived Properties') {
              derived_message_props = derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
            } else {
              measured_message_props = measured_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
            }
          });
          measured_message_props = measured_message_props.replace(/,\s*$/, '');
          derived_message_props = derived_message_props.replace(/,\s*$/, '');
          obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
          obj['derived_message_props'] = derived_message_props ? derived_message_props : undefined;
        }
        const frequencyArr = [];
        frequencyArr.push(this.asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
        frequencyArr.push(this.asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
        frequencyArr.push(this.asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
        const frequency = this.commonService.getLowestValueFromList(frequencyArr);
        const records = this.commonService.calculateEstimatedRecords(frequency,obj.from_date, obj.to_date);
        if (records > 500 ) {
          this.loadingMessage = 'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
        }
        method = this.assetService.getAssetTelemetry(obj);
      }
      this.fromDate = obj.from_date;
      this.toDate = obj.to_date;
      this.isHistoryAPILoading = true;
      this.apiSubscriptions.push(method.subscribe(
        (response: any) => {
          this.isFilterSelected = true;
          if (response && response.data) {
            let historyData = [];
            historyData = response.data;
            this.historyData = historyData;
            this.isHistoryAPILoading = false;
            // historyData.reverse();
            resolve();
          }
          if (this.historyFilter.dateOption !== 'Custom Range') {
            this.dateRange = this.historyFilter.dateOption;
          }
          else {
            this.dateRange = 'this selected range';
          }
        }, () => this.isHistoryAPILoading = false
      ));
    });
  }

  getPropertyName(key) {
    return this.propertyList.filter(prop => prop.json_key === key)[0]?.name || key;
  }

  onDeSelectAll(event) {
    this.selectedWidgets = [];
  }

  clear() {
    this.historyFilter = {};
    this.historyFilter.from_date = undefined;
    this.historyFilter.to_date = undefined;
    this.historyFilter.epoch = true;
    this.historyFilter.asset_id = this.asset.asset_id;
    this.historyFilter.app = this.contextApp.app;
    this.historyFilter.sampling_format = 'minute';
    this.historyFilter.sampling_time = 1;
    this.historyFilter.aggregation_minutes = 1;
    this.historyFilter.aggregation_format = 'AVG';
    this.historyFilter.type = true;
    this.chartTitle = '';
    this.xAxisProps = '';
    this.y1AxisProps = [];
    this.y2AxisProp = [];
    this.selectedWidgets = [];
    this.historyFilter.dateOption = 'Last 30 Mins';
    if (this.historyFilter.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.historyFilter.dateOption;
      const dateObj = this.commonService.getMomentStartEndDate(this.historyFilter.dateOption);
      this.historyFilter.from_date = dateObj.from_date;
      this.historyFilter.to_date = dateObj.to_date;
    } else {

      this.selectedDateRange = moment.unix(this.historyFilter.from_date).format('DD-MM-YYYY HH:mm') + ' to ' +
      moment.unix(this.historyFilter.to_date).format('DD-MM-YYYY HH:mm');
    }
    this.picker.datePicker.setStartDate(moment.unix(this.historyFilter.from_date));
    this.picker.datePicker.setEndDate(moment.unix(this.historyFilter.to_date));

    if (this.historyFilter.to_date - this.historyFilter.from_date > 3600) {
      this.historyFilter.isTypeEditable = true;
    } else {
      this.historyFilter.isTypeEditable = false;
    }
  }

  onDateChange(event) {
    this.historyFilter.from_date = moment(event.value[0]).utc();
    this.historyFilter.to_date = moment(event.value[1]).utc();
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
    if (this.historyFilter.dateOption !== 'date range') {
      this.historyFilter.dateOption = undefined;
    }
    const from = this.historyFilter.from_date.unix();
    const to = this.historyFilter.to_date.unix();
    if (to - from > 3600) {
      this.historyFilter.isTypeEditable = true;
    } else {
      this.historyFilter.type = true;
      this.historyFilter.isTypeEditable = false;
    }
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
    this.plotChart(null).then((chart: any) => {
      if (!chart.y1axis) {
        chart.y1axis = [];
      }
      if (!chart.y2axis) {
        chart.y2axis = [];
      }
      this.layoutJson.push(chart);
    }, (err) => {
      this.toasterService.showError(err, 'Load Chart');
    });
  }

  plotChart(layoutJson) {
    return new Promise<void>((resolve) => {
      $('.overlay').show();
      this.chartCount++;
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
      componentRef.instance.chartConfig = layoutJson;
      componentRef.instance.chartHeight = '23rem';
      componentRef.instance.asset = this.asset;
      componentRef.instance.chartStartdate = this.fromDate;
      componentRef.instance.chartEnddate = this.toDate;
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
    this.chartService.disposeChartEvent.emit();
    await this.searchHistory();
    const children = $('#widgetContainer').children();
    for (const child of children) {
      $(child).remove();
    }
    let widgetsToLoad = [];
    if (this.selectedWidgets.length > 0) {
      this.selectedWidgets.forEach((item) => {
        widgetsToLoad.push(item);
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
      if (this.layoutJson.length === 0) {
        this.toasterService.showError('Layout not defined', 'Historical Widgets');
        return;
      }
      if (this.historyData.length === 0) {
        this.toasterService.showError('No data available for selected filter.', 'Historical Widgets');
        return;
      }
    }
  }

  getLayout() {
    const params = {
      app: this.contextApp.app,
      name: this.asset?.tags?.asset_model
    };
    this.dropdownWidgetList = [];
    this.selectedWidgets = [];
    this.layoutJson = [];
    this.apiSubscriptions.push(this.assetModelService.getAssetsModelLayout(params).subscribe(
      async (response: any) => {
        if (response?.historical_widgets?.length > 0) {
          this.layoutJson = response.historical_widgets;
          this.storedLayout = response.historical_widgets[0];
          // this.layoutJson.forEach((item) => {
          //   this.dropdownWidgetList.push({
          //     id: item.title,
          //     value: item
          //   });
          // });
          this.layoutJson.forEach((item) => {
            this.dropdownWidgetList.push({
              id: item.title,
              value: item
            });
            item.derived_props = false;
            item.measured_props = false;
            item.y1axis.forEach(prop => {
              const type = this.propertyList.find(propObj => propObj.json_key === prop)?.type;
              if (type === 'Derived Properties') {
                item.derived_props = true;
              } else {
                item.measured_props = true;
              }
            });
            item.y2axis.forEach(prop => {
              const type = this.propertyList.find(propObj => propObj.json_key === prop)?.type;
              if (type === 'Derived Properties') {
                item.derived_props = true;
              } else {
                item.measured_props = true;
              }
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
    if (e === [] || e.length === 0) {
      this.y2AxisProp = [];
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
