import { Component, computed, inject } from '@angular/core';
import { DraftService } from '../../core/services/draft.service';
import { AuthService } from '../../core/auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-drafts',
  imports: [RouterLink, EmptyStateComponent,RelativeTimePipe],
  templateUrl: './drafts.component.html',
  styleUrl: './drafts.component.scss',
})
export class DraftsComponent {
  draftService = inject(DraftService);
  authService = inject(AuthService);

  currentUser = toSignal(this.authService.currentUser$, { initialValue: null });

  drafts = computed(() =>{
    const user = this.currentUser();
    return user ? this.draftService.getDraftByAuthorId(user.uid) : [];
  })

  delete(id: string): void{
    if (confirm('Delete this draft? This cannot be undone.')) {
      this.draftService.delete(id);
    }
  }
}
