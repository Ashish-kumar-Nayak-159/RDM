import { Component, Input, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts';

@Component({
  selector: 'app-predictive-maintenance',
  templateUrl: './predictive-maintenance.component.html',
  styleUrls: ['./predictive-maintenance.component.css']
})
export class PredictiveMaintenanceComponent implements OnInit {

  @Input() device: any;
  displayMode: string;
  chartData: GoogleChartInterface = {
    // use :any or :GoogleChartInterface
    chartType: 'PieChart',
    dataTable: [['Effort', 'Amount given'],
    ['My all',     70],
    ['',     30]],
    options: {
      title: '120 Hours',
      pieHole: 0.8,
      legend: 'none',
      tooltip: { trigger: 'none' },
      slices: {
        0: { color: 'green' },
        1: { color: '#F8F9FC' }
      }
    }
  };
  constructor() { }

  ngOnInit(): void {
  }

}
