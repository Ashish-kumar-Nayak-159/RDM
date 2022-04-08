import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-application-gateway-monitoring',
  templateUrl: './application-gateway-monitoring.component.html',
  styleUrls: ['./application-gateway-monitoring.component.css']
})
export class ApplicationGatewayMonitoringComponent implements OnInit {
  
  isApplicationListLoading = false;
  applications: any[] = [];
  tableConfig: any;
   countData = {
    "iot_assets": 19,
    "online": 17,
    "offline": 2,
    "total_telemetry": 255,
    "day_telemetry": 56
    }
    
     

  constructor() { }

  ngOnInit(): void {
    this.tableConfig = {
      type: 'Applications',
      is_table_data_loading: this.isApplicationListLoading,
      table_class: 'app-list-tableFixHead',
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
          is_display_filter:true,
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
    this.applications =  [
      {
      "asset_id": "MobileTeamTestingZamp",
      "name": "MobileTeamTestingZamp",
      "status": "Enabled",
      "connection_state": "Disconnected",
      "created_by": "yashmochi@kemsys.com (Yash Mochi)",
      "created_date": "2022-03-07T10:19:22.531",
      "offline_since": "2022-04-07T13:38:13.3583015Z",
      "ingestion_status": "Stopped",
      "last_ingestion_on": "2022-04-07T13:37:53Z"
      },
      {
      "asset_id": "Prince_AHM_A01",
      "name": "Prince_AHM_A01",
      "status": "Enabled",
      "connection_state": "Disconnected",
      "created_by": "prince.kapadiya@kemsys.com (Prince)",
      "created_date": "2021-11-17T08:56:45.745",
      "offline_since": "2022-04-01T13:34:32.0714955Z",
      "ingestion_status": "Stopped",
      "last_ingestion_on": "2022-04-01T13:30:59Z"
      },
      {
      "asset_id": "AHM_Asset_105",
      "name": "AHM_Asset_105",
      "status": "Disabled",
      "connection_state": "Disconnected",
      "created_by": "yashmochi@kemsys.com (Yash Mochi)",
      "created_date": "2022-03-07T10:19:22.531",
      "offline_since": "2022-04-07T13:38:13.3583015Z",
      "ingestion_status": "Stopped",
      "last_ingestion_on": "2022-04-07T13:37:53Z"
      },
      {
      "asset_id": "AHM_Asset_108",
      "name": "AHM_Asset_108",
      "status": "Enabled",
      "connection_state": "Disconnected",
      "created_by": "yashmochi@kemsys.com (Yash Mochi)",
      "created_date": "2021-11-17T08:56:45.745",
      "offline_since": "2022-04-01T13:34:32.0714955Z",
      "ingestion_status": "Working",
      "last_ingestion_on": "2022-04-01T13:30:59Z"
      },
      {
        "asset_id": "Prince_SRT_S01",
        "name": "Prince_SRT_S01",
        "status": "Enabled",
        "connection_state": "Disconnected",
        "created_by": "prince.kapadiya@kemsys.com (Prince)",
        "created_date": "2021-11-17T08:56:45.745",
        "offline_since": "2022-04-01T13:34:32.0714955Z",
        "ingestion_status": "Working",
        "last_ingestion_on": "2022-04-01T13:30:59Z"
        },
      ]
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

}
