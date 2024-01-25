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
  extractProperKey(data, key){
    return  Object.keys(data).filter((data: any) => {return data?.includes(key) })
  }

  filterData(start: any, end: any,waveTitle:string){
    let data = JSON.parse(JSON.stringify( this.messageType === 'asset' ? this.bodyMessage['m'] : this.bodyMessage['data'][0]['m']));
    this.currentData = data;
    let filteredArray: any= [];
    let filterIndex=0;

    if(data[this.extractProperKey(data, '_fftFreq')?.[0]]?.length){
      data[this.extractProperKey(data, '_fftFreq')?.[0]].forEach((dataRange:number, index:number) =>{
        if(dataRange >= start && dataRange <= end ){
          filteredArray.push(dataRange);
          if(filterIndex == 0)
          filterIndex =index;
        }
      })
      data[this.extractProperKey(data, '_fftFreq')?.[0]] =filteredArray;
    }
    data[this.extractProperKey(data, '_fftxAxis')?.[0]]= this.mapAxisData(data[this.extractProperKey(data, '_fftxAxis')?.[0]],filterIndex);
    data[this.extractProperKey(data, '_fftyAxis')?.[0]]= this.mapAxisData(data[this.extractProperKey(data, '_fftyAxis')?.[0]],filterIndex);
    data[this.extractProperKey(data, '_fftzAxis')?.[0]]= this.mapAxisData(data[this.extractProperKey(data, '_fftzAxis')?.[0]],filterIndex);
    this.chartPrepare(data,waveTitle);
  }
  mapAxisData(axis: any,freqIndex: any){
    return axis ? axis.map((fill: any, index: number) =>(index >= freqIndex ? fill : null)).filter(Boolean) : null;
  }

  chartPrepare(data:any,waveTitle: string){
    const fftAxis = [
      data[this.extractProperKey(data, '_fftxAxis')?.[0]],
      data[this.extractProperKey(data, '_fftyAxis')?.[0]],
      data[this.extractProperKey(data, '_fftzAxis')?.[0]]
    ];
    const axis = [
      data[this.extractProperKey(data, '_xAxis')?.[0]],
      data[this.extractProperKey(data, '_yAxis')?.[0]],
      data[this.extractProperKey(data, '_zAxis')?.[0]]
    ];
    let i=0;
    let sr1 = [];
      while (i <= data[`${this.filterProperty?.sId + '_FftCount'}`]){
        const temp = i/ (data[this.extractProperKey(data, '_sr')?.[0]]);
        sr1.push(temp);
        i++;
      }
    const fftLineLegend = ['fftxAxis', 'fftyAxis', 'fftzAxis'];
    const axisLineLegend = ['xAxis', 'yAxis', 'zAxis'];
    if(this.filterProperty){
      if(this.filterProperty?.chart_Type?.includes('Frequency')){
        this.plotlyService.plotlyChart(waveTitle, this.Frequency.nativeElement, 'Frequency', fftAxis, fftLineLegend, data[`${this.filterProperty?.sId + '_fftFreq'}`]);
      }
      if(this.filterProperty?.chart_Type?.includes('Time')){
        this.plotlyService.plotlyChart(waveTitle, this.Time.nativeElement, 'Time', axis, axisLineLegend, sr1);
      }
    }else{
      this.plotlyService.plotlyChart(waveTitle, this.Frequency.nativeElement, 'Frequency', fftAxis, fftLineLegend, data[`${this.filterProperty?.sId + '_fftFreq'}`]);
      this.plotlyService.plotlyChart(waveTitle, this.Time.nativeElement, 'Time', axis, axisLineLegend, sr1);
    }
  }
}
