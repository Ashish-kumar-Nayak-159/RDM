import { Component, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-access-control',
  templateUrl: './access-control.component.html',
  styleUrls: ['./access-control.component.css']
})
export class AccessControlComponent implements OnInit {

  contextApp: any;
  constantData = CONSTANTS;
  constructor(
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
  }

}
