import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { UserService } from './core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('inkflow');

  authService = inject(AuthService);
  userService = inject(UserService);
  router= inject(Router);

  currentUser = toSignal(this.authService.currentUser$, {initialValue: null});

  profile = computed(() => {
    const user = this.currentUser();
    return user ? this.userService.getProfile(user.uid) : null;
  });

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void{
    this.authService.logout();
    this.userService.clearActiveProfile();
    this.closeMenu();
    this.router.navigate(['/']);

  }
}
