import { CommonService } from './../../../services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { ApplicationService } from 'src/app/services/application/application.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import * as moment from 'moment';

@Component({
  selector: 'app-application-filter-settings',
  templateUrl: './application-filter-settings.component.html',
  styleUrls: ['./application-filter-settings.component.css']
})
export class ApplicationFilterSettingsComponent implements OnInit {
  @Input() applicationData: any;
  isConfigEditable = false;
  saveConfigAPILoading = false;
  originalApplicationData: any;
  apiSubscriptions: Subscription[] = [];
  decodedToken: any;
  mainFilterObj: any = {};
  controlPanelFilterObj:any = {};
  selectedDateRange='Last 24 Hours';
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: moment(),
    timePicker: false,
    showCustomRangeLabel: false,
    ranges: {
      'Last 5 Mins': [moment().subtract(5, 'minutes'), moment()],
      'Last 30 Mins': [moment().subtract(30, 'minutes'), moment()],
      'Last 1 Hour': [moment().subtract(1, 'hour'), moment()],
      'Last 3 Hours': [moment().subtract(3, 'hours'), moment()],
      'Last 6 Hours': [moment().subtract(6, 'hours'), moment()],
      'Last 12 Hours': [moment().subtract(12, 'hours'), moment()],
      'Last 24 Hours': [moment().subtract(24, 'hours'), moment()],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'This Week': [moment().startOf('isoWeek'), moment()],
      'Last 4 Weeks': [
        moment().subtract(4, 'weeks').startOf('isoWeek'),
        moment().subtract(1, 'weeks').endOf('isoWeek'),
      ],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').endOf('month'), moment().subtract(1, 'month').startOf('month')]
    },
  };
  constructor(private assetService: AssetService,
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private commonService: CommonService) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    if (!this.applicationData.metadata.filter_settings) {
      this.applicationData.metadata.filter_settings = {};
      this.applicationData.metadata.filter_settings.record_count = 500;
      this.applicationData.metadata.filter_settings.search_duration = 'Last 24 Hours';
      this.applicationData.metadata.filter_settings.search_duration_control_panel = 'Last 30 Minutes';
    }
    console.log(this.selectedDateRange);
    this.mainFilterObj.dateOption = this.applicationData.metadata.filter_settings.search_duration || 'Last 24 Hours'
    this.mainFilterObj.from_date = this.options.ranges[this.applicationData.metadata.filter_settings.search_duration][0]
    this.mainFilterObj.to_date = this.options.ranges[this.applicationData.metadata.filter_settings.search_duration][1]
    
    this.controlPanelFilterObj.dateOption = this.applicationData.metadata.filter_settings.search_duration_control_panel || 'Last 30 Mins'
    this.controlPanelFilterObj.from_date = this.options.ranges[this.applicationData.metadata.filter_settings.search_duration_control_panel][0]
    this.controlPanelFilterObj.to_date = this.options.ranges[this.applicationData.metadata.filter_settings.search_duration_control_panel][1]
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
  }

  selectedDate(filterObj, type) {
    if (type == "search_duration") {
      this.applicationData.metadata.filter_settings.search_duration = filterObj.dateOption
    } else {
      this.applicationData.metadata.filter_settings.search_duration_control_panel = filterObj.dateOption
    }
  }

  onSaveMetadata() {
    if(this.applicationData.metadata?.filter_settings?.record_count <= 0){
      this.toasterService.showError("Default number of records should be greater than 0","Save Filter Settings");
      return;
    }
    this.saveConfigAPILoading = true;
    this.applicationData.id = this.applicationData.app;
    this.apiSubscriptions.push(
      this.applicationService.updateApp(this.applicationData).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Save Filter Settings');
          this.saveConfigAPILoading = false;
          this.applicationService.refreshAppData.emit();
          let obj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS)
          obj['dateOption'] = this.applicationData.metadata.filter_settings.search_duration
          this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, obj);
          obj = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS)
          obj['dateOption'] = this.applicationData.metadata.filter_settings.search_duration_control_panel
          this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, obj);
        },
        (error) => {
          this.toasterService.showError(error.message, 'Save Filter Settings');
          this.saveConfigAPILoading = false;
        }
      )
    );
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
    this.isConfigEditable = false;
  }
}
 