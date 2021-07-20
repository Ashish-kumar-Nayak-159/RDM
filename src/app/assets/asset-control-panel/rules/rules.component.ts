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
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {

  @Input() asset: Asset = new Asset();
  rules: any[] = [];
  rulesTableConfig: any;
  isRulesLoading = false;
  contextApp: any;
  subscriptions: Subscription[] = [];
  selectedTab: any;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.onTabClick('Cloud');
    this.rulesTableConfig = {
      type: 'Rules',
      headers: ['KPI Name', 'Description', 'Condition', 'Value'],
      data: [
        {
          name: 'Name',
          key: 'name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Code',
          key: 'code',
          type: 'text',
          headerClass: 'w-15',
          valueclass: ''
        },
        {
          name: 'Message',
          key: 'message',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Condition',
          key: 'condition',
          type: 'text',
          headerClass: '',
          valueclass: ''
        }
      ]
    };
  }
  onTabClick(type) {
    this.selectedTab = type;
    this.getRules();
  }

  getRules() {
    this.rules = [];
    this.isRulesLoading = true;
    const obj = {
      type: this.selectedTab
    };
    this.subscriptions.push(this.assetService.getRules(this.contextApp.app, this.asset.asset_id, obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.rules = response.data;
          console.log(this.rules);
        }
        this.isRulesLoading = false;
      }, error => this.isRulesLoading = false
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

