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
  alertConditions: {id?: string, message?: string, code?: string, severity?: string, recommendations?: any[], visualization_widgets?: any[],
    reference_documents?: any[], actions?: any}[] = [];
  alertObj: {id?: string, message?: string, code?: string, severity?: string, recommendations?: any[], visualization_widgets?: any[],
    reference_documents?: any[], actions?: any};
  isAlertConditionsLoading = false;
  isCreateAlertConditionLoading = false;
  widgets: any[] = [];
  toggleRows = {};
  viewType: string;
  editRecommendationStep: any = {};
  editDocuments: any = {};
  deviceMethods: any[] = [];
  documents: any[] = [];
  widgetName: string;
  recommendationObj: any;
  docName: any;
  constructor(
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.getThingsModelDeviceMethod();
    this.getDocuments();
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

  getThingsModelDeviceMethod() {
    this.isAlertConditionsLoading = true;
    // this.deviceMethods = {};
    const obj = {
      app: this.deviceType.app,
      device_type: this.deviceType.name
    };
    this.deviceTypeService.getThingsModelControlWidgets(obj).subscribe(
      (response: any) => {
        this.deviceMethods = response.device_methods;
      }
    );
  }

  getDocuments() {
    this.documents = [];
    const obj = {
      app: this.deviceType.app,
      device_type: this.deviceType.name
    };
    this.deviceTypeService.getThingsModelDocuments(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.documents = response.data;
          this.getAlertConditions();
        }
      }
    );
  }

  getAlertConditions() {
    this.isAlertConditionsLoading = true;
    const filterObj = {
      device_type: this.deviceType.name
    };
    this.deviceTypeService.getAlertConditions(this.deviceType.app, filterObj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.alertConditions = response.data;
          let arr = [];
          this.alertConditions.forEach(alert => {
            arr = [];
            alert.reference_documents.forEach(refDoc => {
              this.documents.forEach(doc => {
                if (doc.id === refDoc) {
                  arr.push(doc.name);
                }
              });
            });
            alert.reference_documents = arr;
          });
          this.isAlertConditionsLoading = false;
        }
      }, error => this.isAlertConditionsLoading = false
    );
  }

  addVisualizationWidget() {
    // this.editVisuailzationWidget[this.alertObj.visualization_widgets.length] = true;
    
    const index = this.alertObj.visualization_widgets.findIndex(widget => widget === this.widgetName);
    if (index > -1) {
      this.toasterService.showError('Same Widget is already added.', 'Add Widget');
      return;
    } else if (!this.widgetName) {
      this.toasterService.showError('Please select widget to add', 'Add Widget');
      return;
    }
    if (this.widgetName && index === -1) {
      this.alertObj.visualization_widgets.splice(this.alertObj.visualization_widgets.length, 0, this.widgetName);
    }
    this.widgetName = undefined;
  }

  removeVisualizationWidget(index) {
    this.alertObj.visualization_widgets.splice(index, 1);
  }

  addRecommendationStep() {
    if (!this.recommendationObj.description || !this.recommendationObj.activity) {
      this.toasterService.showError('Description and Activity is required', 'Add Recommendation Step');
      return;
    }
    this.alertObj.recommendations.splice(this.alertObj.recommendations.length, 0, this.recommendationObj);
    this.recommendationObj = {};
  }

  removeRecommendationStep(index) {
    this.alertObj.recommendations.splice(index, 1);
  }

  addReferenceDocument() {
    const index = this.alertObj.reference_documents.findIndex(doc => doc === this.docName);
    if (index > -1) {
      this.toasterService.showError('Same Document is already added.', 'Add Document');
      return;
    } else if (!this.docName) {
      this.toasterService.showError('Please select document to add', 'Add Document');
      return;
    }
    if (this.docName && index === -1) {
      this.alertObj.reference_documents.splice(this.alertObj.reference_documents.length, 0, this.docName);
    }
    this.docName = undefined;
  }

  editSteps() {
    this.editRecommendationStep = {};
    this.alertObj.recommendations.forEach((step, index) => {
      this.editRecommendationStep[index] = true;
    });
  }

  editReferenceDocuments() {
    this.editDocuments = {};
    this.alertObj.reference_documents.forEach((doc, index) => {
      this.editDocuments[index] = true;
    });
  }

  onSaveRecommendations() {
    console.log(JSON.stringify(this.alertObj));
  }

  removeDocument(index) {
    this.alertObj.reference_documents.splice(index, 1);
  }

  onClickOfViewActionIcon(type, index) {
    this.getDeviceTypeWidgets();
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
    this.viewType = type;
    this.toggleRows[index] = true;
    this.alertObj = this.alertConditions[index];
    // if (type === 'Visualization') {
    //   this.alertObj.visualization_widgets.splice(this.alertObj.visualization_widgets.length, 0, null);
    if (type === 'Recommendations') {
      this.recommendationObj = {};
    }
    console.log(this.alertObj);
  }

  openAddAlertConditionModal() {
    this.alertObj = {};
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
    $('#addAlertConditionModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openConfirmModal(id, alertObj) {
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
    this.alertObj = alertObj;
  }

  onClickOfRemoveCondition() {
    this.deviceTypeService.deleteAlertCondition(this.deviceType.app, this.deviceType.name, this.alertObj.id)
    .subscribe((response: any) => {
      this.onCloseModal('confirmMessageModal');
      this.getAlertConditions();
      this.toasterService.showSuccess(response.message, 'Remove Alert Condition');
    }, error => {
      this.onCloseModal('confirmMessageModal');
      this.toasterService.showSuccess(error.message, 'Remove Alert Condition');
    });
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
    this.alertObj = undefined;
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
  }

  onUpdateAlertConditions() {
    console.log(this.alertObj);
    this.isCreateAlertConditionLoading = true;
    let arr = [];
    arr = this.alertObj.recommendations;
    arr.forEach((step, i) => {
      if (!step.description && !step.activity) {
        this.alertObj.recommendations.splice(i, 1);
      }
    });
    arr = this.alertObj.visualization_widgets;
    arr.forEach((widget, index) => {
      if (!widget) {
        this.alertObj.visualization_widgets.splice(index, 1);
      }
    });
    arr = this.alertObj.reference_documents;
    arr.forEach((widget, index) => {
      if (!widget) {
        this.alertObj.reference_documents.splice(index, 1);
      }
    });
    let distinctArray = this.alertObj.visualization_widgets.filter((n, i) => this.alertObj.visualization_widgets.indexOf(n) === i);
    this.alertObj.visualization_widgets = distinctArray;
    distinctArray = this.alertObj.reference_documents.filter((n, i) => this.alertObj.reference_documents.indexOf(n) === i);
    this.alertObj.reference_documents = distinctArray;
    this.alertConditions.forEach(alert => {
      alert.reference_documents.forEach(refDoc => {
        this.documents.forEach(doc => {
          if (doc.name === refDoc) {
            arr.push(doc.id);
          }
        });
      });
    });
    this.alertObj.reference_documents  = arr;
    this.deviceTypeService.updateAlertCondition(this.alertObj, this.deviceType.app, this.deviceType.name, this.alertObj.id)
    .subscribe((response: any) => {
      this.isCreateAlertConditionLoading = false;
      this.getAlertConditions();
      this.toasterService.showSuccess(response.message, 'Update Alert Condition');
      this.toggleRows = {};
      this.editRecommendationStep = {};
      this.editDocuments = {};
    }, error => {
      this.isCreateAlertConditionLoading = false;
      this.toasterService.showSuccess(error.message, 'Update Alert Condition');
    });
  }

  

  onCreateAlertCondition() {
    this.isCreateAlertConditionLoading = true;
    this.alertObj.visualization_widgets = [];
    this.alertObj.recommendations = [];
    this.alertObj.reference_documents = [];
    this.alertObj.actions = {};
    this.deviceTypeService.createAlertCondition(this.alertObj, this.deviceType.app, this.deviceType.name).subscribe(
      (response: any) => {
        this.isCreateAlertConditionLoading = false;
        this.onCloseAlertConditionModal();
        this.getAlertConditions();
        this.toasterService.showSuccess(response.message, 'Create Alert Condition');
      }, error => {
        this.isCreateAlertConditionLoading = false;
        this.toasterService.showSuccess(error.message, 'Create Alert Condition');
      }
    );
  }

  onCloseAlertConditionModal() {
    $('#addAlertConditionModal').modal('hide');
    this.alertObj = undefined;
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
  }

}
