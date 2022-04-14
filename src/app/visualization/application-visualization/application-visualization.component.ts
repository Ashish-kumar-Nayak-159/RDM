import {
  ApplicationRef, Component, ComponentFactoryResolver, EmbeddedViewRef, Injector,
  Input, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as datefns from 'date-fns';
import { FileSaverService } from 'ngx-filesaver';
import { Subscription } from 'rxjs';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { DamagePlotChartComponent } from 'src/app/common/charts/damage-plot-chart/damage-plot-chart.component';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ChartService } from 'src/app/services/chart/chart.service';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { environment } from 'src/environments/environment';
import { ColumnChartComponent } from './../../common/charts/column-chart/column-chart.component';
import { DataTableComponent } from './../../common/charts/data-table/data-table.component';
import { PieChartComponent } from './../../common/charts/pie-chart/pie-chart.component';
import { AssetModelService } from './../../services/asset-model/asset-model.service';
import { AssetService } from './../../services/assets/asset.service';
import { CommonService } from './../../services/common.service';
import { ToasterService } from './../../services/toaster.service';

declare var $: any;
@Component({
  selector: 'app-application-visualization',
  templateUrl: './application-visualization.component.html',
  styleUrls: ['./application-visualization.component.css'],
})
export class ApplicationVisualizationComponent implements OnInit, OnDestroy {
  @Input() asset: any;
  @Input() pageType = 'live';
  userData: any;
  contextApp: any = {};
  latestAlerts: any[] = [];
  isAlertAPILoading = false;
  propertyList: any[] = [];
  selectedAlert: any;
  selectedAsset: any;
  refreshInterval: any;
  beforeInterval = 10;
  telemetryData: any[] = [];
  filterObj: any = {};
  originalFilterObj: any = {};
  assets: any[] = [];
  nonIPAssets: any[] = [];
  afterInterval = 10;
  seriesArr: any[] = [];
  isOpen = true;
  y2AxisProps: any[] = [];
  y1AxisProps: any[] = [];
  dropdownPropList: any[] = [];
  isTelemetryDataLoading = false;
  isTelemetryFilterSelected = false;
  acknowledgedAlert: any;
  dropdownWidgetList: any[];
  selectedWidgets: any[] = [];
  selectedWidgetsForSearch: any[] = [];
  propList: any[];
  showThreshold = false;
  selectedPropertyForChart: any[] = [];
  alertCondition: any = {};
  documents: any[] = [];
  tileData: any;
  signalRAlertSubscription: any;
  originalAssets: any[] = [];
  reasons: any[] = [];
  isAlertModalDataLoading = false;
  isChartViewOpen = true;
  sasToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  acknowledgedAlertIndex: number = undefined;
  toDate: any;
  fromDate: any;
  subscriptions: Subscription[] = [];
  isFileUploading = false;
  today = new Date();
  loadingMessage: string;
  selectedTab: any;
  isShowOpenFilter = true;
  selectedDateRange: string;
  decodedToken: any;
  selectedDocument: any;
  derivedKPIs: any;
  derivedKPIHistoricData: any;
  nullValueArr: any[];
  frequency: any;
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  configuredHierarchy: any = {};
  noOfRecords = CONSTANTS.NO_OF_RECORDS;
  widgetStringFromMenu: any;
  uploadedFiles: any = [];
  docTableConfig
  documentObj
  headerMessage
  bodyMessage
  modalConfig
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private chartService: ChartService,
    private fileSaverService: FileSaverService,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private sanitizer: DomSanitizer,
    private singalRService: SignalRService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    if (this.contextApp.metadata?.filter_settings?.record_count) {
      this.noOfRecords = this.contextApp.metadata?.filter_settings?.record_count;
    }
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.getTileName();
    if (this.pageType === 'history') {
      this.filterObj.asset = this.asset;
    }
    this.filterObj.app = this.contextApp.app;
    this.filterObj.count = 10;
    this.filterObj.type = true;
    this.filterObj.sampling_format = 'minute';
    this.filterObj.sampling_time = 1;
    this.filterObj.aggregation_minutes = 1;
    this.filterObj.aggregation_format = 'AVG';
    await this.getAssets(this.contextApp.user.hierarchy);

