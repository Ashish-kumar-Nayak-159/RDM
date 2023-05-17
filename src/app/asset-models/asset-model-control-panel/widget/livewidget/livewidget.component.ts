import { ChangeDetectorRef, Component, DoCheck, Input, OnInit } from '@angular/core';
import * as datefns from 'date-fns';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import { SignalRService } from './../../../../services/signalR/signal-r.service';
import { ToasterService } from './../../../../services/toaster.service';

declare var $: any;
@Component({
  selector: 'app-livewidget',
  templateUrl: './livewidget.component.html',
  styleUrls: ['./livewidget.component.css']
})
export class LivewidgetComponent implements OnInit {
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
  trueConditionalNumber: string = 'ON';
  falseConditionalNumber: string = 'OFF';
  isAllWidgestSelectedForDeleteHistorical: boolean;
  deleteBtn: boolean;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean; };
  bodyMessage: string;
  headerMessage: string;
  fileArr: any = [];
  blobToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  isDataFill: boolean = true;
  constructor(
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef

  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    await this.getAssetModelsderivedKPIs();
    await this.getAssetsModelProperties({});
    // await this.getLiveWidgets();
    this.getModelSlaveDetails();
    this.getAssetWidget();

  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
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
    this.widgetObj.properties.forEach(element => {
      element.property = [];
    });

    this.widgetObj.y1AxisProps = [];
    this.widgetObj.y2AxisProps = [];
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
            if ($(this).attr('id') === that.configureDashboardWidgets[j].chart_id) {
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
              this.checkingsmallwidget = widget.widget_type;

              if (widget.widget_type === 'SmallNumber') {
                this.checkwidgettype = true;
              }
              widget.freezed = this.assetModel.freezed;
              widget.edge_derived_props = false;
              widget.cloud_derived_props = false;
              widget.measured_props = false;
              widget.derived_kpis = false;
              if (widget.widget_type !== 'LineChart' && widget.widget_type !== 'AreaChart') {
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
    // this.widgetObj.properties = [{}];
    if (
      this.widgetObj.widget_type === 'NumberWithTrend' ||
      this.widgetObj.widget_type === 'LineChart' ||
      this.widgetObj.widget_type === 'AreaChart'
    ) {
      this.widgetObj.noOfDataPointsForTrend = this.widgetObj.noOfDataPointsForTrend ? this.widgetObj.noOfDataPointsForTrend : 15;
    }
    this.filteredPropList = [];

    this.propertyList.forEach((prop) => {
      if (prop.data_type !== 'Object' && prop.data_type !== 'Array') {
        if (this.widgetObj?.widget_type !== "StringWidget" && prop.data_type === "Number") {
          this.filteredPropList.push(prop);
        }
        else if (this.widgetObj?.widget_type === "StringWidget") {
          this.filteredPropList.push(prop);
        }

      }
    });

    if (this.widgetObj?.widget_type === "ConditionalNumber") {
      this.isDisabled = false;
      this.formula = '';
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
    this.formula = '';

  }

  ValidateallInputField() {

    if (this.widgetObj.widget_type === 'ConditionalNumber') {
      let flag = false;
      this.propertyObj.id = this.commonService.generateUUID();

      for (let i = 0; i < this.propertyObj.metadata.properties.length; i++) {
        const prop = this.propertyObj.metadata.properties[i];
        if (prop.property === null || prop.value === null || prop.operator === null) {
          this.toasterService.showError(
            'Please select property or add value in condition',
            'Add Property'
          );
          flag = true;
          return;
        }
        if (this.propertyObj.metadata.properties[i + 1] && prop.operator1 === null) {
          this.toasterService.showError('Please select operator in condition', 'Add Properity');
          flag = true;
          return;
        }
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
              '%' + (index + 1) + '% ' + (prop.operator ? prop.operator + ' ' : '') + (prop.value ? prop.value : '') + ' ' + (prop.operator1 ? prop.operator1 + ' ' : '');
          }
          // this.formula.push(this.propertyObj.metadata.condition)
          this.propertyObj.condition += prop.property.json_key + (prop.operator ? prop.operator + ' ' : '');
          this.formula = '(' + this.propertyObj.metadata.condition + ')'


        } else if (prop.value !== null && prop.value !== undefined) {
          this.propertyObj.metadata.condition += prop.value + ' ' + (prop.operator ? prop.operator + ' ' : '');
          this.propertyObj.condition += prop.value + (prop.operator ? prop.operator + ' ' : '');
          this.formula = '(' + this.propertyObj.metadata.condition + ')'

        }
      });
    }
    this.isDisabled = true;

  }
  deletePropertyCondtion(propindex: number, propObj) {
    const index = this.propertyObj.metadata.properties.indexOf(propindex);
    this.propertyObj.metadata.properties.splice(index, 1);
    propObj.operator1 = ' ';
    this.formula = '';
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
    let req = [];
    for (let i = 0; i < this.configureDashboardWidgets.length; i++) {
      if (!this.configureDashboardWidgets[i].isDelete) {
        // this.configureDashboardWidgets.splice(i, 1);
        let obj = {
          "action": "ReArrange",
          "id": this.configureDashboardWidgets[i].id,
          "chartId": this.configureDashboardWidgets[i].chart_id,
          "dashboardVisibility": this.configureDashboardWidgets[i].dashboardVisibility,
          "index": this.configureDashboardWidgets[i].index,
          "isDelete": false
        }
        req.push(obj);
      }
    }
    if (req.length > 0) {

      this.assetModelService.bulkDeleteAssetWidget(this.assetModel.name, req).subscribe(async res => {
        this.toasterService.showSuccess(res["message"], 'Save Layout');
        await this.getAssetModelsderivedKPIs();
        await this.getAssetsModelProperties({});
        await this.getAssetWidget();
        await this.onCloseAddWidgetModal();
        await this.onCloseConfigureDashboardModal();
        this.isCreateWidgetAPILoading = false;
      })
    }
    //this.updateAssetModel(this.configureDashboardWidgets, 'Dashboard configured successfully');
  }

  sortListBasedOnIndex() {
    this.configureDashboardWidgets.sort((a, b) => a.index - b.index);
  }

  onCloseAddWidgetModal() {
    $('#addLWidgetsModal').modal('hide');
    this.widgetObj = undefined;
  }

  onCloseConfigureDashboardModal() {
    $('#configureDashboardWidgetsModal').modal('hide');
    this.configureDashboardWidgets = [];
  }

  onOpenAddWidgetModal() {
    ;
    this.widgetObj = {
      properties: [{}],
    };
    this.propertyObj = {
      json_model: {},
      threshold: {},
    };
    this.selectedSlave = null;
    $('#addLWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  // checkForAllWidgetVisibility() {
  //   let count = 0;
  //   this.configureDashboardWidgets.forEach((widget, index) => {
  //     if (widget.dashboardVisibility) {
  //       count++;
  //     }
  //   });
  //   if (count === this.configureDashboardWidgets.length) {
  //     this.isAllWidgestSelectedForDashboard = true;
  //   } else {
  //     this.isAllWidgestSelectedForDashboard = false;
  //   }
  // }

  onOpenConfigureDashboardModal() {
    if (this.liveWidgets.length > 0) {
      this.isAllWidgestSelectedForDashboard = false;
      this.isAllWidgestSelectedForDeleteHistorical = false;
      this.configureDashboardWidgets = this.liveWidgets;
      this.configureDashboardWidgets.forEach((widget, index) => {
        widget.index = index + 1;
        widget.isDelete = false;
      });
      this.checkForAllWidgetVisibility(0);
      this.checkForAllWidgetVisibility(1);
      $('#configureDashboardWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
      this.getTableSortable();
    }
    else {
      this.toasterService.showError("live chart data is not available", 'Configure Dashboard');
    }
  }

  // removeWidget(chartId) {
  //   const arr = JSON.parse(JSON.stringify(this.liveWidgets));
  //   for (let i = 0; i < arr.length; i++) {
  //     if (arr[i].chartId === chartId) {
  //       arr.splice(i, 1);
  //     }
  //   }
  //   this.liveWidgets = JSON.parse(JSON.stringify(arr));
  //   this.updateAssetModel(this.liveWidgets, this.widgetStringFromMenu + ' removed successfully.');
  // }

  async updateAssetModel(arr, message) {
    arr.forEach((widget) => {
      if (widget.widget_type === 'LineChart' || widget.widget_type === 'AreaChart') {
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
    if (!this.widgetObj.widget_title || !this.widgetObj.widget_type) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add ' + this.widgetStringFromMenu);
      return;
    }
    if (!this.widgetObj.noOfDataPointsForTrend === null) {
      this.toasterService.showError('No of Data points should be geater than 0', 'Add ' + this.widgetStringFromMenu);
      return;
    }
    let id = this.widgetObj.id;
    if (id > 0) {
      const index = this.liveWidgets.findIndex((widget) => widget.widget_title.toLowerCase() === this.widgetObj.widget_title.toLowerCase() && id != widget.id);
      if (index !== -1) {
        this.toasterService.showError(
          this.widgetStringFromMenu + ' with same title is already exist.',
          'Edit ' + this.widgetStringFromMenu
        );
        return
      }
    }
    else {
      const index = this.liveWidgets.findIndex((widget) => widget.widget_title.toLowerCase() === this.widgetObj.widget_title.toLowerCase());
      if (index !== -1) {
        this.toasterService.showError(
          this.widgetStringFromMenu + ' with same title is already exist.',
          'Add ' + this.widgetStringFromMenu
        );
        return
      }
    }
    let found = true;
    this.widgetObj.properties.forEach((prop) => {
      if (!prop.property || (this.widgetObj.widget_type == "NumberWithImage" && !prop?.image)) {
        found = false;

      } else if (prop.property && this.widgetObj.widget_type != "NumberWithImage") {
        prop.json_key = prop.property?.json_key;
        prop.type = prop.property?.type;
        prop.unit = prop.property?.unit;
        delete prop.property;
      }
    });
    if (!found && this.widgetObj.widget_type !== 'LineChart' && this.widgetObj.widget_type !== 'AreaChart' && this.widgetObj.widget_type != "NumberWithImage" && this.widgetObj.widget_type !== 'ConditionalNumber') {
      this.toasterService.showError('Please select properties details.', 'Add Widget');
      return;
    }
    if (!found && this.widgetObj.widget_type == "NumberWithImage") {
      this.toasterService.showError('Please select image.', 'Add Widget');
      return;
    }


    if (this.widgetObj.widget_type === 'LineChart' || this.widgetObj.widget_type === 'AreaChart') {
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
            color: prop.color,
            units: prop.unit,

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
            color: prop.color,
            units: prop.unit,

          };
          arr.push(obj);
        });
        this.widgetObj.y2AxisProps = JSON.parse(JSON.stringify(arr));
      }
    } else if (this.widgetObj.widget_type == "ConditionalNumber") {
      // const arr = [];
      let arr = [{
        formula: this.formula,
        json_Data: [],
        text: [this.trueConditionalNumber, this.falseConditionalNumber]

      }]
      this.propertyObj.metadata.properties.forEach((prop) => {
        var type = (prop?.property.type === 'Edge Derived Properties' ? 'ed' : (prop?.property.type === 'Measured Properties' ? 'm' : (prop?.property.type === 'Cloud Derived Properties' ? 'cd' : '')))
        const obj = {
          name: prop.property.name,
          type: type,
          json_key: prop.property.json_key,

        };
        arr[0]['json_Data'].push(obj);
      });
      this.widgetObj.properties = JSON.parse(JSON.stringify(arr));;
    }

    else if (this.widgetObj.widget_type == "NumberWithImage") {
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
    this.widgetObj.chart_id = 'chart_' + datefns.getUnixTime(new Date());
    this.widgetObj['slave_id'] = this.selectedSlave?.slave_id;
    const arr = this.liveWidgets;
    arr.push(this.widgetObj);
    this.addWidget();
    // this.updateAssetModel(arr, this.widgetStringFromMenu + ' added successfully.');
    this.trueConditionalNumber = 'ON'
    this.falseConditionalNumber = 'OFF'
    this.selectedSlave = { slave_name: 'Select Slave' }
  }

  // onClickOfCheckbox() {
  //   if (this.isAllWidgestSelectedForDashboard) {
  //     this.configureDashboardWidgets.forEach((widget) => (widget.dashboardVisibility = true));
  //   } else {
  //     this.configureDashboardWidgets.forEach((widget) => (widget.dashboardVisibility = false));
  //   }
  // }

  addWidget() {
    debugger
    let properties = this.widgetObj;
    let metadata = {}
    if (this.widgetObj.widget_type == "SmallNumber") {
      properties = {};
      properties = this.widgetObj.properties;
      this.widgetObj.properties[0].type = this.getPropertieType(this.widgetObj.properties[0].type);
      metadata["slave_id"] = this.widgetObj.slave_id;

    }
    else if (this.widgetObj.widget_type == "LineChart" || this.widgetObj.widget_type == "AreaChart") {
      let customProperties = [];
      let obj = {
        y1AxisProps: this.widgetObj.y1AxisProps,
        y2AxisProps: this.widgetObj.y2AxisProps,
        slave_id: this.widgetObj.slave_id,
        dashboardVisibility: this.widgetObj.dashboardVisibility,
        noOfDataPointsForTrend: this.widgetObj.noOfDataPointsForTrend,
      }
      customProperties.push(obj);
      properties = customProperties;
    }
    else if (this.widgetObj.widget_type == "ConditionalNumber") {
      let customProperties = [];
      this.propertyObj.metadata.properties.forEach(element => {
        element.property.type = this.getPropertieType(element.property.type);
        let obj = {
          "index": element.index,
          "value": element.value,
          "operator": element.operator,
          "type": element.property.type,
          "title": element.property.name,
          "json_key": element.property.json_key,
          "data_type": element.property.data_type,
          "operator1": element.operator1

        }
        customProperties.push(obj);
      });
      properties = null;
      properties = customProperties;

      metadata["formula"] = this.widgetObj.properties[0].formula;
      metadata["text"] = this.widgetObj.properties[0].text;
      metadata["slave_id"] = this.widgetObj.slave_id;

      // properties = {};
      // properties = {
      //   slave_id: this.widgetObj.slave_id,
      //   dashboardVisibility: this.widgetObj.dashboardVisibility,
      //   property: this.propertyObj.metadata.properties,
      //   getproperty: this.widgetObj.properties
      // }
    }
    else if (this.widgetObj.widget_type == "OnlyNumber" || this.widgetObj.widget_type === 'NumberWithTrend'
      || this.widgetObj.widget_type === 'StringWidget') {

      properties = this.widgetObj.properties;
      metadata["slave_id"] = this.widgetObj.slave_id;

      // properties = {
      //   slave_id: this.widgetObj.slave_id,
      //   dashboardVisibility: this.widgetObj.dashboardVisibility,
      //   properties: this.widgetObj.properties,
      // }
    }
    // else if (this.widgetObj.widget_type == "NumberWithImage") {
    //   this.widgetObj.properties.forEach(element => {
    //     let getName: any;
    //     if (!element?.json_key) {
    //       getName = this.propertyList.find(x => x.json_key == element.property?.json_key);
    //     }
    //     else {
    //       getName = this.propertyList.find(x => x.json_key == element?.json_key);
    //     }

    //     element.name = getName?.name;
    //     element.data_type = getName?.data_type;
    //     element.property = getName;

    //   });

    // }
    else if (this.widgetObj.widget_type == "NumberWithImage") {
      let customProperties = [];
      metadata["slave_id"] = this.widgetObj.slave_id;

      this.widgetObj.properties.forEach(element => {

        element.property.type = this.getPropertieType(element.property.type);
        let obj = {
          "image": element.image,
          "title": element.title,
          "type": element.property.type,
          "json_key": element.property.json_key,
          "asset_id": element.asset_id
        }
        customProperties.push(obj);
      });

      properties = null;
      properties = customProperties;

    }
    else if (this.widgetObj.widget_type == "CylinderWidget" || this.widgetObj.widget_type == "RectangleWidget") {
      let customProperties = [];
      this.widgetObj.properties.forEach(element => {
        element.type = this.getPropertieType(element.type);
        let obj = {
          "type": element.type,
          "title": element.title,
          "json_key": element.json_key,
          "maxCapacityValue": element.maxCapacityValue,
          "minCapacityValue": element.minCapacityValue,
          "digitsAfterDecimals": element.digitsAfterDecimals
        }
        customProperties.push(obj);
      });
      properties = null;
      properties = customProperties;
      metadata["slave_id"] = this.widgetObj.slave_id;

    }
    else if (this.widgetObj.widget_type === 'GaugeChart') {
      let customProperties = [];

      this.widgetObj.properties.forEach(element => {
        element.type = this.getPropertieType(element.type);
        let obj = {
          "asset_id": element.asset_id,
          "type": element.type,
          "title": element.title,
          "json_key": element.json_key,
          "minRangeValue": element.minRangeValue,
          "maxRangeValue": element.maxRangeValue,
          "low_max": element.low_max,
          "low_min": element.low_min,
          "high_max": element.high_max,
          "high_min": element.high_min,
          "low_color": element.low_color,
          "high_color": element.high_color,
          "normal_max": element.normal_max,
          "normal_min": element.normal_min,
          "normal_color": element.normal_color,
          "digitsAfterDecimals": element.digitsAfterDecimals
        }
        customProperties.push(obj);

      });
      metadata["startAngle"] = this.widgetObj.startAngle;
      metadata["endAngle"] = this.widgetObj.endAngle;
      metadata["slave_id"] = this.widgetObj.slave_id;

      properties = null;
      properties = customProperties;

    }


    let reqObj = {
      "type": "LiveWidget",
      "chart_id": this.widgetObj.chart_id,
      "widget_type": this.widgetObj.widget_type,
      "widget_title": this.widgetObj.widget_title,
      "properties": properties,
      "index": 0,
      "derived_kpis": true,
      "measured_props": true,
      "edge_derived_props": true,
      "cloud_derived_props": true,
      "dashboard_visibility": this.widgetObj.dashboardVisibility,
      "metadata": metadata
    }


    let id = this.widgetObj.id;
    if (id > 0) {
      this.assetModelService.updateAssetWidget(this.assetModel.name, id, reqObj).subscribe(async res => {
        this.toasterService.showSuccess(res["message"], 'Live ' + this.widgetStringFromMenu);
        await this.getAssetModelsderivedKPIs();
        await this.getAssetsModelProperties({});
        await this.getAssetWidget();
        await this.onCloseAddWidgetModal();
        await this.onCloseConfigureDashboardModal();
        this.isCreateWidgetAPILoading = false;
      })
    }
    else {

      this.assetModelService.createAssetsWidget(reqObj, this.assetModel.name).subscribe(async res => {
        this.toasterService.showSuccess(res["message"], 'Live ' + this.widgetStringFromMenu);
        await this.getAssetModelsderivedKPIs();
        await this.getAssetsModelProperties({});
        await this.getAssetWidget();
        await this.onCloseAddWidgetModal();
        await this.onCloseConfigureDashboardModal();
        this.isCreateWidgetAPILoading = false;
      },
        (err) => {
          this.isCreateWidgetAPILoading = false;
          this.toasterService.showError(err.message, 'Add Live ' + this.widgetStringFromMenu);
        })

    }

  }

  getAssetWidget() {
    const params = {
      app: this.contextApp.app,
      name: this.assetModel.name,
    };
    this.liveWidgets = [];
    this.isGetWidgetsAPILoading = true;
    this.assetModelService.getAssetWidget(this.assetModel.name, "LiveWidget").subscribe(response => {
      if (response?.data?.length > 0) {
        response.data.forEach((dataElement, index) => {
          if (dataElement?.properties?.length > 0) {

            this.liveWidgets.push(dataElement);
            if (dataElement.widget_type == "SmallNumber") {
              dataElement.y1AxisProps = dataElement.properties;
            }
            else if (dataElement.widget_type == "LineChart" || dataElement.widget_type == "AreaChart") {
              dataElement.y1AxisProps = dataElement.properties[0].y1AxisProps;
              dataElement.y2AxisProps = dataElement.properties[0].y2AxisProps;
              dataElement.noOfDataPointsForTrend = dataElement.properties[0].noOfDataPointsForTrend;
              dataElement.slave_id = dataElement.properties[0].slave_id;
              dataElement.dashboardVisibility = dataElement.properties[0].dashboardVisibility;
            }
            else if (dataElement.widget_type == "RectangleWidget" || dataElement.widget_type == "CylinderWidget") {
              dataElement.properties.forEach(element => {
                let getName = this.propertyList.find(x => x.json_key == element?.json_key);
                element.name = getName?.name;
                element.property = getName;
              });
            }

          }
        });
        this.liveWidgets.forEach((widget, index) => {
          this.checkingsmallwidget = widget.widget_type;

          if (widget.widget_type === 'SmallNumber') {
            this.checkwidgettype = true;
          }
          widget.freezed = this.assetModel.freezed;
          widget.edge_derived_props = false;
          widget.cloud_derived_props = false;
          widget.measured_props = false;
          widget.derived_kpis = false;
          if (widget.widget_type !== 'LineChart' && widget.widget_type !== 'AreaChart' && widget.widget_type !== 'ConditionalNumber') {
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

            this.liveWidgets[index].properties[0].properties = widget.properties;

          }
          else if (widget.widget_type == 'ConditionalNumber') {

            widget?.properties.forEach((prop) => {
              if (prop) {
                prop.json_key = prop.json_key;
              }
              prop = this.propertyList.find((propObj) => propObj.json_key === prop.json_key);
              prop.type = prop?.type;

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
          else {
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
  }

  onMenu(event) {

    if (event.type == "Delete") {
      this.removeWidget(event.widgetId);
    }
    else {
      this.assetModelService.getAssetWidgetById(this.assetModel.name, event.widgetId).subscribe(res => {
        let data = res;
        this.isDataFill = false;


        if (data.widget_type == "SmallNumber") {
          setTimeout(() => {
            this.selectedSlave = this.slaveList.find(x => x.slave_id == data.metadata.slave_id);
            this.onSlaveSelection(this.selectedSlave);
            data.y1AxisProps = data.properties.map(o => ({ ...o }));
            data.properties[0].property = data.y1AxisProps[0];
            let getName = this.actualPropertyList.find(x => x.json_key == data.properties[0].json_key);
            data.properties[0].property.name = getName?.name;
            data.dashboardVisibility = data.dashboard_visibility;
            data.slave_id = data.metadata.slave_id;
            this.isDataFill = true;

          }, 2000);
        }
        else if (data.widget_type == "LineChart" || data.widget_type == "AreaChart") {
          setTimeout(() => {
            this.selectedSlave = this.slaveList.find(x => x.slave_id == data.properties[0].slave_id);
            this.onSlaveSelection(this.selectedSlave);
            data.y1AxisProps = data.properties[0].y1AxisProps;
            data.y2AxisProps = data.properties[0].y2AxisProps;
            data.noOfDataPointsForTrend = data.properties[0].noOfDataPointsForTrend;
            data.dashboardVisibility = data.properties[0].dashboardVisibility;
            data.slave_id = data.properties[0].slave_id;
            this.isDataFill = true;

          }, 2000);

        }
        else if (data.widget_type == "ConditionalNumber") {
          this.widgetObj = data;
          this.propertyObj = {
            json_model: {},
            threshold: {},
            metadata: {
              properties: []
            },
          };
          data.dashboardVisibility = data.dashboard_visibility;
          data.slave_id = data.metadata.slave_id;
          this.propertyObj.metadata.properties = data.properties.map(o => ({ ...o }));

          let pro = [];
          this.propertyObj.metadata.properties.forEach(element => {
            let data = this.actualPropertyList.find(x => x.json_key == element.json_key);
            if (data) {
              pro.push(data);
              element.property = data;
            }
          });

          this.ValidateallInputField();

          setTimeout(() => {
            this.selectedSlave = this.slaveList.find(x => x.slave_id == data.metadata.slave_id);
            this.onSlaveSelection(this.selectedSlave);
            this.isDataFill = true;
          }, 2000);
        }
        else if (data.widget_type == "OnlyNumber" || data.widget_type == "NumberWithTrend" || data.widget_type === "StringWidget") {
          setTimeout(() => {

            this.selectedSlave = this.slaveList.find(x => x.slave_id == data.metadata.slave_id);
            this.onSlaveSelection(this.selectedSlave);
            data.dashboardVisibility = data.dashboardVisibility;
            data.slave_id = data.metadata.slave_id;
            data.properties = data.properties.map(o => ({ ...o }));
            data.properties.forEach(element => {
              let getName = this.actualPropertyList.find(x => x.json_key == element.json_key);
              element.name = getName?.name;
              element.data_type = getName?.data_type;
            });
            this.isDataFill = true;

          }, 2000);

        }
        else if (data.widget_type == "NumberWithImage") {
          setTimeout(() => {
            data.properties = data.properties.map(o => ({ ...o }));

            this.selectedSlave = this.slaveList.find(x => x.slave_id == data.metadata.slave_id);
            this.onSlaveSelection(this.selectedSlave);
            data.dashboardVisibility = data.dashboardVisibility;
            data.slave_id = data.metadata.slave_id;

            data.properties.forEach((element, index) => {
              let url = this.blobStorageURL + element.image.url + this.blobToken;
              const toDataURL = url => fetch(url)
                .then(response => response.blob())
                .then(blob => new Promise((resolve, reject) => {
                  const reader = new FileReader()
                  reader.onloadend = () => resolve(reader.result)
                  reader.onerror = reject
                  reader.readAsDataURL(blob)
                }));

              toDataURL(url)
                .then(dataUrl => {
                  var fileData = this.dataURLtoFile(dataUrl, element.image.name);
                  this.fileArr.push(fileData);
                  element.image = fileData;
                });
              let getName = this.actualPropertyList.find(x => x.json_key == element?.json_key);
              element.name = getName?.name;
              element.data_type = getName?.data_type;
              element.json_key = getName?.json_key;
            });
            this.isDataFill = true;

          }, 2000);

          // data.properties[0].image = {};

          // data.properties.forEach(element => {
          //   let getName = this.propertyList.find(x => x.json_key == element.property?.json_key);
          //   element.name = getName?.name;
          //   element.data_type = getName?.data_type;
          // });
        }

        else if (data.widget_type == "GaugeChart") {
          data.slave_id = data.metadata.slave_id;
          data.startAngle = data.metadata.startAngle;
          data.endAngle = data.metadata.endAngle;
          this.widgetObj = data;

          this.onWidgetTypeChange();

          setTimeout(() => {

            this.selectedSlave = this.slaveList.find(x => x.slave_id == data.metadata.slave_id);
            this.onSlaveSelection(this.selectedSlave);

            this.widgetObj.properties.forEach(element => {
              let getName = this.actualPropertyList.find(x => x.json_key == element?.json_key);
              element.name = getName?.name;
              element.data_type = getName?.data_type;
              element.property = getName;
            });
            this.isDataFill = true;

          }, 2000);

        }

        else if (data.widget_type == "CylinderWidget" || data.widget_type == "RectangleWidget") {
          data.dashboardVisibility = data.dashboard_visibility;
          data.slave_id = data.metadata.slave_id;
          this.widgetObj = data;

          this.onWidgetTypeChange();

          setTimeout(() => {
            this.selectedSlave = this.slaveList.find(x => x.slave_id == data.metadata.slave_id);
            this.onSlaveSelection(this.selectedSlave);
            this.widgetObj.properties.forEach(element => {
              let getName = this.actualPropertyList.find(x => x.json_key == element?.json_key);
              element.name = getName?.name;
              element.data_type = getName?.data_type;
              element.property = getName;
            });
            this.isDataFill = true;

          }, 2000);

        }

        if (data.widget_type != "ConditionalNumber" && data.widget_type != "GaugeChart" && data.widget_type != "CylinderWidget" && data.widget_type != "RectangleWidget") {
          this.widgetObj = data;
          this.onWidgetTypeChange();
        }

        if (event.type == "Edit") {
          this.widgetObj.id = event.widgetId;
        } else if (event.type == "Clone") {
          this.widgetObj.id = 0;
        }

        $('#addLWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
      });
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
          obj.chartId = this.configureDashboardWidgets[i].chart_id;
          deleteReq.push(obj);
        }
        if (this.configureDashboardWidgets[i].dashboard_visibility) {
          // this.configureDashboardWidgets.splice(i, 1);
          let obj = {
            "action": "Index",
            "id": 0,
            "chartId": "string",
            "dashboardVisibility": true,
            "index": 0,
            "isDelete": false
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


  checkForAllWidgetVisibility(type) {

    let count = 0;
    if (type == 0) {
      this.configureDashboardWidgets.forEach((widget, index) => {
        if (widget.dashboard_visibility) {
          count++;
        }
      });
      if (count === this.configureDashboardWidgets.length) {
        this.isAllWidgestSelectedForDashboard = true;
      } else {
        this.isAllWidgestSelectedForDashboard = false;
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

  onClickOfCheckbox(type) {
    if (type == 0) {
      if (this.isAllWidgestSelectedForDashboard) {
        this.configureDashboardWidgets.forEach((widget) => (widget.dashboard_visibility = true));
      } else {
        this.configureDashboardWidgets.forEach((widget) => (widget.dashboard_visibility = false));
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

  openConfirmRemoveWidgetModal() {
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

  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  getPropertieType(type) {
    switch (type) {
      case "Measured Properties":
        type = "m";
        break;
      case "Edge Derived Properties":
        type = "ed";
      case "Controllable Properties":
        type = "m";
        break;
      case "Configurable Properties":
        type = "cd";
        break;
      default:
        type = type;
    }
    return type;
  }


}
