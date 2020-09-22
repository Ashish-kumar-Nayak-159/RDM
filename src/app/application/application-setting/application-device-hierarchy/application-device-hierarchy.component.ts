import { CONSTANTS } from 'src/app/app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';

@Component({
  selector: 'app-application-device-hierarchy',
  templateUrl: './application-device-hierarchy.component.html',
  styleUrls: ['./application-device-hierarchy.component.css']
})
export class ApplicationDeviceHierarchyComponent implements OnInit {

  @Input() applicationData: any;
  selectedHierarchyItem: any;
  addedTagItem: string;
  saveHierarchyAPILoading = false;
  originalApplicationData: any;
  constructor(
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.applicationData.hierarchy.forEach(element => {
      element.isEditable = false;
    });
  }

  onAddNewHierarchyObj() {
    this.applicationData.hierarchy.splice(this.applicationData.hierarchy.length, 0, {
      name: null,
      level: this.applicationData.hierarchy.length,
      tags: [],
      isEditable: true
    });
    this.selectedHierarchyItem = undefined;
    this.addedTagItem = undefined;
  }

  onArrowClick(item) {
    this.selectedHierarchyItem = item;
    this.addedTagItem = undefined;
  }

  onAddNewTag() {
    if (this.selectedHierarchyItem.tags.indexOf(this.addedTagItem) !== -1) {
      this.toasterService.showError('Tag already exists', 'Add Tag');
      return;
    }
    this.selectedHierarchyItem.tags.splice(this.selectedHierarchyItem.tags.length, 0, this.addedTagItem);
    this.addedTagItem = undefined;
  }

  onRemoveTag(index) {
    this.selectedHierarchyItem.tags.splice(index, 1);
  }

  onSaveHierarchyTags() {
    let flag;
    this.applicationData.hierarchy.forEach(item => {
      CONSTANTS.NOT_ALLOWED_SPECIAL_CHARS_NAME.forEach(char => {
        if (item.name.includes(char)) {
          flag = `Hierarchy name will not allow ' ', '.', '#' and '$'`;
        }
      });
      if (!item.name || (item.name.trim()).length === 0) {
        flag = 'Blank Name is not allowed.';
      }
    });
    if (flag) {
      this.toasterService.showError(flag, 'Save Device Hierarchy');
      return;
    }
    this.applicationData.hierarchy.forEach(item => {
      delete item.isEditable;
    });
    this.saveHierarchyAPILoading = true;
    this.applicationData.id = this.applicationData.app;
    this.applicationService.updateApp(this.applicationData).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Device Hierarchy');
        this.selectedHierarchyItem = undefined;
        this.addedTagItem = undefined;
        this.saveHierarchyAPILoading = false;
        this.applicationService.refreshAppData.emit();
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Device Hierarchy');
        this.saveHierarchyAPILoading = false;
      }
    );
  }


  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
  }

}
