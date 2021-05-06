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
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.filterObj.countNotShow = true;

    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);

    }));
    this.filterObj.epoch = true;

  }

  onTabChange(type) {
    this.filterObj = {};
    this.avrgMTBF = undefined;
    this.avrgMTBFString = undefined;
    this.filterObj.epoch = true;
    this.lifeCycleEvents = [];
    if (type === 'history' && this.chart) {
      this.chart.dispose();
    }
  }

  searchMTBFEvents(filterObj) {
    this.avrgMTBF = undefined;
    this.avrgMTBFString = undefined;
    this.isFilterSelected = true;
    this.isLifeCycleEventsLoading = true;
    const obj = {...filterObj};
    const now = moment().utc();
    if (filterObj.dateOption === '24 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(24, 'hour')).unix();
    } else if (filterObj.dateOption === 'last 7 days') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(7, 'days')).unix();
    } else if (filterObj.dateOption === 'this week') {
      const today = moment();
      obj.from_date = today.startOf('isoWeek').unix();
      obj.to_date = now.unix();
    }  else if (filterObj.dateOption === 'this month') {
      const today = moment();
      obj.from_date = today.startOf('month').unix();
      obj.to_date = now.unix();
    } else if (filterObj.dateOption === 'last 4 weeks') {
      obj.from_date = moment().subtract(4, 'weeks').startOf('isoWeek').unix();
      obj.to_date = moment().subtract(1, 'weeks').endOf('isoWeek').unix();
    } else if (filterObj.dateOption === 'last month') {
      obj.from_date = moment().subtract(1, 'month').startOf('month').unix();
      obj.to_date = moment().subtract(1, 'month').endOf('month').unix();
    } else if (filterObj.dateOption === 'last 3 month') {
      obj.from_date = moment().subtract(3, 'month').startOf('month').unix();
      obj.to_date = moment().subtract(1, 'month').endOf('month').unix();
    } else if (filterObj.dateOption === 'last 6 month') {
      obj.from_date = moment().subtract(6, 'month').startOf('month').unix();
      obj.to_date = moment().subtract(1, 'month').endOf('month').unix();
    } else if (filterObj.dateOption === 'last 12 month') {
      obj.from_date = moment().subtract(12, 'month').startOf('month').unix();
      obj.to_date = moment().subtract(1, 'month').endOf('month').unix();
    } else {
      if (filterObj.from_date) {
        obj.from_date = (filterObj.from_date.unix());
      }
      if (filterObj.to_date) {
        obj.to_date = filterObj.to_date.unix();
      }
    }
    obj.date_frequency = 'weekly';
    delete obj.dateOption;
    delete obj.countNotShow;
    this.filterObj = filterObj;
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
        });
        if (this.displayMode === 'history') {
          setTimeout(() =>  this.plotChart(), 500);
        }
        this.isLifeCycleEventsLoading = false;
      }, error => this.isLifeCycleEventsLoading = false
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

  onDateOptionChange() {
    if (this.filterObj.dateOption !== 'custom') {
      this.filterObj.from_date = undefined;
      this.filterObj.to_date = undefined;
    }
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
  }

  onDateChange(event) {
    this.filterObj.from_date = moment(event.value[0]).second(0).utc();
    this.filterObj.to_date = moment(event.value[1]).second(0).utc();
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
    if (this.filterObj.dateOption !== 'date range') {
      this.filterObj.dateOption = undefined;
    }
  }

  onSingleDateChange(event) {
    this.filterObj.from_date = moment(event.value).utc();
    this.filterObj.to_date = ((moment(event.value).add(23, 'hours')).add(59, 'minute')).utc();
    const to = this.filterObj.to_date.unix();
    const current = (moment().utc()).unix();
    if (current < to) {
      this.filterObj.to_date = moment().utc();
    }
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.filterObj.dateOption !== 'date') {
      this.filterObj.dateOption = undefined;
    }
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    this.filterObj = {};
    this.filterObj.epoch = true;
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
  }

  plotChart() {

    const chart = am4core.create('chartdiv', am4charts.XYChart);
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
    series.columns.template.tooltipText = 'Start Date: {openDateX} \n End Date: {dateX} \n {name}: [bold]{mtbfString}[/]';

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
