import { Injectable, signal } from '@angular/core';
import { AuthUser } from '../../models/user.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../../firebase.config';
import { STORAGE_KEYS, StorageService } from '../storage/storage.service';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  _currentUser$ = new BehaviorSubject<AuthUser | null>(null);

  currentUser$ = this._currentUser$.asObservable();

  currentUserSignal = signal<AuthUser | null>(null);

  authReady = signal(false);

  constructor(private storageService: StorageService) {
    this.initFirebaseSessionListener();
  }

  initFirebaseSessionListener(): void {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const authUser: AuthUser = {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          photoUrl: user.photoURL || ''
        };
        this.setUser(authUser);
      } else {
        this.setUser(null);
      }
      this.authReady.set(true);
    });
  }

  async signInWithGoogle(): Promise<AuthUser | null> {
    try{
      const cred = await signInWithPopup(auth, googleAuthProvider);

      const user ={
        uid: cred.user.uid,
        name: cred.user.displayName || '',
        email: cred.user.email || '',
        photoUrl: cred.user.photoURL || ''
      };
      return user? user: null;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await auth.signOut().then(() => {
        this.storageService.clear();
        this.setUser(null);
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  setUser(user: AuthUser | null): void {
    this._currentUser$.next(user);
    this.currentUserSignal.set(user);
  }

  completeSignIn(user: AuthUser): void {
    this.storageService.set(`auth_user_${user.uid}`, user);
    this.storageService.set(STORAGE_KEYS.CURRENT_USER_ID, user.uid);
    this.setUser(user);
  }
}
