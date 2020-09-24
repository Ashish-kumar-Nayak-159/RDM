import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';

declare var $: any;
@Component({
  selector: 'app-device-type-list',
  templateUrl: './device-type-list.component.html',
  styleUrls: ['./device-type-list.component.css']
})
export class DeviceTypeListComponent implements OnInit {

  deviceTypes: any[] = [];
  deviceType: any;
  tableConfig: any;
  isFilterSelected = true;
  isDeviceTypeListLoading = false;
  userData: any;
  contextApp: any;
  deviceTypeFilterObj: any = {};
  isCreateDeviceTypeAPILoading = false;
  hierarchyDropdown: any[] = [];
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.deviceTypes = [
      {
        id: '1',
        name: 'Things Model 1',
        protocol: 'IP Device(SIM)',
        cloud_connectivity: 'IP Device -> Azure IOT Hub SDK -> SIM -> Cloud',
        manufacturer: 'Test',
        image: {
          url: '',
          name: ''
        },
        tags: {
          hierarchy: '',
          hierarchy_json: {},
          location_coordinates: '',
          device_manager: '',
          custom_tags: {}
        },
        properties: [
          {}
        ],
        created_by: 'Urvisha'
      }
    ];
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.contextApp = this.userData.apps.filter(
        app => app.app === params.get('applicationId')
      )[0];
      this.hierarchyDropdown = [];
      const keys = Object.keys(this.contextApp.user.hierarchy);
      this.contextApp.hierarchy.forEach(item => {
        if (item.level >= keys.length - 1 && item.name !== 'App') {
          this.hierarchyDropdown.push(item);
        }
      });
      const obj = {
        type: 'replace',
        data: [
          {
            title: this.contextApp.user.hierarchyString,
            url: 'applications/' + this.contextApp.app
          },
            {
              title: 'Things Modelling',
              url: 'applications/' + this.contextApp.app + '/' + 'things/model'
            }
        ]
      };
      this.commonService.breadcrumbEvent.emit(obj);
    });
    this.tableConfig = {
      type: 'Things Model',
      data: [
        {
          name: 'Model Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Template',
          key: 'cloud_connectivity',
          type: 'text',
          headerClass: 'w-10',
          valueclass: ''
        },
        {
          name: 'Created By',
          key: 'created_by',
          type: 'text',
          headerClass: 'w-30',
          valueclass: ''
        },
        {
          name: 'No of Devices inherited',
          key: 'name',
          type: 'text',
          headerClass: 'w-30',
          valueclass: ''
        },
        {
          name: 'Actions',
          key: undefined,
          type: 'button',
          headerClass: '',
          btnData: [
            {
              icon: 'fas fa-fw fa-table',
              text: '',
              id: 'View Control Panel',
              valueclass: '',
              tooltip: 'View Control panel'
            }
          ]
        }
      ]
    };
  }

  onTableFunctionCall(event) {}

  openCreateDeviceTypeModal() {
    this.deviceType = {};
    this.deviceType.tags = {};
    this.deviceType.tags.app = this.contextApp.app;
    this.deviceType.tags.hierarchy_json = JSON.parse(JSON.stringify(this.contextApp.user.hierarchy));
    $('#createDeviceTypeModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onCloseCreateDeviceModal() {
    $('#createDeviceTypeModal').modal('hide');
    this.deviceType = undefined;
  }

}
