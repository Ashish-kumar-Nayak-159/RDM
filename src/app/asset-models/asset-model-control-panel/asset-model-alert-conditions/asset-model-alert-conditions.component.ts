import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from './../../../services/toaster.service';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { Component, Input, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
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
  dropdown = false;
  @Input() assetModel: any;
  @Input() menuDetail: any;
  alertConditions: {
    id?: string;
    message?: string;
    metadata?: any;
    code?: string;
    severity?: string;
    recommendation_html?: string;
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
    recommendation_html?: string;
    visualization_widgets?: any[];
    reference_documents?: any[];
    actions?: any;
  };
  defaultBeforeIntervalForVisualizationWidgets = 10;
  defaultAfterIntervalForVisualizationWidgets = 10;
  minIntervalValueForVisualizationWidgets = 1;
  maxIntervalValueForVisualizationWidgets = 1440;
  isAlertConditionsLoading = false;
  isCreateAlertConditionLoading = false;
  widgets: any[] = [];
  toggleRows = {};
  viewType: string;
  editDocuments: any = {};
  assetMethods: any[] = [];
  documents: any[] = [];
  // widgetName: string;
  selectedWidgets: any = [];
  selectedDocuments: any = [];
  selectedUserGroups: any = {
    'email': [],
    'sms': [],
    'whatsapp': [],
    'push_notification': [],
    'service_connection': [],

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
  serviceConnectionGroups: any[] = [];
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  widgetStringFromMenu: any;

  @ViewChild('addVisulizationWidgetDiv', { static: false }) addVisulizationWidgetDiv;
  @ViewChild('addUserGroupDiv', { static: false }) addUserGroupDiv;
  @ViewChild('documentSelectionDiv', { static: false }) documentSelectionDiv;


  constructor(
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService
  ) { }

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

    if(this.decodedToken?.privileges?.indexOf('SCV') > -1){
      this.getServiceConnectionGroups();
    }

    $('.custom-dropdown').on('shown.bs.collapse', function (e) {
      alert("Close");
    });
  }

  @HostListener('document:click', ['$event'])
  public onClick(e) {
    let clickedInside = this.documentSelectionDiv?.nativeElement?.contains(e.target);
    if (!clickedInside) {
      this.addReferenceDocument();
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
            group_name: "Client Field Support"
          })
        }
      })
    );
  }
  getServiceConnectionGroups() {
    this.subscriptions.push(
      this.applicationService.getServiceConnection().subscribe((response: any) => {
        if (response && response.data) {
          this.serviceConnectionGroups=response.data;
          this.serviceConnectionGroups.forEach((element) => {
            element.type = this.organizeServiceConnectionsType(element.type);
          });
        }
      })
    );
  }
  organizeServiceConnectionsType(type) {
    if(type === 'Servicebus') {
      return 'Service Bus';
    }
    else{
      if(type === 'MicrosoftTeams') {
        return 'Microsoft Teams';
      }
      else{
        if(type === 'Webhook') {
          return 'Webhook';
        }
        else{
          if(type === 'Service Bus'){
            return 'Servicebus';
          }
          else{
            if(type === 'Microsoft Teams'){
              return 'MicrosoftTeams';
            }
            else{
              return "";
            }
          }
        }
      }
    }
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
  }

  removeVisualizationWidget(item) {
    this.selectedWidgets = this.selectedWidgets.filter((widget) => widget.title !== item);
  }

  addReferenceDocument() {
    this.selectedDocuments.forEach((element) => {
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
  renameKey(obj: any, oldKey: string, newKey: string): any {
    if (obj.hasOwnProperty(oldKey)) {
      obj[newKey] = obj[oldKey];
    }
    return obj;
  }

  addUserGroup(key) {

    this.selectedUserGroups[key].forEach(element => {
      let index;
      if(key==='service_connection'){
        element.type=this.organizeServiceConnectionsType(element.type);
        if(element.name){
          element= this.renameKey(element,'name','group_name');
        }
        index = this.alertObj.actions[key].connections.findIndex((group) =>  group === element.id );
      }
      else{
        index = this.alertObj.actions[key].recipients.findIndex((group) =>  group === element.group_name );
      }
        if (index > -1) {
          if(key!=='service_connection'){
            this.toasterService.showError( 'Same UserGroup is already added.', 'Add UserGroup');
          }
          else{
            this.toasterService.showError( 'Same Service Connection is already added.', 'Add Service Connection');
          }
          return;
        } else if (!element.group_name) {
          if(key!=='service_connection'){
            this.toasterService.showError('Please select userGroup to add', 'Add UserGroup');
          }
          else{
            this.toasterService.showError('Please select service connection to add', 'Add Service Connection');
          }
          return;
        }
        if (element.group_name && index === -1) {
        if(key!=='service_connection'){
          this.alertObj.actions[key].recipients.splice(
            this.alertObj.actions[key].recipients.length,
            0,
            element.group_name
          );
        }
        else{
          this.alertObj.actions[key].connections.splice(
            this.alertObj.actions[key].connections.length,
            0,
            element.id
          );
        }
        }

    });
    this.selectedUserGroups[key] = [];
  }

  removeUserGroup(index, key) {
    if(key!=='service_connection'){
      this.alertObj.actions[key].recipients.splice(index, 1);
    }
    else{
      this.alertObj.actions[key].connections.splice(index, 1);
    }
  }

  removeDocument(index) {
    this.alertObj.reference_documents.splice(index, 1);
  }

  onClickOfViewActionIcon(type, index) {
    this.selectedWidgets = []
    // this.getAssetModelWidgets();
    this.toggleRows = {};
    this.editDocuments = {};
    this.viewType = type;
    this.toggleRows[this.selectedTab + '_' + index] = true;
    this.alertObj = this.alertConditions[index];
    if (type === 'Visualization') {
      this.alertObj = {
        ...this.alertObj,
        metadata: {
          ...this.alertObj.metadata,
          beforeIntervalForVisualizationWidgets: this.alertObj?.metadata?.beforeIntervalForVisualizationWidgets || this.defaultBeforeIntervalForVisualizationWidgets,
          afterIntervalForVisualizationWidgets: this.alertObj?.metadata?.afterIntervalForVisualizationWidgets || this.defaultAfterIntervalForVisualizationWidgets
        }
      }
      this.selectedWidgets = this.widgets.filter((widget) => this.alertObj.visualization_widgets.includes(widget.title));
    }
    else if (type === 'Recommendations') {
      this.recommendationObj = {};
    }
    else if (type === 'Actions') {
      if (!this.alertObj.actions) {

        this.alertObj.actions = {
          email: { enabled: false, recipients: [] },
          whatsapp: { enabled: false, recipients: [] },
          sms: { enabled: false, recipients: [] },
          push_notification: { enabled: false, recipients: [] },
          service_connection: { enabled: false, connections: [] }

        };
      } else {
        if (!this.alertObj.actions.email) {
          this.alertObj.actions.email = { enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.email.recipients) {
          this.alertObj.actions.email.recipients = [];
        }
        if (!this.alertObj.actions.whatsapp) {
          this.alertObj.actions.whatsapp = { enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.whatsapp.recipients) {
          this.alertObj.actions.whatsapp.recipients = [];
        }
        if (!this.alertObj.actions.sms) {
          this.alertObj.actions.sms = { enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.sms.recipients) {
          this.alertObj.actions.sms.recipients = [];
        }
        if (!this.alertObj.actions.push_notification) {
          this.alertObj.actions.push_notification = { enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.push_notification.recipients) {
          this.alertObj.actions.push_notification.recipients = [];
        }
        if (!this.alertObj.actions.service_connection) {
          this.alertObj.actions.service_connection = { enabled: false, connections: [] };
        }
        if (!this.alertObj.actions.service_connection.connections) {
          this.alertObj.actions.service_connection.connections = [];
        }
      }
    }
  }

  // tslint:disable-next-line: no-unnecessary-initializer
  openAddAlertConditionModal(alertObj = undefined) {
    this.setupForm?.reset();
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
    this.editDocuments = {};
  }
  onUpdateAlertConditions() {
    this.alertObj.metadata = {
      ...this.alertObj?.metadata,
      ...this.setupForm?.value
    };
    let arr = [];
    this.alertObj.visualization_widgets = this.selectedWidgets.map((widget) => widget.title);
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
    alertObj.recommendation_html = '';
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
    this.editDocuments = {};
    this.selectedUserGroups = {
      'email': [],
      'sms': [],
      'whatsapp': [],
      'push_notification': [],
      'service_connection': []

    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.assetModel['alert_type'] = undefined;
  }

  onDeselectAll(e, type) {
    if (e === [] || e.length === 0) {
      if (type == 'document') {
        this.selectedDocuments = []
      }
      if (type == 'widget') {
        this.selectedWidgets = [];
      }
      if (type == 'userGroups') {
        this.selectedUserGroups = {
          'email': [],
          'sms': [],
          'whatsapp': [],
          'push_notification': [],
          'service_connection': []

        }
      }
    }
  }
  onRecommendationChange(valuefromtextEditor: any) {
      this.alertObj.recommendation_html = valuefromtextEditor;
  }
}
