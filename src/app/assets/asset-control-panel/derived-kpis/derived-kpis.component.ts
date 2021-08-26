import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import * as moment from 'moment';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
declare var $: any;

@Component({
  selector: 'app-derived-kpis',
  templateUrl: './derived-kpis.component.html',
  styleUrls: ['./derived-kpis.component.css']
})
export class DerivedKpisComponent implements OnInit {

  @Input() asset: Asset = new Asset();
  // @Input() componentState: any;
  // derivedKPIFilter: any = {};
  derivedKPIs: any[] = [];
  isderivedKPILoading = false;
  apiSubscriptions: Subscription[] = [];
  isFilterSelected = false;
  derivedKPITableConfig: any = {};
  contextApp: any;
  isDerivedKPIDataLoading = false;
  loader = false;
  derivedKPIData: any[] = [];
  loadingMessage =  'Loading Data. Please wait...';
  chart: am4charts.XYChart;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    // if (this.asset.tags.category === CONSTANTS.IP_GATEWAY) {
    //   this.derivedKPIFilter.gateway_id = this.asset.asset_id;
    // } else {
    //   this.derivedKPIFilter.asset_id = this.asset.asset_id;
    // }
    // this.derivedKPIFilter.app = this.contextApp.app;
    this.derivedKPITableConfig = {
      type: 'Derived KPI',
      headers: ['Code', 'KPI Name', 'Description', 'Condition', 'Value'],
      data: [
        {
          name: 'Code',
          key: 'code',
        },
        {
          name: 'KPI Name',
          key: 'name',
        },
        {
          name: 'JSON Key',
          key: 'kpi_json_key'
        },
        {
          name: 'Value',
          key: 'kpi_result'
        },
        {
          name: '',
          key: undefined,
          headerClass: 'w-5'
        }
      ]
    };
    // if (this.componentState === CONSTANTS.IP_GATEWAY) {
    //   this.derivedKPITableConfig.data.splice(2, 0, {
    //     name: 'Asset Name',
    //     key: 'asset_id'
    //   });
    // }
    this.getderivedKPIs();
  }

  getderivedKPIs() {
    this.isFilterSelected = true;
    this.isderivedKPILoading = true;
    this.apiSubscriptions.push(this.assetService.getDerivedKPIs(this.asset.app, this.asset.asset_id).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.derivedKPIs = response.data;
          console.log(this.derivedKPIs);
          }
          this.isderivedKPILoading = false;
        },
        error => this.isderivedKPILoading = false
    ));
  }

  openHistoricKPIData(obj) {
    if (obj.type === this.derivedKPITableConfig.type) {
      this.getDerivedKPIsHistoricData(obj.data);
      $('#derivedKPIModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  getDerivedKPIsHistoricData(asset) {
    this.isDerivedKPIDataLoading = true;
    this.loader = true;
    const kpiCode = 'SPCD';
    const obj = {
      asset_id: asset.asset_id,
      from_date: moment().subtract(14, 'days').utc().unix(),
      to_date: moment().utc().unix(),
      epoch: true,
      asset_model: asset.asset_model
    };
    this.derivedKPIData = [];
    this.apiSubscriptions.push(this.assetService.getDerivedKPIHistoricalData(this.contextApp.app, kpiCode, obj)
    .subscribe((response: any) => {
      if (response?.data) {
        // this.derivedKPIData = response.data;
        this.derivedKPIData = response.data.filter(item => item.metadata.specific_power_consumption_discharge !== undefined
          && item.metadata.specific_power_consumption_discharge !== null);
        console.log(this.derivedKPIData.length);
        // this.derivedKPILatestData.reverse();
        this.isDerivedKPIDataLoading = false;
        if (this.derivedKPIData.length > 0) {
          setTimeout(() => this.plotChart(), 500);
        } else {
          this.isDerivedKPIDataLoading = false;
          this.loader = false;
        }
      }
    }, error => {
      this.isDerivedKPIDataLoading = false;
      this.loader = false;
    })
    );
  }

  plotChart() {
    this.loadingMessage = 'Loading Chart. Please wait...';
    am4core.options.autoDispose = true;
    const chart = am4core.create('derivedKPIChart', am4charts.XYChart);
    const data = [];
    this.derivedKPIData.reverse();
    console.log(this.derivedKPIData);
    this.derivedKPIData.forEach((obj, i) => {
      const newObj: any = {};
      const date = this.commonService.convertUTCDateToLocal(obj?.start_interval);
      const endDate = this.commonService.convertUTCDateToLocal(obj?.end_interval);
      newObj.date = new Date(date);
      newObj.endDate = new Date(endDate);
      newObj.spc = obj.metadata?.specific_power_consumption_discharge || null;
      console.log(newObj);
      data.splice(data.length, 0, newObj);
    });
    console.log(data);
    chart.data = data;
    chart.dateFormatter.inputDateFormat = 'x';
    chart.dateFormatter.dateFormat = 'dd-MMM-yyyy';
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 70;
    dateAxis.baseInterval = { count: 1, timeUnit: 'day' };
    dateAxis.strictMinMax = true;
    dateAxis.renderer.tooltipLocation = 0;
    // Add data
    // Set input format for the dates
    // chart.dateFormatter.inputDateFormat = 'yyyy-MM-dd';

    // Create axes
    const valueYAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueYAxis.renderer.grid.template.location = 0;
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.name =  'Specific Power Consumption';
    series.yAxis = valueYAxis;
    series.dataFields.openDateX = 'date';
    series.dataFields.dateX = 'endDate';
    series.dataFields.valueY =  'spc';
    series.strokeWidth = 2;
    series.strokeOpacity = 1;
    series.legendSettings.labelText = '{name}';
    // series.fillOpacity = 0;
    series.columns.template.tooltipText = 'Start Date: {openDateX} \n End Date: {dateX} \n {name}: [bold]{spc} [/]';

    // const bullet = series.bullets.push(new am4charts.CircleBullet());
    // bullet.strokeWidth = 2;
    // bullet.circle.radius = 1.5;
    valueYAxis.tooltip.disabled = true;
    valueYAxis.renderer.labels.template.fill = am4core.color('gray');
    // valueYAxis.renderer.minWidth = 35;

    chart.legend = new am4charts.Legend();
    chart.logo.disabled = true;
    chart.legend.maxHeight = 80;
    chart.legend.scrollable = true;
    chart.legend.labels.template.maxWidth = 30;
    chart.legend.labels.template.truncate = true;
   //  chart.cursor = new am4charts.XYCursor();
    chart.legend.itemContainers.template.togglable = false;
    dateAxis.dateFormatter = new am4core.DateFormatter();
    chart.events.on('ready', (ev) => {
      this.loader = false;
      this.loadingMessage = 'Loading Data. Wait...';
    });
    // chart.scrollbarX = new am4core.Scrollbar();
    // chart.scrollbarX.parent = chart.bottomAxesContainer;
    // dateAxis.dateFormatter.dateFormat = 'W';
    this.chart = chart;
  }

  onCloseModal() {
    $('#derivedKPIModal').modal('hide');
    this.isDerivedKPIDataLoading = false;
    this.loader = false;
    this.loadingMessage = 'Loading Data. Please wait...';
    this.derivedKPIData = [];
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
