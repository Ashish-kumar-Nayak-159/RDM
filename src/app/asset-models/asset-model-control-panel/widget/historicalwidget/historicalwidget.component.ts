import { DamagePlotChartComponent } from './../../../../common/charts/damage-plot-chart/damage-plot-chart.component';
import { AssetModelService } from './../../../../services/asset-model/asset-model.service';
import { Asset } from './../../../../models/asset.model';
import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  EmbeddedViewRef,
  Injector,
  OnChanges,
  OnInit,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Input } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import * as datefns from 'date-fns';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { ColumnChartComponent } from 'src/app/common/charts/column-chart/column-chart.component';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from 'src/app/common/charts/pie-chart/pie-chart.component';
import { DataTableComponent } from 'src/app/common/charts/data-table/data-table.component';
import { ApplicationService } from 'src/app/services/application/application.service';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SpaceValidator } from '../../asset-model-layout/SpaceValidator';
declare var $: any;

@Component({
  selector: 'app-historicalwidget',
  templateUrl: './historicalwidget.component.html',
  styleUrls: ['./historicalwidget.component.css']
})

export class HistoricalwidgetComponent implements OnInit, OnChanges, OnDestroy {
  @Input() assetModel: any;
  apiSubscriptions: Subscription[] = [];
  historyData: any[] = [];
  isHistoryAPILoading = false;
  @Input() asset = new Asset();
  userData: any;
  isFilterSelected = false;
  propertyList: any[] = [];
  y1AxisProps = [];
  y2AxisProps = [];
  // y1AxisProps = "";
  // y2AxisProp = "";
  xAxisProps = '';
  // chart selection
  chartCount = 0;
  chartTypes = [
    'Bar Chart',
    'Column Chart',
    'Line Chart',
    'Area Chart',
    'Vibration Damage Plot',
    'Pie Chart',
    'Data Table',
  ];
  chartTypeValues = [
    {
      name: 'Bar Chart',
      value: 'BarChart',
      icon: 'fa-bar-chart fa-rotate-90',
    },
    {
      name: 'Column Chart',
      value: 'ColumnChart',
      icon: 'fa-bar-chart',
    },
    {
      name: 'Line Chart',
      value: 'LineChart',
      icon: 'fa-line-chart',
    },
    {
      name: 'Area Chart',
      value: 'AreaChart',
      icon: 'fa-area-chart',
    },
    {
      name: 'Vibration Damage Plot',
      value: 'VibrationDamagePlot',
      icon: 'fa-line-chart',
    },
    {
      name: 'Pie Chart',
      value: 'PieChart',
      icon: 'fa-pie-chart',
    },
    {
      name: 'Data Table',
      value: 'Table',
      icon: 'fa-table',
    },
  ];
  chartIcons = [
    'fa-bar-chart fa-rotate-90',
    'fa-bar-chart',
    'fa-line-chart',
    'fa-area-chart',
    'fa-line-chart',
    'fa-pie-chart',
    'fa-table',
  ];
  public selectedChartType = 'Widget Type';
  columnNames = [];
  layoutJson = [];
  storedLayout: any[] = [];
  chartTitle = '';
  showDataTable = false;
  selectedHierarchy = '';
  renderCount = 0;
  selectedWidgets = [];
  dropdownWidgetList = [];
  contextApp: any;
  fromDate: any;
  toDate: any;
  subscriptions: Subscription[] = [];
  decodedToken: any;
  derivedKPIs: any[] = [];
  filteredPropList: any[] = [];
  widgetStringFromMenu: any;
  isCreateWidgetAPILoading: boolean = false;
  isFormValid: boolean = false;
  historicalWidgetForm: FormGroup;
  submitted: boolean;
  showPopup: boolean;
  telemetryData: any[];
  chartWidth: string;
  chartHeight: string;
  chartId: any;
  configureDashboardWidgets: any[];
  isAllWidgestSelectedForHistorical: any;
  isAllWidgestSelectedForDeleteHistorical: any;
  isAllWidgestSelectedForDashboard: any;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean; };
  bodyMessage: string;
  headerMessage: string;
  deleteBtn: boolean;

  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private assetModelService: AssetModelService,
    private applicationService: ApplicationService
  ) {

  }
  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.selectedChartType = this.widgetStringFromMenu + ' Type';
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    await this.getAssetModelsderivedKPIs();
    await this.getAssetsModelProperties();
    this.isHistoryAPILoading = true;
    // this.getLayout();
    this.getAssetWidget();

    this.historicalWidgetForm = new FormGroup({
      chartTitle: new FormControl('', [Validators.required, SpaceValidator.noWhitespaceValidator]),
      selectedChartType: new FormControl(this.selectedChartType, Validators.required),
      y1AxisProps: new FormControl('', Validators.required),
      y2AxisProps: new FormControl(''),
      wid: new FormControl(''),
      dashboardVisibility: new FormControl(''),
    });

  }

  get f() { return this.historicalWidgetForm.controls; }

  getAssetModelsderivedKPIs() {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.assetModelService.getDerivedKPIs(this.contextApp.app, this.assetModel.name).subscribe((response: any) => {
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

  onWidgetTypeChange() {
    if (this.selectedChartType === 'Vibration Damage Plot') {
      this.filteredPropList = this.propertyList.filter(
        (prop) => prop.data_type === 'Object' && prop.data_type !== 'Array'
      );
    }
    else if (this.selectedChartType !== 'Pie Chart' && this.selectedChartType !== 'Vibration Damage Plot' && this.selectedChartType !== 'Data Table') {
      this.filteredPropList = this.propertyList.filter(
        (prop) => prop.data_type === 'Number'
      );
    }
    else {
      this.filteredPropList = this.propertyList.filter(
        (prop) => prop.data_type !== 'Object' && prop.data_type !== 'Array'
      );
    }
    this.y1AxisProps = [];
    this.y2AxisProps = [];
  }

  getAssetsModelProperties() {
    // this.properties = {};
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: this.assetModel.name,
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
          this.derivedKPIs.forEach((kpi) => {
            const obj: any = {};
            obj.type = 'Derived KPIs';
            obj.name = kpi.name;
            obj.json_key = kpi.kpi_json_key;
            obj.json_model = {};
            obj.data_type = kpi?.metadata?.data_type || 'Number';
            obj.json_model[obj.json_key] = {
              unit: kpi.unit,
            };
            this.propertyList.push(obj);
          });
          resolve();
        })
      );
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isLayout && !changes.isLayout.currentValue && this.contextApp.app) {
      this.getLayout();
    }
    this.clear();
  }

  clear() {
    this.selectedChartType = this.widgetStringFromMenu + ' Type';
    this.chartTitle = '';
    this.xAxisProps = '';
    this.y1AxisProps = [];
    this.y2AxisProps = [];
  }

  setChartType() {
    return this.chartTypeValues.find((type) => {
      return type.name === this.selectedChartType;
    })?.value;
  }

  async addChart() {
    if (!this.chartTitle || this.chartTitle.trim().length === 0 || !this.selectedChartType || this.y1AxisProps.length === 0) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add ' + this.widgetStringFromMenu);
      return;
    }
    if (this.selectedChartType === 'Vibration Damage Plot') {
      let flag = false;
      const arr = [];
      this.y1AxisProps.forEach((prop) => {
        if (prop.data_type === 'Object') {
          arr.push({
            json_key: prop.json_key,
            type: prop.type,
          });
        } else {
          flag = true;
        }
      });
      this.y1AxisProps = [...arr];
      // if (this.y1AxisProps.length > 1 || this.y1AxisProps.length === 0) {
      //   this.toasterService.showError('Damage Plot can have only 1 property as y1 axis property', 'Add Chart');
      //   return;
      // }
      if (this.y2AxisProps.length > 0) {
        this.toasterService.showError(
          'Damage Plot will not contain any y2 axis property',
          'Add ' + this.widgetStringFromMenu
        );
        return;
      }
    } else {
      if (this.y1AxisProps.length + this.y2AxisProps.length > 4) {
        this.toasterService.showError(
          'Max 4 properties are allowed in a ' + this.widgetStringFromMenu,
          'Add ' + this.widgetStringFromMenu
        );
        return;
      }
      let arr = [];

      this.y1AxisProps.forEach((prop) => {
        if (prop.data_type !== 'Object') {
          arr.push({
            json_key: prop.json_key,
            type: prop.type,
          });
        }
      });
      this.y1AxisProps = [...arr];
      arr = [];
      this.y2AxisProps.forEach((prop) => {
        if (prop.data_type !== 'Object') {
          arr.push({
            json_key: prop.json_key,
            type: prop.type,
          });
        }
      });
      this.y2AxisProps = [...arr];
      if (this.y1AxisProps.length === 0) {
        this.toasterService.showError('Please select at least one non-object type property.', 'Add Chart');
        return;
      }
    }
    const obj = {
      title: this.chartTitle,
      chartType: this.setChartType(),
      chartCount: this.chartCount,
      chart_Id: 'chart_' + datefns.getUnixTime(new Date()),
      showDataTable: this.showDataTable,
      y1axis: this.y1AxisProps,
      y2axis: this.y2AxisProps,
      xAxis: this.xAxisProps,
      edge_derived_props: false,
      cloud_derived_props: false,
      measured_props: false,
      derived_kpis: false,
    };
    obj.y1axis.forEach((prop) => {
      if (prop.type === 'Derived KPIs') {
        obj.derived_kpis = true;
      } else if (prop.type === 'Edge Derived Properties') {
        obj.edge_derived_props = true;
      } else if (prop.type === 'Cloud Derived Properties') {
        obj.cloud_derived_props = true;
      } else {
        obj.measured_props = true;
      }
    });
    obj.y2axis.forEach((prop) => {
      if (prop.type === 'Derived KPIs') {
        obj.derived_kpis = true;
      } else if (prop.type === 'Edge Derived Properties') {
        obj.edge_derived_props = true;
      } else if (prop.type === 'Cloud Derived Properties') {
        obj.cloud_derived_props = true;
      } else {
        obj.measured_props = true;
      }
    });
    const index = this.layoutJson.findIndex((widget) => widget.title.toLowerCase() === obj.title.toLowerCase());
    if (index === -1) {
      await this.plotChart(obj, 0);
      this.clear();
      this.layoutJson.push(obj)
    } else {
      this.toasterService.showError(
        this.widgetStringFromMenu + ' with same title is already exist.',
        'Add ' + this.widgetStringFromMenu
      );
    }
  }

  plotChart(layoutJson, index) {
    return new Promise<void>((resolve) => {
      $('.overlay').show();
      this.chartCount++;
      const y1Axis = layoutJson.y1axis;
      const y2Axis = layoutJson.y2axis;
      const data = [];
      for (let i = 0; i < 10; i++) {
        const obj = {
          message_date: datefns.format(datefns.subMinutes(new Date(), i), "yyyy-MM-dd HH:mm:ss"),
          message_date_obj: null,
        };
        obj.message_date_obj = new Date(obj.message_date);
        y1Axis.forEach((element) => {
          this.propertyList.forEach((prop) => {
            if (element.json_key === prop.json_key) {
              if (prop.data_type === 'Number') {
                obj[prop.json_key] = this.commonService.randomIntFromInterval(
                  prop.json_model[prop.json_key].minValue ? prop.json_model[prop.json_key].minValue : 0,
                  prop.json_model[prop.json_key].maxValue ? prop.json_model[prop.json_key].maxValue : 100
                );
              } else if (prop.data_type === 'Enum') {
                obj[prop.json_key] =
                  prop.json_model[prop.json_key].enum[
                  this.commonService.randomIntFromInterval(
                    0,
                    prop.json_model[prop.json_key].enum ? prop.json_model[prop.json_key].enum.length : 0
                  )
                  ];
              }
            }
          });
        });
        y2Axis.forEach((element) => {
          this.propertyList.forEach((prop) => {
            if (element.json_key === prop.json_key) {
              if (prop.data_type === 'Number') {
                obj[prop.json_key] = this.commonService.randomIntFromInterval(
                  prop.json_model[prop.json_key].minValue ? prop.json_model[prop.json_key].minValue : 0,
                  prop.json_model[prop.json_key].maxValue ? prop.json_model[prop.json_key].maxValue : 100
                );
              } else if (prop.data_type === 'Enum') {
                obj[prop.json_key] =
                  prop.json_model[prop.json_key].enum[
                  this.commonService.randomIntFromInterval(
                    0,
                    prop.json_model[prop.json_key].enum ? prop.json_model[prop.json_key].enum.length : 0
                  )
                  ];
              }
            }
          });
        });
        data.splice(0, 0, obj);
      }

      if (layoutJson.chartType === 'Data Table') {
        this.layoutJson[index].telemetryData = data.reverse();
      }
      else {
        this.layoutJson[index].telemetryData = data;
        this.chartHeight = "23rem";
        this.chartWidth = "100%";
      }

      // let componentRef;
      // if (layoutJson.chartType === 'LineChart' || layoutJson.chartType === 'AreaChart') {
      //   componentRef = this.factoryResolver.resolveComponentFactory(LiveChartComponent).create(this.injector);
      // } else if (layoutJson.chartType === 'ColumnChart') {
      //   componentRef = this.factoryResolver.resolveComponentFactory(ColumnChartComponent).create(this.injector);
      // } else if (layoutJson.chartType === 'BarChart') {
      //   componentRef = this.factoryResolver.resolveComponentFactory(BarChartComponent).create(this.injector);
      // } else if (layoutJson.chartType === 'PieChart') {
      //   componentRef = this.factoryResolver.resolveComponentFactory(PieChartComponent).create(this.injector);
      // } else if (layoutJson.chartType === 'Table') {
      //   componentRef = this.factoryResolver.resolveComponentFactory(DataTableComponent).create(this.injector);
      // } else if (layoutJson.chartType === 'VibrationDamagePlot') {
      //   componentRef = this.factoryResolver.resolveComponentFactory(DamagePlotChartComponent).create(this.injector);
      // }
      // if (layoutJson.chartType === 'Table')
      //   componentRef.instance.telemetryData = data.reverse();
      // else
      //   componentRef.instance.telemetryData = data;
      // componentRef.instance.propertyList = this.propertyList;
      // componentRef.instance.y1AxisProps = layoutJson.y1axis;
      // componentRef.instance.y2AxisProps = layoutJson.y2axis;
      // componentRef.instance.xAxisProps = layoutJson.xAxis;
      // componentRef.instance.chartType = layoutJson.chartType;
      // componentRef.instance.chartHeight = '23rem';
      // componentRef.instance.chartWidth = '100%';
      // componentRef.instance.asset = this.asset;
      // componentRef.instance.chartConfig = layoutJson;
      // // componentRef.instance.chartEnddate = this.toDate;
      // componentRef.instance.chartTitle = layoutJson.title;
      // componentRef.instance.chartId = layoutJson.chart_Id;
      // componentRef.instance.isOverlayVisible = true;
      // componentRef.instance.hideCancelButton = !this.assetModel.freezed;
      // componentRef.instance.removeWidget = (id) => this.removeWidget(id);
      // this.appRef.attachView(componentRef.hostView);
      // const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
      // document.getElementById('layoutWidgetContainer').prepend(domElem);
      // resolve();

    });
  }

  renderLayout() {
    const layoutChildren: any = $('#layoutWidgetContainer').children();
    for (const child of layoutChildren) {
      $(child).remove();
    }
    let widgetsToLoad = [];
    widgetsToLoad = this.layoutJson;
    if (this.layoutJson) {
      widgetsToLoad.forEach(async (currentChart, index) => {
        this.renderCount++;
        currentChart['chartCount'] = this.renderCount;
        await this.plotChart(currentChart, index);
      });
    } else {
      this.toasterService.showError('Layout not defined', 'Layout');
    }
  }

  removeWidget(id) {

    if (id == 0) {
      let deleteReq = [];
      for (let i = 0; i < this.configureDashboardWidgets.length; i++) {
        if (this.configureDashboardWidgets[i].isDelete) {
          // this.configureDashboardWidgets.splice(i, 1);
          let obj = {
            "action": "Delete",
            "id": 0,
            "chartId": "string",
            "dashboardVisibility": true,
            "index": 0,
            "isDelete": true
          }
          obj.id = this.configureDashboardWidgets[i].id;
          obj.chartId = this.configureDashboardWidgets[i].chart_Id;
          deleteReq.push(obj);
        }
      }
      if (deleteReq.length > 0) {

        this.assetModelService.bulkDeleteAssetWidget(this.assetModel.name, deleteReq).subscribe(res => {
          this.toasterService.showSuccess(res["message"], 'Save Layout');
          this.getAssetWidget();
          this.onCloseConfigureDashboardModal();

        })
      }
    }
    else {
      this.assetModelService.deleteAssetWidget(this.assetModel.name, id).subscribe(res => {
        this.toasterService.showSuccess(res["message"], 'Save Layout');
        this.getAssetWidget();
        this.onCloseConfigureDashboardModal();

      })
    }

  }

  saveLayout() {
    for (let i = 0; i < this.layoutJson.length; i++) {
      if (document.getElementById(this.layoutJson[i].chart_Id) == null) {
        this.layoutJson.splice(i, 1);
      }
    }
    this.assetModel.historical_widgets = this.layoutJson;
    this.assetModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService.updateAssetsModel(this.assetModel, this.contextApp.app).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Save Layout');
          this.getLayout();
        },
        (err) => {
          this.toasterService.showError(err.message, 'Save Layout');
        }
      )
    );
  }

  getLayout() {
    const params = {
      app: this.contextApp.app,
      name: this.assetModel.name,
    };
    this.dropdownWidgetList = [];
    this.selectedWidgets = [];
    this.layoutJson = [];
    this.subscriptions.push(
      this.assetModelService.getAssetsModelLayout(params).subscribe(
        async (response: any) => {
          if (response?.historical_widgets?.length > 0) {

            this.layoutJson = response.historical_widgets;
            this.storedLayout = response.historical_widgets;
            this.layoutJson.forEach((item) => {
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
            });
            this.renderLayout();
          }
          this.isHistoryAPILoading = false;
        },
        () => (this.isHistoryAPILoading = false)
      )
    );
  }

  y1Deselect(e) {
    if (e.length === 0) {
      this.y1AxisProps = [];
    }
  }
  y2Deselect(e) {
    if (e.length === 0) {
      this.y2AxisProps = [];
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onOpenConfigureDashboardModal() {
    this.configureDashboardWidgets = this.layoutJson.map(o => ({ ...o }));
    this.configureDashboardWidgets.forEach((widget, index) => {
      widget.index = index + 1;
      widget.isDelete = false;
      widget.dashboardVisibility = widget.dashboard_visibility;
    });
    this.checkForAllWidgetVisibility(0);
    this.checkForAllWidgetVisibility(1);

    $('#configureHDashboardWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.getTableSortable();
  }
  onCloseConfigureDashboardModal() {
    $('#configureHDashboardWidgetsModal').modal('hide');
    this.configureDashboardWidgets = [];
  }
  onClickOfCheckbox(type) {
    if (type == 0) {
      if (this.isAllWidgestSelectedForHistorical) {
        this.configureDashboardWidgets.forEach((widget) => (widget.dashboardVisibility = true));
      } else {
        this.configureDashboardWidgets.forEach((widget) => (widget.dashboardVisibility = false));
      }
    }
    else if (type == 1) {
      if (this.isAllWidgestSelectedForDeleteHistorical) {
        this.configureDashboardWidgets.forEach((widget) => (widget.isDelete = true));
      } else {
        this.configureDashboardWidgets.forEach((widget) => (widget.isDelete = false));
      }

      this.deleteBtn = this.isAllWidgestSelectedForDeleteHistorical ? true : false;

    }

  }
  checkForAllWidgetVisibility(type) {
    let count = 0;
    if (type == 0) {
      this.configureDashboardWidgets.forEach((widget, index) => {
        if (widget.dashboardVisibility) {
          count++;
        }
      });
      if (count === this.configureDashboardWidgets.length) {
        this.isAllWidgestSelectedForHistorical = true;
      } else {
        this.isAllWidgestSelectedForHistorical = false;
      }
    }
    else if (type == 1) {
      this.configureDashboardWidgets.forEach((widget, index) => {
        if (widget.isDelete) {
          count++;
        }
      });
      if (count === this.configureDashboardWidgets.length) {
        this.isAllWidgestSelectedForDeleteHistorical = true;
      } else {
        this.isAllWidgestSelectedForDeleteHistorical = false;
      }

      this.deleteBtn = count > 0 ? true : false;

    }
  }
  onSaveConfigureDashboardWidgets() {

    this.isCreateWidgetAPILoading = true;
    this.sortListBasedOnIndex();
    let req = [];
    for (let i = 0; i < this.configureDashboardWidgets.length; i++) {
      if (!this.configureDashboardWidgets[i].isDelete) {
        // this.configureDashboardWidgets.splice(i, 1);
        let obj = {
          "action": "ReArrange",
          "id": this.configureDashboardWidgets[i].id,
          "chartId": this.configureDashboardWidgets[i].chart_Id,
          "dashboardVisibility": this.configureDashboardWidgets[i].dashboardVisibility,
          "index": this.configureDashboardWidgets[i].index,
          "isDelete": false
        }
        req.push(obj);
      }
    }
    if (req.length > 0) {

      this.assetModelService.bulkDeleteAssetWidget(this.assetModel.name, req).subscribe(res => {
        this.toasterService.showSuccess(res["message"], 'Save Layout');
        this.getAssetWidget();
        this.onCloseConfigureDashboardModal();
      })
    }
    // this.updateAssetModel(this.configureDashboardWidgets, 'Dashboard configured successfully');
  }
  sortListBasedOnIndex() {

    this.configureDashboardWidgets.sort((a, b) => a.index - b.index);

    this.isCreateWidgetAPILoading = false;

  }
  openConfirmRemoveWidgetModal() {
    ;
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.bodyMessage =
      'Are you sure you want to remove this ' + this.widgetStringFromMenu + '?';
    this.headerMessage = 'Remove ' + this.widgetStringFromMenu;
    $('#confirmRemoveWidgetModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }
  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#confirmRemoveWidgetModal').modal('hide');
    } else if (eventType === 'save') {
      this.removeWidget(0);
      $('#confirmRemoveWidgetModal').modal('hide');
    }
  }


  onAdd() {
    this.showPopup = true;
    setTimeout(() => {
      $('#addHWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }, 100);
  }

  onMenu(event) {
    if (event.type == "Delete") {
      this.removeWidget(event.widgetId);
    }
    else {
      this.assetModelService.getAssetWidgetById(this.assetModel.name, event.widgetId).subscribe(res => {

        let data = res.properties[0];
        data.title = res.widget_title;
        data.chartType = res.widget_type;
        data.chart_Id = res.chart_id;

        this.historicalWidgetForm.controls.chartTitle.setValue(data.title);
        this.historicalWidgetForm.controls.selectedChartType.setValue(data.chartType);
        this.historicalWidgetForm.controls.y1AxisProps.setValue(data.y1axis);
        this.historicalWidgetForm.controls.y2AxisProps.setValue(data.y2axis);
        this.historicalWidgetForm.controls.dashboardVisibility.setValue(res.dashboard_visibility);

        this.onPopupWidgetTypeChange();
        if (event.type == "Edit") {
          this.historicalWidgetForm.controls.wid.setValue(event.widgetId);
        } else if (event.type == "Clone") {
          this.historicalWidgetForm.controls.wid.setValue(0);
        }
        this.showPopup = true;
        setTimeout(() => {
          $('#addHWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
        }, 100);
      })
    }
  }

  onCloseAddWidgetModal() {
    $('#addHWidgetsModal').modal('hide');
    this.showPopup = false;
    this.historicalWidgetForm.reset();
    this.submitted = false;
    this.isCreateWidgetAPILoading = false;
    this.clear();
  }

  onPopupWidgetTypeChange() {
    let selectChartType = this.historicalWidgetForm.controls.selectedChartType.value;
    if (selectChartType === 'Vibration Damage Plot') {
      this.filteredPropList = this.propertyList.filter(
        (prop) => prop.data_type === 'Object' && prop.data_type !== 'Array'
      );
    }
    else if (selectChartType !== 'Pie Chart' && selectChartType !== 'Vibration Damage Plot' && selectChartType !== 'Data Table') {
      this.filteredPropList = this.propertyList.filter(
        (prop) => prop.data_type === 'Number'
      );
    }
    else {
      this.filteredPropList = this.propertyList.filter(
        (prop) => prop.data_type !== 'Object' && prop.data_type !== 'Array'
      );
    }
    this.y1AxisProps = [];
    this.y2AxisProps = [];
  }

  submitHistorical() {

    this.submitted = true;
    if (this.historicalWidgetForm.invalid) {
      return
    }

    let chartType = this.historicalWidgetForm.controls.selectedChartType.value;
    let y1axis = this.historicalWidgetForm.controls.y1AxisProps.value;
    let y2axis = this.historicalWidgetForm.controls.y2AxisProps.value ? this.historicalWidgetForm.controls.y2AxisProps.value : [];

    if (chartType === 'Vibration Damage Plot') {
      let flag = false;
      const arr = [];
      y1axis.forEach((prop) => {
        if (prop.data_type === 'Object') {
          arr.push({
            json_key: prop.json_key,
            type: prop.type,
          });
        } else {
          flag = true;
        }
      });
      y1axis = [...arr];
      if (y2axis.length > 0) {
        this.toasterService.showError(
          'Damage Plot will not contain any y2 axis property',
          'Add ' + this.widgetStringFromMenu
        );
        return;
      }
    } else {
      if (y1axis.length + y2axis.length > 4) {
        this.toasterService.showError(
          'Max 4 properties are allowed in a ' + this.widgetStringFromMenu,
          'Add ' + this.widgetStringFromMenu
        );
        return;
      }
      let arr = [];

      y1axis.forEach((prop) => {
        if (prop.data_type !== 'Object') {
          arr.push({
            json_key: prop.json_key,
            type: prop.type,
          });
        }
      });
      y1axis = [...arr];
      arr = [];
      y2axis.forEach((prop) => {
        if (prop.data_type !== 'Object') {
          arr.push({
            json_key: prop.json_key,
            type: prop.type,
          });
        }
      });
      y2axis = [...arr];
      if (y1axis.length === 0) {
        this.toasterService.showError('Please select at least one non-object type property.', 'Add Chart');
        return;
      }
    }

    const obj = {
      // title: this.historicalWidgetForm.controls.chartTitle.value,
      // chartType: chartType,
      // chartCount: this.chartCount,
      // chart_Id: 'chart_' + datefns.getUnixTime(new Date()),
      showDataTable: this.showDataTable,
      y1axis: y1axis,
      y2axis: y2axis,
      xAxis: this.xAxisProps,
      edge_derived_props: false,
      cloud_derived_props: false,
      measured_props: false,
      derived_kpis: false,
    };

    obj.y1axis.forEach((prop) => {
      if (prop.type === 'Derived KPIs') {
        obj.derived_kpis = true;
      } else if (prop.type === 'Edge Derived Properties') {
        obj.edge_derived_props = true;
      } else if (prop.type === 'Cloud Derived Properties') {
        obj.cloud_derived_props = true;
      } else {
        obj.measured_props = true;
      }
    });
    obj.y2axis.forEach((prop) => {
      if (prop.type === 'Derived KPIs') {
        obj.derived_kpis = true;
      } else if (prop.type === 'Edge Derived Properties') {
        obj.edge_derived_props = true;
      } else if (prop.type === 'Cloud Derived Properties') {
        obj.cloud_derived_props = true;
      } else {
        obj.measured_props = true;
      }
    });

    let reqObj = {
      "type": "HistoricalWidget",
      "chart_id": 'chart_' + datefns.getUnixTime(new Date()),
      "widget_type": chartType,
      "widget_title": this.historicalWidgetForm.controls.chartTitle.value,
      "properties": [
        obj
      ],
      "index": 0,
      "derived_kpis": true,
      "measured_props": true,
      "edge_derived_props": true,
      "cloud_derived_props": true,
      "dashboard_visibility": this.historicalWidgetForm.controls.dashboardVisibility.value,
      "metadata": {
        "additionalProp1": [
          null
        ],
        "additionalProp2": [
          null
        ],
        "additionalProp3": [
          null
        ]
      }
    }



    let id = this.historicalWidgetForm.controls.wid.value;
    if (id > 0) {
      this.assetModelService.updateAssetWidget(this.assetModel.name, id, reqObj,).subscribe(res => {
        this.toasterService.showSuccess(res["message"], 'Save Layout');
        this.onCloseAddWidgetModal();
        this.getAssetWidget();
      })
    }
    else {
      const index = this.layoutJson.findIndex((widget) => widget.title.toLowerCase() === reqObj.widget_title.toLowerCase());
      if (index === -1) {
        this.assetModelService.createAssetsWidget(reqObj, this.assetModel.name).subscribe(res => {
          this.toasterService.showSuccess(res["message"], 'Save Layout');
          this.onCloseAddWidgetModal();
          this.getAssetWidget();
        })
      }
      else {
        this.toasterService.showError(
          this.widgetStringFromMenu + ' with same title is already exist.',
          'Add ' + this.widgetStringFromMenu
        );
      }
    }


    // this.saveLayout();
  }

  getAssetWidget() {
    const params = {
      app: this.contextApp.app,
      name: this.assetModel.name,
    };
    this.dropdownWidgetList = [];
    this.selectedWidgets = [];
    this.layoutJson = [];
    this.storedLayout = [];
    this.assetModelService.getAssetWidget(this.assetModel.name, "HistoricalWidget").subscribe(response => {
      if (response?.data?.length > 0) {
        response.data.forEach((dataElement, index) => {
          if (dataElement?.properties?.length > 0) {
            dataElement.properties[0].id = dataElement.id;
            dataElement.properties[0].title = dataElement.widget_title;
            dataElement.properties[0].chartType = dataElement.widget_type;
            dataElement.properties[0].chart_Id = dataElement.chart_id;
            dataElement.properties[0].dashboard_visibility = dataElement.dashboard_visibility;

            this.layoutJson.push(dataElement.properties[0]);
            this.storedLayout.push(dataElement.properties[0]);
          }
        });

        this.layoutJson.forEach((item) => {
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
        });
        this.renderLayout();

      }
      this.isHistoryAPILoading = false;
    }, error => {
      this.isHistoryAPILoading = false;
    })
  }

  getTableSortable() {
    const that = this;
    setTimeout(() => {
      const fixHelperModified = (e, tr) => {
        const $originals = tr.children();
        const $helper = tr.clone();
        $helper.children().each(function (index) {
          $(this).width($originals.eq(index).width());
        });
        return $helper;
      };
      const updateIndex = (e, ui) => {
        $('td.index', ui.item.parent()).each(function (i) {
          $(this).html(i + 1 + '');
        });
        $('tr.favoriteOrderId', ui.item.parent()).each(function (i) {
          // tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < that.configureDashboardWidgets.length; j++) {
            if ($(this).attr('id') === that.configureDashboardWidgets[j].chart_Id) {
              that.configureDashboardWidgets[j].index = i + 1;
            }
          }
        });
      };

      $('#myFavTable tbody')
        .sortable({
          helper: fixHelperModified,
          stop: updateIndex,
        })
        .disableSelection();

      $('#myFavTable tbody').sortable({
        distance: 5,
        delay: 100,
        opacity: 0.6,
        cursor: 'move'
      });
    }, 1000);
  }

  onSelectAxis(type, isSelect) {
    if (type == 1) {
      if (isSelect) {
        this.y1AxisProps = this.filteredPropList;
      }
      else {
        this.y1AxisProps = [];
      }
      this.historicalWidgetForm.controls.y1AxisProps.setValue(this.y1AxisProps);

    }
    else {
      if (isSelect) {
        this.y2AxisProps = this.filteredPropList;
      }
      else {
        this.y2AxisProps = [];
      }
      this.historicalWidgetForm.controls.y2AxisProps.setValue(this.y2AxisProps);

    }
  }
  // checkValidation() {
  //   this.isFormValid = true;
  //   if (this.chartTitle == '') {
  //     this.isFormValid = false;
  //   }
  //   else if (this.xAxisProps == '') {
  //     this.isFormValid = false;
  //   }
  //   else if (this.y1AxisProps.length == 0) {
  //     this.isFormValid = false;
  //   }
  //   else if (this.y2AxisProps.length == 0) {
  //     this.isFormValid = false;
  //   }
  // }
}
