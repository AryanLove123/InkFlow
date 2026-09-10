import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CATEGORIES } from '../../models/article.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);

  currentUser = toSignal(this.authService.currentUser$, { initialValue: null });
  categories = CATEGORIES;

  profile = computed(() => {
    const user = this.currentUser();
    return user ? this.userService.getProfile(user.uid) : null;
  });

  formInitialized = false;

  name = '';
  bio = '';
  photoUrl = '';
  selectedCategories = signal<string[]>([]);
  savedProfile = signal(false);
  savedPrefs = signal(false);

  constructor() {
    const p = this.profile();
    if (p && !this.formInitialized) {
      this.name = p.name;
      this.bio = p.bio ?? '';
      this.photoUrl = p.photoUrl ?? '';
      this.selectedCategories.set([...p.preferences.categories]);
      this.formInitialized = true;
    }
  }

  toggleCategory(c: string): void {
    this.selectedCategories.update((categories) =>
      categories.includes(c) ? categories.filter((x) => x != c) : [...categories, c],
    );
  }

  saveProfile(): void {
    const user = this.currentUser();
    if (!user) return;
    this.userService.updateProfile(user.uid, {
      name: this.name,
      bio: this.bio,
      photoUrl: this.photoUrl,
    });
    this.savedProfile.set(true);
    setTimeout(() => this.savedProfile.set(false), 2000);
  }

  savePreferences(): void {
    const user = this.currentUser();
    const p = this.profile();
    if (!user || !p) return;
    this.userService.savePreferences(user.uid, {
      ...p.preferences,
      categories: this.selectedCategories(),
    });
    this.savedPrefs.set(true);
    setTimeout(() => this.savedPrefs.set(false), 2000);
  }

  signOut(): void{
    this.authService.logout();
    this.userService.clearActiveProfile();
    this.router.navigate(['/']);
  }
}
