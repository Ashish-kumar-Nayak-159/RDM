import { element } from 'protractor';
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
  editableHierarchy = {};
  hierarchyArr = {};
  configureHierarchy = {};
  constructor(
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));

    this.applicationData.hierarchy.levels.forEach((element, index) => {
      this.hierarchyArr[index] = [];
    });
  }

  onAddNewHierarchyObj() {
    // this.applicationData.hierarchy.splice(this.applicationData.hierarchy.length, 0, {
    //   name: null,
    //   level: this.applicationData.hierarchy.length,
    //   tags: [],
    //   isEditable: true
    // });
    if (this.applicationData.hierarchy.levels[this.applicationData.hierarchy.levels.length - 1]) {
      this.applicationData.hierarchy.levels.splice(this.applicationData.hierarchy.levels.length, 0, undefined);
    }
    this.editableHierarchy[this.applicationData.hierarchy.levels.length] = true;
    console.log(this.editableHierarchy);
    this.selectedHierarchyItem = undefined;
    this.addedTagItem = undefined;
  }

  onArrowClick(item) {
    this.selectedHierarchyItem = item;
    this.addedTagItem = undefined;
    this.configureHierarchy = {};
    this.applicationData.hierarchy.levels.forEach((element, index) => {
      this.hierarchyArr[index] = [];
    });
    if (this.applicationData?.hierarchy?.levels.length > 1) {
      this.hierarchyArr['1'] = Object.keys(this.applicationData.hierarchy.tags);
    }
  }



  onHierarchyConfigurationChange(i) {
    Object.keys(this.configureHierarchy).forEach(key => {
      console.log(key, i);
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach(key => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.applicationData.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((_, index) => {
      console.log(this.configureHierarchy[index + 1]);
      nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      console.log(nextHierarchy);
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
  }

  onAddNewTag() {
    if (this.hierarchyArr[this.selectedHierarchyItem].indexOf(this.addedTagItem) !== -1) {
      this.toasterService.showError('Tag already exists', 'Add Tag');
      return;
    }

    if (Object.keys(this.configureHierarchy).length !== this.selectedHierarchyItem - 1) {
      this.toasterService.showError('Please select dropdown data first', 'Add Tag');
      return;
    }
    this.hierarchyArr[this.selectedHierarchyItem].splice(
      this.hierarchyArr[this.selectedHierarchyItem].length, 0, this.addedTagItem);
    let obj = this.applicationData.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((_, index) => {
      console.log(this.configureHierarchy[index + 1]);
      obj = obj[this.configureHierarchy[index + 1]];
      console.log(obj);
    });
    obj[this.addedTagItem] = {};
    console.log(JSON.stringify(this.applicationData.hierarchy.tags));
    this.addedTagItem = undefined;
  }

  onRemoveTag(index) {
    this.hierarchyArr[this.selectedHierarchyItem].splice(index, 1);
    let obj = this.applicationData.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((_, i) => {
      console.log(this.configureHierarchy[i + 1]);
      obj = obj[this.configureHierarchy[i + 1]];
      console.log(obj);
    });
    const keys = Object.keys(obj);
    delete obj[keys[index]];
    console.log(JSON.stringify(this.applicationData.hierarchy.tags));
    // const i = this.applicationData.hierarchy.findIndex(item => item.name === this.selectedHierarchyItem.name);
    // this.applicationData.hierarchy.splice(i, 1);
    // this.applicationData.hierarchy.splice(i, 0, this.selectedHierarchyItem);
    // this.forceUpdate = true;
  }

  trackByFn(index: any, item: any) {
    return index;
 }

  onSaveHierarchyTags() {
    let flag;
    this.applicationData.hierarchy.levels.forEach(item => {
      CONSTANTS.NOT_ALLOWED_SPECIAL_CHARS_NAME.forEach(char => {
        if (item.includes(char)) {
          flag = `Hierarchy name will not allow ' ', '.', '#' and '$'`;
        }
      });
      if (!item || (item.trim()).length === 0) {
        flag = 'Blank Name is not allowed.';
      }
    });
    if (flag) {
      this.toasterService.showError(flag, 'Save Device Hierarchy');
      return;
    }

    const obj = {
      app: this.applicationData.app,
      hierarchy: this.applicationData.hierarchy,
      force_update: this.forceUpdate ? this.forceUpdate : undefined
    };
    // if (this.forceUpdate && this.selectedHierarchy) {
    //   const hierarchy = [];
    //   this.applicationData.hierarchy.forEach(item => {
    //     if (item.name !== this.selectedHierarchy.name) {
    //       hierarchy.push(item);
    //     }
    //   });
    //   obj.hierarchy = hierarchy;
    // }
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
