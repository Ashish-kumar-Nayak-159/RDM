import { CommonService } from './../../../../services/common.service';
import { environment } from './../../../../../environments/environment.prod';
import { Subscription } from 'rxjs';
import { Component, Input, NgZone, OnChanges, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ChartService } from 'src/app/services/chart/chart.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
declare var $: any;

@Component({
  selector: 'app-live-line-chart',
  templateUrl: './live-line-chart.component.html',
  styleUrls: ['./live-line-chart.component.css'],
})
export class LiveLineChartComponent implements OnInit, OnChanges, OnDestroy {
  private chart: am4charts.XYChart;
  @Input() chartConfig: any;
  @Input() asset: any;
  @Input() telemetryObj: any;
  @Input() propertyList: any;
  @Output() removeWidget: EventEmitter<string> = new EventEmitter<string>();
  telemetryData: any[] = [];
  selectedAlert: any;
  seriesArr: any[] = [];
  // propertyList: any[] = [];
  y1AxisProps: any[] = [];
  y2AxisProps: any[] = [];
  chartHeight: any;
  chartWidth: any;
  chartType: any;
  chartTitle: any;
  chartId: any = 'XYChart';
  showThreshold = false;
  isOverlayVisible = false;
  modalConfig: any;
  bodyMessage: string;
  headerMessage: string;
  chartStartdate: any;
  chartDataFields: any = {};
  chartEnddate: any;
  subscriptions: Subscription[] = [];
  environmentApp = environment.app;
  decodedToken: any;
  propertyBasedData: any = {};
  widgetStringFromMenu: any;
  telemetryDataTimestamps: number[] = [];
  y1Start: any = {};
  y2Start: any = {};
  constructor(private chartService: ChartService, private zone: NgZone, private commonService: CommonService) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');

