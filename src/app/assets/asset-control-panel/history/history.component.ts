import { ColumnChartComponent } from 'src/app/common/charts/column-chart/column-chart.component';
import { ChartService } from './../../../chart/chart.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import {
  Component,
  OnInit,
  Input,
  ComponentFactoryResolver,
  ApplicationRef,
  Injector,
  EmbeddedViewRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AssetService } from './../../../services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { Asset } from 'src/app/models/asset.model';
import { CONSTANTS } from './../../../app.constants';
import * as moment from 'moment';
import { ToasterService } from './../../../services/toaster.service';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from 'src/app/common/charts/pie-chart/pie-chart.component';
import { DataTableComponent } from 'src/app/common/charts/data-table/data-table.component';
import { DamagePlotChartComponent } from 'src/app/common/charts/damage-plot-chart/damage-plot-chart.component';
declare var $: any;
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit, OnDestroy {
  historyFilter: any = {};
  apiSubscriptions: Subscription[] = [];
  historyData: any[] = [];
  isHistoryAPILoading = false;
  loadingMessage: string;
  @Input() asset = new Asset();
  isLayout = false;
  userData: any;
  isFilterSelected = false;
  propertyList: any[] = [];
  dropdownPropList = [];
  y1AxisProps = [];
  y2AxisProp = [];
  derivedKPIs: any[] = [];
  derivedKPIHistoricData: any[] = [];
  nullValueArr = [];
  xAxisProps = '';

  // chart selection
  chartCount = 0;
  columnNames = [];
  layoutJson = [];
  chartTitle = '';
  showDataTable = false;
  selectedHierarchy = '';
  renderCount = 0;
  selectedWidgets = [];
  dropdownWidgetList = [];
  propList: any[];
  selectedPropertyForChart: any[];
  showThreshold = false;
  contextApp: any;
  fromDate: any;
  toDate: any;
  today = new Date();
  dateRange: string;
  selectedDateRange: string;
  decodedToken: any;
  isShowOpenFilter = true;
  frequency: any;
  constructor(
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private chartService: ChartService
  ) {}
  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    await this.getAssetderivedKPIs(this.asset.asset_id);
    await this.getAssetsModelProperties();
    this.historyFilter.app = this.contextApp.app;
    this.historyFilter.epoch = true;
    if (this.asset.tags.category === CONSTANTS.IP_GATEWAY) {
      this.historyFilter.gateway_id = this.asset.asset_id;
    } else {
      this.historyFilter.asset_id = this.asset.asset_id;
    }
    this.historyFilter.sampling_format = 'minute';
    this.historyFilter.sampling_time = 1;
    this.historyFilter.aggregation_minutes = 1;
    this.historyFilter.aggregation_format = 'AVG';
    this.historyFilter.type = true;
    if (this.propertyList) {
      this.propertyList.forEach((item) => {
        this.dropdownPropList.push({
          id: item.json_key,
        });
      });
    }
    this.isHistoryAPILoading = true;
    const frequencyArr = [];
    frequencyArr.push(this.asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
    frequencyArr.push(this.asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
    frequencyArr.push(this.asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
    this.frequency = this.commonService.getLowestValueFromList(frequencyArr);
    this.getLayout();
    this.loadFromCache();
    this.historyFilter.type = true;
    if ($(window).width() < 992) {
      this.isShowOpenFilter = false;
    }
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.historyFilter.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.historyFilter.from_date = dateObj.from_date;
        this.historyFilter.to_date = dateObj.to_date;
      } else {
        this.historyFilter.from_date = item.from_date;
        this.historyFilter.to_date = item.to_date;
      }
      if (this.historyFilter.dateOption !== 'Custom Range') {
        this.selectedDateRange = this.historyFilter.dateOption;
      } else {
        this.selectedDateRange =
          moment.unix(this.historyFilter.from_date).format('DD-MM-YYYY HH:mm') +
          ' to ' +
          moment.unix(this.historyFilter.to_date).format('DD-MM-YYYY HH:mm');
      }
      // if (this.historyFilter.to_date - this.historyFilter.from_date > 3600) {
      //   this.historyFilter.isTypeEditable = true;
      // } else {
      //   this.historyFilter.isTypeEditable = false;
      // }
      const records = this.commonService.calculateEstimatedRecords(
        this.frequency,
        this.historyFilter.from_date,
        this.historyFilter.to_date
      );
      if (records > CONSTANTS.NO_OF_RECORDS) {
        this.historyFilter.isTypeEditable = true;
      } else {
        this.historyFilter.isTypeEditable = false;
      }
    }
    this.historyFilter.type = true;
    console.log(this.historyFilter);
  }

  onNumberChange(event, type) {
    if (Number(event.target.value) % 1 !== 0) {
      this.toasterService.showError('Decimal values are not allowed.', 'View History');
      if (type === 'aggregation') {
        this.historyFilter.aggregation_minutes = Math.floor(Number(event.target.value));
      } else {
        this.historyFilter.sampling_time = Math.floor(Number(event.target.value));
      }
    }
  }

  getAssetderivedKPIs(assetId) {
    return new Promise<void>((resolve) => {
      this.apiSubscriptions.push(
        this.assetService.getDerivedKPIs(this.contextApp.app, assetId).subscribe((response: any) => {
          if (response && response.data) {
            this.derivedKPIs = response.data;
            console.log(this.derivedKPIs);
          } else if (response?.derived_kpis) {
            this.derivedKPIs = response.derived_kpis;
          }
          this.derivedKPIs.forEach((kpi) => kpi.type === 'Derived KPI');
          resolve();
        })
      );
    });
  }

  getAssetsModelProperties() {
    // this.properties = {};
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: this.asset.tags.asset_model,
      };
      this.apiSubscriptions.push(
        this.assetModelService.getAssetsModelProperties(obj).subscribe((response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
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
          resolve();
        })
      );
    });
  }

  toggleProperty(prop) {
    const index = this.selectedPropertyForChart.indexOf(prop);
    if (index === -1) {
      this.selectedPropertyForChart.push(prop);
    } else {
      this.selectedPropertyForChart.splice(index, 1);
    }
    this.chartService.togglePropertyEvent.emit(prop);
  }

  toggleThreshold() {
    this.chartService.toggleThresholdEvent.emit(this.showThreshold);
  }

  selectedDate(filterObj: any) {
    this.historyFilter.from_date = filterObj.from_date;
    this.historyFilter.to_date = filterObj.to_date;
    this.historyFilter.dateOption = filterObj.dateOption;
    const records = this.commonService.calculateEstimatedRecords(
      this.frequency,
      this.historyFilter.from_date,
      this.historyFilter.to_date
    );
    if (records > CONSTANTS.NO_OF_RECORDS) {
      this.historyFilter.isTypeEditable = true;
    } else {
      this.historyFilter.isTypeEditable = false;
    }
  }

  getHistoricalWidgetsDrivedKPIDetails() {
    // this.propList = [];
    let kpiCodes = '';
    this.layoutJson.forEach((widget) => {
      widget.y1axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type === 'Derived KPIs') {
          this.propList.push(prop.json_key);
          const kpiObj = this.derivedKPIs.find((kpi) => kpi.kpi_json_key === prop.json_key);
          kpiCodes += kpiObj.code + ',';
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
        this.isHistoryAPILoading = true;
        const obj = {
          kpi_codes: kpiCodes,
          from_date: undefined,
          to_date: undefined,
        };
        const now = moment().utc().unix();
        if (this.historyFilter.dateOption !== 'Custom Range') {
          const dateObj = this.commonService.getMomentStartEndDate(this.historyFilter.dateOption);
          obj.from_date = dateObj.from_date;
          obj.to_date = dateObj.to_date;
        } else {
          obj.from_date = this.historyFilter.from_date;
          obj.to_date = this.historyFilter.to_date;
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

  searchHistory() {
    return new Promise<void>(async (resolve) => {
      const children = $('#widgetContainer').children();
      for (const child of children) {
        $(child).remove();
      }
      console.log('wdigetssss', this.selectedWidgets);
      this.propList = [];
      if (this.selectedWidgets.length === 0) {
        this.toasterService.showError('Please select widgets first.', 'View Widget');
        return;
      }

      this.selectedWidgets.forEach((widget) => {
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
      if (this.selectedWidgets.length > 3) {
        this.toasterService.showWarning('Select max 3 widgets for better performance.', 'Historical Visualization');
      }
      this.selectedPropertyForChart = [];
      this.selectedPropertyForChart = [...this.propList];
      this.historyFilter.app = this.contextApp.app;
      const currentHistoryFilter = { ...this.historyFilter };

      currentHistoryFilter.to_date = this.historyFilter.to_date;
      currentHistoryFilter.from_date = this.historyFilter.from_date;

      if (currentHistoryFilter.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(currentHistoryFilter.dateOption);
        currentHistoryFilter.from_date = dateObj.from_date;
        currentHistoryFilter.to_date = dateObj.to_date;
      } else {
        currentHistoryFilter.from_date = currentHistoryFilter.from_date;
        currentHistoryFilter.to_date = currentHistoryFilter.to_date;
      }
      const obj = { ...currentHistoryFilter };
      obj.partition_key = this.asset?.tags?.partition_key;
      delete obj.dateOption;
      obj.order_dir = 'ASC';
      const propArr = [];
      this.propertyList.forEach((propObj) => {
        this.propList.forEach((prop) => {
          if (prop === propObj.json_key) {
            propArr.push(propObj);
          }
        });
      });
      let method;
      if (!obj.to_date || !obj.from_date) {
        this.toasterService.showError('Date Selection is required', 'View Trend Analysis');
        return;
      }
      // if (obj.to_date - obj.from_date > 3600 && !this.historyFilter.isTypeEditable) {
      //   this.historyFilter.isTypeEditable = true;
      //   this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
      //   return;
      // }
      const record = this.commonService.calculateEstimatedRecords(this.frequency, obj.from_date, obj.to_date);
      if (record > CONSTANTS.NO_OF_RECORDS && !this.historyFilter.isTypeEditable) {
        this.historyFilter.isTypeEditable = true;
        this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
        return;
      }
      if (this.historyFilter.isTypeEditable) {
        if (this.historyFilter.type) {
          if (!this.historyFilter.sampling_time || !this.historyFilter.sampling_format) {
            this.toasterService.showError('Sampling time and format is required.', 'View Telemetry');
            return;
          } else {
            delete obj.aggregation_minutes;
            delete obj.aggregation_format;
            // obj.message_props = '';
            // this.propList.forEach((prop, index) =>
            // obj.message_props += prop + (index !== (this.propList.length - 1) ? ',' : ''));
            let measured_message_props = '';
            let edge_derived_message_props = '';
            let cloud_derived_message_props = '';

            propArr.forEach((prop, index) => {
              if (prop.type === 'Edge Derived Properties') {
                edge_derived_message_props =
                  edge_derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
              } else if (prop.type === 'Cloud Derived Properties') {
                cloud_derived_message_props =
                  cloud_derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
              } else {
                measured_message_props = measured_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
              }
            });
            measured_message_props = measured_message_props.replace(/,\s*$/, '');
            edge_derived_message_props = edge_derived_message_props.replace(/,\s*$/, '');
            cloud_derived_message_props = cloud_derived_message_props.replace(/,\s*$/, '');
            obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
            obj['edge_derived_message_props'] = edge_derived_message_props ? edge_derived_message_props : undefined;
            obj['cloud_derived_message_props'] = cloud_derived_message_props ? cloud_derived_message_props : undefined;
            const records = this.commonService.calculateEstimatedRecords(
              this.historyFilter.sampling_time * 60,
              obj.from_date,
              obj.to_date
            );
            if (records > CONSTANTS.NO_OF_RECORDS) {
              this.loadingMessage =
                'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
            }
            method = this.assetService.getAssetSamplingTelemetry(obj, this.contextApp.app);
          }
        } else {
          if (!this.historyFilter.aggregation_minutes || !this.historyFilter.aggregation_format) {
            this.toasterService.showError('Aggregation time and format is required.', 'View Telemetry');
            return;
          } else {
            delete obj.sampling_time;
            delete obj.sampling_format;
            let measured_message_props = '';
            let edge_derived_message_props = '';
            let cloud_derived_message_props = '';
            propArr.forEach((prop, index) => {
              if (prop.type === 'Edge Derived Properties') {
                edge_derived_message_props =
                  edge_derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
              } else if (prop.type === 'Cloud Derived Properties') {
                cloud_derived_message_props =
                  cloud_derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
              } else {
                measured_message_props = measured_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
              }
            });
            measured_message_props = measured_message_props.replace(/,\s*$/, '');
            edge_derived_message_props = edge_derived_message_props.replace(/,\s*$/, '');
            cloud_derived_message_props = cloud_derived_message_props.replace(/,\s*$/, '');
            obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
            obj['edge_derived_message_props'] = edge_derived_message_props ? edge_derived_message_props : undefined;
            obj['cloud_derived_message_props'] = cloud_derived_message_props ? cloud_derived_message_props : undefined;
            const records = this.commonService.calculateEstimatedRecords(
              this.historyFilter.aggregation_minutes * 60,
              obj.from_date,
              obj.to_date
            );
            if (records > CONSTANTS.NO_OF_RECORDS) {
              this.loadingMessage =
                'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
            }
            method = this.assetService.getAssetTelemetry(obj);
          }
        }
      } else {
        delete obj.aggregation_minutes;
        delete obj.aggregation_format;
        delete obj.sampling_time;
        delete obj.sampling_format;
        if (this.propList.length === this.propertyList.length) {
          obj['all_message_props'] = true;
        } else {
          let measured_message_props = '';
          let edge_derived_message_props = '';
          let cloud_derived_message_props = '';
          propArr.forEach((prop, index) => {
            if (prop.type === 'Edge Derived Properties') {
              edge_derived_message_props = edge_derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
            } else if (prop.type === 'Cloud Derived Properties') {
              cloud_derived_message_props =
                cloud_derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
            } else {
              measured_message_props = measured_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
            }
          });
          measured_message_props = measured_message_props.replace(/,\s*$/, '');
          edge_derived_message_props = edge_derived_message_props.replace(/,\s*$/, '');
          cloud_derived_message_props = cloud_derived_message_props.replace(/,\s*$/, '');
          obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
          obj['edge_derived_message_props'] = edge_derived_message_props ? edge_derived_message_props : undefined;
          obj['cloud_derived_message_props'] = cloud_derived_message_props ? cloud_derived_message_props : undefined;
        }
        const frequencyArr = [];
        frequencyArr.push(this.asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
        frequencyArr.push(this.asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
        frequencyArr.push(this.asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
        const frequency = this.commonService.getLowestValueFromList(frequencyArr);
        const records = this.commonService.calculateEstimatedRecords(frequency, obj.from_date, obj.to_date);
        if (records > CONSTANTS.NO_OF_RECORDS) {
          this.loadingMessage =
            'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
        }
        method = this.assetService.getAssetTelemetry(obj);
      }
      this.historyData = [];
      await this.getHistoricalWidgetsDrivedKPIDetails();
      this.fromDate = obj.from_date;
      this.toDate = obj.to_date;
      this.isHistoryAPILoading = true;
      this.nullValueArr = [];
      this.apiSubscriptions.push(
        method.subscribe(
          (response: any) => {
            this.isFilterSelected = true;
            if (response && response.data) {
              let historyData = [];
              historyData = response.data;
              this.historyData = historyData;
              this.historyData = response.data;
              this.historyData = this.historyData.concat(this.derivedKPIHistoricData);
              this.nullValueArr = [];
              propArr.forEach((prop) => {
                let flag = false;
                for (let i = 0; i < this.historyData.length; i++) {
                  if (this.historyData[i][prop.json_key] !== null && this.historyData[i][prop.json_key] !== undefined) {
                    flag = false;
                    break;
                  } else {
                    flag = true;
                  }
                }
                if (flag) {
                  this.nullValueArr.push(prop.json_key);
                }
              });
              console.log(this.nullValueArr);
              this.historyData = this.commonService.sortDataBaseOnTime(this.historyData, 'message_date');
              this.isHistoryAPILoading = false;
              // historyData.reverse();
              resolve();
            }
            if (this.historyFilter.dateOption !== 'Custom Range') {
              this.dateRange = this.historyFilter.dateOption;
            } else {
              this.dateRange = 'this selected range';
            }
          },
          () => (this.isHistoryAPILoading = false)
        )
      );
    });
  }

  getPropertyName(key) {
    return this.propertyList.filter((prop) => prop.json_key === key)[0]?.name || key;
  }

  onDeSelectAll(event) {
    this.selectedWidgets = [];
  }

  clear() {
    this.historyFilter = {};
    this.historyFilter.from_date = undefined;
    this.historyFilter.to_date = undefined;
    this.historyFilter.epoch = true;
    this.historyFilter.asset_id = this.asset.asset_id;
    this.historyFilter.app = this.contextApp.app;
    this.historyFilter.sampling_format = 'minute';
    this.historyFilter.sampling_time = 1;
    this.historyFilter.aggregation_minutes = 1;
    this.historyFilter.aggregation_format = 'AVG';
    this.historyFilter.type = true;
    this.chartTitle = '';
    this.xAxisProps = '';
    this.y1AxisProps = [];
    this.y2AxisProp = [];
    this.selectedWidgets = [];
    this.historyFilter.dateOption = 'Last 30 Mins';
    if (this.historyFilter.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.historyFilter.dateOption;
      const dateObj = this.commonService.getMomentStartEndDate(this.historyFilter.dateOption);
      this.historyFilter.from_date = dateObj.from_date;
      this.historyFilter.to_date = dateObj.to_date;
    } else {
      this.selectedDateRange =
        moment.unix(this.historyFilter.from_date).format('DD-MM-YYYY HH:mm') +
        ' to ' +
        moment.unix(this.historyFilter.to_date).format('DD-MM-YYYY HH:mm');
    }

    // if (this.historyFilter.to_date - this.historyFilter.from_date > 3600) {
    //   this.historyFilter.isTypeEditable = true;
    // } else {
    //   this.historyFilter.isTypeEditable = false;
    // }
    const records = this.commonService.calculateEstimatedRecords(
      this.frequency,
      this.historyFilter.from_date,
      this.historyFilter.to_date
    );
    if (records > CONSTANTS.NO_OF_RECORDS) {
      this.historyFilter.isTypeEditable = true;
    } else {
      this.historyFilter.isTypeEditable = false;
    }
  }

  onDateChange(event) {
    this.historyFilter.from_date = moment(event.value[0]).utc();
    this.historyFilter.to_date = moment(event.value[1]).utc();
    if (this.historyFilter.dateOption !== 'date range') {
      this.historyFilter.dateOption = undefined;
    }
    const from = this.historyFilter.from_date.unix();
    const to = this.historyFilter.to_date.unix();
    // if (to - from > 3600) {
    //   this.historyFilter.isTypeEditable = true;
    // } else {
    //   this.historyFilter.type = true;
    //   this.historyFilter.isTypeEditable = false;
    // }
    const records = this.commonService.calculateEstimatedRecords(this.frequency, from, to);
    if (records > CONSTANTS.NO_OF_RECORDS) {
      this.historyFilter.isTypeEditable = true;
    } else {
      this.historyFilter.type = true;
      this.historyFilter.isTypeEditable = false;
    }
  }

  setChartType() {
    // this.selectedChartType = this.chartTypeValues[chartTypeIndex];
    // if (this.selectedChartType.indexOf('Pie') >= 0) {
    //   document.getElementById("y1AxisProperty")['disabled'] = true
    //   document.getElementById("y2AxisProperty")['disabled'] = true
    //   document.getElementById("y1AxisProperty")['value'] = ""
    //   document.getElementById("y2AxisProperty")['value'] = ""
    // } else {
    //   document.getElementById("y1AxisProperty")['disabled'] = false
    //   document.getElementById("y2AxisProperty")['disabled'] = false
    // }
  }

  addChart() {
    this.plotChart(null).then(
      (chart: any) => {
        if (!chart.y1axis) {
          chart.y1axis = [];
        }
        if (!chart.y2axis) {
          chart.y2axis = [];
        }
        this.layoutJson.push(chart);
      },
      (err) => {
        this.toasterService.showError(err, 'Load Chart');
      }
    );
  }

  plotChart(layoutJson) {
    return new Promise<void>((resolve) => {
      $('.overlay').show();
      this.chartCount++;
      const y1Axis = layoutJson.y1axis;
      const y2Axis = layoutJson.y2axis;
      const data = [];
      let noDataFlag = true;
      y1Axis?.forEach((prop, index) => {
        if (this.nullValueArr.indexOf(prop.json_key) === -1) {
          noDataFlag = false;
        }
      });
      if (noDataFlag) {
        y2Axis?.forEach((prop, index) => {
          if (this.nullValueArr.indexOf(prop.json_key) === -1) {
            noDataFlag = false;
          }
        });
      }
      // this.historyData.forEach((item) => {
      //   const obj = {
      //     message_date: this.commonService.convertUTCDateToLocal(item.message_date),
      //   };
      //   y1Axis.forEach((element) => (obj[element.json_key] = item[element.json_key]));
      //   y2Axis.forEach((element) => (obj[element.json_key] = item[element.json_key]));
      //   data.splice(data.length, 0, obj);
      // });
      let componentRef;
      if (layoutJson.chartType === 'LineChart' || layoutJson.chartType === 'AreaChart') {
        componentRef = this.factoryResolver.resolveComponentFactory(LiveChartComponent).create(this.injector);
      } else if (layoutJson.chartType === 'ColumnChart') {
        componentRef = this.factoryResolver.resolveComponentFactory(ColumnChartComponent).create(this.injector);
      } else if (layoutJson.chartType === 'BarChart') {
        componentRef = this.factoryResolver.resolveComponentFactory(BarChartComponent).create(this.injector);
      } else if (layoutJson.chartType === 'PieChart') {
        componentRef = this.factoryResolver.resolveComponentFactory(PieChartComponent).create(this.injector);
      } else if (layoutJson.chartType === 'Table') {
        componentRef = this.factoryResolver.resolveComponentFactory(DataTableComponent).create(this.injector);
      } else if (layoutJson.chartType === 'VibrationDamagePlot') {
        componentRef = this.factoryResolver.resolveComponentFactory(DamagePlotChartComponent).create(this.injector);
      }
      console.log(noDataFlag, '======', this.historyData);
      componentRef.instance.telemetryData = noDataFlag ? [] : JSON.parse(JSON.stringify(this.historyData));
      componentRef.instance.propertyList = this.propertyList;
      componentRef.instance.y1AxisProps = layoutJson.y1axis;
      componentRef.instance.y2AxisProps = layoutJson.y2axis;
      componentRef.instance.xAxisProps = layoutJson.xAxis;
      componentRef.instance.chartType = layoutJson.chartType;
      componentRef.instance.chartConfig = layoutJson;
      componentRef.instance.chartHeight = '23rem';
      componentRef.instance.asset = this.asset;
      componentRef.instance.chartStartdate = this.fromDate;
      componentRef.instance.chartEnddate = this.toDate;
      componentRef.instance.chartWidth = '100%';
      componentRef.instance.chartTitle = layoutJson.title;
      componentRef.instance.chartId = layoutJson.chart_Id;
      this.appRef.attachView(componentRef.hostView);
      const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
      document.getElementById('widgetContainer').prepend(domElem);
      resolve();
    });
  }

  async renderLayout() {
    this.chartService.disposeChartEvent.emit();
    await this.searchHistory();
    const children = $('#widgetContainer').children();
    for (const child of children) {
      $(child).remove();
    }
    let widgetsToLoad = [];
    if (this.selectedWidgets.length > 0) {
      this.selectedWidgets.forEach((item) => {
        widgetsToLoad.push(item);
      });
    } else {
      widgetsToLoad = this.layoutJson;
    }

    if (this.layoutJson && this.historyData.length > 0) {
      widgetsToLoad.map(async (currentChart) => {
        this.renderCount++;
        currentChart['chartCount'] = this.renderCount;
        await this.plotChart(currentChart);
      });
    } else {
      if (this.layoutJson.length === 0) {
        this.toasterService.showError('Layout not defined', 'Historical Widgets');
        return;
      }
      if (this.historyData.length === 0) {
        this.toasterService.showError('No data available for selected filter.', 'Historical Widgets');
        return;
      }
    }
  }

  getLayout() {
    const params = {
      app: this.contextApp.app,
      name: this.asset?.tags?.asset_model,
    };
    this.selectedWidgets = [];
    this.layoutJson = [];
    this.apiSubscriptions.push(
      this.assetModelService.getAssetsModelLayout(params).subscribe(async (response: any) => {
        if (response?.historical_widgets?.length > 0) {
          this.layoutJson = response.historical_widgets;
          this.layoutJson.forEach((item) => {
            item.edge_derived_props = false;
            item.measured_props = false;
            item.cloud_derived_props = false;
            item.derived_kpis = false;
            item.y1axis.forEach((prop) => {
              if (prop.type === 'Derived KPIs') {
                item.derived_kpis = true;
              } else if (prop.type === 'Edge Derived Properties') {
                item.edge_derived_props = true;
              } else if (prop.type === 'Cloud Derived Properties') {
                item.cloud_derived_props = true;
              } else {
                item.measured_props = true;
              }
            });
            item.y2axis.forEach((prop) => {
              if (prop.type === 'Derived KPIs') {
                item.derived_kpis = true;
              } else if (prop.type === 'Edge Derived Properties') {
                item.edge_derived_props = true;
              } else if (prop.type === 'Cloud Derived Properties') {
                item.cloud_derived_props = true;
              } else {
                item.measured_props = true;
              }
            });
          });
        }
        this.isHistoryAPILoading = false;
      })
    );
  }

  y1Deselect(e) {
    if (e === [] || e.length === 0) {
      this.y1AxisProps = [];
    }
  }
  y2Deselect(e) {
    if (e === [] || e.length === 0) {
      this.y2AxisProp = [];
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
