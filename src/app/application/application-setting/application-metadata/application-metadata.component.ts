import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-application-metadata',
  templateUrl: './application-metadata.component.html',
  styleUrls: ['./application-metadata.component.css']
})
export class ApplicationMetadataComponent implements OnInit {

  @Input() applicationData: any;
  constructor() { }

  ngOnInit(): void {
  }

}
