import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import * as datefns from 'date-fns';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import exportFromJSON from 'export-from-json';
declare var $: any;

@Component({
  selector: 'app-daily-reports',
  templateUrl: './daily-reports.component.html',
  styleUrls: ['./daily-reports.component.css']
})
export class DailyReportsComponent implements OnInit {
  filterObj: any = {};
  loadMoreVisible: boolean = false;
  assets: any[] = [];
  allAsset: any;
  decodedToken: any;
  contextApp: any;
  dailyReportsData: any[] = [];
  preOffset = 0;
  contextAppUserHierarchyLength = 0;
  actualHierarchyArr: any;
  preLimit = 10;
  currentLimit = 10;
  apiSubscriptions: Subscription[] = [];
  isReportDataLoading = false;
  configureHierarchy: any = {};
  hierarchyString: any;
  displayHierarchyString: string;
  dailyReportApiLoading: boolean = false;
  originalFilterObj: any = {};
  selectedDateRange: string = '';
  loadingMessage: string = undefined;
  mindate = new Date();
  totalCount = 0;
  datePickerOptions: any = {
    locale: { format: 'YYYY-MM-DD HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    singleDatePicker: true,
    autoApply: true,
    maxDate: new Date(),
    minDate: new Date(),
    endDate: new Date()
  }
  epoch_Date: any;
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  constructor(
    public commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private assetService: AssetService,
    private toasterService: ToasterService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    if (this.commonService.appPrivilegesPermission('RV') && this.commonService.getdecodedToken()?.app === 'Kirloskar' || this.commonService.getdecodedToken()?.app === 'VNHierarchyTests') {
      this.allAsset = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSETS_LIST);
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      this.actualHierarchyArr = this.commonService.getItemFromLocalStorage(CONSTANTS.HIERARCHY_TAGS);
      this.dailyReportsData = [];
      this.loadFromLocalStorage();
      this.getReportDatabySearch();
      if (this.contextApp?.user?.hierarchy) {
        this.contextAppUserHierarchyLength = Object.keys(this.contextApp?.user?.hierarchy)?.length;
      }
      this.apiSubscriptions.push(
        this.activatedRoute.paramMap.subscribe((paramData) => {
          if (paramData.get('applicationId')) {
            this.filterObj.app = this.contextApp.app;
          }
        })
      );
      this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
      this.preOffset = 0;
    }
  }
  loadFromLocalStorage() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    item.dateOption = "Yesterday";
    if (item) {
      if (item?.dateOption) {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        let from_date_convertTODate: any = new Date(dateObj.from_date * 1000);
        let to_date_convertTODate = new Date(dateObj.to_date * 1000);
        to_date_convertTODate.setDate(to_date_convertTODate.getDate() - 7);
        this.datePickerOptions.minDate = to_date_convertTODate;
        this.datePickerOptions.maxDate = from_date_convertTODate;
        this.datePickerOptions.startDate = from_date_convertTODate;
        this.selectedDateRange = item.dateOption;
        this.filterObj.from_date = datefns.format(from_date_convertTODate, "yyyy-MM-dd").toString();
        this.filterObj.to_date = datefns.format(from_date_convertTODate, "yyyy-MM-dd").toString();
      }
    }
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
  }

  getReportDatabySearch() {
    this.isReportDataLoading = true;
    let newHierarchy = {};
    this.contextApp?.hierarchy?.levels.forEach((level, index) => {
      newHierarchy[level] = index != 0 ? this.configureHierarchy[index] : this.contextApp.app;
    });

    let obj = {
      offset: this.preOffset,
      count: this.preLimit,
      hierarchy: JSON.stringify(Object.keys(this.configureHierarchy)?.length <= 0 ? this.contextApp?.user?.hierarchy : newHierarchy),
      fromDate: this.filterObj?.from_date,
      toDate: this.filterObj?.to_date
    }

    this.dailyReportApiLoading = true;
    this.loadingMessage = "Loading Data, Please Wait...";
    this.loadMoreVisible = true;
    this.assetService.getDailyReportSubscription(this.contextApp?.app, obj).subscribe((response: any) => {
      if (response?.data) {
        let resData = response?.data;
        this.dailyReportApiLoading = false;
        this.dailyReportsData = [
          ...this.dailyReportsData,
          ...resData
        ]
        this.loadMoreVisible = this.dailyReportsData?.length < response?.totalcount;
      }
    },
      (error: any) => {
        this.dailyReportApiLoading = false;
        this.loadMoreVisible = false;
        this.toasterService.showError(error?.message, "Error");
      })
  }

  onSaveHierarchy(save: any) {
    this.preOffset = 0;
    this.preLimit = this.currentLimit;
    this.configureHierarchy = JSON.parse(JSON.stringify(save));
  }
  onClearHierarchy(clear: any) {
    this.preLimit = this.currentLimit;
    this.configureHierarchy = JSON.parse(JSON.stringify(clear));
  }
  isTabVisible(report: any) {
    let assetType: string;
    let menuItems: any = [];
    this.allAsset.forEach((asset: any) => {
      if (asset?.length != 0) {
        if (report?.assetId?.toLowerCase() === asset?.asset_id?.toLowerCase()) {
          assetType = asset.type;
          if (asset?.type?.toLowerCase() === CONSTANTS?.NON_IP_ASSET?.toLowerCase()) {
            if (this.contextApp?.menu_settings?.legacy_asset_control_panel_menu?.length > 0) {
              menuItems = this.contextApp.menu_settings.legacy_asset_control_panel_menu;
            }
            else {
              menuItems = CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST;
            }
          }
          else {
            if (this.contextApp?.menu_settings?.asset_control_panel_menu?.length > 0) {
              menuItems = this.contextApp.menu_settings.asset_control_panel_menu;
            }
            else {
              menuItems = CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST;
            }
          }
        }
      }
    })
    let selectedMenu: any;
    let ViewObj = {
      type: assetType,
      visible: false
    }
    if (menuItems?.length > 0) {
      menuItems.forEach((menu) => {
        if (menu?.url === '#daily_report') {
          selectedMenu = menu;
        }
      });
    }
    if (selectedMenu?.url === '#daily_report' && selectedMenu?.visible) {
      ViewObj.visible = true;
      return ViewObj;
    }
    else {
      ViewObj.visible = false;
      return ViewObj;
    }
  }

  dailyReportViewMore(report: any) {
    if (report?.assetId) {
      const obj = {
        dateOption: "Custom Range",
        from_date: this.filterObj.from_date,
        to_date: this.filterObj.to_date,
        epoch_from_date: this.selectedDateRange === 'Yesterday' ? this.commonService.convertDateToEpoch(this.filterObj.from_date) : this.epoch_Date.start,
        epoch_to_date: this.selectedDateRange === 'Yesterday' ? this.commonService.convertDateToEpoch(this.filterObj.to_date) : this.epoch_Date.end
      }
      sessionStorage.setItem(CONSTANTS.DAILY_REPORT_DATE_FILTER, JSON.stringify(obj));
      this.router.navigate([`/applications/${this.contextApp.app}/assets/${report.assetId}/control-panel`], { fragment: 'daily_report' });
    }
    else {
      this.toasterService.showError('Asset Id Not Found', 'Error');
    }
  }
  selectedDate(selectedDateObj: any) {
    this.selectedDateRange = "Custom Range";
    this.epoch_Date = selectedDateObj;
    const from_date = datefns.getUnixTime(new Date(selectedDateObj.start));
    const to_date = datefns.getUnixTime(new Date(selectedDateObj.end));
    let new_from_date = new Date(from_date * 1000);
    let new_to_date = new Date(to_date * 1000);
    this.filterObj.from_date = datefns.format(new_from_date, "yyyy-MM-dd").toString();
    this.filterObj.to_date = datefns.format(new_to_date, "yyyy-MM-dd").toString();
    this.preOffset = 0;
  }

  saveExcel() {
    if (this.dailyReportsData?.length) {
      const fileName = 'DPR-' + this.contextApp?.app + this.filterObj?.from_date;
      const exportType = exportFromJSON.types.xls;
      let data = [];
      $('#downloadReportModal').modal({ backdrop: 'static', keyboard: false, show: true });
      this.loadingMessage = 'Preparing Daily Report Data...';

      setTimeout(() => {
        this.dailyReportsData.forEach((report) => {
          const datePipe = new DatePipe('en-US');
          data.push({
            'Asset ID': report?.assetId ? report?.assetId : report?.pgsNo,
            'Asset Name': report?.assetName ? report.assetName : report?.assetId,
            'Date': report?.reportDate ? datePipe.transform(report?.reportDate, 'dd/MMM/yyyy').toLowerCase() : report?.reportDate,
            'FM-101 (Suction) Diff. Kg': report?.suctionDiff,
            'FM-102 (Discharge) Diff. Kg': report?.dischargeDiff,
            'FM-103 (IC) Diff. Kg': report?.fM103Diff,
            'Vent Diff. Kg': report?.ventDiff,
            'Total Diff. FM(101-102-103-Vent) Kg': report?.totalDiff,
            '% Volumetric Eff.': report?.volumetricEfficiency,
            'Fuel Consuption KG/HR': report?.fuelConsumption,
            'Fuel Consumption Per Kg': report?.fuelConsumptionPerKG,
            'Power Consumption KW/HR': report?.powerConsumption,
            'Power Consumption KW/Kg': report?.powerConsumptionPerKG,
            'Error (%)': report?.error
          })
        });
        exportFromJSON({ data, fileName, exportType });
        this.cancelDownloadModal();
      }, 1000);
    }
    else {
      this.toasterService.showError('Daily Report Not Avilable.', 'Error In Export Excel');
    }
  }

  cancelDownloadModal() {
    this.loadingMessage = undefined;
    $('#downloadReportModal').modal('hide');
  }
  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
