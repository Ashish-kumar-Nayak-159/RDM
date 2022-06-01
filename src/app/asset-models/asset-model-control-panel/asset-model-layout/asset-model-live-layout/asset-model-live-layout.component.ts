import { Component, Input, OnInit } from '@angular/core';
import { debug } from 'console';
import * as datefns from 'date-fns';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { SignalRService } from './../../../../services/signalR/signal-r.service';
import { ToasterService } from './../../../../services/toaster.service';

declare var $: any;
@Component({
  selector: 'app-asset-model-live-layout',
  templateUrl: './asset-model-live-layout.component.html',
  styleUrls: ['./asset-model-live-layout.component.css'],
})
export class AssetModelLiveLayoutComponent implements OnInit {
  @Input() assetModel: any;
  widgetObj: any;
  isCreateWidgetAPILoading = false;
  userData: any;
  contextApp: any;
  subscriptions: Subscription[] = [];
  propertyList: any[] = [];
  actualPropertyList: any[] = [];
  liveWidgets: any[] = [];
  isGetWidgetsAPILoading = false;
  signalRTelemetrySubscription: Subscription;
  telemetryObj: any;
  isTelemetryDataLoading: boolean;
  configureDashboardWidgets: any[] = [];
  isAllWidgestSelectedForDashboard = false;
  decodedToken: any;
  derivedKPIs: any[] = [];
  filteredPropList: any[] = [];
  slaveList: any[] = [{
    slave_name: 'Select Slave'
  }]
  selectedSlave: any = { slave_name: 'Select Slave' }
  widgetStringFromMenu: any;
  checkwidgettype: boolean = false;
  checkingsmallwidget: '';
  operatorList = [
    { id: 'GREATEROREQUAL', value: '>=' },
    { id: 'LESSOREQUAL', value: '<=' },
    { id: 'LESS', value: '<' },
    { id: 'GREATER', value: '>' },
    { id: 'EQUAL', value: '==' },
  ];
  data_type: any;
  isDisabled = false;
  propertyObj: any;
  formula: String;
  properties: any = {};

  constructor(
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    private assetService: AssetService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    await this.getAssetModelsderivedKPIs();
    await this.getAssetsModelProperties({});
    await this.getLiveWidgets();
    this.getModelSlaveDetails();
  }

  getModelSlaveDetails() {
    this.assetModelService.getModelSlaveDetails(this.contextApp.app, this.assetModel.name, {}).subscribe((res: any) => {
      this.slaveList = res?.data ?? [{
        slave_name: 'Select Slave'
      }]
      this.slaveList.unshift({ 'slave_name': 'Select Slave' })
    })
  }

  async onSlaveSelection(selectedSlave) {
    await this.getAssetsModelProperties(selectedSlave);
  }

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

