import { Component, OnInit, Input } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {

  @Input() asset = new Asset();
  constructor() { }

  ngOnInit(): void {
  }

}
