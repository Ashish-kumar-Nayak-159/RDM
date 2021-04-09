import { Subscription } from 'rxjs';
import { element } from 'protractor';
import { CONSTANTS } from 'src/app/app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';

declare var $: any;
@Component({
  selector: 'app-application-device-hierarchy',
  templateUrl: './application-device-hierarchy.component.html',
  styleUrls: ['./application-device-hierarchy.component.css']
})
export class ApplicationDeviceHierarchyComponent implements OnInit, OnDestroy {

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
  apiSubscriptions: Subscription[] = [];
  isAppSetingsEditable = false;
  constructor(
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));

    this.applicationData.hierarchy.levels.forEach((_, index) => {
      this.hierarchyArr[index] = [];
    });
  }

  onAddNewHierarchyObj() {
    if (this.applicationData.hierarchy.levels[this.applicationData.hierarchy.levels.length - 1]) {
      this.applicationData.hierarchy.levels.splice(this.applicationData.hierarchy.levels.length, 0, undefined);
    }
    this.editableHierarchy[this.applicationData.hierarchy.levels.length] = true;
    this.selectedHierarchyItem = undefined;
    this.addedTagItem = undefined;
  }

  onArrowClick(item) {
    this.selectedHierarchyItem = item;
    this.addedTagItem = undefined;
    this.configureHierarchy = {};
    this.applicationData.hierarchy.levels.forEach((_, index) => {
      this.hierarchyArr[index] = [];
    });
    if (this.applicationData?.hierarchy?.levels.length > 1) {
      this.hierarchyArr['1'] = Object.keys(this.applicationData.hierarchy.tags);
    }
  }

  onHierarchyConfigurationChange(i) {
    Object.keys(this.configureHierarchy).forEach(key => {
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
      nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
  }

  onAddNewTag() {
    if (!this.addedTagItem || (this.addedTagItem.trim()).length === 0) {
      this.toasterService.showError('Blank values are not allowed', 'Add Tag');
      return;
    }
    let flag;
    CONSTANTS.NOT_ALLOWED_SPECIAL_CHARS_NAME.forEach(char => {
      if (this.addedTagItem.includes(char)) {
        flag = `Hierarchy name should not contain space, dot, '#' and '$'`;
        return;
      }
    });
    if (flag) {
      this.toasterService.showError(flag, 'Add Tag');
      return;
    }
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
      obj = obj[this.configureHierarchy[index + 1]];
    });
    obj[this.addedTagItem] = {};
    this.addedTagItem = undefined;
  }

  onRemoveTag(index) {
    this.hierarchyArr[this.selectedHierarchyItem].splice(index, 1);
    let obj = this.applicationData.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((_, i) => {
      obj = obj[this.configureHierarchy[i + 1]];
    });
    const keys = Object.keys(obj);
    delete obj[keys[index]];
  }

  trackByFn(index: any, item: any) {
    return index;
 }

  onSaveHierarchyTags() {
    let flag;

    this.applicationData.hierarchy.levels.forEach(item => {
      if (!item || (item.trim()).length === 0) {
        flag = 'Blank Name is not allowed.';
        return;
      }
      CONSTANTS.NOT_ALLOWED_SPECIAL_CHARS_NAME.forEach(char => {
        if (item.includes(char)) {
          flag = `Hierarchy name should not contain space, dot '#' and '$'`;
          return;
        }
      });
    });
    if (flag) {
      this.toasterService.showError(flag, 'Save Asset Hierarchy');
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
    this.apiSubscriptions.push(this.applicationService.updateAppHierarchy(obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Asset Hierarchy');
        this.selectedHierarchyItem = undefined;
        this.addedTagItem = undefined;
        if (this.forceUpdate) {
          this.onCloseModal();
        }
        this.saveHierarchyAPILoading = false;
        this.isAppSetingsEditable = false;
        this.applicationService.refreshAppData.emit();
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Asset Hierarchy');
        this.saveHierarchyAPILoading = false;
      }
    ));
  }

  openConfirmHierarchyDeleteModal(hierarchy) {
    this.selectedHierarchy = hierarchy;
    this.selectedHierarchyItem = undefined;
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  deleteHierarchy() {
    this.forceUpdate = true;
    const index = this.applicationData.hierarchy.levels.findIndex(level => level === this.selectedHierarchy);
    const tags = this.removeHierarchyIndexTags(this.applicationData.hierarchy.tags, index);
    this.applicationData.hierarchy.tags = JSON.parse(JSON.stringify(tags));
    this.applicationData.hierarchy.levels.splice(index, 1);
    this.onCloseModal();
  }

  removeHierarchyIndexTags(tags, index) {
    if (index === 1) {
      return {};
    }
    Object.keys(tags).forEach(tag => {
        tags[tag] = this.removeHierarchyIndexTags(tags[tag], index - 1);
    });
    return tags;
  }

  onCloseModal() {
    this.selectedHierarchy = undefined;
    $('#confirmMessageModal').modal('hide');
    this.isAppSetingsEditable = false;
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
    this.selectedHierarchyItem = undefined;
    this.applicationData.hierarchy.levels.forEach((_, index) => {
      this.hierarchyArr[index] = [];
    });
    if (this.applicationData?.hierarchy?.levels.length > 1) {
      this.hierarchyArr['1'] = Object.keys(this.applicationData.hierarchy.tags);
    }
    this.isAppSetingsEditable = false;
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
