import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-state',
  imports: [],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss',
})
export class ErrorStateComponent {
  @Input() message = 'Please try again in a moment.';
}
