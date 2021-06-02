import { ToasterService } from './../../../services/toaster.service';
import { filter } from 'rxjs/operators';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CONSTANTS } from 'src/app/app.constants';


declare var $: any;
@Component({
  selector: 'app-device-type-alert-conditions',
  templateUrl: './device-type-alert-conditions.component.html',
  styleUrls: ['./device-type-alert-conditions.component.css']
})
export class DeviceTypeAlertConditionsComponent implements OnInit, OnDestroy {

  @Input() deviceType: any;
  alertConditions: {id?: string, message?: string, metadata?: any, code?: string, severity?: string, recommendations?: any[],
    visualization_widgets?: any[], reference_documents?: any[], actions?: any, alert_type?: string}[] = [];
  alertObj: {id?: string, message?: string, metadata?: any, code?: string, severity?: string, alert_type?: string,
    recommendations?: any[], visualization_widgets?: any[], reference_documents?: any[], actions?: any};
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
  subscriptions: Subscription[] = [];
  setupForm: FormGroup;
  constantData = CONSTANTS;
  selectedTab = 'Asset';
  constructor(
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getDocuments();
    this.getDeviceTypeWidgets();
    this.onClickOfTab('Asset');
  }

  onClickOfTab(type) {
    this.selectedTab = type;
    this.getAlertConditions();
  }

  getDeviceTypeWidgets() {
    if (this.widgets.length === 0) {
      const obj = {
        app: this.deviceType.app,
        name: this.deviceType.name
      };
      this.subscriptions.push(this.deviceTypeService.getThingsModelLayout(obj).subscribe(
        (response: any) => {
          if (response?.historical_widgets?.length > 0) {
            this.widgets = response.historical_widgets;
          }
         }
      ));
    }
  }


