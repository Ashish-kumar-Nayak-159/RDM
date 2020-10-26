import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as moment from 'moment';
import { GoogleChartInterface, GoogleChartComponent } from 'ng2-google-charts';
import { log } from 'console';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { ToasterService } from 'src/app/services/toaster.service';

declare var $: any;
@Component({
  selector: 'app-chart-widget',
  templateUrl: './chart-widget.component.html',
  styleUrls: ['./chart-widget.component.css'],
})
export class ChartWidgetComponent implements OnInit, AfterViewInit {
  chartId = '';
  public y1axis = [];
  public y2axis = [];
  dates = [];
  layoutData: any[] = [];
  months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ];
  year = ['2016', '2017', '2018', '2019', '2020'];
  busesOnDuty = [];
  maintenance = [];
  title = 'Bus Statistics';
  type = '';
  columnNames = [];
  options = { isStacked: true };
  width = 650;
  height = 400;
  chartTypes = [
    'Bar Chart',
    'Column Chart',
    'Line Chart',
    'Area Chart',
    'Pie Chart',
    'Data Table',
  ];
  chartTypeValues = [
    'BarChart',
    'ColumnChart',
    'LineChart',
    'AreaChart',
    'PieChart',
    'Table',
  ];
  chartIcons = [
    '',
    'fa-bar-chart',
    'fa-line-chart',
    'fa-area-chart',
    'fa-pie-chart',
    '',
    '',
  ];
  public selectedChartType = '';
  widgetTitle = '';
  isCollapsed = false;
  public chartDataTable: GoogleChartInterface;
  public showDataTable = false;
  isLoading = false;

  historyFilter: any = {};
  apiSubscriptions: Subscription[] = [];
  layoutData: any[] = [];
  device = new Device();
  isLayout = false;
  y1AxisProps = [];
  y2AxisProp = [];
  // y1AxisProps = "";
  // y2AxisProp = "";
  xAxisProps = '';
  isFilterSelected = false;
  currentLayout;
  showError = false;
  errorMsg = '';

  // google chart
  public chartData: GoogleChartInterface = {
    // use :any or :GoogleChartInterface
    chartType: '',
    dataTable: [],
    options: {
      interpolateNulls: true,
      hAxis: {
        viewWindowMode: 'pretty',
        slantedText: true,
        textStyle: {
          fontSize: 10,
        },
        slantedTextAngle: 60,
      },
      legend: {
        position: 'top',
      },
      series: {},
      vAxes: {
        // Adds titles to each axis.
      },
      height: 400,
      // width: 350,
      curveType: 'function',
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 10.0,
      },
    },
  };
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    console.log(this.currentLayout);
    if (Object.keys(this.currentLayout).length === 0) {
      this.currentLayout = null;
      if (this.type.indexOf('Pie') <= -1) {
        if (
          !this.y1AxisProps ||
          (this.y1AxisProps && this.y1AxisProps.length === 0)
        ) {
          this.showError = true;
          this.errorMsg = 'Y1 Axis Property is required';
          this.toasterService.showError(
            'Y1 Axis Property is required',
            'Load Chart'
          );
          return;
        }
      } else {
        if (this.xAxisProps.length === 0) {
          this.showError = true;
          this.errorMsg = 'X Axis Property is required';
          this.toasterService.showError(
            'X Axis Property is required',
            'Load Chart'
          );
          return;
        }
      }
    } else {
      if (this.currentLayout.chartType.indexOf('Pie') <= -1) {
        if (
          !this.currentLayout.y1axis ||
          (this.currentLayout.y1axis && this.currentLayout.y1axis.length === 0)
        ) {
          this.showError = true;
          this.errorMsg = 'Y1 Axis Property is required';
          this.toasterService.showError(
            'Y1 Axis Property is required',
            'Load Chart'
          );
          return;
        }
      } else {
        if (this.currentLayout.xAxis.length === 0) {
          this.showError = true;
          this.errorMsg = 'X Axis Property is required';
          this.toasterService.showError(
            'X Axis Property is required',
            'Load Chart'
          );
          return;
        }
      }
    }
    this.searchHistory(this.currentLayout).then(
      (plottedChart: GoogleChartInterface) => {
        // const ccComponent = this.chartData.component;
        // ccComponent.draw();
        this.chartData = { ...plottedChart };
        const showTable = this.currentLayout
          ? this.currentLayout.showDataTable
          : this.showDataTable;
        if (showTable) {
          this.chartData.options.width = 500;
        } else {
          this.chartData.options.width = 'inherit';
        }
        if (this.showDataTable) {
          this.chartDataTable = { ...this.chartData };
          this.chartDataTable.chartType = 'Table';
        }
        // console.log('this.chartData ',this.chartData)
        if (
          this.chartData.chartType === 'PieChart' ||
          this.chartData.chartType === 'Pie Chart with table'
        ) {
          delete this.chartData.options.explorer;
          delete this.chartData.options.legend;
          this.chartData.options.pieSliceText = 'percentage';
          if (this.chartData.chartType === 'Pie Chart with table') {
            this.showDataTable = true;
            this.chartData.chartType = 'PieChart';
          }
        }
      }
    );
  }

  ngAfterViewInit() {
    // if (this.isLayout) {
    //   $('#' + this.chartId)
    //     .draggable({
    //       handle: '.card-header',
    //       containment: '#layoutWidgetContainer',
    //     })
    //     .resizable();
    // } else {
    //   $('#' + this.chartId)
    //     .draggable({ handle: '.card-header', containment: '#widgetContainer' })
    //     .resizable();
    // }
    // $('#' + this.chartId).on('resize', (event) => {
    //   console.log('Resize ', event);
    //   if (parseInt(event.target.style.width.split('px')[0], 10) > 700) {
    //     $('#' + this.chartId)
    //       .parent()
    //       .parent()
    //       .addClass('col-lg-12')
    //       .removeClass('col-lg-6');
    //   } else {
    //     $('#' + this.chartId)
    //       .parent()
    //       .parent()
    //       .addClass('col-lg-6')
    //       .removeClass('col-lg-12');
    //   }
    // });
    // $('#remove_' + this.chartId).on('click', () => {
    //   console.log('remove');
    //   // immediate parent is the component tag and it's parent is the col div
    //   $('#' + this.chartId)
    //     .parent()
    //     .parent()
    //     .remove();
    // });
  }

  searchHistory(layoutJson) {
    const lineGoogleChartData: GoogleChartInterface = {
      // use :any or :GoogleChartInterface
      chartType: '',
      dataTable: [],
      options: {
        interpolateNulls: true,
        hAxis: {
          viewWindowMode: 'pretty',
          slantedText: true,
          textStyle: {
            fontSize: 10,
          },
          slantedTextAngle: 60,
        },
        legend: {
          position: 'top',
        },
        series: {},
        vAxes: {
          // Adds titles to each axis.
        },
        height: 300,
        width: 600,
        curveType: 'function',
        explorer: {
          actions: ['dragToZoom', 'rightClickToReset'],
          axis: 'horizontal',
          keepInBounds: true,
          maxZoomIn: 10.0,
        },
      },
    };
    return new Promise((resolve, reject) => {
      const currentHistoryFilter = { ...this.historyFilter };
      currentHistoryFilter.y1AxisProperty = [];
      currentHistoryFilter.y2AxisProperty = [];
      currentHistoryFilter.xAxisProps = this.xAxisProps;
      if (layoutJson == null) {
        currentHistoryFilter.y1AxisProperty = this.y1AxisProps;
        currentHistoryFilter.y2AxisProperty = this.y2AxisProp;
      } else {
        currentHistoryFilter.y1AxisProperty = layoutJson.y1axis;
        currentHistoryFilter.y2AxisProperty = layoutJson.y2axis;
        currentHistoryFilter.xAxisProps = layoutJson.xAxis;
      }
      currentHistoryFilter.to_date = this.historyFilter.to_date;
      currentHistoryFilter.from_date = this.historyFilter.from_date;
      this.isLoading = true;
      lineGoogleChartData.dataTable = [];
      const obj = { ...currentHistoryFilter };
      const now = moment().utc();
      obj.to_date = now.unix();
      if (this.historyFilter.dateOption === '5 mins') {
        obj.from_date = now.subtract(5, 'minute').unix();
      } else if (this.historyFilter.dateOption === '30 mins') {
        obj.from_date = now.subtract(30, 'minute').unix();
      } else if (this.historyFilter.dateOption === '1 hour') {
        obj.from_date = now.subtract(1, 'hour').unix();
      } else if (this.historyFilter.dateOption === '24 hour') {
        obj.from_date = now.subtract(24, 'hour').unix();
      } else {
        if (this.historyFilter.from_date) {
          obj.from_date = this.historyFilter.from_date.unix();
        }
        if (this.historyFilter.to_date) {
          obj.to_date = this.historyFilter.to_date.unix();
        }
      }
      obj.message_props = '';
      const type = layoutJson ? layoutJson.chartType : this.type;
      if (type.indexOf('Pie') >= 0) {
        obj.message_props += currentHistoryFilter.xAxisProps + ',';
      } else {
        obj.y1AxisProperty.forEach((prop) => (obj.message_props += prop + ','));
        if (obj.y2AxisProperty.length > 0) {
          obj.y2AxisProperty.forEach(
            (prop) => (obj.message_props += prop + ',')
          );
        }
      }
      if (obj.message_props.charAt(obj.message_props.length - 1) === ',') {
        obj.message_props = obj.message_props.substring(
          0,
          obj.message_props.length - 1
        );
      }
      if (layoutJson == null || this.isLayout) {
        obj.count = 10;
        delete obj.to_date;
        delete obj.from_date;
      }
      delete obj.dateOption;
      delete obj.y1AxisProperty;
      delete obj.y2AxisProperty;
      delete obj.xAxisProps;
      if (this.layoutData) {
        lineGoogleChartData.dataTable = [];
        this.isLoading = false;
        this.layoutData.reverse();

        const dataList = [];
        dataList.push(currentHistoryFilter.xAxisProps);
        let title = '';
        currentHistoryFilter.y1AxisProperty.forEach((prop, index) => {
          dataList.splice(dataList.length, 0, {
            label: prop,
            type: 'number',
          });
          title +=
            prop +
            (index !== currentHistoryFilter.y1AxisProperty.length - 1
              ? ' & '
              : '');
          lineGoogleChartData.options.series[index.toString()] = {
            targetAxisIndex: 0,
          };
        });
        lineGoogleChartData.options.vAxes = {
          0: { title },
        };
        if (currentHistoryFilter.y2AxisProperty) {
          title = '';
          currentHistoryFilter.y2AxisProperty.forEach((prop, index) => {
            dataList.splice(dataList.length, 0, {
              label: prop,
              type: 'number',
            });
            title +=
              prop +
              (index !== currentHistoryFilter.y2AxisProperty.length - 1
                ? ' & '
                : '');
            lineGoogleChartData.options.series[
              currentHistoryFilter.y1AxisProperty.length + index
            ] = { targetAxisIndex: 1 };
          });
          lineGoogleChartData.options.vAxes['1'] = { title };
        }
        lineGoogleChartData.dataTable.push(dataList);
        const tempData = {};
        if (type.indexOf('Pie') >= 0) {
          this.layoutData.forEach((history) => {
            if (history[currentHistoryFilter.xAxisProps]) {
              if (tempData[history[currentHistoryFilter.xAxisProps]]) {
                tempData[history[currentHistoryFilter.xAxisProps]]++;
              } else {
                tempData[history[currentHistoryFilter.xAxisProps]] = 1;
              }
            }
          });
        }
        this.layoutData.forEach(history => {
          const list = [];
          if (type.indexOf('Pie') >= 0) {
            if (
              list.indexOf([
                history[currentHistoryFilter.xAxisProps],
                null,
              ]) <= -1
            ) {
              list.splice(0, 0, history[currentHistoryFilter.xAxisProps]);
            }
          } else {
            const keys = Object.keys(history);
            keys.reverse();
            keys.forEach(key => {
              list.splice(0, 0, history[key]);
            });
          }

          lineGoogleChartData.dataTable.splice(lineGoogleChartData.dataTable.length, 0, list);
          console.log(lineGoogleChartData);
        });
        if (type.indexOf('Pie') >= 0) {
          lineGoogleChartData.dataTable = [];
          lineGoogleChartData.dataTable.push([
            currentHistoryFilter.xAxisProps,
            { label: 'Count', type: 'number' },
          ]);
          Object.keys(tempData).forEach((key) => {
            lineGoogleChartData.dataTable.push([key, tempData[key]]);
          });
        }
        lineGoogleChartData.chartType = type;
        resolve(lineGoogleChartData);
      }
    });
  }

  changeSliceText(e) {
    console.log('e ', e);
    if (e === 'val') {
      this.chartData.options.pieSliceText = 'value';
    } else {
      this.chartData.options.pieSliceText = 'percentage';
    }
    this.chartData.component.draw();
  }
}
