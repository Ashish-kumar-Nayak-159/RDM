import { filter } from 'rxjs/operators';
import { APIMESSAGES } from 'src/app/api-messages.constants';
import { ToasterService } from 'src/app/services/toaster.service';
import { CampaignService } from './../../services/campaigns/campaign.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-campaign-management-list',
  templateUrl: './campaign-management-list.component.html',
  styleUrls: ['./campaign-management-list.component.css'],
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
  selectedDateRange: string;
  isAPILoading = {};
  isAddCampaignModalOpen = false;
  constructor(
    private commonService: CommonService,
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef,
    private toasterService: ToasterService
  ) {}

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
    this.contextApp.menu_settings.main_menu.forEach((item) => {
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
      if (this.filterObj.dateOption !== 'Custom Range') {
        this.selectedDateRange = this.filterObj.dateOption;
      } else {
        this.selectedDateRange =
          moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') +
          ' to ' +
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
      this.filterObj.to_date = dateObj.to_date + 5;
    } else {
      this.filterObj.from_date = this.filterObj.from_date;
      this.filterObj.to_date = this.filterObj.to_date + 5;
    }
    const obj = {
      from_date: this.filterObj.from_date,
      to_date: this.filterObj.to_date,
    };
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'View Report');
      return;
    }
    this.previousFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    this.campaigns = [];
    this.isGetCampaignAPILoading = true;
    this.subscriptions.push(
      this.campaignService.getJobCampaigns(this.contextApp.app, obj).subscribe(
        (response: any) => {
          if (response?.data?.length > 0) {
            this.campaigns = response.data;
            this.campaigns.forEach((campaign) => {
              campaign.local_start_date = this.commonService.convertUTCDateToLocalDate(campaign.expected_start_date);
              campaign.local_end_date = this.commonService.convertUTCDateToLocalDate(campaign.expected_end_date);
              campaign.local_actual_start_date = this.commonService.convertUTCDateToLocalDate(
                campaign.actual_start_date
              );
              campaign.local_actual_end_date = this.commonService.convertUTCDateToLocalDate(campaign.actual_end_date);
            });
          }
          this.isGetCampaignAPILoading = false;
        },
        (error) => {
          this.isGetCampaignAPILoading = false;
        }
      )
    );
  }

  selectedDate(filterObj) {
    this.filterObj.from_date = filterObj.from_date;
    this.filterObj.to_date = filterObj.to_date;
    this.filterObj.dateOption = filterObj.dateOption;
  }

  startStopCampaign(campaignObj, index, type) {
    this.isAPILoading[index] = true;
    const method =
      type === 'start'
        ? this.campaignService.startJobCampaign(this.contextApp.app, campaignObj.job_id)
        : this.campaignService.stopJobCampaign(this.contextApp.app, campaignObj.job_id);
    this.subscriptions.push(
      method.subscribe(
        (response: any) => {
          this.toasterService.showSuccess(
            type === 'start' ? APIMESSAGES.START_CAMPAIGN_SUCCESS : APIMESSAGES.STOP_CAMPAIGN_SUCCESS,
            type === 'start' ? 'Start Campaign' : 'Stop Campaign'
          );
          this.isAPILoading = {};
          this.getCampaignsList();
        },
        (error) => {
          this.toasterService.showError(error.message, type === 'start' ? 'Start Campaign' : 'Stop Campaign');
          this.isAPILoading = {};
        }
      )
    );
  }

  openCampaignCreateModal() {
    this.isAddCampaignModalOpen = true;
  }

  closeCampaignModal() {
    this.isAddCampaignModalOpen = false;
    this.getCampaignsList();
  }
}
