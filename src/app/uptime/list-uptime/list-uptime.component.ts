import { object } from '@amcharts/amcharts4/core';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { UpTimeService } from 'src/app/services/upTime/uptime.service';

@Component({
  selector: 'app-list-uptime',
  templateUrl: './list-uptime.component.html',
  styleUrls: ['./list-uptime.component.css']
})
export class ListUptimeComponent implements OnInit {
  decodedToken: any;
  contextApp: any;
  actualhierarchyArr: any;
  originalFilter: {};
  configuredHierarchy: any;
  hierarchy: { App: any; };
  selectedApp: any;
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  applications: any[];
  loadMoreVisibility: boolean;
  apiSubscriptions: Subscription[] = [];
  assets: any;
  filterObj: any = {};
  tileData: any;
  hierarchyId: any;
  assetId: any;
  minDate: Date;
  todayDate: Date = new Date();
  startDate: any
  endDate: any
  uptimeDateFilter: any = {};
  selectedDateRange: any;
  isApplicationListLoading = false;
  tableConfig: any;
  currentOffset = 0;
  currentLimit = 10;
  loader: boolean;
  upTimeHistory: any = [];
  insideScrollFunFlag = false;
  count: number = 0;
  // @Output() filterData = new EventEmitter<any>();

  constructor(private commonService: CommonService,
    private toasterService: ToasterService,
    private assetService: AssetService,
    private upTimeService: UpTimeService,
    private router: Router,

  ) { }

