import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-application-logical-view',
  templateUrl: './application-logical-view.component.html',
  styleUrls: ['./application-logical-view.component.css']
})
export class ApplicationLogicalViewComponent implements OnInit, OnDestroy {
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
  logicalView: any;
  logicalViewData: any;
  actualPropertyList: any;
  checkwidgettype: boolean;
  logiclFilterObj: any;



  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    private cdr: ChangeDetectorRef


  ) { }

  async ngOnInit(): Promise<void> {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.getTileName();
    this.getDefaultFilters();
    await this.getAssets();
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
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

  getAssets() {
    return new Promise<void>((resolve1) => {
      this.apiSubscriptions.push(this.assetService.getLogicalView().subscribe((res: any) => {
        this.logicalView = res.data;
        resolve1();
      }))
      return
      const obj = {
        // hierarchy: JSON.stringify(hierarchy),
        // type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
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
    if (this.sameAsset != this?.filterObj?.logicalview?.code) {
      if (this.filterObj?.logicalview) {
        this.isFilterSelected = true
        const obj = {
          app: this.contextApp.app,
          name: this?.filterObj?.logicalview?.code,
        };
        this.sameAsset = this.filterObj?.logicalview?.code

        this.myPromise = new Promise((resolve, reject) => {
          this.assetService.getLogicalViewByCode(this.sameAsset).subscribe(async (response: any) => {
            this.logicalViewData = response;

            // this.logicalViewData?.assets.forEach(async (element) => {
            //   await this.getAssetsModelProperties(element.asset_id);
            // });

            this.actualPropertyList = [];
            this.logicalViewData?.charts?.forEach((widget, index) => {
              widget.widget_title = widget?.chartname;
              widget.widget_type = widget?.widgettype;
              widget.chart_id = this.logicalViewData?.id;
              widget.id = this.logicalViewData?.id;

              if (widget.widget_type === 'SmallNumber') {
                this.checkwidgettype = true;
              }

              if (widget.widget_type !== 'LineChart' && widget.widget_type !== 'AreaChart' && widget.widget_type !== 'ConditionalNumber') {

                widget?.properties.forEach((prop) => {
                  if (prop) {
                    prop.json_key = prop.json_key;
                  }
                  // prop = this.propertyList.find((propObj) => propObj.json_key === prop.json_key);
                  prop.type = prop?.type;

                  if (prop?.type === 'Derived KPIs') {
                    widget.derived_kpis = true;
                  } else if (prop?.type === 'Edge Derived Properties') {
                    widget.edge_derived_props = true;
                  } else if (prop?.type === 'Cloud Derived Properties') {
                    widget.cloud_derived_props = true;
                  } else {
                    widget.measured_props = true;
                  }

                  this.actualPropertyList.push(prop);

                });
                this.logicalViewData.charts[index].properties[0].properties = widget.properties;
              }
              else if (widget.widget_type == 'ConditionalNumber') {

                widget?.properties.forEach((prop) => {
                  if (prop) {
                    prop.json_key = prop.json_key;
                  }
                  // prop = this.propertyList.find((propObj) => propObj.json_key === prop.json_key);
                  prop.type = prop?.type;

                  if (prop?.type === 'Derived KPIs') {
                    widget.derived_kpis = true;
                  } else if (prop?.type === 'Edge Derived Properties') {
                    widget.edge_derived_props = true;
                  } else if (prop?.type === 'Cloud Derived Properties') {
                    widget.cloud_derived_props = true;
                  } else {
                    widget.measured_props = true;
                  }
                });
              }
              else {

                if (widget.widget_type == 'LineChart' || widget.widget_type == 'AreaChart') {
                  widget.y1AxisProps = widget?.properties[0].y1AxisProps
                  widget.y2AxisProps = widget?.properties[0].y2AxisProps
                }
                widget?.y1AxisProps.forEach((prop) => {
                  if (prop.id) {
                    prop.json_key = prop.id;
                  }
                  // prop.property = this.propertyList.find(
                  //   (propObj) => propObj.json_key === prop.json_key || propObj.id === prop.id
                  // );
                  if (prop?.type === 'Derived KPIs') {
                    widget.derived_kpis = true;
                  } else if (prop?.type === 'Edge Derived Properties') {
                    widget.edge_derived_props = true;
                  } else if (prop?.property?.type === 'Cloud Derived Properties') {
                    widget.cloud_derived_props = true;
                  } else {
                    widget.measured_props = true;
                  }
                  this.actualPropertyList.push(prop);

                });
                widget?.y2AxisProps?.forEach((prop) => {
                  if (prop.id) {
                    prop.json_key = prop.id;
                  }
                  // prop.property = this.propertyList.find(
                  //   (propObj) => propObj.json_key === prop.json_key || propObj.id === prop.id
                  // );
                  if (prop?.type === 'Derived KPIs') {
                    widget.derived_kpis = true;
                  } else if (prop?.type === 'Edge Derived Properties') {
                    widget.edge_derived_props = true;
                  } else if (prop?.property?.type === 'Cloud Derived Properties') {
                    widget.cloud_derived_props = true;
                  } else {
                    widget.measured_props = true;
                  }

                  this.actualPropertyList.push(prop);

                });

                this.logicalViewData.charts[index].y1AxisProps = widget?.properties[0].y1AxisProps;
                this.logicalViewData.charts[index].y2AxisProps = widget?.properties[0].y2AxisProps;

              }
            });

            this.cdr.markForCheck();
            this.isAssetSelected = true;

            this.signalRService.disconnectFromSignalR('logicalview');
            this.getLiveData(this.sameAsset);

            this.getTelemetryData();
            setInterval(() => this.getTelemetryData(), 10000);

          }, error => {
            this.toasterService.showError(error.message, "Logical View Telemetry")
          })
        });

      }
      else {
        this.isAssetSelected = false;
        this.historicalCombineWidgets = [];
        this.assetWiseTelemetryData = [];
        this.propertyList = [];
        this.measuredMessageProps = [];
        this.toasterService.showError('Logical View selection is required', 'Logical View Telemetry');
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

  searchLogicalViewEvent(e) {
    this.logiclFilterObj = e;
  }

  // selectedDate(filterObj) {
  //   this.selectDateFlag = true;
  //   this.signalRService.disconnectFromSignalR('logicalview');
  //   this.signalRTelemetrySubscription?.unsubscribe()
  //   this.historical_livedata = []
  //   this.live_Date = false;
  //   // this.historicalCombineWidgets = [];
  //   this.assetWiseTelemetryData = [];
  //   this.propertyList = [];
  //   // this.measuredMessageProps = [];
  //   this.historicalDateFilter.from_date = filterObj.from_date;
  //   this.historicalDateFilter.to_date = filterObj.to_date;
  //   this.historicalDateFilter.dateOption = filterObj.dateOption;
  //   // this.onFilterSelection('', true, false, true, 'callFromSelectedDate');
  //   this.onDateFilterSelection();

  //   // this.historicalDateFilter.last_n_secs = filterObj.last_n_secs;
  //   if (this.filterObj.asset) {
  //     const records = this.commonService.calculateEstimatedRecords(
  //       this.frequency,
  //       this.historicalDateFilter.from_date,
  //       this.historicalDateFilter.to_date
  //     );
  //     if (records > this.noOfRecords) {
  //       this.historicalDateFilter.isTypeEditable = true;
  //     } else {
  //       this.historicalDateFilter.isTypeEditable = false;
  //     }
  //   }
  // }

  // private SubscribeLiveTelemetryOnDateOption(endDate: any = null, logiclFilterObj) {
  //   let currentDate = new Date();
  //   currentDate.setHours(0, 0, 0, 0);
  //   let to_date = new Date(endDate * 1000);
  //   to_date.setHours(0, 0, 0, 0);
  //   if (currentDate <= to_date) {
  //     const obj1 = {
  //       hierarchy: this.contextApp.user.hierarchy,
  //       levels: this.contextApp.hierarchy.levels,
  //       code: logiclFilterObj?.code,
  //       type: 'logicalview',
  //       app: this.contextApp.app,
  //     };
  //     this.signalRService.connectToSignalR(obj1);
  //     this.signalRTelemetrySubscription = this.signalRService.signalRLogicalViewData.subscribe(
  //       (data) => {
  //         if (data) {
  //           let obj = JSON.parse(JSON.stringify(data));
  //           delete obj.m;
  //           delete obj.ed;
  //           delete obj.cd;
  //           delete obj.dkpi;
  //           obj = { ...obj, ...data.m, ...data.ed, ...data.cd, ...data.dkpi };
  //           data = JSON.parse(JSON.stringify(obj));
  //           this.getLatestHistoricalTelemetry(data);
  //         }
  //       });
  //   }
  //   else {
  //     this.historical_livedata = [];
  //     this.live_Date = false;
  //   }
  // }

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

  // onDateFilterSelection() {
  //   if (this.logiclFilterObj) {
  //     this.isFilterSelected = true;
  //     debugger
  //     this.SubscribeLiveTelemetryOnDateOption(this.historicalDateFilter?.to_date, this.logiclFilterObj?.logicalview);
  //     const filterObj = {
  //       epoch: true,
  //       app: this.contextApp.app,
  //       code: this.logiclFilterObj?.logicalview?.code,
  //       // partition_key: this.filterObj?.asset?.partition_key,
  //       from_date: this.historicalDateFilter?.from_date,
  //       to_date: this.historicalDateFilter?.to_date,
  //       order_dir: 'ASC',
  //       measured_message_props: this.measuredMessageProps

  //     }
  //     this.isLoadingData = true;
  //     this.isAssetWiseTelemetryData = true;
  //     // this.assetService.getAssetSamplingTelemetry(filterObj, this.contextApp.app).subscribe((response) => {
  //     //   if (response && response?.data) {
  //     //     response?.data.forEach((item) => {
  //     //       item.message_date = this.commonService.convertUTCDateToLocal(item.message_date);
  //     //       item.message_date_obj = new Date(item.message_date);
  //     //     });
  //     //     this.assetWiseTelemetryData = response?.data
  //     //     this.selectDateFlag = false;
  //     //     this.isLoadingData = false;
  //     //     this.isAssetWiseTelemetryData = false;
  //     //   }
  //     // });

  //     const obj = {
  //       app: this.contextApp.app,
  //       name: this?.filterObj?.asset?.asset_model,
  //     };
  //     this.propertyList = [];
  //     // this.assetModelService.getAssetsModelProperties(obj).subscribe(
  //     //   (response: any) => {
  //     //     this.propertyList = response.properties.measured_properties
  //     //       ? response.properties.measured_properties
  //     //       : [];
  //     //     response.properties.edge_derived_properties = response.properties.edge_derived_properties
  //     //       ? response.properties.edge_derived_properties
  //     //       : [];
  //     //     response.properties.cloud_derived_properties = response.properties.cloud_derived_properties
  //     //       ? response.properties.cloud_derived_properties
  //     //       : [];
  //     //     response.properties.edge_derived_properties.forEach((prop) => {
  //     //       prop.type = 'Edge Derived Properties';
  //     //       this.propertyList.push(prop);
  //     //     });
  //     //     response.properties.cloud_derived_properties.forEach((prop) => {
  //     //       prop.type = 'Cloud Derived Properties';
  //     //       this.propertyList.push(prop);
  //     //     });

  //     //   },
  //     //   (error) => (this.isTelemetryDataLoading = false)
  //     // )


  //     // if (!callFromSelectedDate) {
  //     //   this.assetWiseTelemetryData = []
  //     //   this.historicalCombineWidgets = []

  //     //   this.myPromise = new Promise((resolve, reject) => {
  //     //     this.assetModelService.getAssetsModelLayout(obj).subscribe((response: any) => {
  //     //       this.newHistoricalCombineWidets = response?.historical_widgets;
  //     //       this.historicalCombineWidgets = this.newHistoricalCombineWidets.slice(0, 2)
  //     //       resolve('');
  //     //     })
  //     //   });
  //     // }

  //     this.myPromise.then(() => {
  //       this.measuredMessageProps = [];
  //       // if (this.newHistoricalCombineWidets) {
  //       //   this.newHistoricalCombineWidets?.forEach((widget) => {
  //       //     widget?.y1axis?.forEach((item) => {
  //       //       if (item?.json_key && !this.measuredMessageProps?.includes(item?.json_key)) {
  //       //         this.measuredMessageProps?.push(item?.json_key);
  //       //       }
  //       //     })
  //       //     widget?.y2axis?.forEach((item) => {
  //       //       if (item?.json_key && !this.measuredMessageProps?.includes(item?.json_key)) {
  //       //         this.measuredMessageProps?.push(item?.json_key);
  //       //       }
  //       //     })
  //       //   })

  //       //   }
  //     })

  //   }
  //   else {
  //     this.historicalCombineWidgets = [];
  //     this.assetWiseTelemetryData = [];
  //     this.propertyList = [];
  //     this.measuredMessageProps = [];
  //     this.toasterService.showError('Asset selection is required', 'Historical & Live Telemetry');
  //   }
  // }

  ngOnDestroy(): void {
    this.signalRTelemetrySubscription?.unsubscribe();
    this.signalRService.disconnectFromSignalR('logicalview');
  }

  async getTelemetryData() {
    try {
      this.telemetryObj = {};
      this.telemetryObj.message_date = datefns.format(new Date(), "dd-MM-yyyy HH:mm:ss").toString();
      this.actualPropertyList?.forEach((prop) => {
        if (prop.json_key) {
          this.telemetryObj[prop.json_key] = {
            value: this.commonService.randomIntFromInterval(
              prop.json_model?.[prop.json_key]?.minValue ? prop.json_model[prop.json_key]?.minValue : 0,
              prop.json_model?.[prop.json_key]?.maxValue ? prop.json_model[prop.json_key]?.maxValue : 100
            ),
            date: this.telemetryObj.message_date,
          };
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async getAssetsModelProperties(selectedAssest) {

    let fPropList = []
    this.propertyList = []

    await this.assetModelService.getModelPropertiesByAssets(selectedAssest).toPromise().then((response: any) => {
      if (response?.data) {
        response["measured_properties"] = response.data.filter(x => x.type == "m");
        response["edge_derived_properties"] = response.data.filter(x => x.type == "ed");
        response["cloud_derived_properties"] = response.data.filter(x => x.type == "cd");
      }
      response.measured_properties = response.measured_properties
        ? response.measured_properties
        : [];
      response.measured_properties?.forEach((prop) => {
        prop.type = 'Measured Properties'
        this.propertyList.push(prop);
      });

      response.edge_derived_properties = response.edge_derived_properties
        ? response.edge_derived_properties
        : [];
      response.cloud_derived_properties = response.cloud_derived_properties
        ? response.cloud_derived_properties
        : [];
      response.edge_derived_properties?.forEach((prop) => {
        prop.type = 'Edge Derived Properties';
        let matchCount = 0
        prop.metadata?.properties?.forEach((actualProp) => {
          matchCount++
        })
        if (matchCount > 0) {
          this.propertyList.push(prop)
        }
      });

      response?.cloud_derived_properties?.forEach((prop) => {
        prop.type = 'Cloud Derived Properties';
        this.propertyList.push(prop);

      });

      this.propertyList.forEach((prop) => {
        if (prop.data_type !== 'Object' && prop.data_type !== 'Array') {
          fPropList.push(prop);
        }
      });

    })
  }

  getLiveData(code, endDate: any = null) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let to_date = new Date(endDate * 1000);
    to_date.setHours(0, 0, 0, 0);
    // if (currentDate <= to_date) {
    const obj1 = {
      hierarchy: this.contextApp.user.hierarchy,
      levels: this.contextApp.hierarchy.levels,
      code: code,
      type: 'logicalview',
      app: this.contextApp.app,
    };
    this.signalRService.connectToSignalR(obj1);
    this.signalRTelemetrySubscription = this.signalRService.signalRLogicalViewData.subscribe(
      (data) => {
        if (data) {
          let obj = JSON.parse(JSON.stringify(data));
          delete obj.m;
          delete obj.ed;
          delete obj.cd;
          delete obj.dkpi;
          obj = { ...obj, ...data.m, ...data.ed, ...data.cd, ...data.dkpi };
          data = JSON.parse(JSON.stringify(obj));
          console.log(data);
          // this.getLatestHistoricalTelemetry(data);
        }
      });
    // }
  }
}

