import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  template: `
    <input
      type="search"
      [(ngModel)]="value"
      (ngModelChange)="onInput($event)"
      [placeholder]="placeholder"
      [attr.aria-label]="placeholder"
    />
  `
})
export class SearchBarComponent implements OnDestroy {
  @Input() placeholder = 'Search…';
  @Output() queryChange = new EventEmitter<string>();

  value = '';
  private input$ = new Subject<string>();
  private sub = this.input$.pipe(debounceTime(300), distinctUntilChanged()).subscribe((v) => this.queryChange.emit(v));

  onInput(v: string): void {
    this.input$.next(v);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
