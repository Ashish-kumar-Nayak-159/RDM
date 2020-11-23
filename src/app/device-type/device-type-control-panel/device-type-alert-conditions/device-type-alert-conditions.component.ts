import { ToasterService } from './../../../services/toaster.service';
import { filter } from 'rxjs/operators';
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
  alertConditions: {message?: string, code?: string, severity?: string, recommendations?: any[], visualization_widgets?: any[],
    reference_documents?: any[], actions?: any[]}[] = [];
  alertObj: {message?: string, code?: string, severity?: string, recommendations?: any[], visualization_widgets?: any[],
    reference_documents?: any[], actions?: any[]};
  isAlertConditionsLoading = false;
  isCreateAlertConditionLoading = false;
  widgets: any[] = [];
  toggleRows = {};
  viewType: string;
  editVisualizationWidget = false;
  constructor(
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.getAlertConditions();
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

  getAlertConditions() {
    this.isAlertConditionsLoading = true;
    const filterObj = {
      device_type: this.deviceType.id
    };
    this.deviceTypeService.getAlertConditions(this.deviceType.app, filterObj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.alertConditions = response.data;
          this.isAlertConditionsLoading = false;
        }
      }, error => this.isAlertConditionsLoading = false
    );
  }

  addVisualizationWidget() {
    this.alertObj.visualization_widgets.splice(this.alertObj.visualization_widgets.length, 0, undefined);
  }

  removeVisualizationWidget(index) {
    this.alertObj.visualization_widgets.splice(index, 1);
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
    this.isCreateAlertConditionLoading = true;
    this.alertObj.visualization_widgets = [];
    this.alertObj.recommendations = [];
    this.alertObj.reference_documents = [];
    this.alertObj.actions = [];
    this.deviceTypeService.createAlertCondition(this.alertObj, this.deviceType.app, this.deviceType.id).subscribe(
      (response: any) => {
        this.isCreateAlertConditionLoading = false;
        this.onCloseAlertConditionModal();
        this.toasterService.showSuccess(response.message, 'Create Alert Condition');
      }, error => {
        this.isCreateAlertConditionLoading = false;
        this.toasterService.showSuccess(error.message, 'Create Alert Condition');
      }
    )
  }

  onCloseAlertConditionModal() {
    $('#addAlertConditionModal').modal('hide');
    this.alertObj = undefined;
  }

}
