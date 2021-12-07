import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-application-database-configuration',
  templateUrl: './application-database-configuration.component.html',
  styleUrls: ['./application-database-configuration.component.css']
})
export class ApplicationDatabaseConfigurationComponent implements OnInit {
  @Input() applicationData: any;
  ngOnInit(): void { }
}
