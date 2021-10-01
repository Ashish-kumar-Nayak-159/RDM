import { Component, Input, OnInit } from '@angular/core';
import { Asset } from './../../../models/asset.model';

@Component({
  selector: 'app-work-progress',
  templateUrl: './work-progress.component.html',
  styleUrls: ['./work-progress.component.css']
})
export class WorkProgressComponent implements OnInit {
  @Input() asset = new Asset();
  @Input() messageText = 'Work in Progress';
  constructor() { }

  ngOnInit(): void {
  }

}
