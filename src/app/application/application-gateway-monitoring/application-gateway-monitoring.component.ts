import { Component, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import { countInterface } from './count-interface';

@Component({
  selector: 'app-application-gateway-monitoring',
  templateUrl: './application-gateway-monitoring.component.html',
  styleUrls: ['./application-gateway-monitoring.component.css']
})

export class ApplicationGatewayMonitoringComponent implements OnInit {

  appsList: any = []
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
  countData: countInterface = {
    iot_assets: 0,
    online: 0,
    offline: 0,
    total_telemetry: 0,
    day_telemetry: 0
  }


  constructor(private commonService: CommonService, private applicationService: ApplicationService, private assetService: AssetService) { }

  ngOnInit(): void {

    const obj = {
      environment: environment.environment,
      provisioned: this.isProvisioned
    };
    this.applicationService.getApplications(obj).subscribe((response: any) => {
      if (response.data && response.data.length > 0) {
        console.log("get applications", response.data);
        var newArray: any = response.data.map((item) => {
          return item.app
        })
        this.appsList = newArray
        this.selectedApp = newArray[0];
        this.appName();
      }
      else
        this.appsList = [];
    })

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
        },
        {
          header_name: 'Name',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'name',
        },
        {
          header_name: 'Status',
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'status',
        },
        {
          header_name: 'Ingestion Status',
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'ingestion_status',
        },
        {
          header_name: 'CreatedOn',
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'created_date',
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


  appName() {
    console.log("select app name", this.selectedApp);
    if (this.selectedApp) {
      this.assetStatic(this.selectedApp);
      this.assetMonitor(this.selectedApp)
    }
    else {
      this.countData = {
        iot_assets: 0,
        online: 0,
        offline: 0,
        total_telemetry: 0,
        day_telemetry: 0
      };
      this.applications = [];
    }
  }

  assetStatic(appReceive) {
    this.applicationService.getAssetStatistics(appReceive).subscribe((response: any) => {
      console.log("gateway asset static api res...", response)
      this.countData = {
        iot_assets: response?.iot_assets ?? 0,
        online: response?.online ?? 0,
        offline: response?.offline ?? 0,
        total_telemetry: response?.total_telemetry ?? 0,
        day_telemetry: response?.day_telemetry ?? 0

      }
    })
  }

  assetMonitor(appReceive) {
    this.applicationService.getAssetMonitoring(appReceive).subscribe((response) => {
      console.log("gateway asset monitoring api res..", response);
      this.applications = []
      this.applications = response

    })
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

  onAssetFilterBtnClick() {
    $('.dropdown-menu .dropdown-open').on('click.bs.dropdown', (e) => {
      e.stopPropagation();
    });
    if (
      this.contextApp?.hierarchy?.levels?.length > 1 &&
      this.contextAppUserHierarchyLength !== this.contextApp?.hierarchy?.levels?.length
    ) {
      $('#dd-open').on('hide.bs.dropdown', (e: any) => {
        if (e.clickEvent && !e.clickEvent.target.className?.includes('searchBtn')) {
          e.preventDefault();
        }
      });
    }
  }


  async onChangeOfHierarchy(i, flag, persistAssetSelection = true) {
    this.selectedOem = this.configureHierarchy['1']
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach((key) => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.contextApp.hierarchy.tags;

    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }


    if (flag) {
      const hierarchyObj: any = { App: this.contextApp.app };

      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
        }
      });
      if (Object.keys(hierarchyObj).length === 1) {
        this.assets = JSON.parse(JSON.stringify(this.originalAssets));
      } else {
        const arr = [];
        this.assets = [];
        this.originalAssets.forEach((asset) => {
          let trueFlag = 0;
          let flaseFlag = 0;
          Object.keys(hierarchyObj).forEach((hierarchyKey) => {
            if (asset.hierarchy[hierarchyKey] && asset.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
              trueFlag++;
            } else {
              flaseFlag++;
            }
          });
          if (trueFlag > 0 && flaseFlag === 0) {
            arr.push(asset);
          }
        });
        this.assets = JSON.parse(JSON.stringify(arr));
      }
      if (this.assets?.length === 1) {
        this.filterObj.asset = this.assets[0];
      }
      if (persistAssetSelection) {
        this.filterObj.assetArr = undefined;
        this.filterObj.asset = undefined;
      }

    }
    let count = 0;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        count++;
      }
    });
    if (count === 0) {
      this.hierarchyArr = [];
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
    }


  }

  onSaveHierachy() {

    this.hierarchyString = this.contextApp.app;
    this.displayHierarchyString = this.contextApp.app;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        this.hierarchyString += ' > ' + this.configureHierarchy[key];
        this.displayHierarchyString = this.configureHierarchy[key];
      }
    });

  }

  onClearHierarchy() {

    this.hierarchyArr = {};
    this.configureHierarchy = {};
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }

    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        if (this.contextApp.user.hierarchy[level]) {
          this.onChangeOfHierarchy(index, false);
        }
      } else {
        this.assets = JSON.parse(JSON.stringify(this.originalAssets));
      }
    });
    this.hierarchyString = this.contextApp.app;
    this.displayHierarchyString = this.contextApp.app;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        this.hierarchyString += ' > ' + this.configureHierarchy[key];
        this.displayHierarchyString = this.configureHierarchy[key];
      }
    });
  }

  onAssetFilterApply(updateFilterObj = true) {

    this.activeCircle = 'all';

    this.onSaveHierachy();

    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
      pagefilterObj['hierarchy'] = this.configureHierarchy;
      pagefilterObj.hierarchy = { App: this.contextApp.app };
      pagefilterObj.dateOption = 'Last 30 Mins';
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          pagefilterObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
        }
      });
      this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
    }

  }

}
