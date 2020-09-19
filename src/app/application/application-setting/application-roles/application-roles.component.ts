import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';

@Component({
  selector: 'app-application-roles',
  templateUrl: './application-roles.component.html',
  styleUrls: ['./application-roles.component.css']
})
export class ApplicationRolesComponent implements OnInit {

  @Input() applicationData: any;
  addedLevelItem: string;
  saveRoleAPILoading = false;
  originalApplicationData: any;
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
  }

  onAddNewRoleObj() {
    this.applicationData.roles.splice(this.applicationData.roles.length, 0, {
      name: null,
      level: 0
    });
  }

  onSaveRoles() {
    this.saveRoleAPILoading = true;
    this.applicationData.id = this.applicationData.app;
    this.applicationService.updateApp(this.applicationData).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Device Hierarchy');
        this.saveRoleAPILoading = false;
        this.applicationService.refreshAppData.emit();
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Device Hierarchy');
        this.saveRoleAPILoading = false;
      }
    );
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
  }

}
