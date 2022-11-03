import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef,OnChanges, SimpleChanges } from '@angular/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import {Subscription} from 'rxjs';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-historical-livechart',
  templateUrl: './historical-livechart.component.html',
  styleUrls: ['./historical-livechart.component.css']
})
export class HistoricalLivechartComponent implements OnInit, OnChanges {


  public chart: am4charts.XYChart;
  @Input() chartConfig: any;
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
  isLoadingData = false;
  isNoData = false;


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
    console.log('chartData',this.chartConfig)
    console.log('telemetry',this.telemetryData)
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.chartHeight = '23rem';
    this.chartWidth = '100%';
    this.isChartResized = false;
    if (this.telemetryData?.length > 0) this.lastTelemetryBeforeZoomTimestamp = this.telemetryData[this.telemetryData.length - 1].message_date_obj
    else this.telemetryData = [];
    this.liveAndHistoricalData = this.telemetryData;
    this.chartTitle = this.chartConfig.title;
    this.chart_Id = this.chartConfig.chart_Id;
    this.chartHeight = '23rem';
    this.chartWidth = '100%';
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    // this.RenderChartWithTelemetryData();


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
    setTimeout(()=>{
      this.lineChart();
    },300)
  }

  
  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty("assetWiseTelemetryData") && changes.assetWiseTelemetryData.currentValue != changes.assetWiseTelemetryData.previousValue) {
      if(changes.assetWiseTelemetryData.previousValue && changes.assetWiseTelemetryData.previousValue.length > 0 && changes.assetWiseTelemetryData.currentValue && changes.assetWiseTelemetryData.currentValue.length == 0 )
      {
        this.hideIndicator();
        this.showLoadingIndicator();
      }
      else{
      let previousAsset = changes.assetWiseTelemetryData?.previousValue?.find(r => r.assetId == this.chartConfig.asset_id);
      if (!previousAsset) {
        let asssetTelemetry = this.assetWiseTelemetryData.find(r => r.assetId == this.chartConfig.asset_id);
        if (asssetTelemetry) {
          this.telemetryData = asssetTelemetry?.telemetryData == undefined || asssetTelemetry?.telemetryData == null ? [] : asssetTelemetry?.telemetryData;
          setTimeout(() => {
            //this.loader = !this.loader;
            // this.handleLiveTelemetry(null, this.telemetryData);
          }, 300);
        }
      }
    }
    }
    if (this.live_Date === true && this.chartConfig.asset_id == this.newData["asset_id"]) {
      setTimeout(() => {
        // this.handleLiveTelemetry(this.newData);
      }, 300);
    }
  }

  hideIndicator() {
    this.indicator.hide();
    if (this.chart?.tooltipContainer) {
      this.chart.tooltipContainer.removeChildren();
      this.displayseriestooltip()

    }
  }

  displayseriestooltip(){
    this.seriesArr.forEach(element => {
      if (element.units) {
        element.tooltipText = 'Date: {dateX} \n ({propType}) {name} ({units}) \n: [bold]{valueY}[/]';
      } else {
        element.tooltipText = 'Date: {dateX} \n ({propType}) {name}: [bold]{valueY}[/]';
      }
    });
  }

  showLoadingIndicator() {
    this.isLoadingData = true;
    this.indicator = this.chart.tooltipContainer.createChild(am4core.Container);
    this.indicator.background.fill = am4core.color("#fff");
    this.indicator.background.fillOpacity = 0.8;
    this.indicator.width = am4core.percent(100);
    this.indicator.height = am4core.percent(100);
    this.indicatorLabel = this.indicator.createChild(am4core.Label);
    this.indicatorLabel.align = "center";
    this.indicatorLabel.valign = "middle";
    this.indicatorLabel.fontSize = 20;
    this.indicatorLabel.fill = am4core.color("#a7aac0");
  }

  createValueAxis(chart, axis) {
    const valueYAxis = chart?.yAxes?.push(new am4charts.ValueAxis());
    if (chart?.yAxes.indexOf(valueYAxis) !== 0) {
      valueYAxis.syncWithAxis = chart?.yAxes.getIndex(0);
    }


    const arr = axis === 0 ? this.chartConfig.y1axis : this.chartConfig.y2axis;
    arr.forEach((prop, index) => {
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

      if (series.units) {
        series.legendSettings.labelText = '({propType}) {name} ({units})';
      } else {
        series.legendSettings.labelText = '({propType}) {name}';
      }

      series.fillOpacity = this.chartConfig?.chartType.includes('Area') ? 0.3 : 0;
      // if (series.units) {
      //   series.tooltipText = 'Date: {dateX} \n ({propType}) {name} ({units}) \n: [bold]{valueY}[/]';
      // } else {
      //   series.tooltipText = 'Date: {dateX} \n ({propType}) {name}: [bold]{valueY}[/]';
      // }
      var bullet = series.bullets?.push(new am4charts.CircleBullet());
      bullet.propertyFields.strokeWidth = "strokeWidthDynamic";
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
      propObj.threshold = propObj.threshold ? propObj.threshold : {};
      if (propObj.threshold.hasOwnProperty("l1") && propObj.threshold.hasOwnProperty("h1")) {
        const rangeL1H1 = valueAxis.axisRanges.create();
        rangeL1H1.value = propObj.threshold.l1;
        rangeL1H1.endValue = propObj.threshold.h1;
        rangeL1H1.axisFill.fill = am4core.color("yellow");
        rangeL1H1.grid.stroke = rangeL1H1.axisFill.fill;
        rangeL1H1.axisFill.fillOpacity = 0.2;
        rangeL1H1.grid.strokeOpacity = 1;
      }
      if (propObj.threshold.hasOwnProperty("l2") && propObj.threshold.hasOwnProperty("h2")) {
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
      propObj.threshold = propObj.threshold ? propObj?.threshold : {};
      if (propObj.threshold.hasOwnProperty("l1") && propObj.threshold.hasOwnProperty("h1")) {
        const rangeL1H1 = valueAxis.axisRanges.create();
        rangeL1H1.value = propObj.threshold.l1;
        rangeL1H1.endValue = propObj.threshold.h1;
        rangeL1H1.axisFill.fill = am4core.color("yellow");
        rangeL1H1.grid.stroke = rangeL1H1.axisFill.fill;
        rangeL1H1.axisFill.fillOpacity = 0.2;
        rangeL1H1.grid.strokeOpacity = 1;
      }
      if (propObj.threshold.hasOwnProperty("l2") && propObj.threshold.hasOwnProperty("h2")) {
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

 lineChart(){
  var chart = am4core.create(this.chartElement?.nativeElement, am4charts.XYChart)

  chart.data = [{
    "date": new Date(2018, 0, 1),
    "value": 450,
    "value2": 362,
    "value3": 699
  }, {
    "date": new Date(2018, 0, 2),
    "value": 269,
    "value2": 450,
    "value3": 841
  }, {
    "date": new Date(2018, 0, 3),
    "value": 700,
    "value2": 358,
    "value3": 699
  }, {
    "date": new Date(2018, 0, 4),
    "value": 490,
    "value2": 367,
    "value3": 500
  }, {
    "date": new Date(2018, 0, 5),
    "value": 500,
    "value2": 485,
    "value3": 369
  }, {
    "date": new Date(2018, 0, 6),
    "value": 550,
    "value2": 354,
    "value3": 250
  }, {
    "date": new Date(2018, 0, 7),
    "value": 420,
    "value2": 350,
    "value3": 600
  }];

  var categoryAxis = chart.xAxes.push(new am4charts.DateAxis());
  categoryAxis.renderer.grid.template.location = 0;

  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

  var series = chart.series.push(new am4charts.LineSeries());
  series.dataFields.valueY = "value2";
  series.dataFields.dateX = "date";
  series.name = "test";
  series.tooltipText = "{dateX}: [b]{valueY}[/]";
  series.strokeWidth = 2;

  var bullet = series.bullets.push(new am4charts.CircleBullet());
  bullet.events.on("hit", function (ev) {
    alert("Clicked on ");
  });

  chart.legend = new am4charts.Legend();
  chart.cursor = new am4charts.XYCursor();
 }

}









