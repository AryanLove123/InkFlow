import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
})
export class RelativeTimePipe implements PipeTransform {
  transform(value?: string | null): string {
    if (!value) return '';
    const then = new Date(value).getTime();
    const diffMs = Date.now() - then;
    const diffMin = Math.floor((diffMs / 60000));

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) return `${diffMonth}mo ago`;
    const diffYear = Math.floor(diffMonth / 12);
    return `${diffYear}y ago`;
  }
}
