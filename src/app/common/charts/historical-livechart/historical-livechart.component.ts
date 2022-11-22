import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import am4fonts_notosans_jp from '../CustomFont/notosans-jp'

@Component({
  selector: 'app-historical-livechart',
  templateUrl: './historical-livechart.component.html',
  styleUrls: ['./historical-livechart.component.css']
})
export class HistoricalLivechartComponent implements OnInit, OnChanges {


  public chart: am4charts.XYChart;
  @Input() chartConfig: any;
  @Input() chartId: any;
  @Input() anchorAdditionalClass: string;
  @Input() telemetryData: any;
  @Input() assetWiseTelemetryData: any = [];
  @Input() propertyList: any;
  @Input() asset: any;
  @Input() dvRowCardHeaderClass: any;
  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();
  @Output() modalOpenEvents: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Input() modalConfig: any;
  @Input() chartStartdate: any;
  @Input() chartEnddate: any;
  @Input() chartHeight: any;;
  @Input() chartWidth: any;
  @Input() hideCancelButtonAddOnClass: any;
  @Input() refresh = false;
  @Input() live_Date = false
  @Input() newData: any;
  @Input() isLoadingData = false;
  isOverlayVisible = false;
  hideCancelButton = false;
  isAccordionOpen: boolean;
  seriesArr: any[] = [];
  headerMessage: string;
  bodyMessage: string;
  selectedAlert: any;
  decodedToken: any;
  widgetStringFromMenu: any;
  subscriptions: Subscription[] = [];
  loader = false;
  loaderMessage = 'Loading Data. Wait...';
  showThreshold = false;
  chartTitle: any;
  environmentApp = environment.app;
  chart_Id: any;
  chartDataFields: any = {};
  isThresholdAdded = false;
  isThresholdAdded1 = false;
  propertyBasedData: any = {};
  newDataWithColor: any;
  liveAndHistoricalData: any;
  unProcessedTelemetryData: any = [];
  zoomStart: number;
  zoomStartDate: Date;
  zoomEndDate: Date;
  isChartResized: boolean;
  lastTelemetryBeforeZoomTimestamp: Date;
  @ViewChild('chartConfig.chart_Id', { static: false }) chartElement: ElementRef;
  indicator: any;
  indicatorLabel: any;
  isNoData = false;
  isSeriesHasDataInInit = false;
  isSeriesHasDataInChanges = false;


  // @Input() chartConfig: any;
  // @Input() anchorAdditionalClass: string;
  // @Input() hideCancelButtonAddOnClass: any;
  // @Input() chartHeight: any;
  // @Input() chartWidth: any;
  // @Input() assetWiseTelemetryData: any = [];
  // @Input() propertyList: any;
  // @Input() dvRowCardHeaderClass: any;
  // @Input() chartStartdate: any;
  // @Input() chartEnddate: any;
  // @Output() modalOpenEvents: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  // chartTitle: any;
  // isAccordionOpen: boolean;
  // hideCancelButton = false;
  // decodedToken: any;
  // widgetStringFromMenu: any;
  // chart_Id: any;
  userData: any;
  contextApp: any = {};
  // telemetryData: any[] = [];


  constructor(private assetService: AssetService, private commonService: CommonService, private assetModelService: AssetModelService) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.chartHeight = '23rem';
    this.chartWidth = '100%';
    this.isChartResized = false;
    if (this.telemetryData?.length > 0) this.lastTelemetryBeforeZoomTimestamp = this.telemetryData[this.telemetryData.length - 1].message_date_obj
    else this.telemetryData = [];
    this.liveAndHistoricalData = this.assetWiseTelemetryData;
    this.chartTitle = this.chartConfig.title;
    this.chart_Id = this.chartConfig.chart_Id;
    this.chartHeight = '23rem';
    this.chartWidth = '100%';
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.RenderChartWithTelemetryData();
    // this.ChangeIndicatorLabel()

    // const filterObj = {
    //   epoch: true,
    //   app: this.contextApp.app,
    //   asset_id: 'PrefecturalSkatingRinkCT_CellA',
    //   from_date: 1667196197,
    //   to_date: 1667282597

