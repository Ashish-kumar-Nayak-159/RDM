import { Directive } from '@angular/core';
import { NG_VALIDATORS, FormControl, AbstractControl, ValidationErrors, ValidatorFn, Validator } from '@angular/forms';

@Directive({
  selector: '[validateText][ngModel], [validateText][formControl]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: FormValidatorDirective, multi: true }
  ]
})

export class FormValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
}