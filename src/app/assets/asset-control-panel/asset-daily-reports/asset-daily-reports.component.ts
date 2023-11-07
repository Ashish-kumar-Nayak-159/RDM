import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { AssetService } from 'src/app/services/assets/asset.service';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';
import * as datefns from 'date-fns';
import { ToasterService } from 'src/app/services/toaster.service';
import exportFromJSON from 'export-from-json';
declare var $: any;
@Component({
  selector: 'app-asset-daily-reports',
  templateUrl: './asset-daily-reports.component.html',
  styleUrls: ['./asset-daily-reports.component.css']
})
export class AssetDailyReportsComponent implements OnInit {
  @Input() asset: Asset = new Asset();
  dailyReportFilterDate: any;
  dailyReportsData: any = [];
  preOffset = 0;
  preLimit = 20;
  uptimeDateFilter: any = {};
  apiResponseSubscription: Subscription[] = [];
  datePickerOptions: any = {
    locale: { format: 'YYYY-MM-DD' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: new Date(),
    timePicker: false,
    ranges: CONSTANTS.DATE_OPTIONS_CUSTOM_RANGE,
  }
  selectedDateRange: string;
  contextApp: any;
  loadingMessage: string;
  filterObj: any = {};
  originalFilterObj: any = {};
  dailyReportApiLoading: boolean = false;
  allAssets: any;
  loadMoreVisible: boolean = false;
  selectedAsstDetails: any;
  totalCount: any = 0;
  constructor(
    private activatedRoute: ActivatedRoute,
    public commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    if(this.commonService.appPrivilegesPermission('RV') && this.commonService.getdecodedToken()?.app === 'Kirloskar' || this.commonService.getdecodedToken()?.app === 'VNHierarchyTests'
    ){
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      this.allAssets = this.commonService.getItemFromLocalStorage(CONSTANTS.ALL_ASSETS_LIST);
      this.apiResponseSubscription.push(
        this.allAssets.forEach((item) => {
          if (this.asset?.asset_id === item?.asset_id) {
            this.selectedAsstDetails = item;
          }
        }),
        this.activatedRoute.paramMap.subscribe((paramData) => {
          if (paramData?.get('applicationId')) {
            this.filterObj.app = this.contextApp.app;
          }
        })
      );
      this.datePickerOptions.maxDate.setDate(this.datePickerOptions.maxDate.getDate() - 1);
     this.loadFromLocalStorage();
      this.getReportDatabySearch();
    }
  }
  loadFromLocalStorage() {
    return new Promise<void>((resolve) => {
      this.dailyReportFilterDate =sessionStorage.getItem(CONSTANTS.DAILY_REPORT_DATE_FILTER);
      const reportFilter = JSON.parse(this.dailyReportFilterDate);
      if(reportFilter){
        this.filterObj.from_date = reportFilter?.from_date;
        this.filterObj.to_date = reportFilter?.to_date;
        this.filterObj.dateOption = reportFilter?.from_date;
        const obj ={
          app: this.filterObj.app,
          dateOption:reportFilter?.from_date ,
          from_date:  this.commonService.convertDateToEpoch(reportFilter.epoch_from_date),
          to_date:  this.commonService.convertDateToEpoch(reportFilter.epoch_to_date)
        }
        this.selectedDateRange = obj.from_date + " to " + obj.to_date;
        this.originalFilterObj = JSON.parse(JSON.stringify(obj));
  
      }else{
        let data = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
      if (data) {
        data.dateOption = "Yesterday";
        if (data?.dateOption) {
          let dateObj = this.commonService.getMomentStartEndDate(data.dateOption);
          let from_date_convertTODate = new Date(dateObj.from_date * 1000);
          let to_date_convertTODate = new Date(dateObj.to_date * 1000);
  
          this.filterObj.from_date = datefns.format(from_date_convertTODate, "yyyy-MM-dd");
          this.filterObj.to_date = datefns.format(to_date_convertTODate, "yyyy-MM-dd");
          this.selectedDateRange = data.dateOption;
          const obj ={
            app: this.filterObj.app,
            dateOption:data?.dateOption,
            from_date:  dateObj.from_date,
            to_date: dateObj.to_date
          }
          this.selectedDateRange = data?.dateOption;
          this.originalFilterObj = JSON.parse(JSON.stringify(obj));
        }
  
      }
      }
      // this.getReportDatabySearch();
      resolve();

    });

  }  
  dateAdjustment(filteredDate, type= undefined){
    let date = new Date (filteredDate * 1000);
    const datePipe = new DatePipe('en-US');
    date.setDate(date.getDate()- 1);
    const formatDate = datePipe.transform(date, 'yyyy-MM-dd').toLowerCase();
    return type === 'Last Month' ? datefns.format(datefns.fromUnixTime(filteredDate - 1000), "yyyy-MM-dd") : 
    type !== 'rowData' ? formatDate : datefns.format(datefns.fromUnixTime(filteredDate), "yyyy-MM-dd") ;
  }

  selectedDateApply(filteredDate: any) {
    let fromDateConvert =this.dateAdjustment(filteredDate.from_date,'rowData');
    let toDateConvert = this.dateAdjustment(filteredDate.to_date, 'rowData');
    this.filterObj.from_date = fromDateConvert;
    this.filterObj.to_date = toDateConvert;
    if(filteredDate.dateOption!== "Custom Range"){
      this.filterObj.to_date = this.dateAdjustment(filteredDate.to_date , filteredDate.dateOption == "Last Month" ? 'Last Month' :  '' );
      if(filteredDate.dateOption == 'Last 30 Days'){
        this.filterObj.from_date = this.dateAdjustment(filteredDate.from_date );
      }
      this.selectedDateRange = filteredDate.dateOption;
    }else{
      this.selectedDateRange = fromDateConvert + " to " + toDateConvert;
    }
    const obj ={
      app: this.filterObj.app,
      dateOption:filteredDate?.dateOption,
      from_date:  filteredDate.from_date,
      to_date: filteredDate.to_date
    }
    this.originalFilterObj = JSON.parse(JSON.stringify(obj));
  }
  getReportDatabySearch() {
    const obj = {
      offset: this.preOffset,
      count: this.preLimit,
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
      assetId: this.asset?.asset_id,
      fromDate: this.filterObj.from_date,
      toDate: this.filterObj.to_date
    }
    this.dailyReportApiLoading = true;
    this.loadingMessage = 'Loading API Data , Please wait';
    this.loadMoreVisible = true;
    this.assetService.getDailyReportSubscription(this.contextApp?.app, obj).subscribe((response: any) => {
      if (response?.data) {
        this.totalCount = response?.totalCount;
        if (response?.data?.length < this.preLimit) {
          this.loadMoreVisible = false;
        }
        else {
          this.loadMoreVisible = true;
        }
        this.dailyReportsData = [
          ... this.dailyReportsData,
          ...response.data
        ]
        this.dailyReportApiLoading = false;
      }
    },
      (error) => {
        this.loadMoreVisible = false;
        this.dailyReportApiLoading = false;
        this.toasterService.showError(error.message, 'Daily Report Error');
      });

  }
  saveAsExcel() {
    if(this.dailyReportsData?.length){
      const fileName = 'DPR -' + this.selectedAsstDetails?.display_name ? this.selectedAsstDetails.display_name : this.selectedAsstDetails?.asset_id + '-' + this.filterObj.from_date + '-' + this.filterObj.to_date;
      const exportType = exportFromJSON.types.xls;
      let data = [];
      $('#downloadReportModel').modal({ backdrop: 'static', keyboard: false, show: true });
      this.loadingMessage = "Preparing daily Report Data...";
      const datePipe = new DatePipe('en-US');
      setTimeout(() => {
        this.dailyReportsData?.forEach((reports: any) => {
          data.push({
            'Asset ID': reports?.assetId,
            'Asset Name': reports?.assetName,
            'Date': datePipe.transform(reports?.reportDate, 'dd/MMM/yyyy').toLowerCase(),
            'FM-101 (Suction) Diff. Kg': reports?.suctionDiff,
            'FM-102 (Discharge) Diff. Kg': reports?.dischargeDiff,
            'FM-103 (IC) Diff. Kg': reports?.fM103Diff,
            'Vent Diff. Kg': reports?.ventDiff,
            'Total Diff. FM(101-102-103-Vent) Kg': reports?.totalDiff,
            '% Volumetric Eff.': reports?.volumetricEfficiency,
            'Fuel Consuption KG/HR': reports?.fuelConsumption,
            'Power Consumption KW/HR': reports?.powerConsumption,
            'Error (%)': reports?.error
  
          })
        })
        exportFromJSON({ data, fileName, exportType });
        $('#downloadReportModel').modal('hide');
      }, 1000);
    }
    else{
      this.toasterService.showError( 'Daily Report Not Avilable.' , 'Error In Export Excel');
    }
  }

  cancelDownloadModal() {
    this.loadingMessage = undefined;
    $('#downloadReportModal').modal('hide');
  }
  ngOnDestroy(){
    sessionStorage.removeItem(CONSTANTS.DAILY_REPORT_DATE_FILTER);
  }

}
