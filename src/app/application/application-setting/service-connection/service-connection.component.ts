import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, AbstractControl, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
declare var $: any;
@Component({
  selector: 'app-service-connection',
  templateUrl: './service-connection.component.html',
  styleUrls: ['./service-connection.component.css']
})
export class ServiceConnectionComponent implements OnInit {
  @Input() applicationData: any;
  decodedToken: any;
  addConnectionObj: any;
  addServiceConnectionForm: FormGroup;
  isCreateUserAPILoading = false;
  service_connection_type = [];
  apiSubscriptions: Subscription[] = [];
  service_connections: any[] = [];
  isGetAPILoading = false;
  serviceConnectionsObj: any = {};
  serviceConnectionsObj1: [
    name?: string,
    type?: string,
    endpoint?: string,
    config?: {
      connection_string?: string,
      key_value?: any[]
    }
  ] = [];
  connectionType;
  isDeleteUserAPILoadig = false;
  selectedServiceConnectionForDelete: any;
  constructor(
    private commonService: CommonService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.service_connection_type = ['Service Bus', 'Webhook', 'Microsoft Teams'];

    this.addServiceConnectionForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(50)]),
      type: new FormControl(null, [Validators.required]),
      endpoint: new FormControl(null),
      connection_string: new FormControl(null),
    });

    this.getAllServiceConnections();
  }

  getAllServiceConnections() {
    this.service_connections = [];
    this.apiSubscriptions.push(
      this.applicationService.getServiceConnection().subscribe((response: any) => {
        if (response && response.data) {
          this.service_connections = response.data;
          this.isGetAPILoading = false;
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
          return "";
        }
      }
    }
  }

  openCreateEditServiceConnection(serviceConnectionObj?) {
    this.addConnectionObj = {};
    if (serviceConnectionObj !== undefined) {
      this.connectionType = this.organizeServiceConnectionsType(serviceConnectionObj.type);
      if(this.connectionType===""){
        this.connectionType = undefined;
      }
      // this.connectionType = serviceConnectionObj.type === 'Servicebus' ? 'Service Bus' : serviceConnectionObj.type === 'MicrosoftTeams' ? 'Microsoft Teams' : serviceConnectionObj.type === 'Webhook' ? 'Webhook' : undefined;
      this.addConnectionObj = JSON.parse(JSON.stringify(serviceConnectionObj));
      this.onConnectionTypeChange(this.connectionType, this.addConnectionObj);
      if (serviceConnectionObj && serviceConnectionObj.type === 'Servicebus' && this.connectionType === 'Service Bus') {
        this.addServiceConnectionForm = new FormGroup({
          name: new FormControl(serviceConnectionObj?.name ? serviceConnectionObj.name : "", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
          type: new FormControl(this.organizeServiceConnectionsType(serviceConnectionObj.type), [Validators.required]),
          endpoint: new FormControl(serviceConnectionObj?.endpoint ? serviceConnectionObj.endpoint : "", [Validators.required, Validators.minLength(4), Validators.maxLength(50)]),
          connection_string: new FormControl(serviceConnectionObj.config.connection_string, [
            Validators.required
            ,Validators.pattern(CONSTANTS.DEFAULT_SERVICE_BUS_CONNECTION_SETRING_REGEX)
          ]),
        });
      }
      else {
        if (serviceConnectionObj.type === 'MicrosoftTeams') {
          this.addServiceConnectionForm = new FormGroup({
            name: new FormControl(serviceConnectionObj.name, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
            type: new FormControl(this.organizeServiceConnectionsType(serviceConnectionObj.type), [Validators.required]),
            endpoint: new FormControl(serviceConnectionObj?.endpoint ? serviceConnectionObj.endpoint : null, [Validators.required,
            ]),
          });
          this.addServiceConnectionForm.get('endpoint').setValue(serviceConnectionObj?.endpoint ? serviceConnectionObj.endpoint : null);
        }
        else {
          if (serviceConnectionObj.type === 'Webhook') {
            this.addServiceConnectionForm = new FormGroup({
              name: new FormControl(serviceConnectionObj.name, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
              type: new FormControl(this.organizeServiceConnectionsType(serviceConnectionObj.type), [Validators.required]),
              endpoint: new FormControl(serviceConnectionObj?.endpoint ? serviceConnectionObj.endpoint : null, [Validators.required,
              ]),
              key: new FormControl(serviceConnectionObj?.config?.key ? serviceConnectionObj.config.key : null),
              value: new FormControl(serviceConnectionObj?.config?.value ? serviceConnectionObj.config.value : null),
            });
            this.addServiceConnectionForm.get('endpoint').setValue(serviceConnectionObj?.endpoint ? serviceConnectionObj.endpoint : null);
            let httpHeaders = [];
            Object.keys(serviceConnectionObj?.config).forEach((httpHeader) => httpHeaders.push({ key: httpHeader, value: serviceConnectionObj?.config[httpHeader] }));
            this.webhookKeyValue = httpHeaders;
          }
        }
      }
    }
    $('#createUserModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openDeleteServiceConnection(connectionObj) {
    this.selectedServiceConnectionForDelete = connectionObj;
    $('#deleteUserModal').modal({ backdrop: 'static', keyboard: false, show: true });

  }

  onCloseModal() {
    $('#deleteUserModal').modal('hide');
    this.selectedServiceConnectionForDelete = undefined;
    this.isDeleteUserAPILoadig = false;
  }

  deleteServiceConnection() {
    this.apiSubscriptions.push(
      this.applicationService.deleteServiceConnection(this.selectedServiceConnectionForDelete.id).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Delete Service Connection');
          this.isDeleteUserAPILoadig = false;
          this.onCloseModal();
          this.getAllServiceConnections();
        },
        (error) => {
          this.toasterService.showError(error.message, 'Delete Service Connection');
          this.isDeleteUserAPILoadig = false;
        }
      )
    );
  }

  onCloseCreateUserModal() {
    $('#createUserModal').modal('hide');
    this.addConnectionObj = undefined;
    this.addServiceConnectionForm.reset();
    this.connectionType = undefined;
    this.webhookKeyValue = [];
  }
  onConnectionTypeChange(event, userObj?) {
    if (event) {
      this.connectionType = event;
      this.serviceConnectionsObj.type = event.replace(/ /g, '');
      if (event === 'Service Bus') {
        this.serviceConnectionsObj.type = 'Servicebus';
      }
    }
    if (this.connectionType === 'Service Bus') {
      this.addServiceConnectionForm.removeControl('endpoint');
      this.addServiceConnectionForm.removeControl('keyValue');
      this.addServiceConnectionForm.removeControl('connection_string');
      this.addServiceConnectionForm.addControl('endpoint', new FormControl("", [Validators.required, Validators.minLength(4), Validators.maxLength(50)]));
      this.addServiceConnectionForm.addControl('connection_string', new FormControl(userObj && userObj?.config && userObj?.config?.connection_string ? userObj.config.connection_string : "", [Validators.required
        , Validators.pattern(CONSTANTS.DEFAULT_SERVICE_BUS_CONNECTION_SETRING_REGEX)
      ]));
    }
    else {
      if (this.connectionType === 'Microsoft Teams') {
        this.addServiceConnectionForm.removeControl('keyValue');
        this.addServiceConnectionForm.removeControl('endpoint');
        this.addServiceConnectionForm.removeControl('connection_string');
        this.addServiceConnectionForm.addControl('endpoint', new FormControl(null, [Validators.required
          , Validators.pattern(CONSTANTS.DEFAULT_MICROSOFT_TEAMS_ENDPOINT_REGEX)
        ]));
      }
      else {
        if (this.connectionType === 'Webhook' || userObj?.type === 'Webhook') {
          this.addServiceConnectionForm.removeControl('endpoint');
          this.addServiceConnectionForm.removeControl('connection_string');
          this.addServiceConnectionForm.addControl('endpoint', new FormControl(null, [Validators.required
            , Validators.pattern(CONSTANTS.DEFAULT_WEBHOOK_ENDPOINT_REGEX)
          ]));
        }
      }
    }
  }
  webhookKeyValue: any[] = [];
  addHttpHeader() {
    this.webhookKeyValue.push({
      key: undefined,
      value: undefined
    })
  }
  removeHttpHeader(index) {
    this.webhookKeyValue.splice(index, 1);
    this.disableKey = false;
    this.disableValue = false;
  }

  on_connection_string() {
  }
  disableKey = false;
  disableValue = false;
  allKeyValues: any[];
  keyValue: { [key: string]: string } = {};
  onCreateServiceConnection() {
    this.serviceConnectionsObj.name = this.addServiceConnectionForm.value.name;
    this.serviceConnectionsObj.config = {};
    if (this.connectionType === 'Service Bus') {
      this.serviceConnectionsObj.endpoint = this.addServiceConnectionForm.value.endpoint;
      this.serviceConnectionsObj.config.connection_string = this.addServiceConnectionForm.value.connection_string;
    }
    else {
      if (this.connectionType === 'Microsoft Teams') {
        this.serviceConnectionsObj.endpoint = this.addServiceConnectionForm.value.endpoint;
      }
      else {
        this.serviceConnectionsObj.endpoint = this.addServiceConnectionForm.value.endpoint;
        if (this.webhookKeyValue.length > 0) {
          let flag = 0;
          for (let i = 0; i < this.webhookKeyValue.length; i++) {
            if (this.webhookKeyValue[i].key !== undefined && this.webhookKeyValue[i].value !== undefined && this.webhookKeyValue[i].key !== null && this.webhookKeyValue[i].value !== null) {
              flag++;
              this.keyValue[this.webhookKeyValue[i].key] = this.webhookKeyValue[i].value;
            }
            else {
              this.toasterService.showError("Please fill all the key value pairs", 'Create Service Connection');
              break;
            }
          }
          if (flag !== 0 && this.webhookKeyValue.length === flag) {
            this.serviceConnectionsObj.config = this.keyValue;
          }
        }
      }
    }

    if (this.addServiceConnectionForm.valid) {
      this.isCreateUserAPILoading = true;
      let apiResponse = this.addConnectionObj && this.addConnectionObj.id ? this.applicationService.updateServiceConnection(this.serviceConnectionsObj, this.addConnectionObj.id) : this.applicationService.createServiceConnection(this.serviceConnectionsObj);

      this.apiSubscriptions.push(
        apiResponse.subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, this.addConnectionObj?.id ? 'Update Service Connection' : 'Create Service Connection');
            this.isCreateUserAPILoading = false;
            this.onCloseCreateUserModal();
            this.getAllServiceConnections();
          },
          (error) => {
            this.toasterService.showError(error.message, this.addConnectionObj?.id ? 'Update Service Connection' : 'Create Service Connection');
            this.isCreateUserAPILoading = false;
          }
        )
      );
    }
  }
}
