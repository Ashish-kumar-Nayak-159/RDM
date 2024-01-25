import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import * as datefns from 'date-fns';
import { Subscription } from 'rxjs/internal/Subscription';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ToasterService } from 'src/app/services/toaster.service';
declare var $: any;
@Component({
  selector: 'app-broad-sense',
  templateUrl: './broad-sense.component.html',
  styleUrls: ['./broad-sense.component.css']
})
export class BroadSenseComponent implements OnInit {
  dataArray: any = [];
  chartTypes: any = [];
  dataFilterType: any = [];
  waveType; any = [];
  actualFilterData: any = [];
  filterData: any = [];
  onSelectChartType: any;
  allAssets: any;
  selectedAsset: any;
  allData: any;
  searchData: any;
  frequencyFilter: any;
  reloadCharts = false;
  filterObj: any = {};
  selectedDateRange: string;
  originalFilterObj: any = {
    alwaysShowCalendars: false,
    singleDatePicker: false
  };
  decodedToken: any;
  isTelemetryLoading = false;
  apiSubscriptions: Subscription[] = [];
  telemetryList: any[] = [];
  actualTelemetryList: any[] = [];
  alertsList: any[] = [];
  fileData: any;
  isAlertLoading = false;
  isFilterSelected = false;
  sasToken = environment.blobKey;
  isFileDataLoading: boolean;
  contextApp: any;
  constructor(public commonService: CommonService, private cd: ChangeDetectorRef,
    private assetService: AssetService,
    private route: ActivatedRoute,
    private toasterService: ToasterService) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.contextApp = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.SELECTED_APP_DATA));
    this.dataArray = [181, 182, 183, 184];
    this.frequencyFilter = [
      {
        min: 0,
        max: 6000,
        message: 'ISO 0Hz-6kHz',
        data_size: '0-6000'
      },
      {
        min: 0,
        max: 120,
        message: 'ISO 0Hz-120Hz',
        data_size: '0-120'

      },
      {
        min: 2,
        max: 1000,
        message: 'ISO 2Hz-1kHz',
        data_size: '2-1000'
      },
      {
        min: 500,
        max: 6000,
        message: 'ISO 500Hz-6kHz',
        data_size: '500-6000'
      },
    ]
    this.dataFilterType = ['Acceleration', 'Velocity'];
    this.chartTypes = ['Frequency', 'Time'];
    this.waveType = ['Time', 'Frequency'];
    this.allAssets = this.commonService.getItemFromLocalStorage(CONSTANTS.ALL_ASSETS_LIST);
    this.filterObj.app = this.decodedToken.app;
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.filterObj.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.filterObj.from_date = dateObj.from_date;
        this.filterObj.to_date = dateObj.to_date;
      } else {
        this.filterObj.from_date = item.from_date;
        this.filterObj.to_date = item.to_date;
      }
    }

    if (!this.filterObj.count) {
      this.filterObj.count = 1000;
    }
    this.originalFilterObj = {};
    this.originalFilterObj = { ...this.filterObj };

  }
  onSelectAssetSelection() {
    this.actualFilterData = ({ asset_id: this.selectedAsset['asset_id'], display_name: this.selectedAsset['display_name'], gateway_id: this.selectedAsset['gateway_id'], type: this.selectedAsset['type'] })
    this.filterObj.asset_Id = this.selectedAsset['asset_id'];
    delete this.actualFilterData?.sId;
    this.telemetryList = undefined;
    this.actualTelemetryList = undefined;
    this.searchData = undefined;
    delete this.actualFilterData?.chart_Type;
    delete this.actualFilterData?.frequency;
    delete this.actualFilterData?.uploaded_date;
  }

  async onSelectSensorDate() {
    delete this.actualFilterData?.chart_Type;
    delete this.actualFilterData?.frequency;
    delete this.actualFilterData?.uploaded_date;
    delete this.actualFilterData?.data_Type;
    this.searchData = undefined;
    if (this.actualFilterData?.asset_id) {
      await this.searchTelemetry(this.filterObj);
    }
    else {
      this.actualFilterData.sId = null;
      this.toasterService.showError('Please Select Asset', '');
    }
  }
  onSelectDataType(){
    this.searchData = undefined;
    delete this.actualFilterData?.uploaded_date;
    delete this.actualFilterData?.frequency;
    delete this.actualFilterData?.chart_Type;
    if(this.actualFilterData?.sId && this.actualFilterData?.asset_id){
      if (this.actualTelemetryList?.length && this.actualFilterData?.data_Type) {
        const data = this.actualTelemetryList.filter( (item: any) => {
          return item?.file_path_array[3] == this.actualFilterData.data_Type
        })
        this.telemetryList = data;
      }
    }
  }
  onSelectFrequency() {
    this.searchData = undefined;
    delete this.actualFilterData?.uploaded_date;
    delete this.actualFilterData?.chart_Type;
    if(this.actualTelemetryList?.length){
      const data = this.actualTelemetryList. filter((item: any)=>{
        return (this.actualFilterData?.frequency?.data_size == item?.file_path_array[2]) && (item?.file_path_array[3] == this.actualFilterData.data_Type)
      })
      this.telemetryList = data;
    }
  }
  uploadDateFilter: any;
  onChangeUploadedDate(data) {
    this.uploadDateFilter = data;
    this.searchData = undefined;
    this.downloadFile(data);

  }


  async searchTelemetry(filterObj, updateFilterObj = true) {
    this.isFilterSelected = true;
    this.isTelemetryLoading = true;
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    }
    const obj = { ...filterObj };

    if (!obj?.from_date || !obj?.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Cached Telemetry');
      this.isTelemetryLoading = false;
      this.isFilterSelected = false;
      return;
    }
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
      pagefilterObj['from_date'] = obj.from_date;
      pagefilterObj['to_date'] = obj.to_date;
      pagefilterObj['dateOption'] = obj.dateOption;
      this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, pagefilterObj);
    }
    delete obj.dateOption;
    this.filterObj = filterObj;
    this.apiSubscriptions.push(
      this.assetService.getGatewayCachedTelemetry(obj).subscribe(
        (response: any) => {
          if (response && response?.data) {
            this.telemetryList = response.data;
            this.actualTelemetryList = response.data;
            this.actualTelemetryList.forEach(async (item) => {
              item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date);
              item.local_upload_date = this.commonService.convertUTCDateToLocal(item.upload_date);
              if (this.allAssets?.length > 0 && item?.asset) {
                const assetObj = this.allAssets.find((asset) => asset.asset_id === item.asset_id);
                item.display_name = assetObj?.display_name || item.asset_id;
              } else {
                item.display_name = item.asset_id;
              }
            });
            this.filterMainData(this.actualTelemetryList);
          }
          this.isTelemetryLoading = false;
        },
        (error) => (this.isTelemetryLoading = false)
      )
      );
    }

    async filterMainData(telemetryList){
    if(telemetryList?.length){
      this.actualTelemetryList = this.actualTelemetryList.filter((item) => {
        item['upload_date']= this.commonService.convertUTCDateToLocalDate(item.upload_date,'MMM dd yyyy, hh:mm:ss a');
        if(item?.file_path){
          item['file_path_array']= item?.file_path.split('\\');
          if(item['file_path_array'][4] && this.actualFilterData['sId'] && item['file_path_array'][4] == this.actualFilterData['sId']){
            return item;
          }
        }
      });
      this.telemetryList = this.actualTelemetryList;
    }else {this.actualTelemetryList = []};

  }

  downloadFile(fileObj) {
    return new Promise<void>((resolve) => {
      this.isFileDataLoading = true;
      this.fileData = undefined;
      const url =
        environment.blobURL +
        environment.cachedTelemetryContainer +
        '/' +
        fileObj.file_path +
        '/' +
        fileObj.file_name +
        this.sasToken;
      let method = this.commonService.getFileOriginalData(url);
      this.apiSubscriptions.push(
        method.subscribe(
          (response) => {
            this.fileData = response;
            this.filterData = undefined;
            resolve();
          },
          (error) => (this.isFileDataLoading = false)
        )
      );
    });
  }

  filterSearch() {
    this.searchData = this.fileData;
    this.filterData = this.actualFilterData;
    this.reloadCharts = !this.reloadCharts;
  }

  selectedDate(filterObj: any) {
    this.searchData = undefined;
    delete this.actualFilterData?.chart_Type;
    delete this.actualFilterData?.frequency;
    delete this.actualFilterData?.uploaded_date;
    delete this.actualFilterData?.data_Type;

    if(this.actualFilterData ?.asset_id){
      this.originalFilterObj.from_date = this.filterObj.from_date = filterObj.from_date;
      this.originalFilterObj.to_date = this.filterObj.to_date = filterObj.to_date;
      this.originalFilterObj.dateOption = this.filterObj.dateOption = filterObj.dateOption;
      // this.originalFilterObj['dateFilter']= this.filterObj;
      this.searchTelemetry(this.filterObj);
    }
    else{
      this.originalFilterObj.dateOption = '';
    this.toasterService.showError('Please Select Asset', '');
    }
    // this.filterObj.last_n_secs = filterObj.last_n_secs;
  }

  ngAfterViewInit() {
    if (this.filterObj.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.filterObj.dateOption;
    } else {
      this.selectedDateRange = datefns.format(datefns.fromUnixTime(this.filterObj.from_date),"dd-MM-yyyy HH:mm") + ' to ' + datefns.format(datefns.fromUnixTime(this.filterObj.to_date),"dd-MM-yyyy HH:mm");
    }
    this.cd.detectChanges();
  }

}
