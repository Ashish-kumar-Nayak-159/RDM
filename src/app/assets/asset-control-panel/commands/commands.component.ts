import { CONSTANTS } from './../../../app.constants';
import { CommonService } from './../../../services/common.service';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
declare var $: any;


@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.css']
})
export class CommandsComponent implements OnInit, OnDestroy {

  @Input() pageType;
  @Input() componentState;
  @Input() asset: Asset = new Asset();
  @Input() menuDetail: any;
  @Input() callingPage = 'Asset';
  displayMode: string;
  timerObj: any;
  selectedCommunicationTechnique: string;
  subscriptions: Subscription[] = [];
  selectedWidget: any;
  jsonModelKeys: any[] = [];
  contextApp: any;
  controlWidgets: any[] = [];
  assetMethods: any[] = [];
  allControlWidgets: any[] = [];
  constructor(
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.subscriptions.push(this.assetService.composeC2DMessageStartEmitter.subscribe(data => {
      this.timerObj = {
        hours: data.hours,
        minutes: data.minutes,
        seconds: data.seconds
      };
    }));
    this.displayMode = 'view';
    this.timerObj = undefined;
  }

  onClickOfGeneralCommands() {
    this.displayMode = '';
    setTimeout(() => {
      this.displayMode = 'general_commands';
    }, 500);
    this.timerObj = undefined;
  }

  onClickOfSpecificCommands(type) {
    this.displayMode = '';
    this.selectedWidget = undefined;
    setTimeout(() => {
      this.displayMode = type + '_specific_commands';
    }, 500);
    if (type.includes('control')) {
      this.getControlWidgets();
    } else {
      this.getConfigureWidgets();
    }
    this.timerObj = undefined;
    this.selectedCommunicationTechnique = undefined;
  }

  getControlWidgets() {
    const obj = {
      app: this.contextApp.app,
      asset_model: this.asset.tags?.asset_model
    };
    this.subscriptions.push(this.assetModelService.getThingsModelControlWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.allControlWidgets = response.data;
          if (this.allControlWidgets.length > 0) {
            this.selectedWidget = this.allControlWidgets[0];
            this.onChangeOfDropdownData(this.selectedWidget);
          }
        }
      }
    ));
  }

  // onChangeOfTechnique() {
  //   this.selectedWidget = undefined;
  //   this.controlWidgets = this.allControlWidgets.filter(widget =>
  //     widget.metadata.communication_technique === this.selectedCommunicationTechnique);
  // }

  getConfigureWidgets() {
    const obj = {
      app: this.contextApp.app,
      asset_model: this.asset.tags?.asset_model
    };
    this.subscriptions.push(this.assetModelService.getThingsModelConfigurationWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.allControlWidgets = response.data;
          if (this.allControlWidgets.length > 0) {
            this.selectedWidget = this.allControlWidgets[0];
            this.onChangeOfDropdownData(this.selectedWidget);
          }
        }
      }
    ));
  }

  onChangeOfDropdownData(widget) {
    this.selectedWidget = undefined;
    this.jsonModelKeys = [];
    setTimeout(() => {
      this.selectedWidget = widget;
      const keys =  Object.keys(this.selectedWidget.json);
      const index = keys.findIndex(key => key === 'timestamp');
      keys.splice(index, 1);
      keys.forEach(key => {
        const obj = {
          key,
          json: {},
          name: null,
          value: null
        };
        let flag = false;
        this.selectedWidget.properties.forEach(prop => {
          if (prop.json_key === key) {
            flag = true;
            obj.name = prop.name;
            obj.json = this.selectedWidget.json[key];
            if (obj.json['type'] === 'boolean') {
              obj.value = obj.json['defaultValue'] === obj.json['trueValue'] ? true : false;
            } else {
              obj.value = this.selectedWidget.json[key].defaultValue;
            }
          }
        });
        if (!flag) {
          obj.name = key;
          obj.json = this.selectedWidget.json[key];
          if (obj.json['type'] === 'boolean') {
            obj.value = obj.json['defaultValue'] === obj.json['trueValue'] ? true : false;
          } else {
            obj.value = this.selectedWidget.json[key].defaultValue;
          }
        }
        this.jsonModelKeys.push(obj);
        console.log(this.jsonModelKeys);
      });
    }, 500);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
