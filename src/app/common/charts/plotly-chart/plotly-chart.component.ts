import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { ChartService } from 'src/app/services/chart/chart.service';
import { PlotlyService } from 'src/app/services/plotly/plotly.service';

@Component({
  selector: 'app-plotly-chart',
  templateUrl: './plotly-chart.component.html',
  styleUrls: ['./plotly-chart.component.css']
})
export class PlotlyChartComponent implements OnInit {
  @ViewChild('Frequency', { static: true }) Frequency: ElementRef;
  @ViewChild('Time', { static: true }) Time: ElementRef;
  @Input() filterProperty: any= undefined;
  @Input() bodyMessage: any;
  @Input() messageType: any;
  currentData: any;
  constructor(private plotlyService: PlotlyService) { }
  ngOnInit(): void {
    if(this.bodyMessage){
      if(this.filterProperty && this.filterProperty?.frequency && this.filterProperty?.frequency?.message){
        this.filterData(this.filterProperty?.frequency?.min,this.filterProperty?.frequency?.max,this.filterProperty?.frequency?.message);
      }else
      this.filterData(0,6000,'ISO 0Hz-6kHz');
    }
  }
  ngOnChanges(changes: SimpleChanges): void{
    if (changes.bodyMessage || changes.messageType || changes.filterProperty){
      if(this.bodyMessage){
        if(this.filterProperty && this.filterProperty?.frequency && this.filterProperty?.frequency?.message){
          this.filterData(this.filterProperty?.frequency?.min,this.filterProperty?.frequency?.max,this.filterProperty?.frequency?.message);
        }
      }
    }
  }
  filterData(start: any, end: any,waveTitle:string){
    let data = JSON.parse(JSON.stringify( this.messageType === 'asset' ? this.bodyMessage['m'] : this.bodyMessage['data'][0]['m']));
    this.currentData = data;
    let filteredArray: any= [];
    let filterIndex=0;
    if(data['181_fftFreq']?.length){
      data['181_fftFreq'].forEach((dataRange:number, index:number) =>{
        if(dataRange >= start && dataRange <= end ){
          filteredArray.push(dataRange);
          if(filterIndex == 0)
          filterIndex =index;
        }
      })
      data['181_fftFreq'] =filteredArray;
    }
    data['181_fftxAxis']= this.mapAxisData(data['181_fftxAxis'],filterIndex);
    data['181_fftyAxis']= this.mapAxisData(data['181_fftyAxis'],filterIndex);
    data['181_fftzAxis']= this.mapAxisData(data['181_fftzAxis'],filterIndex);
    this.chartPrepare(data,waveTitle);
  }
  mapAxisData(axis: any,freqIndex: any){
    return axis ? axis.map((fill: any, index: number) =>(index >= freqIndex ? fill : null)).filter(Boolean) : null;
  }

  chartPrepare(data:any,waveTitle: string){
    const fftAxis = [data['181_fftxAxis'],data['181_fftyAxis'],data['181_fftzAxis']];
    const axis = [data['181_xAxis'],data['181_yAxis'],data['181_zAxis']];
    let i=0;
    let sr1 = [];
      while (i <= data['181_FftCount']){
        const temp = i/ data['181_sr'];
        sr1.push(temp);
        i++;
      }
    const fftLineLegend = ['fftxAxis', 'fftyAxis', 'fftzAxis'];
    const axisLineLegend = ['xAxis', 'yAxis', 'zAxis'];
    if(this.filterProperty){
      if(this.filterProperty?.chart_Type.includes('Frequency')){
        this.plotlyService.plotlyChart(waveTitle, this.Frequency.nativeElement, 'Frequency', fftAxis, fftLineLegend, data['181_fftFreq']);
      }
      if(this.filterProperty?.chart_Type.includes('Time')){
        this.plotlyService.plotlyChart('', this.Time.nativeElement, 'Time', axis, axisLineLegend, sr1);
      }
    }else{
      this.plotlyService.plotlyChart(waveTitle, this.Frequency.nativeElement, 'Frequency', fftAxis, fftLineLegend, data['181_fftFreq']);
      this.plotlyService.plotlyChart('', this.Time.nativeElement, 'Time', axis, axisLineLegend, sr1);
    }
  }
}
