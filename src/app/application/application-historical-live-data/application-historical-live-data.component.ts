import { Component, OnInit,ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-application-historical-live-data',
  templateUrl: './application-historical-live-data.component.html',
  styleUrls: ['./application-historical-live-data.component.css']
})
export class ApplicationHistoricalLiveDataComponent implements OnInit {
  isTelemetryDataLoading = false;
  assets: any[] = [];
  filterObj: any = {};
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  decodedToken: any;
  userData: any;
  defaultAppName = environment.app;
  contextApp: any;
  apiSubscriptions: Subscription[] = [];
  frequency: any;
  historicalDateFilter: any = {};
  noOfRecords = CONSTANTS.NO_OF_RECORDS;




  constructor(
    private commonService:CommonService,
    private assetService: AssetService
  ) { }

  async ngOnInit(): Promise<void> {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getAssets(this.contextApp.user.hierarchy);

  }
  getAssets(hierarchy) {
    return new Promise<void>((resolve1) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
      };
      this.apiSubscriptions.push(
        this.assetService.getIPAndLegacyAssets(obj, this.contextApp.app).subscribe((response: any) => {
          if (response?.data) {
            this.assets = response.data;
            if (this.assets?.length === 1) {
              this.filterObj.asset = this.assets[0];
              this.onChangeOfAsset();
            }
          }
          resolve1();
        })
      );
    });
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

  onClearHierarchy() {
  
  }

  onSaveHierachy() {

  }

}
