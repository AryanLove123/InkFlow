import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tag-chip',
  imports: [],
  template: `
    <button
      type="button"
      class="chip chip--interactive"
      [class.chip--selected]="selected"
      (click)="tagClick.emit(tag)"
    >
      #{{ tag }}
      @if (count !== undefined) {
        <span class="tag-count"> · {{ count }}</span>
      }
    </button>
  `,
  styles: [
    `
      .tag-count {
        opacity: 0.75;
      }
    `,
  ],
})
export class TagChipComponent {
  @Input({ required: true }) tag!: string;
  @Input() count?: number;
  @Input() selected = false;
  @Output() tagClick = new EventEmitter<string>();
}
