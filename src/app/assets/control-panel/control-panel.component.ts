import { AssetService } from './../../services/assets/asset.service';
import { CommonService } from './../../services/common.service';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css'],
})
export class ControlPanelComponent implements OnInit {
  componentState: string;
  constantData = CONSTANTS;
  subscriptions: Subscription[] = [];
  contextApp: any;
  asset: any;
  validAssets: any;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.validAssets = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSETS_LIST);
    if (this.validAssets == undefined) {
      const assetTypesObj = {
        hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
        type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET + ',' + CONSTANTS.IP_GATEWAY,
      };
      this.assetService.getIPAndLegacyAssets(assetTypesObj, this.contextApp.app).subscribe((response: any) => {
        if (response?.data)
          this.validAssets = response.data;
      })
    }
    this.subscriptions.push(
      this.route.paramMap.subscribe(async (params) => {
        if (params.get('assetId') && this.validAssets.length > 0) {
          let searchAsset = this.validAssets.filter(entry => { return entry.asset_id === params.get('assetId'); });
          if (searchAsset && searchAsset.length > 0) {
            this.asset = new Asset();
            this.asset.asset_id = params.get('assetId');
            this.getAssetDetail();
          }
          else {
            this.router.navigate(['applications', this.contextApp.app, 'assets']);
            this.toasterService.showError("You are not authorized to view this asset.", 'Asset');
          }
        }
      })
    );
  }

  async getAssetDetail() {
    let methodToCall;
    methodToCall = this.assetService.getAssetDetailById(this.contextApp.app, this.asset.asset_id);
    this.subscriptions.push(
      methodToCall.subscribe((response: any) => {
        this.asset = response;
        this.componentState = this.asset.type;
      })
    );
  }
}