    this.loadFromCache();
    if ($(window).width() < 992) {
      this.isShowOpenFilter = false;
    }
    this.setUpDocumentData();
  }

  loadFromCache() {
    let item;
    if (this.pageType === 'live') {
      item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    } else if (this.pageType === 'history') {
      item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    }
    if (item) {
      if (this.pageType === 'live') {
        this.hierarchyDropdown.updateHierarchyDetail(item);
        this.getLatestAlerts(false);
      } else if (this.pageType === 'history') {
        if (item.dateOption) {
          this.filterObj.dateOption = item.dateOption;
          if (item.dateOption !== 'Custom Range') {
            const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
            this.filterObj.from_date = dateObj.from_date;
            this.filterObj.to_date = dateObj.to_date;
            // this.filterObj.last_n_secs = dateObj.to_date - dateObj.from_date;
          } else {
            this.filterObj.from_date = item.from_date;
            this.filterObj.to_date = item.to_date;
          }
          if (this.filterObj.dateOption !== 'Custom Range') {
            this.selectedDateRange = this.filterObj.dateOption;
          } else {
            this.selectedDateRange = datefns.format(datefns.fromUnixTime(this.filterObj.from_date), "dd-MM-yyyy HH:mm") + ' to ' + datefns.format(datefns.fromUnixTime(this.filterObj.to_date), "dd-MM-yyyy HH:mm");
          }
          this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
          this.getLatestAlerts(false);
        }
      }
    }
  }

  onChangeOfAsset(event) {
    const asset = this.assets.find((assetObj) => assetObj.asset_id === event.asset_id);
    const frequencyArr = [];
    frequencyArr.push(asset?.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
    frequencyArr.push(asset?.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
    frequencyArr.push(asset?.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
    this.frequency = this.commonService.getLowestValueFromList(frequencyArr);
    if (this.filterObj.from_date && this.filterObj.to_date) {
      // this.onChangeOfAsset(this.filterObj.asset);
      const records = this.commonService.calculateEstimatedRecords(
        this.frequency,
        this.filterObj.from_date,
        this.filterObj.to_date
      );
      if (records > this.noOfRecords) {
        this.filterObj.isTypeEditable = true;
      } else {
        this.filterObj.isTypeEditable = false;
      }
    }
  }

  onSaveHierachy(configuredHierarchy) {
    this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
  }

  onClearHierarchy(configuredHierarchy) {
    this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
  }

  selectedDate(filterObj) {
    this.filterObj.from_date = filterObj.from_date;
    this.filterObj.to_date = filterObj.to_date;
    this.filterObj.dateOption = filterObj.dateOption;
    // this.filterObj.last_n_secs = filterObj.last_n_secs;
    if (this.filterObj.asset) {
      const records = this.commonService.calculateEstimatedRecords(
        this.frequency,
        this.filterObj.from_date,
        this.filterObj.to_date
      );
      if (records > this.noOfRecords) {
        this.filterObj.isTypeEditable = true;
      } else {
        this.filterObj.isTypeEditable = false;
      }
    }
  }

  onTabClick(type) {
    this.selectedTab = type;
    if (!$('.responsive-tabs').hasClass('open')) {
      $('.responsive-tabs').addClass('open');
    } else {
      $('.responsive-tabs').removeClass('open');
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

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.system_name === 'Live Alerts') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
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
            this.originalAssets = JSON.parse(JSON.stringify(this.assets));
          }
          resolve();
        })
      );
    });
  }

  getLatestAlerts(updateFilterObj = true) {
    this.latestAlerts = [];
    this.isAlertAPILoading = true;
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    let configuredHierarchy = this.configuredHierarchy;
    if (this.pageType === 'history') {
      if (this.filterObj.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
        this.filterObj.from_date = dateObj.from_date;
        this.filterObj.to_date = dateObj.to_date;
      }
    } else {
      configuredHierarchy = this.hierarchyDropdown.getConfiguredHierarchy();
    }
    const obj = { ...this.filterObj };
    obj.hierarchy = { App: this.contextApp.app };
    Object.keys(configuredHierarchy).forEach((key) => {
      if (configuredHierarchy[key]) {
        obj.hierarchy[this.contextApp.hierarchy.levels[key]] = configuredHierarchy[key];
      }
    });
    obj.hierarchy = JSON.stringify(obj.hierarchy);
    if (obj.asset) {
      obj.asset_id = obj.asset.asset_id;
      delete obj.asset;
    }
    delete obj.assetArr;
    if (this.pageType === 'live') {
      obj.from_date = datefns.getUnixTime(datefns.subHours(new Date(), 24));
      obj.to_date = datefns.getUnixTime(new Date());
      // obj.last_n_secs = obj.to_date - obj.from_date;
    } else {
      if (!obj.from_date || !obj.to_date) {
        this.toasterService.showError('Date selection is requierd.', 'Get Alert Data');
        this.isAlertAPILoading = false;
        return;
      }
      // obj.last_n_secs = obj.to_date - obj.from_date;
    }
    if (updateFilterObj) {
      let pagefilterObj;
      if (this.pageType === 'live') {
        pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
        pagefilterObj.hierarchy = { App: this.contextApp.app };
        Object.keys(this.configuredHierarchy).forEach((key) => {
          if (this.configuredHierarchy[key]) {
            pagefilterObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configuredHierarchy[key];
          }
        });
        delete pagefilterObj.assets;
        this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
      } else if (this.pageType === 'history') {
        pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
        pagefilterObj['from_date'] = obj.from_date;
        pagefilterObj['to_date'] = obj.to_date;
        pagefilterObj['dateOption'] = obj.dateOption;
        this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, pagefilterObj);
      }
    }
    this.subscriptions.push(
      this.assetService.getAssetAlertAndAlertEndEvents(obj).subscribe(
        (response: any) => {
          this.latestAlerts = response.data;
          this.selectedAlert = undefined;
          if (this.latestAlerts.length > 0) {
            this.onClickOfViewGraph(this.latestAlerts[this.acknowledgedAlertIndex || 0]);
            this.acknowledgedAlertIndex = undefined;
          } else {
            this.selectedTab = undefined;
          }
          this.latestAlerts.forEach((item, i) => {
            item.alert_id = 'alert_' + this.commonService.generateUUID();
            item.local_created_date = this.commonService.convertUTCDateToLocal(item.start_event_message_date);
            item.local_end_created_date = this.commonService.convertUTCDateToLocal(item.end_event_message_date);
            item.asset_display_name = this.assets.filter((asset) => asset.asset_id === item.asset_id)[0]?.display_name;
          });
          if (this.filterObj.dateOption === 'Custom Range') {
            this.originalFilterObj.dateOption = 'this selected range';
          }
          this.isAlertAPILoading = false;
          this.singalRService.disconnectFromSignalR('alert');
          this.signalRAlertSubscription?.unsubscribe();
          if (this.pageType === 'live') {
            const obj1 = {
              levels: this.contextApp.hierarchy.levels,
              hierarchy: this.filterObj.asset ? this.filterObj.asset.hierarchy : JSON.parse(obj.hierarchy),
              type: 'alert',
              app: this.contextApp.app,
              asset_id: obj.asset_id,
            };
            this.singalRService.connectToSignalR(obj1);
            this.signalRAlertSubscription = this.singalRService.signalRAlertData.subscribe((msg) => {
              this.getLiveAlerts(msg);
            });
            // clearInterval(this.refreshInterval);
            // this.refreshInterval = setInterval(() => {
            //   this.getLiveAlerts(obj);
            // }, 5000);
          }
        },
        () => (this.isAlertAPILoading = false)
      )
    );
  }

  getLiveAlerts(obj) {
    if (obj.type === 'alertendevent') {
      obj.end_event_message_date = obj?.timestamp || obj.ts;
      const alertObj = this.latestAlerts.find((alert) => alert.message_id === obj.message_id);
      alertObj.local_end_created_date = this.commonService.convertUTCDateToLocal(obj?.timestamp || obj?.ts);
    } else {
      obj.local_created_date = this.commonService.convertUTCDateToLocal(obj?.timestamp || obj?.ts);
      obj.start_event_message_date = obj?.timestamp || obj.ts;
      obj.message_date = obj.timestamp || obj?.ts;
      obj.alert_id = 'alert_' + this.latestAlerts.length;
      this.latestAlerts.splice(0, 0, obj);
    }
  }

  getAssetData(assetId) {
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        asset_id: assetId,
      };
      const methodToCall = this.assetService.getIPAndLegacyAssets(obj, obj.app);
      this.subscriptions.push(
        methodToCall.subscribe((response: any) => {
          if (response?.data?.length > 0) {
            this.selectedAsset = response.data[0];
          } else {
            this.selectedAsset = response;
          }
          resolve();
        })
      );
    });
  }

  getAlertConditions() {
    return new Promise<void>((resolve, reject) => {
      const filterObj = {
        app: this.contextApp.app,
        asset_id: this.selectedAlert.asset_id,
        asset_model: this.selectedAsset.asset_model || this.selectedAsset?.tags?.asset_model,
        legacy: !(this.selectedAlert.asset_id === this.selectedAlert.gateway_id),
      };
      this.alertCondition = undefined;
      if (this.selectedAlert.code) {
        filterObj['code'] = this.selectedAlert.code;
        let method;
        if (this.selectedAlert.code.startsWith('A_')) {
          method = this.assetService.getAlertConditions(this.contextApp.app, filterObj);
        } else {
          method = this.assetModelService.getAlertConditions(this.contextApp.app, filterObj);
        }
        if (method) {
          this.subscriptions.push(
            method.subscribe(
              (response: any) => {
                if (response?.data) {
                  this.alertCondition = response.data[0];
                  if (this.alertCondition && !this.alertCondition.visualization_widgets) {
                    this.alertCondition.visualization_widgets = [];
                  }
                  resolve();
                }
                if (response.data.length === 0) {
                  this.isTelemetryDataLoading = false;
                }
              },
              () => {
                reject();
                this.isTelemetryDataLoading = false;
              }
            )
          );
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  onDeSelectAll(event) {
    this.selectedWidgetsForSearch = [];
  }

  getDocuments() {
    return new Promise<void>((resolve) => {
      this.documents = [];
      const obj = {
        app: this.contextApp.app,
        asset_model: this.alertCondition?.asset_model
          ? this.alertCondition.asset_model
          : this.selectedAsset.asset_model,
      };
      this.subscriptions.push(
        this.assetModelService.getAssetsModelDocuments(obj).subscribe((response: any) => {
          if (response?.data) {
            this.documents = response.data;
            const arr = [];
            if (this.alertCondition) {
              this.alertCondition.reference_documents.forEach((refDoc) => {
                this.documents.forEach((doc) => {
                  if (doc.id.toString() === refDoc.toString()) {
                    arr.push(doc);
                  }
                });
              });
              this.alertCondition.reference_documents = arr;
            }
            resolve();
          }
        })
      );
    });
  }

  viewDocument(obj) {
    this.openModal('viewDocModal');
    this.selectedDocument = obj;
    this.selectedDocument.sanitizedURL = this.sanitizeURL(this.selectedDocument.metadata.url);
  }

  downloadDocument(obj) {
    this.downloadFile(obj.data ?? obj.metadata);
  }

  downloadFile(fileObj) {
    this.openModal('downloadDocumentModal');
    const url = this.blobStorageURL + fileObj.url + this.sasToken;
    setTimeout(() => {
      this.subscriptions.push(
        this.commonService.getFileData(url).subscribe(
          (response) => {
            this.fileSaverService.save(response, fileObj.name);
            this.closeModal('downloadDocumentModal');
          },
          (error) => {
            this.closeModal('downloadDocumentModal');
          }
        )
      );
    }, 500);
  }

  openModal(id) {
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onChangeTimeValue() {
    if (this.beforeInterval && this.afterInterval) {
      // if (this.beforeInterval + this.afterInterval > 60) {
      //   this.filterObj.isTypeEditable = true;
      // } else {
      //   this.filterObj.isTypeEditable = false;
      // }
      this.filterObj.from_date =
        this.commonService.convertDateToEpoch(
          this.selectedAlert?.start_event_message_date || this.selectedAlert.timestamp
        ) -
        this.beforeInterval * 60;
      this.filterObj.to_date =
        this.commonService.convertDateToEpoch(
          this.selectedAlert?.start_event_message_date || this.selectedAlert.timestamp
        ) +
        this.afterInterval * 60;
      // this.filterObj.last_n_secs = this.filterObj.to_date - this.filterObj.from_date;
      this.onChangeOfAsset(this.selectedAlert);
    }
  }

  getAssetderivedKPIs(assetId) {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
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

  getAssetsModelProperties() {
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: this.alertCondition?.asset_model ? this.alertCondition.asset_model : this.selectedAsset.asset_model,
      };
      this.subscriptions.push(
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
          this.propertyList.forEach((item) => {
            this.dropdownPropList.push({
              id: item.json_key,
            });
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

  getLayout() {
    return new Promise<void>((resolve) => {
      const params = {
        app: this.contextApp.app,
        name: this.alertCondition?.asset_model ? this.alertCondition.asset_model : this.selectedAsset.asset_model,
      };
      this.dropdownWidgetList = [];
      this.selectedWidgetsForSearch = [];
      this.subscriptions.push(
        this.assetModelService.getAssetsModelLayout(params).subscribe(async (response: any) => {
          if (response?.historical_widgets?.length > 0) {
            response.historical_widgets.forEach((item) => {
              this.dropdownWidgetList.push({
                id: item.title,
                value: item,
              });
              item.edge_derived_props = false;
              item.measured_props = false;
              item.cloud_derived_props = false;
              item.y1axis.forEach((prop) => {
                const type = prop?.type || this.propertyList.find((propObj) => propObj.json_key === prop)?.type;
                if (type === 'Edge Derived Properties') {
                  item.edge_derived_props = true;
                } else if (type === 'Cloud Derived Properties') {
                  item.cloud_derived_props = true;
                } else {
                  item.measured_props = true;
                }
              });
              item.y2axis.forEach((prop) => {
                const type = prop?.type || this.propertyList.find((propObj) => propObj.json_key === prop)?.type;
                if (type === 'Edge Derived Properties') {
                  item.edge_derived_props = true;
                } else if (type === 'Cloud Derived Properties') {
                  item.cloud_derived_props = true;
                } else {
                  item.measured_props = true;
                }
              });

              if (this.alertCondition) {
                this.alertCondition.visualization_widgets.forEach((widget) => {
                  if (widget === item.title) {
                    this.selectedWidgetsForSearch.push({
                      id: item.title,
                      value: item,
                    });
                  }
                });
              }
            });
            this.dropdownWidgetList = JSON.parse(JSON.stringify(this.dropdownWidgetList));
            // this.selectedWidgets = JSON.parse(JSON.stringify(this.selectedWidgets));
            if (this.selectedWidgetsForSearch.length > 0) {
              this.getAssetTelemetryData();
            } else {
              this.isTelemetryDataLoading = false;
            }
          } else {
            this.isTelemetryDataLoading = false;
          }
          resolve();
        })
      );
    });
  }

  closeModal(id) {
    $('#' + id).modal('hide');
    this.selectedDocument = undefined;
  }

  async onClickOfViewGraph(alert) {
    this.uploadedFiles = [];

    this.selectedAlert = undefined;
    this.onTabClick('visualization');
    const children = $('#charts').children();
    for (const child of children) {
      $(child).remove();
    }
    this.isOpen = true;
    this.beforeInterval = 1.5;
    this.afterInterval = 0.5;

    // $('#alertVisualizationModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.isAlertModalDataLoading = true;
    this.y1AxisProps = [];
    this.propList = [];
    this.y2AxisProps = [];
    this.selectedAlert = alert;
    this.filterObj.type = true;
    this.filterObj.sampling_format = 'minute';
    this.filterObj.sampling_time = 1;
    this.filterObj.aggregation_minutes = 1;
    this.filterObj.aggregation_format = 'AVG';
    this.onChangeTimeValue();
    if (this.selectedAlert?.metadata?.acknowledged_date) {
      this.selectedAlert.metadata.acknowledged_date = this.commonService.convertUTCDateToLocal(
        this.selectedAlert.metadata.acknowledged_date
      );
    }
    this.selectedAlert?.metadata?.files?.forEach((file) => { file['url'] = file.data.url; file['name'] = file.data.name; file['data']['type'] = file.type; file.data.sanitizedURL = this.sanitizeURL(file.data.url); file['sanitizedURL'] = file.data.sanitizedURL });
    this.isTelemetryFilterSelected = false;
    this.isTelemetryDataLoading = true;
    this.selectedAsset = this.originalAssets.find((asset) => asset.asset_id === this.selectedAlert.asset_id);
    // await this.getAssetData(this.selectedAlert.asset_id);
    await this.getAlertConditions();
    await this.getAssetderivedKPIs(
      this.alertCondition?.asset_id ? this.alertCondition.asset_id : this.selectedAsset.asset_id
    );
    await this.getAssetsModelProperties();
    await this.getDocuments();
    await this.getLayout();
    this.isAlertModalDataLoading = false;
  }

  compareFn(c1, c2): boolean {
    return c1 && c2 ? c1.asset_id === c2.asset_id : c1 === c2;
  }

  getModelReasons() {
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: this.alertCondition?.asset_model || this.selectedAsset?.asset_model,
      };
      this.subscriptions.push(
        this.assetModelService.getModelReasons(obj.app, obj.name).subscribe((response: any) => {
          this.reasons = response.data;
          resolve();
        })
      );
    });
  }

  getPropertyName(key) {
    return this.propertyList.filter((prop) => prop.json_key === key)[0]?.name || key;
  }

  getHistoricalWidgetsDrivedKPIDetails() {
    // this.propList = [];
    let kpiCodes = '';
    this.selectedWidgets.forEach((widget) => {
      widget.value.y1axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type === 'Derived KPIs') {
          this.propList.push(prop.json_key);
          const kpiObj = this.derivedKPIs.find((kpi) => kpi.kpi_json_key === prop.json_key);
          kpiCodes += kpiObj.code + ',';
        }
      });
      widget.value.y2axis.forEach((prop) => {
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
        const obj = {
          kpi_codes: kpiCodes,
          from_date: undefined,
          to_date: undefined,
          // last_n_secs: undefined,
        };
        obj.from_date = this.filterObj.from_date;
        obj.to_date = this.filterObj.to_date;

        this.derivedKPIHistoricData = [];
        this.assetService.getDerivedKPISHistoricalData(this.contextApp.app, obj).subscribe((response: any) => {
          response.data.forEach((item) => {
            const itemobj = {
              message_date: item.metadata.process_end_time,
            };
            itemobj[item.kpi_json_key] = item.kpi_result;
            if (itemobj && Object.keys(itemobj).length > 1) {
              this.derivedKPIHistoricData.push(itemobj);
            }
          });
          this.derivedKPIHistoricData.reverse();
          // this.derivedKPIHistoricData = response.data;
          resolve1();
        });
      });
    }
  }

  async getAssetTelemetryData() {
    this.isChartViewOpen = false;
    this.propList = [];
    this.selectedWidgets = JSON.parse(JSON.stringify(this.selectedWidgetsForSearch));
    this.selectedWidgets.forEach((widget) => {
      widget.value.y1axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type !== 'Derived KPIs') {
          this.propList.push(prop.json_key);
        }
      });
      widget.value.y2axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type !== 'Derived KPIs') {
          this.propList.push(prop.json_key);
        }
      });
    });
    this.selectedPropertyForChart = [];
    this.selectedPropertyForChart = [...this.propList];
    const children = $('#charts').children();
    for (const child of children) {
      $(child).remove();
    }
    this.telemetryData = [];
    const filterObj = JSON.parse(JSON.stringify(this.filterObj));
    filterObj.epoch = true;
    filterObj.app = this.contextApp.app;
    filterObj.asset_id = this.selectedAlert.asset_id;
    // filterObj.message_props = '';
    filterObj.from_date = null;
    filterObj.to_date = null;
    // filterObj.last_n_secs = null;
    const propArr = [];
    this.propertyList.forEach((propObj) => {
      this.propList.forEach((prop) => {
        if (prop === propObj.json_key) {
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
    if (this.beforeInterval > 0) {
      filterObj.from_date =
        this.commonService.convertDateToEpoch(this.selectedAlert?.start_event_message_date) - this.beforeInterval * 60;
    } else {
      this.toasterService.showError(
        'Minutes Before Alert value must be greater than 0 and less than 30.',
        'View Visualization'
      );
      return;
    }
    if (this.afterInterval > 0) {
      filterObj.to_date =
        this.commonService.convertDateToEpoch(
          this.selectedAlert?.start_event_message_date || this.selectedAlert.timestamp
        ) +
        this.afterInterval * 60;
    } else {
      this.toasterService.showError(
        'Minutes After Alert value must be greater than 0 and less than 30.',
        'View Visualization'
      );
      return;
    }
    // filterObj.last_n_secs = filterObj.to_date - filterObj.from_date;
    let method;
    // this.onChangeOfAsset(filterObj.asset_id);
    const record = this.commonService.calculateEstimatedRecords(
      this.frequency,
      this.filterObj.from_date,
      this.filterObj.to_date
    );
    if (record > this.noOfRecords && !this.filterObj.isTypeEditable) {
      this.filterObj.isTypeEditable = true;
      this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
      return;
    }
    const asset = this.assets.find((assetObj) => assetObj.asset_id === filterObj.asset_id);
    filterObj.partition_key = asset.partition_key;
    delete filterObj.count;
    delete filterObj.asset;
    this.isChartViewOpen = true;
    filterObj.order_dir = 'ASC';
    if (this.filterObj.isTypeEditable) {
      if (this.filterObj.type) {
        if (!this.filterObj.sampling_time || !this.filterObj.sampling_format) {
          this.toasterService.showError('Sampling time and format is required.', 'View Telemetry');
          return;
        } else {
          delete filterObj.aggregation_minutes;
          delete filterObj.aggregation_format;
          const records = this.commonService.calculateEstimatedRecords(
            this.filterObj.sampling_time * 60,
            filterObj.from_date,
            filterObj.to_date
          );
          if (records > this.noOfRecords) {
            this.loadingMessage =
              'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
          }
          method = this.assetService.getAssetSamplingTelemetry(filterObj, this.contextApp.app);
        }
      } else {
        if (!this.filterObj.aggregation_minutes || !this.filterObj.aggregation_format) {
          this.toasterService.showError('Aggregation time and format is required.', 'View Telemetry');
          return;
        } else {
          delete filterObj.sampling_time;
          delete filterObj.sampling_format;
          const records = this.commonService.calculateEstimatedRecords(
            this.filterObj.aggregation_minutes * 60,
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
      // this.onChangeOfAsset(this.asset);
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
    this.fromDate = filterObj.from_date;
    this.toDate = filterObj.to_date;
    if (this.selectedWidgets.length === 0) {
      this.toasterService.showError(
        'Please select at least one ' + this.widgetStringFromMenu + '.',
        'View Visualization'
      );
      this.isTelemetryDataLoading = false;
      return;
    }
    this.isOpen = false;
    this.isTelemetryFilterSelected = true;
    this.isTelemetryDataLoading = true;
    await this.getHistoricalWidgetsDrivedKPIDetails();
    // this.y2AxisProps.forEach((prop, index) =>
    // filterObj.message_props += prop.id + (index !== (this.y2AxisProps.length - 1) ? ',' : ''));
    // if (filterObj.message_props.charAt(filterObj.message_props.length - 1) === ',') {
    //   filterObj.message_props = filterObj.message_props.substring(0, filterObj.message_props.length - 1);
    // }
    this.subscriptions.push(
      method.subscribe((response: any) => {
        if (response && response.data) {
          this.telemetryData = response.data;
          if (this.derivedKPIHistoricData && this.derivedKPIHistoricData.length > 0) {
            this.telemetryData = this.telemetryData.concat(this.derivedKPIHistoricData);
          }
          this.nullValueArr = [];
          propArr.forEach((prop) => {
            let flag = false;
            for (let i = 0; i < this.telemetryData.length; i++) {
              if (this.telemetryData[i][prop.json_key] !== null && this.telemetryData[i][prop.json_key] !== undefined) {
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
          const telemetryData = JSON.parse(JSON.stringify(this.telemetryData));
          this.isChartViewOpen = true;
          telemetryData.forEach((item) => {
            item.message_date = this.commonService.convertUTCDateToLocal(item.message_date);
            item.message_date_obj = new Date(item.message_date);
          });
          // this.loadGaugeChart(telemetryData[0]);
          // telemetryData.reverse();
          this.isTelemetryDataLoading = false;
          // this.loadLineChart(telemetryData);
          if (telemetryData.length > 0) {
            this.selectedWidgets.forEach((widget) => {
              let noDataFlag = true;
              widget.value.y1axis?.forEach((prop, index) => {
                if (this.nullValueArr.indexOf(prop.json_key) === -1) {
                  noDataFlag = false;
                }
              });
              if (noDataFlag) {
                widget.value.y2axis?.forEach((prop, index) => {
                  if (this.nullValueArr.indexOf(prop.json_key) === -1) {
                    noDataFlag = false;
                  }
                });
              }
              let componentRef;
              if (widget.value.chartType === 'LineChart' || widget.value.chartType === 'AreaChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(LiveChartComponent).create(this.injector);
              } else if (widget.value.chartType === 'ColumnChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(ColumnChartComponent).create(this.injector);
              } else if (widget.value.chartType === 'BarChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(BarChartComponent).create(this.injector);
              } else if (widget.value.chartType === 'PieChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(PieChartComponent).create(this.injector);
              } else if (widget.value.chartType === 'Table') {
                componentRef = this.factoryResolver.resolveComponentFactory(DataTableComponent).create(this.injector);
              } else if (widget.value.chartType === 'VibrationDamagePlot') {
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
              componentRef.instance.selectedAlert = JSON.parse(JSON.stringify(this.selectedAlert));
              componentRef.instance.propertyList = this.propertyList;
              componentRef.instance.y1AxisProps = widget.value.y1axis;
              componentRef.instance.y2AxisProps = widget.value.y2axis;
              componentRef.instance.xAxisProps = widget.value.xAxis;
              componentRef.instance.chartType = widget.value.chartType;
              componentRef.instance.chartConfig = widget.value;
              componentRef.instance.chartStartdate = this.fromDate;
              componentRef.instance.chartEnddate = this.toDate;
              componentRef.instance.chartHeight = '23rem';
              componentRef.instance.chartWidth = '100%';
              componentRef.instance.chartTitle = widget.value.title;
              componentRef.instance.chartId = widget.value.chart_Id;
              this.appRef.attachView(componentRef.hostView);
              const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
              document.getElementById('charts').prepend(domElem);
            });
          }
        }
      })
    );
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

  async onClickOfAcknowledgeAlert(alert): Promise<void> {
    this.acknowledgedAlert = alert;
    this.acknowledgedAlertIndex = this.latestAlerts.findIndex((alertObj) => alertObj.id === alert.id);
    if (!this.acknowledgedAlert || !this.acknowledgedAlert.metadata) {
      this.acknowledgedAlert.metadata = {
        files: [
          {
            type: undefined,
            data: {},
          },
        ],
      };
    } else if (!this.acknowledgedAlert.metadata.files || this.acknowledgedAlert.metadata.files.length === 0) {
      this.acknowledgedAlert.metadata.files = [
        {
          type: undefined,
          data: {},
        },
      ];
    }
    await this.getAssetData(this.acknowledgedAlert.asset_id);
    await this.getModelReasons();
    $('#acknowledgemenConfirmModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  sanitizeURL(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.blobStorageURL + url + this.sasToken);
  }

  addDocument() {
    let msg = '';
    this.acknowledgedAlert.metadata.files.forEach((file) => {
      if (!file.type || !file?.data?.name) {
        msg = 'Please select file.';
      }
    });
    if (msg) {
      this.toasterService.showError(msg, 'Acknowledge Alert');
      return;
    }
    this.acknowledgedAlert.metadata.files.push({
      type: undefined,
      data: {},
    });
  }

  onDocumentFileSelected(files: FileList, index) {
    console.log("index", index)
    if (!files?.item(0).type.includes(this.acknowledgedAlert.metadata.files[index].type?.toLowerCase())) {
      this.toasterService.showError('This file is not valid for selected document type', 'Select File');
      return;
    }
    this.uploadedFiles.splice(index, 1, {
      'file': files?.item(0),
      'index': index
    })
    console.log("uploadfiles", this.uploadedFiles)
    this.acknowledgedAlert.metadata.files[index].data.name = files?.item(0).name;
  }

  async uploadFile() {
    this.isFileUploading = true;

    await Promise.all(this.uploadedFiles.map(async (file) => {
      const data = await this.commonService.uploadImageToBlob(
        file.file,
        this.contextApp.app + '/assets/' + this.acknowledgedAlert.asset_id + '/alerts/' + this.acknowledgedAlert.code
      );
      if (data) {
        this.acknowledgedAlert.metadata.files[file.index].data = data;

        // console.log("Checking", JSON.stringify(this.acknowledgedAlert.metadata.files[file.index].data))
        // this.acknowledgedAlert.metadata.files[file.index].data = data;
      } else {
        this.toasterService.showError('Error in uploading file', 'Upload file');
      }
    }))
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  async acknowledgeAlert() {
    await this.uploadFile();
    const files = [];
    this.acknowledgedAlert.metadata.files.forEach((file) => {
      if (file.type && file?.data?.url && file?.data?.name) {
        files.push(file);
      }
    });
    this.acknowledgedAlert.metadata.files = files;
    const obj = {
      app: this.contextApp.app,
      asset_id: this.acknowledgedAlert.asset_id,
      message_id: this.acknowledgedAlert.message_id,
      message_date: this.acknowledgedAlert.start_event_message_date,
      code: this.acknowledgedAlert.code,
      message: this.acknowledgedAlert.message,
      metadata: this.acknowledgedAlert.metadata,
      from_date: null,
      to_date: null,
      epoch: true,
    };
    const epoch = this.commonService.convertDateToEpoch(this.acknowledgedAlert.start_event_message_date);
    obj.from_date = epoch ? epoch - 300 : null;
    obj.to_date = epoch ? epoch + 300 : null;
    obj.metadata['user_id'] = this.userData.email;
    obj.metadata['acknowledged_date'] = datefns.format(new Date(), "MM/dd/yyyy HH:mm:ss");
    this.subscriptions.push(
      this.assetService.acknowledgeAssetAlert(obj).subscribe(
        (response) => {
          this.toasterService.showSuccess('Alert acknowledged successfully', 'Acknowledge Alert');
          this.getLatestAlerts();
          this.closeAcknowledgementModal();
          this.acknowledgedAlert = undefined

          //this.acknowledgedAlertIndex = -1
          // this.getAlarms();
        },
        (error) => {
          this.toasterService.showError(error.message, 'Acknowledge Alert');
        }
      )
    );
  }

  closeAcknowledgementModal(flag = false): void {
    $('#acknowledgemenConfirmModal').modal('hide');
    if (flag) {
      debugger
      this.latestAlerts.forEach((alert) => {
        if (alert?.id === this.acknowledgedAlert?.id || alert?.alert_id === this.acknowledgedAlert?.alert_id) {
          alert.metadata = {};
        }
      });
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.signalRAlertSubscription?.unsubscribe();
    this.singalRService.disconnectFromSignalR('alert');
  }

  y1Deselect(e) {
    if (e === [] || e.length === 0) {
      this.y1AxisProps = [];
    }
  }
  y2Deselect(e) {
    if (e === [] || e.length === 0) {
      this.y2AxisProps = [];
    }
  }

  onTableFunctionCall(obj) {
    if (obj.for === 'Download') {
      this.headerMessage = 'Download Document';
      this.bodyMessage = 'Downloading Document...';
      this.modalConfig = {
        stringDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: false,
      };
      this.downloadFile(obj.metadata ?? obj.data);
    } else if (obj.for === 'View Document') {
      this.openModal('viewDocModal');
      this.selectedDocument = obj.metadata ?? obj.data;
    }
  }

  setUpDocumentData() {
    this.docTableConfig = {
      type: 'Documents',
      tableHeight: 'calc(100vh - 11rem)',
      data: [
        {
          name: 'Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Type',
          key: 'type',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Actions',
          key: undefined,
          type: 'button',
          headerClass: '',
          btnData: [

            {
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'View Document',
              valueclass: '',
              tooltip: 'View Document',
            },
            {
              icon: 'fa fa-fw fa-download',
              text: '',
              id: 'Download',
              valueclass: '',
              tooltip: 'Download',
            }
          ],
        },
      ],
    };
  }
}
