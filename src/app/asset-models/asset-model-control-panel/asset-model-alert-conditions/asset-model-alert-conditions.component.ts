import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from './../../../services/toaster.service';
import { filter } from 'rxjs/operators';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CONSTANTS } from 'src/app/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';


declare var $: any;
@Component({
  selector: 'app-asset-model-alert-conditions',
  templateUrl: './asset-model-alert-conditions.component.html',
  styleUrls: ['./asset-model-alert-conditions.component.css']
})
export class AssetModelAlertConditionsComponent implements OnInit, OnDestroy {

  @Input() assetModel: any;
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
  assetMethods: any[] = [];
  documents: any[] = [];
  widgetName: string;
  recommendationObj: any;
  docName: any;
  groupName: any;
  subscriptions: Subscription[] = [];
  setupForm: FormGroup;
  constantData = CONSTANTS;
  selectedTab = 'Asset';
  slaveData: any[] = [];
  contextApp: any;
  decodedToken: any;
  userGroups: any[] = [];
  constructor(
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService
  ) { }

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    await this.getDocuments();
    this.getAssetModelWidgets();
    this.onClickOfTab('Asset');
    this.getSlaveData();
    this.getApplicationUserGroups();
  }

  onClickOfTab(type) {
    this.selectedTab = type;
    this.toggleRows = {};

    this.getAlertConditions();
  }

  getApplicationUserGroups() {
    this.subscriptions.push(this.applicationService.getApplicationUserGroups(this.contextApp.app).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.userGroups = response.data;
        }
      }
    ));
  }

  getAssetModelWidgets() {
    if (this.widgets.length === 0) {
      const obj = {
        app: this.assetModel.app,
        name: this.assetModel.name
      };
      this.subscriptions.push(this.assetModelService.getAssetsModelLayout(obj).subscribe(
        (response: any) => {
          if (response?.historical_widgets?.length > 0) {
            this.widgets = response.historical_widgets;
          }
         }
      ));
    }
  }

  getSlaveData() {
    this.slaveData = [];
    const filterObj = {};
    this.subscriptions.push(this.assetModelService.getModelSlaveDetails(this.contextApp.app, this.assetModel.name, filterObj)
    .subscribe((response: any) => {
      if (response?.data) {
        this.slaveData = response.data;
      }
    })
    );
  }


  getDocuments() {
    return new Promise<void>((resolve) => {
    this.documents = [];
    const obj = {
      app: this.assetModel.app,
      asset_model: this.assetModel.name
    };
    this.subscriptions.push(this.assetModelService.getAssetsModelDocuments(obj).subscribe(
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
      asset_model: this.assetModel.name,
      alert_type: this.selectedTab
    };
    this.subscriptions.push(this.assetModelService.getAlertConditions(this.assetModel.app, filterObj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.alertConditions = response.data;
          console.log(this.alertConditions);
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
    if (this.toggleRows[this.selectedTab + '_' + i]) {
      this.toggleRows = {};
      this.alertObj = undefined;
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

  addUserGroup(key) {
    console.log(this.alertObj);
    const index = this.alertObj.actions[key].recipients.findIndex(group => group === this.groupName);
    if (index > -1) {
      this.toasterService.showError('Same UserGroup is already added.', 'Add UserGroup');
      return;
    } else if (!this.groupName) {
      this.toasterService.showError('Please select userGroup to add', 'Add UserGroup');
      return;
    }
    if (this.groupName && index === -1) {
      this.alertObj.actions[key].recipients.splice(this.alertObj.actions[key].recipients.length, 0, this.groupName);
    }
    this.groupName = undefined;
  }

  removeUserGroup(index, key) {
    this.alertObj.actions[key].recipients.splice(index, 1);
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
    // this.getAssetModelWidgets();
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
    this.viewType = type;
    this.toggleRows[this.selectedTab + '_' + index] = true;
    this.alertObj = this.alertConditions[index];
    // if (type === 'Visualization') {
    //   this.alertObj.visualization_widgets.splice(this.alertObj.visualization_widgets.length, 0, null);
    if (type === 'Recommendations') {
      this.recommendationObj = {};
    }
    if (type === 'Actions') {
      if (!this.alertObj.actions) {
        this.alertObj.actions = {
          email: {enabled: false, client_field_support_enabled: false, recipients: [] },
          whatsapp: {enabled: false, client_field_support_enabled: false, recipients: []},
          sms: {enabled: false, client_field_support_enabled: false, recipients: []}
        };
      } else {
        if (!this.alertObj.actions.email) {
          this.alertObj.actions.email = {enabled: false, client_field_support_enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.email.recipients) {
          this.alertObj.actions.email.recipients = [];
        }
        if (!this.alertObj.actions.whatsapp) {
          this.alertObj.actions.whatsapp = {enabled: false, client_field_support_enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.whatsapp.recipients) {
          this.alertObj.actions.whatsapp.recipients = [];
        }
        if (!this.alertObj.actions.sms) {
          this.alertObj.actions.sms = {enabled: false, client_field_support_enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.sms.recipients) {
          this.alertObj.actions.sms.recipients = [];
        }
      }
    }
  }

  // tslint:disable-next-line: no-unnecessary-initializer
  openAddAlertConditionModal(alertObj = undefined) {
    if (alertObj) {
      this.alertObj = alertObj;
      if (this.assetModel.metadata?.model_type !== CONSTANTS.IP_GATEWAY) {
        this.setupForm = new FormGroup({
          slave_id: new FormControl(alertObj?.metadata?.slave_id),
        });
      }
      if (this.assetModel.metadata?.model_type === CONSTANTS.NON_IP_ASSET) {
      if (this.assetModel.tags.protocol === 'ModbusTCPMaster' || this.assetModel.tags.protocol === 'ModbusRTUMaster') {
        this.setupForm = new FormGroup({
          slave_id: new FormControl(alertObj?.metadata?.slave_id, [Validators.required]),
          d: new FormControl(alertObj?.metadata?.d, [Validators.required]),
          sa: new FormControl(alertObj?.metadata?.sa, [Validators.required, Validators.min(0), Validators.max(99999)]),
          a: new FormControl(true),
          fc: new FormControl(alertObj?.metadata?.fc, [Validators.required]),
        });
      } else if (this.assetModel.tags.protocol === 'SiemensTCPIP') {
        this.setupForm = new FormGroup({
          slave_id: new FormControl(alertObj?.metadata?.slave_id, [Validators.required]),
          d: new FormControl(alertObj?.metadata?.d, [Validators.required]),
          sa: new FormControl(alertObj?.metadata?.sa, [Validators.required, Validators.min(0), Validators.max(99999)]),
          a: new FormControl(true),
          mt: new FormControl(alertObj?.metadata?.mt, [Validators.required]),
        });
      } else if (this.assetModel.tags.protocol === 'BlueNRG') {
        this.setupForm = new FormGroup({
          slave_id: new FormControl(alertObj?.metadata?.slave_id, [Validators.required]),
          sa: new FormControl(alertObj?.metadata?.sa, [Validators.required, Validators.min(1), Validators.max(99999)]),
          a: new FormControl(true),
          p: new FormControl(alertObj?.metadata?.p, [Validators.required]),
        });
      }
      this.onChangeOfSetupType(alertObj.metadata);
      this.onChangeOfSetupSecondaryType(alertObj.metadata);
      if (this.assetModel.tags.protocol === 'ModbusTCPMaster' || this.assetModel.tags.protocol === 'ModbusRTUMaster') {
        this.onChangeOfSetupFunctionCode(alertObj.metadata);
      }
      if (this.assetModel.tags.protocol === 'SiemensTCPIP') {
        this.onChageOfMemoryType(alertObj.metadata);
      }
      }
      console.log(this.setupForm);
    } else {
      this.alertObj = {};
      if (this.assetModel.metadata?.model_type !== CONSTANTS.IP_GATEWAY) {
        this.setupForm = new FormGroup({
          slave_id: new FormControl(alertObj?.metadata?.slave_id),
        });
      }
      if (this.assetModel.metadata?.model_type === CONSTANTS.NON_IP_ASSET) {
      if (this.assetModel.tags.protocol === 'ModbusTCPMaster' || this.assetModel.tags.protocol === 'ModbusRTUMaster') {
        this.setupForm = new FormGroup({
          slave_id: new FormControl(null, [Validators.required]),
          d: new FormControl(null, [Validators.required]),
          sa: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99999)]),
          a: new FormControl(true),
          fc: new FormControl(null, [Validators.required]),
        });
      } else if (this.assetModel.tags.protocol === 'SiemensTCPIP') {
        this.setupForm = new FormGroup({
          slave_id: new FormControl(null, [Validators.required]),
          d: new FormControl(null, [Validators.required]),
          sa: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99999)]),
          a: new FormControl(true),
          mt: new FormControl(null, [Validators.required]),
        });
      } else if (this.assetModel.tags.protocol === 'BlueNRG') {
        this.setupForm = new FormGroup({
          slave_id: new FormControl(null, [Validators.required]),
          sa: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(99999)]),
          a: new FormControl(true),
          p: new FormControl(2, [Validators.required]),
        });
      }
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
    if (this.assetModel.tags.protocol === 'SiemensTCPIP' && this.setupForm.value.d === 'd') {
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
    if (this.setupForm.value.d === 'a' &&
    this.setupForm.value.sd === 9) {
      this.setupForm.removeControl('bytn');
      this.setupForm.addControl('bytn', new FormControl(obj?.bytn || null, [Validators.required]));
    } else {
      this.setupForm.removeControl('bytn');
    }
  }

  onChageOfMemoryType(obj = undefined) {
    if (this.setupForm.value.mt === 'DB') {
      this.setupForm.addControl('dbn', new FormControl(obj?.dbn || null, [Validators.required, Validators.min(1)]));
    } else {
      this.setupForm.removeControl('dbn');
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
    this.subscriptions.push(this.assetModelService.deleteAlertCondition(this.assetModel.app, this.assetModel.name, this.alertObj.id)
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
    if (!this.alertObj.message || (this.alertObj.message.trim()).length === 0 ||  !this.alertObj.code
     || (this.alertObj.code.trim()).length === 0 || !this.alertObj.severity || !this.alertObj.alert_type) {
      this.toasterService.showError('Please enter all required fields', 'Add Alert Condition');
      return;
    }
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
    console.log(this.alertObj);
    this.subscriptions.push(this.assetModelService.updateAlertCondition(
      this.alertObj, this.assetModel.app, this.assetModel.name, this.alertObj.id)
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
     || (this.alertObj.code.trim()).length === 0 || !this.alertObj.severity || !this.alertObj.alert_type) {
      this.toasterService.showError('Please enter all required fields', 'Add Alert Condition');
      return;
    }
    this.alertObj.code = 'M_' + this.alertObj.code;
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
      this.assetModelService.createAlertCondition(this.alertObj, this.assetModel.app, this.assetModel.name).subscribe(
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
