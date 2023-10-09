import { HierarchyDropdownComponent } from './../../common/hierarchy-dropdown/hierarchy-dropdown.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from './../../../environments/environment';
import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  EmbeddedViewRef,
  ApplicationRef,
  ComponentFactoryResolver,
  Injector,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { ColumnChartComponent } from 'src/app/common/charts/column-chart/column-chart.component';
import { DataTableComponent } from 'src/app/common/charts/data-table/data-table.component';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { PieChartComponent } from 'src/app/common/charts/pie-chart/pie-chart.component';
import { DamagePlotChartComponent } from 'src/app/common/charts/damage-plot-chart/damage-plot-chart.component';
import { ChartService } from 'src/app/services/chart/chart.service';
import * as datefns from 'date-fns';

declare var $: any;
@Component({
  selector: 'app-app-dashboard',
  templateUrl: './app-dashboard.component.html',
  styleUrls: ['./app-dashboard.component.css'],
})
export class AppDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  defaultAppName = environment.app;
  userData: any;
  contextApp: any;
  tileData: any;
  assets: any[] = [];
  filterObj: any = {};
  propertyList: any[] = [];
  telemetryObj: any;
  apiTelemetryObj: any;
  telemetryData: any[] = [];
  refreshInterval: any;
  selectedTab = 'telemetry';
  lastReportedTelemetryValues: any;
  isTelemetryDataLoading = false;
  signalRTelemetrySubscription: any;
  isFilterSelected = false;
  midNightHour: number;
  midNightMinute: number;
  currentHour: number;
  currentMinute: number;
  telemetryInterval;
  signalRModeValue: boolean;
  c2dResponseMessage = [];
  c2dResponseInterval: any;
  isC2dAPILoading = false;
  c2dLoadingMessage: string;
  isTelemetryModeAPICalled = false;
  originalFilter: any;
  apiSubscriptions: Subscription[] = [];
  liveWidgets: any[] = [];
  historicalWidgets: any[] = [];
  isGetWidgetsAPILoading = false;
  assetDetailData: any;
  frequencyDiffInterval: number;
  normalModelInterval: number;
  turboModeInterval: number;
  widgetPropertyList: any[] = [];
  previousProperties = [];
  sampleCountArr = Array(60).fill(0);
  sampleCountValue = 0;
  sampleCountInterval: any;
  loadingMessage: string;
  propList: any[];
  historicalDateFilter: any = {};
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  selectedDateRange: string;
  decodedToken: any;
  isShowOpenFilter = true;
  derivedKPIs: any[] = [];
  derivedKPIHistoricData: any[] = [];
  frequency: any;
  latestRunningHours: any = 0;
  latestRunningMinutes: any = 0;
  noOfRecords = CONSTANTS.NO_OF_RECORDS;
  widgetStringFromMenu: string;
  checkwidgettype: boolean = false;
  checkconditionaltype: boolean = false;
  checkingsmallwidget: '';
  checkconditionalwidget: '';
  isOpenControlPropertiesModal = false;
  controlpropertyassetId: any;
  controlPropertybtn = false;
  signalRControlTelemetry: any;
  lastTelemetryValueControl: any;
  refreshcontrolProperties = false;

  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    private chartService: ChartService,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private route: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp.metadata?.filter_settings?.record_count) {
      this.noOfRecords = this.contextApp.metadata?.filter_settings?.record_count;
    }
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.getTileName();
    // if (this.contextApp?.dashboard_config?.show_historical_widgets) {
    //   const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    //   this.historicalDateFilter.dateOption = item.dateOption;
    //   if (item.dateOption !== 'Custom Range') {
    //     const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
    //     this.historicalDateFilter.from_date = dateObj.from_date;
    //     this.historicalDateFilter.to_date = dateObj.to_date;
    //     // this.historicalDateFilter.last_n_secs = this.historicalDateFilter.to_date - this.historicalDateFilter.from_date;
    //   } else {
    //     this.historicalDateFilter.from_date = item.from_date;
    //     this.historicalDateFilter.to_date = item.to_date;
    //     // this.historicalDateFilter.last_n_secs = undefined;
    //   }
    //   // this.historicalDateFilter.from_date = moment().subtract(30, 'minutes').utc().unix();
    //   // this.historicalDateFilter.to_date = moment().utc().unix();
    //   // this.historicalDateFilter.last_n_secs = this.historicalDateFilter.to_date - this.historicalDateFilter.from_date;
    //   this.historicalDateFilter.widgets = [];
    //   this.selectedDateRange = this.historicalDateFilter.dateOption;
    //   this.historicalDateFilter.type = true;
    //   this.historicalDateFilter.sampling_format = 'minute';
    //   this.historicalDateFilter.sampling_time = 1;
    // }
    await this.getAssets(this.contextApp.user.hierarchy);
    this.onTabChange();
    if ($(window).width() < 992) {
      this.isShowOpenFilter = false;
    }

    // if (this.selectedTab === 'telemetry') {
    //   this.loadFromCache();
    // }
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

  ngAfterViewInit() {
    if ($('#overlay')) {
      $('#overlay').hide();
    }
  }

  onAssetFilterBtnClick() {
    $('.dropdown-menu .dropdown-open').on('click.bs.dropdown', (e) => {
      e.stopPropagation();
    });
    $('#dd-open').on('hide.bs.dropdown', (e: any) => {
      if (e.clickEvent && !e.clickEvent.target.className?.includes('searchBtn')) {
        e.preventDefault();
      }
    });
  }

  onSaveHierachy() {

    // if (this.contextApp?.dashboard_config?.show_historical_widgets) {
    //   const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    //   this.historicalDateFilter.dateOption = item.dateOption;
    //   if (item.dateOption !== 'Custom Range') {
    //     const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
    //     this.historicalDateFilter.from_date = dateObj.from_date;
    //     this.historicalDateFilter.to_date = dateObj.to_date;
    //     // this.historicalDateFilter.last_n_secs = this.historicalDateFilter.to_date - this.historicalDateFilter.from_date;
    //   } else {
    //     this.historicalDateFilter.from_date = item.from_date;
    //     this.historicalDateFilter.to_date = item.to_date;
    //     // this.historicalDateFilter.last_n_secs = undefined;
    //   }
    //   // this.historicalDateFilter.from_date = moment().subtract(30, 'minutes').utc().unix();
    //   // this.historicalDateFilter.to_date = moment().utc().unix();
    //   // this.historicalDateFilter.last_n_secs = this.historicalDateFilter.to_date - this.historicalDateFilter.from_date;
    //   this.historicalDateFilter.widgets = [];
    //   this.selectedDateRange = this.historicalDateFilter.dateOption;
    //   this.historicalDateFilter.type = true;
    //   this.historicalDateFilter.sampling_format = 'minute';
    //   this.historicalDateFilter.sampling_time = 1;
    // }


    this.originalFilter = {};
    if (this.filterObj.asset) {
      this.originalFilter.asset = JSON.parse(JSON.stringify(this.filterObj.asset));
      this.onChangeOfAsset();
    }

    this.selectedDateRange = ''
    this.historicalDateFilter.dateOption = ''
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    this.historicalDateFilter.dateOption = item.dateOption
    setTimeout(() => {
      this.selectedDateRange = this.historicalDateFilter.dateOption
    }, 200);

    this.historicalWidgets = [];
  }

  onClearHierarchy() {
    this.isFilterSelected = false;
    this.originalFilter = JSON.parse(JSON.stringify(this.filterObj));
    this.frequency = undefined;
    this.controlPropertybtn = false;
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

  async loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    if (item) {
      this.hierarchyDropdown.updateHierarchyDetail(JSON.parse(JSON.stringify(item)));
      if (item.assets) {
        this.filterObj.asset = item.assets;
        await this.onChangeOfAsset();
        this.onFilterSelection(this.filterObj, false, true, true);
      }
    }
  }

  async onSwitchValueChange(event) {
    $('#overlay').show();
    this.c2dResponseMessage = [];
    this.signalRModeValue = event;
    this.isC2dAPILoading = true;
    clearInterval(this.c2dResponseInterval);
    const obj = {
      method: 'change_asset_mode',
      asset_id: this.filterObj.asset.asset_id,
      gateway_id: this.filterObj.asset.gateway_id ? this.filterObj.asset.gateway_id : undefined,
      message: {
        telemetry_mode: !this.signalRModeValue ? 'normal' : 'turbo',
        asset_id: this.filterObj.asset.asset_id,
      },
      app: this.contextApp.app,
      job_type: 'DirectMethod',
      request_type: 'Change Asset Mode',
      job_id: this.filterObj.asset.asset_id + '_' + this.commonService.generateUUID(),
      sub_job_id: null,
    };
    obj.sub_job_id = obj.job_id + '_1';
    this.apiSubscriptions.push(
      this.assetService
        .callAssetMethod(obj, this.contextApp.app, this.filterObj?.asset?.gateway_id || this.filterObj?.asset?.asset_id)
        .subscribe(
          (response: any) => {
            if (response?.asset_response) {
              this.chartService.clearDashboardTelemetryList.emit([]);
              const arr = [];
              this.telemetryData = JSON.parse(JSON.stringify([]));
              this.telemetryData = JSON.parse(JSON.stringify(arr));
              this.toasterService.showSuccess(response.asset_response.message, 'Change Telemetry Mode');
            }
            this.isC2dAPILoading = false;
            this.c2dLoadingMessage = undefined;
            this.telemetryInterval = undefined;
          },
          (error) => {
            this.toasterService.showError(error?.message, 'Change Telemetry Mode');
            this.signalRModeValue = !this.signalRModeValue;
            this.isC2dAPILoading = false;
            this.c2dLoadingMessage = undefined;
          }
        )
    );
  }

  getAssetData() {
    return new Promise<void>((resolve1) => {
      this.assetDetailData = undefined;

      this.apiSubscriptions.push(
        this.assetService.getAssetDetailById(this.contextApp.app, this.filterObj.asset.asset_id).subscribe(
          async (response: any) => {
            this.assetDetailData = JSON.parse(JSON.stringify(response));
            this.normalModelInterval = this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency
              ? this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency
              : 60;
            this.turboModeInterval = this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency
              ? this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency
              : 1;
            this.frequencyDiffInterval = Math.abs(
              (this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency
                ? this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency
                : 60) -
              (this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency
                ? this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency
                : 1)
            );
            resolve1();
          },
          (error) => (this.isTelemetryDataLoading = false)
        )
      );
    });
  }

  compareFn(c1, c2): boolean {
    return c1 && c2 ? c1.asset_id === c2.asset_id : c1 === c2;
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

  onTabChange() {
    this.signalRService.disconnectFromSignalR('telemetry');
    // this.signalRService.disconnectFromSignalR('alert');
    this.telemetryData = JSON.parse(JSON.stringify([]));
    this.telemetryObj = undefined;
    this.apiTelemetryObj = undefined;
    this.telemetryInterval = undefined;
    this.filterObj.asset = undefined;
    this.widgetPropertyList = [];
    this.c2dResponseMessage = [];
    this.isC2dAPILoading = false;
    this.c2dLoadingMessage = undefined;
    clearInterval(this.c2dResponseInterval);
    this.loadFromCache();
    $('#overlay').hide();
  }

  onDeSelectAll(event) {
    this.historicalDateFilter.widgets = [];
  }

  getHistoricalWidgets(assetModel, historicalWidgetUpgrade) {
    return new Promise<void>((resolve1) => {
      const params = {
        app: this.contextApp.app,
        name: assetModel,
      };
      this.historicalWidgets = [];
      this.apiSubscriptions.push(
        this.assetModelService.getAssetsModelLayout(params).subscribe(
          async (response: any) => {
            if (response?.historical_widgets?.length > 0) {
              this.historicalWidgets = response.historical_widgets;
              this.historicalWidgets.forEach((item) => {
                item.edge_derived_props = false;
                item.cloud_derived_props = false;
                item.measured_props = false;
                item.derived_kpis = false;
                item.y1axis.forEach((prop) => {
                  // const type = this.propertyList.find((propObj) => propObj.json_key === prop.json_key)?.type;
                  this.SetItemDetails(prop, item);
                });
                item.y2axis.forEach((prop) => {
                  this.SetItemDetails(prop, item);
                });
              });
              // if (historicalWidgetUpgrade) {
              //   this.historicalDateFilter.widgets = JSON.parse(JSON.stringify(this.historicalWidgets));
              // }
            } else {
              this.historicalDateFilter.widgets = [];
            }
            this.isGetWidgetsAPILoading = false;
            this.isFilterSelected = true;
            this.isTelemetryDataLoading = false;
            resolve1();
          },
          () => {
            this.isGetWidgetsAPILoading = false;
            this.isTelemetryDataLoading = false;
            resolve1();
          }
        )
      );
    });
  }

  private SetItemDetails(prop: any, item: any) {
    if (prop.type === 'Derived KPIs') {
      item.derived_kpis = true;
    } else if (prop?.type === 'Edge Derived Properties') {
      item.edge_derived_props = true;
    } else if (prop?.type === 'Cloud Derived Properties') {
      item.cloud_derived_props = true;
    } else {
      item.measured_props = true;
    }
  }

  getLiveWidgets(assetType) {
    return new Promise<void>((resolve1) => {
      const params = {
        app: this.contextApp.app,
        name: assetType,
      };
      this.liveWidgets = [];
      this.isGetWidgetsAPILoading = true;
      this.apiSubscriptions.push(
        this.assetModelService.getAssetsModelLiveWidgets(params).subscribe(
          async (response: any) => {
            if (response?.live_widgets?.length > 0) {
              response.live_widgets.forEach((widget) => {
                this.checkingsmallwidget = widget.widgetType;
                this.checkconditionalwidget = widget.widgetType;
                if (widget.widgetType === 'SmallNumber') {
                  this.checkwidgettype = true;
                }
                if (widget.widgetType === 'ConditionalNumber') {
                  this.checkconditionaltype = true;
                }
                widget.edge_derived_props = false;
                widget.cloud_derived_props = false;
                widget.derived_kpis = false;
                widget.measured_props = false;
                if (widget.widgetType === 'ConditionalNumber') {
                  let propertiesData = [];
                  widget['formula'] = widget?.properties[0]?.formula;
                  widget['text'] = widget?.properties[0]?.text;
                  widget?.properties[0]?.json_Data.forEach((prop) => {
                    let newProp = {};
                    let filteredProp = this.propertyList.find((propObj) => propObj.json_key === prop.json_key);
                    newProp["property"] = filteredProp;
                    newProp["type"] = filteredProp?.type;
                    newProp["json_key"] = prop?.json_key;
                    newProp["title"] = filteredProp?.name;
                    if (filteredProp) {
                      this.addPropertyInList(filteredProp);
                    }
                    propertiesData.push(newProp);
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
                  widget.properties = propertiesData;
                }
                else if (widget.widgetType !== 'LineChart' && widget.widgetType !== 'AreaChart') {

                  widget?.properties.forEach((prop) => {
                    if (prop.property) {
                      prop.json_key = prop.property.json_key;
                    }
                    prop.property = this.propertyList.find((propObj) => propObj.json_key === prop.json_key);
                    prop.type = prop.property?.type;

                    if (prop?.property) {
                      this.addPropertyInList(prop.property);
                    }
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
                } else {
                  widget?.y1AxisProps?.forEach((prop) => {
                    if (prop.id) {
                      prop.json_key = prop.id;
                    }
                    prop.property = this.propertyList.find(
                      (propObj) => propObj.json_key === prop.json_key || propObj.id === prop.id
                    );
                    this.addPropertyInList(prop);
                    if (prop?.type === 'Derived KPIs') {
                      widget.derived_kpis = true;
                    } else if (prop?.type === 'Edge Derived Properties') {
                      widget.edge_derived_props = true;
                    } else if (prop?.property?.type === 'Cloud Derived Properties') {
                      widget.cloud_derived_props = true;
                    } else {
                      widget.measured_props = true;
                    }
                  });
                  widget?.y2AxisProps?.forEach((prop) => {
                    if (prop.id) {
                      prop.json_key = prop.id;
                    }
                    prop.property = this.propertyList.find(
                      (propObj) => propObj.json_key === prop.json_key || propObj.id === prop.id
                    );
                    this.addPropertyInList(prop);
                    if (prop?.type === 'Derived KPIs') {
                      widget.derived_kpis = true;
                    } else if (prop?.type === 'Edge Derived Properties') {
                      widget.edge_derived_props = true;
                    } else if (prop?.property?.type === 'Cloud Derived Properties') {
                      widget.cloud_derived_props = true;
                    } else {
                      widget.measured_props = true;
                    }
                  });
                }
                if (widget.dashboardVisibility) {
                  this.liveWidgets.push(widget);
                }
              });
            }
            this.isGetWidgetsAPILoading = false;
            resolve1();
          },
          () => {
            this.isGetWidgetsAPILoading = false;
            this.isTelemetryDataLoading = false;
          }
        )
      );
    });
  }

  selectedDate(filterObj) {
    this.historicalDateFilter.from_date = filterObj.from_date;
    this.historicalDateFilter.to_date = filterObj.to_date;
    this.historicalDateFilter.dateOption = filterObj.dateOption;
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

  onNumberChange(event, type) {
    if (Number(event.target.value) % 1 !== 0) {
      this.toasterService.showError('Decimal values are not allowed.', 'View History');
      if (type === 'aggregation') {
        this.historicalDateFilter.aggregation_minutes = Math.floor(Number(event.target.value));
      } else {
        this.historicalDateFilter.sampling_time = Math.floor(Number(event.target.value));
      }
    }
  }

  addPropertyInList(prop) {
    if (this.widgetPropertyList.length === 0) {
      this.widgetPropertyList.push(prop);
    } else {
      const index = this.widgetPropertyList.findIndex((propObj) => propObj.json_key === prop.json_key);
      if (index === -1) {
        this.widgetPropertyList.push(prop);
      }
    }
  }


  async onFilterSelection(filterObj, updateFilterObj = true, historicalWidgetUpgrade = false, isFromMainSearch = true) {
    this.refreshcontrolProperties = true
    this.propertyList = [];
    this.c2dResponseMessage = [];
    this.signalRControlTelemetry = [];
    $('#overlay').hide();
    clearInterval(this.c2dResponseInterval);
    this.signalRService.disconnectFromSignalR('telemetry');
    this.signalRTelemetrySubscription?.unsubscribe();
    clearInterval(this.sampleCountInterval);
    this.controlpropertyassetId = JSON.parse(JSON.stringify(filterObj));

    const obj = JSON.parse(JSON.stringify(filterObj));
    let asset_model: any;
    if (obj.asset) {
      obj.asset_id = obj.asset.asset_id;
      asset_model = obj.asset.asset_model;
      delete obj.asset;
    } else {
      this.toasterService.showError('Asset selection is required', 'View Live Telemetry');
      this.telemetryObj = undefined;
      this.apiTelemetryObj = undefined;
      this.telemetryData = [];
      this.liveWidgets = [];
      this.historicalWidgets = [];
      this.isFilterSelected = false;
      return;
    }
    // if (
    //   !this.contextApp?.dashboard_config &&
    //   !this.contextApp?.dashboard_config?.show_live_widgets &&
    //   !this.contextApp?.dashboard_config?.show_historical_widgets
    // ) {
    //   this.contextApp.dashboard_config = {
    //     show_live_widgets: true,
    //   };
    // }
    const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    pagefilterObj['hierarchy'] = filterObj.asset.hierarchy;
    pagefilterObj['assets'] = filterObj.asset;
    //this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);

    this.originalFilter = JSON.parse(JSON.stringify(filterObj));
    this.isTelemetryDataLoading = true;
    await this.getAssetData();
    if (asset_model) {

      this.getTelemetryMode(this.filterObj.asset.asset_id);
      await this.getAssetderivedKPIs(this.filterObj.asset.asset_id);
      await this.getAssetsModelProperties(asset_model);
      if (this.propertyList) {
        let flag = false;
        this.propertyList.forEach(element => {
          if (element?.metadata?.rw == 'w' || element?.metadata?.rw == 'rw') {
            flag = true;
            return;
          }
        });
        this.controlPropertybtn = flag;
      }
      this.sampleCountArr = Array(60).fill(0);
      this.sampleCountValue = 0;
      await this.getLiveWidgets(asset_model);
      this.getLiveWidgetTelemetryDetails(obj);


    }
  }

  getHistoricalWidgetsDrivedKPIDetails() {
    this.propList = [];
    let kpiCodes = '';
    this.historicalWidgets.forEach((widget) => {
      widget.y1axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type === 'Derived KPIs') {
          this.propList.push(prop.json_key);
          const kpiObj = this.derivedKPIs.find((kpi) => kpi.kpi_json_key === prop.json_key);
          kpiCodes += kpiObj?.code + ',';
        }
      });
      widget.y2axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type === 'Derived KPIs') {
          this.propList.push(prop.json_key);
          const kpiObj = this.derivedKPIs.find((kpi) => kpi.kpi_json_key === prop.json_key);
          kpiCodes += kpiObj.code + ',';
        }
      });
    });
    kpiCodes = kpiCodes.replace(/,\s*$/, '');
    if (kpiCodes.length > 0) {
      return new Promise<void>((resolve1) => {
        this.isTelemetryDataLoading = true;
        this.isFilterSelected = true;
        const obj = {
          kpi_codes: kpiCodes,
          from_date: undefined,
          to_date: undefined,
          // last_n_secs: undefined,
        };
        if (this.historicalDateFilter.dateOption !== 'Custom Range') {
          const dateObj = this.commonService.getMomentStartEndDate(this.historicalDateFilter.dateOption);
          obj.from_date = dateObj.from_date;
          obj.to_date = dateObj.to_date;
          // obj.last_n_secs = this.historicalDateFilter.last_n_secs;
        } else {
          obj.from_date = this.historicalDateFilter.from_date;
          obj.to_date = this.historicalDateFilter.to_date;
        }

        this.assetService.getDerivedKPISHistoricalData(this.contextApp.app, obj).subscribe((response: any) => {
          response.data.forEach((item) => {
            const itemobj = {
              message_date: item.metadata.process_end_time,
            };
            itemobj[item.kpi_json_key] = item.kpi_result;
            this.derivedKPIHistoricData.push(itemobj);
            // this.derivedKPIHistoricData.reverse();
          });
          // this.derivedKPIHistoricData = response.data;
          resolve1();
        });
      });
    }
  }

  async getLiveWidgetTelemetryDetails(obj) {
    this.telemetryObj = undefined;
    this.apiTelemetryObj = undefined;
    this.telemetryInterval = undefined;
    this.lastReportedTelemetryValues = undefined;
    this.telemetryData = JSON.parse(JSON.stringify([]));
    obj.count = 1;
    const midnight = datefns.getUnixTime(datefns.startOfDay(new Date()));
    const now = datefns.getUnixTime(new Date());
    obj.from_date = midnight;
    obj.to_date = now;
    // obj.last_n_secs = obj.to_date - obj.from_date;
    obj.app = this.contextApp.app;
    obj.partition_key = this.filterObj.asset.partition_key;
    delete obj.assetArr;
    this.isFilterSelected = true;
    if (environment.app === 'SopanCMS') {
      await this.getMidNightHours(obj);
    }
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
        // if (data.type !== 'alert') {
        if (data) {
          let obj = JSON.parse(JSON.stringify(data));
          delete obj.m;
          delete obj.ed;
          delete obj.cd;
          delete obj.dkpi;
          obj = { ...obj, ...data.m, ...data.ed, ...data.cd, ...data.dkpi };
          data = JSON.parse(JSON.stringify(obj));
        }
        this.signalRControlTelemetry = JSON.parse(JSON.stringify(data));
        this.processTelemetryData(data);
        this.isTelemetryDataLoading = false;
      }
      // }
    );
    this.apiSubscriptions.push(
      this.assetService.getLastTelmetry(this.contextApp.app, obj).subscribe(
        (response: any) => {
          if (response?.message) {
            this.lastTelemetryValueControl = response?.message;
            this.refreshcontrolProperties = false;
            response.message.date = this.commonService.convertUTCDateToLocal(response.message_date);
            response.message.message_date = this.commonService.convertUTCDateToLocal(response.message_date);
            const obj = {};
            if (environment.app === 'SopanCMS') {
              this.latestRunningHours = response.message[this.getPropertyKey('Running Hours')];
              this.latestRunningMinutes = response.message[this.getPropertyKey('Running Minutes')];
            }
            this.widgetPropertyList.forEach((prop) => {
              if (prop.type !== 'Derived KPIs') {
                obj[prop?.json_key] = {
                  value: response.message[prop?.json_key],
                  date: response.message.message_date,
                };
              } else {
                const kpiObj = this.derivedKPIs.find((kpi) => kpi.kpi_json_key === prop.json_key);
                obj[prop?.json_key] = {
                  value: kpiObj.kpi_result,
                  date: this.commonService.convertUTCDateToLocal(kpiObj.process_end_time),
                };
              }
            });
            this.previousProperties = [];
            obj['previous_properties'] = [];
            this.telemetryObj = obj;
            this.apiTelemetryObj = JSON.parse(JSON.stringify(obj));
            // this.telemetryObj = response.message;
            // const hours = this.telemetryObj['Running Hours'].split(':');
            // this.telemetryObj['Hours'] = hours[0] ? Math.floor(Number(hours[0])) : 0;
            // this.telemetryObj['Minutes'] = hours[1] ? Math.floor(Number(hours[1])) : 0;
            if (environment.app === 'SopanCMS') {
              this.getTimeDifference(
                Math.floor(Number(this.latestRunningHours)),
                Math.floor(Number(this.latestRunningMinutes))
              );
            }
            this.lastReportedTelemetryValues = JSON.parse(JSON.stringify(this.telemetryObj));
            this.telemetryData = [];
            this.telemetryData.push(this.telemetryObj);
            this.isTelemetryDataLoading = false;
          } else {
            this.isTelemetryDataLoading = false;
          }
          this.sampleCountInterval = setInterval(() => {
            this.sampleCountArr.pop();
            this.sampleCountArr.unshift(0);
            this.sampleCountValue = this.sampleCountArr.reduce((a, b) => a + b, 0);
          }, 1000);
        },
        (error) => (this.isTelemetryDataLoading = false)
      )
    );
  }

  getHistoricalWidgetTelemetryDetails() {
    $('#historic_charts').children().remove();
    if (this.historicalDateFilter?.widgets?.length === 0) {
      this.toasterService.showError(
        'Select at least one ' + this.widgetStringFromMenu + ' to view the data',
        'View Telemetry Data'
      );
      this.isTelemetryDataLoading = false;
      // this.isFilterSelected = false;
      return;
    }
    this.historicalDateFilter?.widgets.forEach((widget) => {
      widget.y1axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type !== 'Derived KPIs') {
          this.propList.push(prop.json_key);
        }
      });
      widget.y2axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type !== 'Derived KPIs') {
          this.propList.push(prop.json_key);
        }
      });
    });

    this.telemetryData = [];
    const filterObj = JSON.parse(JSON.stringify(this.filterObj));
    filterObj.epoch = true;
    filterObj.app = this.contextApp.app;
    filterObj.asset_id = this.filterObj.asset.asset_id;
    // filterObj.message_props = '';
    filterObj.from_date = null;
    filterObj.to_date = null;
    // filterObj.last_n_secs = null;
    const propArr = [];
    this.propertyList.forEach((propObj) => {
      this.propList.forEach((prop) => {
        if (prop === propObj.json_key && propObj.type !== 'Derived KPIs') {
          propArr.push(propObj);
        }
      });
    });
    // this.propList.forEach((prop, index) =>
    // filterObj.message_props += prop + (index !== (this.propList.length - 1) ? ',' : ''));
    let measured_message_props = '';
    let edge_derived_message_props = '';
    let cloud_derived_message_props = '';
    propArr.forEach((prop, index) => {
      if (prop.type === 'Edge Derived Properties') {
        edge_derived_message_props = edge_derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
      } else if (prop.type === 'Cloud Derived Properties') {
        cloud_derived_message_props = cloud_derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
      } else {
        measured_message_props = measured_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
      }
    });
    measured_message_props = measured_message_props.replace(/,\s*$/, '');
    edge_derived_message_props = edge_derived_message_props.replace(/,\s*$/, '');
    cloud_derived_message_props = cloud_derived_message_props.replace(/,\s*$/, '');
    filterObj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
    filterObj['edge_derived_message_props'] = edge_derived_message_props ? edge_derived_message_props : undefined;
    filterObj['cloud_derived_message_props'] = cloud_derived_message_props ? cloud_derived_message_props : undefined;
    if (this.historicalDateFilter.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.historicalDateFilter.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
      // filterObj.last_n_secs = this.historicalDateFilter.last_n_secs;
    } else {
      filterObj.from_date = this.historicalDateFilter.from_date;
      filterObj.to_date = this.historicalDateFilter.to_date;
    }
    // filterObj.from_date = moment().subtract(30, 'minutes').utc().unix();
    // filterObj.to_date = now;
    let method;
    // if (filterObj.to_date - filterObj.from_date > 3600 && !this.historicalDateFilter.isTypeEditable) {
    //   this.historicalDateFilter.isTypeEditable = true;
    //   this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
    //   this.isTelemetryDataLoading = false;
    //   this.isFilterSelected = false;
    //   return;
    // }
    const record = this.commonService.calculateEstimatedRecords(this.frequency, filterObj.from_date, filterObj.to_date);
    if (record > this.noOfRecords && !this.historicalDateFilter.isTypeEditable) {
      this.historicalDateFilter.isTypeEditable = true;
      this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
      this.isTelemetryDataLoading = false;
      this.isFilterSelected = false;
      return;
    }
    const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    pagefilterObj['hierarchy'] = filterObj.asset.hierarchy;
    pagefilterObj['assets'] = filterObj.asset;
    pagefilterObj['from_date'] = filterObj.from_date;
    pagefilterObj['to_date'] = filterObj.to_date;
    pagefilterObj['dateOption'] = this.historicalDateFilter.dateOption;
    //this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
    const asset = this.assets.find((assetObj) => assetObj.asset_id === filterObj.asset_id);
    filterObj.partition_key = asset.partition_key;
    delete filterObj.count;
    delete filterObj.asset;
    filterObj.order_dir = 'ASC';
    if (this.historicalDateFilter.isTypeEditable) {
      if (this.historicalDateFilter.type) {
        if (!this.historicalDateFilter.sampling_time || !this.historicalDateFilter.sampling_format) {
          this.toasterService.showError('Sampling time and format is required.', 'View Telemetry');
          this.isTelemetryDataLoading = false;
          this.isFilterSelected = false;
          return;
        } else {
          delete filterObj.aggregation_minutes;
          delete filterObj.aggregation_format;
          const records = this.commonService.calculateEstimatedRecords(
            this.historicalDateFilter.sampling_time * 60,
            filterObj.from_date,
            filterObj.to_date
          );
          if (records > this.noOfRecords) {
            this.loadingMessage =
              'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
          }
          filterObj.sampling_time = this.historicalDateFilter.sampling_time;
          filterObj.sampling_format = this.historicalDateFilter.sampling_format;
          method = this.assetService.getAssetSamplingTelemetry(filterObj, this.contextApp.app);
        }
      } else {
        if (!this.historicalDateFilter.aggregation_minutes || !this.historicalDateFilter.aggregation_format) {
          this.toasterService.showError('Aggregation time and format is required.', 'View Telemetry');
          this.isTelemetryDataLoading = false;
          this.isFilterSelected = false;
          return;
        } else {
          delete filterObj.sampling_time;
          delete filterObj.sampling_format;
          filterObj.aggregation_minutes = this.historicalDateFilter.aggregation_minutes;
          filterObj.aggregation_format = this.historicalDateFilter.aggregation_format;
          const records = this.commonService.calculateEstimatedRecords(
            this.historicalDateFilter.aggregation_minutes * 60,
            filterObj.from_date,
            filterObj.to_date
          );
          this.loadingMessage =
            'Loading ' + records + ' data points.' + (records > 100 ? 'It may take some time.' : '') + 'Please wait...';
          method = this.assetService.getAssetTelemetry(filterObj);
        }
      }
    } else {
      delete filterObj.aggregation_minutes;
      delete filterObj.aggregation_format;
      delete filterObj.sampling_time;
      delete filterObj.sampling_format;
      const records = this.commonService.calculateEstimatedRecords(
        this.frequency,
        filterObj.from_date,
        filterObj.to_date
      );
      if (records > this.noOfRecords) {
        this.loadingMessage =
          'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
      }
      method = this.assetService.getAssetTelemetry(filterObj);
    }
    this.isTelemetryDataLoading = true;
    this.isFilterSelected = true;
    // this.y2AxisProps.forEach((prop, index) =>
    // filterObj.message_props += prop.id + (index !== (this.y2AxisProps.length - 1) ? ',' : ''));
    // if (filterObj.message_props.charAt(filterObj.message_props.length - 1) === ',') {
    //   filterObj.message_props = filterObj.message_props.substring(0, filterObj.message_props.length - 1);
    // }
    this.apiSubscriptions.push(
      method.subscribe((response: any) => {
        if (response && response.data) {
          this.telemetryData = response.data;
          this.telemetryData = this.telemetryData.concat(this.derivedKPIHistoricData);
          const nullValueArr = [];
          propArr.forEach((prop, index) => {
            let flag = false;
            for (let i = 0; i < this.telemetryData.length; i++) {
              if (response.data[i][prop.json_key] !== null && response.data[i][prop.json_key] !== undefined) {
                flag = false;
                break;
              } else {
                delete response.data[i][prop.json_key];
                flag = true;
              }
            }
            if (flag) {
              nullValueArr.push(prop.json_key);
            }
          });
          let telemetryData = JSON.parse(JSON.stringify(this.telemetryData));
          telemetryData.forEach((item) => {
            item.message_date = this.commonService.convertUTCDateToLocal(item.message_date);
            // item.message_date = new Date(item.message_date);
            item.message_date_obj = new Date(item.message_date);
          });
          telemetryData = this.commonService.sortDataBaseOnTime(telemetryData, 'message_date');
          this.isTelemetryDataLoading = false; // this.loadLineChart(telemetryData);
          if (telemetryData.length > 0) {
            this.historicalDateFilter.widgets?.forEach((widget) => {
              let noDataFlag = true;
              widget.y1axis?.forEach((prop, index) => {
                if (nullValueArr.indexOf(prop.json_key) === -1) {
                  noDataFlag = false;
                }
              });
              if (noDataFlag) {
                widget.y2axis?.forEach((prop, index) => {
                  if (nullValueArr.indexOf(prop.json_key) === -1) {
                    noDataFlag = false;
                  }
                });
              }
              let componentRef;
              if (widget.chartType === 'LineChart' || widget.chartType === 'AreaChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(LiveChartComponent).create(this.injector);
              } else if (widget.chartType === 'ColumnChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(ColumnChartComponent).create(this.injector);
              } else if (widget.chartType === 'BarChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(BarChartComponent).create(this.injector);
              } else if (widget.chartType === 'PieChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(PieChartComponent).create(this.injector);
              } else if (widget.chartType === 'Table') {
                componentRef = this.factoryResolver.resolveComponentFactory(DataTableComponent).create(this.injector);
              } else if (widget.chartType === 'VibrationDamagePlot') {
                componentRef = this.factoryResolver
                  .resolveComponentFactory(DamagePlotChartComponent)
                  .create(this.injector);
              }
              if (widget.chartType === 'Table') {
                let reverseTelemetry = Object.assign([], telemetryData);
                componentRef.instance.telemetryData = noDataFlag ? [] : reverseTelemetry.reverse();
              }
              else
                componentRef.instance.telemetryData = noDataFlag ? [] : telemetryData;
              componentRef.instance.propertyList = this.propertyList;
              componentRef.instance.y1AxisProps = widget.y1axis;
              componentRef.instance.y2AxisProps = widget.y2axis;
              componentRef.instance.xAxisProps = widget.xAxis;
              componentRef.instance.chartType = widget.chartType;
              componentRef.instance.chartConfig = widget;
              componentRef.instance.chartStartdate = filterObj.from_date;
              componentRef.instance.chartEnddate = filterObj.to_date;
              componentRef.instance.chartHeight = '23rem';
              componentRef.instance.chartWidth = '100%';
              componentRef.instance.chartTitle = widget.title;
              componentRef.instance.chartId = widget.chart_Id;
              this.appRef.attachView(componentRef.hostView);
              const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
              document.getElementById('historic_charts').prepend(domElem);
            });
          }
        }
      })
    );
  }

  processTelemetryData(telemetryObj) {
    telemetryObj.date = this.commonService.convertUTCDateToLocal(telemetryObj.timestamp || telemetryObj.ts);
    telemetryObj.message_date = this.commonService.convertUTCDateToLocal(telemetryObj.timestamp || telemetryObj.ts);
    this.sampleCountArr[0] = this.sampleCountArr[0] + 1;
    if (environment.app === 'SopanCMS') {
      if (environment.app === 'SopanCMS') {
        this.latestRunningHours = telemetryObj[this.getPropertyKey('Running Hours')];
        this.latestRunningMinutes = telemetryObj[this.getPropertyKey('Running Minutes')];
      }
      this.getTimeDifference(
        Math.floor(Number(this.latestRunningHours)),
        Math.floor(Number(this.latestRunningMinutes))
      );
    }
    if (this.telemetryObj) {
      const interval = datefns.differenceInMilliseconds(new Date(telemetryObj.message_date), new Date(this.telemetryObj.message_date)) / 1000;
      this.telemetryInterval = interval;
    }
    const obj = this.telemetryObj ? JSON.parse(JSON.stringify(this.telemetryObj)) : {};
    this.widgetPropertyList.forEach((prop) => {
      if (prop?.json_key && telemetryObj[prop.json_key] !== undefined && telemetryObj[prop.json_key] !== null) {
        obj[prop?.json_key] = {
          value: telemetryObj[prop?.json_key],
          date: telemetryObj.date,
        };
      }
    });
    obj['previous_properties'] = this.previousProperties;
    obj['message_date'] = telemetryObj.message_date;
    this.telemetryObj = obj;
    this.previousProperties = [];
    Object.keys(this.telemetryObj).forEach((key) => this.previousProperties.push(key));
    this.lastReportedTelemetryValues = obj;
    if (this.telemetryData.length >= 15) {
      this.telemetryData.splice(0, 1);
    }
    this.telemetryData.push(this.telemetryObj);
    this.telemetryData = JSON.parse(JSON.stringify(this.telemetryData));
  }

  getPropertyKey(name) {
    return this.propertyList.filter((prop) => prop.name === name)[0]?.json_key || name;
  }

  getMidNightHours(filterObj) {
    return new Promise<void>((resolve1, reject) => {
      const obj = { ...filterObj };
      obj.order_dir = 'ASC';
      let message_props = '';
      this.propertyList.forEach((prop, index) => {
        if (
          prop.json_key === this.getPropertyKey('Running Hours') ||
          prop.json_key === this.getPropertyKey('Running Minutes')
        ) {
          message_props = message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : '');
        }
      });

      obj.message_props = message_props;
      obj.partition_key = this.filterObj?.asset?.partition_key;
      this.apiSubscriptions.push(
        this.assetService.getFirstTelmetry(this.contextApp.app, obj).subscribe(
          (response: any) => {
            this.midNightHour = response.message[this.getPropertyKey('Running Hours')]
              ? Math.floor(Number(response.message[this.getPropertyKey('Running Hours')]))
              : 0;
            this.midNightMinute = response.message[this.getPropertyKey('Running Minutes')]
              ? Math.floor(Number(response.message[this.getPropertyKey('Running Minutes')]))
              : 0;
            resolve1();
          },
          (error) => {
            // this.isTelemetryDataLoading = false;
            // alert('111111');
            resolve1();
          }
        )
      );
    });
  }

  getTimeDifference(hour, minute) {
    if (
      this.midNightHour !== undefined &&
      this.midNightHour !== null &&
      this.midNightMinute !== undefined &&
      this.midNightMinute !== null &&
      hour !== undefined &&
      hour !== null &&
      minute !== undefined &&
      minute !== null
    ) {
      const midNightTime = this.midNightHour * 60 + this.midNightMinute;
      const currentTime = Number(hour) * 60 + Number(minute);
      const diff = currentTime - midNightTime;
      this.currentHour = Math.floor(diff / 60);
      this.currentMinute = diff - this.currentHour * 60;
    }
  }

  onAssetSelection() {
    if (this.filterObj?.assetArr.length > 0) {
      this.filterObj.asset = this.filterObj.assetArr[0];
    } else {
      this.filterObj.asset = undefined;
      this.filterObj.assetArr = undefined;
    }
  }

  onAssetDeselect() {
    this.filterObj.asset = undefined;
    this.filterObj.assetArr = undefined;
  }

  getAssetderivedKPIs(assetId) {
    return new Promise<void>((resolve) => {
      this.apiSubscriptions.push(
        this.assetService.getDerivedKPIs(this.contextApp.app, assetId).subscribe((response: any) => {
          if (response && response.data) {
            this.derivedKPIs = response.data;
          } else if (response?.derived_kpis) {
            this.derivedKPIs = response.derived_kpis;
          }
          this.derivedKPIs.forEach((kpi) => kpi.type === 'Derived KPI');
          resolve();
        })
      );
    });
  }

  getAssetsModelProperties(assetModel) {
    return new Promise<void>((resolve1) => {
      if (this.propertyList.length === 0) {
        const obj = {
          app: this.contextApp.app,
          name: assetModel,
        };
        this.apiSubscriptions.push(
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
              this.derivedKPIs.forEach((kpi) => {
                const obj: any = {};
                obj.type = 'Derived KPIs';
                obj.name = kpi.name;
                obj.json_key = kpi.kpi_json_key;
                obj.json_model = {};
                obj.json_model[obj.json_key] = {};
                this.propertyList.push(obj);
              });
              resolve1();
            },
            (error) => (this.isTelemetryDataLoading = false)
          )
        );
      } else {
        resolve1();
      }
    });
  }

  getTelemetryMode(assetId) {
    // this.signalRModeValue = true;
    this.apiSubscriptions.push(
      this.assetService.getTelemetryMode(this.contextApp.app, assetId).subscribe(
        (response: any) => {
          const newMode =
            response?.mode?.toLowerCase() === 'normal'
              ? false
              : response?.mode?.toLowerCase() === 'turbo'
                ? true
                : false;
          if (this.signalRModeValue === newMode) {
            // $('#overlay').hide();
            this.isC2dAPILoading = false;
            this.c2dResponseMessage = [];
            this.c2dLoadingMessage = undefined;
            clearInterval(this.c2dResponseInterval);
          } else {
            const arr = [];
            this.telemetryData = JSON.parse(JSON.stringify([]));
            this.chartService.clearDashboardTelemetryList.emit([]);
            this.telemetryData = JSON.parse(JSON.stringify(arr));
          }
          this.signalRModeValue = newMode;
          this.isTelemetryModeAPICalled = false;
        },
        (error) => (this.isTelemetryDataLoading = false)
      )
    );
  }

  openControlPropertiesModal() {
    this.isOpenControlPropertiesModal = true;

  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    clearInterval(this.c2dResponseInterval);
    this.signalRTelemetrySubscription?.unsubscribe();
    this.signalRService.disconnectFromSignalR('telemetry');
    clearInterval(this.c2dResponseInterval);
    this.apiSubscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
