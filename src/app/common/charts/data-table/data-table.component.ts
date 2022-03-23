import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ChartService } from 'src/app/services/chart/chart.service';
import { CommonService } from 'src/app/services/common.service';

declare var $: any;
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
})
export class DataTableComponent implements OnInit {
  telemetryData: any[] = [];
  selectedAlert: any;
  seriesArr: any[] = [];
  propertyList: any[] = [];
  xAxisProps: any;
  y1AxisProps: any[] = [];
  y2AxisProps: any[] = [];
  chartHeight: any;
  chartWidth: any;
  chartType: any;
  chartTitle: any;
  chartId: any;
  chartConfig: any;
  showThreshold = false;
  isOverlayVisible = false;
  modalConfig: any;
  bodyMessage: string;
  headerMessage: string;
  hideCancelButton = false;
  decodedToken: any;
  subscriptions: Subscription[] = [];
  widgetStringFromMenu: any;
  constructor(private commonService: CommonService, private chartService: ChartService) {}

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    setTimeout(() => this.plotChart(), 200);
    this.subscriptions.push(
      this.chartService.togglePropertyEvent.subscribe((property) => this.toggleProperty(property))
    );
    this.y1AxisProps.forEach((prop) => (prop.hidden = false));
    this.y2AxisProps.forEach((prop) => (prop.hidden = false));
  }

  plotChart() {}

  getPropertyType(key) {
    return this.propertyList.filter((prop) => prop.json_key === key)[0]?.type || 'Measured';
  }

  openConfirmRemoveWidgetModal() {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.bodyMessage =
      'Are you sure you want to remove this ' + this.chartTitle + ' ' + this.widgetStringFromMenu + '?';
    this.headerMessage = 'Remove ' + this.widgetStringFromMenu;
    $('#confirmRemoveWidgetModal' + this.chartId).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#confirmRemoveWidgetModal' + this.chartId).modal('hide');
    } else if (eventType === 'save') {
      this.removeWidget(this.chartId);
      $('#confirmRemoveWidgetModal' + this.chartId).modal('hide');
    }
  }

  getPropertyName(key) {
    return this.propertyList.filter((prop) => prop.json_key === key)[0]?.name || key;
  }

  toggleProperty(property) {
    this.y1AxisProps.forEach((prop) => {
      if (prop.json_key === property) {
        prop.hidden = !prop.hidden;
      }
    });
    this.y2AxisProps.forEach((prop) => {
      if (prop.json_key === property) {
        prop.hidden = !prop.hidden;
      }
    });
  }

  removeWidget(chartId) {}
}
