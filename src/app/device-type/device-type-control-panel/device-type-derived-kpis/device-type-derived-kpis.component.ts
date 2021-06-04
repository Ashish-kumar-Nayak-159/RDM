import { Subscription } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';

@Component({
  selector: 'app-device-type-derived-kpis',
  templateUrl: './device-type-derived-kpis.component.html',
  styleUrls: ['./device-type-derived-kpis.component.css']
})
export class DeviceTypeDerivedKpisComponent implements OnInit {

  @Input() deviceType: any;
  derivedKPIs: any[] = [];
  derivedKPIsTableConfig: any;
  isDerivedKPIsLaoading = false;
  contextApp: any;
  subscriptions: Subscription[] = [];
  constructor(
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService
    ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.derivedKPIsTableConfig = {
      type: 'Derived KPIs',
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
          name: 'Message',
          key: 'message',
          type: 'text',
          headerClass: 'w-15',
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
          name: 'Code',
          key: 'code',
          type: 'text',
          headerClass: '',
          valueclass: ''
        }
      ]
    };
    this.getDerivedKPIs();
  }

  getDerivedKPIs() {
    this.derivedKPIs = [];
    this.isDerivedKPIsLaoading = true;
    this.subscriptions.push(this.deviceTypeService.getDerivedKPIs(this.contextApp.app, this.deviceType.name).subscribe(
      (response: any) => {
        if (response?.data) {
          this.derivedKPIs = response.data;
        }
        this.isDerivedKPIsLaoading = false;
      }, error => this.isDerivedKPIsLaoading = false
    ));
  }

}
