import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'compactNumber',
  standalone: true
})
export class CompactNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (value < 1000) return `${value}`;
    if (value < 1000000) return `${(value / 1000).toFixed(value % 1000 >= 100 ? 1 : 0)}K`;
    return `${(value / 1000000).toFixed(value % 1000000 >= 100000 ? 1 : 0)}M`;
  }
}
