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
    this.applicationData.roles.forEach(element => {
      element.isEditable = false;
    });
  }

  onAddNewRoleObj() {
    this.applicationData.roles.splice(this.applicationData.roles.length, 0, {
      name: null,
      level: 0,
      isEditable: true
    });
  }

  onSaveRoles() {

    this.applicationData.id = this.applicationData.app;
    let flag = '';
    this.applicationData.roles.forEach(element => {
      if (!element.name || (element.name.trim()).length === 0) {
        flag = 'Blank Name is not allowed.';
      }
      delete element.isEditable;
    });
    if (flag) {
      this.toasterService.showError(flag, 'Save Device Hierarchy');
      return;
    }
    this.saveRoleAPILoading = true;
    this.applicationData.roles.forEach(item => {
      delete item.isEditable;
    });
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
