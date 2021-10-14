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
  enumObj: any = {};
  constructor(private toasterService: ToasterService) {}

  ngOnInit(): void {}

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
}
