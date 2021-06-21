import { ToasterService } from './../../../services/toaster.service';
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
  rules: any[] = [];
  rulesTableConfig: any;
  isRulesLaoading = false;
  contextApp: any;
  subscriptions: Subscription[] = [];
  selectedTab: any;
  constructor(
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.onClickOfTab('Cloud');
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
          key: 'condition',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Actions',
          key: undefined,
          type: 'button',
          headerClass: 'w-10',
          btnData: [
            // {
            //   icon: 'fa fa-fw fa-eye',
            //   text: '',
            //   id: 'View JSON Model',
            //   valueclass: '',
            //   tooltip: 'View JSON Model'
            // },
            {
              icon: 'fa fa-fw fa-edit',
              text: '',
              id: 'Edit',
              valueclass: '',
              tooltip: 'Edit',
              disableConditions: {
                key: 'freezed',
                value: true
              }
            },
            {
              icon: 'fa fa-fw fa-trash',
              text: '',
              id: 'Delete',
              valueclass: '',
              tooltip: 'Delete',
              disableConditions: {
                key: 'freezed',
                value: true
              }
            }
          ]
        }
      ]
    };
  }

  onClickOfTab(type) {
    this.selectedTab = type;
    this.getRules();
  }

  getRules() {
    this.rules = [];
    this.isRulesLaoading = true;
    const obj = {
      type: this.selectedTab
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
    this.toasterService.showWarning('Work in Progress', 'Manage ' + this.selectedTab +  ' Rule');
  }

  addRule() {
    this.toasterService.showWarning('Work in Progress', 'Add ' + this.selectedTab +  ' Rule');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
