import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-gateway',
  templateUrl: './gateway.component.html',
  styleUrls: ['./gateway.component.css']
})
export class GatewayComponent implements OnInit {
  @Input() gateways: any;

  constructor() { }

  ngOnInit(): void {
  }

}
