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
  selector: 'app-config-logical-assest',
  templateUrl: './config-logical-assest.component.html',
  styleUrls: ['./config-logical-assest.component.css']
})
export class ConfigLogicalAssestComponent implements OnInit {
  private _assetDetail: any;
  telemetryPropertyList: any;
  labalName: any = "Add";
  public get assetDetail(): any {
    return this._assetDetail;
  }
  @Input()
  public set assetDetail(value: any) {
    this._assetDetail = value;
    if (this.assets)
      this.assestData();
  }
  private _assets: any;
  drpassets: any[];
  public get assets(): any {
    return this._assets;
  }
  @Input()
  public set assets(value: any) {
    this._assets = value;
    this.assestData();
  }
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
  selectedAssest: any = { display_name: 'Select Assest' }

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
    // await this.getAssetModelsderivedKPIs();
    // await this.getLiveWidgets();
    // this.getModelSlaveDetails();
    // this.getAssetWidget();
  }

  assestData() {
    let assestData = [];
    this.assetDetail?.assets.forEach(element => {
      let assest = this.assets.find(x => x.asset_id == element.asset_id);
      if (assest)
        assestData.push(assest);
    });
    this.drpassets = assestData;
    let filterAsset = this.removeDuplicates(this.drpassets, "asset_id")

    filterAsset.forEach(async (element, index) => {
      if (element.asset_id)
        await this.getTelemetryPropertyList(element.asset_id);
      if ((index + 1) == filterAsset.length) {
        this.getLogicalViewWidget();
      }
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }




  onWidgetTypeChange() {
    if (this.labalName == "Add") {
      this.widgetObj.properties = [{}];
    }
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
      this.propertyObj = {}
      this.isDisabled = false;
      this.trueConditionalNumber = 'ON';
      this.falseConditionalNumber = 'OFF';
      this.formula = '';

      this.propertyObj.metadata = {
        properties: [
          {
            property: null,
            value: null,
            operator: undefined,
            operator1: undefined,
            index: 1,
          },
        ],
      };

    }

  }

  addPropertyToCondtion() {
    let obj = {
      asset_id: null,
      property: null,
      value: null,
      operator: undefined,
      operator1: undefined,
      index: this.propertyObj.metadata.properties.length + 1,

    };
    this.formula = '';
    this.propertyObj.metadata.properties.push(obj);
    return
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
        if (this.propertyObj.metadata.properties[i] && prop.operator === undefined) {
          this.toasterService.showError('Please select operator in condition', 'Add Properity');
          flag = true;
          return;
        }
        if (this.propertyObj.metadata.properties[i + 1] && prop.operator1 === undefined) {
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
    if (this.trueConditionalNumber.length > 5 || this.falseConditionalNumber.length > 5) {
      this.isDisabled = false;

    } else {
      this.isDisabled = true;
    }

  }

  deletePropertyCondtion(propindex: number, propObj) {
    const index = this.propertyObj.metadata.properties.indexOf(propindex);
    this.propertyObj.metadata.properties.splice(propindex + 1, 1);
    propObj.operator1 = undefined;
    this.formula = '';

  }
  clearInputField() {
    this.isDisabled = false;
  }



  async getTelemetryData() {
    try {
      this.telemetryObj = {};
      this.telemetryObj.message_date = datefns.format(new Date(), "dd-MM-yyyy HH:mm:ss").toString();
      this.telemetryPropertyList?.forEach((prop) => {
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



  onCloseAddWidgetModal() {
    $('#addLWidgetsModal').modal('hide');
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
    this.selectedSlave = null;
    this.labalName = "Add";
    $('#addLWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }


  async onSaveWidgetObj() {
    if (!this.widgetObj.widget_title || !this.widgetObj.widget_type) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add ' + this.widgetStringFromMenu);
      return;
    }
    if (this.widgetObj.widget_title.length < 4 || this.widgetObj.widget_title.length > 50) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.WIDGET_TITLE, 'Add ' + this.widgetStringFromMenu);
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
    let foundimg = true;
    let isInValid = this.widgetObj.properties.find(x => !x.property);
    if (isInValid && this.widgetObj.widget_type !== 'LineChart' && this.widgetObj.widget_type !== 'AreaChart' && this.widgetObj.widget_type != "NumberWithImage" && this.widgetObj.widget_type !== 'ConditionalNumber') {
      this.toasterService.showError('Please select properties details.', 'Add Widget');
      return;
    }
    if (this.widgetObj.widget_type == "NumberWithImage") {
      let isInValid = this.widgetObj.properties.find(x => !x?.image);
      if (isInValid && this.widgetObj.widget_type !== 'LineChart' && this.widgetObj.widget_type !== 'AreaChart' && this.widgetObj.widget_type != "NumberWithImage" && this.widgetObj.widget_type !== 'ConditionalNumber') {
        this.toasterService.showError('Please select properties details.', 'Add Widget');
        return;
      }
      ;
    }

    this.widgetObj.properties.forEach((prop) => {
      if (!prop.property || (this.widgetObj.widget_type == "NumberWithImage" && !prop?.image)) {
        found = false;
        if (!prop?.image) {
          foundimg = false;
        }
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
    if (!found && !foundimg && this.widgetObj.widget_type == "NumberWithImage") {
      this.toasterService.showError('Please select image.', 'Add Widget');
      return;
    }
    else if (!found && foundimg && this.widgetObj.widget_type == "NumberWithImage") {
      this.toasterService.showError('Please select property.', 'Add Widget');
      return;
    }

    if (this.widgetObj.widget_type == "NumberWithImage") {
      let isvalid = false;
      this.widgetObj.properties.forEach(element => {
        var extension = element.image.name.substr(element.image.name.lastIndexOf('.'));
        let ext = [".jpeg", ".jpg", ".png", ".gif"];

        if (extension == ".jpeg" || extension == ".jpg" || extension == ".png" || extension == ".gif") {
          isvalid = true;
        }
      });
      if (!isvalid) {
        this.toasterService.showError('Only allow to upload  jpeg, jpg, png & GIF files', 'Upload file');
        return
      }
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
          prop.type = this.getPropertieType(prop.type);

          const obj = {
            name: prop.name,
            type: prop.type,
            json_key: prop.json_key,
            units: prop.unit,
            // slave_id: prop?.metadata?.slave_id,
            asset_id: this.widgetObj.Y1Assest,
            // asset_model: this.widgetObj.Y1Assest?.asset_model,
            color: prop.color,
            composite_key: `${this.widgetObj.Y1Assest}#${prop.type}#${prop.json_key}`,

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
          prop.type = this.getPropertieType(prop.type);
          const obj = {
            name: prop.name,
            type: prop.type,
            json_key: prop.json_key,
            units: prop.unit,
            // slave_id: prop?.metadata?.slave_id,
            asset_id: this.widgetObj.Y2Assest,
            // asset_model: this.widgetObj.Y2Assest?.asset_model,
            color: prop.color,
            composite_key: `${this.widgetObj.Y2Assest}#${prop.type}#${prop.json_key}`,

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
          composite_key: `${prop?.asset_id}#${type}#${prop?.property?.json_key}`,
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
          this.contextApp.app + '/models/' + 'this.assetModel.name' + '/live-widgets'
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
    // this.widgetObj.chart_id = 'chart_' + datefns.getUnixTime(new Date());
    // this.widgetObj['slave_id'] = this.selectedSlave?.slave_id;
    this.widgetObj['logicalviewid'] = this.assetDetail?.id;
    const arr = this.liveWidgets;
    arr.push(this.widgetObj);
    this.addWidget();
    this.trueConditionalNumber = 'ON'
    this.falseConditionalNumber = 'OFF'
    this.selectedSlave = { slave_name: 'Select Slave' }
  }



  addWidget() {
    let properties = this.widgetObj;
    let metadata = {};
    let customProperties = [];
    metadata["dashboardVisibility"] = this.widgetObj.dashboardVisibility;

    if (this.widgetObj.widget_type == "SmallNumber") {
      this.widgetObj.properties.forEach(element => {
        element.type = this.getPropertieType(element.type);
        let obj = {
          "type": element.type,
          "title": element.title,
          "json_key": element.json_key,
          "units": element.propertyList.find(units => units?.json_key == element?.json_key)?.unit,
          "digitsAfterDecimals": element.digitsAfterDecimals,
          "asset_id": element.asset_id,
          "composite_key": `${element.asset_id}#${element.type}#${element.json_key}`,

        }
        customProperties.push(obj);
      });

      properties = null;
      properties = customProperties;

    }
    else if (this.widgetObj.widget_type == "LineChart" || this.widgetObj.widget_type == "AreaChart") {

      properties = {
        y1AxisProps: this.widgetObj.y1AxisProps,
        y2AxisProps: this.widgetObj.y2AxisProps,
      }
      metadata["noOfDataPointsForTrend"] = this.widgetObj.noOfDataPointsForTrend;
      customProperties.push(properties);
      properties = customProperties;
    }
    else if (this.widgetObj.widget_type == "ConditionalNumber") {
      // properties = {};
      // properties = {
      //   slave_id: this.widgetObj.slave_id,
      //   dashboardVisibility: this.widgetObj.dashboardVisibility,
      //   property: this.propertyObj.metadata.properties,
      //   getproperty: this.widgetObj.properties
      // }

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
          "operator1": element.operator1,
          "asset_id": element.asset_id,
          "composite_key": `${element.asset_id}#${element.property.type}#${element.property.json_key}`


        }
        customProperties.push(obj);
      });
      properties = null;
      properties = customProperties;

      metadata["formula"] = this.widgetObj.properties[0].formula;
      metadata["text"] = this.widgetObj.properties[0].text;

    }
    else if (this.widgetObj.widget_type == "OnlyNumber" || this.widgetObj.widget_type === 'NumberWithTrend'
      || this.widgetObj.widget_type === 'StringWidget') {
      // properties = {};
      // properties = {
      //   slave_id: this.widgetObj.slave_id,
      //   dashboardVisibility: this.widgetObj.dashboardVisibility,
      //   properties: this.widgetObj.properties,
      // }
      this.widgetObj.properties.forEach(element => {
        element.type = this.getPropertieType(element.type);
        let obj = {
          "type": element.type,
          "title": element.title,
          "json_key": element.json_key,
          "units": element.unit,
          "digitsAfterDecimals": element.digitsAfterDecimals,
          "asset_id": element.asset_id,
          "composite_key": `${element.asset_id}#${element.type}#${element.json_key}`

        }
        customProperties.push(obj);

      });

      if (this.widgetObj.widget_type === 'NumberWithTrend')
        metadata["noOfDataPointsForTrend"] = this.widgetObj.noOfDataPointsForTrend;

      properties = null;
      properties = customProperties;
    }

    else if (this.widgetObj.widget_type == "NumberWithImage") {

      this.widgetObj.properties.forEach(element => {
        // let getName: any;
        // if (!element?.json_key) {
        //   getName = this.propertyList.find(x => x.json_key == element.property?.json_key);
        // }
        // else {
        //   getName = this.propertyList.find(x => x.json_key == element?.json_key);
        // }

        // element.name = getName?.name;
        // element.data_type = getName?.data_type;
        // element.property = getName;

        element.property.type = this.getPropertieType(element.property.type);
        let obj = {
          "image": element.image,
          "title": element.title,
          "type": element.property.type,
          "json_key": element.property.json_key,
          "units": element.property.unit,
          "asset_id": element.asset_id,
          "composite_key": `${element.asset_id}#${element.property.type}#${element.property.json_key}`

        }
        customProperties.push(obj);
      });

      properties = null;
      properties = customProperties;

    }
    else if (this.widgetObj.widget_type === 'GaugeChart') {

      this.widgetObj.properties.forEach(element => {
        element.type = this.getPropertieType(element.type);
        let obj = {
          "asset_id": element.asset_id,
          "type": element.type,
          "title": element.title,
          "json_key": element.json_key,
          "units": element.unit,
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
          "digitsAfterDecimals": element.digitsAfterDecimals,
          "composite_key": `${element.asset_id}#${element.type}#${element.json_key}`

        }
        customProperties.push(obj);

      });
      metadata["startAngle"] = this.widgetObj.startAngle;
      metadata["endAngle"] = this.widgetObj.endAngle;

      properties = null;
      properties = customProperties;

    }

    else if (this.widgetObj.widget_type == "RectangleWidget" || this.widgetObj.widget_type == "CylinderWidget") {
      this.widgetObj.properties.forEach(element => {
        element.type = this.getPropertieType(element.type);
        element.units = element.unit;
        element.composite_key = `${element.asset_id}#${element.type}#${element.json_key}`;
        delete element['propertyList'];
      });
      properties = this.widgetObj.properties;
    }

    let reqObj = {
      "logicalviewid": this.widgetObj.logicalviewid,
      "widgettype": this.widgetObj.widget_type,
      "chartname": this.widgetObj.widget_title,
      "properties": properties,
      "metadata": metadata,
      "index": 0
    }

    let id = this.widgetObj.id;

    if (id > 0) {
      this.assetModelService.updateLogicalViewWidget(id, reqObj).subscribe(async res => {
        this.toasterService.showSuccess(res["message"], 'Live ' + this.widgetStringFromMenu);
        await this.getLogicalViewWidget();
        await this.onCloseAddWidgetModal();
        await this.onCloseConfigureDashboardModal();
        this.isCreateWidgetAPILoading = false;
      }, async (error) => {
        await this.getLogicalViewWidget();
        await this.onCloseAddWidgetModal();
        await this.onCloseConfigureDashboardModal();
        this.isCreateWidgetAPILoading = false;
      })
    }
    else {

      this.assetModelService.createLogicalViewWidget(reqObj).subscribe(async res => {
        this.toasterService.showSuccess(res["message"], 'Logical View Widget');
        await this.getLogicalViewWidget();
        await this.onCloseAddWidgetModal();
        await this.onCloseConfigureDashboardModal();
        this.isCreateWidgetAPILoading = false;
      },
        async (err) => {
          await this.getLogicalViewWidget();
          // await this.onCloseAddWidgetModal();
          await this.onCloseConfigureDashboardModal();
          this.isCreateWidgetAPILoading = false;
          this.toasterService.showError(err.message, 'Add Live ' + this.widgetStringFromMenu);
        })

    }

  }

  getLogicalViewWidget() {
    this.isGetWidgetsAPILoading = true;
    this.liveWidgets = [];

    this.assetModelService.getLogicalViewWidgets(this.assetDetail.id).subscribe((response): any => {
      if (response.data?.length > 0) {

        response.data.forEach(async (dataElement, index) => {


          if (dataElement?.properties) {

            dataElement.widget_title = dataElement?.chartname;
            dataElement.widget_type = dataElement?.widgettype;
            dataElement.chart_id = dataElement?.id;

            this.liveWidgets.push(dataElement);
            if (dataElement?.widget_type == "SmallNumber") {
              dataElement.y1AxisProps = dataElement?.properties;
            }
            else if (dataElement?.widget_type == "LineChart" || dataElement?.widget_type == "AreaChart") {
              dataElement.y1AxisProps = dataElement.properties.y1AxisProps;
              dataElement.y2AxisProps = dataElement.properties.y2AxisProps;
              dataElement.noOfDataPointsForTrend = dataElement?.metadata?.noOfDataPointsForTrend;
            }

          }
        });

        this.liveWidgets.forEach((widget, index) => {
          this.checkingsmallwidget = widget.widget_type;
          // let pro = [];
          // pro.push(widget?.properties);
          // widget.properties = pro;


          if (widget.widget_type === 'SmallNumber') {
            this.checkwidgettype = true;
            this.actualPropertyList.push(widget.properties);
          }
          widget.freezed = false;
          widget.edge_derived_props = false;
          widget.cloud_derived_props = false;
          widget.measured_props = false;
          widget.derived_kpis = false;
          if (widget.widget_type !== 'LineChart' && widget.widget_type !== 'AreaChart' && widget.widget_type !== 'ConditionalNumber') {
            widget?.properties.forEach((prop) => {
              prop.type = this.getPropertieFullTypeName(prop?.type);

              if (prop) {
                prop.json_key = prop.json_key;
              }
              // prop = this.propertyList.find((propObj) => propObj.json_key === prop.json_key);
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
            this.liveWidgets[index].properties[0].properties = widget.properties;

          }
          else if (widget.widget_type == 'ConditionalNumber') {

            widget?.properties.forEach((prop) => {
              prop.type = this.getPropertieFullTypeName(prop?.type);

              if (prop) {
                prop.json_key = prop.json_key;
              }
              // prop = this.propertyList.find((propObj) => propObj.json_key === prop.json_key);
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

            if (widget.widget_type == 'LineChart' || widget.widget_type == 'AreaChart') {
              widget.y1AxisProps = widget?.properties[0].y1AxisProps
              widget.y2AxisProps = widget?.properties[0].y2AxisProps
            }
            widget?.y1AxisProps.forEach((prop) => {
              prop.type = this.getPropertieFullTypeName(prop?.type);

              if (prop.id) {
                prop.json_key = prop.id;
              }
              prop.property = prop;
              // this.propertyList.find(
              //   (propObj) => propObj.json_key === prop.json_key || propObj.id === prop.id
              // );
              if (prop?.type === 'Derived KPIs') {
                widget.derived_kpis = true;
              } else if (prop?.type === 'Edge Derived Properties') {
                widget.edge_derived_props = true;
              } else if (prop?.property?.type === 'Cloud Derived Properties') {
                widget.cloud_derived_props = true;
              } else {
                widget.measured_props = true;
              }
              this.actualPropertyList.push(prop);

            });
            widget?.y2AxisProps?.forEach((prop) => {
              prop.type = this.getPropertieFullTypeName(prop?.type);

              if (prop.id) {
                prop.json_key = prop.id;
              }
              prop.property = prop;
              // this.propertyList.find(
              //   (propObj) => propObj.json_key === prop.json_key || propObj.id === prop.id
              // );
              if (prop?.type === 'Derived KPIs') {
                widget.derived_kpis = true;
              } else if (prop?.type === 'Edge Derived Properties') {
                widget.edge_derived_props = true;
              } else if (prop?.property?.type === 'Cloud Derived Properties') {
                widget.cloud_derived_props = true;
              } else {
                widget.measured_props = true;
              }

              this.actualPropertyList.push(prop);

            });

            this.liveWidgets[index].y1AxisProps = widget?.properties[0].y1AxisProps;
            this.liveWidgets[index].y2AxisProps = widget?.properties[0].y2AxisProps;

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

  async onMenu(event) {

    if (event.type == "Delete") {
      this.removeWidget(event.widgetId);
    }
    else {
      this.assetModelService.getLogicalViewWidgetById(event.widgetId).subscribe(res => {
        let data = res;
        this.isDataFill = false;

        data.widget_title = data?.chartname;
        data.widget_type = data?.widgettype;
        data.chart_id = data?.id;
        data.dashboardVisibility = data?.metadata.dashboardVisibility;


        // if (data.widget_type != "ConditionalNumber" && data.widget_type != "LineChart" && data.widget_type != "AreaChart") {
        //   let pro = [];
        //   data.properties.forEach(async (element, index) => {
        //     await this.getAssetsModelProperties(element.asset_id, 0, index);
        //     let data = this.propertyList.find(x => x.json_key == element.json_key);
        //     if (data) {
        //       pro.push(data);
        //       element.property = data;
        //     }
        //   });
        // }

        if (data.widget_type == "SmallNumber") {
          setTimeout(() => {

            data.y1AxisProps = data.properties.map(o => ({ ...o }));
            data.properties[0].property = data.y1AxisProps[0];
            // let getName = this.propertyList.find(x => x.json_key == data.properties[0].json_key);
            // data.properties[0].property.name = getName?.name;
            // data.properties[0].property.datatype = getName?.datatype;
            data.dashboardVisibility = data.metadata.dashboardVisibility;
            this.isDataFill = true;

          }, 2000);
        }
        else if (data.widget_type == "LineChart" || data.widget_type == "AreaChart") {
          setTimeout(() => {
            data.y1AxisProps = data.properties[0].y1AxisProps;
            data.y2AxisProps = data.properties[0].y2AxisProps;
            data.noOfDataPointsForTrend = data.metadata.noOfDataPointsForTrend;
            this.isDataFill = true;

          }, 2000);

        }
        else if (data.widget_type == "RectangleWidget" || data.widget_type == "CylinderWidget") {
          this.widgetObj = data;
          this.isDataFill = true;

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

          this.propertyObj.metadata.properties = data.properties.map(o => ({ ...o }));
          this.trueConditionalNumber = data.metadata.text[0];
          this.falseConditionalNumber = data.metadata.text[1];

          let pro = [];
          this.propertyObj.metadata.properties.forEach(async (element, index) => {
            await this.getAssetsModelProperties(element.asset_id, 2, index, true);

            let data = this.filteredPropList.find(x => x.json_key == element.json_key);
            if (data) {
              pro.push(data);
              element.property = data;
            }


          });

          this.ValidateallInputField();
          this.isDataFill = true;


        }
        else if (data.widget_type == "NumberWithTrend") {
          data.noOfDataPointsForTrend = data.metadata.noOfDataPointsForTrend;

        }
        else if (data.widget_type == "NumberWithImage") {

          data.properties = data.properties.map(o => ({ ...o }));

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

          });
          this.isDataFill = true;

        }
        else if (data.widget_type == "GaugeChart") {
          this.widgetObj = data;
          this.onWidgetTypeChange();
          this.widgetObj.startAngle = data.metadata.startAngle;
          this.widgetObj.endAngle = data.metadata.endAngle;
          this.widgetObj.noOfDataPointsForTrend = data.metadata.noOfDataPointsForTrend;
          this.widgetObj.properties.forEach(element => {
            let getMatchingProperty = this.commonService.getMatchingPropertyFromPropertyList(element?.json_key, element?.type, this.propertyList);
            element.name = getMatchingProperty?.name;
            element.data_type = getMatchingProperty?.data_type;
            element.property = getMatchingProperty;
          });
          this.isDataFill = true;

        }

        if (data.widget_type != "ConditionalNumber" && data.widget_type != "GaugeChart" && data.widget_type != "CylinderWidget" && data.widget_type != "RectangleWidget") {
          this.widgetObj = data;
          setTimeout(() => {
            this.onWidgetTypeChange();

          }, 300);
          this.isDataFill = true;

        }

        if (event.type == "Edit") {
          this.widgetObj.id = event.widgetId;
        } else if (event.type == "Clone") {
          this.widgetObj.id = 0;
        }
        this.labalName = event.type;
        $('#addLWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });

      })
    }
  }

  removeWidget(id) {
    if (id == 0) {
    }
    else {
      this.assetModelService.deleteLogicalViewWidget(id).subscribe(res => {
        this.toasterService.showSuccess(res["message"], 'Save Layout');
        this.getLogicalViewWidget();
        this.onCloseConfigureDashboardModal();

      }, error => {
        this.toasterService.showError(error.message, 'Save Layout');
      })
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


  async getAssetsModelProperties(selectedAssest, type, index, isEdit = false) {
    let fPropList = []



    await this.assetModelService.getModelPropertiesByAssetsId(selectedAssest).toPromise().then((response: any) => {
      this.propertyList = []
      this.filteredPropList = []
      // if (response?.data) {
      //   response["measured_properties"] = response.data.filter(x => x.type == "m");
      //   response["edge_derived_properties"] = response.data.filter(x => x.type == "ed");
      //   response["cloud_derived_properties"] = response.data.filter(x => x.type == "cd");
      // }
      response = response[0];
      response.measured_properties = response.measured_properties
        ? response.measured_properties
        : [];
      response.measured_properties?.forEach((prop) => {
        prop.type = 'Measured Properties'
        // this.actualPropertyList.push(prop);
        this.propertyList.push(prop);
        // if (!selectedSlave?.slave_id || prop?.metadata?.slave_id == selectedSlave?.slave_id) {
        //   this.propertyList.push(prop)
        // }
      });
      // this.propertyList = response.measured_properties ??  [];

      response.edge_derived_properties = response.edge_derived_properties
        ? response.edge_derived_properties
        : [];
      response.cloud_derived_properties = response.cloud_derived_properties
        ? response.cloud_derived_properties
        : [];
      response.edge_derived_properties?.forEach((prop) => {
        prop.type = 'Edge Derived Properties';
        let matchCount = 0
        prop.metadata?.properties?.forEach((actualProp) => {
          matchCount++
          // if (!selectedSlave?.slave_id || actualProp?.property?.metadata?.slave_id == selectedSlave?.slave_id) {
          //   matchCount++
          // }
        })
        if (matchCount > 0) {
          this.propertyList.push(prop)

        }
        // this.actualPropertyList.push(prop);
      });
      response?.cloud_derived_properties?.forEach((prop) => {
        prop.type = 'Cloud Derived Properties';
        this.propertyList.push(prop);
        // if (!selectedSlave?.slave_id || prop?.metadata?.slave_id == selectedSlave?.slave_id) {
        //   this.propertyList.push(prop)
        // }

        // this.actualPropertyList.push(prop);
      });

      this.propertyList.forEach((prop) => {
        if (prop.data_type !== 'Object' && prop.data_type !== 'Array') {
          this.filteredPropList.push(prop);
        }
      });

      if (type == 2) {
        this.propertyObj.metadata.properties[index].filteredPropList = this.filteredPropList;
        this.propertyObj.metadata.properties[index].property = null;


      }
    })
  }

  getPropertieType(type) {
    switch (type) {
      case "Measured Properties":
        type = "m";
        break;
      case "Edge Derived Properties":
        type = "ed";
        break;
      case "Controllable Properties":
        type = "m";
        break;
      case "Cloud Derived Properties":
        type = "cd";
        break;
      default:
        type = type;
    }
    return type;
  }

  async getTelemetryPropertyList(id) {
    this.telemetryPropertyList = [];
    let fPropList = [];

    await this.assetModelService.getModelPropertiesByAssetsId(id).
      toPromise().then((response: any) => {
        response = response[0];
        response.measured_properties = response.measured_properties
          ? response.measured_properties
          : [];
        response.measured_properties?.forEach((prop) => {
          prop.type = 'Measured Properties'
          this.telemetryPropertyList.push(prop);
        });

        response.edge_derived_properties = response.edge_derived_properties
          ? response.edge_derived_properties
          : [];
        response.cloud_derived_properties = response.cloud_derived_properties
          ? response.cloud_derived_properties
          : [];
        response.edge_derived_properties?.forEach((prop) => {
          prop.type = 'Edge Derived Properties';
          let matchCount = 0
          prop.metadata?.properties?.forEach((actualProp) => {
            matchCount++
          })
          if (matchCount > 0) {
            this.telemetryPropertyList.push(prop)
          }

        });
        response?.cloud_derived_properties?.forEach((prop) => {
          prop.type = 'Cloud Derived Properties';
          this.telemetryPropertyList.push(prop);
        });

        // this.telemetryPropertyList.forEach((prop) => {
        //   if (prop.data_type !== 'Object' && prop.data_type !== 'Array') {
        //     fPropList.push(prop);
        //   }
        // });

        // this.telemetryPropertyList = fPropList;

      })
  }

  removeDuplicates(myArray, Prop) {
    return myArray.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[Prop]).indexOf(obj[Prop]) === pos;
    });
  }

  getPropertieFullTypeName(type) {
    switch (type) {
      case "m":
        type = "Measured Properties";
        break;
      case "ed":
        type = "Edge Derived Properties";
        break;
      case "m":
        type = "Controllable Properties";
        break;
      case "cd":
        type = "Cloud Derived Properties";
        break;
      default:
        type = type;
    }
    return type;
  }

}



