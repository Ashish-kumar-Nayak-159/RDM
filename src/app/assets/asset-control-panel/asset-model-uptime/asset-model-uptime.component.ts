import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { UpTimeService } from 'src/app/services/upTime/uptime.service';

@Component({
  selector: 'app-asset-model-uptime',
  templateUrl: './asset-model-uptime.component.html',
  styleUrls: ['./asset-model-uptime.component.css']
})
export class AssetModelUpTimeComponent implements OnInit {
  @Input() asset: any;
  dateFilter: any;
  properties: any = [];
  propertyTableConfig: any = {};
  isPropertiesLoading: boolean = false;
  assetModelData: any = [];
  assetSelectForm: FormGroup;
  selectedAssets: any = {};
  isAPILoading: boolean = false;
  contextApp: any;
  uptimeDateFilter: any = {};
  selectedDateRange: any;
  tileData: any;
  isApplicationListLoading = false;
  tableConfig: any;
  currentOffset = 0;
  currentLimit = 10;
  loader: boolean;
  upTimeHistory: any = [];
  loadMoreVisibility: boolean;
  constructor(
    private toasterService: ToasterService,
    private commonService: CommonService,
    private assetService: AssetService,
    private upTimeService: UpTimeService,
    private changeDetector: ChangeDetectorRef
  ) {

  }

  async ngOnInit(): Promise<void> {
    this.getDefaultFilters();

    this.assetService.upTimeFilterData.subscribe((data) => {
      this.uptimeDateFilter = data;
      this.selectedDateRange = this.uptimeDateFilter.dateOption;
      this.changeDetector.markForCheck();
      console.log(JSON.stringify(this.uptimeDateFilter));

    })
    this.getUptime();

    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();

    // this.assetSelectForm = new FormGroup({
    //   selected_asset: new FormControl("", []),
    // });
    // this.setUpPropertyData();
    // this.getAssetModelData();
    // await this.getAssets(this.contextApp.user.hierarchy);
  }

  getTileName() {
    let selectedItem;
    let assetItem;
    let assetDataItem = {};
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      selectedItem = item.showAccordion;
      assetItem = item.showAccordion;
    });
    debugger
    this.tileData = selectedItem;
    selectedItem.forEach((item) => {
      this.tileData[item.name] = item.value;
    });
    assetItem.forEach((item) => {
      assetDataItem[item.name] = item.value;
    });
  }

  // getAssets(hierarchy) {
  //   return new Promise<void>((resolve1) => {
  //     const obj = {
  //       hierarchy: JSON.stringify(hierarchy),
  //       type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
  //     };
  //     this.assetService.getIPAndLegacyAssets(obj, this.contextApp.app).subscribe((response: any) => {
  //       if (response?.data) {
  //         response.data.forEach((detail) => {
  //           if (detail.type == 'Legacy Asset' && detail.asset_model == this.assetModel.name) {
  //             this.asset.push(detail);
  //           }
  //         })
  //       }
  //       resolve1();
  //     })
  //   });
  // }

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

  filteredHiearchyObj() {
    this.getUptime();
  }

  getUptime() {
    const custObj = {
      offset: this.currentOffset,
      count: this.currentLimit,
      assetId: this.asset.asset_id,
      fromdate: this.uptimeDateFilter.from_date,
      todate: this.uptimeDateFilter.to_date,
    }
    this.loader = true;
    console.log(custObj);
    this.upTimeService.getUpTime(custObj).subscribe((res: any) => {
      console.log(res);
      this.loadMoreVisibility = true;

      this.upTimeHistory = res?.data;
      this.loader = false;
      if (res?.data?.length < this.currentLimit) {
        this.loadMoreVisibility = false
      }

    }, error => {
      this.loader = false;
    })
  }

  onPopup(e) {
    debugger
    this.upTimeService.getUpTimeById(e.id, this.asset.asset_id).subscribe((res: any) => {
      console.log(res);
    })
  }
}