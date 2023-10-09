import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from './../../../services/toaster.service';
import { filter } from 'rxjs/operators';
import { AssetService } from './../../../services/assets/asset.service';
import { Component, Input, OnInit, OnDestroy,ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
import { debug } from 'console';
declare var $: any;
@Component({
  selector: 'app-asset-alert-conditions',
  templateUrl: './asset-alert-conditions.component.html',
  styleUrls: ['./asset-alert-conditions.component.css'],
})
export class AssetAlertConditionsComponent implements OnInit {
  @Input() asset: any;
  @Input() menuDetail: any;
  alertConditions: {
    id?: string;
    message?: string;
    metadata?: any;
    code?: string;
    severity?: string;
    created_by?: string;
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
    created_by?: string;
    alert_type?: string;
    recommendation_html?: string;
    visualization_widgets?: any[];
    reference_documents?: any[];
    actions?: any;
  };
  isAlertConditionsLoading = false;
  isCreateAlertConditionLoading = false;
  widgets: any[] = [];
  toggleRows = {};
  viewType: string;
  editDocuments: any = {};
  assetMethods: any[] = [];
  documents: any[] = [];
  // widgetName: string;
  recommendationObj: any;
  // docName: any;
  // groupName: any = {};
  selectedWidgets: any = [];
  selectedDocuments: any = [];
  selectedUserGroups: any = {
    'email': [],
    'sms': [],
    'whatsapp': [],
    'push_notification': []
  };
  serviceConnectionGroups: any[] = [];
  subscriptions: Subscription[] = [];
  setupForm: FormGroup;
  constantData = CONSTANTS;
  selectedTab = 'Edge';
  slaveData: any[] = [];
  contextApp: any;
  loggedInUser: any;
  decodedToken: any;
  userGroups: any[] = [];
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  widgetStringFromMenu: any;
  selectedAudioFile:any;

  @ViewChild('alert_sound', {static: false})alert_sound :ElementRef;
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService
  ) { }

  async ngOnInit(): Promise<void> {
    this.loggedInUser = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    await this.getDocuments();
    this.getAssetModelWidgets();
    if (!this.menuDetail?.accordion_value?.edge) {
      this.onClickOfTab('Cloud');
    } else {
      this.onClickOfTab('Edge');
    }
    this.getSlaveData();
    if (this.decodedToken?.privileges?.indexOf('APMV') > -1) {
      this.getApplicationUserGroups();
    }
    if (this.decodedToken?.privileges?.indexOf('SCV') > -1) {
      this.selectedUserGroups = {
        'email': [],
        'sms': [],
        'whatsapp': [],
        'push_notification': [],
        'service_connection': []
      };
      this.getServiceConnectionGroups();
    }
  }

  onClickOfTab(type) {

    this.selectedTab = type;
    this.toggleRows = {};
    this.alertObj = {};
    this.alertObj.alert_type = this.selectedTab;
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
          this.serviceConnectionGroups = response.data;
          this.serviceConnectionGroups.forEach((element) => {
            element.type = this.organizeServiceConnectionsType(element.type);
          });
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
    this.selectedWidgets = [];
  }

  removeVisualizationWidget(index) {
    this.alertObj.visualization_widgets.splice(index, 1);
  }

  addReferenceDocument() {
    this.selectedDocuments.forEach(element => {
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
    });
    this.selectedDocuments = [];
  }

  addUserGroup(key) {
    this.selectedUserGroups[key].forEach(element => {
      let index;
      if (key === 'service_connection') {
        element.type = this.organizeServiceConnectionsType(element.type);
        if (element?.name) {
          element = this.renameKey(element, 'name', 'group_name');
        }
        index = this.alertObj.actions[key].connections.findIndex((group) => group === element.id);
      }
      else {
        index = this.alertObj.actions[key].recipients.findIndex((group) => group === element.group_name);
      }
      if (index > -1) {
        if (key !== 'service_connection') {
          this.toasterService.showError('Same UserGroup is already added.', 'Add UserGroup');
        }
        else {
          this.toasterService.showError('Same Service Connection is already added.', 'Add Service Connection');
        }
        return;
      } else if (!element?.group_name) {
        if (key !== 'service_connection') {
          this.toasterService.showError('Please select userGroup to add', 'Add UserGroup');
        }
        else {
          this.toasterService.showError('Please select service connection to add', 'Add Service Connection');
        }
        return;
      }
      if (element?.group_name && index === -1) {
        if (key !== 'service_connection') {
          this.alertObj.actions[key].recipients.splice(
            this.alertObj.actions[key].recipients.length,
            0,
            element.group_name
          );
        }
        else {
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
    if (key !== 'service_connection') {
      this.alertObj.actions[key].recipients.splice(index, 1);
    }
    else {
      this.alertObj.actions[key].connections.splice(index, 1);
    }
  }

  removeDocument(index) {
    this.alertObj.reference_documents.splice(index, 1);
  }

  onClickOfViewActionIcon(type, index) {
    // this.getAssetModelWidgets();
    this.toggleRows = {};
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
          email: { enabled: false, recipients: [] },
          whatsapp: { enabled: false, recipients: [] },
          sms: { enabled: false, recipients: [] },
          push_notification: { enabled: false, recipients: [] }
        };
        if (this.decodedToken?.privileges?.indexOf('SCV') > -1) {
          this.alertObj.actions = {
            email: { enabled: false, recipients: [] },
            whatsapp: { enabled: false, recipients: [] },
            sms: { enabled: false, recipients: [] },
            push_notification: { enabled: false, recipients: [] },
            service_connection: { enabled: false, connections: [] }
        };
      }
      } else {
        if (!this.alertObj.actions.email) {
          this.alertObj.actions.email = { enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.email.recipients) {
          this.alertObj.actions.email.recipients = [];
        }
        if (!this.alertObj.actions.email.enabled) {
          this.alertObj.actions.email.recipients = [];
        }
        if (!this.alertObj.actions.whatsapp) {
          this.alertObj.actions.whatsapp = { enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.whatsapp.recipients) {
          this.alertObj.actions.whatsapp.recipients = [];
        }
        if (!this.alertObj.actions.whatsapp.enabled) {
          this.alertObj.actions.whatsapp.recipients = [];
        }
        if (!this.alertObj.actions.sms) {
          this.alertObj.actions.sms = { enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.sms.recipients) {
          this.alertObj.actions.sms.recipients = [];
        }
        if (!this.alertObj.actions.sms.enabled) {
          this.alertObj.actions.sms.recipients = [];
        }
        if (!this.alertObj.actions.push_notification) {
          this.alertObj.actions.push_notification = { enabled: false, recipients: [] };
        }
        if (!this.alertObj.actions.push_notification.recipients) {
          this.alertObj.actions.push_notification.recipients = [];
        }
        if (!this.alertObj.actions.push_notification.enabled) {
          this.alertObj.actions.push_notification.recipients = [];
        }
        if (this.decodedToken?.privileges?.indexOf('SCV') > -1) {
          if (!this.alertObj.actions.service_connection) {
            this.alertObj.actions.service_connection = { enabled: false, connections: [] };
          }
          if (!this.alertObj.actions.service_connection.connections) {
            this.alertObj.actions.service_connection.connections = [];
          }
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
      this.alertObj.alert_type = this.selectedTab;
    }
    this.toggleRows = {};
    this.editDocuments = {};
    $('#addAlertConditionModal').modal({ backdrop: 'static', keyboard: false, show: true });
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

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.onCloseModal('confirmMessageModal');
    } else if (eventType === 'save') {
      this.onClickOfRemoveCondition();
    }
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
    this.editDocuments = {};
  }

  async onUpdateAlertConditions() {
    if(this.selectedAudioFile && this.selectedAudioFile?.name){
      await this.uploadFile();
    }
    let arr = [];
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
      this.assetService
        .updateAlertCondition(this.alertObj, this.asset.app, this.asset.asset_id, this.alertObj.id)
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

  async onCreateAlertCondition() {
    if(this.selectedAudioFile && this.selectedAudioFile?.name){
      await this.uploadFile();
    }
    const alertObj = JSON.parse(JSON.stringify(this.alertObj));
    alertObj.created_by = this.loggedInUser.email;
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
    alertObj.code = 'A_' + alertObj.code;
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
      this.assetService.createAlertCondition(alertObj, this.asset.app, this.asset.asset_id).subscribe(
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
    this.selectedAudioFile = undefined;
    this.alertObj = undefined;
    this.toggleRows = {};
    this.editDocuments = {};
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
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
          'push_notification': []
        }
        if (this.decodedToken?.privileges?.indexOf('SCV') > -1) {
          this.selectedUserGroups = {
            'email': [],
            'sms': [],
            'whatsapp': [],
            'push_notification': [],
            'service_connection': []
          };
        }
      }
    }
  }
  onRecommendationChange(valuefromtextEditor: any) {
    this.alertObj.recommendation_html = valuefromtextEditor;
  }

  organizeServiceConnectionsType(type) {
    if (type === 'Servicebus') {
      return 'Service Bus';
    }
    else {
      if (type === 'MicrosoftTeams') {
        return 'Microsoft Teams';
      }
      else {
        if (type === 'Webhook') {
          return 'Webhook';
        }
        else {
          if (type === 'Service Bus') {
            return 'Servicebus';
          }
          else {
            if (type === 'Microsoft Teams') {
              return 'MicrosoftTeams';
            }
            else {
              return "";
            }
          }
        }
      }
    }
  }

  renameKey(obj: any, oldKey: string, newKey: string): any {
    if (obj.hasOwnProperty(oldKey)) {
      obj[newKey] = obj[oldKey];
    }
    return obj;
  }

onAudioFileSelected(audio : FileList){
  let selectedFile = audio.item(0);
  if(!selectedFile.type.startsWith('audio/')){
    this.toasterService.showError('Please Select Audio File', 'Upload File');
    this.alert_sound.nativeElement.value='';
    return;
  }
  else{
    if (selectedFile?.size > CONSTANTS?.ASSET_ALERT_AUDIO_SIZE){
      this.toasterService.showError('Audio File Size Exceeded' + " " + CONSTANTS.ASSET_ALERT_AUDIO_SIZE / 1000000 + " " + 'MB', 'Upload File');
      this.alert_sound.nativeElement.value='';
      return;
    }
    else {
      let audioDuration;
      const audioElement: HTMLAudioElement = new Audio();
      audioElement.src = URL.createObjectURL(selectedFile);
      audioElement.load();
        audioElement.addEventListener('loadedmetadata', () => {
          audioDuration = audioElement.duration;
        });        
        setTimeout(() =>{
          if(audioDuration > CONSTANTS.DEFAULT_AUDIO_DURATION/1000){
            this.toasterService.showError('Audio File Duration Exceeded' + " " + CONSTANTS.DEFAULT_AUDIO_DURATION / 1000 + " " + 'Second', 'Upload File');
            this.alert_sound.nativeElement.value='';
            return;
          }else{
            this.selectedAudioFile = selectedFile;
          }
        },100);
    }
  }
}

async uploadFile(){
    const data = await this.commonService.uploadImageToBlob(
      this.selectedAudioFile,this.contextApp.app + '/models/' + this.asset.name);
      if (data && data?.name && data?.url) {
        const audioFile ={
          name:data.name,
          url:data.url
        }
        this.alertObj.metadata = {
          ...this.alertObj?.metadata,
          critical_alert_sound: audioFile
        };
      } 
      else {
      this.toasterService.showError('Error in uploading audio file', 'Upload file');
      return ;
    }
  }

  removeCriticalAlertAudioData(){
    if(this.alertObj?.severity.toLowerCase()!=='critical' && this.alertObj?.metadata?.critical_alert_sound){
      delete this.alertObj.metadata.critical_alert_sound;
    }
  }
}
