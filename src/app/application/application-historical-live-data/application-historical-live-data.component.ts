import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { environment } from 'src/environments/environment';
import * as datefns from 'date-fns';


@Component({
  selector: 'app-application-historical-live-data',
  templateUrl: './application-historical-live-data.component.html',
  styleUrls: ['./application-historical-live-data.component.css']
})
export class ApplicationHistoricalLiveDataComponent implements OnInit, OnDestroy {
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
  historicalCombineWidgets: any[] = [];
  newHistoricalCombineWidets: any[] = [];
  widgetBySplice: any[] = [];
  assetWiseTelemetryData = [];
  isAssetWiseTelemetryData: boolean = false;
  allTelemetryData: any[] = [];
  propertyList: any[] = [];
  measuredMessageProps: any[] = [];
  live_Date = false;
  signalRTelemetrySubscription: any;
  historical_livedata = [];
  selectDateFlag: boolean = false;
  myPromise: any;
  isLoadingData: boolean = false;
  @ViewChild('historicalLivechart') historicalLivechart: ElementRef;
  sameAsset: string;
  isAssetSelected: boolean = false;



  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private signalRService: SignalRService
  ) { }

  async ngOnInit(): Promise<void> {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.getTileName();
    this.getDefaultFilters();
    await this.getAssets(this.contextApp.user.hierarchy);
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
    if (this.sameAsset != this?.filterObj?.asset?.asset_id) {
      if (this.filterObj?.asset) {
        this.isFilterSelected = true
        const obj = {
          app: this.contextApp.app,
          name: this?.filterObj?.asset?.asset_model,
        };
        this.sameAsset = this.filterObj?.asset?.asset_id
        this.propertyList = [];
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
          },
          (error) => (this.isTelemetryDataLoading = false)
        )
        this.assetWiseTelemetryData = []
        this.historicalCombineWidgets = []
        this.newHistoricalCombineWidets = []
        // this.widgetBySplice = []
        // this.assetModelService.getAssetsModelLayout(obj).subscribe((response: any) => {
        //   this.newHistoricalCombineWidets = response?.historical_widgets;
        //   this.historicalCombineWidgets = this.newHistoricalCombineWidets.slice(0,2)
        // })
        this.myPromise = new Promise((resolve, reject) => {
          this.assetModelService.getAssetsModelLayout(obj).subscribe((response: any) => {
            this.newHistoricalCombineWidets = response?.historical_widgets;
            this.historicalCombineWidgets = this.newHistoricalCombineWidets.slice(0, 2)
            this.isAssetSelected = true
            resolve('');
          })
        });
        // this.widgetBySplice = this.newHistoricalCombineWidets.slice(0,2)
        //  if(this.selectDateFlag){
        //   this.widgetBySplice = this.historicalCombineWidgets
        //  }

        this.myPromise.then(() => {
          this.measuredMessageProps = [];
          if (this.newHistoricalCombineWidets) {
            this.newHistoricalCombineWidets?.forEach((widget) => {
              widget?.y1axis?.forEach((item) => {
                if (item?.json_key && !this.measuredMessageProps?.includes(item?.json_key)) {
                  this.measuredMessageProps?.push(item?.json_key);
                }
              })
              widget?.y2axis?.forEach((item) => {
                if (item?.json_key && !this.measuredMessageProps?.includes(item?.json_key)) {
                  this.measuredMessageProps?.push(item?.json_key);
                }
              })
            })
            this.SubscribeLiveTelemetryOnDateOption(this.historicalDateFilter?.to_date);
            const filterObj = {
              epoch: true,
              app: this.contextApp.app,
              asset_id: this.filterObj?.asset?.asset_id,
              partition_key: this.filterObj?.asset?.partition_key,
              from_date: this.historicalDateFilter?.from_date,
              to_date: this.historicalDateFilter?.to_date,
              order_dir: 'ASC',
              measured_message_props: this.measuredMessageProps,
              sampling_time: 1,
              sampling_format: 'minute'

            }
            this.isLoadingData = true;
            this.isAssetWiseTelemetryData = true;
            this.assetService.getAssetSamplingTelemetry(filterObj, this.contextApp.app).subscribe((response) => {
              if (response && response?.data) {
                response?.data.forEach((item) => {
                  item.message_date = this.commonService.convertUTCDateToLocal(item.message_date);
                  item.message_date_obj = new Date(item.message_date);
                });
                this.assetWiseTelemetryData = response?.data
                this.selectDateFlag = false;
                this.isLoadingData = false;
                this.isAssetWiseTelemetryData = false;
              }
              else {
                this.selectDateFlag = false;
                this.isLoadingData = false;
                this.assetWiseTelemetryData = []
                this.isAssetWiseTelemetryData = false;
              }
            });
          }
        })

      }
      else {
        this.isAssetSelected = false;
        this.historicalCombineWidgets = [];
        this.assetWiseTelemetryData = [];
        this.propertyList = [];
        this.measuredMessageProps = [];
        this.toasterService.showError('Asset selection is required', 'Historical & Live Telemetry');
      }
    }

  }

  onClearHierarchy() {
    this.isAssetSelected = false;
    this.isFilterSelected = false;
    this.historicalCombineWidgets = [];
    this.historical_livedata = [];
    this.measuredMessageProps = [];
    this.propertyList = [];
    this.assetWiseTelemetryData = [];
    this.selectDateFlag = false;
    this.widgetBySplice = [];
    this.sameAsset = '';
    this.getDefaultFilters();
  }

  onSaveHierachy() {
    this.historicalDateFilter.widgets = [];
    this.selectedDateRange = this.historicalDateFilter.dateOption;
    this.historicalDateFilter.type = true;
    this.historicalDateFilter.sampling_format = 'minute';
    this.historicalDateFilter.sampling_time = 1;

  }

  selectedDate(filterObj) {
    this.selectDateFlag = true;
    this.signalRService.disconnectFromSignalR('telemetry');
    this.signalRTelemetrySubscription?.unsubscribe()
    this.historical_livedata = []
    this.live_Date = false;
    // this.historicalCombineWidgets = [];
    this.assetWiseTelemetryData = [];
    this.propertyList = [];
    // this.measuredMessageProps = [];
    this.historicalDateFilter.from_date = filterObj.from_date;
    this.historicalDateFilter.to_date = filterObj.to_date;
    this.historicalDateFilter.dateOption = filterObj.dateOption;
    // this.onFilterSelection('', true, false, true, 'callFromSelectedDate');
    this.onDateFilterSelection();

    // this.historicalDateFilter.last_n_secs = filterObj.last_n_secs;
    if (this.filterObj.asset) {
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

  private SubscribeLiveTelemetryOnDateOption(endDate: any = null) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let to_date = new Date(endDate * 1000);
    to_date.setHours(0, 0, 0, 0);
    if (currentDate <= to_date) {
      const obj1 = {
        hierarchy: this.contextApp.user.hierarchy,
        levels: this.contextApp.hierarchy.levels,
        asset_id: this.filterObj?.asset?.asset_id,
        type: 'telemetry',
        app: this.contextApp.app,
      };
      this.signalRService.connectToSignalR(obj1);
      this.signalRTelemetrySubscription = this.signalRService.signalRTelemetryData.subscribe(
        (data) => {
          if (data) {
            let obj = JSON.parse(JSON.stringify(data));
            delete obj.m;
            delete obj.ed;
            delete obj.cd;
            delete obj.dkpi;
            obj = { ...obj, ...data.m, ...data.ed, ...data.cd, ...data.dkpi };
            data = JSON.parse(JSON.stringify(obj));
            this.getLatestHistoricalTelemetry(data);
          }
        });
    }
    else {
      this.historical_livedata = [];
      this.live_Date = false;
    }
  }

  getLatestHistoricalTelemetry(data) {
    this.historical_livedata = data;
    this.live_Date = true;
  }

  getDefaultFilters() {

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
  }

  onScroll(event: any) {

    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 1) {
      //  if(this.historicalCombineWidgets?.length > 10){
      //   return;
      //  }
      // this.widgetBySplice = []
      // let histoLength = this.historicalCombineWidgets?.length
      // this.widgetBySplice = this.newHistoricalCombineWidets.slice(this.historicalCombineWidgets?.length,this.historicalCombineWidgets?.length + 2)
      this.historicalCombineWidgets = [...this.historicalCombineWidgets, ...(this.newHistoricalCombineWidets.slice(this.historicalCombineWidgets?.length, this.historicalCombineWidgets?.length + 2))]
      //  this.onFilterSelection('', true, false, true,'callFromSelectedDate', histoLength, histoLength + 2);
    }
  }

  onDateFilterSelection() {
    if (this.filterObj?.asset) {

      this.isFilterSelected = true
      const obj = {
        app: this.contextApp.app,
        name: this?.filterObj?.asset?.asset_model,
      };
      this.propertyList = [];
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

        },
        (error) => (this.isTelemetryDataLoading = false)
      )
      // if (!callFromSelectedDate) {
      //   this.assetWiseTelemetryData = []
      //   this.historicalCombineWidgets = []

      //   this.myPromise = new Promise((resolve, reject) => {
      //     this.assetModelService.getAssetsModelLayout(obj).subscribe((response: any) => {
      //       this.newHistoricalCombineWidets = response?.historical_widgets;
      //       this.historicalCombineWidgets = this.newHistoricalCombineWidets.slice(0, 2)
      //       resolve('');
      //     })
      //   });
      // }

      this.myPromise.then(() => {
        this.measuredMessageProps = [];
        if (this.newHistoricalCombineWidets) {
          this.newHistoricalCombineWidets?.forEach((widget) => {
            widget?.y1axis?.forEach((item) => {
              if (item?.json_key && !this.measuredMessageProps?.includes(item?.json_key)) {
                this.measuredMessageProps?.push(item?.json_key);
              }
            })
            widget?.y2axis?.forEach((item) => {
              if (item?.json_key && !this.measuredMessageProps?.includes(item?.json_key)) {
                this.measuredMessageProps?.push(item?.json_key);
              }
            })
          })
          this.SubscribeLiveTelemetryOnDateOption(this.historicalDateFilter?.to_date);
          const filterObj = {
            epoch: true,
            app: this.contextApp.app,
            asset_id: this.filterObj?.asset?.asset_id,
            partition_key: this.filterObj?.asset?.partition_key,
            from_date: this.historicalDateFilter?.from_date,
            to_date: this.historicalDateFilter?.to_date,
            order_dir: 'ASC',
            measured_message_props: this.measuredMessageProps

          }
          this.isLoadingData = true;
          this.isAssetWiseTelemetryData = true;
          this.assetService.getAssetSamplingTelemetry(filterObj, this.contextApp.app).subscribe((response) => {
            if (response && response?.data) {
              response?.data.forEach((item) => {
                item.message_date = this.commonService.convertUTCDateToLocal(item.message_date);
                item.message_date_obj = new Date(item.message_date);
              });
              this.assetWiseTelemetryData = response?.data
              this.selectDateFlag = false;
              this.isLoadingData = false;
              this.isAssetWiseTelemetryData = false;
            }
          });
        }
      })

    }
    else {
      this.historicalCombineWidgets = [];
      this.assetWiseTelemetryData = [];
      this.propertyList = [];
      this.measuredMessageProps = [];
      this.toasterService.showError('Asset selection is required', 'Historical & Live Telemetry');
    }
  }

  ngOnDestroy(): void {
    this.signalRTelemetrySubscription?.unsubscribe();
    this.signalRService.disconnectFromSignalR('telemetry');
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    delete item?.assets;
    this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, item);

  }

}
