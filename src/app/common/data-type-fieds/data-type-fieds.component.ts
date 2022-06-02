import { ToasterService } from './../../services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-type-fields',
  templateUrl: './data-type-fieds.component.html',
  styleUrls: ['./data-type-fieds.component.css'],
})
export class DataTypeFieldsComponent implements OnInit {
  @Input() obj: any;
  @Input() type: any;
  @Input() disabled = false;
  enumObj: any = {};
  constructor(private toasterService: ToasterService) { }

  ngOnInit(): void { 
  }

  addEnumValue() {
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
        this.toasterService.showError('Max Value can not be greater than min value', 'Add Proper Value');
        this.obj.maxValue = '';
      }
    }
    if (obj?.minLength) {
      let minValue: number = obj.minLength;
      let maxValue: number = obj.maxLength  ?? 0;
      if ((maxValue < minValue)) {
        this.toasterService.showError('Max length can not be greater than min length', 'Add Proper Value');
        this.obj.maxLength = '';
      }
    }
  }
}
