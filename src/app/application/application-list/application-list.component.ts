import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApplicationService } from './../../services/application/application.service';
import { environment } from 'src/environments/environment';
import { ToasterService } from './../../services/toaster.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css'],
})
export class ApplicationListComponent implements OnInit, OnDestroy {
  applications: any[] = [];
  partitionConfigs: any[] = [];
  isApplicationListLoading = false;
  isPartitionConfigLoading = false;
  isCreateAPILoading = false;
  blobSASToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  apiSubscriptions: Subscription[] = [];
  tableConfig: any;
  databaseTableConfig: any;
  selectedApp: any;
  createApplicationForm: FormGroup;
  isProvisioned: string = 'true';
  isAllprivilegeSelected: any = {};
  privilegeObj: any = {};
  privilegeGroups: any = {};
  appPrivilegeObj: any = {};
  roleId: number = 0;
  timezones = CONSTANTS.TIME_ZONES;
  loader:boolean =false;
  constructor(private applicationService: ApplicationService, private commonService:CommonService, private toasterService: ToasterService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.tableConfig = {
      type: 'Applications',
      is_table_data_loading: this.isApplicationListLoading,
      table_class: 'app-list-tableFixHead',
      no_data_message: '',
      data: [
        {
          header_name: 'App Name',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'app',
        },
        {
          header_name: 'Created Date',
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'local_created_date',
        },
        {
          header_name: 'Created By',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'created_by',
        },
        {
          header_name: 'Updated Date',
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'local_updated_date',
        },
        {
          header_name: 'Updated By',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'updated_by',
        },
        {
          header_name: 'Actions',
          key: undefined,
          data_type: 'button',
          btn_list: [
            {
              icon: 'fa fa-fw fa-edit',
              text: '',
              id: 'EditPrivilege',
              valueclass: '',
              tooltip: 'Edit Privilege',
            },
            {
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'View',
              valueclass: '',
              tooltip: 'View',
            },
            {
              icon: 'fa fa-fw fa-table',
              text: '',
              id: 'Partition',
              valueclass: '',
              tooltip: 'Database Partition',
            }
          ],
        }
      ],
    };
    this.searchApplications();

    this.databaseTableConfig = {
      type: 'Database Table Partition',
      is_table_data_loading: this.isPartitionConfigLoading,
      no_data_message: '',
      data: [
        {
          header_name: 'Table Name',
          value_type: 'string',
          data_type: 'text',
          data_key: 'table_name',
        },
        {
          header_name: 'Partition Column',
          value_type: 'string',
          data_type: 'text',
          data_key: 'partition_column',
        },
        {
          header_name: 'Partition Strategy Label',
          value_type: 'string',
          data_type: 'text',
          data_key: 'partition_strategy_label',
        },
        {
          header_name: 'Sub Partition Column',
          value_type: 'string',
          data_type: 'text',
          data_key: 'sub_partition_column',
        },
        {
          header_name: 'Sub Partition Strategy Label',
          value_type: 'string',
          data_type: 'text',
          data_key: 'sub_partition_strategy_label',
        },
      ],
    };
  }

