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
import * as moment from 'moment';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { ColumnChartComponent } from 'src/app/common/charts/column-chart/column-chart.component';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from 'src/app/common/charts/pie-chart/pie-chart.component';
import { DataTableComponent } from 'src/app/common/charts/data-table/data-table.component';
import { ApplicationService } from 'src/app/services/application/application.service';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
declare var $: any;

@Component({
  selector: 'app-asset-model-history-layout',
  templateUrl: './asset-model-history-layout.component.html',
  styleUrls: ['./asset-model-history-layout.component.css'],
})
export class AssetModelHistoryLayoutComponent implements OnInit, OnChanges, OnDestroy {
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
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private assetModelService: AssetModelService,
    private applicationService: ApplicationService
  ) {}
  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    await this.getAssetModelsderivedKPIs();
    await this.getAssetsModelProperties();
    this.isHistoryAPILoading = true;
    this.getLayout();
  }

  getAssetModelsderivedKPIs() {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.assetModelService.getDerivedKPIs(this.contextApp.app, this.assetModel.name).subscribe((response: any) => {
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

  onWidgetTypeChange() {
    if (this.selectedChartType === 'Vibration Damage Plot') {
      this.filteredPropList = this.propertyList.filter(
        (prop) => prop.data_type === 'Object' && prop.data_type !== 'Array'
      );
    } 
    else if(this.selectedChartType !== 'Pie Chart' && this.selectedChartType !== 'Vibration Damage Plot' && this.selectedChartType !== 'Data Table'){
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
          console.log(this.propertyList);
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
    this.selectedChartType = 'Widget Type';
    this.chartTitle = '';
    this.xAxisProps = '';
    this.y1AxisProps = [];
    this.y2AxisProps = [];
  }

  setChartType() {
    return this.chartTypeValues.find((type) => {
      console.log(type.name, '======', this.selectedChartType, '======', type);
      return type.name === this.selectedChartType;
    })?.value;
  }

  async addChart() {
    if (!this.chartTitle || !this.selectedChartType || this.y1AxisProps.length === 0) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add Widget');
      return;
    }
    if (this.selectedChartType === 'Vibration Damage Plot') {
      let flag = false;
      const arr = [];
      this.y1AxisProps.forEach((prop) => {
        console.log(prop);
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
        this.toasterService.showError('Damage Plot will not contain any y2 axis property', 'Add Chart');
        return;
      }
    } else {
      if (this.y1AxisProps.length + this.y2AxisProps.length > 4) {
        this.toasterService.showError('Max 4 properties are allowed in a widget', 'Add Widget');
        return;
      }
      let arr = [];

      this.y1AxisProps.forEach((prop) => {
        console.log(prop);
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
      chart_Id: 'chart_' + moment().utc().unix(),
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
      await this.plotChart(obj);
      this.clear();
      this.layoutJson.push(obj)
    } else {
      this.toasterService.showError('Widget with same title is already exist.', 'Add Widget');
    }
  }

  plotChart(layoutJson) {
    return new Promise<void>((resolve) => {
      $('.overlay').show();
      this.chartCount++;
      const y1Axis = layoutJson.y1axis;
      const y2Axis = layoutJson.y2axis;
      const data = [];
      const currentDate = moment();
      for (let i = 0; i < 10; i++) {
        const obj = {
          message_date: currentDate.subtract(i, 'minute').format('DD-MMM-YYYY hh:mm:ss A'),
        };
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
      componentRef.instance.telemetryData = JSON.parse(JSON.stringify(data));
      componentRef.instance.propertyList = this.propertyList;
      componentRef.instance.y1AxisProps = layoutJson.y1axis;
      componentRef.instance.y2AxisProps = layoutJson.y2axis;
      componentRef.instance.xAxisProps = layoutJson.xAxis;
      componentRef.instance.chartType = layoutJson.chartType;
      componentRef.instance.chartHeight = '23rem';
      componentRef.instance.chartWidth = '100%';
      componentRef.instance.asset = this.asset;
      componentRef.instance.chartConfig = layoutJson;
      // componentRef.instance.chartEnddate = this.toDate;
      componentRef.instance.chartTitle = layoutJson.title;
      componentRef.instance.chartId = layoutJson.chart_Id;
      componentRef.instance.isOverlayVisible = true;
      componentRef.instance.hideCancelButton = !this.assetModel.freezed;
      componentRef.instance.removeWidget = (id) => this.removeWidget(id);
      this.appRef.attachView(componentRef.hostView);
      const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
      document.getElementById('layoutWidgetContainer').prepend(domElem);
      resolve();
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
      widgetsToLoad.map(async (currentChart) => {
        this.renderCount++;
        currentChart['chartCount'] = this.renderCount;
        await this.plotChart(currentChart);
      });
    } else {
      this.toasterService.showError('Layout not defined', 'Layout');
    }
  }

  removeWidget(chartId) {
    for (let i = 0; i < this.layoutJson.length; i++) {
      if (this.layoutJson[i].chart_Id === chartId) {
        this.layoutJson.splice(i, 1);
        $('#' + chartId + '_' + chartId).remove();
      }
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
    if (e === [] || e.length === 0) {
      this.y1AxisProps = [];
    }
  }
  y2Deselect(e) {
    if (e === [] || e.length === 0) {
      this.y2AxisProps = [];
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
