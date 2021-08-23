import { ToasterService } from 'src/app/services/toaster.service';
import { CampaignService } from './../../services/campaigns/campaign.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { DaterangepickerComponent } from 'ng2-daterangepicker';

@Component({
  selector: 'app-campaign-management-list',
  templateUrl: './campaign-management-list.component.html',
  styleUrls: ['./campaign-management-list.component.css']
})
export class CampaignManagementListComponent implements OnInit, AfterViewInit {

  tileData: any;
  subscriptions: Subscription[] = [];
  contextApp: any;
  decodedToken: any;
  campaigns: any[] = [];
  isGetCampaignAPILoading = false;
  filterObj: any = {};
  previousFilterObj: any = {};
  daterange: any = {};
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: moment(),
    timePicker: true,
    ranges: CONSTANTS.DATE_OPTIONS
  };
  @ViewChild(DaterangepickerComponent) private picker: DaterangepickerComponent;
  selectedDateRange: string;
  constructor(
    private commonService: CommonService,
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(this.commonService.getToken());
    this.getTileName();
    // this.getCampaignsList();
  }

  ngAfterViewInit() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    if (item) {
      this.loadFromCache(item);
    }
  }

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach(item => {
      if (item.system_name === 'Campaigns') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    console.log(this.tileData);
  }

  loadFromCache(item) {
    console.log(item.dateOption);
    if (item.dateOption) {
      this.filterObj.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.filterObj.from_date = dateObj.from_date;
        this.filterObj.to_date = dateObj.to_date;
      } else {
        this.filterObj.from_date = item.from_date;
        this.filterObj.to_date = item.to_date;
      }
      this.picker.datePicker.setStartDate(moment.unix(this.filterObj.from_date));
      this.picker.datePicker.setEndDate(moment.unix(this.filterObj.to_date));
      if (this.filterObj.dateOption !== 'Custom Range') {
        this.selectedDateRange = this.filterObj.dateOption;
      } else {
        this.selectedDateRange = moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') + ' to ' +
        moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
      }
      this.previousFilterObj = JSON.parse(JSON.stringify(this.filterObj));
      this.getCampaignsList();
    }
    this.cdr.detectChanges();
  }

  getCampaignsList() {
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
    } else {
      this.filterObj.from_date = this.filterObj.from_date;
      this.filterObj.to_date = this.filterObj.to_date;
    }
    const obj = {
      from_date: this.filterObj.from_date,
      to_date: this.filterObj.to_date
    };
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'View Report');
      return;
    }
    this.previousFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    this.campaigns = [];
    this.isGetCampaignAPILoading = true;
    this.subscriptions.push(this.campaignService.getJobCampaigns(this.contextApp.app, obj).subscribe(
      (response: any) => {
        if (response?.data?.length > 0) {
          this.campaigns = response.data;
          this.campaigns.forEach(campaign => {
            campaign.local_start_date = this.commonService.convertUTCDateToLocal(campaign.expected_start_date);
            campaign.local_end_date = this.commonService.convertUTCDateToLocal(campaign.expected_end_date);
            campaign.local_actual_start_date = this.commonService.convertUTCDateToLocal(campaign.actual_start_date);
            campaign.local_actual_end_date = this.commonService.convertUTCDateToLocal(campaign.actual_end_date);
          });
        }
        this.isGetCampaignAPILoading = false;
      }, error => {
        this.isGetCampaignAPILoading = false;
      }
    ));
  }

  selectedDate(value: any, datepicker?: any) {
    console.log(value);
    this.filterObj.dateOption = value.label;
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
    } else {
      this.filterObj.from_date = moment(value.start).utc().unix();
      this.filterObj.to_date = moment(value.end).utc().unix();
    }
    if (value.label === 'Custom Range') {
      this.selectedDateRange = moment(value.start).format('DD-MM-YYYY HH:mm') + ' to ' + moment(value.end).format('DD-MM-YYYY HH:mm');
    } else {
      this.selectedDateRange = value.label;
    }
    console.log(this.filterObj);
  }

  openCampaignCreateModal() {

  }


}
