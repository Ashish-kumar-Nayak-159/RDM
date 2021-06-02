import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-device-packages',
  templateUrl: './device-packages.component.html',
  styleUrls: ['./device-packages.component.css']
})
export class DevicePackagesComponent implements OnInit {

  @Input() device: any;
  packages: any[] = [];
  isPackagesAPILoading = false;
  subscriptions: Subscription[] = [];
  contextApp: any;
  constantData = CONSTANTS;
  packageTableConfig: any;
  constructor(
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.setUpPackageData();
    this.getPackages();
  }

  setUpPackageData() {
    this.packageTableConfig = {
      type: 'Packages',
      tableHeight: 'calc(100vh - 11rem)',
      data: [
        {
          name: 'Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Display Name',
          key: 'display_name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Version',
          key: 'version',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Actions',
          key: undefined,
          type: 'button',
          headerClass: '',
          btnData: [
            {
              icon: 'fa fa-fw fa-download',
              text: '',
              id: 'Download',
              valueclass: '',
              tooltip: 'Download'
            },

          ]
        }
      ]
    };
  }

  getPackages() {
    this.packages = [];
    this.isPackagesAPILoading = true;
    this.subscriptions.push(
      this.deviceTypeService.getPackages(this.contextApp.app, this.device.tags.device_type, {}).subscribe(
        (response: any) => {
          if (response.data?.length > 0) {
            this.packages = response.data;
          }
          this.isPackagesAPILoading = false;
        }
      )
    );

  }

}
