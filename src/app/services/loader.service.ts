import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {


  private showLoaderState: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor() { }

  showLoader() {
    this.showLoaderState.emit(true);
  }

  hideLoader() {
    this.showLoaderState.emit(false);
  }
}
