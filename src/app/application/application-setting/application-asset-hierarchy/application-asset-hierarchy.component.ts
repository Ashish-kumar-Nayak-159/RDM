import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { element } from 'protractor';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';

declare var $: any;
@Component({
  selector: 'app-application-asset-hierarchy',
  templateUrl: './application-asset-hierarchy.component.html',
  styleUrls: ['./application-asset-hierarchy.component.css'],
})
export class ApplicationAssetHierarchyComponent implements OnInit, OnDestroy {
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
  originalHierarchyArr = {};
  selectedHierarchyData = {};
  isAddHierarchyThere = false;
  decodedToken: any;
  constructor(
    private toasterService: ToasterService,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.applicationData.hierarchy.levels.forEach((_, index) => {
      this.hierarchyArr[index] = [];
    });

    if (this.applicationData?.hierarchy?.levels.length > 1) {
      this.selectedHierarchyData['1'] = this.applicationData.hierarchy.tags;
      this.hierarchyArr['1'] = Object.keys(this.applicationData.hierarchy.tags);
    }
    console.log(this.hierarchyArr);
    this.originalHierarchyArr = JSON.parse(JSON.stringify(this.hierarchyArr));
  }

  onHierarchyConfigurationChange(i, tag) {
    console.log(i);
    console.log(JSON.stringify(this.selectedHierarchyData));
    const obj = JSON.parse(JSON.stringify(this.selectedHierarchyData));
    Object.keys(this.selectedHierarchyData).forEach((key) => {
      console.log(key, '======', i);
      if (key > i) {
        delete obj[key];
      }
    });
    this.selectedHierarchyData = JSON.parse(JSON.stringify(obj));
    console.log(JSON.stringify(this.selectedHierarchyData));
    this.selectedHierarchyData[i + 1] = tag;
    this.configureHierarchy[i] = tag;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    console.log(this.configureHierarchy);
    Object.keys(this.hierarchyArr).forEach((key) => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    console.log(this.hierarchyArr);
    let nextHierarchy = this.applicationData.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((_, index) => {
      nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
    });
    console.log(nextHierarchy);
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
    console.log(this.hierarchyArr);
    this.originalHierarchyArr = JSON.parse(JSON.stringify(this.hierarchyArr));
    console.log(this.selectedHierarchyData);
  }

  addTag(index) {
    this.hierarchyArr[index].push(null);
    this.isAddHierarchyThere = true;
  }

  onAddNewTag(i, tagIndex) {
    if (!this.addedTagItem || this.addedTagItem.trim().length === 0) {
      this.toasterService.showError('Blank values are not allowed', 'Add Tag');
      return;
    }
    if (this.hierarchyArr[i].indexOf(this.addedTagItem) !== -1) {
      this.toasterService.showError('Tag already exists', 'Add Tag');
      return;
    }
    this.isAddHierarchyThere = false;
    this.hierarchyArr[i][tagIndex] = this.addedTagItem;
    let obj = this.applicationData.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((_, index) => {
      if (index + 1 < i) {
        obj = obj[this.configureHierarchy[index + 1]];
      }
    });
    obj[this.addedTagItem] = {};
    console.log(obj);
    this.addedTagItem = undefined;
    this.originalHierarchyArr = JSON.parse(JSON.stringify(this.hierarchyArr));
  }

  onRemoveTag(index, tagIndex) {
    console.log(JSON.stringify(this.configureHierarchy));
    this.hierarchyArr[index].splice(tagIndex, 1);
    console.log(this.hierarchyArr);
    let obj = this.applicationData.hierarchy.tags;
    console.log(JSON.stringify(this.configureHierarchy));
    Object.keys(this.configureHierarchy).forEach((_, i) => {
      console.log(index);
      console.log(i + 1, this.configureHierarchy[i + 1]);
      if (index > i + 1) {
        obj = obj[this.configureHierarchy[i + 1]];
        console.log(obj);
      }
    });
    console.log(obj);
    const keys = Object.keys(obj);
    console.log(obj[keys[tagIndex]]);
    delete obj[keys[tagIndex]];
    console.log(this.applicationData.hierarchy.tags);
    const configureHierarchyObj = JSON.parse(JSON.stringify(this.configureHierarchy));
    Object.keys(configureHierarchyObj).forEach((_, i) => {
      if (i + 1 >= index) {
        delete this.configureHierarchy[i + 1];
      }
    });
    console.log(this.configureHierarchy);
    const arr = [];
    this.applicationData.hierarchy.levels.forEach((_, i) => {
      arr[i] = [];
    });
    this.selectedHierarchyData = {};
    if (this.applicationData?.hierarchy?.levels.length > 1) {
      arr['1'] = Object.keys(this.applicationData.hierarchy.tags);
      this.selectedHierarchyData['1'] = this.applicationData.hierarchy.tags;
    }

    let nextHierarchy = this.applicationData.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((_, i) => {
      console.log('1111111 ', nextHierarchy);
      console.log(this.configureHierarchy[i + 1]);
      nextHierarchy = nextHierarchy[this.configureHierarchy[i + 1]];
      this.selectedHierarchyData[i + 2] = nextHierarchy;
      console.log('2222222   ', nextHierarchy);
      if (nextHierarchy) {
        arr[i + 2] = Object.keys(nextHierarchy);
        console.log('333333333   ', arr);
      }
    });
    this.hierarchyArr = JSON.parse(JSON.stringify(arr));
    console.log(this.hierarchyArr);
    this.originalHierarchyArr = JSON.parse(JSON.stringify(this.hierarchyArr));
    console.log(this.selectedHierarchyData);
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  trackByFn1(index: any, item: any) {
    return index;
  }

  onSaveHierarchyTags() {
    let flag;

    this.applicationData.hierarchy.levels.forEach((item) => {
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

    const obj = {
      app: this.applicationData.app,
      hierarchy: this.applicationData.hierarchy,
      force_update: this.forceUpdate ? this.forceUpdate : undefined,
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
    this.apiSubscriptions.push(
      this.applicationService.updateAppHierarchy(obj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Save Asset Hierarchy');
          this.selectedHierarchyItem = undefined;
          this.addedTagItem = undefined;
          if (this.forceUpdate) {
            this.isAppSetingsEditable = false;
          }
          this.saveHierarchyAPILoading = false;
          this.isAppSetingsEditable = false;
          this.applicationService.refreshAppData.emit();
        },
        (error) => {
          this.toasterService.showError(error.message, 'Save Asset Hierarchy');
          this.saveHierarchyAPILoading = false;
        }
      )
    );
  }

  onAddTagCancel(index, tagIndex) {
    this.hierarchyArr[index].splice(tagIndex, 1);
    this.isAddHierarchyThere = false;
    this.addedTagItem = undefined;
    this.originalHierarchyArr = JSON.parse(JSON.stringify(this.hierarchyArr));
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
    this.selectedHierarchyItem = undefined;
    this.applicationData.hierarchy.levels.forEach((_, index) => {
      this.hierarchyArr[index] = [];
    });
    if (this.applicationData?.hierarchy?.levels.length > 1) {
      this.hierarchyArr['1'] = Object.keys(this.applicationData.hierarchy.tags);
      this.selectedHierarchyData['1'] = this.applicationData.hierarchy.tags;
    }
    this.originalHierarchyArr = JSON.parse(JSON.stringify(this.hierarchyArr));
    this.configureHierarchy = {};
    this.isAppSetingsEditable = false;
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