  async ngOnInit() {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.actualhierarchyArr = this.commonService.getItemFromLocalStorage(CONSTANTS.HIERARCHY_TAGS);
    await this.getAssets(this.contextApp.user.hierarchy);
    this.getTileName();
    this.getDefaultFilters();

    this.selectedApp = this.contextApp.app;

    this.tableConfig = {
      type: 'Applications',
      is_table_data_loading: this.isApplicationListLoading,
      table_class: 'table_class_new',
      no_data_message: '',
      data: [
        {
          header_name: 'Asset Id',
          is_display_filter: true,
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'assetId',
          //is_sort: true
        },
        {
          header_name: 'Actual Work Time in hours',
          is_display_filter: true,
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'actualwotktimeinhours',
          //is_sort: true
        },
        {
          header_name: 'Planned Work Time in hours',
          is_display_filter: true,
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'plannedworktimeinhours',
          //is_sort: true
        },
        {
          header_name: 'Uptime Percentage',
          is_display_filter: true,
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'uptimePercentage',
          //is_sort: true
        },


      ],
    };

  }
  getTileName() {
    let selectedItem;
    let assetItem;
    let assetDataItem = {};
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      selectedItem = item.showAccordion;
      assetItem = item.showAccordion;
    });
    this.tileData = selectedItem;
    selectedItem.forEach((item) => {
      this.tileData[item.name] = item.value;
    });
    assetItem.forEach((item) => {
      assetDataItem[item.name] = item.value;
    });
  }

  getAssets(hierarchy) {
    return new Promise<void>((resolve1) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
      };
      this.apiSubscriptions.push(
        this.assetService.getIPAndLegacyAssets(obj, this.contextApp.app).subscribe((response: any) => {
          if (response?.data) {
            this.assets = response.data;
            if (this.assets?.length === 1) {
              // this.filterObj.asset = this.assets[0];
              this.onChangeOfAsset();
            }
          }
          resolve1();
        })
      );
    });
  }

  onChangeOfAsset() {
    const asset = this.assets.find((assetObj) => assetObj.asset_id === this.filterObj.asset.asset_id);
    // const frequencyArr = [];
    // frequencyArr.push(asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
    // frequencyArr.push(asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
    // frequencyArr.push(asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
    // this.frequency = this.commonService.getLowestValueFromList(frequencyArr);
    // if (this.historicalDateFilter.from_date && this.historicalDateFilter.to_date) {
    //   // this.onChangeOfAsset(this.filterObj.asset);
    //   const records = this.commonService.calculateEstimatedRecords(
    //     this.frequency,
    //     this.historicalDateFilter.from_date,
    //     this.historicalDateFilter.to_date
    //   );
    //   if (records > this.noOfRecords) {
    //     this.historicalDateFilter.isTypeEditable = true;
    //   } else {
    //     this.historicalDateFilter.isTypeEditable = false;
    //   }
    // }
  }

  onSaveHierachy(configuredHierarchy) {
    // this.originalFilter = {};
    // this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
    // if (this.filterObj.asset) {
    //   this.originalFilter.asset = JSON.parse(JSON.stringify(this.filterObj.asset));
    //   this.onChangeOfAsset();
    // }
  }
  onClearHierarchy() {
    this.hierarchy = { App: this.selectedApp };
    this.assetId = null;
  }

  filteredHiearchyObj() {

    // if (!this.startDate) {
    //   this.toasterService.showError('please select from date', '');
    //   return
    // }
    // if (!this.endDate) {
    //   this.toasterService.showError('please select to date', '');
    //   return
    // }
    // if (this.startDate > this.endDate) {
    //   this.toasterService.showError('please select valid date', '');
    //   return
    // }

    this.applications = [];
    this.currentOffset = 0;
    this.count = 0;

    this.loadMoreVisibility = true;
    const configuredHierarchy = this.hierarchyDropdown.getConfiguredHierarchy();
    object.keys(configuredHierarchy).length === 0;
    this.onClearHierarchy();
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp) {
      Object.keys(configuredHierarchy).forEach((key) => {
        if (configuredHierarchy[key]) {
          this.hierarchy[this.contextApp.hierarchy.levels[key]] = configuredHierarchy[key];
        }
      });
    }

    // if (this.filterObj?.selectedHierarchy) {
    //   this.hierarchyId = this.filterObj?.selectedHierarchy.id
    // }
    if (this.filterObj?.asset) {
      this.assetId = this.filterObj?.asset.asset_id
    }




    this.getUptime();
    // this.assetStatic();
  }

  onStartDateChange(value) {
    if (value.target.value != "") {
      this.minDate = new Date(value.target.value);
    }
  }

  getUptime() {
    const custObj = {
      offset: this.currentOffset,
      count: this.currentLimit,
      hierarchy: JSON.stringify(this.hierarchy),
      assetId: this.assetId,
      fromdate: this.uptimeDateFilter.from_date,
      todate: this.uptimeDateFilter.to_date,
    }
    this.loader = true;

    this.upTimeService.getUpTimeHistory(custObj).subscribe((res: any) => {

      this.upTimeHistory = res?.data;
      this.loader = false;
      ;
      this.count += 10;

      if (this.count >= res.totalcount) {
        this.loadMoreVisibility = false
      }


    }, error => {
      this.loader = false;
    })
  }

  getDefaultFilters() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    item.dateOption = "This Month";
    this.uptimeDateFilter.dateOption = item.dateOption;
    if (item.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
      this.uptimeDateFilter.from_date = dateObj.from_date;
      this.uptimeDateFilter.to_date = dateObj.to_date;
      // this.historicalDateFilter.last_n_secs = this.historicalDateFilter.to_date - this.historicalDateFilter.from_date;
    } else {
      this.uptimeDateFilter.from_date = item.from_date;
      this.uptimeDateFilter.to_date = item.to_date;
      // this.historicalDateFilter.last_n_secs = undefined;
    }
    this.uptimeDateFilter.widgets = [];
    this.selectedDateRange = this.uptimeDateFilter.dateOption;
    this.uptimeDateFilter.type = true;
    this.uptimeDateFilter.sampling_format = 'minute';
    this.uptimeDateFilter.sampling_time = 1;
  }

  selectedDate(filterObj) {
    // this.measuredMessageProps = [];
    this.uptimeDateFilter.from_date = filterObj.from_date;
    this.uptimeDateFilter.to_date = filterObj.to_date;
    this.uptimeDateFilter.dateOption = filterObj.dateOption;
    // this.onFilterSelection('', true, false, true, 'callFromSelectedDate');
    // this.onDateFilterSelection();

    // this.uptimeDateFilter.last_n_secs = filterObj.last_n_secs;
    // if (this.filterObj.asset) {
    //   const records = this.commonService.calculateEstimatedRecords(
    //     this.frequency,
    //     this.uptimeDateFilter.from_date,
    //     this.uptimeDateFilter.to_date
    //   );
    //   if (records > this.noOfRecords) {
    //     this.uptimeDateFilter.isTypeEditable = true;
    //   } else {
    //     this.uptimeDateFilter.isTypeEditable = false;
    //   }
    // }
  }

  onTableFunctionCall(obj) { }
  redirectAsset(e) {
    sessionStorage.setItem("filterData", JSON.stringify(this.uptimeDateFilter));
    this.assetService.upTimeFilterData.emit((this.uptimeDateFilter));
    this.router.navigate([`applications/${this.contextApp.app}/assets/${e.assetId}/control-panel`], { fragment: 'asset_uptime' })
  }
}
