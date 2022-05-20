import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(
    private toastr: ToastrService
  ) { }

  showSuccess(message, header) {
    this.toastr.success(message, header);
  }

  showError(message, header) {
    this.toastr.error(message, header);
  }

  showWarning(message, header) {
    this.toastr.warning(message, header);
  }

  showCriticalAlert(message, header, positionClass, timeOut) {
    this.toastr.error(message, header, {positionClass, timeOut});
  }
  showclear(){
    this.toastr.clear();
  }
}
