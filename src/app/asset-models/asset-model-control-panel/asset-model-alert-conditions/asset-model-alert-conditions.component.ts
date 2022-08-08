import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from './../../../services/toaster.service';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';

declare var $: any;
@Component({
  selector: 'app-asset-model-alert-conditions',
  templateUrl: './asset-model-alert-conditions.component.html',
  styleUrls: ['./asset-model-alert-conditions.component.css'],
})
export class AssetModelAlertConditionsComponent implements OnInit, OnDestroy {
  @Input() assetModel: any;
  alertConditions: {
    id?: string;
    message?: string;
    metadata?: any;
    code?: string;
    severity?: string;
    recommendations?: any[];
    visualization_widgets?: any[];
    reference_documents?: any[];
    actions?: any;
    alert_type?: string;
  }[] = [];
  alertObj: {
    id?: string;
    message?: string;
    metadata?: any;
    code?: string;
    severity?: string;
    alert_type?: string;
    recommendations?: any[];
    visualization_widgets?: any[];
    reference_documents?: any[];
    actions?: any;
  };
  isAlertConditionsLoading = false;
  isCreateAlertConditionLoading = false;
  widgets: any[] = [];
  toggleRows = {};
  viewType: string;
  editRecommendationStep: any = {};
  editDocuments: any = {};
  assetMethods: any[] = [];
  documents: any[] = [];
  // widgetName: string;
  selectedWidgets: any = [];
  selectedDocuments : any = [];
  selectedUserGroups : any = {
    'email':[],
    'sms':[],
    'whatsapp':[],
    'push_notification':[]

  };
  recommendationObj: any;
  // docName: any;
  // groupName: any[] = [];
  subscriptions: Subscription[] = [];
  setupForm: FormGroup;
  constantData = CONSTANTS;
  selectedTab = 'Asset';
  slaveData: any[] = [];
  contextApp: any;
  decodedToken: any;
  userGroups: any[] = [];
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  widgetStringFromMenu: any;
  constructor(
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService
  ) {}

  async ngOnInit(): Promise<void> {
    this.assetModel['alert_type'] = this.selectedTab;
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    await this.getDocuments();
    this.getAssetModelWidgets();
    this.onClickOfTab('Asset');
    this.onChangeOfAlertSource();
    this.getSlaveData();
    if (this.decodedToken?.privileges?.indexOf('APMV') > -1) {
      this.getApplicationUserGroups();
    }
  }

  onClickOfTab(type) {
    this.selectedTab = type;
    this.toggleRows = {};
    this.getAlertConditions();
    this.alertObj = {};    
    this.alertObj.alert_type = this.selectedTab;
  }

  getApplicationUserGroups() {
    this.subscriptions.push(
      this.applicationService.getApplicationUserGroups(this.contextApp.app).subscribe((response: any) => {
        if (response && response.data) {
          this.userGroups = response.data;
          this.userGroups.push({
            group_name : "Client Field Support"
          })
        }
      })
    );
  }

  getAssetModelWidgets() {
    if (this.widgets.length === 0) {
      const obj = {
        app: this.assetModel.app,
        name: this.assetModel.name,
      };
      this.subscriptions.push(
        this.assetModelService.getAssetsModelLayout(obj).subscribe((response: any) => {
          if (response?.historical_widgets?.length > 0) {
            this.widgets = response.historical_widgets;
          }
        })
      );
    }
  }

