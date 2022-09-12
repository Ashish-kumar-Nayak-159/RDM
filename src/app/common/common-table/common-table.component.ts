import { CommonService } from './../../services/common.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { FormControl, FormGroup } from '@angular/forms';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';

@Component({
  selector: 'app-common-table',
  templateUrl: './common-table.component.html',
  styleUrls: ['./common-table.component.css'],
})
export class CommonTableComponent implements OnInit {
  @Input() saveDataFlag : boolean = false;
  @Input() tableConfig: any;
  @Input() tableData: any[] = [];
  @Input() isTableDataLoading = false;
  @Input() isTableFilterSelected = false;
  @Input() assetModelData : any = [];
  @Output() viewMessageEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() assetSelectionChange: EventEmitter<any> = new EventEmitter<any>();
  decodedToken: any;
  assetSelectForm: FormGroup;
  isEnteredAnyValue : boolean = false;
  signalRTelemetrySubscription: any;
  constructor(
    private commonService: CommonService,
    private signalRService: SignalRService,
  ) {}

  ngOnInit(): void {
    this.assetSelectForm = new FormGroup({
      selected_asset: new FormControl("", []),
    });
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
  }
  ngOnChanges(changes:any) {
    if(!changes?.saveDataFlag?.firstChange) {
      if(this.saveDataFlag == false) {
        this.isEnteredAnyValue = false;
        this.tableData.map((detail) => {detail.clicked = false; detail.new_value = undefined; detail.syncUp = false; return detail});
        this.tableConfig?.data.map((detail)=>{
          if(detail.type == "checkbox") {
            detail['selectCheckBoxs'] = false;
          }
          return detail;
        })
      }
    }
  }
  onClickOfButton(data, value) {
    this.viewMessageEvent.emit({
      data,
      for: value,
      type: this.tableConfig.type,
    });
  }
  multiSyncupData() {
    this.viewMessageEvent.emit(this.tableData);
  }
  updateSingleCheckBox(event) {
    let counter = 0;
    this.tableData.forEach((detail)=>{
      if(detail.syncUp == true) {
        counter++;
      }
    })
    if(counter == this.tableData.length) {
      this.tableConfig?.data.forEach((detail)=>{
        if(detail.type == "checkbox") {
          detail['selectCheckBoxs'] = true;
        }
      })
    } else {
      if(event == false) {
        this.tableConfig?.data.forEach((detail)=>{
          if(detail.type == "checkbox") {
            detail['selectCheckBoxs'] = false;
          }
        })
      }
    }
  }
  updateAllCheckBox(event) {
    if(event == true) {
      this.tableConfig.selectCheckBoxs = true;
      this.tableData.map((detail)=>{
        return detail.syncUp = true;
      })
    } else {
      this.tableConfig.selectCheckBoxs = true;
      this.tableData.map((detail)=>{
        return detail.syncUp = false;
      })
    }
    // if(this.tableConfig.selectCheckBoxs == true) {
    //   this.tableConfig.selectCheckBoxs = false;
    //   this.tableData.map((detail)=>{
    //     return detail.syncUp = true;
    //   })
    // } else {
    //   this.tableConfig.selectCheckBoxs = true;
    //   this.tableData.map((detail)=>{
    //     return detail.syncUp = false;
    //   })
    // }
  }
  resolve(obj, path) {
    path = path.split('.');
    let current = obj;
    while (path.length) {
      if (typeof current !== 'object') {
        return undefined;
      }
      if (current) {
        current = current[path.shift()];
      } else {
        return undefined;
      }
    }
    return current;
  }
  changeAssetSelection() {
    this.assetSelectionChange.emit(this.assetSelectForm.get('selected_asset')?.value);
    let contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);

    const obj1 = {
      hierarchy: contextApp.user.hierarchy,
      levels: contextApp.hierarchy.levels,
      asset_id: this.assetSelectForm.get('selected_asset')?.value.asset_id,
      type: 'telemetry',
      app: contextApp.app,
    };
    
    this.signalRService.connectToSignalR(obj1);
    this.signalRTelemetrySubscription = this.signalRService.signalRTelemetryData.subscribe((data) => {
      this.tableData.map((detail)=>{
        if(data['m'][detail.json_key]) {
          detail.current_value = data['m'][detail.json_key];
        }
        return detail;
      });
    });
  }
  inputBoxValueChange(data,value:string) {
    this.isEnteredAnyValue = false;
    this.tableData.map((detail)=>{
      if(data.metadata.sd) {
        if(detail.id == data.id) {
          if(data.metadata.sd == 1 || data.metadata.sd == 7) {
            detail.new_value = detail?.new_value?.replace(/[^0-9-+]+/gi,"");
            value = value?.replace(/[^0-9-+]+/gi,"");
          }
          if(data.metadata.sd == 2 || data.metadata.sd == 8) {
            detail.new_value = detail?.new_value?.replace(/[^0-9]+/gi,"");
            value = value?.replace(/[^0-9]+/gi,"");
          }
          if(data.metadata.sd == 3 || data.metadata.sd == 4) {
            detail.new_value = detail?.new_value?.replace(/[^0-9-+]+/gi,"");
            value = value?.replace(/[^0-9-+]+/gi,"");
          }
          if(data.metadata.sd == 5 || data.metadata.sd == 6) {
            detail.new_value = detail?.new_value?.replace(/[^0-9-+.]+/gi,"");
            value = value?.replace(/[^0-9-+.]+/gi,"");
          }
        }
      } else {
        if(data.metadata.d != 'd') {
          if(detail.id == data.id && data.data_type == 'Number') {
            detail.new_value = detail?.new_value?.replace(/[^0-9.]+/gi,"");
            value = value?.replace(/[^0-9.]+/gi,"");
          }
          if(detail.id ==   data.id && data.data_type == 'String') {
            detail.new_value = detail?.new_value?.replace(/[^a-zA-Z_]+/gi,"");
            value = value?.replace(/[^a-zA-Z_]+/gi,"");
          }
        }
        if(detail?.new_value?.toString()?.length > 0) {
          this.isEnteredAnyValue = true;
        }
      }
      return detail;
    })

    // if(value.toString().length > 0 ){
    //   this.isEnteredAnyValue = true;
    // } else {
    //   this.isEnteredAnyValue = false;
    // }
  }
}
