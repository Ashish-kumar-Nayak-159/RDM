import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-asset-alert-conditions',
  templateUrl: './asset-alert-conditions.component.html',
  styleUrls: ['./asset-alert-conditions.component.css']
})
export class AssetAlertConditionsComponent implements OnInit {

  @Input() asset: any;
  constructor() { }

  ngOnInit(): void {
  }

}
