import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';

declare var $: any;
@Component({
  selector: 'app-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.css']
})
export class PiechartComponent implements OnInit, OnDestroy {
  private chart: am4charts.PieChart;
  selectedAlert: any;
  seriesArr: any[] = [];
  xAxisProps: any;
  y1AxisProps: any[] = [];
  y2AxisProps: any[] = [];
  chartType: any;
  chartId: any;
  showThreshold = false;
  modalConfig: any;
  bodyMessage: string;
  headerMessage: string;

  @Input() chartConfig: any;
  @Input() propertyList: any;
  @Input() asset: any;
  @Input() assetModel: any;
  @Input() chartTitle: any;
  @Input() hideCancelButton: any;
  @Input() telemetryData: any[] = [];
  @Input() chartWidth: any;
  @Input() chartHeight: any;
  @Input() isOverlayVisible: any;
  // @Input() chartId: any;
  @Input() decodedToken: any;
  @Input() widgetStringFromMenu: any;
  @Output() chart_Id = new EventEmitter<any>();
  widgetId: any;

  constructor(private commonService: CommonService) { }

  ngOnInit(): void {
    if (this.chartConfig) {
      this.y1AxisProps = this.chartConfig.y1axis;
      this.y2AxisProps = this.chartConfig.y2axis;
      this.xAxisProps = this.chartConfig.xAxis;
      this.chartType = this.chartConfig.chartType;
      this.chartTitle = this.chartConfig.title;
      this.chartId = this.chartConfig.chart_Id;
      this.widgetId = this.chartConfig.id;
    }

    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    if (this.telemetryData.length > 0) {
      setTimeout(() => this.plotChart(), 200);
    }
  }

  plotChart() {
    this.xAxisProps = "display_name";
    am4core.options.autoDispose = true;
    const chart = am4core.create(this.chartId, am4charts.PieChart);

    const data = [];

    this.y1AxisProps.forEach((yaxis) => {
      let filteredProperty = this.propertyList.filter(r => r.json_key === yaxis.json_key);
      let filteredTelData = this.telemetryData.filter(r => r.hasOwnProperty(yaxis.json_key) && r[yaxis.json_key] !== null)
      const item: any = {};
      item["display_name"] = filteredProperty[0].name;
      item['value'] = filteredTelData.length;
      data.push(item);
    });
    this.y2AxisProps.forEach((yaxis) => {
      let filteredProperty = this.propertyList.filter(r => r.json_key === yaxis.json_key);
      let filteredTelData = this.telemetryData.filter(r => r.hasOwnProperty(yaxis.json_key) && r[yaxis.json_key] !== null)
      const item: any = {};
      item["display_name"] = filteredProperty[0].name;
      item['value'] = filteredTelData.length;
      data.push(item);
    });


    chart.data = data;

    // Add and configure Series
    const pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = 'value';
    pieSeries.dataFields.category = this.xAxisProps;
    pieSeries.slices.template.stroke = am4core.color('#fff');
    pieSeries.slices.template.strokeOpacity = 1;

    // This creates initial animation
    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;
    chart.hiddenState.properties.radius = am4core.percent(0);
    // chart.exporting.menu = new am4core.ExportMenu();
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.togglable = false;
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.getFormatOptions('xlsx').useLocale = false;
    chart.exporting.getFormatOptions('pdf').pageOrientation = 'landscape';
    if (chart.data.length > 0) {
      chart.exporting.title =
        this.chartTitle +
        ' from ' +
        chart.data[0].message_date?.toString() +
        ' to ' +
        chart.data[chart.data.length - 1].message_date?.toString();
    }
    const obj = {
      message_date: 'Timestamp',
    };
    this.y1AxisProps.forEach((prop) => {
      this.propertyList.forEach((propObj) => {
        if (prop.json_key === propObj.json_key) {
          const units = propObj.json_model[propObj.json_key].units;
          obj[prop.json_key] = propObj.name + (units ? ' (' + units + ')' : '');
        }
      });
    });
    this.y2AxisProps.forEach((prop) => {
      this.propertyList.forEach((propObj) => {
        if (prop.json_key === propObj.json_key) {
          const units = propObj.json_model[propObj.json_key].units;
          obj[prop.json_key] = propObj.name + (units ? ' (' + units + ')' : '');
        }
      });
    });
    chart.exporting.dataFields = obj;
    const list = new am4core.List<string>();
    list.insertIndex(0, 'message_date');
    chart.exporting.dateFields = list;
    chart.exporting.getFormatOptions('pdf').addURL = false;
    chart.exporting.dateFormat = 'dd-MM-yyyy HH:mm:ss.nnn';
    if (chart.data.length > 0) {
      if (this.selectedAlert) {
        chart.exporting.filePrefix = this.selectedAlert.asset_id + '_Alert_' + this.selectedAlert.local_created_date;
      } else if (this.asset?.asset_id) {
        chart.exporting.filePrefix =
          this.asset.asset_id +
          '_' +
          chart.data[0].message_date?.toString() +
          '_' +
          chart.data[chart.data.length - 1].message_date?.toString();
      } else {
        chart.exporting.filePrefix =
          chart.data[0].message_date?.toString() + '_' + chart.data[chart.data.length - 1].message_date?.toString();
      }
    }
    this.chart = chart;
  }

  openConfirmRemoveWidgetModal() {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.bodyMessage =
      'Are you sure you want to remove this ' + this.chartTitle + ' ' + this.widgetStringFromMenu + '?';
    this.headerMessage = 'Remove ' + this.widgetStringFromMenu;
    $('#confirmRemoveWidgetPieModal' + this.chartId).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#confirmRemoveWidgetPieModal' + this.chartId).modal('hide');
    } else if (eventType === 'save') {
      this.removeWidget();
      $('#confirmRemoveWidgetPieModal' + this.chartId).modal('hide');
    }
  }

  removeWidget() {
    this.onMenu(2);
  }

  onMenu(type) {
    if (type == 0) {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Edit" });
    }
    else if (type == 1) {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Clone" });
    }
    else {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Delete" });
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.dispose();
    }
  }
}

