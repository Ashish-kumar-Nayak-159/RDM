import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { GoogleChartInterface } from 'ng2-google-charts';
import { log } from 'console';

declare var $: any
@Component({
  selector: 'app-chart-widget',
  templateUrl: './chart-widget.component.html',
  styleUrls: ['./chart-widget.component.css']
})


export class ChartWidgetComponent implements OnInit {
  chartId = ""
  public y1axis = []
  public y2axis = []
  dates = []
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
  year = ["2016", "2017", "2018", "2019", "2020"]
  busesOnDuty = []
  maintenance = []
  title = 'Bus Statistics';
  type = 'ColumnChart';
  columnNames = []
  options = { isStacked: true };
  width = 650
  height = 400
  chartTypes = ["Bar Chart", "Column Chart", "Line Chart", "Area Chart", "Pie Chart", "Data Table"]
  chartTypeValues = ["BarChart", "ColumnChart", "LineChart", "AreaChart", "PieChart", "Table"]
  chartIcons = ["", "fa-bar-chart", "fa-line-chart", "fa-area-chart", "fa-pie-chart", "", ""]
  public selectedChartType = ""
  widgetTitle = ""
  isCollapsed : boolean = false
  public chartDataTable: GoogleChartInterface;
  public showDataTable : boolean = false

  // google chart
  public chartData: GoogleChartInterface = {  // use :any or :GoogleChartInterface
    chartType: '',
    dataTable: [],
    options: {
      interpolateNulls: true,
      hAxis: {
        viewWindowMode: 'pretty',
        slantedText: true,
        textStyle: {
          fontSize: 10
        },
        slantedTextAngle: 60
      },
      legend: {
        position: 'top'
      },
      series: {
      },
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
        maxZoomIn: 10.0}
    }
  };
  constructor() { }

  ngOnInit(): void {
    if(this.showDataTable){
      this.chartDataTable = {...this.chartData}
      this.chartDataTable.chartType = "Table"
    }
  }

  ngAfterViewInit() {
    $("#" + this.chartId).draggable({ handle: ".card-header",containment: "#widgetContainer" })
      .resizable();
    $("#" + this.chartId).on('resize',(event)=>{
      if(parseInt(event.target.style.width.split('px')[0])>700){
        $("#"+this.chartId).parent().parent().addClass('col-lg-12').removeClass('col-lg-6')
      }
      else{
        $("#"+this.chartId).parent().parent().addClass('col-lg-6').removeClass('col-lg-12')
      }
      
    })
    // $("#collapse_" + this.chartId).on("click", () => {
    //   if ($("#box_"+this.chartId).hasClass('collapsed-box')) { 
    //     $("#box_"+this.chartId).removeClass('collapsed-box') 
    //     this.isCollapsed = false
    //   } else {
    //      $("#box_"+this.chartId).addClass('collapsed-box') 
    //      this.isCollapsed = true
    //     } 
    // })
    $("#remove_" + this.chartId).on("click", () => {
      //immediate parent is the component tag and it's parent is the col div
      $("#"+this.chartId).parent().parent().remove()
    })
  }

  loadChart() {
    let today = moment()
    for (var i = 0; i < 5; i++) {
      this.dates.push(today.subtract(i, 'd').format("MM-DD-YYYY"))
      today = moment()
    }
    this.dates = this.dates.reverse()
    this.busesOnDuty = []
    this.maintenance = []
    // this.columnNames = []
    let loopCnt = 5
    // if (this.y1axis == 'month') {
    //   loopCnt = 12
    // }
    // $.each($("input[name='yaxis']:checked"), ((ele) => {
    //   this.columnNames.push(ele);
    // }))
    // if (this.columnNames.length > 0) {
      for (let index = 0; index < loopCnt; index++) {
        if (this.columnNames.length == 1) {
          if (this.y1axis.length==1) {
            // this.busesOnDuty.push([this.dates[index],Math.floor((Math.random() * 100) + 1),Math.floor((Math.random() * 100) + 1)])
            this.busesOnDuty.push([this.dates[index], Math.floor((Math.random() * 100) + 1)])
          }
          else if (this.y1axis.length==2) {
            // this.busesOnDuty.push([this.year[index],Math.floor((Math.random() * 100) + 1),Math.floor((Math.random() * 100) + 1)])
            this.busesOnDuty.push([this.year[index], Math.floor((Math.random() * 100) + 1)])
          }
          else {
            // this.busesOnDuty.push([this.months[index],Math.floor((Math.random() * 100) + 1),Math.floor((Math.random() * 100) + 1)])
            this.busesOnDuty.push([this.months[index], Math.floor((Math.random() * 100) + 1)])
          }
        }
        else {

          if (this.y1axis.length==1) {
            this.busesOnDuty.push([this.dates[index], Math.floor((Math.random() * 100) + 1), Math.floor((Math.random() * 100) + 1)])
            // this.busesOnDuty.push([this.dates[index],Math.floor((Math.random() * 100) + 1)])
          }
          else if (this.y1axis.length==2) {
            this.busesOnDuty.push([this.year[index], Math.floor((Math.random() * 100) + 1), Math.floor((Math.random() * 100) + 1)])
            // this.busesOnDuty.push([this.year[index],Math.floor((Math.random() * 100) + 1)])
          }
          else {
            this.busesOnDuty.push([this.months[index], Math.floor((Math.random() * 100) + 1), Math.floor((Math.random() * 100) + 1)])
            // this.busesOnDuty.push([this.year[index],Math.floor((Math.random() * 100) + 1)])
          }
        }
      }
    // }
    // else {
    //   alert("Please select Y-axis parameter")
    // }
  }

  changeChartType(selectedChartType) {
    if (selectedChartType == "StackedBarChart") {
      this.type = "ColumnChart"
      this.options['isStacked'] = true
    }
    else {

      if (selectedChartType == "PieChart" && this.columnNames.length == 2) {
        alert("Pie chart does not support 2D values on X-axis")
      } else {
        this.type = selectedChartType
      }
    }
    this.selectedChartType = this.type
  }
}
