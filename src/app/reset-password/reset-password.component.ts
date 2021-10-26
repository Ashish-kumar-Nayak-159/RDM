import { ToasterService } from './../services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  /**
   * Flag to confirm if it is first time log in or user manually wants to change password.
   */
  @Input()
  isFirstTimeLogin: boolean;

  @Input()
  isForgotPassword: boolean;

  @Input()
  loginData: any;
  @Output()
  modalClose: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Reset/change password formgroup.
   */
  resetPasswordForm: FormGroup;
  /**
   * Logged in user object
   */
  loggedInUser: any;
  /**
   * Loader for change password api
   */
  changePasswordAPILoading = false;
  /**
   * Change password api observable subscription
   */
  changePasswordSubscription: Subscription;
  /**
   * Creates an instance of customers component.
   */
  constructor(private commonService: CommonService, private toasterService: ToasterService) {}
  /**
   * on init method
   * A callback method that is invoked immediately after the directive is instantiated.
   */
  ngOnInit() {
    $('#changePasswordModal').modal({
      backdrop: 'static',
      keyboard: false,
    });
    this.loggedInUser = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.resetPasswordForm = new FormGroup(
      {
        email: new FormControl(this.loginData?.email || null, [Validators.required, this.noWhitespaceValidator]),
        otp: new FormControl(null, [Validators.required, this.noWhitespaceValidator]),
        old_password: new FormControl(this.loginData?.password || null, [
          Validators.required,
          this.noWhitespaceValidator,
        ]),
        new_password: new FormControl(null, [
          Validators.required,
          this.noWhitespaceValidator,
          Validators.pattern(CONSTANTS.PASSWORD_REGEX),
        ]),
        confirmNewPassword: new FormControl(null, [Validators.required, this.noWhitespaceValidator]),
      },
      { validators: this.checkPasswords }
    );
    this.isForgotPassword
      ? this.resetPasswordForm.removeControl('old_password')
      : this.resetPasswordForm.removeControl('otp');
  }

  noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length === 0 ? { whitespace: true } : null;
  }
  /**
   * Calls the change password api.
   * Request payload is reset password formgroup value.
   * Emitting the event back to login/header component to confirm that operation completed successfully.
   */
  onChangePassword() {
    const obj = this.resetPasswordForm.value;
    if (!this.isForgotPassword && obj.old_password === obj.new_password) {
      this.toasterService.showError('Old and New password can not be same.', 'Change Password');
      return;
    }
    this.changePasswordAPILoading = true;
    delete this.resetPasswordForm.value.confirmNewPassword;
    this.changePasswordSubscription = this.commonService
      .resetUserPassword(this.resetPasswordForm.value, environment.app)
      .subscribe(
        (response: any) => {
          this.changePasswordAPILoading = false;
          this.toasterService.showSuccess(response.message, 'Change Password');
          this.onModalClose();
          if (this.isFirstTimeLogin) {
            location.reload();
          }
          this.resetPasswordForm.reset();
        },
        (error: HttpErrorResponse) => {
          this.changePasswordAPILoading = false;
          this.resetPasswordForm.reset();
          this.resetPasswordForm.patchValue({ email: this.loginData?.email || null });
          console.log(this.resetPasswordForm);
          this.toasterService.showError(error.message, 'Change Password');
        }
      );
  }

  /**
   * It will compare the password and confirm password values of formgroup.
   * If value is same it will return null.
   * If it is not same, it will retun error {notSame: true}
   * @param group formgroup object to access password and confirmpassword
   * @returns null or error {notSame: true}
   */
  checkPasswords(group: FormGroup) {
    const pass = group.controls.new_password.value;
    const confirmPass = group.controls.confirmNewPassword.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  /**
   * It will reset the form group and close the 'changePasswordModal' modal.
   */
  onModalClose() {
    this.resetPasswordForm.reset();
    this.modalClose.emit();
    $('#changePasswordModal').modal('hide');
  }

  ngOnDestroy() {
    this.changePasswordSubscription?.unsubscribe();
  }
}