  getDocuments() {
    return new Promise<void>((resolve) => {
    this.documents = [];
    const obj = {
      app: this.deviceType.app,
      device_type: this.deviceType.name
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelDocuments(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.documents = response.data;
        }
        resolve();
      }));
  });
  }

  getAlertConditions() {
    this.isAlertConditionsLoading = true;
    const filterObj = {
      device_type: this.deviceType.name,
      alert_type: this.selectedTab
    };
    this.subscriptions.push(this.deviceTypeService.getAlertConditions(this.deviceType.app, filterObj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.alertConditions = response.data;
          let arr = [];
          this.alertConditions.forEach(alert => {
            arr = [];
            if (!alert.visualization_widgets) {
              alert.visualization_widgets = [];
            }
            alert.reference_documents.forEach(refDoc => {
              this.documents.forEach(doc => {
                if (doc.id.toString() === refDoc.toString()) {
                  arr.push(doc.name);
                }
              });
            });
            alert.reference_documents = arr;

          });
          this.isAlertConditionsLoading = false;
        }
      }, error => this.isAlertConditionsLoading = false
    ));
  }

  onToggleRows(i) {
    if (this.toggleRows[i]) {
      this.toggleRows = {};
    } else {
      this.onClickOfViewActionIcon('Visualization', i);
    }
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


  onSaveRecommendations() {
  }

  removeDocument(index) {
    this.alertObj.reference_documents.splice(index, 1);
  }

  onClickOfViewActionIcon(type, index) {
    // this.getDeviceTypeWidgets();
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
    if (type === 'Actions') {
      if (!this.alertObj.actions) {
        this.alertObj.actions = {
          email: {enabled: false},
          whatsapp: {enabled: false},
          sms: {enabled: false}
        };
      } else {
        if (!this.alertObj.actions.email) {
          this.alertObj.actions.email = {enabled: false};
        }
        if (!this.alertObj.actions.whatsapp) {
          this.alertObj.actions.whatsapp = {enabled: false};
        }
        if (!this.alertObj.actions.sms) {
          this.alertObj.actions.sms = {enabled: false};
        }
      }
    }
  }

  // tslint:disable-next-line: no-unnecessary-initializer
  openAddAlertConditionModal(alertObj = undefined) {
    if (alertObj) {
      this.alertObj = alertObj;
      if (this.deviceType.tags.protocol === 'ModbusTCPMaster' || this.deviceType.tags.protocol === 'ModbusRTUMaster') {
        this.setupForm = new FormGroup({
          d: new FormControl(alertObj.metadata.d, [Validators.required]),
          sa: new FormControl(alertObj.metadata.sa, [Validators.required, Validators.min(0), Validators.max(99999)]),
          a: new FormControl(true),
          fc: new FormControl(alertObj.metadata.fc, [Validators.required]),
        });
      } else if (this.deviceType.tags.protocol === 'SiemensTCPIP') {
        this.setupForm = new FormGroup({
          d: new FormControl(alertObj.metadata.d, [Validators.required]),
          sa: new FormControl(alertObj.metadata.sa, [Validators.required, Validators.min(0), Validators.max(99999)]),
          a: new FormControl(true),
          mt: new FormControl(alertObj.metadata.mt, [Validators.required]),
        });
      }
      this.onChangeOfSetupType(alertObj.metadata);
      this.onChangeOfSetupSecondaryType(alertObj.metadata);
      if (this.deviceType.tags.protocol === 'ModbusTCPMaster' || this.deviceType.tags.protocol === 'ModbusRTUMaster') {
        this.onChangeOfSetupFunctionCode(alertObj.metadata);
      }
      console.log(this.setupForm);
    } else {
      this.alertObj = {};
      if (this.deviceType.tags.protocol === 'ModbusTCPMaster' || this.deviceType.tags.protocol === 'ModbusRTUMaster') {
        this.setupForm = new FormGroup({
          d: new FormControl(null, [Validators.required]),
          sa: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99999)]),
          a: new FormControl(true),
          fc: new FormControl(null, [Validators.required]),
        });
      } else if (this.deviceType.tags.protocol === 'SiemensTCPIP') {
        this.setupForm = new FormGroup({
          d: new FormControl(null, [Validators.required]),
          sa: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99999)]),
          a: new FormControl(true),
          mt: new FormControl(null, [Validators.required]),
        });
      }

    }
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
    $('#addAlertConditionModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onChangeOfSetupType(obj = undefined) {
    console.log(obj);
    if (this.setupForm.value.d !== 'a') {
      this.setupForm.removeControl('sd');
    } else {
      this.setupForm.addControl('sd', new FormControl(obj?.sd || null, [Validators.required]));
    }
    if (this.setupForm.value.d !== 's') {
      this.setupForm.removeControl('la');
    } else {
      this.setupForm.addControl('la', new FormControl(obj?.la || null, [Validators.required, Validators.min(1), Validators.max(99999)]));
    }
    if (this.setupForm.value.d === 'a' &&
    (this.setupForm.value.sd === 5 || this.setupForm.value.sd === 6)) {
      this.setupForm.removeControl('p');
      this.setupForm.addControl('p', new FormControl(obj?.p || null, [Validators.required, Validators.min(1), Validators.max(5)]));
    } else {
      this.setupForm.removeControl('p');
      this.setupForm.addControl('p', new FormControl(0, [Validators.required]));
    }
    if (this.deviceType.tags.protocol === 'SiemensTCPIP' && this.setupForm.value.d === 'd') {
      this.setupForm.removeControl('bn');
      this.setupForm.addControl('bn', new FormControl(obj?.bn || null, [Validators.required, Validators.min(0), Validators.max(15)]));
    } else {
      this.setupForm.removeControl('bn');
    }
  }

  onChangeOfSetupSecondaryType(obj = undefined) {
    if (this.setupForm.value.d === 'a' &&
    (this.setupForm.value.sd === 5 || this.setupForm.value.sd === 6)) {
      this.setupForm.removeControl('p');
      this.setupForm.addControl('p', new FormControl(obj?.p || null, [Validators.required, Validators.min(1), Validators.max(5)]));
    } else {
      this.setupForm.removeControl('p');
      this.setupForm.addControl('p', new FormControl(0, [Validators.required]));
    }
  }

  onChangeOfSetupFunctionCode(obj = undefined) {
    if (this.setupForm.value.d === 'd' && (this.setupForm.value.fc === 3 || this.setupForm.value.fc === 4)) {
      this.setupForm.removeControl('bn');
      this.setupForm.addControl('bn', new FormControl(obj?.bn || null, [Validators.required, Validators.min(0), Validators.max(15)]));
    } else {
      this.setupForm.removeControl('bn');
      this.setupForm.addControl('bn', new FormControl(-1, [Validators.required]));
    }
  }

  openConfirmModal(id, alertObj) {
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
    this.alertObj = alertObj;
  }

  onClickOfRemoveCondition() {
    this.subscriptions.push(this.deviceTypeService.deleteAlertCondition(this.deviceType.app, this.deviceType.name, this.alertObj.id)
    .subscribe((response: any) => {
      this.onCloseModal('confirmMessageModal');
      this.getAlertConditions();
      this.toasterService.showSuccess(response.message, 'Remove Alert Condition');
    }, error => {
      this.onCloseModal('confirmMessageModal');
      this.toasterService.showError(error.message, 'Remove Alert Condition');
    }));
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
    this.alertObj = undefined;
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
  }

  onUpdateAlertConditions() {
    this.isCreateAlertConditionLoading = true;
    this.alertObj.metadata = this.setupForm?.value;
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
    this.alertObj.reference_documents = [];
    this.documents.forEach(doc => {
    arr.forEach((widget, index) => {
      if (doc.name === widget) {
        this.alertObj.reference_documents.push((doc.id.toString()));
      }
    });
    });
    arr = this.alertObj.reference_documents;
    arr.forEach((doc, index) => {
      if (!doc) {
        this.alertObj.reference_documents.splice(index, 1);
      }
    });
    // let distinctArray = this.alertObj.visualization_widgets.filter((n, i) => this.alertObj.visualization_widgets.indexOf(n) === i);
    // this.alertObj.visualization_widgets = distinctArray;
    // distinctArray = this.alertObj.reference_documents.filter((n, i) => this.alertObj.reference_documents.indexOf(n) === i);
    // this.alertObj.reference_documents = distinctArray;
    // this.alertConditions.forEach(alert => {
    //   alert.reference_documents.forEach(refDoc => {
    //     this.documents.forEach(doc => {
    //       if (doc.name === refDoc) {
    //         arr.push(doc.id);
    //       }
    //     });
    //   });
    // });
   // this.alertObj.reference_documents  = arr;
    this.subscriptions.push(this.deviceTypeService.updateAlertCondition(
      this.alertObj, this.deviceType.app, this.deviceType.name, this.alertObj.id)
      .subscribe((response: any) => {
        this.isCreateAlertConditionLoading = false;
        this.getAlertConditions();
        this.onCloseAlertConditionModal();
        this.toasterService.showSuccess(response.message, 'Update Alert Condition');
        this.toggleRows = {};
        this.editRecommendationStep = {};
        this.editDocuments = {};
      }, error => {
        this.isCreateAlertConditionLoading = false;
        this.toasterService.showError(error.message, 'Update Alert Condition');
      }));
  }



  onCreateAlertCondition() {
    this.alertObj.metadata = this.setupForm?.value;
    if (!this.alertObj.message || (this.alertObj.message.trim()).length === 0 ||  !this.alertObj.code
     || (this.alertObj.code.trim()).length === 0 || !this.alertObj.severity) {
      this.toasterService.showError('Please add all the data', 'Add Alert Condition');
      return;
    }
    let flag = false;
    this.alertConditions.forEach(alert => {
      if (this.alertObj.message === alert.message) {
        flag = true;
      }
    });
    if (flag) {
      this.toasterService.showError('Alert Condition with same name is already exists', 'Add Alert Condition');
      return;
    }
    this.isCreateAlertConditionLoading = true;
    this.alertObj.visualization_widgets = [];
    this.alertObj.recommendations = [];
    this.alertObj.reference_documents = [];
    this.alertObj.actions = {
      email: {enabled: false},
      whatsapp: {enabled: false},
      sms: {enabled: false}
    };
    this.subscriptions.push(
      this.deviceTypeService.createAlertCondition(this.alertObj, this.deviceType.app, this.deviceType.name).subscribe(
      (response: any) => {
        this.isCreateAlertConditionLoading = false;
        this.onCloseAlertConditionModal();
        this.getAlertConditions();
        this.toasterService.showSuccess(response.message, 'Add Alert Condition');
      }, error => {
        this.isCreateAlertConditionLoading = false;
        this.toasterService.showError(error.message, 'Add Alert Condition');
      }
    ));
  }

  onCloseAlertConditionModal() {
    $('#addAlertConditionModal').modal('hide');
    this.alertObj = undefined;
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
