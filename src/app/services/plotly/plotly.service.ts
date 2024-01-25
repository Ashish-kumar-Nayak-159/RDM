import { Injectable } from '@angular/core';
declare let Plotly: any;
@Injectable({
  providedIn: 'root'
})
export class PlotlyService {

  constructor() { }

  plotlyChart(title: string, plotDiv: any, level: any, fftAxis: any,legendTitle: any,fftFreq: any = undefined){
    const graphTitle= level;
    const trace = fftAxis.map((axis: any, i: number) => ({
      mode: 'lines',
      type: 'scatter',
      name: legendTitle[i],
      line: { color: ['blue', 'orange', 'green'][i] },
      x: fftFreq,
      y: axis,
    }));
    const layout = {
      title: title.includes('ISO ') ? 'FFT with ' + title + ' Filter '  : title ,
      uirevision: true,
      xaxis: {title: graphTitle == 'Frequency' ? graphTitle+" (Hz) " : graphTitle , autorange: true },
      yaxis: {title:'Amplitude', autorange: true },
      showlegend: true,
      responsive: true
    };

    const config = {
      modeBarButtonsToRemove: ['toImage','hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.newPlot(plotDiv, trace, layout, config);
}
}
