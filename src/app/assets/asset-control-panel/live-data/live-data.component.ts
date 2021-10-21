import { ToasterService } from './../../../services/toaster.service';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Asset } from 'src/app/models/asset.model';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import * as moment from 'moment';

@Component({
  selector: 'app-live-data',
  templateUrl: './live-data.component.html',
  styleUrls: ['./live-data.component.css'],
})
export class LiveDataComponent implements OnInit, OnDestroy {
  @Input() asset = new Asset();
  userData: any;
  contextApp: any;
  apiSubscriptions: Subscription[] = [];
  propertyList: any[] = [];
  liveWidgets: any[] = [];
  isGetLiveWidgetsAPILoading = false;
  selectedWidgets: any[] = [];
  selectedWidgetsForSearch: any[] = [];
  signalRTelemetrySubscription: any;
  isTelemetryDataLoading = false;
  widgetPropertyList: any[] = [];
  telemetryObj: any;
  apiTelemetryObj: any;
  derivedKPIs: any[] = [];
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private signalRService: SignalRService,
    private toasterService: ToasterService
  ) {}

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getAssetderivedKPIs(this.asset.asset_id);
    await this.getAssetsModelProperties();
    this.getLiveWidgets();
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
            obj.data_type = kpi.metadata?.data_type || 'Number';
            obj.json_model[obj.json_key].unit = kpi.units;
            this.propertyList.push(obj);
          });
          resolve();
        })
      );
    });
  }

  getLiveWidgets() {
    this.liveWidgets = [];
    const params = {
      app: this.contextApp.app,
      name: this.asset.tags.asset_model,
    };
    this.apiSubscriptions.push(
      this.assetModelService.getAssetsModelLiveWidgets(params).subscribe((response: any) => {
        if (response?.live_widgets?.length > 0) {
          response.live_widgets.forEach((widget) => {
            widget.edge_derived_props = false;
            widget.cloud_derived_props = false;
            widget.measured_props = false;
            widget.derived_kpis = false;
            if (widget.widgetType !== 'LineChart' && widget.widgetType !== 'AreaChart') {
              widget?.properties.forEach((prop) => {
                if (prop.property) {
                  prop.json_key = prop.property.json_key;
                }
                console.log(prop.json_key);
                console.log(this.propertyList);
                prop.property = this.propertyList.find((propObj) => propObj.json_key === prop.json_key);
                prop.type = prop.property?.type || prop.type;
                console.log(prop);
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
              widget?.y1AxisProps.forEach((prop) => {
                if (prop.id) {
                  prop.json_key = prop.id;
                }
                prop.property = this.propertyList.find(
                  (propObj) => propObj.json_key === prop.json_key || propObj.id === prop.id
                );
                console.log(prop);
                this.addPropertyInList(prop);
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
              widget?.y2AxisProps.forEach((prop) => {
                if (prop.id) {
                  prop.json_key = prop.id;
                }
                prop.property = this.propertyList.find(
                  (propObj) => propObj.json_key === prop.json_key || propObj.id === prop.id
                );
                console.log(prop);
                this.addPropertyInList(prop);
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
            this.liveWidgets.push({
              id: widget.widgetTitle,
              value: widget,
            });
          });
          this.liveWidgets = JSON.parse(JSON.stringify(this.liveWidgets));
        }
      })
    );
  }

  addPropertyInList(prop) {
    console.log(prop);
    if (this.widgetPropertyList.length === 0) {
      this.widgetPropertyList.push(prop);
    } else {
      const index = this.widgetPropertyList.findIndex((propObj) => propObj.json_key === prop.json_key);
      if (index === -1) {
        this.widgetPropertyList.push(prop);
      }
    }
  }

  getTelemetryData() {
    if (this.selectedWidgetsForSearch?.length === 0) {
      this.toasterService.showError('Select widgets first.', 'Live Widgets');
      return;
    }
    this.signalRService.disconnectFromSignalR('telemetry');
    this.signalRTelemetrySubscription?.unsubscribe();
    const obj = {};
    this.isTelemetryDataLoading = true;
    this.telemetryObj = undefined;
    obj['app'] = this.contextApp.app;
    obj['asset_model'] = this.asset.tags.asset_model;
    // let message_props = '';
    obj['count'] = 1;
    const midnight = moment().hour(0).minute(0).second(0).utc().unix();
    const now = moment().utc().unix();
    obj['from_date'] = midnight;
    obj['to_date'] = now;
    let measured_message_props = '';
    let edge_derived_message_props = '';
    let cloud_derived_message_props = '';
    this.propertyList.forEach((prop, index) => {
      if (prop.type === 'Edge Derived Properties') {
        edge_derived_message_props =
          edge_derived_message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : '');
      } else if (prop.type === 'Cloud Derived Properties') {
        cloud_derived_message_props =
          cloud_derived_message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : '');
      } else {
        measured_message_props = measured_message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : '');
      }
    });
    measured_message_props = measured_message_props.replace(/,\s*$/, '');
    edge_derived_message_props = edge_derived_message_props.replace(/,\s*$/, '');
    cloud_derived_message_props = cloud_derived_message_props.replace(/,\s*$/, '');
    obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
    obj['edge_derived_message_props'] = edge_derived_message_props ? edge_derived_message_props : undefined;
    obj['cloud_derived_message_props'] = cloud_derived_message_props ? cloud_derived_message_props : undefined;
    // this.propertyList.forEach((prop, index) => message_props = message_props + prop.json_key
    // + (this.propertyList[index + 1] ? ',' : ''));
    // obj['message_props'] = message_props;
    obj['partition_key'] = this.asset?.tags?.partition_key;
    obj['asset_id'] = this.asset.asset_id;
    this.selectedWidgets = JSON.parse(JSON.stringify(this.selectedWidgetsForSearch));
    const obj1 = {
      hierarchy: this.contextApp.user.hierarchy,
      levels: this.contextApp.hierarchy.levels,
      asset_id: this.asset.asset_id,
      type: 'telemetry',
      app: this.contextApp.app,
    };
    this.signalRService.connectToSignalR(obj1);
    this.signalRTelemetrySubscription = this.signalRService.signalRTelemetryData.subscribe((data) => {
      if (data.type !== 'alert') {
        if (data) {
          let obj = JSON.parse(JSON.stringify(data));
          delete obj.m;
          delete obj.ed;
          delete obj.cd;
          delete obj.dkpi;
          obj = { ...obj, ...data.m, ...data.ed, ...data.cd, ...data.dkpi };
          data = JSON.parse(JSON.stringify(obj));
        }

        data.date = this.commonService.convertUTCDateToLocal(data.ts || data.timestamp);
        data.message_date = this.commonService.convertUTCDateToLocal(data.ts || data.timestamp);
        let obj = {};
        if (this.telemetryObj) {
          obj = JSON.parse(JSON.stringify(this.telemetryObj));
        }
        this.telemetryObj = undefined;
        // console.log(this.widgetPropertyList);
        this.widgetPropertyList.forEach((prop) => {
          if (prop?.json_key && data[prop.json_key] !== undefined && data[prop.json_key] !== null) {
            obj[prop?.json_key] = {
              value: data[prop?.json_key],
              date: data.date,
            };
          }
        });
        this.telemetryObj = obj;
        // this.lastReportedTelemetryValues = obj;
        // this.telemetryObj = JSON.parse(JSON.stringify(data));
        this.isTelemetryDataLoading = false;
      }
    });
    this.apiSubscriptions.push(
      this.assetService.getLastTelmetry(this.contextApp.app, obj).subscribe(
        (response: any) => {
          if (response.message) {
            response.message.date = this.commonService.convertUTCDateToLocal(response.message_date);
            response.message_date = this.commonService.convertUTCDateToLocal(response.message_date);
            const obj = {};
            // console.log(this.widgetPropertyList);
            this.widgetPropertyList.forEach((prop) => {
              if (prop.type !== 'Derived KPIs') {
                obj[prop?.json_key] = {
                  value: response.message[prop?.json_key],
                  date: response.message_date,
                };
              } else {
                const kpiObj = this.derivedKPIs.find((kpi) => kpi.kpi_json_key === prop.json_key);
                obj[prop?.json_key] = {
                  value: kpiObj.kpi_result,
                  date: this.commonService.convertUTCDateToLocal(kpiObj.process_end_time),
                };
              }
            });
            // console.log(obj);
            this.telemetryObj = obj;
            this.apiTelemetryObj = JSON.parse(JSON.stringify(obj));
            // this.telemetryObj = response.message;
            // Object.keys(this.telemetryObj).forEach(key => {
            //   if (key !== 'message_date') {
            //     this.telemetryObj[key] = Number(this.telemetryObj[key]);
            //   }
            // });
            // this.propertyList.forEach(prop => {
            //   if (prop.data_type === 'Number') {
            //     this.telemetryObj[prop.json_key] = Number(this.telemetryObj[prop.json_key]);
            //   }
            // });
            this.isTelemetryDataLoading = false;
          } else {
            this.isTelemetryDataLoading = false;
          }
        },
        (error) => (this.isTelemetryDataLoading = false)
      )
    );
  }

  onDeSelectAll() {
    // this.selectedWidgets = [];
    this.selectedWidgetsForSearch = [];
  }

  ngOnDestroy(): void {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
