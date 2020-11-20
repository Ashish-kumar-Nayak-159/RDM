import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { Component, Input, OnInit } from '@angular/core';

declare var $: any;
@Component({
  selector: 'app-device-type-alert-conditions',
  templateUrl: './device-type-alert-conditions.component.html',
  styleUrls: ['./device-type-alert-conditions.component.css']
})
export class DeviceTypeAlertConditionsComponent implements OnInit {

  @Input() deviceType: any;
  alertConditions: {message?: string, code?: string, severity?: string, recommendations?: any[], visualizations?: any[]}[] = [
    {
      message: 'Low Oil Level',
      severity: 'critical',
      code: '0X1234',
      recommendations: [],
      visualizations: ['TEST WIDGET 1']
    },
    {
      message: 'Phase Fault',
      severity: 'warning',
      code: '0X1235',
      recommendations: [],
      visualizations: []
    },
    {
      message: 'No Water Flow',
      severity: 'error',
      code: '0X1236',
      recommendations: [],
      visualizations: []
    }
  ];
  alertObj: {message?: string, code?: string, severity?: string, recommendations?: any[], visualizations?: any[]};
  isCreateAlertConditionLoading = false;
  widgets: any[] = [];
  toggleRows = {};
  viewType: string;
  editVisualizationWidget = false;
  constructor(
    private deviceTypeService: DeviceTypeService
  ) { }

  ngOnInit(): void {
  }

  getDeviceTypeWidgets() {
    if (this.widgets.length === 0) {
      const obj = {
        app: this.deviceType.app,
        id: this.deviceType.id
      };
      this.deviceTypeService.getThingsModelLayout(obj).subscribe(
        (response: any) => {
          if (response?.layout?.length > 0) {
            this.widgets = response.layout;
          }
         }
      );
    }
  }

  addVisualizationWidget() {
    this.alertObj.visualizations.splice(this.alertObj.visualizations.length, 0, undefined);
  }

  removeVisualizationWidget(index) {
    this.alertObj.visualizations.splice(index, 1);
  }

  addRecommendationStep() {
    this.alertObj.recommendations.splice(this.alertObj.recommendations.length, 0, {
      step: this.alertObj.recommendations.length + 1,
      description: undefined,
      activity: undefined,
      command: undefined
    });
  }

  onSaveRecommendations() {
    console.log(JSON.stringify(this.alertObj));
  }

  onClickOfViewActionIcon(type, index) {
    this.getDeviceTypeWidgets();
    this.toggleRows = {};
    this.viewType = type;
    this.toggleRows[index] = true;
    this.alertObj = this.alertConditions[index];
    if (type === 'Visualization') {
    this.addVisualizationWidget();
    } else if (type === 'Recommendations') {
      this.addRecommendationStep();
    }
    console.log(this.alertObj);
  }

  openAddAlertConditionModal() {
    this.alertObj = {};
    $('#addAlertConditionModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onSaveVisualizationWidget() {
    console.log(this.alertObj);
  }

  onCreateAlertCondition() {
  }

  onCloseAlertConditionModal() {
    $('#addAlertConditionModal').modal('hide');
    this.alertObj = undefined;
  }

}
