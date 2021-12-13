import { CommonService } from './../../../services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { ApplicationService } from 'src/app/services/application/application.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import * as datefns from 'date-fns'

@Component({
  selector: 'app-application-filter-settings',
  templateUrl: './application-filter-settings.component.html',
  styleUrls: ['./application-filter-settings.component.css'],
})
export class ApplicationFilterSettingsComponent implements OnInit {
  @Input() applicationData: any;
  isConfigEditable = false;
  saveConfigAPILoading = false;
  originalApplicationData: any;
  apiSubscriptions: Subscription[] = [];
  decodedToken: any;
  mainFilterObj: any = {};
  controlPanelFilterObj: any = {};
  selectedDateRange = 'Last 24 Hours'

  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: new Date(),
    timePicker: true,
    showCustomRangeLabel: false,
    ranges: {
      'Last 5 Mins': [datefns.subMinutes(new Date(), 5), datefns.subSeconds(new Date(), 0)],
      'Last 30 Mins': [datefns.subSeconds(new Date(), 30), datefns.subSeconds(new Date(), 0)],
      'Last 1 Hour': [datefns.subHours(new Date(), 1), datefns.subSeconds(new Date(), 0)],
      'Last 3 Hours': [datefns.subHours(new Date(), 3), datefns.subSeconds(new Date(), 0)],
      'Last 6 Hours': [datefns.subHours(new Date(), 6), datefns.subSeconds(new Date(), 0)],
      'Last 12 Hours': [datefns.subHours(new Date(), 12), datefns.subSeconds(new Date(), 0)],
      'Last 24 Hours': [datefns.subHours(new Date(), 24), datefns.subSeconds(new Date(), 0)],
      'Last 7 Days': [datefns.subDays(new Date(), 7), datefns.subSeconds(new Date(), 0)],
      'This Week': [datefns.startOfWeek(new Date(), { weekStartsOn: 1 }), datefns.subSeconds(new Date(), 0)],
      'Last 4 Weeks': [
        datefns.subWeeks(new Date(), 4),
        datefns.subWeeks(new Date(), 1),
      ],
      'This Month': [datefns.startOfMonth(new Date()), datefns.subSeconds(new Date(), 0)],
      'Last Month': [datefns.startOfMonth(datefns.subMonths(new Date(), 1)), datefns.endOfMonth(datefns.subMonths(new Date(), 1))],
    },
  };
  constructor(
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    if (!this.applicationData.metadata.filter_settings) {
      this.applicationData.metadata.filter_settings = {};
      this.applicationData.metadata.filter_settings.record_count = 500;
      this.applicationData.metadata.filter_settings.search_duration = 'Last 24 Hours';
      this.applicationData.metadata.filter_settings.search_duration_control_panel = 'Last 30 Mins';
    }
    this.mainFilterObj.dateOption = this.applicationData.metadata.filter_settings.search_duration || 'Last 24 Hours';
    let obj = this.commonService.getMomentStartEndDate(this.mainFilterObj.dateOption);
    this.mainFilterObj.from_date = obj.from_date;
    this.mainFilterObj.to_date = obj.to_date;
    console.log('this.mainFilterObj', this.mainFilterObj);
    this.controlPanelFilterObj.dateOption =
      this.applicationData.metadata.filter_settings.search_duration_control_panel || 'Last 30 Mins';
    obj = this.commonService.getMomentStartEndDate(this.controlPanelFilterObj.dateOption);
    this.controlPanelFilterObj.from_date = obj.from_date;
    this.controlPanelFilterObj.to_date = obj.to_date;
    console.log('this.controlPanelFilterObj', this.controlPanelFilterObj);
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
  }

  selectedDate(filterObj, type) {
    console.log('filterObj', filterObj);
    console.log('type', type);
    if (type == 'search_duration') {
      this.applicationData.metadata.filter_settings.search_duration = filterObj.dateOption;
    } else {
      this.applicationData.metadata.filter_settings.search_duration_control_panel = filterObj.dateOption;
    }
  }

  onSaveMetadata() {
    if (this.applicationData.metadata?.filter_settings?.record_count <= 0) {
      this.toasterService.showError('Default number of records should be greater than 0', 'Save Filter Settings');
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
          let obj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS);
          obj['dateOption'] = this.applicationData.metadata.filter_settings.search_duration;
          this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, obj);
          obj = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS);
          obj['dateOption'] = this.applicationData.metadata.filter_settings.search_duration_control_panel;
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
