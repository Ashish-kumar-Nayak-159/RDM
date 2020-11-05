import { CONSTANTS } from 'src/app/app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';

declare var $: any;
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
  selectedHierarchy: any;
  forceUpdate = false;
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
    const i = this.applicationData.hierarchy.findIndex(item => item.name === this.selectedHierarchyItem.name);
    this.applicationData.hierarchy.splice(i, 1);
    this.applicationData.hierarchy.splice(i, 0, this.selectedHierarchyItem);
    this.forceUpdate = true;
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
    const obj = {
      app: this.applicationData.app,
      hierarchy: this.applicationData.hierarchy,
      force_update: this.forceUpdate ? this.forceUpdate : undefined
    };
    if (this.forceUpdate && this.selectedHierarchy) {
      const hierarchy = [];
      this.applicationData.hierarchy.forEach(item => {
        if (item.name !== this.selectedHierarchy.name) {
          hierarchy.push(item);
        }
      });
      obj.hierarchy = hierarchy;
    }
    this.saveHierarchyAPILoading = true;
    this.applicationService.updateAppHierarchy(obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Device Hierarchy');
        this.selectedHierarchyItem = undefined;
        this.addedTagItem = undefined;
        if (this.forceUpdate) {
          this.onCloseModal();
        }
        this.saveHierarchyAPILoading = false;
        this.applicationService.refreshAppData.emit();
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Device Hierarchy');
        this.saveHierarchyAPILoading = false;
      }
    );
  }

  openConfirmHierarchyDeleteModal(hierarchy) {
    this.selectedHierarchy = hierarchy;
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  deleteRole() {
    // this.onSaveRoles(true);
    this.forceUpdate = true;
    this.onSaveHierarchyTags();
  }

  onCloseModal() {
    this.selectedHierarchy = undefined;
    $('#confirmMessageModal').modal('hide');
  }


  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
  }

}
