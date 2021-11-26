import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApplicationService } from './../../services/application/application.service';
import { environment } from 'src/environments/environment';
import { ToasterService } from './../../services/toaster.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
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
  isProvisioned : string = 'true';
  constructor(private applicationService: ApplicationService, private toasterService: ToasterService) {}

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
          header_name: 'Icons',
          key: undefined,
          data_type: 'button',
          btn_list: [
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
      this.openViewIconModal(obj.data);
    }
    if (obj.for === 'Partition') {
      this.openPartitionIconModal(obj.data);
    }
  }

  onCheckboxValueChange() {
    const dbGroup = this.createApplicationForm.get('metadata')?.get('database_settings') as FormGroup;
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
    console.log(this.createApplicationForm.value);
    if (this.createApplicationForm.value?.metadata?.app_specific_db) {
      dbGroup.addControl('host_name', new FormControl(null));
      dbGroup.addControl('user_name', new FormControl(null));
      dbGroup.addControl('database_name', new FormControl(null));
      dbGroup.addControl('port', new FormControl(null));
    } else {
      dbGroup.removeControl('host_name');
      dbGroup.removeControl('user_name');
      dbGroup.removeControl('database_name');
      dbGroup.removeControl('port');
    }
  }

  openCreateAppModal() {
    this.createApplicationForm = new FormGroup({
      app: new FormControl(null, [Validators.required, Validators.pattern(CONSTANTS.ONLY_NOS_AND_CHARS)]),
      admin_name: new FormControl(null, [Validators.required]),
      admin_email: new FormControl(null, [Validators.required, Validators.pattern(CONSTANTS.EMAIL_REGEX)]),
      metadata: new FormGroup({
        customer: new FormGroup({
          name: new FormControl(null),
          address: new FormControl(null),
        }),
        description: new FormControl(null),
        app_specific_db: new FormControl(false),
        database_settings: new FormGroup({}),
        app_specific_schema: new FormControl(false),
        app_telemetry_specific_schema: new FormControl(false),
        partition: new FormGroup({
          telemetry: new FormGroup({
            partition_strategy: new FormControl(null),
            sub_partition_strategy: new FormControl(null),
          }),
        }),
      }),
    });
    $('#createAppModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openViewIconModal(app) {
    this.selectedApp = app;
    $('#viewAppIconModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openPartitionIconModal(app) {
    this.selectedApp = app;
    console.log(this.selectedApp);
    this.databasePartitionConfig();
    $('#viewPartitionIconModal').modal({ backdrop: 'static', keyboard: false, show: true });
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
      applicationDetail.metadata.partition.telemetry.partition_strategy = 'Asset ID';
      applicationDetail.metadata.partition.telemetry.sub_partition_strategy = 'Weekly';
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
        privileges: CONSTANTS.DEFAULT_PRIVILEGES,
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

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