    // }
    // this.assetService.getAssetSamplingTelemetry(filterObj, this.contextApp.app).subscribe((response)=>{
    //   if(response && response?.data){
    //     this.telemetryData = response?.data;
    //     console.log('telemetryData', this.telemetryData);
    //   }
    // });
    // const params = {
    //   app: this.contextApp.app,
    //   name: 'Cooling Tower Model V1'
    // };

    // this.assetModelService.getAssetsModelLayout(params).subscribe((response)=>{
    //   debugger
    //   console.log('historical_widget',response)
    // })
    // setTimeout(()=>{
    //   this.lineChart();
    // },300)
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty("isLoadingData") && changes?.isLoadingData?.currentValue) {
      this.hideIndicator();
      this.showLoadingIndicator();
    }
    else {
      setTimeout(() => {
        this.handleLiveTelemetry(null, changes?.assetWiseTelemetryData?.currentValue);
      }, 300);
    }
    if (this.live_Date === true) {
      setTimeout(() => {
        this.handleLiveTelemetry(this.newData);
      }, 300);
    }
  }

  handleLiveTelemetry(newTelemetryObj: any = null, liveHistoricalData: any[] = null) {
    if (newTelemetryObj) {
      for (const variable in newTelemetryObj) {
        let tempArray = []
        if (variable) {
          tempArray.push(variable)
        }
        if (!tempArray.includes('message_date_obj')) {
          newTelemetryObj['message_date_obj'] = this.commonService.convertUTCDateToLocalDateObj(newTelemetryObj['ts']);
          newTelemetryObj['color'] = 'steelblue';
          newTelemetryObj['strokeWidthDynamic'] = 2;
        }
      }
      (this.isChartResized ? this.unProcessedTelemetryData : this.liveAndHistoricalData)?.push(newTelemetryObj)
      const myDate = newTelemetryObj['message_date_obj'];
      if (!this.isChartResized && myDate) {
        this.hideIndicator();
        this.lastTelemetryBeforeZoomTimestamp = myDate as Date;
        if (this.chart?.cursor?.xAxis) {
          (this.chart?.cursor.xAxis as am4charts.DateAxis).max = myDate?.getTime();
        }
        this.displayseriestooltip();
        // this.chart?.addData(newTelemetryObj)
        this.setSeriesWiseData(newTelemetryObj);
        //this.chart?.invalidateRawData()
        // this.chartEnddate = myDate.getTime();
      }
    }
    else {
      if (liveHistoricalData && liveHistoricalData?.length > 0) {
        if (this.chart) {
          this.liveAndHistoricalData = liveHistoricalData;
          this.displayseriestooltip();
          this.setSeriesWiseData();
          this.hideIndicator();
          if (this.liveAndHistoricalData?.length > 0 && !this.isSeriesHasDataInChanges) {
            this.showNoDataIndicator();
          }
          this.ChangeDateXAxis();
          //(this.chart.xAxes.values[0] as am4charts.DateAxis).keepSelection = false;
          (this.chart.xAxes.values[0] as am4charts.DateAxis).start = 0;
          (this.chart.xAxes.values[0] as am4charts.DateAxis).end = 1;
        }
      }
      else {
        this.hideIndicator();
        this.showNoDataIndicator();
        if (this.chart) {
          this.liveAndHistoricalData = [];
          this.ChangeDateXAxis();
        }
      }
    }
  }

  private ChangeDateXAxis() {
    if (this.chartStartdate) {
      const date = new Date(0);
      date.setUTCSeconds(this.chartStartdate);
      if (this.chart?.xAxes && this.chart?.xAxes?.length == 1 && this.chart.xAxes?.values[0]?.className == "DateAxis")
        (this.chart.xAxes.values[0] as am4charts.DateAxis).min = date.getTime();
    }
    if (this.chartEnddate) {
      const date = new Date(0);
      date.setUTCSeconds(this.chartEnddate);
      if (this.chart?.xAxes && this.chart?.xAxes?.length == 1 && this.chart.xAxes?.values[0]?.className == "DateAxis")
        (this.chart.xAxes.values[0] as am4charts.DateAxis).max = date.getTime();
    }
  }

  hideIndicator() {
    this.indicator?.hide();
    if (this.chart?.tooltipContainer) {
      this.chart.tooltipContainer.removeChildren();
    }
  }
  showNoDataIndicator(chart?) {
    this.indicator = chart ? chart?.tooltipContainer?.createChild(am4core.Container) : this.chart?.tooltipContainer?.createChild(am4core.Container);
    if (this.indicator) {
      this.indicator.background.fill = am4core.color("#fff");
      this.indicator.background.fillOpacity = 0.8;
      this.indicator.width = am4core.percent(100);
      this.indicator.height = am4core.percent(100);
      this.indicatorLabel = this.indicator.createChild(am4core.Label);
      this.indicatorLabel.text = 'No data found for selected time interval.';
      this.indicatorLabel.align = "center";
      this.indicatorLabel.valign = "middle";
      this.indicatorLabel.fontSize = 20;
      this.indicatorLabel.fill = am4core.color("#a7aac0");
    }
  }

  setSeriesWiseData(liveData?) {
    if (liveData) {
      for (let key in liveData) {
        this.seriesArr?.forEach((element) => {
          if (element?.dataFields?.valueY === key) {
            let obj = {
              message_date_obj: liveData?.message_date_obj,
              color: liveData?.color
            };
            obj[element.dataFields.valueY] = liveData[key]
            element.data = [...element.data, obj];
          }
        })
      }
    }
    else {
      this.isSeriesHasDataInChanges = false;
      for (let series of this.seriesArr) {
        let seriesData = []
        this.liveAndHistoricalData.map((data) => {
          for (let key in data) {
            let obj = {
              message_date_obj: data?.message_date_obj
            }
            if (key === series?.dataFields?.valueY && data[key]) {
              obj[key] = data[key];
              this.isSeriesHasDataInChanges = true;
              seriesData.push(obj);
            }
          }
        })
        series.data = seriesData;
      }
      // this.seriesArr.forEach((element) => {
      //   let seriesData = []
      //   this.liveAndHistoricalData.map((data) => {
      //     for (let key in data) {
      //       let obj = {
      //         message_date_obj: data?.message_date_obj
      //       }
      //       if (key === element?.dataFields?.valueY && data[key]) {
      //         obj[key] = data[key];
      //         this.isSeriesHasDataInChanges = true;
      //         seriesData.push(obj);
      //       }
      //     }
      //   })
      //   element.data = seriesData;
      // })
    }
  }

  displayseriestooltip() {
    this.seriesArr.forEach(element => {
      if (element.units) {
        element.tooltipText = 'Date: {dateX} \n ({propType}) {name} ({units}) \n: [bold]{valueY}[/]';
      } else {
        element.tooltipText = 'Date: {dateX} \n ({propType}) {name}: [bold]{valueY}[/]';
      }
    });
  }

  showLoadingIndicator() {
    this.indicator = this.chart?.tooltipContainer?.createChild(am4core.Container);
    if (this.indicator) {
      this.indicator.background.fill = am4core.color("#fff");
      this.indicator.background.fillOpacity = 0.8;
      this.indicator.width = am4core.percent(100);
      this.indicator.height = am4core.percent(100);
      this.indicatorLabel = this.indicator.createChild(am4core.Label);
      this.indicatorLabel.text = 'Loading Data. Wait...';
      this.indicatorLabel.align = "center";
      this.indicatorLabel.valign = "middle";
      this.indicatorLabel.fontSize = 20;
      this.indicatorLabel.fill = am4core.color("#a7aac0");
    }
  }

  createValueAxis(chart, axis) {
    const valueYAxis = chart?.yAxes?.push(new am4charts.ValueAxis());
    if (chart?.yAxes.indexOf(valueYAxis) !== 0) {
      valueYAxis.syncWithAxis = chart?.yAxes.getIndex(0);
    }
    const arr = axis === 0 ? this.chartConfig.y1axis : this.chartConfig.y2axis;
    arr.forEach((prop, index) => {
      let seriesData = []
      this.assetWiseTelemetryData.map((data) => {

        for (let key in data) {
          let obj = {
            //message_date: data?.message_date,
            message_date_obj: data?.message_date_obj
          }
          if (key === prop?.json_key && data[key]) {
            obj[key] = data[key];
            this.isSeriesHasDataInInit = true;
            seriesData?.push(obj);
          }
        }
      })
      const series = chart.series?.push(new am4charts.LineSeries());
      this.propertyList.forEach((propObj) => {
        if (propObj.json_key === prop.json_key) {
          series.units = propObj.json_model[propObj.json_key].units;
        }
      });
      series.name = this.getPropertyName(prop.json_key);
      const proptype = this.getPropertyType(prop.json_key);
      series.propType =
        proptype === 'Edge Derived Properties'
          ? 'ED'
          : proptype === 'Cloud Derived Properties'
            ? 'CD'
            : proptype === 'Derived KPIs'
              ? 'DK'
              : 'M';
      series.propKey = prop.json_key;
      // series.stroke = this.commonService.getRandomColor();
      series.yAxis = valueYAxis;

      series.yAxis.properties.extraMin = 0.1;
      series.yAxis.properties.extraMax = 0.1;
      // series.xAxis.extraMax = 0.05;
      //series.xAxis.properties.extraMin = 0.05;
      chart.scrollbarX = new am4core.Scrollbar();
      chart.scrollbarY = new am4core.Scrollbar();

      series.dataFields.dateX = 'message_date_obj';
      series.dataFields.valueY = prop.json_key;
      series.groupFields.valueY = 'value';
      series.compareText = true;
      series.calculatePercent = true;
      series.contentwidth = 'value'
      series.strokeWidth = 2;
      series.strokeOpacity = 1;
      series.minBulletDistance = 20;
      series.data = seriesData;
      if (series.units) {
        series.legendSettings.labelText = '({propType}) {name} ({units})';
      } else {
        series.legendSettings.labelText = '({propType}) {name}';
      }

      series.fillOpacity = this.chartConfig?.chartType.includes('Area') ? 0.3 : 0;
      if (series.units) {
        series.tooltipText = 'Date: {dateX} \n ({propType}) {name} ({units}) \n: [bold]{valueY}[/]';
      } else {
        series.tooltipText = 'Date: {dateX} \n ({propType}) {name}: [bold]{valueY}[/]';
      }
      var bullet = series.bullets?.push(new am4charts.CircleBullet());
      bullet.strokeWidth = 2;
      bullet.circle.radius = 1.5;
      bullet.propertyFields.stroke = "color";
      bullet.propertyFields.fill = "color"

      // chart.cursor.snapToSeries = series;
      this.seriesArr?.push(series);
    });
    valueYAxis.tooltip.disabled = true;
    // valueYAxis.renderer.labels.template.fillOpacity = this.chartType.includes('Area') ? 0.2 : 0;
    valueYAxis.renderer.labels.template.fill = am4core.color('gray');
    valueYAxis.renderer.opposite = axis === 1;
    valueYAxis.renderer.minWidth = 35;
    // if (this.selectedAlert == null) {
    if (this.chartConfig.y1axis.length === 1 && this.chartConfig.y2axis.length === 0) {
      const propObj = this.propertyList.filter((prop) => {
        if (prop.json_key === this.chartConfig.y1axis[0].json_key) {
          return prop
        }
      })[0];
      this.createThresholdSeries(valueYAxis, propObj);
      // }
    }
    if (this.chartConfig.y1axis > 1 && this.chartConfig.y2axis) {

      const propObj = this.propertyList.filter((prop, index) => {
        return this.chartConfig.y1axis.find((detail) => {
          if (prop.json_key === detail.json_key) {
            return prop
          }

        })
        // if (prop.json_key === this.y1AxisProps[index]?.json_key) {
        //   return prop
        // }
      });
      var max = null;
      var min = null;
      var max1 = null;
      var min1 = null;
      var temppropObject = {};
      for (var i = 0; i < propObj.length; i++) {
        if (!temppropObject['threshold']) {
          temppropObject = propObj[i];
        }
        if (max == null || parseInt(propObj[i]['threshold']['h1']) > parseInt(max[['threshold']['h1']])) {
          // max =  Math.max.apply(null, propObj.map(item =>item['threshold']['h1']));
          max = Math.max(...propObj.map(item => item?.threshold?.h1));
          temppropObject['threshold']['h1'] = max
        }
        if (min == null || parseInt(propObj[i]['threshold']['l1']) > parseInt(min[['threshold']['l1']])) {
          //  min = Math.min.apply(null, propObj.map(item => item['threshold']['l1']));
          min = Math.min(...propObj.map(item => item?.threshold?.l1));
          temppropObject['threshold']['l1'] = min
        }
        if (max1 == null || parseInt(propObj[i]['threshold']['h2']) > parseInt(max1[['threshold']['h2']])) {
          max1 = Math.max(...propObj.map(item => item?.threshold?.h2));
          temppropObject['threshold']['h2'] = max1;
        }
        if (min1 == null || parseInt(propObj[i]['threshold']['l2']) > parseInt(min1[['threshold']['l2']])) {
          min1 = Math.min(...propObj.map(item => item?.threshold?.l2));
          temppropObject['threshold']['l2'] = min1;
        }
      }
      this.createThresholdSeries1(valueYAxis, temppropObject);
      // }
    }
  }

  getPropertyName(key) {
    return this.propertyList.filter((prop) => prop.json_key === key)[0]?.name || key;
  }

  getPropertyType(key) {
    return this.propertyList.filter((prop) => prop.json_key === key)[0]?.type || 'Measured';
  }

  createThresholdSeries(valueAxis, propObj) {
    //console.log("CheckingThreshold", + valueAxis)
    if (!this.isThresholdAdded) {
      propObj.threshold = propObj?.threshold ? propObj?.threshold : {};
      if (propObj?.threshold?.hasOwnProperty("l1") && propObj?.threshold?.hasOwnProperty("h1")) {
        const rangeL1H1 = valueAxis.axisRanges.create();
        rangeL1H1.value = propObj.threshold.l1;
        rangeL1H1.endValue = propObj.threshold.h1;
        rangeL1H1.axisFill.fill = am4core.color("yellow");
        rangeL1H1.grid.stroke = rangeL1H1.axisFill.fill;
        rangeL1H1.axisFill.fillOpacity = 0.2;
        rangeL1H1.grid.strokeOpacity = 1;
      }
      if (propObj?.threshold?.hasOwnProperty("l2") && propObj?.threshold?.hasOwnProperty("h2")) {
        const rangeL2H3 = valueAxis.axisRanges.create();
        rangeL2H3.value = propObj.threshold.l2;
        rangeL2H3.endValue = propObj.threshold.h2;
        rangeL2H3.axisFill.fill = am4core.color("red");
        rangeL2H3.grid.stroke = rangeL2H3.axisFill.fill;
        rangeL2H3.axisFill.fillOpacity = 0.2;
        rangeL2H3.grid.strokeOpacity = 1;
      }
      this.isThresholdAdded = true;
    }

  }

  createThresholdSeries1(valueAxis, propObj) {
    if (!this.isThresholdAdded1) {
      propObj.threshold = propObj?.threshold ? propObj?.threshold : {};
      if (propObj?.threshold?.hasOwnProperty("l1") && propObj?.threshold?.hasOwnProperty("h1")) {
        const rangeL1H1 = valueAxis.axisRanges.create();
        rangeL1H1.value = propObj.threshold.l1;
        rangeL1H1.endValue = propObj.threshold.h1;
        rangeL1H1.axisFill.fill = am4core.color("yellow");
        rangeL1H1.grid.stroke = rangeL1H1.axisFill.fill;
        rangeL1H1.axisFill.fillOpacity = 0.2;
        rangeL1H1.grid.strokeOpacity = 1;
      }
      if (propObj?.threshold?.hasOwnProperty("l2") && propObj?.threshold?.hasOwnProperty("h2")) {
        const rangeL2H3 = valueAxis.axisRanges.create();
        rangeL2H3.value = propObj.threshold.l2;
        rangeL2H3.endValue = propObj.threshold.h2;
        rangeL2H3.axisFill.fill = am4core.color("red");
        rangeL2H3.grid.stroke = rangeL2H3.axisFill.fill;
        rangeL2H3.axisFill.fillOpacity = 0.2;
        rangeL2H3.grid.strokeOpacity = 1;
      }
      this.isThresholdAdded1 = true;
    }

  }

  RenderChartWithTelemetryData() {
    this.loader = true;
    setTimeout(() => {
      this.plotChart();
    }, 430);
  }


  plotChart() {
    am4core.options.minPolylineStep = 5;
    if (this.chartElement?.nativeElement) {
      // this.zone.runOutsideAngular(() => {
      // am4core.options.autoDispose = true;
      const chart = am4core.create(this.chartElement?.nativeElement, am4charts.XYChart)
      chart.paddingLeft = 0;
      chart.paddingRight = 20;
      let convertedTelemetrytime = new Date(this.commonService.convertUTCDateToLocalDate(this.selectedAlert?.message.telemetry_ts, 'dd-MMM-yyyy HH:mm:ss'));
      // chart.data = this.liveAndHistoricalData && this.liveAndHistoricalData.length > 0 ? this.liveAndHistoricalData.map((detail: any) => {
      //   var d1 = new Date(detail.message_date_obj || this.commonService.convertUTCDateToLocalDate(detail.ts, 'dd-MMM-yyyy HH:mm:ss'));
      //   var same = d1.getTime() === convertedTelemetrytime.getTime();
      //   if (same) {
      //     detail['color'] = 'red';
      //     detail['strokeWidthDynamic'] = 5;
      //   } else {
      //     detail['color'] = 'steelblue';
      //     detail['strokeWidthDynamic'] = 2;
      //   }
      //   return detail;
      // }) : [];
      chart.responsive.enabled = true;

      chart.dateFormatter.inputDateFormat = "x";;
      chart.dateFormatter.dateFormat = 'dd-MMM-yyyy HH:mm:ss.nnn';
      const dateAxis = chart.xAxes?.push(new am4charts.DateAxis());
      // chart.svgContainer.hideOverflow = true;
      dateAxis.extraMax = 0.5;
      dateAxis.extraMin = 0.5;
      if (this.chartStartdate) {
        const date = new Date(0);
        date.setUTCSeconds(this.chartStartdate);
        dateAxis.min = date.getTime();
      }
      if (this.chartEnddate) {
        const date = new Date(0);
        date.setUTCSeconds(this.chartEnddate);
        dateAxis.max = date.getTime();

      }
      dateAxis.renderer.grid.template.location = 0;
      dateAxis.renderer.labels.template.location = 0.1;
      // dateAxis.renderer.minGridDistance = 100;
      dateAxis.renderer.inside = false;
      dateAxis.renderer.grid.template.disabled = false;

      chart.events.on('ready', (ev) => {
        // this.changeLoader()
        this.loaderMessage = 'Loading Data. Wait...';
      });
      dateAxis.start = 0
      dateAxis.end = 1;
      dateAxis.keepSelection = true
      this.isSeriesHasDataInInit = false;
      this.createValueAxis(chart, 0);
      this.createValueAxis(chart, 1);    
      chart.legend = new am4charts.Legend();
      chart.logo.disabled = true;
      chart.legend.maxHeight = 80;
      chart.svgContainer.autoResize = true;
      chart.svgContainer.measure();
      chart.legend.scrollable = true;
      chart.legend.labels.template.maxWidth = 30;
      chart.legend.labels.template.truncate = true;
      chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.default;
      chart.cursor = new am4charts.XYCursor();
      if (this.selectedAlert?.local_created_date && this.selectedAlert?.local_end_created_date) {
        var range = dateAxis.axisRanges.create();
        range.date = new Date(this.selectedAlert.local_created_date);
        range.endDate = new Date(this.selectedAlert.local_end_created_date);
        range.axisFill.fillOpacity = 5;
        range.grid.strokeOpacity = 0;
        range.axisFill.fill = am4core.color('red');
        range.axisFill.tooltip = new am4core.Tooltip();
        range.axisFill.tooltipText = 'Alert Start Time: [bold]{date}[/]\n Alert End Time: [bold]{endDate}[/]';
        range.axisFill.interactionsEnabled = true;
        range.axisFill.isMeasured = true;
      } else if (this.selectedAlert ? this.selectedAlert?.message.telemetry_ts : this.selectedAlert?.local_created_date) {
      }
      chart.legend.itemContainers.template.togglable = false;
      dateAxis.dateFormatter = new am4core.DateFormatter();
      dateAxis.dateFormatter.dateFormat = 'dd-MMM-yyyy HH:mm:ss.nnn';
      chart.cursor.xAxis = dateAxis;
      chart.exporting.menu = new am4core.ExportMenu();
      chart.exporting.getFormatOptions('xlsx').useLocale = false;
      chart.exporting.getFormatOptions('pdf').pageOrientation = 'landscape';
      if (chart.data.length > 0) {
        chart.exporting.title =
          this.chartTitle +
          ' from ' +
          chart.data[0].message_date_obj?.toString() +
          ' to ' +
          chart.data[chart.data.length - 1].message_date_obj?.toString();
      }
      this.chartDataFields = {
        message_date_obj: 'Timestamp',
      };
      this.chartConfig.y1axis.forEach((prop) => {
        this.propertyList.forEach((propObj) => {
          if (prop.json_key === propObj.json_key) {
            const units = propObj.json_model[propObj.json_key].units;
            this.chartDataFields[prop.json_key] = propObj.name + (units ? ' (' + units + ')' : '');
          }
        });
      });
      this.chartConfig.y2axis.forEach((prop) => {
        this.propertyList.forEach((propObj) => {
          if (prop.json_key === propObj.json_key) {
            const units = propObj.json_model[propObj.json_key].units;
            this.chartDataFields[prop.json_key] = propObj.name + (units ? ' (' + units + ')' : '');
          }
        });
      });
      chart.exporting.dataFields = this.chartDataFields;
      chart.zoomOutButton.disabled = true;
      var pdf = chart.exporting.getFormatOptions("pdf");
      pdf.font = am4fonts_notosans_jp;
      chart.exporting.getFormatOptions('pdf').addURL = false;
      chart.exporting.getFormatOptions('pdfdata').addURL = false;
      var pdfdata = chart.exporting.getFormatOptions("pdfdata");
      pdfdata.font = am4fonts_notosans_jp;
      chart.exporting.dateFormat = 'dd-MM-yyyy HH:mm:ss.nnn';
      if (chart.data.length > 0) {
        if (this.selectedAlert) {
          chart.exporting.filePrefix = this.selectedAlert.asset_id + '_Alert_' + this.selectedAlert.local_created_date;
        } else if (this.asset?.asset_id) {
          chart.exporting.filePrefix =
            this.asset.asset_id +
            '_' +
            chart.data[0].message_date_obj?.toString() +
            '_' +
            chart.data[chart.data.length - 1].message_date_obj?.toString();
        } else {
          chart.exporting.filePrefix =
            chart.data[0].message_date_obj?.toString() +
            '_' +
            chart.data[chart.data.length - 1].message_date_obj?.toString();
        }
      }
      chart.scrollbarX = new am4core.Scrollbar();
      chart.scrollbarY = new am4core.Scrollbar();

      chart.scrollbarX.parent = chart.bottomAxesContainer;
      chart.scrollbarY.parent = chart.leftAxesContainer;
      this.chart = chart;
      if (this.isLoadingData){
        this.hideIndicator();
        this.showLoadingIndicator();
      }
      if (!this.isLoadingData && !this.isSeriesHasDataInInit) {
        this.hideIndicator();
        this.showNoDataIndicator(chart);
      }
    }
  }
  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

}









