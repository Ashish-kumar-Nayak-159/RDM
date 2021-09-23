import { filter } from 'rxjs/operators';
import { AssetModelService } from './../../services/asset-model/asset-model.service';
import { ToasterService } from './../../services/toaster.service';
import { AssetService } from './../../services/assets/asset.service';
import { ApplicationService } from './../../services/application/application.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from './../../services/common.service';
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subscription } from 'rxjs';
import { DaterangepickerComponent } from 'ng2-daterangepicker';
declare var $: any;
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit, OnDestroy {
  userData: any;
  filterObj: any = {};
  contextApp: any;
  hierarchyArr: any = {};
  configureHierarchy: any = {};
  assets: any[] = [];
  nonIPAssets: any[] = [];
  originalAssets: any[] = [];
  isTelemetryLoading = false;
  telemetry: any[] = [];
  propertyList: any[] = [];
  dropdownPropList: any[] = [];
  latestAlerts: any[] = [];
  isFileDownloading = false;
  pdfOptions = {
    paperSize: 'A4',
    margin: { left: '0.75cm', top: '0.60cm', right: '0.75cm', bottom: '0.60cm' },
    scale: 0.42,
    landscape: true,
  };
  originalFilterObj: any = {};
  tabType;
  isFilterSelected = false;
  props: any[] = [];
  selectedProps: any[] = [];
  newFilterObj: any;
  tileData: any;
  assetFilterObj: any;
  subscriptions: Subscription[] = [];
  @ViewChild('dtInput1', { static: false }) dtInput1: any;
  @ViewChild('dtInput2', { static: false }) dtInput2: any;
  currentOffset = 0;
  currentLimit = 100;
  insideScrollFunFlag = false;
  isFilterOpen = true;
  today = new Date();
  activeTab = 'pre_generated_reports';
  loadingMessage: any;
  daterange: any = {};
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: moment(),
    timePicker: true,
    ranges: CONSTANTS.DATE_OPTIONS,
  };
  reportsFetchDataSubscription: Subscription;
  @ViewChild(DaterangepickerComponent) private picker: DaterangepickerComponent;
  selectedDateRange: string;
  decodedToken: any;

  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private assetService: AssetService,
    private toasterService: ToasterService,
    private assetModelService: AssetModelService
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.getTileName();

    this.subscriptions.push(
      this.route.paramMap.subscribe(async (params) => {
        if (params.get('applicationId')) {
          this.filterObj.app = this.contextApp.app;
          // this.filterObj.count = 10;
        }
        if (this.contextApp.hierarchy.levels.length > 1) {
          this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
        }
        this.contextApp.hierarchy.levels.forEach((level, index) => {
          if (index !== 0) {
            this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
            if (this.contextApp.user.hierarchy[level]) {
              this.onChangeOfHierarchy(index, false);
            }
          }
        });
        this.filterObj.type = true;
        this.filterObj.sampling_format = 'minute';
        this.filterObj.sampling_time = 1;
        this.filterObj.aggregation_minutes = 1;
        this.filterObj.aggregation_format = 'AVG';
        this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
        console.log(this.originalFilterObj.report_type);
        // this.getLatestAlerts();
        await this.getAssets(this.contextApp.user.hierarchy);
        // this.propertyList = this.appData.metadata.properties ? this.appData.metadata.properties : [];
      })
    );
    if (this.decodedToken?.privileges?.indexOf('RV') !== -1) {
      this.onTabSelect('pre-generated');
    } else if (this.decodedToken?.privileges?.indexOf('RMV') !== -1) {
      this.onTabSelect('custom');
    }
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    if (item) {
      if (item.assets) {
        this.filterObj.asset = item.assets;
      }
      if (item.hierarchy) {
        if (Object.keys(this.contextApp.hierarchy.tags).length > 0) {
          this.contextApp.hierarchy.levels.forEach((level, index) => {
            if (index !== 0) {
              this.configureHierarchy[index] = item.hierarchy[level];
              if (item.hierarchy[level]) {
                this.onChangeOfHierarchy(index, false);
              }
            }
          });
        }
      }
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
        this.picker.datePicker.setStartDate(moment.unix(this.filterObj.from_date));
        this.picker.datePicker.setEndDate(moment.unix(this.filterObj.to_date));
        if (this.filterObj.dateOption !== 'Custom Range') {
          this.selectedDateRange = this.filterObj.dateOption;
        } else {
          this.selectedDateRange =
            moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') +
            ' to ' +
            moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
        }
        // if (this.filterObj.to_date - this.filterObj.from_date > 3600) {
        //   this.filterObj.isTypeEditable = true;
        // } else {
        //   this.filterObj.isTypeEditable = false;
        // }
        // const asset = this.assets.find((assetObj) => assetObj.asset_id === this.filterObj.asset.asset_id);
        const frequencyArr = [];
        frequencyArr.push(this.filterObj.asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
        frequencyArr.push(this.filterObj.asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
        frequencyArr.push(this.filterObj.asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
        const frequency = this.commonService.getLowestValueFromList(frequencyArr);
        const records = this.commonService.calculateEstimatedRecords(frequency, this.filterObj.from_date, this.filterObj.to_date);
        if (records > CONSTANTS.NO_OF_RECORDS) {
            this.filterObj.isTypeEditable = true;
        } else {
            this.filterObj.isTypeEditable = false;
        }
      }
      console.log(this.originalFilterObj);

      this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
      console.log(this.originalFilterObj.report_type);
      // if (this.filterObj.asset) {
      //   this.onFilterSelection(false, false);
      // }
    }
  }

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.system_name === 'Reports') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    this.currentLimit = Number(this.tileData[1]?.value) || 100;
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
    this.originalFilterObj = {};
    this.originalFilterObj.asset = JSON.parse(JSON.stringify(this.filterObj.asset));
    if (this.filterObj.asset) {
      this.onAssetSelection();
    }
    console.log(this.originalFilterObj);
  }

  onClearHierarchy() {
    this.isFilterSelected = false;
    this.hierarchyArr = {};
    this.originalFilterObj = {};
    this.configureHierarchy = {};
    this.filterObj = {};
    this.dropdownPropList = [];
    this.propertyList = [];
    this.props = JSON.parse(JSON.stringify([]));
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    console.log(this.hierarchyArr);
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        console.log(this.configureHierarchy);
        console.log(level);
        console.log(this.contextApp.user.hierarchy);
        if (this.contextApp.user.hierarchy[level]) {
          this.onChangeOfHierarchy(index, false);
        }
      } else {
        this.assets = JSON.parse(JSON.stringify(this.originalAssets));
      }
    });
  }

  selectedDate(value: any, datepicker?: any) {
    // this.filterObj.from_date = moment(value.start).utc().unix();
    // this.filterObj.to_date = moment(value.end).utc().unix();
    this.filterObj.dateOption = value.label;
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
    } else {
      this.filterObj.from_date = moment(value.start).utc().unix();
      this.filterObj.to_date = moment(value.end).utc().unix();
    }
    console.log(this.filterObj);
    if (value.label === 'Custom Range') {
      this.selectedDateRange =
        moment(value.start).format('DD-MM-YYYY HH:mm') + ' to ' + moment(value.end).format('DD-MM-YYYY HH:mm');
    } else {
      this.selectedDateRange = value.label;
    }
    // if (this.filterObj.to_date - this.filterObj.from_date > 3600) {
    //   this.filterObj.isTypeEditable = true;
    // } else {
    //   this.filterObj.isTypeEditable = false;
    // }
    // const asset = this.assets.find((assetObj) => assetObj.asset_id === this.filterObj.asset.asset_id);
    const frequencyArr = [];
    frequencyArr.push(this.filterObj.asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
    frequencyArr.push(this.filterObj.asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
    frequencyArr.push(this.filterObj.asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
    const frequency = this.commonService.getLowestValueFromList(frequencyArr);
    const records = this.commonService.calculateEstimatedRecords(frequency, this.filterObj.from_date, this.filterObj.to_date);
    if (records > CONSTANTS.NO_OF_RECORDS) {
        this.filterObj.isTypeEditable = true;
    } else {
        this.filterObj.isTypeEditable = false;
    }
  }

  getAssets(hierarchy) {
    return new Promise<void>((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
      };
      this.subscriptions.push(
        this.assetService.getIPAndLegacyAssets(obj, this.contextApp.app).subscribe((response: any) => {
          if (response?.data) {
            this.assets = response.data;
            this.assets.forEach((asset) => {
              if (!asset.display_name) {
                asset.display_name = asset.asset_id;
              }
            });
            this.originalAssets = JSON.parse(JSON.stringify(this.assets));
            if (this.assets?.length === 1) {
              this.filterObj.asset = this.assets[0];
            }
          }
          resolve();
        })
      );
    });
  }

  async onChangeOfHierarchy(i, persistAssetSelection = true) {
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach((key) => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
    // let hierarchy = {...this.configureHierarchy};
    const hierarchyObj: any = { App: this.contextApp.app };
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });
    if (Object.keys(hierarchyObj).length === 1) {
      this.assets = JSON.parse(JSON.stringify(this.originalAssets));
    } else {
      const arr = [];
      this.assets = [];
      this.originalAssets.forEach((asset) => {
        let trueFlag = 0;
        let flaseFlag = 0;
        Object.keys(hierarchyObj).forEach((hierarchyKey) => {
          if (asset.hierarchy[hierarchyKey] && asset.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
            trueFlag++;
          } else {
            flaseFlag++;
          }
        });
        if (trueFlag > 0 && flaseFlag === 0) {
          arr.push(asset);
        }
      });
      this.assets = JSON.parse(JSON.stringify(arr));
    }
    if (this.assets?.length === 1) {
      this.filterObj.asset = this.assets[0];
    }
    if (persistAssetSelection) {
      this.filterObj.assetArr = undefined;
      this.filterObj.asset = undefined;
    }
    this.props = [];
    this.dropdownPropList = [];
    let count = 0;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        count++;
      }
    });
    if (count === 0) {
      this.hierarchyArr = [];
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
    }
  }

  onAssetDeselect() {
    this.filterObj.asset = undefined;
    this.filterObj.assetArr = undefined;
  }

  onAssetSelection() {
    // this.nonIPAssets = [];
    // this.filterObj.asset_id = this.filterObj.asset.asset_id;
    if (this.filterObj.asset) {
      const asset_model = this.filterObj?.asset?.asset_model;

      if (asset_model) {
        this.getAssetsModelProperties(asset_model);
      }
    } else {
      this.dropdownPropList = [];
      this.propertyList = [];
      this.props = JSON.parse(JSON.stringify([]));
      this.filterObj.report_type = undefined;
    }
  }

  onNumberChange(event, type) {
    if (Number(event.target.value) % 1 !== 0) {
      this.toasterService.showError('Decimal values are not allowed.', 'View Report');
      if (type === 'aggregation') {
        this.filterObj.aggregation_minutes = Math.floor(Number(event.target.value));
      } else {
        this.filterObj.sampling_time = Math.floor(Number(event.target.value));
      }
    }
  }

  onNonIPAssetChange() {
    // this.filterObj.asset_id = this.filterObj.asset.asset_id;
    console.log(this.originalFilterObj.report_type);
    if (this.filterObj.report_type === 'Process Parameter Report') {
      if (this.filterObj.asset) {
        const asset_model = this.filterObj.asset.asset_model;
        if (asset_model) {
          this.getAssetsModelProperties(asset_model);
        }
      }
    }
    console.log(this.originalFilterObj.report_type);
  }

  getAssetsModelProperties(assetModel) {
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: assetModel,
      };
      this.subscriptions.push(
        this.assetModelService.getAssetsModelProperties(obj).subscribe((response: any) => {
          response.properties.measured_properties = response.properties.measured_properties
            ? response.properties.measured_properties
            : [];
          response.properties?.measured_properties?.forEach((prop) => (prop.type = 'Measured Properties'));
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
          this.dropdownPropList = [];
          this.props = [];
          this.propertyList.forEach((prop) => {
            this.dropdownPropList.push({
              id: prop.name,
              type: prop.type,
              value: prop,
            });
          });
          this.dropdownPropList = JSON.parse(JSON.stringify(this.dropdownPropList));
          console.log(this.dropdownPropList);
          // this.props = [...this.dropdownPropList];
          resolve();
        })
      );
    });
  }

  onScrollFn() {
    setTimeout(() => {
      $('#table-wrapper').on('scroll', () => {
        const element = document.getElementById('table-wrapper');
        if (
          parseFloat(element.scrollTop.toFixed(0)) + parseFloat(element.clientHeight.toFixed(0)) >=
            parseFloat(element.scrollHeight.toFixed(0)) &&
          !this.insideScrollFunFlag
        ) {
          this.currentOffset += this.currentLimit;
          this.onFilterSelection(false, false);
        }
      });
    }, 1000);
  }

  onFilterSelection(callScrollFnFlag = false, updateFilterObj = true) {
    this.insideScrollFunFlag = true;
    this.assetFilterObj = undefined;
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
    } else {
      this.filterObj.from_date = this.filterObj.from_date;
      this.filterObj.to_date = this.filterObj.to_date;
    }
    const obj = { ...this.filterObj };
    let asset_model: any;
    if (obj.asset) {
      obj.asset_id = obj.asset.asset_id;
      asset_model = obj.asset.asset_model;
      delete obj.asset;
    }
    if (!obj.report_type) {
      this.toasterService.showError('Report Type selection is required', 'View Report');
      return;
    }
    if (!obj.asset_id) {
      this.toasterService.showError('Asset selection is required', 'View Report');
      return;
    }
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    this.assetFilterObj = this.filterObj.asset;
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is required', 'View Report');
      return;
    }
    if (obj.report_type === 'Process Parameter Report' && this.props.length === 0) {
      this.toasterService.showError('Please select properties to view data', 'View Telemetry');
      return;
    }
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS);
      pagefilterObj['hierarchy'] = this.filterObj.asset.hierarchy;
      pagefilterObj['assets'] = this.filterObj.asset;
      pagefilterObj['from_date'] = obj.from_date;
      pagefilterObj['to_date'] = obj.to_date;
      pagefilterObj['dateOption'] = obj.dateOption;
      this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
    }
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    console.log(this.originalFilterObj.report_type);
    this.isTelemetryLoading = true;
    // this.telemetry = [];
    // this.latestAlerts = [];

    this.selectedProps = JSON.parse(JSON.stringify(this.props));
    this.newFilterObj = JSON.parse(JSON.stringify(obj));
    this.isFilterSelected = true;
    if (obj.report_type === 'Process Parameter Report') {
      this.getTelemetryData(obj, undefined, callScrollFnFlag);
    } else if (obj.report_type === 'Alert Report') {
      this.getAlertData(obj, undefined, callScrollFnFlag);
    }
  }

  getAlertData(obj, type = undefined, callScrollFnFlag = false) {
    return new Promise<void>((resolve) => {
      obj.offset = this.currentOffset;
      obj.count = this.currentLimit;
      this.loadingMessage = 'Loading data. Please wait...';
      if (type === 'all') {
        delete obj.count;
      }
      delete obj.report_type;
      delete obj.assetArr;
      this.reportsFetchDataSubscription = this.assetService.getAssetAlerts(obj).subscribe(
        (response: any) => {
          // response.data.reverse();
          response.data.forEach((item) => {
            item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date);
            item.asset_display_name = this.assets.filter((asset) => asset.asset_id === item.asset_id)[0]?.display_name;
          });
          this.latestAlerts = [...this.latestAlerts, ...response.data];
          this.isFilterOpen = false;
          if (response.data.length === this.currentLimit) {
            this.insideScrollFunFlag = false;
          } else {
            this.insideScrollFunFlag = true;
          }
          if (callScrollFnFlag) {
            this.onScrollFn();
          }
          resolve();
          if (this.filterObj.dateOption === 'Custom Range') {
            this.originalFilterObj.dateOption = 'this selected range';
          }
          this.isTelemetryLoading = false;
        },
        (error) => (this.isTelemetryLoading = false)
      );
      this.subscriptions.push(this.reportsFetchDataSubscription);
    });
  }

  onTabSelect(type) {
    this.tabType = type;
    if (type === 'custom') {
      this.filterObj = {};
      this.filterObj.app = this.contextApp.app;
      this.filterObj.type = true;
      this.filterObj.sampling_format = 'minute';
      this.filterObj.sampling_time = 1;
      this.filterObj.aggregation_minutes = 1;
      this.filterObj.aggregation_format = 'AVG';
      this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
      console.log(this.originalFilterObj.report_type);
      this.telemetry = [];
      this.latestAlerts = [];
      this.isFilterOpen = true;
      this.isFilterSelected = false;
      this.loadFromCache();
    } else {
      this.isFilterSelected = false;
    }
  }

  async getTelemetryData(filterObj, type = undefined, callScrollFnFlag = false) {
    return new Promise<void>((resolve) => {
      const obj = JSON.parse(JSON.stringify(filterObj));
      delete obj.dateOption;
      delete obj.isTypeEditable;
      delete obj.type;
      obj.offset = this.currentOffset;
      obj.count = this.currentLimit;
      // obj.order_dir = 'ASC';
      if (type === 'all') {
        delete obj.count;
      }

      delete obj.report_type;
      delete obj.assetArr;
      this.isTelemetryLoading = false;
      this.isFilterSelected = false;
      const asset = this.assets.find((assetObj) => assetObj.asset_id === obj.asset_id);
      obj.partition_key = asset.partition_key;
      let method;
      // if (obj.to_date - obj.from_date > 3600 && !filterObj.isTypeEditable) {
      //   this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
      //   return;
      // }
      const frequencyArray = [];
      frequencyArray.push(asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
      frequencyArray.push(asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
      frequencyArray.push(asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
      const S_frequency = this.commonService.getLowestValueFromList(frequencyArray);
      const record = this.commonService.calculateEstimatedRecords(S_frequency, obj.from_date, obj.to_date);
      if (record > CONSTANTS.NO_OF_RECORDS && !filterObj.isTypeEditable) {
        this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
        return;
      }

      if (filterObj.isTypeEditable) {
        if (filterObj.type) {
          if (!filterObj.sampling_time || !filterObj.sampling_format) {
            this.toasterService.showError('Sampling time and format is required.', 'View Telemetry');
            return;
          } else {
            delete obj.aggregation_minutes;
            delete obj.aggregation_format;
            let measured_message_props = '';
            let edge_derived_message_props = '';
            let cloud_derived_message_props = '';
            this.props.forEach((prop, index) => {
              if (prop.value.type === 'Edge Derived Properties') {
                edge_derived_message_props =
                  edge_derived_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
              } else if (prop.value.type === 'Cloud Derived Properties') {
                cloud_derived_message_props =
                  cloud_derived_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
              } else {
                measured_message_props =
                  measured_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
              }
            });
            measured_message_props = measured_message_props.replace(/,\s*$/, '');
            edge_derived_message_props = edge_derived_message_props.replace(/,\s*$/, '');
            cloud_derived_message_props = cloud_derived_message_props.replace(/,\s*$/, '');
            obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
            obj['edge_derived_message_props'] = edge_derived_message_props ? edge_derived_message_props : undefined;
            obj['cloud_derived_message_props'] = cloud_derived_message_props ? cloud_derived_message_props : undefined;
            const records = this.commonService.calculateEstimatedRecords(
              filterObj.sampling_time * 60,
              obj.from_date,
              obj.to_date
            );
            if (records > 500) {
              this.loadingMessage =
                'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
            }
            method = this.assetService.getAssetSamplingTelemetry(obj, this.contextApp.app);
          }
        } else {
          if (!filterObj.aggregation_minutes || !filterObj.aggregation_format) {
            this.toasterService.showError('Aggregation time and format is required.', 'View Telemetry');
            return;
          } else {
            delete obj.sampling_time;
            delete obj.sampling_format;
            let measured_message_props = '';
            let edge_derived_message_props = '';
            let cloud_derived_message_props = '';
            this.props.forEach((prop, index) => {
              if (prop.value.type === 'Edge Derived Properties') {
                edge_derived_message_props =
                  edge_derived_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
              } else if (prop.value.type === 'Cloud Derived Properties') {
                cloud_derived_message_props =
                  cloud_derived_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
              } else {
                measured_message_props =
                  measured_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
              }
            });
            measured_message_props = measured_message_props.replace(/,\s*$/, '');
            edge_derived_message_props = edge_derived_message_props.replace(/,\s*$/, '');
            cloud_derived_message_props = cloud_derived_message_props.replace(/,\s*$/, '');
            obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
            obj['edge_derived_message_props'] = edge_derived_message_props ? edge_derived_message_props : undefined;
            obj['cloud_derived_message_props'] = cloud_derived_message_props ? cloud_derived_message_props : undefined;
            const records = this.commonService.calculateEstimatedRecords(
              filterObj.aggregation_minutes * 60,
              obj.from_date,
              obj.to_date
            );
            if (records > 500) {
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
        if (this.props.length === this.propertyList.length && !obj.sampling_format && !obj.aggregation_format) {
          obj['all_message_props'] = true;
        } else {
          // let message_props = '';
          // this.props.forEach((prop, index) => message_props = message_props + prop.value.json_key +
          // (this.props[index + 1] ? ',' : ''));
          // obj['message_props'] = message_props;
          let measured_message_props = '';
          let edge_derived_message_props = '';
          let cloud_derived_message_props = '';
          this.props.forEach((prop, index) => {
            if (prop.value.type === 'Edge Derived Properties') {
              edge_derived_message_props =
                edge_derived_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
            } else if (prop.value.type === 'Cloud Derived Properties') {
              cloud_derived_message_props =
                cloud_derived_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
            } else {
              measured_message_props =
                measured_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
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
        frequencyArr.push(asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
        frequencyArr.push(asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
        frequencyArr.push(asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
        const frequency = this.commonService.getLowestValueFromList(frequencyArr);
        const records = this.commonService.calculateEstimatedRecords(frequency, filterObj.from_date, filterObj.to_date);
        if (records > 500) {
          this.loadingMessage =
            'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
        }
        method = this.assetService.getAssetTelemetry(obj);
      }

      this.isTelemetryLoading = true;
      this.isFilterSelected = true;
      this.reportsFetchDataSubscription = method.subscribe(
        (response: any) => {
          if (response && response.data) {
            // this.telemetry = response.data;
            response.data.forEach(
              (item) => (item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date))
            );
            this.telemetry = [...this.telemetry, ...response.data];
            this.isFilterOpen = false;
            if (response.data.length === this.currentLimit) {
              this.insideScrollFunFlag = false;
            } else {
              this.insideScrollFunFlag = true;
            }
            this.loadingMessage = undefined;
            // this.telemetry.reverse();
          }
          if (callScrollFnFlag) {
            this.onScrollFn();
          }
          if (this.filterObj.dateOption === 'Custom Range') {
            this.originalFilterObj.dateOption = 'this selected range';
          }
          this.isTelemetryLoading = false;
          resolve();
        },
        (error) => (this.isTelemetryLoading = false)
      );
      this.subscriptions.push(this.reportsFetchDataSubscription);
    });
  }

  y1Deselect(e) {
    if (e === [] || e.length === 0) {
      this.props = [];
    }
  }

  scrollToTop() {
    $('#table-top1').animate({ scrollTop: '0px' });
    // window.scrollTo(0, 0);
  }

  async savePDF(): Promise<void> {
    if (this.originalFilterObj.report_type === 'Process Parameter Report' && this.props.length > 8) {
      this.toasterService.showWarning('For more properties, Excel Reports work better.', 'Export as PDF');
    }
    $('#downloadReportModal').modal({ backdrop: 'static', keyboard: false, show: true });
    if (this.originalFilterObj.report_type === 'Process Parameter Report' && !this.insideScrollFunFlag) {
      this.currentOffset += this.currentLimit;
      await this.getTelemetryData(this.newFilterObj, 'all');
      this.insideScrollFunFlag = true;
    } else if (this.originalFilterObj.report_type === 'Alert Report' && !this.insideScrollFunFlag) {
      this.currentOffset += this.currentLimit;
      await this.getAlertData(this.newFilterObj, 'all');
      this.insideScrollFunFlag = true;
    }
    this.loadingMessage = 'Preparing Report.';
    this.isFileDownloading = true;
    setTimeout(() => {
      const pdf = new jsPDF('p', 'pt', 'A3');
      pdf.text(
        this.originalFilterObj.report_type +
          ' for ' +
          (this.assetFilterObj.display_name ? this.assetFilterObj.display_name : this.assetFilterObj.asset_id) +
          ' for ' +
          this.commonService.convertEpochToDate(this.newFilterObj.from_date) +
          ' to ' +
          this.commonService.convertEpochToDate(this.newFilterObj.to_date),
        20,
        50
      );
      autoTable(pdf, { html: '#dataTable1', margin: { top: 70 } });
      const now = moment().utc().unix();
      pdf.save(
        (this.assetFilterObj.display_name ? this.assetFilterObj.display_name : this.assetFilterObj.asset_id) +
          '_' +
          this.originalFilterObj.report_type +
          '_' +
          now +
          '.pdf'
      );
      this.isFileDownloading = false;
      this.loadingMessage = undefined;
      $('#downloadReportModal').modal('hide');
    }, 1000);
  }

  async saveExcel() {
    this.isFileDownloading = true;
    let ws: XLSX.WorkSheet;
    let data = [];
    $('#downloadReportModal').modal({ backdrop: 'static', keyboard: false, show: true });
    if (this.originalFilterObj.report_type === 'Process Parameter Report' && !this.insideScrollFunFlag) {
      this.currentOffset += this.currentLimit;
      await this.getTelemetryData(this.newFilterObj, 'all');
      this.insideScrollFunFlag = true;
    } else if (this.originalFilterObj.report_type === 'Alert Report' && !this.insideScrollFunFlag) {
      this.currentOffset += this.currentLimit;
      await this.getAlertData(this.newFilterObj, 'all');
      this.insideScrollFunFlag = true;
    }
    this.loadingMessage = 'Preparing Report.';
    setTimeout(() => {
      if (this.originalFilterObj.report_type === 'Alert Report') {
        this.latestAlerts.forEach((alert) => {
          data.push({
            'Asset Name': this.assetFilterObj.display_name
              ? this.assetFilterObj.display_name
              : this.assetFilterObj.asset_id,
            Time: alert.local_created_date,
            Severity: alert.severity,
            Description: alert.message,
            Source: alert.source,
            Status: alert.metadata?.acknowledged_date ? 'Acknowledged' : 'Not Acknowledged',
            'Acknowledged By': alert.metadata?.user_id,
          });
        });
        // const element = document.getElementById('dataTable');
        ws = XLSX.utils.json_to_sheet(data);
      } else {
        data = [];
        this.telemetry.forEach((telemetryObj) => {
          const obj = {
            'Asset Name': this.originalFilterObj.non_ip_asset
              ? this.originalFilterObj.non_ip_asset.asset_display_name
                ? this.originalFilterObj.non_ip_asset?.asset_display_name
                : this.originalFilterObj.non_ip_asset?.asset_id
              : this.assetFilterObj
              ? this.assetFilterObj.asset_display_name
                ? this.assetFilterObj.asset_display_name
                : this.assetFilterObj.asset_id
              : '',
            Time: telemetryObj.local_created_date,
          };
          this.selectedProps.forEach((prop) => {
            obj[prop.id] = telemetryObj[prop.value.json_key];
          });
          data.push(obj);
        });
        ws = XLSX.utils.json_to_sheet(data);
      }
      const colA = XLSX.utils.decode_col('B'); // timestamp is in first column
      const fmt = 'DD-MMM-YYYY hh:mm:ss.SSS'; // excel datetime format
      // get worksheet range
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let i = range.s.r + 1; i <= range.e.r; ++i) {
        /* find the data cell (range.s.r + 1 skips the header row of the worksheet) */
        const ref = XLSX.utils.encode_cell({ r: i, c: colA });
        /* if the particular row did not contain data for the column, the cell will not be generated */
        if (!ws[ref]) {
          continue;
        }
        /* `.t == "n"` for number cells */
        if (ws[ref].t !== 'n') {
          continue;
        }
        /* assign the `.z` number format */
        ws[ref].z = fmt;
      }
      // width of timestamp col
      const wscols = [{ wch: 10 }];
      ws['!cols'] = wscols;
      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const now = moment().utc().unix();
      /* save to file */
      XLSX.writeFile(
        wb,
        (this.originalFilterObj.asset.display_name
          ? this.originalFilterObj.asset.display_name
          : this.originalFilterObj.asset.asset_id) +
          '_' +
          this.originalFilterObj.report_type +
          '_' +
          now +
          '.xlsx'
      );
      this.loadingMessage = undefined;
      $('#downloadReportModal').modal('hide');
    }, 1000);
  }

  cancelDownloadModal() {
    this.reportsFetchDataSubscription?.unsubscribe();
    this.loadingMessage = undefined;
    this.isTelemetryLoading = false;
    $('#downloadReportModal').modal('hide');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
