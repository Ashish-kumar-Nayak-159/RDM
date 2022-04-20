import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  countData: countInterface = {
    iot_assets: 0,
    online: 0,
    offline: 0,
    total_telemetry: 0,
    day_telemetry: 0
  }
  loader = false;
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;

  constructor(private commonService: CommonService, private applicationService: ApplicationService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // this.loader = true;

    const obj = {
      environment: environment.environment,
      provisioned: this.isProvisioned
    };

    this.route.queryParams.subscribe((res) => {
      this.receivedAppName = res.appName
    })

    this.applicationService.getApplications(obj).subscribe((response: any) => {
      if (response.data && response.data.length > 0) {
        debugger
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

      setInterval(()=>{
          this.appName()
      },120000) //

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
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'asset_id',
          is_sort: true
        },
        {
          header_name: 'Name',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'name',
          is_sort: true
        },
        {
          header_name: 'Status',
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'connection_state',
          value_class: '',
          data_tooltip: 'offline_since',
          data_cellclass: 'cssclass',
          is_sort: true
        },
        {
          header_name: 'Ingestion Status',
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'ingestion_status',
          data_tooltip: 'last_ingestion_on',
          data_cellclass: 'ingestionCss'
        },
        {
          header_name: 'CreatedOn',
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'created_date',
          is_sort: true,
          sort_by_key:'created_date_time'
        },
        // {
        //   header_name: 'Icons',
        //   key: undefined,
        //   data_type: 'button',
        //   btn_list: [
        //     {
        //       icon: 'fa fa-fw fa-edit',
        //       text: '',
        //       id: 'EditPrivilege',
        //       valueclass: '',
        //       tooltip: 'Edit Privilege',
        //     },
        //     {
        //       icon: 'fa fa-fw fa-eye',
        //       text: '',
        //       id: 'View',
        //       valueclass: '',
        //       tooltip: 'View',
        //     },
        //     {
        //       icon: 'fa fa-fw fa-table',
        //       text: '',
        //       id: 'Partition',
        //       valueclass: '',
        //       tooltip: 'Database Partition',
        //     }
        //   ],
        // },
      ],
    };

  }

  getHierarchy() {
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
        this.commonService.setItemInLocalStorage(CONSTANTS.HIERARCHY_TAGS, response);
        this.isSelectedAppData = true;
      })
    });
  }
  appName() {
    this.applications = []
    this.loadMoreVisibility = true
    this.currentOffset = 0;
    this.currentLimit = 10;
    if (this.selectedApp) {
      this.getHierarchy();
      this.hierarchy = { App: this.selectedApp };
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


  assetStatic() {
    this.loader = true;
    this.applicationService.getAssetStatistics(this.selectedApp).subscribe((response: any) => {
      console.log("gateway asset static api res...", response)
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
      // hierarchy: JSON.stringify({"App":"Indygo","ManagementCompany":"IndyGo","Client":"Kumo-India","Location":"Ahmedabad"}),
      hierarchy: JSON.stringify(this.hierarchy)
      // {App:Indygo,Management}
    }
    this.loader = true;
    this.applicationService.getAssetMonitoring(this.selectedApp, custObj).subscribe((response: any) => {

      console.log("gateway asset monitoring api res..", response);
      response.forEach((item) => {

        item.created_date_time = item.created_date
        item.created_date = this.commonService.convertUTCDateToLocalDate(item.created_date);
        
        if (item.last_ingestion_on)
          item.last_ingestion_on = 'Last Ingestion On: ' + this.commonService.convertUTCDateToLocalDate(item.last_ingestion_on);

        if (item.ingestion_status === "Stopped") {
          item.ingestionCss = "offline"
        }
        else {
          item.ingestionCss = "online"
        }

        if (item.connection_state == "Disconnected") {
          item.connection_state = "Offline"
          item.cssclass = "offline";
          if(item.offline_since){
            item.offline_since = 'Offline Since: ' + this.commonService.convertUTCDateToLocalDate(item.offline_since);
          }
        }
        else {
          item.connection_state = "Online"
          item.cssclass = "online";
          if(item.connection_state == "Online"){
            item.offline_since = undefined
          }
        }
        return item
      })
      if (response.length < 10) {
        this.loadMoreVisibility = false
      }

      this.applications = [...this.applications, ...response]
      this.loader = false;
    },
      (error) => this.loader = false)
  }



  onTableFunctionCall(obj) {
    // if (obj.for === 'View') {
    //   this.onOpenViewIconModal(obj.data);
    // }
    // else if (obj.for === 'Partition') {
    //   this.openPartitionIconModal(obj.data);
    // }
    // else if (obj.for === 'EditPrivilege') {
    //   this.roleId = 0;
    //   this.privilegeObj = {};
    //   this.privilegeGroups = {};
    //   this.appPrivilegeObj = {};
    //   this.getAppPriviledges(obj.data);
    //   this.getAllPriviledges(obj.data);
    //   this.isCreateAPILoading = false;
    // }
  }

  onSaveHierachy(configuredHierarchy) {
    console.log("checking", JSON.stringify(configuredHierarchy))
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
      // this.onChangeOfAsset(this.filterObj.asset);
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
    debugger
    this.applications = [];
    this.currentOffset = 0;
    this.loadMoreVisibility = true;
    const configuredHierarchy = this.hierarchyDropdown.getConfiguredHierarchy();
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
