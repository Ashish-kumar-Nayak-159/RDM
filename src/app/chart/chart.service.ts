import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  toggleThresholdEvent: EventEmitter<any> = new EventEmitter<any>();
  togglePropertyEvent: EventEmitter<any> = new EventEmitter<any>();
  clearDashboardTelemetryList: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }
}
