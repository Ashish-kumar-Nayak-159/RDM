import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  breadcrumbEvent: EventEmitter<string> = new EventEmitter<string>();
  constructor() { }
}
