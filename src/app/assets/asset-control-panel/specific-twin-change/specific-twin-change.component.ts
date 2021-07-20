import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { CommonService } from 'src/app/services/common.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';

@Component({
  selector: 'app-specific-twin-change',
  templateUrl: './specific-twin-change.component.html',
  styleUrls: ['./specific-twin-change.component.css']
})
export class SpecificTwinChangeComponent implements OnInit {

  @Input() pageType: any;
  @Input() asset: Asset = new Asset();
  userData: any;
  displayType: string;
  listName: string;
  appName: string;
  apiSubscriptions: Subscription[] = [];
  controlWidgets: any[] = [];
  selectedWidget: any;
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private assetModelService: AssetModelService,
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.displayType = 'compose';
    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.listName = params.get('listName');
      this.listName = this.listName.slice(0, -1);
      if (this.pageType.includes('control')) {
        this.getControlWidgets();
      } else {
        this.getConfigureWidgets();
      }
    }));
  }

  getControlWidgets() {
    const obj = {
      app: this.appName,
      asset_model: this.asset.tags?.asset_model
    };
    this.apiSubscriptions.push(this.assetModelService.getThingsModelControlWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data.filter(widget => widget.metadata.communication_technique === 'Twin Change');
        }
      }
    ));
  }

  getConfigureWidgets() {
    const obj = {
      app: this.appName,
      asset_model: this.asset.tags?.asset_model
    };
    this.apiSubscriptions.push(this.assetModelService.getThingsModelConfigurationWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data.filter(widget => widget.metadata.communication_technique === 'Twin Change');
        }
      }
    ));
  }

}
