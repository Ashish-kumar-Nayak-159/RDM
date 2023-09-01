import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-common-table-control-properties',
  templateUrl: './common-table-control-properties.component.html',
  styleUrls: ['./common-table-control-properties.component.css']
})
export class CommonTableControlPropertiesComponent implements OnInit {
  @Input() saveDataFlag: boolean = false;
  @Input() tableConfig: any;
  @Input() tableData: any;
  @Output() viewMessageEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() isTableFilterSelected = false;
  @Input() isTableDataLoading = false;
  @Input() lastTelemetryValue: any;
  isEnteredAnyValue: boolean = false;
  checkBoxValue = false;

  constructor() { }

  ngOnChanges(changes: any) {
    if (!changes?.saveDataFlag?.firstChange) {
      if (this.saveDataFlag == false) {
        this.isEnteredAnyValue = false;
        this.tableData?.map((detail) => { detail.clicked = false; detail.new_value = undefined; detail.syncUp = false; return detail });
        this.tableConfig?.data.map((detail) => {
          if (detail.type == "checkbox") {
            detail['selectCheckBoxs'] = false;
            this.checkBoxValue = false;

          }
          return detail;
        });
      }
    }
  }

  ngOnInit(): void {
    this.tableData.forEach(data => {
      const defaultValue = data.json_model[data?.json_key]?.defaultValue;
      if (defaultValue !== null) {
        data.new_value = defaultValue;
      }
    });
  }


  multiSyncupData() {
    this.viewMessageEvent.emit(this.tableData);
  }

  updateAllCheckBox(event) {
    if (event == true) {
      this.tableConfig.selectCheckBoxs = true;
      this.checkBoxValue = true;
      this.tableData.map((detail) => {
        return detail.syncUp = true;
      })
    } else {
      this.tableConfig.selectCheckBoxs = false;
      this.checkBoxValue = false;
      this.tableData.map((detail) => {
        return detail.syncUp = false;
      })
    }
  }


  updateSingleCheckBox(event) {
    if (event == true) {
      let counter = 0;
      this.tableData.forEach((detail) => {
        if (detail.syncUp == true) {
          counter++;
          this.checkBoxValue = true;
        }
      })
      if (counter == this.tableData.length) {

        this.tableConfig?.data.forEach((detail) => {
          if (detail.type == "checkbox") {
            this.checkBoxValue = true;
            detail['selectCheckBoxs'] = true;
          }
        })
      }

    } else {
      this.tableConfig?.data.forEach((detail) => {
        if (detail.type == "checkbox") {
          this.checkBoxValue = false;
          detail['selectCheckBoxs'] = false;
        }
      })

    }


  }

  inputBoxValueChange(data, value: string) {
    this.isEnteredAnyValue = false;
    this.tableData?.map((detail) => {
      if (data.metadata.sd) {
        if (detail.id == data.id) {

          if (data.metadata.sd == 1 || data.metadata.sd == 7) {
            if (typeof detail.new_value === 'string') {
              detail.new_value = detail.new_value.replace(/[^0-9.]+/gi, "");
            }
            if (typeof value === 'string') {
              value = value.replace(/[^0-9.]+/gi, "");
            }
          }
          if (data.metadata.sd == 2 || data.metadata.sd == 8) {
            detail.new_value = detail?.new_value?.replace(/[^0-9]+/gi, "");
            value = value?.replace(/[^0-9]+/gi, "");
          }
          if (data.metadata.sd == 3 || data.metadata.sd == 4) {
            detail.new_value = detail?.new_value?.replace(/[^0-9-+]+/gi, "");
            value = value?.replace(/[^0-9-+]+/gi, "");
          }
          if (data.metadata.sd == 5 || data.metadata.sd == 6) {
            detail.new_value = detail?.new_value?.replace(/[^0-9-+.]+/gi, "");
            value = value?.replace(/[^0-9-+.]+/gi, "");
          }
        }
      } else {
        if (data.metadata.d != 'd') {
          if (detail.id == data.id && data.data_type == 'Number') {
            detail.new_value = detail?.new_value?.replace(/[^0-9.]+/gi, "");
            value = value?.replace(/[^0-9.]+/gi, "");
          }
          if (detail.id == data.id && data.data_type == 'String') {
            detail.new_value = detail?.new_value?.replace(/[^a-zA-Z_]+/gi, "");
            value = value?.replace(/[^a-zA-Z_]+/gi, "");
          }
        }
        if (detail?.new_value?.toString()?.length > 0) {
          this.isEnteredAnyValue = true;
        }
      }
      return detail;
    })
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
  onClickOfButton(data, value) {
    this.viewMessageEvent.emit({
      data,
      for: value,
      type: this.tableConfig.type,
    });
  }

}
