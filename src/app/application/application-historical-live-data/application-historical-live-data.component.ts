import { Component, OnInit,ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-application-historical-live-data',
  templateUrl: './application-historical-live-data.component.html',
  styleUrls: ['./application-historical-live-data.component.css']
})
export class ApplicationHistoricalLiveDataComponent implements OnInit {
  isTelemetryDataLoading = false;
  assets: any[] = [];
  filterObj: any = {};
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  decodedToken: any;
  userData: any;
  defaultAppName = environment.app;
  contextApp: any;
  apiSubscriptions: Subscription[] = [];
  frequency: any;
  historicalDateFilter: any = {};
  noOfRecords = CONSTANTS.NO_OF_RECORDS;
  selectedDateRange: string;
  isFilterSelected = false;
  sampleCountValue = 0;
  originalFilter: any;
  telemetryObj: any;
  apiTelemetryObj: any;
  widgetStringFromMenu: string;
  tileData: any;
  historicalCombineWidgets:any[] = [];
  assetWiseTelemetryData = [];
  propertyList: any[] = [];




  constructor(
    private commonService:CommonService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService
  ) { }

  async ngOnInit(): Promise<void> {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.getTileName();
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    this.historicalDateFilter.dateOption = item.dateOption;
    if (item.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
      this.historicalDateFilter.from_date = dateObj.from_date;
      this.historicalDateFilter.to_date = dateObj.to_date;
      // this.historicalDateFilter.last_n_secs = this.historicalDateFilter.to_date - this.historicalDateFilter.from_date;
    } else {
      this.historicalDateFilter.from_date = item.from_date;
      this.historicalDateFilter.to_date = item.to_date;
      // this.historicalDateFilter.last_n_secs = undefined;
    }
    this.historicalDateFilter.widgets = [];
    this.selectedDateRange = this.historicalDateFilter.dateOption;
    this.historicalDateFilter.type = true;
    this.historicalDateFilter.sampling_format = 'minute';
    this.historicalDateFilter.sampling_time = 1;

    const filterObj = {
      epoch: true,
      app: this.contextApp.app,
      asset_id: 'PrefecturalSkatingRinkCT_CellA',
      from_date: 1665314220,
      to_date: 1667819820,
      measured_message_props : 'T001,T002',
      partition_key: 'PrefecturalSkatingRinkCT_CellA',
      order_dir: 'ASC',
      sampling_time: 1*60,
      sampling_format : 'minute'

    }
    this.assetService.getAssetSamplingTelemetry(filterObj, this.contextApp.app).subscribe((response)=>{
      if(response && response?.data){
        this.assetWiseTelemetryData = response?.data;
         console.log('tel',this.assetWiseTelemetryData)
      }
    });
  
    await this.getAssets(this.contextApp.user.hierarchy);

    const obj = {
      app: this.contextApp.app,
      name: "Cooling Tower Model V1",
    };
 
    this.assetModelService.getAssetsModelProperties(obj).subscribe(
      (response: any) => {
        this.propertyList = response.properties.measured_properties
          ? response.properties.measured_properties
          : [];
        response.properties.edge_derived_properties = response.properties.edge_derived_properties
          ? response.properties.edge_derived_properties
          : [];
        response.properties.cloud_derived_properties = response.properties.cloud_derived_properties
          ? response.properties.cloud_derived_properties
          : [];
        response.properties.edge_derived_properties.forEach((prop) => {
          prop.type = 'Edge Derived Properties';
          this.propertyList.push(prop);
        });
        response.properties.cloud_derived_properties.forEach((prop) => {
          prop.type = 'Cloud Derived Properties';
          this.propertyList.push(prop);
        });
        // this.derivedKPIs.forEach((kpi) => {
        //   const obj: any = {};
        //   obj.type = 'Derived KPIs';
        //   obj.name = kpi.name;
        //   obj.json_key = kpi.kpi_json_key;
        //   obj.json_model = {};
        //   obj.json_model[obj.json_key] = {};
        //   this.propertyList.push(obj);
        // });
        // resolve1();
        console.log("propList",this.propertyList);
      },
      (error) => (this.isTelemetryDataLoading = false)
    )

  }
  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.page === 'Live Data') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
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
              this.filterObj.asset = this.assets[0];
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
    const frequencyArr = [];
    frequencyArr.push(asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
    frequencyArr.push(asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
    frequencyArr.push(asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
    this.frequency = this.commonService.getLowestValueFromList(frequencyArr);
    if (this.historicalDateFilter.from_date && this.historicalDateFilter.to_date) {
      // this.onChangeOfAsset(this.filterObj.asset);
      const records = this.commonService.calculateEstimatedRecords(
        this.frequency,
        this.historicalDateFilter.from_date,
        this.historicalDateFilter.to_date
      );
      if (records > this.noOfRecords) {
        this.historicalDateFilter.isTypeEditable = true;
      } else {
        this.historicalDateFilter.isTypeEditable = false;
      }
    }
  }

  async onFilterSelection(filterObj, updateFilterObj = true, historicalWidgetUpgrade = false, isFromMainSearch = true) {
   
    console.log('filterobj',this.filterObj)
    if(this.filterObj?.asset){
      const params = {
        app: this.contextApp.app,
        name: this.filterObj?.asset?.asset_model
      };
  
      this.assetModelService.getAssetsModelLayout(params).subscribe((response:any)=>{
        this.historicalCombineWidgets = response?.historical_widgets;
      })
    }
    else{
      this.historicalCombineWidgets = []
      this.toasterService.showError('Asset selection is required', 'Historical & Live Telemetry');
    }

  }

  onClearHierarchy() {
  
  }

  onSaveHierachy() {
    this.historicalDateFilter.widgets = [];
    this.selectedDateRange = this.historicalDateFilter.dateOption;
    this.historicalDateFilter.type = true;
    this.historicalDateFilter.sampling_format = 'minute';
    this.historicalDateFilter.sampling_time = 1;

  }

}
