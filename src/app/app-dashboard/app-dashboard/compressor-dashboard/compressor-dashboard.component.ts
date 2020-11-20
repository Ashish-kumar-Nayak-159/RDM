import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-compressor-dashboard',
  templateUrl: './compressor-dashboard.component.html',
  styleUrls: ['./compressor-dashboard.component.css']
})
export class CompressorDashboardComponent implements OnInit {

  @Input() contextApp: any;
  constructor() { }

  ngOnInit(): void {
  }

}