  async getAssetsModelProperties(selectedSlave) {
    this.filteredPropList = []
    this.propertyList = []
    this.actualPropertyList = []
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
          response.properties?.measured_properties?.forEach((prop) => {
            prop.type = 'Measured Properties'
            this.actualPropertyList.push(prop);
            if (!selectedSlave?.slave_id || prop?.metadata?.slave_id == selectedSlave?.slave_id) {
              this.propertyList.push(prop)
            }
          });
          // this.propertyList = response.properties.measured_properties ??  [];
          response.properties.edge_derived_properties = response.properties.edge_derived_properties
            ? response.properties.edge_derived_properties
            : [];
          response.properties.cloud_derived_properties = response.properties.cloud_derived_properties
            ? response.properties.cloud_derived_properties
            : [];
          response.properties.edge_derived_properties?.forEach((prop) => {
            prop.type = 'Edge Derived Properties';
            let matchCount = 0
            prop.metadata?.properties?.forEach((actualProp) => {

              if (!selectedSlave?.slave_id || actualProp?.property?.metadata?.slave_id == selectedSlave?.slave_id) {
                matchCount++
              }
            })
            if (matchCount > 0) {
              this.propertyList.push(prop)

            }
            this.actualPropertyList.push(prop);
          });
          response.properties?.cloud_derived_properties?.forEach((prop) => {
            prop.type = 'Cloud Derived Properties';
            if (!selectedSlave?.slave_id || prop?.metadata?.slave_id == selectedSlave?.slave_id) {
              this.propertyList.push(prop)
            }

            this.actualPropertyList.push(prop);
          });
          this.derivedKPIs?.forEach((kpi) => {
            const obj: any = {};
            obj.type = 'Derived KPIs';
            obj.name = kpi.name;
            obj.json_key = kpi.kpi_json_key;
            obj.json_model = {};
            obj.json_model[obj.json_key] = {};
            if (!selectedSlave?.slave_id || kpi?.metadata?.slave_id == selectedSlave?.slave_id) {
              this.propertyList.push(obj);
            }

            this.actualPropertyList.push(obj);
          });
          this.propertyList.forEach((prop) => {
            if (prop.data_type !== 'Object' && prop.data_type !== 'Array') {
              this.filteredPropList.push(prop);
            }
          });

          resolve();
        })
      );
    });
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
            if ($(this).attr('id') === that.configureDashboardWidgets[j].chartId) {
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

  getPropertyType(id) {
    this.data_type = this.propertyList.find((prop) => prop.json_key === id)?.data_type;
    return this.propertyList.find((prop) => prop.json_key === id)?.data_type;
  }

  async getLiveWidgets() {
    const params = {
      app: this.contextApp.app,
      name: this.assetModel.name,
    };
    this.liveWidgets = [];
    this.isGetWidgetsAPILoading = true;
    this.subscriptions.push(
      this.assetModelService.getAssetsModelLiveWidgets(params).subscribe(
        (response: any) => {
          if (response?.live_widgets?.length > 0) {
            // alert('hereeee');
            this.liveWidgets = response.live_widgets;
            // let count = 1;
            this.liveWidgets.forEach((widget) => {
              this.checkingsmallwidget = widget.widgetType;

              if (widget.widgetType === 'SmallNumber') {
                this.checkwidgettype = true;
              }
              widget.freezed = this.assetModel.freezed;
              widget.edge_derived_props = false;
              widget.cloud_derived_props = false;
              widget.measured_props = false;
              widget.derived_kpis = false;
              if (widget.widgetType !== 'LineChart' && widget.widgetType !== 'AreaChart') {
                widget?.properties.forEach((prop) => {
                  if (prop.property) {
                    prop.json_key = prop.property.json_key;
                  }
                  prop.property = this.propertyList.find((propObj) => propObj.json_key === prop.json_key);
                  prop.type = prop.property?.type;

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
            });
            this.getTelemetryData();
            setInterval(() => this.getTelemetryData(), 10000);
          }
          this.isGetWidgetsAPILoading = false;
        },
        () => (this.isGetWidgetsAPILoading = false)
      )
    );
  }

  onWidgetTypeChange() {
    this.widgetObj.properties = [{}];
    if (
      this.widgetObj.widgetType === 'NumberWithTrend' ||
      this.widgetObj.widgetType === 'LineChart' ||
      this.widgetObj.widgetType === 'AreaChart'
    ) {
      this.widgetObj.noOfDataPointsForTrend = 15;
    }
    this.filteredPropList = [];
    this.propertyList.forEach((prop) => {
      if (prop.data_type !== 'Object' && prop.data_type !== 'Array') {
        if (this.widgetObj?.widgetType !== "StringWidget" && prop.data_type === "Number") {
          this.filteredPropList.push(prop);
        }
        else if (this.widgetObj?.widgetType === "StringWidget") {
          this.filteredPropList.push(prop);
        }

      }
    });
    if (this.widgetObj?.widgetType === "ConditionalNumber") {
      this.formula ='';
      this.propertyObj.metadata = {
        properties: [
          {
            property: null,
            value: null,
            operator: null,
            operator1: null,
            index: 1,
          },
        ],
      };

    }

  }

  addPropertyToCondtion() {
    this.propertyObj.metadata.properties.push({
      property: null,
      value: null,
      operator: null,
      operator1: null,
      index: this.propertyObj.metadata.properties.length + 1,

    });
  }

  ValidateallInputField() {

    if (this.widgetObj.widgetType === 'ConditionalNumber') {
      let flag = false;
      this.propertyObj.id = this.commonService.generateUUID();

      for (let i = 0; i < this.propertyObj.metadata.properties.length; i++) {
        const prop = this.propertyObj.metadata.properties[i];
        if (!prop.property && (prop.value === null || prop.value === undefined)) {
          this.toasterService.showError(
            'Please select property or add value in condition',
            'Add Property'
          );
          flag = true;
          break;
        }
        if (this.propertyObj.metadata.properties[i + 1] && !prop.operator) {
          this.toasterService.showError('Please select operator in condition', 'Add Edge Derived Properity');
          flag = true;
          break;
        }
      }
      if (flag) {
        return;
      }
      this.propertyObj.metadata.condition = '';
      this.propertyObj.metadata.props = [];
      this.propertyObj.condition = '';
      this.propertyObj.metadata.properties.forEach((prop) => {
        if (prop.property) {
          const index = this.propertyObj.metadata.props.findIndex((prop1) => prop1 === prop.property.json_key);
          if (index === -1) {
            this.propertyObj.metadata.props.push(prop.property.json_key);
            this.propertyObj.metadata.condition +=
              '%' + (this.propertyObj.metadata.props.length + '% ' + (prop.operator ? prop.operator + ' ' : '') + (prop.value ? prop.value : '') + ' ' + (prop.operator1 ? prop.operator1 + ' ' : ''));
          } else {

            this.propertyObj.metadata.condition +=
              '%' + (index + 1) + '% ' + (prop.operator ? prop.operator + ' ' : '');
          }
          // this.formula.push(this.propertyObj.metadata.condition)
          this.propertyObj.condition += prop.property.json_key + (prop.operator ? prop.operator + ' ' : '');
          this.formula = '(' + this.propertyObj.metadata.condition + ')'
          console.log("Checkingformula1", JSON.stringify(this.formula))


        } else if (prop.value !== null && prop.value !== undefined) {
          this.propertyObj.metadata.condition += prop.value + ' ' + (prop.operator ? prop.operator + ' ' : '');
          this.propertyObj.condition += prop.value + (prop.operator ? prop.operator + ' ' : '');
          this.formula = '(' + this.propertyObj.metadata.condition + ')'
          console.log("Checkingformula2", JSON.stringify(this.formula))

        }
      });
    }

  }
  deletePropertyCondtion(propindex: number) {
    this.propertyObj.metadata.properties.splice(propindex, 1);
  }
  clearInputField() {
    this.isDisabled = false;
  }

 

  async getTelemetryData() {
    try {
      this.telemetryObj = {};
      this.telemetryObj.message_date = datefns.format(new Date(), "dd-MM-yyyy HH:mm:ss").toString();
      this.actualPropertyList?.forEach((prop) => {
        if (prop.json_key) {
          this.telemetryObj[prop.json_key] = {
            value: this.commonService.randomIntFromInterval(
              prop.json_model?.[prop.json_key]?.minValue ? prop.json_model[prop.json_key]?.minValue : 0,
              prop.json_model?.[prop.json_key]?.maxValue ? prop.json_model[prop.json_key]?.maxValue : 100
            ),
            date: this.telemetryObj.message_date,
          };
        }
      });
    } catch (error) {
      throw error;
    }
  }

  onSaveConfigureDashboardWidgets() {
    this.isCreateWidgetAPILoading = true;
    this.sortListBasedOnIndex();
    this.updateAssetModel(this.configureDashboardWidgets, 'Dashboard configured successfully');
  }

  sortListBasedOnIndex() {
    this.configureDashboardWidgets.sort((a, b) => a.index - b.index);
  }

  onCloseAddWidgetModal() {
    $('#addWidgetsModal').modal('hide');
    this.widgetObj = undefined;
  }

  onCloseConfigureDashboardModal() {
    $('#configureDashboardWidgetsModal').modal('hide');
    this.configureDashboardWidgets = [];
  }

  onOpenAddWidgetModal() {
    this.widgetObj = {
      properties: [{}],
    };
    this.propertyObj = {
      json_model: {},
      threshold: {},
    };
    $('#addWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  checkForAllWidgetVisibility() {
    let count = 0;
    this.configureDashboardWidgets.forEach((widget, index) => {
      if (widget.dashboardVisibility) {
        count++;
      }
    });
    if (count === this.configureDashboardWidgets.length) {
      this.isAllWidgestSelectedForDashboard = true;
    } else {
      this.isAllWidgestSelectedForDashboard = false;
    }
  }

  onOpenConfigureDashboardModal() {
    this.configureDashboardWidgets = JSON.parse(JSON.stringify(this.liveWidgets));
    this.configureDashboardWidgets.forEach((widget, index) => {
      widget.index = index + 1;
    });
    this.checkForAllWidgetVisibility();
    $('#configureDashboardWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.getTableSortable();
  }

  removeWidget(chartId) {
    const arr = JSON.parse(JSON.stringify(this.liveWidgets));
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].chartId === chartId) {
        arr.splice(i, 1);
      }
    }
    this.liveWidgets = JSON.parse(JSON.stringify(arr));
    this.updateAssetModel(this.liveWidgets, this.widgetStringFromMenu + ' removed successfully.');
  }

  async updateAssetModel(arr, message) {
    arr.forEach((widget) => {
      if (widget.widgetType === 'LineChart' || widget.widgetType === 'AreaChart') {
        widget.y1AxisProps.forEach((prop) => {
          delete prop.property;
        });
        widget.y2AxisProps.forEach((prop) => {
          delete prop.property;
        });
      } else {
        widget.properties.forEach((prop) => {
          //delete prop.property;
        });
      }
    });
    this.assetModel.live_widgets = arr;
    this.assetModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService.updateAssetsModel(this.assetModel, this.contextApp.app).subscribe(
        async (response: any) => {
          this.toasterService.showSuccess(message, 'Live ' + this.widgetStringFromMenu);
          await this.getAssetModelsderivedKPIs();
          await this.getAssetsModelProperties({});
          await this.getLiveWidgets();
          await this.onCloseAddWidgetModal();
          await this.onCloseConfigureDashboardModal();
          this.isCreateWidgetAPILoading = false;
        },
        (err) => {
          this.isCreateWidgetAPILoading = false;
          this.toasterService.showError(err.message, 'Add Live ' + this.widgetStringFromMenu);
        }
      )
    );
  }

  async onSaveWidgetObj() {
    debugger
    if (!this.widgetObj.widgetTitle || !this.widgetObj.widgetType) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add ' + this.widgetStringFromMenu);
      return;
    }
    if (!this.widgetObj.noOfDataPointsForTrend === null) {
      this.toasterService.showError('No of Data points should be geater than 0', 'Add ' + this.widgetStringFromMenu);
      return;
    }

    let found = true;
    this.widgetObj.properties.forEach((prop) => {
      if (!prop.property || (this.widgetObj.widgetType == "NumberWithImage" && !prop?.image)) {
        found = false;

      } else if (prop.property && this.widgetObj.widgetType != "NumberWithImage") {
        prop.json_key = prop.property?.json_key;
        prop.type = prop.property?.type;
        delete prop.property;
      }
    });
    if (!found && this.widgetObj.widgetType !== 'LineChart' && this.widgetObj.widgetType !== 'AreaChart' && this.widgetObj.widgetType != "NumberWithImage" &&  this.widgetObj.widgetType !== 'ConditionalNumber') {
      this.toasterService.showError('Please select properties details.', 'Add Widget');
      return;
    }
    if (!found && this.widgetObj.widgetType == "NumberWithImage") {
      this.toasterService.showError('Please select image.', 'Add Widget');
      return;
    }


    if (this.widgetObj.widgetType === 'LineChart' || this.widgetObj.widgetType === 'AreaChart') {
      if (!this.widgetObj.y1AxisProps || this.widgetObj.y1AxisProps.length === 0) {
        this.toasterService.showError(
          'Please select at least one property in y1 axis property.',
          'Add ' + this.widgetStringFromMenu
        );
        return;
      } else {
        const arr = [];

        this.widgetObj.y1AxisProps.forEach((prop) => {
          const obj = {
            name: prop.name,
            type: prop.type,
            json_key: prop.json_key,
          };
          arr.push(obj);
        });
        this.widgetObj.y1AxisProps = JSON.parse(JSON.stringify(arr));
      }
      if (!this.widgetObj.y2AxisProps) {
        this.widgetObj.y2AxisProps = [];
      } else {
        const arr = [];
        this.widgetObj.y2AxisProps.forEach((prop) => {
          const obj = {
            name: prop.name,
            type: prop.type,
            json_key: prop.json_key,
          };
          arr.push(obj);
        });
        this.widgetObj.y2AxisProps = JSON.parse(JSON.stringify(arr));
      }
    } else if (this.widgetObj.widgetType == "ConditionalNumber") {
      // const arr = [];
      let arr = [{
        formula: this.formula,
        json_Data: []
      }]
      this.propertyObj.metadata.properties.forEach((prop) => {
        var type = (prop?.property.type === 'Edge Derived Properties' ? 'ed':(prop?.property.type === 'Measured Properties' ? 'm':(prop?.property.type === 'Cloud Derived Properties' ? 'cd' : '')))
        const obj = {
          name: prop.property.name,
          type:type,
          json_key: prop.property.json_key
        };
        arr[0]['json_Data'].push(obj);
      });
      this.widgetObj.properties = JSON.parse(JSON.stringify(arr));;
      console.log("ConditonalPayload", JSON.stringify(arr))
    }

    else if (this.widgetObj.widgetType == "NumberWithImage") {
      let imgUploadError = false;
      await Promise.all(this.widgetObj.properties.map(async (element, index) => {
        const data = await this.commonService.uploadImageToBlob(
          element.image,
          this.contextApp.app + '/models/' + this.assetModel.name + '/live-widgets'
        );
        if (data) {
          this.widgetObj.properties[index].image = { ...data };
        }
        else {
          imgUploadError = true;
        }
      }));
      if (imgUploadError) this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    // this.isCreateWidgetAPILoading = true;
    this.widgetObj.chartId = 'chart_' + datefns.getUnixTime(new Date());
    this.widgetObj['slave_id'] = this.selectedSlave?.slave_id;
    const arr = this.liveWidgets;
    arr.push(this.widgetObj);

    this.updateAssetModel(arr, this.widgetStringFromMenu + ' added successfully.');
  }

  onClickOfCheckbox() {
    if (this.isAllWidgestSelectedForDashboard) {
      this.configureDashboardWidgets.forEach((widget) => (widget.dashboardVisibility = true));
    } else {
      this.configureDashboardWidgets.forEach((widget) => (widget.dashboardVisibility = false));
    }
  }
}
