import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
@Component({
  selector: 'app-device-mtbf',
  templateUrl: './device-mtbf.component.html',
  styleUrls: ['./device-mtbf.component.css']
})
export class DeviceMtbfComponent implements OnInit, OnDestroy {

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
  avrgMTBF: any;
  avrgMTBFString: any;
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;
  today = new Date();
  displayMode: string;
  chart: any;
  originalFilterObj: any = {};
  daterange: any = {};
  DateRange: string;
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
  loader = false;
  loadingMessage = 'Loading Data. Please wait...';
  @ViewChild(DaterangepickerComponent) private picker: DaterangepickerComponent;
  selectedDateRange: string;
  constructor(
    private deviceService: DeviceService,
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
    this.filterObj.from_date = moment().startOf('month').utc().unix();
    this.filterObj.to_date = moment().endOf('month').utc().unix();
    if (this.filterObj.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.filterObj.dateOption;
    } else {
      this.selectedDateRange = moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') + ' to ' +
      moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
    }
    if (type === 'history' && this.chart) {
      this.chart.dispose();
    }
    setTimeout(() => {
      this.picker.datePicker.setStartDate(moment.unix(this.filterObj.from_date));
      this.picker.datePicker.setEndDate(moment.unix(this.filterObj.to_date));
    }, 1000);
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
    } else {
      filterObj.from_date = filterObj.from_date;
      filterObj.to_date = filterObj.to_date;
    }
    const obj = {...filterObj};
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
    method = this.deviceService.getHistoricalMTBFData(this.device.app, this.device.device_id, obj);
    this.lifeCycleEvents = [];
    this.apiSubscriptions.push(method.subscribe(
      (response: any) => {
        if (response && response.data) {
          this.lifeCycleEvents = response.data;
          this.avrgMTBF = response.mtbf;
          this.avrgMTBFString = this.splitTime(response.mtbf / 60);
        }
        this.lifeCycleEvents .forEach((item, index) => {
          item.local_event_start_time = this.commonService.convertUTCDateToLocalDate(item.start_time);
          item.local_event_end_time = this.commonService.convertUTCDateToLocalDate(item.end_time);
          item.mtbfString = this.splitTime(item.mtbf / 60);
          item.uptime = this.splitTime(item.metadata?.total_uptime_in_sec / 60 || 0);
          console.log(item.uptime);
        });
        if (this.displayMode === 'history' && this.lifeCycleEvents.length > 0) {
          setTimeout(() =>  {
            this.plotChart();
          }, 100);
        }
        if (this.filterObj.dateOption !== 'Custom Range') {
          this.DateRange = this.filterObj.dateOption;
        }
        else {
          this.DateRange = "this selected range";
        }
        //this.DateRange = this.filterObj.dateOption;
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
    // const numberOfHours = minutes / 60;
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
      this.selectedDateRange = moment(value.start).format('DD-MM-YYYY HH:mm') + ' to ' + moment(value.end).format('DD-MM-YYYY HH:mm');
    } else {
      this.selectedDateRange = value.label;
    }
    console.log(this.filterObj);
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
      this.selectedDateRange = this.filterObj.dateOption;
    } else {
      this.selectedDateRange = moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') + ' to ' +
      moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
    }
    this.picker.datePicker.setStartDate(moment.unix(this.filterObj.from_date));
    this.picker.datePicker.setEndDate(moment.unix(this.filterObj.to_date));
  }

  plotChart() {
    this.loadingMessage = 'Loading Chart. Please wait...';
    am4core.options.autoDispose = true;
    console.log(document.getElementById('mtbfChart'));
    const chart = am4core.create('mtbfChart', am4charts.XYChart);
    const data = [];
    // this.lifeCycleEvents.reverse();
    this.lifeCycleEvents.forEach((obj, i) => {
      const newObj = {...obj};
      const date = this.commonService.convertUTCDateToLocalDate(obj.start_time);
      const endDate = this.commonService.convertUTCDateToLocalDate(obj.end_time);
      newObj.date = new Date(date);
      newObj.endDate = new Date(endDate);
      newObj.mtbfHr = obj.mtbf / 3600;
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
    // chart.dateFormatter.inpuDateFormat = 'yyyy-MM-dd';

    // Create axes
    const valueYAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueYAxis.renderer.grid.template.location = 0;
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.columns.template.width = am4core.percent(100);
    series.name =  'MTBF';
    series.yAxis = valueYAxis;
    series.dataFields.openDateX = 'date';
    series.dataFields.dateX = 'endDate';
    series.dataFields.valueY =  'mtbfHr';
    series['mtbfString'] = 'mtbfString';
    series.strokeWidth = 2;
    series.strokeOpacity = 1;
    series.legendSettings.labelText = '{name} (Hrs)';
    // series.fillOpacity = 0;
    if (this.originalFilterObj.date_frequency === 'weekly') {
    series.columns.template.tooltipText = 'Start Date: {openDateX} \n End Date: {dateX} \n {name}: [bold]{mtbfString}[/]';
    } else {
      series.columns.template.tooltipText = 'Date: {openDateX} \n  {name}: [bold]{mtbfString}[/]';
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
