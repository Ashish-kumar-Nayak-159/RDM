import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from './../../../services/toaster.service';
import { filter } from 'rxjs/operators';
import { AssetService } from './../../../services/assets/asset.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CONSTANTS } from 'src/app/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';
import { APIMESSAGES } from 'src/app/api-messages.constants';
declare var $: any;
@Component({
  selector: 'app-asset-alert-conditions',
  templateUrl: './asset-alert-conditions.component.html',
  styleUrls: ['./asset-alert-conditions.component.css'],
})
export class AssetAlertConditionsComponent implements OnInit {
  @Input() asset: any;
  alertConditions: {
    id?: string;
    message?: string;
    metadata?: any;
    code?: string;
    severity?: string;
    created_by?: string;
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
    created_by?: string;
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
  widgetName: string;
  recommendationObj: any;
  docName: any;
  groupName: any = {};
  subscriptions: Subscription[] = [];
  setupForm: FormGroup;
  constantData = CONSTANTS;
  selectedTab = 'Edge';
  slaveData: any[] = [];
  contextApp: any;
  loggedInUser: any;
  decodedToken: any;
  userGroups: any[] = [];
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loggedInUser = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    await this.getDocuments();
    this.getAssetModelWidgets();
    this.onClickOfTab('Edge');
    this.getSlaveData();
    this.getApplicationUserGroups();
  }

  onClickOfTab(type) {
    this.selectedTab = type;
    this.toggleRows = {};
    this.getAlertConditions();
  }

  getAssetModelWidgets() {
    if (this.widgets.length === 0) {
      const obj = {
        app: this.asset.app,
        name: this.asset.tags.asset_model,
      };
      this.subscriptions.push(
        this.assetService.getAssetsModelLayout(obj).subscribe((response: any) => {
          if (response?.historical_widgets?.length > 0) {
            this.widgets = response.historical_widgets;
          }
        })
      );
    }
  }

  getApplicationUserGroups() {
    this.subscriptions.push(
      this.applicationService.getApplicationUserGroups(this.contextApp.app).subscribe((response: any) => {
        if (response && response.data) {
          this.userGroups = response.data;
        }
      })
    );
  }

  getSlaveData() {
    this.slaveData = [];
    const filterObj = {};
    this.subscriptions.push(
      this.assetService
        .getModelSlaveDetails(this.contextApp.app, this.asset.tags.asset_model, filterObj)
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
        app: this.asset.app,
        asset_model: this.asset.tags.asset_model,
      };
      this.subscriptions.push(
        this.assetService.getAssetsModelDocuments(obj).subscribe((response: any) => {
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
      asset_id: this.asset.asset_id,
      alert_type: this.selectedTab,
    };
    this.subscriptions.push(
      this.assetService.getAlertConditions(this.asset.app, filterObj).subscribe(
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
    } else {
      this.onClickOfViewActionIcon('Visualization', i);
    }
  }

  addVisualizationWidget() {
    // this.editVisuailzationWidget[this.alertObj.visualization_widgets.length] = true;

    const index = this.alertObj.visualization_widgets.findIndex((widget) => widget === this.widgetName);
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
    const index = this.alertObj.reference_documents.findIndex((doc) => doc === this.docName);
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
    const index = this.alertObj.actions[key].recipients.findIndex((group) => group === this.groupName[key]);
    if (index > -1) {
      this.toasterService.showError('Same User Group is already added.', 'Add User Group');
      return;
    } else if (!this.groupName[key]) {
      this.toasterService.showError('Please select user Group to add', 'Add User Group');
      return;
    }
    if (this.groupName[key] && index === -1) {
      this.alertObj.actions[key].recipients.splice(
        this.alertObj.actions[key].recipients.length,
        0,
        this.groupName[key]
      );
    }
    this.groupName[key] = undefined;
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

  onSaveRecommendations() {}

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
          email: { enabled: false, client_field_support_enabled: false, recipients: [] },
          whatsapp: { enabled: false, client_field_support_enabled: false, recipients: [] },
          sms: { enabled: false, client_field_support_enabled: false, recipients: [] },
        };
      } else {
        if (!this.alertObj.actions.email) {
          this.alertObj.actions.email = { enabled: false, client_field_support_enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.email.recipients) {
          this.alertObj.actions.email.recipients = [];
        }
        if (!this.alertObj.actions.email.enabled) {
          this.alertObj.actions.email.client_field_support_enabled = false;
          this.alertObj.actions.email.recipients = [];
        }
        if (!this.alertObj.actions.whatsapp) {
          this.alertObj.actions.whatsapp = { enabled: false, client_field_support_enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.whatsapp.recipients) {
          this.alertObj.actions.whatsapp.recipients = [];
        }
        if (!this.alertObj.actions.whatsapp.enabled) {
          this.alertObj.actions.whatsapp.client_field_support_enabled = false;
          this.alertObj.actions.whatsapp.recipients = [];
        }
        if (!this.alertObj.actions.sms) {
          this.alertObj.actions.sms = { enabled: false, client_field_support_enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.sms.recipients) {
          this.alertObj.actions.sms.recipients = [];
        }
        if (!this.alertObj.actions.sms.enabled) {
          this.alertObj.actions.sms.client_field_support_enabled = false;
          this.alertObj.actions.sms.recipients = [];
        }
      }
    }
  }

  // tslint:disable-next-line: no-unnecessary-initializer
  openAddAlertConditionModal(alertObj = undefined) {
    if (alertObj) {
      this.alertObj = JSON.parse(JSON.stringify(alertObj));
    } else {
      this.alertObj = {};
    }
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
    this.subscriptions.push(
      this.assetService.deleteAlertCondition(this.asset.app, this.asset.asset_id, this.alertObj.id).subscribe(
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

  onCloseModal(id) {
    $('#' + id).modal('hide');
    this.alertObj = undefined;
    this.toggleRows = {};
    this.editRecommendationStep = {};
    this.editDocuments = {};
  }

  onUpdateAlertConditions() {
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
      this.toasterService.showError(APIMESSAGES.ALL_FIELDS_REQUIRED, 'Add Alert Condition');
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
    console.log(this.alertObj.code);
    this.subscriptions.push(
      this.assetService
        .updateAlertCondition(this.alertObj, this.asset.app, this.asset.asset_id, this.alertObj.id)
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
    this.alertObj.created_by = this.loggedInUser.email;
    if (
      !this.alertObj.message ||
      this.alertObj.message.trim().length === 0 ||
      !this.alertObj.code ||
      this.alertObj.code.trim().length === 0 ||
      !this.alertObj.severity ||
      !this.alertObj.alert_type
    ) {
      this.toasterService.showError(APIMESSAGES.ALL_FIELDS_REQUIRED, 'Add Alert Condition');
      return;
    }
    this.alertObj.code = 'A_' + this.alertObj.code;
    let flag = false;
    this.alertConditions.forEach((alert) => {
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
      email: { enabled: false },
      whatsapp: { enabled: false },
      sms: { enabled: false },
    };
    console.log(this.alertObj.code);
    this.subscriptions.push(
      this.assetService.createAlertCondition(this.alertObj, this.asset.app, this.asset.asset_id).subscribe(
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
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
