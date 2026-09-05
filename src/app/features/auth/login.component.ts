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

  signInWithGoogle(): void {
    this.authService.signInWithGoogle().then((user) => {
      if (user) {
        this.completeSignIn(user);
      }
    }), (err: Error) => {
      console.error('Error during Google sign-in:', err);
      this.errorMessage.set(
          err.name === 'auth/popup-closed-by-user'
            ? 'Sign-in cancelled. Please try again.'
            : 'Authentication failed. Please check your connection and configuration.'
        );
    };
  }

  completeSignIn(user: AuthUser): void {
    this.authService.completeSignIn(user);
    const {profile, isFirstLogin} = this.userService.loadOrCreateProfile(user);

    if(isFirstLogin || !profile.onboardingComplete){
      this.router.navigate(['/onboarding']);
      return;
    }
    this.router.navigate(['/']);
  }
}
