import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CommonService } from 'src/app/services/common.service';

declare var $: any;
@Component({
  selector: 'app-hierarchy-dropdown',
  templateUrl: './hierarchy-dropdown.component.html',
  styleUrls: ['./hierarchy-dropdown.component.css'],
})
export class HierarchyDropdownComponent implements OnInit, OnChanges {
  @Input() filterObj: any = {};
  @Input() closeOnSelection: boolean = false;
  originalFilterObj: any = {};
  contextApp: any;
  configureHierarchy: any = {};
  hierarchyArr: any = {};
  @Input() assets: any[] = [];
  originalAssets: any[] = [];
  actualAssets: any[] = [];
  @Input() showAsset = false;
  hierarchyString: string;
  contextAppUserHierarchyLength = 0;
  displayHierarchyString: string;
  hierarchyNewArr = [];
  actualhierarchyNewArr = [];
  @Output() saveHierarchyEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearHierarchyEvent: EventEmitter<any> = new EventEmitter<any>();
  constructor(private commonService: CommonService, private applicationService: ApplicationService) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.originalAssets = this.actualAssets;
  }

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp?.user?.hierarchy) {
      this.contextAppUserHierarchyLength = Object.keys(this.contextApp.user.hierarchy).length;
    }
    this.hierarchyString = this.contextApp.app;
    this.displayHierarchyString = this.contextApp.app;
    this.originalAssets = JSON.parse(JSON.stringify(this.assets));
    this.actualAssets = this.originalAssets;
    await this.getUserHierarchy();
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
        if (e.clickEvent && !e.clickEvent.target.className?.includes('searchBtn') && !e.clickEvent.target.className?.includes('fa-search')) {
          e.preventDefault();
        }
      });
    }
  }


  onSaveHierachy() {
    if (this.showAsset) {
      this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
      if (!this.closeOnSelection) {
        if (Object.keys(this.originalFilterObj).length > 0 && this.originalFilterObj.hasOwnProperty('asset')) {
          this.saveHierarchyEvent.emit();
        }
      }
      else {
        if (Object.keys(this.originalFilterObj).length > 0 && this.originalFilterObj.hasOwnProperty('asset')) {
          $("#liveDataSelectAssret").removeClass("show");
          this.saveHierarchyEvent.emit();
        }
      }
    } else {
      this.hierarchyString = this.contextApp.app;
      this.displayHierarchyString = this.contextApp.app;
      Object.keys(this.configureHierarchy).forEach((key, index) => {
        if (this.configureHierarchy[key]) {
          this.hierarchyString += ' > ' + this.getDisplayHierarchyString(index, this.configureHierarchy[key]);
          this.displayHierarchyString = this.getDisplayHierarchyString(index, this.configureHierarchy[key]);
        }
      });
      this.saveHierarchyEvent.emit(this.configureHierarchy);
    }
  }
  getDisplayHierarchyString(index, hierarchyKey) {
    let selectedHierarchy = this.actualhierarchyNewArr.find(r => r.level == (index + 1) && r.key == hierarchyKey);
    if (selectedHierarchy) {
      return selectedHierarchy.name;
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
      this.hierarchyArr[1] = this.actualhierarchyNewArr?.filter(r => r.level == 1);
    }
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        if (this.contextApp.user.hierarchy[level]) {
          this.onChangeOfNewHierarchy(index);
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
      Object.keys(this.configureHierarchy).forEach((key, index) => {
        if (this.configureHierarchy[key]) {
          this.hierarchyString += ' > ' + this.getDisplayHierarchyString(index, this.configureHierarchy[key]);
          this.displayHierarchyString = this.getDisplayHierarchyString(index, this.configureHierarchy[key])
        }
      });
      this.clearHierarchyEvent.emit(this.configureHierarchy);
    }
  }

  updateHierarchyDetail(hierarchyObj) {
    if (this.contextApp) {
      if (hierarchyObj.hierarchy) {
        if (this.actualhierarchyNewArr?.length > 0) {
          this.contextApp.hierarchy.levels.forEach((level, index) => {
            if (index !== 0) {
              this.configureHierarchy[index] = hierarchyObj.hierarchy[level];
              if (hierarchyObj.hierarchy[level]) {
                this.onChangeOfNewHierarchy(index);
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
        Object.keys(this.configureHierarchy).forEach((key, index) => {
          if (this.configureHierarchy[key]) {
            this.hierarchyString += ' > ' + this.getDisplayHierarchyString(index, this.configureHierarchy[key]);
            this.displayHierarchyString = this.getDisplayHierarchyString(index, this.configureHierarchy[key])
          }
        });
      }
    }
  }
  async getUserHierarchy() {
    if (this.contextApp) {
      this.actualhierarchyNewArr = [];
      this.hierarchyNewArr[0] = [{ key: 'App', name: 'App', level: 0 }];
      this.actualhierarchyNewArr = this.commonService.getItemFromLocalStorage(CONSTANTS.HIERARCHY_TAGS);
      let allHierarchyData = [];
      this.actualhierarchyNewArr?.map((item) => {
        allHierarchyData.push({ key: item.key, name: item.name, level: item.level, id: item.id });
      });
      this.contextApp.hierarchy.levels.forEach((_, index) => {
        if (index !== 0 && index === 1) {
          this.hierarchyNewArr[index] = allHierarchyData.filter(f => f.level == index);
        }
      });
    }
  }
  onChangeOfNewHierarchy(i) {
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyNewArr).forEach((key) => {
      if (key > i) {
        this.hierarchyNewArr[key] = [];
      }
    });
    let parentId = 0;
    Object.keys(this.configureHierarchy).forEach((key,index) => {
      if (this.configureHierarchy[key]) {
        parentId = this.actualhierarchyNewArr.find(r => r.level == index + 1 && r.key == this.configureHierarchy[key] && r.parent_id == parentId).id;        
      }
    });
    let selectedHierarchy = this.actualhierarchyNewArr.find(r => r.id == parentId);
    if (selectedHierarchy) {
      this.hierarchyNewArr[i + 1] = this.actualhierarchyNewArr.filter(r => r.level == i + 1 && r.parent_id == selectedHierarchy.id);
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
      this.hierarchyNewArr = [];
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.hierarchyNewArr[1] = this.actualhierarchyNewArr.filter(r => r.level == 1);
      }
    }
    this.onSaveHierachy();
    if (!this.showAsset && this.closeOnSelection || (!this.closeOnSelection && this.contextApp.hierarchy.levels.length == Object.keys(this.hierarchyArr).length)) {
      $("#liveDataSelectAssret").removeClass("show");
    }
  }
}
