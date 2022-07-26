import { CommonService } from './../../services/common.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-common-table',
  templateUrl: './common-table.component.html',
  styleUrls: ['./common-table.component.css'],
})
export class CommonTableComponent implements OnInit {
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
  constructor(private commonService: CommonService) {}

  ngOnInit(): void {
    this.assetSelectForm = new FormGroup({
      selected_asset: new FormControl("", []),
    });
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
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
  updateAllCheckBox(event) {
    if(this.tableConfig.selectCheckBoxs == true) {
      this.tableConfig.selectCheckBoxs = false;
      this.tableData.map((detail)=>{
        // if(detail?.new_value?.toString().length <= 0) {
        //   this.isEnteredAnyValue = false;
        // }
        return detail.syncUp = true;
      })
    } else {
      this.tableConfig.selectCheckBoxs = true;
      this.tableData.map((detail)=>{
        // if(detail?.new_value?.toString().length <= 0) {
        //   this.isEnteredAnyValue = false;
        // }
        return detail.syncUp = false;
      })
    }
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
    console.log(this.assetSelectForm.get('selected_asset')?.value)
    this.assetSelectionChange.emit(this.assetSelectForm.get('selected_asset')?.value);
  }
  inputBoxValueChange(value:string) {
    if(value.toString().length > 0 ){
      this.isEnteredAnyValue = true;
    } else {
      this.isEnteredAnyValue = false;
    }
  }
}
