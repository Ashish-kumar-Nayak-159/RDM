import { Component, OnInit, Input, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DeviceService } from './../../../services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import { Device } from 'src/app/models/device.model';
import { CONSTANTS } from './../../../app.constants';
import { GoogleChartInterface } from 'ng2-google-charts';
import * as moment from 'moment';
import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { ChartWidgetComponent } from '../chart-widget/chart-widget.component';
import { MapWidgetComponent } from '../map-widget/map-widget.component';

declare var $: any;
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  historyFilter: any = {};
  apiSubscriptions: Subscription[] = [];
  historyData: any[] = [];
  isHistoryAPILoading = false;
  @Input() device = new Device();
  @Input() isLayout;
  userData: any;
  isFilterSelected = false;
  propertyList: any[] = [];
  dropdownPropList = [];
  y1AxisProps = [];
  y2AxisProp = [];
  // y1AxisProps = "";
  // y2AxisProp = "";
  xAxisProps = "";

  //chart selection 
  chartCount = 0
  chartTypes = ["Bar Chart", "Column Chart", "Line Chart", "Area Chart", "Pie Chart", "Data Table", "Map", "Pie Chart + Data Table"]
  chartTypeValues = ["BarChart", "ColumnChart", "LineChart", "AreaChart", "PieChart", "Table", "Map", "Pie Chart with table"]
  chartIcons = ["fa-bar-chart fa-rotate-90", "fa-bar-chart", "fa-line-chart", "fa-area-chart", "fa-pie-chart", "fa-table", "fa-map", "fa-pie-chart fa-table"]
  public selectedChartType = "Chart Type"
  columnNames = []
  layoutJson = []
  storedLayout = {}
  chartTitle = ""
  showDataTable: boolean = false
  appData: any = {};
  // google chart
  public lineGoogleChartData: GoogleChartInterface = {  // use :any or :GoogleChartInterface
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
      // legend: {
      //   position: 'top'
      // },
      series: {
      },
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
        maxZoomIn: 10.0
      }
    }
  };
  appName: any;
  selectedHierarchy = ""
  renderCount = 0
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private route: ActivatedRoute,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }



  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.appData = this.userData.apps.filter(
        app => app.app === params.get('applicationId')
      )[0];
      this.propertyList = this.appData.metadata.properties ? this.appData.metadata.properties : [];
      this.historyFilter.app = this.appName;
    });
    this.historyFilter.epoch = true;
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
      this.historyFilter.gateway_id = this.device.device_id;
    } else {
      this.historyFilter.device_id = this.device.device_id;
    }
    if (this.propertyList) {
      this.propertyList.forEach(item => {
        this.dropdownPropList.push({
          id: item
        });
      });
    }
    console.log(this.historyFilter);
    this.getLayout()

  }

  onDateOptionChange() {
    this.historyFilter.from_date = undefined;
    this.historyFilter.to_date = undefined;
  }

  searchHistory(layoutJson) {
    let lineGoogleChartData: GoogleChartInterface = {  // use :any or :GoogleChartInterface
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
        // legend: {
        //   position: 'top'
        // },
        series: {
        },
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
          maxZoomIn: 10.0
        }
      }
    };
    return new Promise((resolve, reject) => {
      this.historyFilter.y1AxisProperty = [];
      this.historyFilter.y2AxisProperty = [];
      if (layoutJson == null) {
        this.y1AxisProps.forEach(item => {
          this.historyFilter.y1AxisProperty.push(item.id);
        });
        this.y2AxisProp.forEach(item => {
          this.historyFilter.y2AxisProperty.push(item.id);
        });
      }
      else {
        this.historyFilter.y1AxisProperty = layoutJson.y1axis
        this.historyFilter.y2AxisProperty = layoutJson.y2axis
        this.xAxisProps = layoutJson.xAxis
        // this.selectedChartType = layoutJson.chartType
      }


      this.isHistoryAPILoading = true;
      lineGoogleChartData.dataTable = [];
      const obj = { ...this.historyFilter };
      const now = moment().utc();
      obj.to_date = now.unix();
      if (this.historyFilter.dateOption === '5 mins') {
        obj.from_date = (now.subtract(5, 'minute')).unix();
      } else if (this.historyFilter.dateOption === '30 mins') {
        obj.from_date = (now.subtract(30, 'minute')).unix();
      } else if (this.historyFilter.dateOption === '1 hour') {
        obj.from_date = (now.subtract(1, 'hour')).unix();
      } else if (this.historyFilter.dateOption === '24 hour') {
        obj.from_date = (now.subtract(24, 'hour')).unix();
      } else {
        if (this.historyFilter.from_date) {
          obj.from_date = (this.historyFilter.from_date.unix());
        }
        if (this.historyFilter.to_date) {
          obj.to_date = this.historyFilter.to_date.unix();
        }
      }
      obj.message_props = '';
      let type = layoutJson ? layoutJson.chartType : this.selectedChartType;
      if (type.indexOf("Pie") >= 0) {
        obj.message_props += this.xAxisProps + ','
      }
      else {
        obj.y1AxisProperty.forEach(prop => obj.message_props += prop + ',');
        if (obj.y2AxisProperty.length > 0) {
          obj.y2AxisProperty.forEach(prop => obj.message_props += prop + ',');
        }
      }
      if (obj.message_props.charAt(obj.message_props.length - 1) === ',') {
        obj.message_props = obj.message_props.substring(0, obj.message_props.length - 1);
      }
      if (layoutJson == null || this.isLayout) {
        obj['count'] = 10
        delete obj.to_date
        delete obj.from_date
      }
      console.log(this.historyFilter);
      delete obj.dateOption;
      delete obj.y1AxisProperty;
      delete obj.y2AxisProperty;
      this.apiSubscriptions.push(this.deviceService.getDeviceTelemetry(obj).subscribe(
        (response: any) => {
          this.isFilterSelected = true;
          if (response && response.data) {
            lineGoogleChartData.dataTable = [];
            this.historyData = []
            this.historyData = response.data;
            this.isHistoryAPILoading = false;
            this.historyData.reverse();

            const dataList = [];
            // if(this.selectedChartType.indexOf("Pie")>=0){
            //   dataList.push(this.historyFilter.y1AxisProperty[0]);
            // }
            // else{
            //   dataList.push('DateTime');
            // }
            dataList.push(this.xAxisProps);
            let title = '';

            this.historyFilter.y1AxisProperty.forEach((prop, index) => {
              dataList.splice(dataList.length, 0, { label: prop, type: 'number' });
              title += prop + (index !== this.historyFilter.y1AxisProperty.length - 1 ? ' & ' : '');
              lineGoogleChartData.options.series[index.toString()] = { targetAxisIndex: 0 };
            });
            lineGoogleChartData.options.vAxes = {
              0: { title }
            };
            if (this.historyFilter.y2AxisProperty) {
              title = '';
              this.historyFilter.y2AxisProperty.forEach((prop, index) => {
                dataList.splice(dataList.length, 0, { label: prop, type: 'number' });
                title += prop + (index !== this.historyFilter.y2AxisProperty.length - 1 ? ' & ' : '');
                lineGoogleChartData.options.series[(this.historyFilter.y1AxisProperty.length) + index] = { targetAxisIndex: 1 };
              });
              lineGoogleChartData.options.vAxes['1'] = { title };
            }
            lineGoogleChartData.dataTable.push(dataList);
            let tempData = {}
            let prop = this.xAxisProps
            if(type.indexOf('Pie')>=0){
              this.historyData.forEach(history => {
                if (history[prop]) {
                  if (tempData[history[prop]]) {
                    tempData[history[prop]]++
                  }
                  else {
                    tempData[history[prop]] = 1
                  }
                }
              })
            }
            this.historyData.forEach(history => {
              history.local_created_date = this.commonService.convertUTCDateToLocal(history.message_date);
              const list = [];
              if (type.indexOf("Pie") >= 0) {
                let prop = this.xAxisProps
                if (list.indexOf([history[prop], null]) <= -1) {
                  list.splice(0, 0, history[prop]);
                }
              }
              else {
                list.splice(0, 0, new Date(history.local_created_date));
                this.historyFilter.y1AxisProperty.forEach(prop => {
                  if (!isNaN(parseFloat(history[prop]))) {
                    list.splice(list.length, 0, parseFloat(history[prop]));
                  }
                  else {
                    list.splice(list.length, 0, null);
                  }
                });
                if (this.historyFilter.y2AxisProperty) {
                  this.historyFilter.y2AxisProperty.forEach(prop => {
                    if (!isNaN(parseFloat(history[prop]))) {
                      list.splice(list.length, 0, parseFloat(history[prop]));
                    }
                    else {
                      list.splice(list.length, 0, null);
                    }
                  });
                }
              }
              lineGoogleChartData.dataTable.splice(lineGoogleChartData.dataTable.length, 0, list);
            });
            if (type.indexOf("Pie") >= 0) {
              lineGoogleChartData.dataTable = []
              lineGoogleChartData.dataTable.push([this.xAxisProps, { label: "Count", type: "number" }]);
              let keys = Object.keys(tempData)
              keys.forEach((key) => {
                lineGoogleChartData.dataTable.push([key, tempData[key]])
              })
            }
            lineGoogleChartData.chartType = type
            console.log(lineGoogleChartData);
           
            resolve(lineGoogleChartData)

          }
        }, error => this.isHistoryAPILoading = false
      ));
    })
  }

  clear() {
    this.historyFilter = {};
    this.historyFilter.from_date = undefined;
    this.historyFilter.to_date = undefined;
    this.historyFilter.epoch = true;
    this.historyFilter.device_id = this.device.device_id;
    this.historyFilter.app = this.appName;
    this.selectedChartType = "Chart Type"
    this.chartTitle = ""
    this.xAxisProps = ""
    this.y1AxisProps = []
    this.y2AxisProp = []
  }

  onDateChange(event) {
    console.log(event);
    this.historyFilter.from_date = moment(event.value[0]).utc();
    this.historyFilter.to_date = moment(event.value[1]).utc();
    this.historyFilter.dateOption = undefined
  }

  setChartType(chartTypeIndex) {
    this.selectedChartType = this.chartTypeValues[chartTypeIndex]
    // if (this.selectedChartType.indexOf('Pie') >= 0) {
    //   document.getElementById("y1AxisProperty")['disabled'] = true
    //   document.getElementById("y2AxisProperty")['disabled'] = true
    //   document.getElementById("y1AxisProperty")['value'] = ""
    //   document.getElementById("y2AxisProperty")['value'] = ""
    // } else {
    //   document.getElementById("y1AxisProperty")['disabled'] = false
    //   document.getElementById("y2AxisProperty")['disabled'] = false
    // }
  }

  addChart() {
    this.plotChart(null).then((chart) => {
      console.log('add chart ', chart, this.layoutJson)
      this.layoutJson.push(chart)
    })
  }

  plotChart(layoutJson) {
    return new Promise((resolve, reject) => {
      $(".overlay").show()
      this.chartCount++
      this.showDataTable = false
      let chart = {}
      let type = layoutJson ? layoutJson.chartType : this.selectedChartType
      if(layoutJson == null){
        if (type.indexOf('Pie') <= -1) {
          if (!this.y1AxisProps || (this.y1AxisProps && this.y1AxisProps.length === 0)) {
            this.toasterService.showError('Y1 Axis Property is required', 'Load Chart');
            return;
          }
        }
        else {
          if (this.xAxisProps.length == 0) {
            this.toasterService.showError('X Axis Property is required', 'Load Chart');
            return;
          }
        }
      }
      else{
        if (layoutJson.chartType.indexOf('Pie') <= -1) {
          if (!layoutJson.y1axis || (layoutJson.y1axis && layoutJson.y1axis.length === 0)) {
            this.toasterService.showError('Y1 Axis Property is required', 'Load Chart');
            return;
          }
        }
        else {
          if (layoutJson.xAxis.length == 0) {
            this.toasterService.showError('X Axis Property is required', 'Load Chart');
            return;
          }
        }
      }
      if (type != "Map") {
        this.searchHistory(layoutJson).then((plottedChart : GoogleChartInterface) => {
          let componentRef = this.factoryResolver.resolveComponentFactory(ChartWidgetComponent).create(this.injector);
          componentRef.instance.chartData = plottedChart
          componentRef.instance.chartData.chartType = plottedChart['chartType']
          
          if (componentRef.instance.chartData.chartType == "PieChart" || componentRef.instance.chartData.chartType == "Pie Chart with table") {
            delete componentRef.instance.chartData.options.explorer
            if (componentRef.instance.chartData.chartType == "Pie Chart with table") {
              this.showDataTable = true
              componentRef.instance.chartData.chartType = "PieChart"
            }
          }
          componentRef.instance.showDataTable = layoutJson ? layoutJson.showDataTable : this.showDataTable
          componentRef.instance.widgetTitle = componentRef.instance.title = (layoutJson ? layoutJson.title : this.chartTitle).toLocaleUpperCase()
          this.appRef.attachView(componentRef.hostView);
          const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;
          var newNode = document.createElement('div');
          componentRef.instance.chartId = "chart_" + (layoutJson ? layoutJson.chartCount : this.chartCount)
          if (componentRef.instance.showDataTable) {
            componentRef.instance.chartData.options.width = 500
          }
          else {
            componentRef.instance.chartData.options.width = 1000
          }
          newNode.className = 'col-xl-10 col-lg-10 col-sm-10 col-md-10 col-xs-12';
          newNode.appendChild(domElem)
          if(this.isLayout){
            document.getElementById("layoutWidgetContainer").appendChild(newNode)
            $(".overlay").show()
          }
          else{
            document.getElementById("widgetContainer").appendChild(newNode)
            $(".overlay").hide()
          }
          chart = {
            "chartType": componentRef.instance.chartData.chartType,
            "title": componentRef.instance.widgetTitle,
            "xAxis": this.xAxisProps,
            "y1axis": this.historyFilter.y1AxisProperty,
            "y2axis": this.historyFilter.y2AxisProperty,
            "showDataTable": componentRef.instance.showDataTable,
            "chart_Id": componentRef.instance.chartId
          }
          resolve(chart)
        });
      }
      else if (type == "Map") {
        let componentRef = this.factoryResolver.resolveComponentFactory(MapWidgetComponent).create(this.injector);
        this.appRef.attachView(componentRef.hostView);

        const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
          .rootNodes[0] as HTMLElement;
        var newNode = document.createElement('div');
        componentRef.instance.chartId = "chart_" + this.chartCount
        newNode.appendChild(domElem)
        if(this.isLayout){
          document.getElementById("layoutWidgetContainer").appendChild(newNode)
          $(".overlay").show()
        }
        else{
          document.getElementById("widgetContainer").appendChild(newNode)
          $(".overlay").hide()
        }
        chart = {
          "chartType": type,
          "title": this.chartTitle,
          "chart_Id": componentRef.instance.chartId
          // "y1axis": this.historyFilter.y1AxisProperty,
          // "y2axis": this.historyFilter.y2AxisProperty,
          // "showDataTable": this.showDataTable
        }
        resolve(chart)
      }
      else {
        let componentRef = this.factoryResolver.resolveComponentFactory(ChartWidgetComponent).create(this.injector);
        this.appRef.attachView(componentRef.hostView);
        // this.lineGoogleChartData.dataTable =new google.visualization.DataTable();
        // this.lineGoogleChartData.dataTable.addColumn('string', 'Team');
        // this.lineGoogleChartData.dataTable.addColumn('date', 'Season Start Date');
        // this.lineGoogleChartData.dataTable.addColumn('date', 'Season End Date');

        this.lineGoogleChartData.dataTable.push(
          ['Adams1', new Date("2020-09-22T11:07:39.412Z"), new Date("2020-09-22T11:07:44.406Z")]
        )
        this.lineGoogleChartData.dataTable.push(['Adams1', new Date("2020-09-22T11:07:44.406Z"), new Date("2020-09-22T11:07:59.406Z")])
        // this.lineGoogleChartData.dataTable.push(['Adams2', new Date("2020-09-21 9:30:00"),new Date("2020-09-21 9:35:00")])
        componentRef.instance.chartData = this.lineGoogleChartData
        componentRef.instance.chartData.options.width = 1000
        componentRef.instance.chartData.options.timeline = {
          groupByRowLabel: true
        }
        componentRef.instance.chartData.chartType = type
        componentRef.instance.widgetTitle = componentRef.instance.title = (this.chartTitle).toLocaleUpperCase()
        const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
          .rootNodes[0] as HTMLElement;
        var newNode = document.createElement('div');
        componentRef.instance.chartId = "chart_" + (layoutJson ? layoutJson.chartCount : this.chartCount)
        newNode.className = 'col-xl-10 col-lg-10 col-sm-10 col-md-10 col-xs-12';
        newNode.appendChild(domElem)
        if(this.isLayout){
          document.getElementById("layoutWidgetContainer").appendChild(newNode)
          $(".overlay").show()
        }
        else{
          document.getElementById("widgetContainer").appendChild(newNode)
          $(".overlay").hide()
        }
        chart = {
          "chartType":type,
          "title": this.chartTitle,
          "chart_Id": componentRef.instance.chartId,
          "xAxis": this.xAxisProps,
          // "y1axis": this.historyFilter.y1AxisProperty,
          // "y2axis": this.historyFilter.y2AxisProperty,
          // "showDataTable": this.showDataTable
        }
        resolve(chart)
      }

    })
  }


  renderLayout() {
    let children = $("#widgetContainer").children()
    for (let i = 0; i < children.length; i++) {
      $(children[i]).remove()
    }
    let layoutChildren = $("#layoutWidgetContainer").children()
    for (let i = 0; i < layoutChildren.length; i++) {
      $(layoutChildren[i]).remove()
    }
    var componentRef;
    if (this.layoutJson) {
      this.layoutJson.map((currentChart, i) => {
        this.renderCount++;
        currentChart['chartCount'] = this.renderCount
        this.plotChart(currentChart).then((chart)=>{
          currentChart['chart_Id'] = chart['chart_Id']
        })
      })
    }
    else {
      this.toasterService.showError('Layout not defined', 'Layout')
    }
  }

  saveLayout() {
    for (let i = 0; i < this.layoutJson.length; i++) {
      if (document.getElementById(this.layoutJson[i].chart_Id) == null) {
        console.log('DOM not found',this.layoutJson[i])
        this.layoutJson.splice(i, 1)
      }
    }
    let body = {
      app: this.appName,
      hierarchy_level: this.selectedHierarchy,
      layout: this.layoutJson
    }
    if (this.storedLayout['id']) {
      body['id'] = this.storedLayout['id']
      this.apiSubscriptions.push(this.deviceService.editLayout(body).subscribe(
        (response: any) => {
          // console.log('update response ', response)
          this.closeSaveLayoutModal()
          this.toasterService.showSuccess(response.message, 'Save Layout')
        },
        (err) => {
          this.toasterService.showError(err.message, 'Save Layout')
        }
      ))
    }
    else {
      this.apiSubscriptions.push(this.deviceService.createLayout(body).subscribe(
        (response: any) => {
          // console.log('create response ', response)
          this.closeSaveLayoutModal()
          this.toasterService.showSuccess(response.message, 'Save Layout')
        },
        (err) => {
          this.toasterService.showError(err.message, 'Save Layout')
        }
      ))
    }
  }

  getLayout() {
    let params = {
      app: this.appName
    }
    this.apiSubscriptions.push(this.deviceService.getLayout(params).subscribe(
      async (response: any) => {
        if (response.data.length > 0) {
          this.layoutJson = response.data[0].layout;
          this.storedLayout = response.data[0]
        }
      }
    ))
  }

  openSaveLayoutModal() {
    $('#saveLayoutModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  closeSaveLayoutModal() {
    $('#saveLayoutModal').modal('hide');
  }
}
