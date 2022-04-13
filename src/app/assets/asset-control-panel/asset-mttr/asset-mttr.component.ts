import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as datefns from 'date-fns';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from './../../../services/toaster.service';

declare var $: any;
@Component({
  selector: 'app-asset-mttr',
  templateUrl: './asset-mttr.component.html',
  styleUrls: ['./asset-mttr.component.css'],
})
export class AssetMttrComponent implements OnInit, OnDestroy {
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
  isEventAcknowledgeAPILoading = false;
  averageMTTR: any;
  displayMode: string;
  averageMTTRString: any;
  originalFilterObj: any = {};
  chart: any;
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
  today = new Date();
  selectedDateRange: string;
  loader = false;
  loadingMessage = 'Loading Data. Please wait...';
  decodedToken: any;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    // this.filterObj.count = 50;
    this.filterObj.epoch = true;
  }

  onTabChange(type) {
    this.displayMode = undefined;
    this.filterObj = {};
    this.averageMTTR = undefined;
    this.averageMTTRString = undefined;
    this.filterObj.epoch = true;
    this.lifeCycleEvents = [];
    this.isFilterSelected = false;
    this.displayMode = type;
    this.loader = false;
    this.filterObj.dateOption = 'This Month';
    this.filterObj.from_date = datefns.getUnixTime(datefns.startOfMonth(new Date()));
    this.filterObj.to_date = datefns.getUnixTime(datefns.endOfMonth(new Date()));
    // this.filterObj.last_n_secs = this.filterObj.to_date - this.filterObj.from_date;
    if (this.filterObj.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.filterObj.dateOption;
    } else {
      this.selectedDateRange = datefns.format(datefns.fromUnixTime(this.filterObj.from_date), "dd-MM-yyyy HH:mm") + ' to ' + datefns.format(datefns.fromUnixTime(this.filterObj.to_date), "dd-MM-yyyy HH:mm");
    }
    if (type === 'history') {
      this.filterObj.countNotShow = true;
    } else {
      this.filterObj.count = 10;
    }
    if (type === 'history' && this.chart) {
      this.chart.dispose();
    }
  }

  selectedDate(filterObj: any) {
    this.filterObj.from_date = filterObj.from_date;
    this.filterObj.to_date = filterObj.to_date;
    this.filterObj.dateOption = filterObj.dateOption;
    // this.filterObj.last_n_secs = filterObj.last_n_secs;
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    this.filterObj = {};
    this.filterObj.epoch = true;
    if (this.displayMode === 'history') {
      this.filterObj.countNotShow = true;
    } else {
      this.filterObj.count = 10;
    }
    this.filterObj.date_frequency = undefined;
    this.filterObj.dateOption = 'This Month';
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
      this.selectedDateRange = this.filterObj.dateOption;
      // this.filterObj.last_n_secs = this.filterObj.to_date - this.filterObj.from_date;
    } else {
      this.selectedDateRange = datefns.format(datefns.fromUnixTime(this.filterObj.from_date), "dd-MM-yyyy HH:mm") + ' to ' + datefns.format(datefns.fromUnixTime(this.filterObj.to_date), "dd-MM-yyyy HH:mm");
    }
  }

  searchEvents(filterObj) {
    this.averageMTTR = undefined;
    this.averageMTTRString = undefined;
    this.lifeCycleEvents = [];
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    }

    const obj = { ...filterObj };
    if (!obj.from_date || !obj.to_date) {
      this.isLifeCycleEventsLoading = false;
      this.toasterService.showError('Date Time selection is required', 'View MTTR Data');
      return;
    }
    if (this.displayMode === 'history' && !obj.date_frequency) {
      this.toasterService.showError('Frequency is required.', 'MTTR Data');
      this.isFilterSelected = false;
      this.isLifeCycleEventsLoading = false;
      return;
    }
    this.isFilterSelected = true;
    this.loader = true;
    this.isLifeCycleEventsLoading = true;
    delete obj.dateOption;
    delete obj.countNotShow;
    this.filterObj = filterObj;
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));

    let method;
    if (this.displayMode === 'network_failure') {
      delete obj.date_frequency;
      method = this.assetService.getAssetNetworkFailureEvents(this.asset.app, this.asset.asset_id, obj);
    } else if (this.displayMode === 'machine_failure') {
      delete obj.date_frequency;
      //delete obj.count;
      method = this.assetService.getAssetMachineFailureEvents(this.asset.app, this.asset.asset_id, obj);
    } else if (this.displayMode === 'history') {
      delete obj.count;
      // obj.date_frequency = 'weekly';
      method = this.assetService.getHistoricalMTTRData(this.asset.app, this.asset.asset_id, obj);
    }
    this.apiSubscriptions.push(
      method.subscribe(
        (response: any) => {
          if (response?.data) {
            this.lifeCycleEvents = response.data;
            if (this.displayMode === 'machine_failure') {
              this.averageMTTR = response.mttr;
              this.averageMTTRString = this.splitTime(response.mttr);
            }
            this.lifeCycleEvents.forEach((item, index) => {
              item.local_event_start_time = this.commonService.convertUTCDateToLocal(item.event_start_time);
              item.local_event_end_time = this.commonService.convertUTCDateToLocal(item.event_end_time);
              item.mttrString = this.splitTime(item.event_timespan_in_sec);
              item.breakdown = item.metadata?.machine_failure_breakdown_count;
              if (this.displayMode === 'history') {
                item.mttrString = this.splitTime(item.mttr);
              }
            });
            if (this.displayMode === 'history' && this.lifeCycleEvents.length > 0) {
              setTimeout(() => this.plotChart(), 500);
            }
          }
          if (this.filterObj.dateOption == 'Custom Range') {
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

  openModal(event) {
    this.selectedEvent = JSON.parse(JSON.stringify(event));
    if (!this.selectedEvent.event_metadata) {
      this.selectedEvent.event_metadata = {};
    }
    $('#eventAcknowledgeModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  closeModal() {
    this.selectedEvent = undefined;
    $('#eventAcknowledgeModal').modal('hide');
  }

  acknowledgeEvent() {
    if (!this.selectedEvent.event_reason) {
      this.toasterService.showError('Acknowledgement reason is required.', 'Acknowledge Event');
      return;
    }
    this.isEventAcknowledgeAPILoading = true;
    this.assetService
      .updateAssetMTTRData(this.asset.app, this.asset.asset_id, this.selectedEvent.id, this.selectedEvent)
      .subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Acknowledge Event');
          this.isEventAcknowledgeAPILoading = false;
          this.closeModal();
          this.searchEvents(this.filterObj);
        },
        (error) => {
          this.toasterService.showError(error.message, 'Acknowledge Event');
          this.isEventAcknowledgeAPILoading = false;
        }
      );
  }

  plotChart() {
    this.loadingMessage = 'Loading Chart. Please wait...';
    am4core.options.autoDispose = true;
    const chart = am4core.create('mttrChart', am4charts.XYChart);
    const data = [];
    // this.lifeCycleEvents.reverse();
    this.lifeCycleEvents.forEach((obj, i) => {
      const newObj = { ...obj };
      const date = this.commonService.convertUTCDateToLocal(obj.start_time);
      const endDate = this.commonService.convertUTCDateToLocal(obj.end_time);
      newObj.date = new Date(date);
      newObj.endDate = new Date(endDate);
      newObj.mttrHr = obj.mttr / 3600;
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
    // chart.dateFormatter.inputDateFormat = 'yyyy-MM-dd';

    // Create axes
    const valueYAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueYAxis.renderer.grid.template.location = 0;
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.name = 'MTTR';
    series.yAxis = valueYAxis;
    series.dataFields.openDateX = 'date';
    series.dataFields.dateX = 'endDate';
    series.dataFields.valueY = 'mttrHr';
    series['mttrString'] = 'mttrString';
    series.strokeWidth = 2;
    series.strokeOpacity = 1;
    series.legendSettings.labelText = '{name} (Hrs)';
    // series.fillOpacity = 0;
    if (this.originalFilterObj.date_frequency === 'weekly') {
      series.columns.template.tooltipText =
        'Start Date: {openDateX} \n End Date: {dateX} \n Number of breakdowns: {metadata.machine_failure_breakdown_count} \n {name}: [bold]{mttrString} [/]';
    } else {
      series.columns.template.tooltipText = 'Date: {openDateX} \n Number of breakdowns: {metadata.machine_failure_breakdown_count} \n {name}: [bold]{mttrString} [/]';
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
