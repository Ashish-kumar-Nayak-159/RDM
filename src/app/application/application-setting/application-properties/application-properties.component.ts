import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';

@Component({
  selector: 'app-application-properties',
  templateUrl: './application-properties.component.html',
  styleUrls: ['./application-properties.component.css']
})
export class ApplicationPropertiesComponent implements OnInit {

  @Input() applicationData: any;
  originalApplicationData: any;
  savePropertiesAPILoading = false;
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    if (!this.applicationData.metadata.properties) {
      this.applicationData.metadata.properties = [];
      this.onAddNewPropertyObj();
    } else {
      const arr = [];
      this.applicationData.metadata.properties.forEach(element => {
        arr.push({name: element});
      });
      this.applicationData.metadata.properties = arr;
    }
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
  }


  onAddNewPropertyObj() {
    this.applicationData.metadata.properties.splice(this.applicationData.roles.length, 0, {
      name: null
    });
  }

  onSaveProperties() {
    this.savePropertiesAPILoading = true;
    this.applicationData.id = this.applicationData.app;
    const props = [];
    this.applicationData.metadata.properties.forEach(element => {
      props.push(element.name);
    });
    const obj = JSON.parse(JSON.stringify(this.applicationData));
    obj.metadata.properties = props;
    this.applicationService.updateApp(obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Properties');
        this.savePropertiesAPILoading = false;
        this.applicationService.refreshAppData.emit();
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Properties');
        this.savePropertiesAPILoading = false;
      }
    );
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
  }

}
