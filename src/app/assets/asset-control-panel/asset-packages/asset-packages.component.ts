import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-asset-packages',
  templateUrl: './asset-packages.component.html',
  styleUrls: ['./asset-packages.component.css'],
})
export class AssetPackagesComponent implements OnInit {
  @Input() asset: any;
  packages: any[] = [];
  isPackagesAPILoading = false;
  subscriptions: Subscription[] = [];
  contextApp: any;
  constantData = CONSTANTS;
  packageTableConfig: any;
  constructor(private assetModelService: AssetModelService, private commonService: CommonService) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.asset.type !== this.constantData.NON_IP_ASSET) {
      this.setUpPackageData();
      this.getPackages();
    } else {
      let assetItem;
      const assetDataItem = {};
      this.contextApp.menu_settings.main_menu.forEach((item) => {
        if (item.page === 'Assets') {
          assetItem = item.showAccordion;
        }
      });
      assetItem.forEach((item) => {
        assetDataItem[item.name] = item.value;
      });
      this.asset.local_type = assetDataItem['Legacy Asset'] || CONSTANTS.NON_IP_ASSET;
    }
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
          valueclass: '',
        },
        {
          name: 'Display Name',
          key: 'display_name',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Version',
          key: 'version',
          type: 'text',
          headerClass: '',
          valueclass: '',
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
              tooltip: 'Download',
            },
          ],
        },
      ],
    };
  }

  getPackages() {
    this.packages = [];
    this.isPackagesAPILoading = true;
    this.subscriptions.push(
      this.assetModelService
        .getPackages(this.contextApp.app, this.asset.tags.asset_model, {})
        .subscribe((response: any) => {
          if (response.data?.length > 0) {
            this.packages = response.data;
          }
          this.isPackagesAPILoading = false;
        })
    );
  }
}
