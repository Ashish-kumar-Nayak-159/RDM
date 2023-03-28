import { ToasterService } from './../../services/toaster.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-newdata-type-fieds',
  templateUrl: './newdata-type-fieds.component.html',
  styleUrls: ['./newdata-type-fieds.component.css']
})
export class NewdataTypeFiedsComponent implements OnInit {
  private _obj: any;
  public get obj(): any {
    return this._obj;
  }
  @Input()
  public set obj(value: any) {
    this._obj = value;
    //this.setEnum();
  }
  @Input() type: any;
  @Input() disabled = false;
  enumObj: any = {};
  constructor(private toasterService: ToasterService) {
  }

  ngOnInit(): void {
    //this.setEnum();
  }
  setEnum() {
    if (this.obj.type?.toLowerCase() === 'enum' && this.obj.enum.length == 0) {
      let enumObj = {
        label: null,
        enum_type: undefined,
        value: null,
      }
      this.obj.enum = [];
      this.obj.enum.push(enumObj);
    }
  }

  addEnumValue() {
    debugger;
    let enumIsValid = true;
    if (!this.enumObj.label || this.enumObj.label == "") {
      enumIsValid = false;
    }
    if (!this.enumObj.data_type || this.enumObj.data_type == "") {
      enumIsValid = false;
    }
    if (!this.enumObj.value || this.enumObj.value == "") {
      enumIsValid = false;
    }
    if (!enumIsValid) {
      this.toasterService.showError('please enter all enum property', 'Add Enum Value');
      return
    }

    const index = this.obj.enum.findIndex((item) => item.label === this.enumObj.label);
    if (index > -1) {
      this.toasterService.showError('Enum Value with same label is already exists', 'Add Enum Value');
      return;
    }
    this.obj.enum.push(this.enumObj);
    this.enumObj = {};
  }

  removeEnumValue(index) {
    this.obj.enum.splice(index, 1);
  }
  onKeyUp(obj) {
    if (obj?.minValue) {
      let minValue: number = obj.minValue;
      let maxValue: number = obj.maxValue ?? 0;
      if ((maxValue < minValue)) {
        this.toasterService.showError('Min Value can not be greater than max value', 'Add Proper Value');
        this.obj.maxValue = '';
      }
    }
    if (obj?.minLength) {
      let minValue: number = obj.minLength;
      let maxValue: number = obj.maxLength ?? 0;
      if ((maxValue < minValue)) {
        this.toasterService.showError('Min length can not be greater than max length', 'Add Proper Value');
        this.obj.maxLength = '';
      }
    }
  }
}

