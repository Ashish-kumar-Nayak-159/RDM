import { Injectable, EventEmitter } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  breadcrumbEvent: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  convertUTCDateToLocal(utcDate) {
    if (utcDate) {
      return (moment.utc(utcDate, "M/DD/YYYY h:mm:ss A")).local().format('DD-MMM-YYYY hh:mm:ss A');
    }
    return null;
  }
}
