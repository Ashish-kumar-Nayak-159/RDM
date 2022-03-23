import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-application-database-configuration',
  templateUrl: './application-database-configuration.component.html',
  styleUrls: ['./application-database-configuration.component.css']
})
export class ApplicationDatabaseConfigurationComponent implements OnInit {
  
  @Input() applicationData: any;
  partitionArray = [];
  ngOnInit(): void {    
    if (this.applicationData && this.applicationData?.metadata?.partition) {
      let partitionObj = this.applicationData?.metadata?.partition;
      let arr = [];     
      Object.keys(partitionObj).map(function (key) {   
        if (key != 'telemetry') {
          arr.push({ [key]: partitionObj[key] })
          return arr;
        }
      });
      this.partitionArray = arr;
    }
  }
}
