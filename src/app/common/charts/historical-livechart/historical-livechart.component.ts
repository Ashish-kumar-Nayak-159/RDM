import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';

@Component({
  selector: 'app-historical-livechart',
  templateUrl: './historical-livechart.component.html',
  styleUrls: ['./historical-livechart.component.css']
})
export class HistoricalLivechartComponent implements OnInit {

  @Input() chartConfig: any;
  @Input() anchorAdditionalClass: string;
  @Input() hideCancelButtonAddOnClass: any;
  @Input() chartHeight: any;
  @Input() chartWidth: any;
  @Output() modalOpenEvents: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  // @ViewChild('temp', { static: false }) chartElement: ElementRef;
  chartTitle: any;
  isAccordionOpen: boolean;
  hideCancelButton = false;
  decodedToken: any;
  widgetStringFromMenu: any;
  chart_Id: any;
  userData: any;
  contextApp: any = {};
  telemetryData: any[] = [];


  constructor(private assetService: AssetService, private commonService: CommonService, private assetModelService: AssetModelService) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.chartHeight = '23rem';
    this.chartWidth = '100%';
    const filterObj = {
      epoch: true,
      app: this.contextApp.app,
      asset_id: 'PrefecturalSkatingRinkCT_CellA',
      from_date: 1667196197,
      to_date: 1667282597

    }
    this.assetService.getAssetSamplingTelemetry(filterObj, this.contextApp.app).subscribe((response)=>{
      if(response && response?.data){
        this.telemetryData = response?.data;
        console.log('telemetryData', this.telemetryData);
      }
    });
    const params = {
      app: this.contextApp.app,
      name: 'Cooling Tower Model V1'
    };

    this.assetModelService.getAssetsModelLayout(params).subscribe((response)=>{
      console.log('historical_widget',response)
    })
    this.lineChart();
  }

 lineChart(){
  var chart = am4core.create("temp", am4charts.XYChart);

  chart.data = [{
    "date": new Date(2018, 0, 1),
    "value": 450,
    "value2": 362,
    "value3": 699
  }, {
    "date": new Date(2018, 0, 2),
    "value": 269,
    "value2": 450,
    "value3": 841
  }, {
    "date": new Date(2018, 0, 3),
    "value": 700,
    "value2": 358,
    "value3": 699
  }, {
    "date": new Date(2018, 0, 4),
    "value": 490,
    "value2": 367,
    "value3": 500
  }, {
    "date": new Date(2018, 0, 5),
    "value": 500,
    "value2": 485,
    "value3": 369
  }, {
    "date": new Date(2018, 0, 6),
    "value": 550,
    "value2": 354,
    "value3": 250
  }, {
    "date": new Date(2018, 0, 7),
    "value": 420,
    "value2": 350,
    "value3": 600
  }];

  var categoryAxis = chart.xAxes.push(new am4charts.DateAxis());
  categoryAxis.renderer.grid.template.location = 0;

  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

  var series = chart.series.push(new am4charts.LineSeries());
  series.dataFields.valueY = "value2";
  series.dataFields.dateX = "date";
  series.name = "test";
  series.tooltipText = "{dateX}: [b]{valueY}[/]";
  series.strokeWidth = 2;

  var bullet = series.bullets.push(new am4charts.CircleBullet());
  bullet.events.on("hit", function (ev) {
    alert("Clicked on ");
  });

  chart.legend = new am4charts.Legend();
  chart.cursor = new am4charts.XYCursor();
 }

}









