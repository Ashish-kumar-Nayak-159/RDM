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
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { ColumnChartComponent } from 'src/app/common/charts/column-chart/column-chart.component';
import { DataTableComponent } from 'src/app/common/charts/data-table/data-table.component';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { PieChartComponent } from 'src/app/common/charts/pie-chart/pie-chart.component';
import { DamagePlotChartComponent } from 'src/app/common/charts/damage-plot-chart/damage-plot-chart.component';
import { HierarchyDropdownComponent } from './../../common/hierarchy-dropdown/hierarchy-dropdown.component';

@Component({
  selector: 'app-app-dashboard-historical',
  templateUrl: './app-dashboard-historical.component.html',
  styleUrls: ['./app-dashboard-historical.component.css']
})
export class AppDashboardHistoricalComponent implements OnInit {
  defaultAppName = environment.app;
  decodedToken: any;
  userData: any;
  contextApp: any;
  noOfRecords = CONSTANTS.NO_OF_RECORDS;
  widgetStringFromMenu: string;
  tileData: any;
  filterObj: any = {};
  isFilterSelected = false;
  frequency: any;
  originalFilter: any;
  isTelemetryDataLoading = false;
  assets: any[] = [];
  apiSubscriptions: Subscription[] = [];
  historicalDateFilter: any = {};
  historicalWidgets: any[] = [];
  selectedDateRange: string;
  propertyList: any[] = [];
  c2dResponseMessage = [];
  assetDetailData: any;
  normalModelInterval: number;
  turboModeInterval: number;
  frequencyDiffInterval: number;
  sampleCountValue = 0;
  sampleCountArr = Array(60).fill(0);
  derivedKPIs: any[] = [];
  isGetWidgetsAPILoading = false;
  derivedKPIHistoricData: any[] = [];
  propList: any[];
  telemetryData: any[] = [];
  loadingMessage: string;
  telemetryObj: any;
  isShowOpenFilter = true;
  apiTelemetryObj: any;
  telemetryInterval;
  widgetPropertyList: any[] = [];
  isC2dAPILoading = false;
  c2dLoadingMessage: string;
  c2dResponseInterval: any;
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  dashistroicaldata:any;
  tempData: any;

  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private toasterService:ToasterService,
    private factoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,



  ) {

  }

  async ngOnInit() {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp.metadata?.filter_settings?.record_count) {
      this.noOfRecords = this.contextApp.metadata?.filter_settings?.record_count;
    }
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.getTileName();
    await this.getAssets(this.contextApp.user.hierarchy);
    this.onTabChange();
    if ($(window).width() < 992) {
      this.isShowOpenFilter = false;
    }

  }

  onTabChange() {
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

  async loadFromCache() {
    let item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    this.tempData = item;
    this.commonService.assetMonitoringFilterData.subscribe(async(data: any) => {
      this.dashistroicaldata = data;
      if(this.dashistroicaldata){
        this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, this.dashistroicaldata);
        item = undefined;
        await this.onSaveHierachy();
        this.hierarchyDropdown.updateHierarchyDetail(JSON.parse(JSON.stringify(this.dashistroicaldata)));
        this.filterObj.asset = this.dashistroicaldata.assets;
        await this.onChangeOfAsset(this.dashistroicaldata.assets)
        this.onFilterSelection(this.filterObj, false, true, true);
      }
    });
    if (item) {
      this.hierarchyDropdown.updateHierarchyDetail(JSON.parse(JSON.stringify(item)));
      if (item.assets) {
        this.filterObj.asset = item.assets;
        await this.onChangeOfAsset();
        this.onFilterSelection(this.filterObj, false, true, true);
      }
    }
  }


  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.page === 'Historical Trend') {
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

  onChangeOfAsset(asset?: any) {
    if(!asset){
      asset = this.assets.find((assetObj) => assetObj.asset_id === this.filterObj.asset.asset_id);
    }
    const frequencyArr = [];
    frequencyArr.push(asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
    frequencyArr.push(asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
    frequencyArr.push(asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
    this.frequency = this.commonService.getLowestValueFromList(frequencyArr);
    if (this.historicalDateFilter.from_date && this.historicalDateFilter.to_date) {
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

  async onSaveHierachy() {
      const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
      this.historicalDateFilter.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.historicalDateFilter.from_date = dateObj.from_date;
        this.historicalDateFilter.to_date = dateObj.to_date;
      } else {
        this.historicalDateFilter.from_date = item.from_date;
        this.historicalDateFilter.to_date = item.to_date;
      }
      this.historicalDateFilter.widgets = [];
      this.selectedDateRange = this.historicalDateFilter.dateOption;
      this.historicalDateFilter.type = true;
      this.historicalDateFilter.sampling_format = 'minute';
      this.historicalDateFilter.sampling_time = 1;

    this.selectedDateRange = ''
    this.historicalDateFilter.dateOption = ''
    const item1 = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    this.historicalDateFilter.dateOption = item1.dateOption
    setTimeout(() => {
      this.selectedDateRange = this.historicalDateFilter.dateOption
    }, 200);
    this.historicalWidgets = [];
  }


  onClearHierarchy() {
    this.isFilterSelected = false;
    this.originalFilter = JSON.parse(JSON.stringify(this.filterObj));
    this.frequency = undefined;
  }
  async onFilterSelection(filterObj, updateFilterObj = true, historicalWidgetUpgrade = false, isFromMainSearch = true) {
    this.propertyList = [];
    this.c2dResponseMessage = [];
    const obj = JSON.parse(JSON.stringify(filterObj));
    let asset_model: any;
    obj.asset_id = obj.asset.asset_id;
    asset_model = obj.asset.asset_model;
    delete obj.asset;
    this.originalFilter = JSON.parse(JSON.stringify(filterObj));
    this.isTelemetryDataLoading = true;
    await this.getAssetData();
    if (asset_model) {
      await this.getAssetderivedKPIs(this.filterObj.asset.asset_id);
      await this.getAssetsModelProperties(asset_model);
      this.sampleCountArr = Array(60).fill(0);
      this.sampleCountValue = 0;
      await this.getHistoricalWidgets(asset_model, historicalWidgetUpgrade);
      await this.getHistoricalWidgetsDrivedKPIDetails();
      if (!isFromMainSearch) {
        this.getHistoricalWidgetTelemetryDetails();
      } else {

        this.isTelemetryDataLoading = false;
        this.isFilterSelected = true;
      }

      // if (this.contextApp?.dashboard_config?.show_live_widgets) {
      //   await this.getLiveWidgets(asset_model);
      //   this.getLiveWidgetTelemetryDetails(obj);
      // } else if (this.contextApp?.dashboard_config?.show_historical_widgets) {
      //   await this.getHistoricalWidgets(asset_model, historicalWidgetUpgrade);
      //   await this.getHistoricalWidgetsDrivedKPIDetails();
      //   if (!isFromMainSearch) {
      //     this.getHistoricalWidgetTelemetryDetails();
      //   } else {
      //     this.isTelemetryDataLoading = false;
      //     this.isFilterSelected = true;
      //   }
      // }
    }
  }


  onDeSelectAll(event) {
    this.historicalDateFilter.widgets = [];
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
                  this.SetItemDetails(prop, item);
                });
                item.y2axis.forEach((prop) => {
                  this.SetItemDetails(prop, item);
                });
              });
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

  ngOnDestroy(){
    this.commonService.assetMonitoringFilterData.emit(null);
    delete this.tempData.assets;
    this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, this.tempData);
  }
}
