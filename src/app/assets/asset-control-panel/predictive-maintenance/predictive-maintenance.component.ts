import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-predictive-maintenance',
  templateUrl: './predictive-maintenance.component.html',
  styleUrls: ['./predictive-maintenance.component.css']
})
export class PredictiveMaintenanceComponent implements OnInit {

  @Input() asset: any;
  displayMode: string;

  constructor() { }

  ngOnInit(): void {
  }

}
