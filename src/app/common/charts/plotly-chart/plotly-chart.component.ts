import { Component, OnInit, Input } from '@angular/core';
import { PlotlyService } from 'src/app/services/plotly/plotly.service';

@Component({
  selector: 'app-plotly-chart',
  templateUrl: './plotly-chart.component.html',
  styleUrls: ['./plotly-chart.component.css']
})
export class PlotlyChartComponent implements OnInit {
  @Input() bodyMessage: any;
  @Input() messageType: any;
  constructor(private plotlyService: PlotlyService) { }
  ngOnInit(): void {
    if(this.bodyMessage)
    this.filterData(0,6000,'ISO 0Hz-6kHz');
  }
  filterData(start: any, end: any,waveTitle:string){
    let data = JSON.parse(JSON.stringify( this.messageType === 'asset' ? this.bodyMessage['m'] : this.bodyMessage['data'][0]['m']));
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
    return axis.map((fill: any, index: number) =>(index >= freqIndex ? fill : null)).filter(Boolean);
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
    this.plotlyService.plotlyChart(waveTitle, 'Frequency', fftAxis, fftLineLegend, data['181_fftFreq']);
    this.plotlyService.plotlyChart('', 'Time', axis, axisLineLegend, sr1);
  }
}
