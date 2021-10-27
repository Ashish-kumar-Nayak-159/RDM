import { ToasterService } from 'src/app/services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

declare var $: any;
@Component({
  selector: 'app-hierarchy-dropdown',
  templateUrl: './hierarchy-dropdown.component.html',
  styleUrls: ['./hierarchy-dropdown.component.css'],
})
export class HierarchyDropdownComponent implements OnInit {
  @Input() filterObj: any = {};
  originalFilterObj: any = {};
  contextApp: any;
  configureHierarchy: any = {};
  hierarchyArr: any = {};
  @Input() assets: any[] = [];
  originalAssets: any[] = [];
  @Input() showAsset = false;
  hierarchyString: string;
  contextAppUserHierarchyLength = 0;
  displayHierarchyString: string;
  @Output() saveHierarchyEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearHierarchyEvent: EventEmitter<any> = new EventEmitter<any>();
  constructor(private commonService: CommonService, private toasterService: ToasterService) {}

  ngOnInit(): void {
    console.log(this.assets);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp?.user?.hierarchy) {
      this.contextAppUserHierarchyLength = Object.keys(this.contextApp.user.hierarchy).length;
    }
    this.hierarchyString = this.contextApp.app;
    this.displayHierarchyString = this.contextApp.app;
    this.originalAssets = JSON.parse(JSON.stringify(this.assets));
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
  }

  onHierarchyDropdownClick() {
    $('.dropdown-menu .dropdown-open').on('click.bs.dropdown', (e) => {
      e.stopPropagation();
    });
    if (
      this.showAsset ||
      (this.contextApp?.hierarchy?.levels?.length > 1 &&
        this.contextAppUserHierarchyLength !== this.contextApp?.hierarchy?.levels?.length)
    ) {
      $('#dd-open').on('hide.bs.dropdown', (e: any) => {
        if (e.clickEvent && !e.clickEvent.target.className?.includes('searchBtn')) {
          e.preventDefault();
        }
      });
    }
  }

  onChangeOfHierarchy(i) {
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
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
    const hierarchyObj: any = { App: this.contextApp.app };
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });

    if (Object.keys(hierarchyObj).length === 1) {
      this.assets = JSON.parse(JSON.stringify(this.originalAssets));
    } else {
      const arr = [];
      this.assets = [];
      console.log(this.originalAssets);
      this.originalAssets.forEach((asset) => {
        let trueFlag = 0;
        let flaseFlag = 0;
        Object.keys(hierarchyObj).forEach((hierarchyKey) => {
          if (asset.hierarchy[hierarchyKey] && asset.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
            trueFlag++;
          } else {
            flaseFlag++;
          }
        });
        if (trueFlag > 0 && flaseFlag === 0) {
          arr.push(asset);
        }
      });
      this.assets = JSON.parse(JSON.stringify(arr));
    }
    if (this.showAsset) {
      if (this.assets?.length === 1) {
        this.filterObj.asset = this.assets[0];
      }
      this.filterObj.assetArr = undefined;
      this.filterObj.asset = undefined;
    }
    let count = 0;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        count++;
      }
    });
    if (count === 0) {
      this.hierarchyArr = [];
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
    }
  }

  onSaveHierachy() {
    if (this.showAsset) {
      this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
      this.saveHierarchyEvent.emit();
    } else {
      this.hierarchyString = this.contextApp.app;
      this.displayHierarchyString = this.contextApp.app;
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          this.hierarchyString += ' > ' + this.configureHierarchy[key];
          this.displayHierarchyString = this.configureHierarchy[key];
        }
      });
      this.saveHierarchyEvent.emit(this.configureHierarchy);
    }
  }

  getConfiguredHierarchy() {
    return this.configureHierarchy;
  }

  getAssets() {
    return this.assets;
  }

  onClearHierarchy() {
    this.hierarchyArr = {};
    this.configureHierarchy = {};
    this.filterObj.asset = undefined;
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        if (this.contextApp.user.hierarchy[level]) {
          this.onChangeOfHierarchy(index);
        }
      } else {
        this.assets = JSON.parse(JSON.stringify(this.originalAssets));
      }
    });
    if (this.showAsset) {
      this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
      this.clearHierarchyEvent.emit();
    } else {
      this.hierarchyString = this.contextApp.app;
      this.displayHierarchyString = this.contextApp.app;
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          this.hierarchyString += ' > ' + this.configureHierarchy[key];
          this.displayHierarchyString = this.configureHierarchy[key];
        }
      });
      this.clearHierarchyEvent.emit(this.configureHierarchy);
    }
  }

  updateHierarchyDetail(hierarchyObj) {
    if (hierarchyObj.hierarchy) {
      if (Object.keys(this.contextApp.hierarchy.tags).length > 0) {
        this.contextApp.hierarchy.levels.forEach((level, index) => {
          if (index !== 0) {
            this.configureHierarchy[index] = hierarchyObj.hierarchy[level];
            if (hierarchyObj.hierarchy[level]) {
              this.onChangeOfHierarchy(index);
            }
          }
        });
      }
    }
    if (hierarchyObj.assets && this.showAsset) {
      this.filterObj.asset = hierarchyObj.assets;
      this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    }
    if (!this.showAsset) {
      this.hierarchyString = this.contextApp.app;
      this.displayHierarchyString = this.contextApp.app;
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          this.hierarchyString += ' > ' + this.configureHierarchy[key];
          this.displayHierarchyString = this.configureHierarchy[key];
        }
      });
    }
  }
}
