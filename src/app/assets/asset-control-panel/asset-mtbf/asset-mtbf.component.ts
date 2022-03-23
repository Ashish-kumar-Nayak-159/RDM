import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as datefns from 'date-fns';
import { Subscription } from 'rxjs';
import { Asset } from 'src/app/models/asset.model';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from './../../../services/toaster.service';
@Component({
  selector: 'app-asset-mtbf',
  templateUrl: './asset-mtbf.component.html',
  styleUrls: ['./asset-mtbf.component.css'],
})
export class AssetMtbfComponent implements OnInit, OnDestroy {
  filterObj: any = {};
  lifeCycleEvents: any[] = [];
  @Input() asset: Asset = new Asset();
  @Input() componentState: any;
  isLifeCycleEventsLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedEvent: any;
  isFilterSelected = false;
  modalConfig: any;
  pageType: string;
  eventTableConfig: any = {};
  avrgMTBF: any;
  avrgMTBFString: any;
  @ViewChild('dtInput1', { static: false }) dtInput1: any;
  @ViewChild('dtInput2', { static: false }) dtInput2: any;
  today = new Date();
  displayMode: string;
  chart: any;
  originalFilterObj: any = {};
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: new Date(),
    timePicker: true,
    ranges: {
      'Last 24 Hours': [datefns.subHours(new Date(), 24), datefns.subSeconds(new Date(), 0)],
      'Last 7 Days': [datefns.subDays(new Date(), 6), datefns.subSeconds(new Date(), 0)],
      'This Week': [datefns.startOfISOWeek(new Date()), datefns.subSeconds(new Date(), 0)],
      'Last 4 Weeks': [
        datefns.subWeeks(datefns.startOfISOWeek(new Date()), 4),
        datefns.subWeeks(datefns.endOfISOWeek(new Date()), 1),
      ],
      'This Month': [datefns.startOfMonth(new Date()), datefns.endOfMonth(new Date())],
      'Last Month': [datefns.startOfMonth(datefns.subMonths(new Date(), 1)), datefns.endOfMonth(datefns.subMonths(new Date(), 1))],
      'Last 3 Months': [datefns.startOfMonth(datefns.subMonths(new Date(), 3)), datefns.subMonths(datefns.endOfMonth(new Date()), 1)],
      'Last 6 Months': [datefns.startOfMonth(datefns.subMonths(new Date(), 6)), datefns.subMonths(datefns.endOfMonth(new Date()), 1)],
      'Last 12 Months': [datefns.startOfMonth(datefns.subMonths(new Date(), 12)), datefns.subMonths(datefns.endOfMonth(new Date()), 1)],
    },
  };

  loader = false;
  loadingMessage = 'Loading Data. Please wait...';
  selectedDateRange: string;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.filterObj.countNotShow = true;
    this.filterObj.epoch = true;
  }

  onTabChange(type) {
    this.displayMode = undefined;
    this.filterObj = {};
    this.loader = false;
    this.lifeCycleEvents = [];
    this.isFilterSelected = false;

    this.avrgMTBF = undefined;
    this.avrgMTBFString = undefined;
    this.filterObj.epoch = true;
    this.lifeCycleEvents = [];
    this.displayMode = type;
    this.filterObj.dateOption = 'This Month';
    this.filterObj.from_date = datefns.getUnixTime(datefns.startOfMonth(new Date()));
    this.filterObj.to_date = datefns.getUnixTime(datefns.endOfMonth(new Date()));
    // this.filterObj.last_n_secs = this.filterObj.to_date - this.filterObj.from_date;
    if (this.filterObj.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.filterObj.dateOption;
    } else {
      this.selectedDateRange =
        datefns.format(datefns.fromUnixTime(this.filterObj.from_date), "dd-MM-yyyy HH:mm") + ' to ' + datefns.format(datefns.fromUnixTime(this.filterObj.to_date), "dd-MM-yyyy HH:mm");
    }
    if (type === 'history' && this.chart) {
      this.chart.dispose();
    }
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
  }

  searchMTBFEvents(filterObj) {
    this.chart?.dispose();
    this.avrgMTBF = undefined;
    this.avrgMTBFString = undefined;
    this.lifeCycleEvents = [];
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
      // filterObj.last_n_secs = filterObj.to_date - filterObj.from_date;
    }

    const obj = { ...filterObj };
    delete obj.countNotShow;
    if (!obj.date_frequency) {
      this.toasterService.showError('Frequency is required.', 'MTBF Data');
      this.isFilterSelected = false;
      this.isLifeCycleEventsLoading = false;
      return;
    }
    this.loader = true;
    this.isFilterSelected = true;
    this.isLifeCycleEventsLoading = true;
    this.filterObj = filterObj;
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    let method;
    method = this.assetService.getHistoricalMTBFData(this.asset.app, this.asset.asset_id, obj);
    this.lifeCycleEvents = [];
    this.apiSubscriptions.push(
      method.subscribe(
        (response: any) => {
          if (response && response.data) {
            this.lifeCycleEvents = response.data;
            this.avrgMTBF = response.mtbf;
            this.avrgMTBFString = this.splitTime(response.mtbf);
          }
          this.lifeCycleEvents.forEach((item, index) => {
            item.local_event_start_time = this.commonService.convertUTCDateToLocalDate(item.start_time);
            item.local_event_end_time = this.commonService.convertUTCDateToLocalDate(item.end_time);
            item.mtbfString = this.splitTime(item.mtbf);
            item.uptime = this.splitTime(item.metadata?.total_uptime_in_sec || 0);
            item.breakdown = item.metadata?.machine_failure_breakdown_count;
          });
          if (this.displayMode === 'history' && this.lifeCycleEvents.length > 0) {
            setTimeout(() => {
              this.plotChart();
            }, 100);
          }
          if (this.filterObj.dateOption === 'Custom Range') {
            this.originalFilterObj.dateOption = 'this selected range';
          }
          this.isLifeCycleEventsLoading = false;
          if (this.lifeCycleEvents.length === 0) {
            this.loader = false;
          }
        },
        (error) => {
          this.isLifeCycleEventsLoading = false;
          this.loader = false;
        }
      )
    );
  }

  splitTime(num) {
    let d = Math.floor(num / (3600 * 24));
    let h = Math.floor((num % (3600 * 24)) / 3600);
    let m = Math.floor((num % 3600) / 60);
    let s = Math.floor(num % 60);
    let dDisplay = d > 0 ? d + (d == 1 ? ' Day, ' : ' Days, ') : '';
    let hDisplay = h > 0 ? h + (h == 1 ? ' Hr, ' : ' Hrs, ') : '';
    let mDisplay = m > 0 ? m + (m == 1 ? ' Min, ' : ' Minutes, ') : '';
    let sDisplay = s > 0 ? s + (s == 1 ? ' Second' : ' Seconds') : '';
    if (sDisplay == '') mDisplay = mDisplay.replace(', ', '');
    return dDisplay + hDisplay + mDisplay + sDisplay;
  }

  selectedDate(filterObj) {
    this.filterObj.from_date = filterObj.from_date;
    this.filterObj.to_date = filterObj.to_date;
    this.filterObj.dateOption = filterObj.dateOption;
    // this.filterObj.last_n_secs = filterObj.last_n_secs;
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    this.filterObj = {};
    this.filterObj.epoch = true;
    this.filterObj = JSON.parse(JSON.stringify(this.originalFilterObj));
    this.filterObj.date_frequency = undefined;
    this.filterObj.dateOption = 'This Month';
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
      // this.filterObj.last_n_secs = dateObj.to_date - dateObj.from_date;
      this.selectedDateRange = this.filterObj.dateOption;
    } else {
      this.selectedDateRange = datefns.format(datefns.fromUnixTime(this.filterObj.from_date), "dd-MM-yyyy HH:mm") + ' to ' + datefns.format(datefns.fromUnixTime(this.filterObj.to_date), "dd-MM-yyyy HH:mm");
    }
  }

  plotChart() {
    this.loadingMessage = 'Loading Chart. Please wait...';
    am4core.options.autoDispose = true;
    const chart = am4core.create('mtbfChart', am4charts.XYChart);
    const data = [];
    // this.lifeCycleEvents.reverse();
    this.lifeCycleEvents.forEach((obj, i) => {
      const newObj = { ...obj };
      const date = this.commonService.convertUTCDateToLocalDate(obj.start_time);
      const endDate = this.commonService.convertUTCDateToLocalDate(obj.end_time);
      newObj.date = new Date(date);
      newObj.endDate = new Date(endDate);
      newObj.mtbfHr = obj.mtbf / 3600;
      data.splice(data.length, 0, newObj);
    });
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
    // chart.dateFormatter.inpuDateFormat = 'yyyy-MM-dd';

    // Create axes
    const valueYAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueYAxis.renderer.grid.template.location = 0;
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.columns.template.width = am4core.percent(100);
    series.name = 'MTBF';
    series.yAxis = valueYAxis;
    series.dataFields.openDateX = 'date';
    series.dataFields.dateX = 'endDate';
    series.dataFields.valueY = 'mtbfHr';
    series['mtbfString'] = 'mtbfString';
    series.strokeWidth = 2;
    series.strokeOpacity = 1;
    series.legendSettings.labelText = '{name} (Hrs)';
    // series.fillOpacity = 0;
    if (this.originalFilterObj.date_frequency === 'weekly') {
      series.columns.template.tooltipText =
        'Start Date: {openDateX} \n End Date: {dateX} \n Number of breakdowns: {metadata.machine_failure_breakdown_count} \n {name}: [bold]{mtbfString}[/]';
    } else {
      series.columns.template.tooltipText = 'Date: {openDateX} \n Number of breakdowns: {metadata.machine_failure_breakdown_count} \n  {name}: [bold]{mtbfString}[/]';
    }


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

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
    this.chart?.dispose();
  }
}
