import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import * as moment from 'moment';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { DaterangepickerComponent } from 'ng2-daterangepicker';
declare var $: any;

@Component({
  selector: 'app-derived-kpis',
  templateUrl: './derived-kpis.component.html',
  styleUrls: ['./derived-kpis.component.css'],
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
  selectedDerivedKPI: any;
  loadingMessage = 'Loading Data. Please wait...';
  chart: am4charts.XYChart;
  daterange: any;
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: moment(),
    timePicker: true,
    ranges: CONSTANTS.DATE_OPTIONS,
  };
  selectedDateRange: string;
  @ViewChild(DaterangepickerComponent) private picker: DaterangepickerComponent;
  filterObj: any = {};
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
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
          name: 'Description',
          key: 'description',
        },
        {
          name: 'JSON Key',
          key: 'kpi_json_key',
        },
        {
          name: 'Value',
          key: 'kpi_result',
        },

        {
          name: '',
          key: undefined,
          headerClass: 'w-5',
        },
      ],
    };
    this.getderivedKPIs();
  }

  getderivedKPIs() {
    this.isFilterSelected = true;
    this.isderivedKPILoading = true;
    this.apiSubscriptions.push(
      this.assetService.getDerivedKPIs(this.asset.app, this.asset.asset_id).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.derivedKPIs = response.data;
            console.log(this.derivedKPIs);
          }
          this.isderivedKPILoading = false;
        },
        (error) => (this.isderivedKPILoading = false)
      )
    );
  }

  openHistoricKPIData(obj) {
    if (obj.type === this.derivedKPITableConfig.type) {
      this.selectedDerivedKPI = obj.data;
      console.log(this.selectedDerivedKPI);
      // this.getDerivedKPIsHistoricData();
      $('#derivedKPIModal').modal({ backdrop: 'static', keyboard: false, show: true });
      this.loadFromCache();
    }
  }

  getDerivedKPIsHistoricData() {
    this.isDerivedKPIDataLoading = true;
    this.loader = true;
    const kpiCode = this.selectedDerivedKPI.code;
    const obj = {
      asset_id: this.selectedDerivedKPI.asset_id,
      from_date: moment().subtract(14, 'days').utc().unix(),
      to_date: moment().utc().unix(),
      epoch: true,
      asset_model: this.selectedDerivedKPI.asset_model,
    };
    this.derivedKPIData = [];
    this.apiSubscriptions.push(
      this.assetService.getDerivedKPIHistoricalData(this.contextApp.app, kpiCode, obj).subscribe(
        (response: any) => {
          if (response?.data) {
            // this.derivedKPIData = response.data;
            this.derivedKPIData = response.data.filter(
              (item) => item.kpi_result !== undefined && item.kpi_result !== null
            );
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
        },
        (error) => {
          this.isDerivedKPIDataLoading = false;
          this.loader = false;
        }
      )
    );
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.filterObj.dateOption = item.dateOption;
      if (item.dateOption === 'Custom Range') {
        this.filterObj.from_date = item.from_date;
        this.filterObj.to_date = item.to_date;
        this.selectedDateRange =
          moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') +
          ' to ' +
          moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
      } else {
        const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
        this.filterObj.from_date = dateObj.from_date;
        this.filterObj.to_date = dateObj.to_date;
        this.selectedDateRange = this.filterObj.dateOption;
      }
      this.picker.datePicker.setStartDate(moment.unix(this.filterObj.from_date));
      this.picker.datePicker.setEndDate(moment.unix(this.filterObj.to_date));
    }
    this.getDerivedKPIsHistoricData();
  }

  selectedDate(value: any, datepicker?: any) {
    this.filterObj.dateOption = value.label;
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
    } else {
      this.filterObj.from_date = moment(value.start).utc().unix();
      this.filterObj.to_date = moment(value.end).utc().unix();
    }
    if (value.label === 'Custom Range') {
      this.selectedDateRange =
        moment(value.start).format('DD-MM-YYYY HH:mm') + ' to ' + moment(value.end).format('DD-MM-YYYY HH:mm');
    } else {
      this.selectedDateRange = value.label;
    }
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
      // newObj.date = new Date(date);
      newObj.date = new Date(endDate);
      newObj.spc = obj.kpi_result || null;
      console.log(newObj);
      data.splice(data.length, 0, newObj);
    });
    console.log(data);
    chart.data = data;
    chart.dateFormatter.inputDateFormat = 'x';
    chart.dateFormatter.dateFormat = 'dd-MMM-yyyy HH:mm:ss.nnn';
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 70;
    // dateAxis.baseInterval = { count: 1, timeUnit: 'day' };
    dateAxis.strictMinMax = true;
    dateAxis.renderer.tooltipLocation = 0;
    // Add data
    // Set input format for the dates
    // chart.dateFormatter.inputDateFormat = 'yyyy-MM-dd';
    // Create axes
    const valueYAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueYAxis.renderer.grid.template.location = 0;
    const series = chart.series.push(new am4charts.LineSeries());
    series.name = this.selectedDerivedKPI.name;
    series.yAxis = valueYAxis;
    // series.dataFields.openDateX = 'date';
    series.dataFields.dateX = 'date';
    // series.propType =
    series.dataFields.valueY = 'spc';
    series.strokeWidth = 2;
    series.strokeOpacity = 1;
    series.legendSettings.labelText = '{name}';
    series.fillOpacity = 0;
    series.tooltipText = 'Date: {dateX} \n {name}: [bold]{spc} [/]';
    const bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.strokeWidth = 2;
    bullet.circle.radius = 1.5;
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
    chart.cursor = new am4charts.XYCursor();
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
    this.filterObj = {};
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
