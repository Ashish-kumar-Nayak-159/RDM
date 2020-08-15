import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/app/models/device.model';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {

  @Input() device = new Device();
  constructor() { }

  ngOnInit(): void {
  }

}
