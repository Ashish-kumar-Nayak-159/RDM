import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import * as datefns from 'date-fns';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { AssetService } from './../../../services/assets/asset.service';
import { CommonService } from './../../../services/common.service';
import { ToasterService } from './../../../services/toaster.service';

@Component({
  selector: 'app-asset-count',
  templateUrl: './asset-count.component.html',
  styleUrls: ['./asset-count.component.css'],
})
export class AssetCountComponent implements OnInit, AfterViewInit {
  @Input() asset: any;
  telemetryFilter: any;
  originalTelemetryFilter: any;
  today = new Date();
  isTelemetryLoading = false;
  apiSubscriptions: Subscription[] = [];
  isFilterSelected = false;
  telemetry: any[] = [];
  contextApp: any;
  propertyList: any[] = [];
  telemetryTableConfig: any;
  assets: any[] = [];
  selectedDateRange: any;
  selectedProps: any[] = [];
  constructor(
    private toasterService: ToasterService,
    private assetService: AssetService,
    private commonService: CommonService,
    private assetModelService: AssetModelService
  ) {}

  async ngOnInit(): Promise<void> {
    this.telemetryFilter = {};
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.telemetryFilter.app = this.contextApp.app;
    this.telemetryFilter.count = 10;
    if (this.asset.tags.category === CONSTANTS.IP_GATEWAY) {
      this.telemetryFilter.gateway_id = this.asset.asset_id;
    } else {
      this.telemetryFilter.asset_id = this.asset.asset_id;
    }
    this.telemetryTableConfig = {
      type: 'telemetry count',
      dateRange: '',
      tableHeight: 'calc(100vh - 16rem)',
      headers: ['Timestamp'],
      data: [
        {
          name: 'Timestamp',
          key: 'local_message_date',
          type: 'text',
          headerClass: 'w-15',
          valueclass: '',
        },
      ],
    };
    this.telemetryFilter.aggregation_format = 'COUNT';
    this.telemetryFilter.aggregation_minutes = 1;
    this.telemetryFilter.count = 10;
    this.telemetryFilter.epoch = true;
    this.originalTelemetryFilter = { ...this.telemetryFilter };
    if (this.telemetryFilter.gateway_id) {
      this.getAssetsListByGateway();
    }
  }

