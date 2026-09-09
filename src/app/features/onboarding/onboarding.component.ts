import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { CATEGORIES } from '../../models/article.model';

@Component({
  selector: 'app-onboarding',
  imports: [],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);

  currentUser = this.authService.currentUserSignal;
  selected = signal<string[]>([]);
  categories = CATEGORIES;

  toggleCategory(category: string): void {
    this.selected.update((current) =>{
      if(current.includes(category)){
        return current.filter((c) => c !== category);
      } else {
        return [...current, category];
      }
    })
  }

  save(): void {
    const user = this.currentUser();
    if(!user) return; 
    const profile = this.userService.getProfile(user.uid);
    this.userService.savePreferences(user.uid, { categories: this.selected(), tags: profile?.preferences?.tags || [], authors: profile?.preferences?.authors || [] });
    this.router.navigate(['/']);
  }

  skip(): void { 
    const user = this.currentUser();
    if(!user) return; 
    const profile = this.userService.getProfile(user.uid);
    this.userService.savePreferences(user.uid, profile?.preferences ?? { categories: [], tags: [], authors: [] });
    this.router.navigate(['/']);
  }
}
