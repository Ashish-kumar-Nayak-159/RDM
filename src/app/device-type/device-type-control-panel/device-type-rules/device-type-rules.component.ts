import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';

@Component({
  selector: 'app-device-type-rules',
  templateUrl: './device-type-rules.component.html',
  styleUrls: ['./device-type-rules.component.css']
})
export class DeviceTypeRulesComponent implements OnInit, OnDestroy {

  @Input() deviceType: any;
  @Input() pageType: any;
  rules: any[] = [];
  rulesTableConfig: any;
  isRulesLaoading = false;
  contextApp: any;
  subscriptions: Subscription[] = [];

  constructor(
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getRules();
    this.rulesTableConfig = {
      type: 'Rules',
      tableHeight: 'calc(100vh - 11rem)',
      freezed: this.deviceType.freezed,
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
          key: 'metadata.condition',
          type: 'text',
          headerClass: '',
          valueclass: ''
        }
      ]
    };
  }

  getRules() {
    this.rules = [];
    this.isRulesLaoading = true;
    const obj = {
      type: this.pageType
    };
    this.subscriptions.push(this.deviceTypeService.getRules(this.contextApp.app, this.deviceType.name, obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.rules = response.data;
        }
        this.isRulesLaoading = false;
      }, error => this.isRulesLaoading = false
    ));
  }

  onTableFunctionCall(event) {

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
