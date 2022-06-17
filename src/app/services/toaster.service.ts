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

  showErrorAlert(message, header, positionClass, timeOut) {
    this.toastr.error(message, header, { positionClass, timeOut });
  }

  showCriticalAlert(message, header, toastClass, positionClass, timeOut) {
    this.toastr.error(message, header, { toastClass, positionClass, timeOut });
  }

  showWarningAlert(message, header, positionClass, timeOut) {
    this.toastr.warning(message, header, { positionClass, timeOut });
  }

  showInformationalAlert(message, header, positionClass, timeOut) {
    this.toastr.success(message, header, { positionClass, timeOut });
  }

  showclear() {
    this.toastr.clear();
  }
}