  searchApplications() {
    if (this.isProvisioned === "false") {
      this.tableConfig = {
        type: 'Applications',
        is_table_data_loading: this.isApplicationListLoading,
        table_class: 'app-list-tableFixHead',
        no_data_message: '',
        data: [
          {
            header_name: 'App Name',
            is_display_filter: true,
            value_type: 'string',
            is_sort_required: true,
            fixed_value_list: [],
            data_type: 'text',
            data_key: 'app',
          },
          {
            header_name: 'Created Date',
            value_type: 'string',
            is_sort_required: true,
            fixed_value_list: [],
            data_type: 'text',
            data_key: 'local_created_date',
          },
          {
            header_name: 'Created By',
            is_display_filter: true,
            value_type: 'string',
            is_sort_required: true,
            fixed_value_list: [],
            data_type: 'text',
            data_key: 'created_by',
          },
          {
            header_name: 'Updated Date',
            value_type: 'string',
            is_sort_required: true,
            fixed_value_list: [],
            data_type: 'text',
            data_key: 'local_updated_date',
          },
          {
            header_name: 'Updated By',
            is_display_filter: true,
            value_type: 'string',
            is_sort_required: true,
            fixed_value_list: [],
            data_type: 'text',
            data_key: 'updated_by',
          },
          {
            header_name: 'Actions',
            key: undefined,
            data_type: 'button',
            btn_list: [
              {
                icon: 'fa fa-fw fa-edit',
                text: '',
                id: 'EditPrivilege',
                valueclass: '',
                tooltip: 'Edit Privilege',
              },
              {
                icon: 'fa fa-fw fa-eye',
                text: '',
                id: 'View',
                valueclass: '',
                tooltip: 'View',
              },
              {
                icon: 'fa fa-fw fa-table',
                text: '',
                id: 'Partition',
                valueclass: '',
                tooltip: 'Database Partition',
              },
              {
                icon: 'fab fa-mixcloud',
                text: '',
                id: 'Un Provision',
                valueclass: '',
                tooltip: 'Move to Provision',
              }
            
            ],
          }
        ],
      };
    }
    else {
      this.tableConfig = {
        type: 'Applications',
        is_table_data_loading: this.isApplicationListLoading,
        table_class: 'app-list-tableFixHead',
        no_data_message: '',
        data: [
          {
            header_name: 'App Name',
            is_display_filter: true,
            value_type: 'string',
            is_sort_required: true,
            fixed_value_list: [],
            data_type: 'text',
            data_key: 'app',
          },
          {
            header_name: 'Created Date',
            value_type: 'string',
            is_sort_required: true,
            fixed_value_list: [],
            data_type: 'text',
            data_key: 'local_created_date',
          },
          {
            header_name: 'Created By',
            is_display_filter: true,
            value_type: 'string',
            is_sort_required: true,
            fixed_value_list: [],
            data_type: 'text',
            data_key: 'created_by',
          },
          {
            header_name: 'Updated Date',
            value_type: 'string',
            is_sort_required: true,
            fixed_value_list: [],
            data_type: 'text',
            data_key: 'local_updated_date',
          },
          {
            header_name: 'Updated By',
            is_display_filter: true,
            value_type: 'string',
            is_sort_required: true,
            fixed_value_list: [],
            data_type: 'text',
            data_key: 'updated_by',
          },
          {
            header_name: 'Actions',
            key: undefined,
            data_type: 'button',
            btn_list: [
              {
                icon: 'fa fa-fw fa-edit',
                text: '',
                id: 'EditPrivilege',
                valueclass: '',
                tooltip: 'Edit Privilege',
              },
              {
                icon: 'fa fa-fw fa-eye',
                text: '',
                id: 'View',
                valueclass: '',
                tooltip: 'View',
              },
              {
                icon: 'fa fa-fw fa-table',
                text: '',
                id: 'Partition',
                valueclass: '',
                tooltip: 'Database Partition',
              }
            ],
          },
          {
            header_name: 'Monitoring',
            key: undefined,
            data_type: 'button',
            btn_list: [
              {
                icon: 'fas fa-desktop',
                text: '',
                id: 'Button',
                valueclass: '',
                // tooltip: 'Edit Privilege',
              },

            ],
          }
        ],
      };
    }
    this.isApplicationListLoading = true;
    this.tableConfig.is_table_data_loading = true;
    this.applications = [];
    const obj = {
      environment: environment.environment,
      provisioned: this.isProvisioned
    };
    this.apiSubscriptions.push(
      this.applicationService.getApplications(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.applications = response.data;
          }
          this.isApplicationListLoading = false;
          this.tableConfig.is_table_data_loading = false;
        },
        () => {
          this.isApplicationListLoading = false;
          this.tableConfig.is_table_data_loading = false;
        }
      )
    );
  }

  onTableFunctionCall(obj) {
    if (obj.for === 'View') {
      this.onOpenViewIconModal(obj.data);
    }
    else if (obj.for === 'Button') {
      this.openGatewayMonitoring(obj.data);
    }
    else if (obj.for === 'Partition') {
      this.openPartitionIconModal(obj.data);
    }
    else if (obj.for === 'EditPrivilege') {
      this.roleId = 0;
      this.privilegeObj = {};
      this.privilegeGroups = {};
      this.appPrivilegeObj = {};
      this.getAppPriviledges(obj.data);
      this.getAllPriviledges(obj.data);
      this.isCreateAPILoading = false;
    }else if (obj.for === 'Un Provision'){
      this.selectedApp = obj.data.app;
        this.calldbschema();
    }
  }

  calldbschema() {
      this.applicationService.getdbschema(this.selectedApp).subscribe((response: any) => {
        this.toasterService.showSuccess(response.message, 'Schema Created');
        this.searchApplications();


    
    },
      (error) => this.loader = false)
  }



  onValidateLength(obj) {
    return Object.keys(obj).length > 0;
  }

  onCheckboxValueChange() {
    const dbGroup = this.createApplicationForm.get('metadata')?.get('db_info') as FormGroup;
    const metadataTelemetryGroup = this.createApplicationForm
      .get('metadata')
      ?.get('partition')
      ?.get('telemetry') as FormGroup;
    if (
      !this.createApplicationForm.value?.metadata.app_specific_schema &&
      !this.createApplicationForm.value?.metadata.app_specific_db &&
      !this.createApplicationForm.value?.metadata.app_telemetry_specific_schema
    ) {
      metadataTelemetryGroup.patchValue({
        partition_strategy: null,
        sub_partition_strategy: null,
      });
    }
    const metadataAlertGroup = this.createApplicationForm
      .get('metadata')
      ?.get('partition')
      ?.get('alert') as FormGroup;
    if (
      !this.createApplicationForm.value?.metadata.app_specific_schema &&
      !this.createApplicationForm.value?.metadata.app_specific_db &&
      !this.createApplicationForm.value?.metadata.app_telemetry_specific_schema
    ) {
      metadataAlertGroup.patchValue({
        partition_strategy: null
      });
    }
    if (this.createApplicationForm.value?.metadata?.app_specific_db) {
      dbGroup.addControl('default', new FormControl(true));
      dbGroup.addControl('host_name', new FormControl(null, [Validators.required]));
      dbGroup.addControl('user_name', new FormControl(null, [Validators.required]));
      dbGroup.addControl('database_name', new FormControl(null, [Validators.required]));
      dbGroup.addControl('port', new FormControl(null, [Validators.required]));
    } else {
      dbGroup.addControl('default', new FormControl(false));
      dbGroup.removeControl('host_name');
      dbGroup.removeControl('user_name');
      dbGroup.removeControl('database_name');
      dbGroup.removeControl('port');
    }
  }
  onShemaValueChange() {
    const dbGroup = this.createApplicationForm.get('metadata')?.get('schema_info') as FormGroup;
    if (this.createApplicationForm.value?.metadata?.app_specific_schema) {
      dbGroup.addControl('default', new FormControl(true));
      dbGroup.addControl('schema_name', new FormControl(null,[Validators.required]));
    } else {
      dbGroup.addControl('default', new FormControl(false));
      dbGroup.removeControl('schema_name');
    }
  }
  onTelemetryShemaValueChange() {
    const dbGroup = this.createApplicationForm.get('metadata')?.get('telemetry_schema_info') as FormGroup;
    if (this.createApplicationForm.value?.metadata?.app_telemetry_specific_schema) {
      dbGroup.addControl('default', new FormControl(true));
      dbGroup.addControl('schema_name', new FormControl(null,[Validators.required]));
    } else {
      dbGroup.addControl('default', new FormControl(false));
      dbGroup.removeControl('schema_name');
    }
  }

  getAllPriviledges(app = undefined) {
    return new Promise<void>((resolve1, reject) => {
      this.apiSubscriptions.push(
        this.applicationService.getAllPriviledges().subscribe((response: any) => {
          if (response && response.data) {
            this.privilegeObj['add'] = {};
            // Note : Set Privilege with api call    
            this.isAllprivilegeSelected['add'] = true;
            this.privilegeObj['add'].privileges = JSON.parse(JSON.stringify(response.data.Priviledges));
            this.privilegeGroups = response.data.PrivilegeGroup;
            this.onPrivilegeSelection('add', app === undefined ? false : true);
            if (app !== undefined && Object.keys(this.privilegeGroups).length > 0 && Object.keys(this.appPrivilegeObj).length > 0) {
              this.onOpenModal('editPrivilegeModal', app);
            }
            resolve1();
          }
        })
      );
    });
  }
  getAppPriviledges(app) {
    return new Promise<void>((resolve1, reject) => {
      this.apiSubscriptions.push(
        this.applicationService.getAppPriviledges(app.app).subscribe((response: any) => {
          if (response && response.data) {
            this.roleId = response.data.Priviledges[0].id;
            this.appPrivilegeObj = JSON.parse(JSON.stringify(response.data.Priviledges[0].privileges));
            if (Object.keys(this.privilegeGroups).length > 0 && Object.keys(this.appPrivilegeObj).length > 0) {
              this.onOpenModal('editPrivilegeModal', app);
            }
            resolve1();
          }
        })
      );
    });
  }

  onTimeZoneChange() {
    const dbGroup = this.createApplicationForm.get('metadata') as FormGroup;
    let formControl = dbGroup.get('time_zone');
    const formTimeZoneControl = dbGroup.get('time_zone_hours');
    if (!formControl) {
      dbGroup.addControl('time_zone', new FormControl(0));
    }
    let positiveNegative = formTimeZoneControl.value.charAt(0);
    let timeZoneValue = formTimeZoneControl.value.substring(1);
    var a = timeZoneValue.split(':');
    let minutes = (+a[0]) * 60 + (+a[1]);
    if (positiveNegative == '-') {
      minutes *= -1;
    }
    formControl = dbGroup.get('time_zone');
    formControl.setValue(minutes);
  }

  openCreateAppModal() {
    this.getAllPriviledges();
    this.appPrivilegeObj = undefined;
    this.createApplicationForm = new FormGroup({
      app: new FormControl(null, [Validators.required, Validators.pattern(CONSTANTS.ONLY_NOS_AND_CHARS)]),
      admin_name: new FormControl(null, [Validators.required]),
      admin_email: new FormControl(null, [Validators.required, Validators.pattern(CONSTANTS.EMAIL_REGEX)]),
      metadata: new FormGroup({
        customer: new FormGroup({
          name: new FormControl(null),
          address: new FormControl(null),
        }),
        time_zone_hours: new FormControl(null, [Validators.required]),
        description: new FormControl(null),
        app_specific_db: new FormControl(false),
        db_info: new FormGroup({ default: new FormControl(false) }),
        schema_info: new FormGroup({ default: new FormControl(false) }),
        telemetry_schema_info: new FormGroup({ default: new FormControl(false) }),
        app_specific_schema: new FormControl(false),
        app_telemetry_specific_schema: new FormControl(false),
        partition: new FormGroup({
          telemetry: new FormGroup({
            partition_strategy: new FormControl(null),
            sub_partition_strategy: new FormControl(null),
          }),
          alert: new FormGroup({
            partition_strategy: new FormControl(null)
          }),
        }),
        partition_detach: new FormControl(true),
        partition_delete: new FormControl(true),
        backup_required: new FormControl(false),
        maintenance_required:new FormControl(false)
      })
    });
    $('#createAppModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onOpenViewIconModal(app) {
    this.selectedApp = app;
    $('#viewAppIconModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }
  onOpenModal(modelId, app) {
    this.selectedApp = app;
    $('#' + modelId).modal({ backdrop: 'static', keyboard: false, show: true });
  }
  openPartitionIconModal(app) {
    this.selectedApp = app;
    this.databasePartitionConfig();
    $('#viewPartitionIconModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openGatewayMonitoring(app) {

    this.router.navigate(['gateway-monitoring'], {
      relativeTo: this.route, queryParams: {
        appName: app.app
      }
    })
  }

  onCloseCreateAppModal(modalId) {
    $('#' + modalId).modal('hide');
    if (modalId === 'createAppModal') {
      this.createApplicationForm.reset();
    }
  }

  checkDatabaseConfigOption(a, b, c) {
    if (a && !b && !c) return true;
    if (!a && b && !c) return true;
    if (!a && !b && c) return true;
    return false;
  }

  databasePartitionConfig() {
    this.isPartitionConfigLoading = true;
    this.databaseTableConfig.is_table_data_loading = true;
    this.partitionConfigs = [];
    const obj = {
      app: this.selectedApp.app,
    };
    this.apiSubscriptions.push(
      this.applicationService.getDatabasePartition(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.partitionConfigs = response.data;
          }
          this.isPartitionConfigLoading = false;
          this.databaseTableConfig.is_table_data_loading = false;
        },
        () => {
          this.isPartitionConfigLoading = false;
          this.databaseTableConfig.is_table_data_loading = false;
        }
      )
    );
  }

  async createApp() {
    const applicationDetail = this.createApplicationForm.value;
    // if (!applicationDetail.metadata.description) {
    //   applicationDetail.metadata.description = 'App Description';
    // }
    if (
      !applicationDetail.metadata.app_specific_schema &&
      !applicationDetail.metadata.app_specific_db &&
      !applicationDetail.metadata.app_telemetry_specific_schema
    ) {
      applicationDetail.metadata.partition.telemetry.partition_strategy = 'asset_id';
      applicationDetail.metadata.partition.telemetry.sub_partition_strategy = 'weekly';
    }
    if (
      this.checkDatabaseConfigOption(
        applicationDetail.metadata.app_specific_schema,
        applicationDetail.metadata.app_specific_db,
        applicationDetail.metadata.app_telemetry_specific_schema
      )
    ) {
      this.toasterService.showWarning(
        UIMESSAGES.MESSAGES.APP_CREATE_DB_CONFIG_WARNING,
        UIMESSAGES.MESSAGES.APP_CREATE_DB_CONFIG
      );
    }
    this.isCreateAPILoading = true;
    applicationDetail.metadata.db_info.default = !this.createApplicationForm.value?.metadata?.app_specific_db;
    applicationDetail.metadata.schema_info.default = !this.createApplicationForm.value?.metadata?.app_specific_schema;
    applicationDetail.metadata.telemetry_schema_info.default = !this.createApplicationForm.value?.metadata?.app_telemetry_specific_schema;
    applicationDetail.dashboard_config = {
      show_live_widgets: true,
    };
    applicationDetail.hierarchy = {
      levels: ['App'],
      tags: {},
    };
    applicationDetail.roles = [
      {
        role: 'App Admin',
        level: 0,
        privileges: this.privilegeObj?.add?.privileges,
      },
    ];
    const env = environment.environment;
    if (env) {
      applicationDetail.environment = env;
    }
    applicationDetail.dashboard_config = {};
    applicationDetail.dashboard_config.show_historical_widgets = false;
    applicationDetail.dashboard_config.show_live_widgets = true;

    applicationDetail.menu_settings = {
      main_menu: [],
      asset_control_panel_menu: [],
      model_control_panel_menu: [],
      gateway_control_panel_menu: [],
      legacy_asset_control_panel_menu: [],
      miscellaneous_menu: [],
    };

    const methodToCall = this.applicationService.createApp(applicationDetail);
    if (methodToCall) {
      this.apiSubscriptions.push(
        methodToCall.subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Create App');
            this.onCloseCreateAppModal('createAppModal');
            this.searchApplications();
            this.isCreateAPILoading = false;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Create App');
            this.isCreateAPILoading = false;
          }
        )
      );
    }
  }
  async updatePrivilege() {
    let priviledges = { privileges: this.privilegeObj?.add?.privileges };
    this.isCreateAPILoading = true;
    const methodToCall = this.applicationService.updatePrivilege(this.selectedApp.app, this.roleId, priviledges);
    if (methodToCall) {
      this.apiSubscriptions.push(
        methodToCall.subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Create App');
            this.onCloseCreateAppModal('editPrivilegeModal');
            this.searchApplications();
            this.isCreateAPILoading = false;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Create App');
            this.isCreateAPILoading = false;
          }
        )
      );
    }
  }
  onPrivilegeSelection(index, initialLoad = false) {
    let count = 0;
    Object.keys(this.privilegeObj[index].privileges).forEach((privilege) => {
      if (initialLoad && this.appPrivilegeObj !== undefined) {
        this.SetPreloadPrivilegeOfApp(privilege, index, count);
        if (this.privilegeObj[index].privileges[privilege].enabled)
          count++;
      }
      else {
        if (this.privilegeObj[index].privileges[privilege].enabled) {
          count++;
        }
      }
    });
    if (count === Object.keys(this.privilegeObj[index].privileges).length) {
      this.isAllprivilegeSelected[index] = true;
    } else {
      this.isAllprivilegeSelected[index] = false;
    }
  }
  private SetPreloadPrivilegeOfApp(privilege: string, index: any, count: number) {
    if (this.appPrivilegeObj.hasOwnProperty(privilege)) {
      this.privilegeObj[index].privileges[privilege].enabled = this.appPrivilegeObj[privilege].enabled;
    }
    else
      this.privilegeObj[index].privileges[privilege].enabled = true;
  }

  onClickOfAllCheckbox(index) {
    if (this.isAllprivilegeSelected[index]) {
      Object.keys(this.privilegeObj[index].privileges).forEach((privilege) => (this.privilegeObj[index].privileges[privilege].enabled = true));
    } else {
      Object.keys(this.privilegeObj[index].privileges).forEach((privilege) => (this.privilegeObj[index].privileges[privilege].enabled = false));
    }
  }
  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
