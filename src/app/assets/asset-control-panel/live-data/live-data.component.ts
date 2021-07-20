import { ToasterService } from './../../../services/toaster.service';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Asset } from 'src/app/models/asset.model';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import * as moment from 'moment';

@Component({
  selector: 'app-live-data',
  templateUrl: './live-data.component.html',
  styleUrls: ['./live-data.component.css']
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
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private signalRService: SignalRService,
    private toasterService: ToasterService
    ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getLiveWidgets();
    await this.getThingsModelProperties();


  }

  getThingsModelProperties() {
    // this.properties = {};
    return new Promise((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: this.asset.tags.asset_model
      };
      this.apiSubscriptions.push(this.assetModelService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
          response.properties.derived_properties.forEach(prop => {
            prop.type = 'Derived Properties';
            this.propertyList.push(prop)
          });
          resolve();
        }
      ));
    });
  }

  getLiveWidgets() {
    this.liveWidgets = [];
    const params = {
      app: this.contextApp.app,
      name: this.asset.tags.asset_model
    };
    this.apiSubscriptions.push(this.assetModelService.getThingsModelLiveWidgets(params).subscribe(
      (response: any) => {
        if (response?.live_widgets?.length > 0) {
          response.live_widgets.forEach(widget => {
            widget.derived_props = false;
            widget.measured_props = false;
            if (widget.widgetType !== 'LineChart' && widget.widgetType !== 'AreaChart') {
              widget?.properties.forEach(prop => {
                this.addPropertyInList(prop.property);
                if (prop?.property?.type === 'Derived Properties') {
                  widget.derived_props = true;
                } else {
                  widget.measured_props = true;
                }
              });
              } else {
                widget?.y1AxisProps.forEach(prop => {
                  this.addPropertyInList(prop);
                  if (prop?.type === 'Derived Properties') {
                    widget.derived_props = true;
                  } else {
                    widget.measured_props = true;
                  }
                });
                widget?.y2AxisProps.forEach(prop => {
                  this.addPropertyInList(prop);
                  if (prop?.type === 'Derived Properties') {
                    widget.derived_props = true;
                  } else {
                    widget.measured_props = true;
                  }
                });
              }
            this.liveWidgets.push({
              id: widget.widgetTitle,
              value: widget
            });
          });
          this.liveWidgets = JSON.parse(JSON.stringify(this.liveWidgets));
        }
      }
    ));
  }

  addPropertyInList(prop) {
    if (this.widgetPropertyList.length === 0 ) {
      this.widgetPropertyList.push(prop);
    } else {
      const index = this.widgetPropertyList.findIndex(propObj => propObj.json_key === prop.json_key);
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
    const midnight =  ((((moment().hour(0)).minute(0)).second(0)).utc()).unix();
    const now = (moment().utc()).unix();
    obj['from_date'] = midnight;
    obj['to_date'] = now;
    let measured_message_props = '';
    let derived_message_props = '';
    this.propertyList.forEach((prop, index) => {
      if (prop.type === 'Derived Properties') {
        derived_message_props = derived_message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : '');
      } else {
        measured_message_props = measured_message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : '');
      }
    });
    measured_message_props = measured_message_props.replace(/,\s*$/, '');
    derived_message_props = derived_message_props.replace(/,\s*$/, '');
    obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
    obj['derived_message_props'] = derived_message_props ? derived_message_props : undefined;
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
    this.signalRTelemetrySubscription = this.signalRService.signalRTelemetryData.subscribe(
      data => {
        if (data.type !== 'alert') {
          if (data) {
            let obj =  JSON.parse(JSON.stringify(data));
            delete obj.m;
            delete obj.d;
            obj = {...obj, ...data.m, ...data.d};
            data = JSON.parse(JSON.stringify(obj));
          }

          data.date = this.commonService.convertUTCDateToLocal(data.ts || data.timestamp);
          data.message_date = this.commonService.convertUTCDateToLocal(data.ts || data.timestamp);
          const obj = JSON.parse(JSON.stringify(this.telemetryObj));
          this.telemetryObj = undefined;
          // console.log(this.widgetPropertyList);
          this.widgetPropertyList.forEach(prop => {
            if (prop?.json_key && data[prop.json_key] !== undefined && data[prop.json_key] !== null) {
              obj[prop?.json_key] = {
                value: data[prop?.json_key],
                date: data.date
              };
            }
          });
          // console.log(obj);
          this.telemetryObj = obj;
          // this.lastReportedTelemetryValues = obj;
          // this.telemetryObj = JSON.parse(JSON.stringify(data));
          this.isTelemetryDataLoading = false;
        }
      }
    );
    this.apiSubscriptions.push(this.assetService.getLastTelmetry(this.contextApp.app, obj).subscribe(
      (response: any) => {
        if (response.message) {
          response.message.date = this.commonService.convertUTCDateToLocal(response.message_date);
          response.message_date = this.commonService.convertUTCDateToLocal(response.message_date);
          const obj = {};
          // console.log(this.widgetPropertyList);
          this.widgetPropertyList.forEach(prop => {
            obj[prop?.json_key] = {
              value: response.message[prop?.json_key],
              date: response.message_date
            };
          });
          // console.log(obj);
          this.telemetryObj = obj;
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
    }, error => this.isTelemetryDataLoading = false));
  }

  onDeSelectAll() {
    // this.selectedWidgets = [];
    this.selectedWidgetsForSearch = [];
  }

  ngOnDestroy(): void {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }

}
