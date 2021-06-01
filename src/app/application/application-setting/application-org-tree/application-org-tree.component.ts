import { Subscription } from 'rxjs';
import { ApplicationService } from './../../../services/application/application.service';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';

declare var $: any;
@Component({
  selector: 'app-application-org-tree',
  templateUrl: './application-org-tree.component.html',
  styleUrls: ['./application-org-tree.component.css']
})
export class ApplicationOrgTreeComponent implements OnInit {

  @Input() applicationData: any;
  originalAppData: any;
  isAppSetingsEditable = false;
  isSaveNodeAPILoading = false;
  forceUpdate = false;
  selectedItemForDelete: any;
  apiSubscriptions: Subscription[] = [];

  constructor(
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    if (!this.applicationData?.hierarchy?.levels) {
      this.applicationData.hierarchy.levels = [];
    }
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
    this.isSaveNodeAPILoading = true;
    this.forceUpdate = false;
    this.updateAppData();
  }

  updateAppData() {
    const obj = {
      app: this.applicationData.app,
      hierarchy: this.applicationData.hierarchy,
      force_update: this.forceUpdate ? this.forceUpdate : undefined
    };
    this.apiSubscriptions.push(this.applicationService.updateAppHierarchy(obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Update Org Tree');
        if (this.forceUpdate) {
          this.onCloseModal();
          this.isAppSetingsEditable = false;
        }
        this.isSaveNodeAPILoading = false;
        this.isAppSetingsEditable = false;
        this.applicationService.refreshAppData.emit();
        this.originalAppData = JSON.parse(JSON.stringify(this.applicationData));
      }, (error) => {
        this.toasterService.showError(error.message, 'Update Org Tree');
        this.isSaveNodeAPILoading = false;
      }
    ));
  }

  openConfirmNodeDeleteModal(item, index) {
    this.isAppSetingsEditable = true;
    this.forceUpdate = true;
    this.selectedItemForDelete = item;
    console.log('beforee' , JSON.stringify(this.applicationData.hierarchy.levels));
    console.log(this.originalAppData.hierarchy.levels.indexOf(this.selectedItemForDelete));
    if (this.originalAppData.hierarchy.levels.indexOf(this.selectedItemForDelete) !== -1) {
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    } else {
      this.applicationData.hierarchy.levels.splice(index, 1);
      this.selectedItemForDelete = undefined;
      const tags = this.removeHierarchyIndexTags(this.applicationData.hierarchy.tags, index);
      this.applicationData.hierarchy.tags = JSON.parse(JSON.stringify(tags));
    }
    console.log('aftererrr' , JSON.stringify(this.applicationData.hierarchy.levels));
  }

  onCloseModal() {
    this.selectedItemForDelete = undefined;
    $('#confirmMessageModal').modal('hide');
    // this.isAppSetingsEditable = false;
  }

  deleteNode() {

    console.log(this.selectedItemForDelete);
    const index = this.applicationData.hierarchy.levels.indexOf(this.selectedItemForDelete);
    console.log(index);
    const tags = this.removeHierarchyIndexTags(this.applicationData.hierarchy.tags, index);
    this.applicationData.hierarchy.tags = JSON.parse(JSON.stringify(tags));
    const levels = [];
    this.applicationData.hierarchy.levels.forEach(element => {
      if (element && element !== this.selectedItemForDelete) {
        levels.push(element);
      }
    });
    this.applicationData.hierarchy.levels = JSON.parse(JSON.stringify(levels));
    this.forceUpdate = true;
    console.log(JSON.stringify(this.applicationData.hierarchy));
    // this.updateAppData();
  }

  removeHierarchyIndexTags(tags, index) {
    console.log('11111', tags);
    console.log(index);
    if (index === 1) {
      return {};
    }
    Object.keys(tags).forEach(tag => {
        console.log(tag);
        tags[tag] = this.removeHierarchyIndexTags(tags[tag], index - 1);
        console.log('22222222', tags[tag]);
    });
    return tags;
  }


}
