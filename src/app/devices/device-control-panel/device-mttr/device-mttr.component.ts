import { filter } from 'rxjs/operators';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { DaterangepickerComponent } from 'ng2-daterangepicker';

declare var $: any;
@Component({
  selector: 'app-device-mttr',
  templateUrl: './device-mttr.component.html',
  styleUrls: ['./device-mttr.component.css']
})
export class DeviceMttrComponent implements OnInit, OnDestroy {

  filterObj: any = {};
  lifeCycleEvents: any[] = [];
  @Input() device: Device = new Device();
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
  daterange: any = {};
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: moment(),
    timePicker: true,
    ranges: {
      'Last 24 Hours': [moment().subtract(24, 'hours'), moment()],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'This Week': [moment().startOf('isoWeek'), moment()],
      'Last 4 Weeks': [moment().subtract(4, 'weeks').startOf('isoWeek'), moment().subtract(1, 'weeks').endOf('isoWeek')],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [ moment().subtract(1, 'month').endOf('month'), moment().subtract(1, 'month').startOf('month')],
      'Last 3 Months': [moment().subtract(3, 'month').endOf('month'), moment().subtract(1, 'month').startOf('month')],
      'Last 6 Months': [moment().subtract(6, 'month').endOf('month'), moment().subtract(1, 'month').startOf('month')],
      'Last 12 Months': [moment().subtract(12, 'month').endOf('month'), moment().subtract(1, 'month').startOf('month')]
    }
  };
  @ViewChild(DaterangepickerComponent) private picker: DaterangepickerComponent;
  today = new Date();
  selectedDateRange: string;
  loader = false;
  loadingMessage = 'Loading Data. Please wait...';
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
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
    this.filterObj.dateOption = 'Last 24 Hours';
    this.filterObj.from_date = moment().subtract(24, 'hours').utc().unix();
    this.filterObj.to_date = moment().utc().unix();
    if (this.filterObj.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.filterObj.dateOption;
    } else {
      this.selectedDateRange = moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') + ' to ' +
      moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
    }
    if (type === 'machine_failure') {
      this.filterObj.countNotShow = true;
    } else {
      this.filterObj.count = 10;
    }
    if (type === 'history' && this.chart) {
      this.chart.dispose();
    }
    setTimeout(() => {
      this.picker.datePicker.setStartDate(moment.unix(this.filterObj.from_date));
      this.picker.datePicker.setEndDate(moment.unix(this.filterObj.to_date));
    }, 1000);
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
    console.log(this.filterObj);
    if (value.label === 'Custom Range') {
      this.selectedDateRange = moment(value.start).format('DD-MM-YYYY HH:mm') + ' to ' + moment(value.end).format('DD-MM-YYYY HH:mm');
    } else {
      this.selectedDateRange = value.label;
    }
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    this.filterObj = {};
    this.filterObj.epoch = true;
    if (this.displayMode === 'machine_failure') {
      this.filterObj.countNotShow = true;
    } else {
      this.filterObj.count = 10;
    }
    this.filterObj.date_frequency = undefined;
    this.filterObj.dateOption = 'Last 24 Hours';
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
      this.selectedDateRange = this.filterObj.dateOption;
    } else {
      this.selectedDateRange = moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') + ' to ' +
      moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
    }
    this.picker.datePicker.setStartDate(moment.unix(this.filterObj.from_date));
    this.picker.datePicker.setEndDate(moment.unix(this.filterObj.to_date));
  }

  searchEvents(filterObj) {
    this.averageMTTR = undefined;
    this.averageMTTRString = undefined;
    this.lifeCycleEvents = [];
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    } else {
      filterObj.from_date = filterObj.from_date;
      filterObj.to_date = filterObj.to_date;
    }
    const obj = {...filterObj};
    if (!obj.from_date || !obj.to_date) {
      this.isLifeCycleEventsLoading = false;
      this.toasterService.showError('Date Time selection is required', 'View MTTR Data');
      return;
    }
    if (this.displayMode === 'history' && !obj.date_frequency) {
      this.toasterService.showError('Frequency is required.', 'MTBF Data');
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
      method = this.deviceService.getDeviceNetworkFailureEvents(this.device.app, this.device.device_id, obj);
    } else if (this.displayMode === 'machine_failure') {
      delete obj.date_frequency;
      delete obj.count;
      method = this.deviceService.getDeviceMachineFailureEvents(this.device.app, this.device.device_id, obj);
    } else if (this.displayMode === 'history') {
      delete obj.count;
      // obj.date_frequency = 'weekly';
      method = this.deviceService.getHistoricalMTTRData(this.device.app, this.device.device_id, obj);
    }
    this.apiSubscriptions.push(method.subscribe(
      (response: any) => {
        if (response?.data) {
          this.lifeCycleEvents = response.data;
          if (this.displayMode === 'machine_failure') {
            this.averageMTTR = response.mttr;
            this.averageMTTRString = this.splitTime(response.mttr / 60);
          }
          this.lifeCycleEvents .forEach((item, index) => {
            item.local_event_start_time = this.commonService.convertUTCDateToLocal(item.event_start_time);
            item.local_event_end_time = this.commonService.convertUTCDateToLocal(item.event_end_time);
            item.mttrString = this.splitTime(item.event_timespan_in_sec / 60);
            if (this.displayMode === 'history') {
              item.mttrString = this.splitTime(item.mttr / 60);
            }
          });
          if (this.displayMode === 'history' && this.lifeCycleEvents.length > 0) {
            setTimeout(() =>  this.plotChart(), 500);
          }
        }
        this.isLifeCycleEventsLoading = false;
        if (this.lifeCycleEvents.length === 0) {
          this.loader = false;
        }
      }, error => {
        this.isLifeCycleEventsLoading = false;
        this.loader = false;
      }
    ));
  }

  splitTime(num){
    const d = Math.floor(num / 1440); // 60*24
    const h = Math.floor((num - (d * 1440)) / 60);
    const m = Math.round(num % 60);
    if (d > 0){
      return(d + ' Days, ' + h + ' Hrs, ' + m + ' Mins');
    } else if (h > 0) {
      return(h + ' Hrs, ' + m + ' Mins');
    } else {
      return m + ' Mins';
    }
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
    this.deviceService.updateDeviceMTTRData(this.device.app, this.device.device_id, this.selectedEvent.id, this.selectedEvent).
    subscribe((response: any) => {
      this.toasterService.showSuccess(response.message, 'Acknowledge Event');
      this.isEventAcknowledgeAPILoading = false;
      this.closeModal();
      this.searchEvents(this.filterObj);
    }, error => {
      this.toasterService.showError(error.message, 'Acknowledge Event');
      this.isEventAcknowledgeAPILoading = false;
    });
  }


  plotChart() {
    this.loadingMessage = 'Loading Chart. Please wait...';
    am4core.options.autoDispose = true;
    const chart = am4core.create('mttrChart', am4charts.XYChart);
    const data = [];
    // this.lifeCycleEvents.reverse();
    this.lifeCycleEvents.forEach((obj, i) => {
      const newObj = {...obj};
      const date = this.commonService.convertUTCDateToLocal(obj.start_time);
      const endDate = this.commonService.convertUTCDateToLocal(obj.end_time);
      newObj.date = new Date(date);
      newObj.endDate = new Date(endDate);
      newObj.mttrHr = obj.mttr / 3600;
      data.splice(data.length, 0, newObj);
    });
    console.log(JSON.stringify(data));
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
    series.name =  'MTTR';
    series.yAxis = valueYAxis;
    series.dataFields.openDateX = 'date';
    series.dataFields.dateX = 'endDate';
    series.dataFields.valueY =  'mttrHr';
    series['mttrString'] = 'mttrString';
    series.strokeWidth = 2;
    series.strokeOpacity = 1;
    series.legendSettings.labelText = '{name} (Hrs)';
    // series.fillOpacity = 0;
    if (this.originalFilterObj.date_frequency === 'weekly') {
      series.columns.template.tooltipText = 'Start Date: {openDateX} \n End Date: {dateX} \n {name}: [bold]{mttrString} [/]';
    } else {
      series.columns.template.tooltipText = 'Date: {openDateX} \n {name}: [bold]{mttrString} [/]';
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
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
    this.chart?.dispose();
  }
}