  ngAfterViewInit() {
    this.loadFromCache();
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.telemetryFilter.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.telemetryFilter.from_date = dateObj.from_date;
        this.telemetryFilter.to_date = dateObj.to_date;
        this.telemetryFilter.last_n_secs = dateObj.to_date - dateObj.from_date;
        this.selectedDateRange = this.telemetryFilter.dateOption;
      } else {
        this.telemetryFilter.from_date = item.from_date;
        this.telemetryFilter.to_date = item.to_date;
        this.selectedDateRange = datefns.format(datefns.fromUnixTime(this.telemetryFilter.from_date), "dd-MM-yyyy HH:mm") + ' to ' + datefns.format(datefns.fromUnixTime(this.telemetryFilter.to_date), "dd-MM-yyyy HH:mm");
      }
    }
    // this.searchTelemetry(this.telemetryFilter, false);
  }

  getAssetsListByGateway() {
    this.assets = [];
    const obj = {
      gateway_id: this.telemetryFilter.gateway_id,
      type: 'Legacy Asset',
    };
    this.apiSubscriptions.push(
      this.assetService.getLegacyAssets(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.assets = response.data;
            if (this.assets.length === 1) {
              this.telemetryFilter.asset = this.assets[0];
              this.onSelectionOfAsset();
            }
            // this.assets.splice(0, 0, { asset_id: this.telemetryFilter.gateway_id});
          }
        }
      )
    );
  }

  getAssetsModelProperties(asset) {
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: asset.asset_model,
      };
      this.apiSubscriptions.push(
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
          this.propertyList = JSON.parse(JSON.stringify(this.propertyList));
          // this.props = [...this.dropdownPropList];
          resolve();
        })
      );
    });
  }

  onSelectionOfAsset() {
    this.getAssetsModelProperties(this.telemetryFilter.asset);
  }

  async searchTelemetry(filterObj, updateFilterObj = true) {
    console.log(filterObj);
    this.telemetry = [];
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
      filterObj.last_n_secs = dateObj.to_date - dateObj.from_date;
    }

    const obj = { ...filterObj };
    delete obj.asset;
    obj.asset_id = filterObj?.asset?.asset_id;
    if (!obj.asset_id) {
      this.toasterService.showError('Asset selection is required.', 'View Count Data');
      this.isTelemetryLoading = false;
      this.isFilterSelected = false;
      return;
    }
    if (!filterObj.props || filterObj.props?.length === 0) {
      this.toasterService.showError('Property selection is required.', 'View Count Data');
      this.isTelemetryLoading = false;
      this.isFilterSelected = false;
      return;
    }
    this.telemetryTableConfig = {
      type: 'telemetry count',
      dateRange: '',
      tableHeight: 'calc(100vh - 16rem)',
      headers: ['Timestamp'],
      data: [
        {
          name: 'Timestamp',
          key: 'local_message_date',
          type: 'text',
          headerClass: 'w-15',
          valueclass: '',
        },
      ],
    };
    filterObj.props.forEach((prop) => {
      this.telemetryTableConfig.headers.push(prop.name);
      this.telemetryTableConfig.data.push({
        name: prop.name,
        key: prop.json_key,
        type: 'text',
        headerClass: '',
        valueclass: '',
      });
    });

    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Telemetry Data');

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
    let method;
    if (!obj.aggregation_minutes || !obj.aggregation_format) {
      this.toasterService.showError('Aggregation time and format is required.', 'View Telemetry');
      return;
    }
    let measured_message_props = '';
    let edge_derived_message_props = '';
    let cloud_derived_message_props = '';
    filterObj.props.forEach((prop, index) => {
      if (prop.type === 'Edge Derived Properties') {
        edge_derived_message_props =
          edge_derived_message_props + prop.json_key + (filterObj.props[index + 1] ? ',' : '');
      } else if (prop.type === 'Cloud Derived Properties') {
        cloud_derived_message_props =
          cloud_derived_message_props + prop.json_key + (filterObj.props[index + 1] ? ',' : '');
      } else {
        measured_message_props = measured_message_props + prop.json_key + (filterObj.props[index + 1] ? ',' : '');
      }
    });
    measured_message_props = measured_message_props.replace(/,\s*$/, '');
    edge_derived_message_props = edge_derived_message_props.replace(/,\s*$/, '');
    cloud_derived_message_props = cloud_derived_message_props.replace(/,\s*$/, '');
    obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
    obj['edge_derived_message_props'] = edge_derived_message_props ? edge_derived_message_props : undefined;
    obj['cloud_derived_message_props'] = cloud_derived_message_props ? cloud_derived_message_props : undefined;
    delete obj.props;
    obj.partition_key = this.asset?.tags?.partition_key;
    if (this.asset.tags.category === CONSTANTS.IP_GATEWAY) {
      obj.partition_key = filterObj.asset.partition_key;
    }
    method = this.assetService.getAssetTelemetry(obj);
    this.isFilterSelected = true;
    this.isTelemetryLoading = true;

    this.telemetryFilter = filterObj;
    this.apiSubscriptions.push(
      method.subscribe(
        (response: any) => {
          if (response && response.data) {
            this.telemetry = response.data;
            this.telemetry.forEach((item) => {
              item.local_message_date = this.commonService.convertUTCDateToLocal(item.message_date);
            });
          }
          if (this.telemetryFilter.dateOption !== 'Custom Range') {
            this.telemetryTableConfig.dateRange = this.telemetryFilter.dateOption;
          } else {
            this.telemetryTableConfig.dateRange = 'this selected range';
          }
          this.isTelemetryLoading = false;
        },
        (error) => (this.isTelemetryLoading = false)
      )
    );
  }

  onNumberChange(event, type) {
    if (Number(event.target.value) % 1 !== 0) {
      this.toasterService.showError('Decimal values are not allowed.', 'View Report');
      if (type === 'aggregation') {
        this.telemetryFilter.aggregation_minutes = Math.floor(Number(event.target.value));
      } else {
        this.telemetryFilter.sampling_time = Math.floor(Number(event.target.value));
      }
    }
  }

  selectedDate(filterObj) {
    this.telemetryFilter.from_date = filterObj.from_date;
    this.telemetryFilter.to_date = filterObj.to_date;
    this.telemetryFilter.last_n_secs = filterObj.last_n_secs;
    this.telemetryFilter.dateOption = filterObj.dateOption;
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    this.telemetryFilter = {};
    // this.isFilterSelected = false;
    this.telemetryFilter = JSON.parse(JSON.stringify(this.originalTelemetryFilter));
    this.telemetryFilter.dateOption = 'Last 30 Mins';
    if (this.telemetryFilter.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.telemetryFilter.dateOption);
      this.telemetryFilter.from_date = dateObj.from_date;
      this.telemetryFilter.to_date = dateObj.to_date;
      this.telemetryFilter.last_n_secs = dateObj.to_date - dateObj.from_date;
      this.selectedDateRange = this.telemetryFilter.dateOption;
    } else {
      this.selectedDateRange = datefns.format(datefns.fromUnixTime(this.telemetryFilter.from_date), "dd-MM-yyyy HH:mm") + ' to ' + datefns.format(datefns.fromUnixTime(this.telemetryFilter.to_date), "dd-MM-yyyy HH:mm");
    }
  }
}
