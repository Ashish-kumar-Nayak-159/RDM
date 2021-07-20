import { AssetService } from './../../services/assets/asset.service';
import { CommonService } from './../../services/common.service';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { Asset } from 'src/app/models/asset.model';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})
export class ControlPanelComponent implements OnInit {
  componentState: string;
  constantData = CONSTANTS;
  subscriptions: Subscription[] = [];
  contextApp: any;
  asset: any;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private assetService: AssetService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.subscriptions.push(this.route.paramMap.subscribe(
      async params => {
        if (params.get('assetId')) {
          this.asset = new Asset();
          this.asset.asset_id = params.get('assetId');
          this.getAssetDetail();
          }
      }
    ));
  }

  async getAssetDetail() {
    let methodToCall;
    methodToCall = this.assetService.getAssetDetailById(this.contextApp.app, this.asset.asset_id);
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.asset = response;
        this.asset.gateway_id = this.asset.configuration?.gateway_id;
        this.componentState = this.asset.type;
      }
    ));
  }

}
