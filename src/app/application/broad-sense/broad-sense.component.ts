import { Component, OnInit} from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import * as data1 from './HevanTstGateway_1701826284773_1.json';
import * as data2 from './HevanTstGateway_1701826284773_9.json';
import * as data3 from './HevanTstGateway_1701827183135.json';
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
  decodedToken: any;
  constructor(public commonService: CommonService) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.allData = [data1['default'], data2['default'], data3['default']]
    this.dataArray = [181, 182, 183, 184, 185];
    this.frequencyFilter = [
      {
        min: 0,
        max: 6000,
        message: 'ISO 0Hz-6kHz'
      },
      {
        min: 0,
        max: 120,
        message: 'ISO 0Hz-120Hz'
      },
      {
        min: 2,
        max: 1000,
        message: 'ISO 2Hz-1kHz'
      },
      {
        min: 500,
        max: 6000,
        message: 'ISO 500Hz-6kHz'
      },
    ]
    this.dataFilterType = ['Acceleration', 'Velocity'];
    this.chartTypes = ['Frequency', 'Time'];
    this.waveType = ['Time', 'Frequency'];
    this.allAssets = this.commonService.getItemFromLocalStorage(CONSTANTS.ALL_ASSETS_LIST);
  }
  onSelectAssetSelection() {
    this.actualFilterData = ({ asset_id: this.selectedAsset['asset_id'], display_name: this.selectedAsset['display_name'], gateway_id: this.selectedAsset['gateway_id'], type: this.selectedAsset['type'] })
  }

  filterSearch() {
    this.searchData = undefined;
    this.filterData = this.actualFilterData;
    this.searchData = this.allData.filter((item: any) => item?.asset_id == this.filterData['asset_id'] && this.filterData?.data_Type.includes(item?.data[0]?.m['181_ms']) && Object.keys(item?.data[0]?.m)[0].includes(this.filterData['sId']));
    this.reloadCharts = !this.reloadCharts;
  }

}
