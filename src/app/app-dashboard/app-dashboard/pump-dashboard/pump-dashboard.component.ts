import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pump-dashboard',
  templateUrl: './pump-dashboard.component.html',
  styleUrls: ['./pump-dashboard.component.css']
})
export class PumpDashboardComponent implements OnInit {

  @Input() contextApp: any;
  constructor() { }

  ngOnInit(): void {
  }

}
