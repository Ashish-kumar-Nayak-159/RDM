import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFixed'
})
export class ToFixedPipe implements PipeTransform {

  transform(value: number, digits: number = 2): string {
    if (typeof value !== 'number') {
      return value;
    }
    return value.toFixed(digits);
  }

}
