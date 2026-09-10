import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { AuthUser } from '../../models/user.model';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);

  errorMessage = signal<string | null>(null);

  async signInWithGoogle(): Promise<void> {
    try {
      this.errorMessage.set(null);
      const user = await this.authService.signInWithGoogle();
      if (user) {
        this.completeSignIn(user);
      }
    } catch (err: any) {
      console.error('Error during Google sign-in:', err);
      this.errorMessage.set(
        err?.code === 'auth/popup-closed-by-user'
          ? 'Sign-in cancelled. Please try again.'
          : 'Authentication failed. Please check your connection and configuration.'
      );
    }
  }

  completeSignIn(user: AuthUser): void {
    const {profile, isFirstLogin} = this.userService.loadOrCreateProfile(user);

    if(isFirstLogin || !profile.onboardingComplete){
      this.router.navigate(['/onboarding']);
      return;
    }
    this.router.navigate(['/']);
  }
}