    if (!this.chartConfig.y1AxisProps) {
      this.chartConfig.y1AxisProps = [];
    }
    if (!this.chartConfig.y2AxisProps) {
      this.chartConfig.y2AxisProps = [];
    }
    setTimeout(() => this.plotChart(), 1000);
    this.subscriptions.push(
      this.chartService.clearDashboardTelemetryList.subscribe((arr) => {
        this.telemetryData = [];
        if (this.chart) {
          this.chart.data = [];
          this.chart.validateData();
          this.propertyBasedData = {};
        }
      })
    );



  }

  ngOnChanges(changes) {
    if (changes.telemetryObj && this.chart && this.telemetryData) {
      if (this.chartConfig.noOfDataPointsForTrend > 0) {
        if (changes.telemetryObj) {
          //  this.telemetryObj['message_date'] = new Date(this.telemetryObj['message_date']);
          if (this.environmentApp === 'SopanCMS') {
            this.telemetryObj['TMD'] = Number(this.telemetryObj['TMD']);
            this.telemetryObj['TMS'] = Number(this.telemetryObj['TMS']);
            if (this.telemetryObj['TMD'] < 1) {
              this.telemetryObj['TMD'] = undefined;
            }
            if (this.telemetryObj['TMS'] < 1) {
              this.telemetryObj['TMS'] = undefined;
            }
          }
          const lastTemletryObj = this.telemetryData[this.telemetryData.length - 1];
          this.telemetryData = [];

          if (this.telemetryData.length > this.chartConfig.noOfDataPointsForTrend) {
            this.telemetryData.splice(0, 1)
          }

          this.chartConfig.y1AxisProps?.forEach((prop) => {
            if (
              this.telemetryObj[prop.composite_key]?.value !== undefined &&
              this.telemetryObj[prop.composite_key]?.value !== null
            ) {



              if (
                !this.propertyBasedData[prop.composite_key] ||
                this.propertyBasedData[prop.composite_key].latest_message_date.getTime() !==
                new Date(this.telemetryObj[prop.composite_key].date).getTime()
              ) {
                const obj = {};
                obj[prop.composite_key] = this.telemetryObj[prop.composite_key].value;
                obj['message_date'] = new Date(this.telemetryObj[prop.composite_key].date);
                if (!this.propertyBasedData[prop.composite_key]) {
                  this.propertyBasedData[prop.composite_key] = {
                    data: [],
                  };
                }
                this.propertyBasedData[prop.composite_key]['latest_message_date'] = obj['message_date'];
                this.propertyBasedData[prop.composite_key]['data'].push(obj);
                this.propertyBasedData[prop.composite_key]['data'].sort((a: any, b: any) => a.message_date - b.message_date);
                if (this.propertyBasedData[prop.composite_key]['data'].length > this.chartConfig.noOfDataPointsForTrend) {
                  this.propertyBasedData[prop.composite_key]['data'].splice(0, 1);
                }
                if (!this.telemetryDataTimestamps.includes(obj['message_date'].getTime()))
                  this.telemetryDataTimestamps.push(obj['message_date'].getTime());
              }
              this.telemetryData = this.telemetryData.concat(this.propertyBasedData[prop.composite_key]['data']);


            }
          });
          this.telemetryDataTimestamps.sort((a, b) => a - b);
          if (this.telemetryDataTimestamps.length > this.chartConfig.noOfDataPointsForTrend) {
            this.telemetryDataTimestamps = this.telemetryDataTimestamps.slice(-this.chartConfig.noOfDataPointsForTrend)
          }
          this.telemetryData = this.telemetryData.filter(t => t.message_date.getTime() >= this.telemetryDataTimestamps[0]);
          this.telemetryData.sort((a, b) => a.message_date - b.message_date);

          this.chartConfig.y2AxisProps?.forEach((prop) => {
            if (
              this.telemetryObj[prop.composite_key]?.value !== undefined &&
              this.telemetryObj[prop.composite_key]?.value !== null
            ) {
              if (
                !this.propertyBasedData[prop.composite_key] ||
                this.propertyBasedData[prop.composite_key].latest_message_date.getTime() !==
                new Date(this.telemetryObj[prop.composite_key].date).getTime()
              ) {
                const obj = {};
                obj[prop.composite_key] = this.telemetryObj[prop.composite_key].value;
                obj['message_date'] = new Date(this.telemetryObj[prop.composite_key].date);
                if (!this.propertyBasedData[prop.composite_key]) {
                  this.propertyBasedData[prop.composite_key] = {
                    data: [],
                  };
                }
                this.propertyBasedData[prop.composite_key]['latest_message_date'] = obj['message_date'];
                this.propertyBasedData[prop.composite_key]['data'].push(obj);
                this.propertyBasedData[prop.composite_key]['data'].sort((a: any, b: any) => a.message_date - b.message_date);
                if (this.propertyBasedData[prop.composite_key]['data'].length > this.chartConfig.noOfDataPointsForTrend) {
                  this.propertyBasedData[prop.composite_key]['data'].splice(0, 1);
                }
                if (!this.telemetryDataTimestamps.includes(obj['message_date'].getTime()))
                  this.telemetryDataTimestamps.push(obj['message_date'].getTime());
              }
              this.telemetryData = this.telemetryData.concat(this.propertyBasedData[prop.composite_key]['data']);

            }
          });
          this.telemetryDataTimestamps.sort((a, b) => a - b);

          if (this.telemetryDataTimestamps.length > this.chartConfig.noOfDataPointsForTrend) {
            this.telemetryDataTimestamps = this.telemetryDataTimestamps.slice(-this.chartConfig.noOfDataPointsForTrend);
          }
          this.telemetryData = this.telemetryData.filter(t => t.message_date.getTime() >= this.telemetryDataTimestamps[0]);
          this.telemetryData.sort((a, b) => a.message_date - b.message_date);
        }

      }
      this.chart.data = this.telemetryData;
      this.chart.validateData();

    }
  }

  plotChart() {
    this.zone.runOutsideAngular(() => {
      am4core.options.autoDispose = true;
      const chart = am4core.create(this.chartConfig.chartId, am4charts.XYChart);
      chart.paddingRight = 20;
      this.telemetryData = [];
      if (this.environmentApp === 'SopanCMS') {
        this.telemetryObj['TMD'] = Number(this.telemetryObj['TMD']);
        this.telemetryObj['TMS'] = Number(this.telemetryObj['TMS']);
        if (this.telemetryObj['TMD'] < 1) {
          this.telemetryObj['TMD'] = undefined;
        }
        if (this.telemetryObj['TMS'] < 1) {
          this.telemetryObj['TMS'] = undefined;
        }
      }
      this.telemetryObj.message_date = new Date(this.telemetryObj.message_date);
      this.chartConfig.y1AxisProps?.forEach((prop) => {
        this.SetPropsTelemetryData(prop, true);
      });
      this.chartConfig.y2AxisProps?.forEach((prop) => {
        this.SetPropsTelemetryData(prop);
      });

      // this.telemetryData.push(this.telemetryObj);
      chart.data = this.telemetryData;
      chart.dateFormatter.inputDateFormat = 'x';
      chart.dateFormatter.dateFormat = 'dd-MMM-yyyy HH:mm:ss.nnn';
      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
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
      dateAxis.renderer.labels.template.location = 0.01;
      this.createValueAxis(chart, 0);
      this.createValueAxis(chart, 1);

      chart.logo.disabled = true;
      chart.cursor = new am4charts.XYCursor();
      chart.tooltip.pointerOrientation = "horizontal";
      dateAxis.dateFormatter = new am4core.DateFormatter();
      chart.cursor.maxTooltipDistance = -1;
      dateAxis.dateFormatter.dateFormat = 'dd-MMM-yyyy HH:mm:ss.nnn';
      chart.zoomOutButton.disabled = true;
      chart.preloader.disabled = false;
      this.chart = chart;
    });
  }

  private SetPropsTelemetryData(prop: any, isY1 = false) {
    const obj = {};
    if (!this.telemetryObj[prop.composite_key]?.value) return;
    if (!this.propertyBasedData[prop.composite_key] ||
      this.propertyBasedData[prop.composite_key].latest_message_date.getTime() !==
      new Date(this.telemetryObj[prop.composite_key].date).getTime()) {
      obj[prop.composite_key] = this.telemetryObj[prop.composite_key].value;
      obj['message_date'] = new Date(this.telemetryObj[prop.composite_key].date);
      if (!this.propertyBasedData[prop.composite_key]) {
        this.propertyBasedData[prop.composite_key] = {
          data: [],
        };
      }
      this.propertyBasedData[prop.composite_key]['latest_message_date'] = obj['message_date'];
      this.propertyBasedData[prop.composite_key]['data'].push(obj);
    }

    if (isY1) {
      this.y1Start[prop.composite_key] = this.propertyBasedData[prop.composite_key]['latest_message_date'];
    }
    else {
      this.y2Start[prop.composite_key] = this.propertyBasedData[prop.composite_key]['latest_message_date'];
    }
    this.telemetryData = this.telemetryData.concat(this.propertyBasedData[prop.composite_key]['data']);
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
    if (chart.yAxes.indexOf(valueYAxis) !== 0) {
      valueYAxis.syncWithAxis = chart.yAxes.getIndex(0);
    }
    const arr = axis === 0 ? this.chartConfig.y1AxisProps : this.chartConfig.y2AxisProps;
    arr.forEach((prop) => {
      const series = chart.series.push(new am4charts.LineSeries());
      series.units = prop.units;
      series.name = prop.name;
      const proptype = this.getPropertyType(prop.composite_key);
      series.propType =
        proptype === 'Edge Derived Properties'
          ? 'ED'
          : proptype === 'Cloud Derived Properties'
            ? 'CD'
            : proptype === 'Derived KPIs'
              ? 'DK'
              : 'M';
      series.propKey = prop.composite_key;
      series.yAxis = valueYAxis;
      series.dataFields.dateX = 'message_date';
      series.dataFields.valueY = prop.composite_key;
      series.compareText = true;
      if (prop.color) {
        series.stroke = am4core.color(prop.color);
      }
      //series.tooltip.getFillFromObject = false;
      //series.tooltip.background.fill = am4core.color(prop.color);

      series.strokeWidth = 2;
      series.strokeOpacity = 1;
      series.legendSettings.labelText = '({propType}) {name} ({units})';
      series.fillOpacity = this.chartConfig.widgetType.includes('Area') ? 0.3 : 0;
      // series.tooltipText = 'Date: {dateX} \n ({propType}) {name} ({units}): [bold]{valueY}[/]';
      const bullet = series.bullets.push(new am4charts.CircleBullet());
      if (series.units) {
        bullet.tooltipText = 'Date: {dateX} \n ({propType}) {name} : [bold]{valueY}[/] ({units})';
      } else {
        bullet.tooltipText = 'Date: {dateX} \n ({propType}) {name} ({units}): [bold]{valueY}[/]';
      }
      bullet.strokeWidth = 2;
      bullet.circle.radius = 1.5;
      this.seriesArr.push(series);
    });
    valueYAxis.tooltip.disabled = true;
    valueYAxis.renderer.labels.template.fill = am4core.color('gray');
    valueYAxis.renderer.opposite = axis === 1;
    valueYAxis.renderer.minWidth = 35;
  }

  getPropertyName(key) {
    return this.propertyList.filter((prop) => prop.json_key === key)[0]?.name || key;
  }

  getPropertyType(key) {
    return this.propertyList?.filter((prop) => prop.composite_key === key)[0]?.type || 'Measured';
  }

  openConfirmRemoveWidgetModal() {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.bodyMessage =
      'Are you sure you want to remove this ' + this.chartConfig.widgetTitle + ' ' + this.widgetStringFromMenu + '?';
    this.headerMessage = 'Remove ' + this.widgetStringFromMenu;
    $('#confirmRemoveWidgetModal' + this.chartConfig.chartId).modal({
      backdrop: 'static',
      keyboard: false,
      show: true,
    });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#confirmRemoveWidgetModal' + this.chartConfig.chartId).modal('hide');
    } else if (eventType === 'save') {
      this.removeChart(this.chartConfig.chartId);
      $('#confirmRemoveWidgetModal' + this.chartConfig.chartId).modal('hide');
    }
  }

  removeChart(chartId) {
    this.removeWidget.emit(chartId);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.dispose();
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
