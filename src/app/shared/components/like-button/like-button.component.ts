import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-like-button',
  imports: [],
  template: `
    <button type="button" class="like-btn" [class.is-liked]="liked" (click)="toggle.emit()" [disabled]="disabled" [attr.aria-pressed]="liked">
      <span aria-hidden="true">{{ liked ? '♥' : '♡' }}</span>
      <span>{{ count }}</span>
    </button>
  `,
  styles: [`
    .like-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--color-border);
      background: #fff;
      border-radius: 999px;
      padding: 6px 14px;
      cursor: pointer;
      font-weight: 600;
      color: var(--color-muted);
      transition: all 0.15s ease;
    }
    .like-btn:hover:not(:disabled) { border-color: var(--color-danger); color: var(--color-danger); }
    .like-btn.is-liked { color: var(--color-danger); border-color: var(--color-danger); background: #fdf1ee; }
    .like-btn:disabled { cursor: not-allowed; opacity: 0.6; }
  `]
})
export class LikeButtonComponent {
  @Input() liked = false;
  @Input() count = 0;
  @Input() disabled = false;
  @Output() toggle = new EventEmitter<void>();
}
