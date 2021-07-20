import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;

@Component({
  selector: 'app-derived-kpis',
  templateUrl: './derived-kpis.component.html',
  styleUrls: ['./derived-kpis.component.css']
})
export class DerivedKpisComponent implements OnInit {

  @Input() asset: Asset = new Asset();
  // @Input() componentState: any;
  // derivedKPIFilter: any = {};
  derivedKPIs: any[] = [];
  isderivedKPILoading = false;
  apiSubscriptions: Subscription[] = [];
  isFilterSelected = false;
  derivedKPITableConfig: any = {};
  contextApp: any;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    // this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    // if (this.asset.tags.category === CONSTANTS.IP_GATEWAY) {
    //   this.derivedKPIFilter.gateway_id = this.asset.asset_id;
    // } else {
    //   this.derivedKPIFilter.asset_id = this.asset.asset_id;
    // }
    // this.derivedKPIFilter.app = this.contextApp.app;
    this.derivedKPITableConfig = {
      type: 'derivedKPI',
      headers: ['KPI Name', 'Description', 'Condition', 'Value'],
      data: [
        {
          name: 'KPI Name',
          key: 'name',
        },
        {
          name: 'Description',
          key: 'message',
        },
        {
          name: 'Condition',
          key: 'condition'
        },
        {
          name: 'Value',
          key: 'kpi_result'
        }
      ]
    };
    // if (this.componentState === CONSTANTS.IP_GATEWAY) {
    //   this.derivedKPITableConfig.data.splice(2, 0, {
    //     name: 'Asset Name',
    //     key: 'asset_id'
    //   });
    // }
    this.getderivedKPIs();
  }

  getderivedKPIs() {
    this.isFilterSelected = true;
    this.isderivedKPILoading = true;
    this.apiSubscriptions.push(this.assetService.getDerivedKPIs(this.asset.app, this.asset.asset_id).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.derivedKPIs = response.data;
          console.log(this.derivedKPIs);
          }
          this.isderivedKPILoading = false;
        },
        error => this.isderivedKPILoading = false
    ));
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
