import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { ApplicationService } from './../../../services/application/application.service';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';

declare var $: any;
@Component({
  selector: 'app-application-org-tree',
  templateUrl: './application-org-tree.component.html',
  styleUrls: ['./application-org-tree.component.css'],
})
export class ApplicationOrgTreeComponent implements OnInit {
  @Input() applicationData: any;
  originalAppData: any;
  isAppSetingsEditable = false;
  isSaveNodeAPILoading = false;
  forceUpdate = false;
  selectedItemForDelete: any;
  apiSubscriptions: Subscription[] = [];
  decodedToken: any;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };

  constructor(
    private toasterService: ToasterService,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    if (!this.applicationData?.hierarchy?.levels) {
      this.applicationData.hierarchy.levels = [];
    }
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.originalAppData = JSON.parse(JSON.stringify(this.applicationData));
  }

  onAddNewNodeObj() {
    this.applicationData.hierarchy.levels.push(null);
    this.isAppSetingsEditable = true;
  }

  onCancelClick() {
    this.isAppSetingsEditable = false;
    this.applicationData = JSON.parse(JSON.stringify(this.originalAppData));
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  onSaveNodes() {
    let flag;
    const originalLevelsLowerCase = this.originalAppData?.hierarchy?.levels.map(item => item.toLowerCase());
    this.applicationData.hierarchy.levels.forEach((item) => {
      if (originalLevelsLowerCase.indexOf(item.toLowerCase()) !== -1) {
        flag = 'Node with given name already exists';
        return;
      } else { flag = '' }
      if (!item || item.trim().length === 0) {
        flag = 'Blank Name is not allowed.';
        return;
      }
      CONSTANTS.NOT_ALLOWED_SPECIAL_CHARS_NAME.forEach((char) => {
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
    this.isSaveNodeAPILoading = true;
    this.forceUpdate = false;
    this.updateAppData();
  }

  updateAppData(hierarchy = null) {
    const obj = {
      app: this.applicationData.app,
      hierarchy: !hierarchy ? this.applicationData.hierarchy : hierarchy,
      force_update: this.forceUpdate ? this.forceUpdate : undefined,
    };
    this.apiSubscriptions.push(
      this.applicationService.updateAppHierarchy(obj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Update Org Tree');
          if (this.forceUpdate) {
            this.onModalEvents('close');
            this.isAppSetingsEditable = false;
          }
          this.isSaveNodeAPILoading = false;
          this.isAppSetingsEditable = false;
          this.applicationData.hierarchy = hierarchy ?? this.applicationData.hierarchy;
          this.applicationService.refreshAppData.emit();
          this.originalAppData = JSON.parse(JSON.stringify(this.applicationData));
        },
        (error) => {
          this.onModalEvents('close');
          this.toasterService.showError(error.message, 'Update Org Tree');
          this.isSaveNodeAPILoading = false;
          this.isAppSetingsEditable = false;
        }
      )
    );
  }

  openConfirmNodeDeleteModal(item, index) {
    this.isAppSetingsEditable = false;
    this.forceUpdate = true;
    this.selectedItemForDelete = item;
    if (this.originalAppData.hierarchy.levels.indexOf(this.selectedItemForDelete) !== -1) {
      this.modalConfig = {
        stringDisplay: true,
        isDisplaySave: true,
        isDisplayCancel: true,
      };
      $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    } else {
      this.applicationData.hierarchy.levels.splice(index, 1);
      this.selectedItemForDelete = undefined;
      const tags = this.removeHierarchyIndexTags(this.applicationData.hierarchy.tags, index);
      this.applicationData.hierarchy.tags = JSON.parse(JSON.stringify(tags));
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.selectedItemForDelete = undefined;
      $('#confirmMessageModal').modal('hide');
    } else if (eventType === 'save') {
      this.deleteNode();
    }
  }

  deleteNode() {
    const index = this.applicationData.hierarchy.levels.indexOf(this.selectedItemForDelete);
    const tags = this.removeHierarchyIndexTags(this.applicationData.hierarchy.tags, index);
    // this.applicationData.hierarchy.tags = JSON.parse(JSON.stringify(tags));
    const levels = [];
    this.applicationData.hierarchy.levels.forEach((element) => {
      if (element && element !== this.selectedItemForDelete) {
        levels.push(element);
      }
    });
    // this.applicationData.hierarchy.levels = JSON.parse(JSON.stringify(levels));
    this.forceUpdate = true;
    this.updateAppData({
      "tags": tags,
      "levels": levels
    });
  }

  removeHierarchyIndexTags(tags, index) {
    if (index === 1) {
      return {};
    }
    Object.keys(tags).forEach((tag) => {
      tags[tag] = this.removeHierarchyIndexTags(tags[tag], index - 1);
    });
    return tags;
  }
}