  getSlaveData() {
    this.slaveData = [];
    const filterObj = {};
    this.subscriptions.push(
      this.assetModelService
        .getModelSlaveDetails(this.contextApp.app, this.assetModel.name, filterObj)
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
        asset_model: this.assetModel.name,
      };
      this.subscriptions.push(
        this.assetModelService.getAssetsModelDocuments(obj).subscribe((response: any) => {
          if (response?.data) {
            this.documents = response.data;
          }
          resolve();
        })
      );
    });
  }

  getAlertConditions() {
    this.isAlertConditionsLoading = true;
    const filterObj = {
      asset_model: this.assetModel.name,
      alert_type: this.selectedTab,
    };
    this.subscriptions.push(
      this.assetModelService.getAlertConditions(this.assetModel.app, filterObj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.alertConditions = response.data;
            let arr = [];
            this.alertConditions.forEach((alert) => {
              arr = [];
              if (!alert.visualization_widgets) {
                alert.visualization_widgets = [];
              }
              alert.reference_documents.forEach((refDoc) => {
                this.documents.forEach((doc) => {
                  if (doc.id.toString() === refDoc.toString()) {
                    arr.push(doc.name);
                  }
                });
              });
              alert.reference_documents = arr;
            });
            this.isAlertConditionsLoading = false;
          }
        },
        (error) => (this.isAlertConditionsLoading = false)
      )
    );
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
    this.selectedWidgets.forEach(element => {
      const index = this.alertObj.visualization_widgets.findIndex((widget) => widget === element.title);
      if (index > -1) {
        this.toasterService.showError(
          'Same ' + this.widgetStringFromMenu + ' is already added.',
          'Add ' + this.widgetStringFromMenu
        );
        return;
      } else if (!element.title) {
        this.toasterService.showError(
          'Please select ' + this.widgetStringFromMenu + ' to add',
          'Add ' + this.widgetStringFromMenu
        );
        return;
      }
      if (element.title && index === -1) {
        this.alertObj.visualization_widgets.splice(this.alertObj.visualization_widgets.length, 0, element.title);
      }
    });
    this.selectedWidgets = []
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
    this.selectedDocuments.forEach((element)=>{
      const index = this.alertObj.reference_documents.findIndex((doc) => doc === element.name);
      if (index > -1) {
        this.toasterService.showError('Same Document is already added.', 'Add Document');
        return;
      } else if (!element.name) {
        this.toasterService.showError('Please select document to add', 'Add Document');
        return;
      }
      if (element.name && index === -1) {
        this.alertObj.reference_documents.splice(this.alertObj.reference_documents.length, 0, element.name);
      }
    })
    this.selectedDocuments = [];
  }

  addUserGroup(key) {
    
    this.selectedUserGroups[key].forEach(element => {
      const index = this.alertObj.actions[key].recipients.findIndex((group) => group === element.group_name);
      if (index > -1) {
        this.toasterService.showError('Same UserGroup is already added.', 'Add UserGroup');
        return;
      } else if (!element.group_name) {
        this.toasterService.showError('Please select userGroup to add', 'Add UserGroup');
        return;
      }
      if (element.group_name && index === -1) {
        this.alertObj.actions[key].recipients.splice(
          this.alertObj.actions[key].recipients.length,
          0,
          element.group_name
        );
      }
    });
    this.selectedUserGroups[key] = [];
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
  removeDocument(index) {
    this.alertObj.reference_documents.splice(index, 1);
  }

  onClickOfViewActionIcon(type, index) {
    this.selectedWidgets = []
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
          email: { enabled: false,  recipients: [] },
          whatsapp: { enabled: false,  recipients: [] },
          sms: { enabled: false,  recipients: [] },
          push_notification: { enabled: false, recipients: [] },

        };
      } else {
        if (!this.alertObj.actions.email) {
          this.alertObj.actions.email = { enabled: false,  recipients: [] };
        }
        if (!this.alertObj.actions.email.recipients) {
          this.alertObj.actions.email.recipients = [];
        }
        if (!this.alertObj.actions.whatsapp) {
          this.alertObj.actions.whatsapp = { enabled: false,  recipients: [] };
        }
        if (!this.alertObj.actions.whatsapp.recipients) {
          this.alertObj.actions.whatsapp.recipients = [];
        }
        if (!this.alertObj.actions.sms) {
          this.alertObj.actions.sms = { enabled: false,  recipients: [] };
        }
        if (!this.alertObj.actions.sms.recipients) {
          this.alertObj.actions.sms.recipients = [];
        }
        if (!this.alertObj.actions.push_notification) {
          this.alertObj.actions.push_notification = { enabled: false,recipients: [] };
        }
        if (!this.alertObj.actions.push_notification.recipients) {
          this.alertObj.actions.push_notification.recipients = [];
        }
      }
    }
  }

  // tslint:disable-next-line: no-unnecessary-initializer
  openAddAlertConditionModal(alertObj = undefined) {
    this.setupForm.reset();
    if (alertObj) {
      this.alertObj = JSON.parse(JSON.stringify(alertObj));
      if (this.alertObj.alert_type === 'Asset') {
        this.setupForm = new FormGroup({
          slave_id: new FormControl(alertObj?.metadata?.slave_id, Validators.required),
        });
        if (this.assetModel.metadata?.model_type === CONSTANTS.NON_IP_ASSET) {
          if (
            this.assetModel.tags.protocol === 'ModbusTCPMaster' ||
            this.assetModel.tags.protocol === 'ModbusRTUMaster'
          ) {
            this.setupForm = new FormGroup({
              slave_id: new FormControl(alertObj?.metadata?.slave_id, [Validators.required]),
              d: new FormControl(alertObj?.metadata?.d, [Validators.required]),
              sa: new FormControl(alertObj?.metadata?.sa, [
                Validators.required,
                Validators.min(0),
                Validators.max(99999),
              ]),
              a: new FormControl(true),
              fc: new FormControl(alertObj?.metadata?.fc, [Validators.required]),
              bn: new FormControl(alertObj?.metadata?.bn, [Validators.required])
            });
          } else if (this.assetModel.tags.protocol === 'SiemensTCPIP') {
            this.setupForm = new FormGroup({
              slave_id: new FormControl(alertObj?.metadata?.slave_id, [Validators.required]),
              d: new FormControl(alertObj?.metadata?.d, [Validators.required]),
              sa: new FormControl(alertObj?.metadata?.sa, [
                Validators.required,
                Validators.min(0),
                Validators.max(99999),
              ]),
              a: new FormControl(true),
              mt: new FormControl(alertObj?.metadata?.mt, [Validators.required]),
            });
          } else if (this.assetModel.tags.protocol === 'BlueNRG') {
            this.setupForm = new FormGroup({
              slave_id: new FormControl(alertObj?.metadata?.slave_id, [Validators.required]),
              sa: new FormControl(alertObj?.metadata?.sa, [
                Validators.required,
                Validators.min(1),
                Validators.max(99999),
              ]),
              a: new FormControl(true),
              p: new FormControl(alertObj?.metadata?.p, [Validators.required]),
            });
          } else if (this.assetModel.tags.protocol === 'AIoTInputs') {
            this.setupForm = new FormGroup({
              slave_id: new FormControl(alertObj?.metadata?.slave_id, [Validators.required]),
              cn: new FormControl(alertObj?.metadata?.cn, [Validators.required, Validators.min(0)]),
              a: new FormControl(false),
              d: new FormControl(alertObj?.metadata?.d, [Validators.required]),
            });
          }
        }
      }
    } else {
      this.alertObj = {};
      this.alertObj.alert_type = this.selectedTab;
    }
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
    $('#addAlertConditionModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onChangeOfAlertSource() {
    if (this.alertObj.alert_type === 'Asset') {
      this.setupForm = new FormGroup({
        slave_id: new FormControl(null, Validators.required),
      });
      if (this.assetModel.metadata?.model_type === CONSTANTS.NON_IP_ASSET) {
        if (
          this.assetModel.tags.protocol === 'ModbusTCPMaster' ||
          this.assetModel.tags.protocol === 'ModbusRTUMaster'
        ) {
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
        } else if (this.assetModel.tags.protocol === 'AIoTInputs') {
          this.setupForm = new FormGroup({
            slave_id: new FormControl(null, [Validators.required]),
            cn: new FormControl(null, [Validators.required, Validators.min(0)]),
            a: new FormControl(false),
            d: new FormControl(null, [Validators.required]),
          });
        }
      }
    } else {
      this.setupForm = undefined;
    }
  }

  openConfirmModal(id, alertObj) {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
    this.alertObj = alertObj;
  }

  onClickOfRemoveCondition() {
    this.subscriptions.push(
      this.assetModelService
        .deleteAlertCondition(this.assetModel.app, this.assetModel.name, this.alertObj.id)
        .subscribe(
          (response: any) => {
            this.onCloseModal('confirmMessageModal');
            this.getAlertConditions();
            this.toasterService.showSuccess(response.message, 'Remove Alert Condition');
          },
          (error) => {
            this.onCloseModal('confirmMessageModal');
            this.toasterService.showError(error.message, 'Remove Alert Condition');
          }
        )
    );
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.onCloseModal('confirmMessageModal');
      $('#confirmMessageModal').modal('hide');
    } else if (eventType === 'save') {
      this.onClickOfRemoveCondition();
    }
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
    this.alertObj = undefined;
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
  }

  onUpdateAlertConditions() {
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
    this.documents.forEach((doc) => {
      arr.forEach((widget, index) => {
        if (doc.name === widget) {
          this.alertObj.reference_documents.push(doc.id.toString());
        }
      });
    });
    arr = this.alertObj.reference_documents;
    arr.forEach((doc, index) => {
      if (!doc) {
        this.alertObj.reference_documents.splice(index, 1);
      }
    });
    if (
      !this.alertObj.message ||
      this.alertObj.message.trim().length === 0 ||
      !this.alertObj.code ||
      this.alertObj.code.trim().length === 0 ||
      !this.alertObj.severity ||
      !this.alertObj.alert_type
    ) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add Alert Condition');
      return;
    }
    this.isCreateAlertConditionLoading = true;

    this.subscriptions.push(
      this.assetModelService
        .updateAlertCondition(this.alertObj, this.assetModel.app, this.assetModel.name, this.alertObj.id)
        .subscribe(
          (response: any) => {
            this.isCreateAlertConditionLoading = false;
            this.getAlertConditions();
            this.onCloseAlertConditionModal();
            this.toasterService.showSuccess(response.message, 'Update Alert Condition');
            this.toggleRows = {};
            this.editRecommendationStep = {};
            this.editDocuments = {};
          },
          (error) => {
            this.isCreateAlertConditionLoading = false;
            this.toasterService.showError(error.message, 'Update Alert Condition');
          }
        )
    );
  }

  onCreateAlertCondition() {
    this.alertObj.metadata = this.setupForm?.value;
    const alertObj = JSON.parse(JSON.stringify(this.alertObj));
    if (
      !alertObj.message ||
      alertObj.message.trim().length === 0 ||
      !alertObj.code ||
      alertObj.code.trim().length === 0 ||
      !alertObj.severity ||
      !alertObj.alert_type
    ) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add Alert Condition');
      return;
    }
    alertObj.code = 'M_' + alertObj.code;
    let flag = false;
    this.alertConditions.forEach((alert) => {
      if (alertObj.message === alert.message) {
        flag = true;
      }
    });
    if (flag) {
      this.toasterService.showError('Alert Condition with same name is already exists', 'Add Alert Condition');
      return;
    }
    this.isCreateAlertConditionLoading = true;
    alertObj.visualization_widgets = [];
    alertObj.recommendations = [];
    alertObj.reference_documents = [];
    alertObj.actions = {
      email: { enabled: false },
      whatsapp: { enabled: false },
      sms: { enabled: false },
    };
    this.subscriptions.push(
      this.assetModelService.createAlertCondition(alertObj, this.assetModel.app, this.assetModel.name).subscribe(
        (response: any) => {
          this.isCreateAlertConditionLoading = false;
          this.onCloseAlertConditionModal();
          this.getAlertConditions();
          this.toasterService.showSuccess(response.message, 'Add Alert Condition');
        },
        (error) => {
          this.isCreateAlertConditionLoading = false;
          this.toasterService.showError(error.message, 'Add Alert Condition');
        }
      )
    );
  }

  onCloseAlertConditionModal() {
    $('#addAlertConditionModal').modal('hide');
    this.alertObj = undefined;
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
    this.selectedUserGroups = {
      'email':[],
      'sms':[],
      'whatsapp':[],
      'push_notification':[]

    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onDeselectAll(e,type) {
    if (e === [] || e.length === 0) {
      if(type=='document'){
        this.selectedDocuments = []
      }
      if(type == 'widget'){
        this.selectedWidgets = [];
      }
      if(type == 'userGroups'){
        this.selectedUserGroups = {
          'email':[],
          'sms':[],
          'whatsapp':[],
          'push_notification':[]

        }
      }
    }
  }
}
