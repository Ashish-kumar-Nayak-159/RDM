import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';

export class SpaceValidator {
  static cannotContainSpace(control: AbstractControl): ValidationErrors | null {
    if ((control.value as string).indexOf(' ') >= 0) {
      return { cannotContainSpace: true }
    }

    return null;
  }
  static noWhitespaceValidator(control: FormControl) {
    var white = new RegExp(/^\s$/);
    let isSpace = control.value ? white.test(control.value.charAt(0)) : true;
    // const isWhitespace = (control.value || isSpace || '').trim().length === 0;
    const isValid = !isSpace;
    return isValid ? null : { 'whitespace': true };
  }
}