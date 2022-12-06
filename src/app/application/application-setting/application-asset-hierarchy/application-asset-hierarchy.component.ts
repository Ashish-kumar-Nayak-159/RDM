import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
  hierarchyTags: any;
  hierachyWithData: any = [];
  assetCustomTags: any[] = [];
  addHierarchyForm: any = {};
  hierarchyForm: any = {};
  loader: boolean = false;
  submitted: boolean = false;
  isCustomTagsEditable = false;
  levelToAddUpdate = 0;
  parentId = 0;
  hierarchyId = 0;
  hierarchyName = '';
  isEditMode = false;
  selectedLevelHierarchy = {};
  hierarchyArray = [];
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private toasterService: ToasterService,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) { }

  async ngOnInit(): Promise<void> {
    this.initialForm();
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.applicationData.hierarchy.levels.forEach((_, index) => {
      this.hierarchyArr[index] = [];
    });
    await this.getAllHierarchy(1);
  }
  get f() { return this.addHierarchyForm.controls; }
  setDefaultCustomTags() {
    this.assetCustomTags = [
      {
        id: 1,
        name: null,
        value: null,
        editable: true,
      },
    ];
  }
  async getAllHierarchy(level, parentId = 0) {
    if (level !== 1) {
      this.selectedLevelHierarchy[level - 1] = parentId;
      for (let index = level; index <= Object.keys(this.selectedLevelHierarchy).length; index++) {
        delete this.selectedLevelHierarchy[index];
      }
    }
    const obj = {
      level: level,
      parent_id: parentId
    };
    if (this.hierachyWithData.length > 0) {
      for (let index = level + 1; index < this.hierachyWithData.length; index++) {
        delete this.hierachyWithData[index];
      }
    }
    this.parentId = parentId;
    return new Promise<void>((resolve) => {
      this.apiSubscriptions.push(
        this.applicationService.getHierarchies(obj).subscribe((response: any) => {
          if (response && response.data && response.data.length > 0) {
            if (response.parentData) {
              response.data.forEach((item) => {
                item.parentObj = response?.parentData.find((x: any) => x.id == item?.parent_id)
              });
            }
            this.hierachyWithData[level] = response.data;
          }
          else {
            this.hierachyWithData[level] = [];
          };
        })
      );
    });
  }

  onHierarchyConfigurationChange(i, tag) {
    const obj = JSON.parse(JSON.stringify(this.selectedHierarchyData));
    Object.keys(this.selectedHierarchyData).forEach((key) => {
      if (key > i) {
        delete obj[key];
      }
    });
    this.selectedHierarchyData = JSON.parse(JSON.stringify(obj));
    this.selectedHierarchyData[i + 1] = tag;
    this.configureHierarchy[i] = tag;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach((key) => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.hierarchyTags;
    Object.keys(this.configureHierarchy).forEach((_, index) => {
      nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
    this.originalHierarchyArr = JSON.parse(JSON.stringify(this.hierarchyArr));
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
    let obj = this.hierarchyTags;
    Object.keys(this.configureHierarchy).forEach((_, index) => {
      if (index + 1 < i) {
        obj = obj[this.configureHierarchy[index + 1]];
      }
    });
    obj[this.addedTagItem] = {};
    this.addedTagItem = undefined;
    this.originalHierarchyArr = JSON.parse(JSON.stringify(this.hierarchyArr));
  }

  onRemoveTag(index, tagIndex) {
    this.hierarchyArr[index].splice(tagIndex, 1);
    let obj = this.hierarchyTags;
    Object.keys(this.configureHierarchy).forEach((_, i) => {
      if (index > i + 1) {
        obj = obj[this.configureHierarchy[i + 1]];
      }
    });
    const keys = Object.keys(obj);
    delete obj[keys[tagIndex]];
    const configureHierarchyObj = JSON.parse(JSON.stringify(this.configureHierarchy));
    Object.keys(configureHierarchyObj).forEach((_, i) => {
      if (i + 1 >= index) {
        delete this.configureHierarchy[i + 1];
      }
    });
    const arr = [];
    this.applicationData.hierarchy.levels.forEach((_, i) => {
      arr[i] = [];
    });
    this.selectedHierarchyData = {};
    if (this.applicationData?.hierarchy?.levels.length > 1) {
      arr['1'] = Object.keys(this.hierarchyTags);
      this.selectedHierarchyData['1'] = this.hierarchyTags;
    }

    let nextHierarchy = this.hierarchyTags;
    Object.keys(this.configureHierarchy).forEach((_, i) => {
      nextHierarchy = nextHierarchy[this.configureHierarchy[i + 1]];
      this.selectedHierarchyData[i + 2] = nextHierarchy;
      if (nextHierarchy) {
        arr[i + 2] = Object.keys(nextHierarchy);
      }
    });
    this.hierarchyArr = JSON.parse(JSON.stringify(arr));
    this.originalHierarchyArr = JSON.parse(JSON.stringify(this.hierarchyArr));
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  trackByFn1(index: any, item: any) {
    return index;
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
    this.applicationData?.hierarchy?.levels.forEach((_, index) => {
      this.hierarchyArr[index] = [];
    });
    if (this.applicationData?.hierarchy?.levels.length > 1) {
      this.hierarchyTags = this.applicationData?.hierarchy?.tags
      this.hierarchyArr['1'] = Object.keys(this.hierarchyTags);
      this.selectedHierarchyData['1'] = this.hierarchyTags;
    }
    this.originalHierarchyArr = JSON.parse(JSON.stringify(this.hierarchyArr));
    this.configureHierarchy = {};
    this.isAppSetingsEditable = false;
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
  onSaveHierarchy() {
    this.loader = true;
    this.submitted = true;
    if (this.addHierarchyForm.invalid) {
      this.loader = false;
      return;
    }
    this.hierarchyForm.name = this.addHierarchyForm.controls['name'].value;
    this.hierarchyForm.metadata = {};
    Object.keys(this.assetCustomTags).forEach((key, index) => {
      if (this.assetCustomTags[key]?.name) {
        this.hierarchyForm.metadata[this.assetCustomTags[key].name] = this.assetCustomTags[key].value;
      }
    });
    let methodToCall;
    if (this.isEditMode) {
      methodToCall = this.applicationService.updateHierarchy(this.hierarchyForm);
    } else {
      methodToCall = this.applicationService.addHierarchy(this.hierarchyForm);
    }
    this.apiSubscriptions.push(
      methodToCall.subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Hierarchy');
          this.getAllHierarchy(this.hierarchyForm.level, this.hierarchyForm.parent_id);
          this.onCloseHierarchyModal();
          this.assetCustomTags = [];
          this.SetHierarchyTags();
        },
        (error) => {
          this.loader = false;
          this.toasterService.showError(error.message, 'Hierarchy');
          this.assetCustomTags = [];
        }
      )
    );
  }
  initialForm() {
    this.hierarchyForm = {};
    this.submitted = false;
    this.loader = false;
    this.addHierarchyForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    })
  }
  onCloseHierarchyModal() {
    this.assetCustomTags = [];
    this.initialForm();
    $('#addHierarchyModal').modal('hide');
  }
  onShowHierarchyModal(level) {
    this.isEditMode = false;
    this.setDefaultCustomTags();
    this.levelToAddUpdate = level
    this.hierarchyForm.level = level;
    let filteredLevel = this.hierachyWithData[level];
    if (filteredLevel.length > 0) { this.hierarchyForm.parent_id = filteredLevel[0].parent_id; }
    if (!this.hierarchyForm.hasOwnProperty('parent_id')) {
      this.hierarchyForm.parent_id = this.parentId;
    }
    $('#addHierarchyModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }
  deleteCustomTag(index) {
    this.assetCustomTags.splice(index, 1);
  }
  checkKeyDuplicacy(tagObj, tagIndex, type) {
    CONSTANTS.NOT_ALLOWED_SPECIAL_CHARS_NAME.forEach((char) => {
      if (tagObj?.name && tagObj?.name.includes(char)) {
        this.toasterService.showError('Tag key should not include `.`, ` `, `$`, `#`', 'Set Tags');
        return;
      }
    });
    let index;
    if (type == 'custom_tags') {
      index = this.assetCustomTags.findIndex((tag) => tag.name === tagObj?.name);
    }
    if (index !== -1 && index !== tagIndex) {
      this.toasterService.showError('Tag with same name is already exists. Please use different name', 'Set Tags');
      tagObj.name = undefined;
    }

  }
  onCustomTagInputChange() {
    let count = 0;
    this.assetCustomTags.forEach((tag, index) => {
      if (tag.name && tag.value && !this.assetCustomTags[index + 1]) {
        count += 1;
      }
    });
    if (count > 0) {
      this.assetCustomTags.push({
        name: null,
        value: null,
        editable: true,
      });
    }
  }
  deleteHierarchy(id, level, parent_id) {
    this.hierarchyId = id;
    this.levelToAddUpdate = level;
    this.parentId = parent_id;
    this.hierarchyName = this.hierachyWithData[this.levelToAddUpdate].find((propObj) => propObj.id === this.hierarchyId)?.name;
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }
  reinitializeHierarchyParams() {
    this.hierarchyId = 0;
    this.levelToAddUpdate = 0;
    this.parentId = 0;
  }
  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.reinitializeHierarchyParams();
      $('#confirmMessageModal').modal('hide');
    } else if (eventType === 'save') {
      this.deleteHierarchyNode();
    }
  }
  deleteHierarchyNode() {
    const obj = {
      force_update: true
    };
    this.apiSubscriptions.push(
      this.applicationService.deleteHierarchy(obj, this.hierarchyId).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Hierarchy');
          this.getAllHierarchy(this.levelToAddUpdate, this.parentId);
          this.reinitializeHierarchyParams();
          $('#confirmMessageModal').modal('hide');
        },
        (error) => {
          this.toasterService.showError(error.message, 'Hierarchy');
          this.reinitializeHierarchyParams();
          $('#confirmMessageModal').modal('hide');
        }
      )
    );
  }
  getHierarchy(id) {
    this.apiSubscriptions.push(
      this.applicationService.getHierarchyById(id).subscribe(
        (response: any) => {
          if (response) {
            this.initialForm();
            this.addHierarchyForm.controls['name'].setValue(response.name);
            this.hierarchyForm.level = response.level;
            this.hierarchyForm.parent_id = response.parent_id;
            this.hierarchyForm.id = response.id;
            this.levelToAddUpdate = response.level;
            if (response?.metaData) {
              Object.keys(response?.metaData).forEach((key, index) => {
                this.assetCustomTags.push({
                  id: index,
                  name: key,
                  value: (typeof response?.metaData[key]) === 'object' ? response?.metaData[key]?.e164Number : response?.metaData[key],
                });
              });
              this.assetCustomTags.push(
                {
                  id: Object.keys(response?.metaData ?? {}).length,
                  name: null,
                  value: null,
                  editable: true,
                },
              );
            }
            this.isEditMode = true;
            $('#addHierarchyModal').modal({ backdrop: 'static', keyboard: false, show: true });
          }
          else {
            this.toasterService.showError("No Detail Found", 'Hierarchy');
          }
        },
        (error) => {
          this.toasterService.showError(error.message, 'Hierarchy');
        }
      )
    );
  }
  SetHierarchyTags() {
    localStorage.removeItem(CONSTANTS.HIERARCHY_TAGS);
    return new Promise<void>(async (resolve) => {
      this.applicationService.getExportedHierarchy({ response_format: 'Object' }).subscribe(async (response: any) => {
        if (response && response.data && response.data.length > 0) {
          this.commonService.setItemInLocalStorage(CONSTANTS.HIERARCHY_TAGS, response?.data);
        }
        resolve();
      },
        (error) => {
          this.commonService.setItemInLocalStorage(CONSTANTS.HIERARCHY_TAGS, []);
          resolve();
        })
    });
  }
}
