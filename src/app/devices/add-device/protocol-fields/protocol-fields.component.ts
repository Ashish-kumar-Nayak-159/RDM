import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-protocol-fields',
  templateUrl: './protocol-fields.component.html',
  styleUrls: ['./protocol-fields.component.css']
})
export class ProtocolFieldsComponent implements OnInit {

  @Input() device: any;
  constructor() { }

  ngOnInit(): void {
  }

}
