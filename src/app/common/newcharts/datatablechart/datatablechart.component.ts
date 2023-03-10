import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ChartService } from 'src/app/services/chart/chart.service';
import { CommonService } from 'src/app/services/common.service';

declare var $: any;
@Component({
  selector: 'app-datatablechart',
  templateUrl: './datatablechart.component.html',
  styleUrls: ['./datatablechart.component.css']
})
export class DatatablechartComponent implements OnInit {
  selectedAlert: any;
  seriesArr: any[] = [];
  xAxisProps: any;
  y1AxisProps: any[] = [];
  y2AxisProps: any[] = [];
  chartType: any;
  chartId: any;
  showThreshold = false;
  modalConfig: any;
  bodyMessage: string;
  headerMessage: string;
  subscriptions: Subscription[] = [];

  @Input() chartConfig: any;
  @Input() propertyList: any;
  @Input() asset: any;
  @Input() assetModel: any;
  @Input() chartTitle: any;
  @Input() hideCancelButton: any;
  @Input() telemetryData: any[] = [];
  @Input() chartWidth: any;
  @Input() chartHeight: any;
  @Input() isOverlayVisible: any;
  // @Input() chartId: any;
  @Input() decodedToken: any;
  @Input() widgetStringFromMenu: any;
  @Output() chart_Id = new EventEmitter<any>();
  widgetId: any;
  constructor(private commonService: CommonService, private chartService: ChartService) { }

  ngOnInit(): void {
    if (this.chartConfig) {
      this.y1AxisProps = this.chartConfig.y1axis;
      this.y2AxisProps = this.chartConfig.y2axis;
      this.xAxisProps = this.chartConfig.xAxis;
      this.chartType = this.chartConfig.chartType;
      this.chartTitle = this.chartConfig.title;
      this.chartId = this.chartConfig.chart_Id;
      this.widgetId = this.chartConfig.id;
    }

    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    setTimeout(() => this.plotChart(), 200);
    this.subscriptions.push(
      this.chartService.togglePropertyEvent.subscribe((property) => this.toggleProperty(property))
    );
    this.y1AxisProps.forEach((prop) => (prop.hidden = false));
    this.y2AxisProps.forEach((prop) => (prop.hidden = false));
  }

  plotChart() { }

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
      this.removeWidget();
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

  removeWidget() {
    this.onMenu(2);
  }

  onMenu(type) {
    if (type == 0) {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Edit" });
    }
    else if (type == 1) {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Clone" });
    }
    else {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Delete" });
    }
  }
}

