import { object } from '@amcharts/amcharts4/core';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import { countInterface } from './count-interface';
declare var $: any;
@Component({
  selector: 'app-application-gateway-monitoring',
  templateUrl: './application-gateway-monitoring.component.html',
  styleUrls: ['./application-gateway-monitoring.component.css']
})
export class ApplicationGatewayMonitoringComponent implements OnInit {
  isSelectedAppData = false;
  receivedAppName: string;
  isFilterSelected = false;
  historicalDateFilter: any = {};
  frequency: any;
  originalFilter: any;
  noOfRecords = CONSTANTS.NO_OF_RECORDS;
  appsList: any = []
  insideScrollFunFlag = false;
  currentOffset = 0;
  currentLimit = 10;
  selectedApp: string;
  hierarchyString: any;
  hierarchyArr: any = {};
  activeCircle = 'all';
  filterObj: any = {};
  assets: any[] = [];
  originalAssets: any[] = [];
  displayHierarchyString: any;
  contextApp: any;
  selectedOem: any = ""
  contextAppUserHierarchyLength = 0;
  configureHierarchy: any = {};
  isProvisioned: string = 'true';
  isApplicationListLoading = false;
  applications: any = [];
  tableConfig: any;
  loadMoreVisibility: boolean = true;
  CUSTOM_DATE_FORMAT = 'yyyy-MM-dd hh:mm:ss a';
  hierarchy: any;
  configuredHierarchy: any = {};
  userDataFromLocal: any;
  countData: countInterface = {
    iot_assets: 0,
    online: 0,
    offline: 0,
    total_telemetry: 0,
    day_telemetry: 0
  }
  loader = false;
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  constructor(private commonService: CommonService, private applicationService: ApplicationService,
    private route: ActivatedRoute, private changeDetector: ChangeDetectorRef) { }
  ngOnInit(): void {
    // this.loader = true;
    const userData = localStorage.getItem(CONSTANTS.USER_DETAILS);
    const selectedAppData = localStorage.getItem(CONSTANTS.SELECTED_APP_DATA);
    this.userDataFromLocal = JSON.parse(this.commonService.decryptString(userData))
    const obj = {
      environment: environment.environment,
      provisioned: this.isProvisioned
    };
    this.route.queryParams.subscribe((res) => {
      this.receivedAppName = res.appName
    })
    if (this.userDataFromLocal.is_super_admin) {
      this.applicationService.getApplications(obj).subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          let respData = response.data.map((item) => {
            return item.app
          })
          this.appsList = respData
          this.selectedApp = this.receivedAppName ? this.receivedAppName : respData[0];
          this.hierarchy = { App: this.selectedApp };
          this.getHierarchy();
          this.appName();
        }
        else { this.appsList = []; }
        // this.loader = false;
      },
        (error) => this.loader = false)
    }
    else if (selectedAppData && !this.userDataFromLocal.is_super_admin) {
      let appDataFromLocal = JSON.parse(this.commonService.decryptString(selectedAppData))
      this.selectedApp = appDataFromLocal.app
      this.appsList.push(this.selectedApp)
      this.appName();
    }
    setInterval(() => {
      this.appName()
    }, 1800000)
    this.tableConfig = {
      type: 'Applications',
      is_table_data_loading: this.isApplicationListLoading,
      table_class: 'table_class',
      no_data_message: '',
      data: [
        {
          header_name: 'Gateway Id',
          is_display_filter: true,
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'asset_id',
          //is_sort: true
        },
        {
          header_name: 'Name',
          is_display_filter: true,
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'name',
          //is_sort: true
        },
        {
          header_name: 'Status',
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'connection_state',
          value_class: '',
          data_tooltip: 'offline_since',
          data_cellclass: 'cssclass',
          //is_sort: true
        },
        {
          header_name: 'Ingestion Status',
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'ingestion_status',
          data_tooltip: 'last_ingestion_on',
          data_cellclass: 'ingestionCss'
        },
        {
          header_name: 'CreatedOn',
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'created_date',
          //is_sort: true,
          sort_by_key: 'created_date_time'
        },
        // {
        //   header_name: 'Icons',
        //   key: undefined,
        //   data_type: 'button',
        //   btn_list: [
        //     {
        //       icon: 'fa fa-fw fa-edit',
        //       text: '',
        //       id: 'EditPrivilege',
        //       valueclass: '',
        //       tooltip: 'Edit Privilege',
        //     },
        //     {
        //       icon: 'fa fa-fw fa-eye',
        //       text: '',
        //       id: 'View',
        //       valueclass: '',
        //       tooltip: 'View',
        //     },
        //     {
        //       icon: 'fa fa-fw fa-table',
        //       text: '',
        //       id: 'Partition',
        //       valueclass: '',
        //       tooltip: 'Database Partition',
        //     }
        //   ],
        // },
      ],
    };

  }

  getHierarchy() {
    if (this.userDataFromLocal.is_super_admin) {
      this.isSelectedAppData = false;
      localStorage.removeItem(CONSTANTS.SELECTED_APP_DATA);
      this.applicationService.getApplicationDetail(this.selectedApp).subscribe((response: any) => {
        response.app = this.selectedApp;
        response.user = {};
        response.user.hierarchy = { App: this.selectedApp };
        this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, response);
        let appObj = {
          app: this.selectedApp
        }
        this.applicationService.getExportedHierarchy(appObj).subscribe((response: any) => {
          this.commonService.setItemInLocalStorage(CONSTANTS.HIERARCHY_TAGS, response?.data);
          this.isSelectedAppData = true;
          this.changeDetector.detectChanges();
        })
      });
    }
    else {
      this.isSelectedAppData = true;
      this.changeDetector.detectChanges();
    }
  }
  appName() {
    this.applications = []
    this.loadMoreVisibility = true;
    this.currentOffset = 0;
    this.currentLimit = 10;
    if (this.selectedApp) {
      this.getHierarchy();
      this.hierarchy = { App: this.selectedApp };
      this.loadFromCache();
      this.assetStatic();
      this.assetMonitor()
    }
    else {
      this.isSelectedAppData = false;
      this.countData = {
        iot_assets: 0,
        online: 0,
        offline: 0,
        total_telemetry: 0,
        day_telemetry: 0
      };
      this.applications = []
    }
  }

  async loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    if (item) {
      this.hierarchyDropdown.updateHierarchyDetail(JSON.parse(JSON.stringify(item)));
      if (item?.hierarchy)
        this.hierarchy = item?.hierarchy;
    }
  }
  assetStatic() {
    this.loader = true;
    this.applicationService.getAssetStatistics(this.selectedApp).subscribe((response: any) => {
      this.countData = {
        iot_assets: response?.iot_assets ?? 0,
        online: response?.online ?? 0,
        offline: response?.offline ?? 0,
        total_telemetry: response?.total_telemetry ?? 0,
        day_telemetry: response?.day_telemetry ?? 0

      }
    }, (err) => { this.loader = false })
  }

  assetMonitor() {
    const custObj = {
      offset: this.currentOffset,
      count: this.currentLimit,
      hierarchy: JSON.stringify(this.hierarchy)
    }
    this.loader = true;
    this.applicationService.getAssetMonitoring(this.selectedApp, custObj).subscribe((response: any) => {
      response?.data?.forEach((item) => {
        item.created_date_time = item.created_date
        item.created_date = this.commonService.convertUTCDateToLocalDate(item.created_date);
        if (item.last_ingestion_on)
          item.last_ingestion_on = 'Last Ingestion On: ' + this.commonService.convertUTCDateToLocalDate(item.last_ingestion_on, "MMM dd, yyyy, HH:mm:ss aaaaa'm'");
        if (item.ingestion_status === "Stopped") {
          item.ingestionCss = "offline"
        }
        else {
          item.ingestionCss = "online"
        }
        if (item.connection_state == "Disconnected") {
          item.connection_state = "Offline"
          item.cssclass = "offline";
          if (item.offline_since) {
            item.offline_since = 'Offline Since: ' + this.commonService.convertUTCDateToLocalDate(item.offline_since, "MMM dd, yyyy, HH:mm:ss aaaaa'm'");
          }
        }
        else {
          item.connection_state = "Online"
          item.cssclass = "online";
          if (item.connection_state == "Online") {
            item.offline_since = undefined
          }
        }
        return item
      })
      if (response?.data?.length < this.currentLimit) {
        this.loadMoreVisibility = false
      }

      let mergedObject = [...this.applications, ...response.data];
      const unique = [...new Map(mergedObject.map(item => [item.asset_id, item])).values()];

      this.applications = unique;
      
      //Note: Searching on same function it will push the same data again and again of searched list
      // So i have added list, and returned only unique record,
      //Currently added for asset_id filter as unique.
      //this.applications = [...this.applications, ...response.data];
      
      this.loader = false;
    },
      (error) => this.loader = false)
  }
  onTableFunctionCall(obj) {
    // if (obj.for === 'View') {
    //   this.onOpenViewIconModal(obj.data);
    // }
    // else if (obj.for === 'Partition') {
    //   this.openPartitionIconModal(obj.data);
    // }
    // else if (obj.for === 'EditPrivilege') {
    //   this.roleId = 0;
    //   this.privilegeObj = {};
    //   this.privilegeGroups = {};
    //   this.appPrivilegeObj = {};
    //   this.getAppPriviledges(obj.data);
    //   this.getAllPriviledges(obj.data);
    //   this.isCreateAPILoading = false;
    // }
  }

  onSaveHierachy(configuredHierarchy) {
    this.originalFilter = {};
    this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
    if (this.filterObj.asset) {
      this.originalFilter.asset = JSON.parse(JSON.stringify(this.filterObj.asset));
      this.onChangeOfAsset();
    }
  }
  onClearHierarchy() {
    this.hierarchy = { App: this.selectedApp };
  }

  onChangeOfAsset() {
    const asset = this.assets.find((assetObj) => assetObj.asset_id === this.filterObj.asset.asset_id);
    const frequencyArr = [];
    frequencyArr.push(asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms || 60);
    frequencyArr.push(asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms || 120);
    frequencyArr.push(asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms || 180);
    this.frequency = this.commonService.getLowestValueFromList(frequencyArr);
    if (this.historicalDateFilter.from_date && this.historicalDateFilter.to_date) {
      const records = this.commonService.calculateEstimatedRecords(
        this.frequency,
        this.historicalDateFilter.from_date,
        this.historicalDateFilter.to_date
      );
      if (records > this.noOfRecords) {
        this.historicalDateFilter.isTypeEditable = true;
      } else {
        this.historicalDateFilter.isTypeEditable = false;
      }
    }
  }
  filteredHiearchyObj() {
    this.applications = [];
    this.currentOffset = 0;
    this.loadMoreVisibility = true;
    const configuredHierarchy = this.hierarchyDropdown.getConfiguredHierarchy();
    object.keys(configuredHierarchy).length === 0;
    this.onClearHierarchy();
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp) {
      Object.keys(configuredHierarchy).forEach((key) => {
        if (configuredHierarchy[key]) {
          this.hierarchy[this.contextApp.hierarchy.levels[key]] = configuredHierarchy[key];
        }
      });
    }
    this.assetMonitor();
  }
}