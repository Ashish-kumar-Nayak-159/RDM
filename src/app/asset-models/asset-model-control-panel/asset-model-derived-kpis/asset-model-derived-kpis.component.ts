import { Subscription } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';

@Component({
  selector: 'app-asset-model-derived-kpis',
  templateUrl: './asset-model-derived-kpis.component.html',
  styleUrls: ['./asset-model-derived-kpis.component.css'],
})
export class AssetModelDerivedKpisComponent implements OnInit {
  @Input() assetModel: any;
  derivedKPIs: any[] = [];
  derivedKPIsTableConfig: any;
  isDerivedKPIsLaoading = false;
  contextApp: any;
  subscriptions: Subscription[] = [];
  constructor(private assetModelService: AssetModelService, private commonService: CommonService) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.derivedKPIsTableConfig = {
      type: 'Derived KPIs',
      tableHeight: 'calc(100vh - 11rem)',
      freezed: this.assetModel.freezed,
      data: [
        {
          name: 'Code',
          key: 'code',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Name',
          key: 'name',
          type: 'text',
          headerClass: 'w-15',
          valueclass: '',
        },
        {
          name: 'Description',
          key: 'description',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'JSON Key',
          key: 'kpi_json_key',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
      ],
    };
    this.getDerivedKPIs();
  }

  getDerivedKPIs() {
    this.derivedKPIs = [];
    this.isDerivedKPIsLaoading = true;
    this.subscriptions.push(
      this.assetModelService.getDerivedKPIs(this.contextApp.app, this.assetModel.name).subscribe(
        (response: any) => {
          console.log(response);
          if (response?.data) {
            this.derivedKPIs = response.data;
          } else if (response?.derived_kpis) {
            this.derivedKPIs = response.derived_kpis;
          }
          this.isDerivedKPIsLaoading = false;
        },
        (error) => (this.isDerivedKPIsLaoading = false)
      )
    );
  }
}
