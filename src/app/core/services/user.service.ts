import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthUser, UserPreferences, UserProfile } from '../../models/user.model';
import { STORAGE_KEYS, StorageService } from '../storage/storage.service';
import { auth } from '../../firebase.config';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private storageService: StorageService){
    const savedUsers = this.storageService.get<Record<string, UserProfile>>(STORAGE_KEYS.USERS);
    if(savedUsers) this.profiles.set(savedUsers);
  }
  profiles = signal<Record<string, UserProfile>>({});
  activeProfileId = signal<string | null>(null);

  activeProfile = computed(() => {
    const id = this.activeProfileId();
    return id ? this.profiles()[id] : null;
  });

  persistProfiles() {
    this.storageService.set(STORAGE_KEYS.USERS, this.profiles());
  }

  loadOrCreateProfile(authUser: AuthUser): { profile: UserProfile; isFirstLogin: boolean } {
    const existing = this.profiles()[authUser.uid];
    if (existing) {
      this.activeProfileId.set(authUser.uid);
      return { profile: existing, isFirstLogin: false };
    } else {
      const newProfile: UserProfile = {
        id: authUser.uid,
        name: authUser.name,
        email: authUser.email,
        photoUrl: authUser.photoUrl,
        preferences: {
          categories: [],
          tags: [],
          authors: [],
        },
        createdAt: new Date().toISOString(),
        onboardingComplete: false,
      };
      this.profiles.update((profiles) => ({ ...profiles, [authUser.uid]: newProfile }));
      this.activeProfileId.set(authUser.uid);
      this.persistProfiles();
      return { profile: newProfile, isFirstLogin: true };
    }
  }

  savePreferences(userId: string, preferences: UserPreferences): void {
    this.profiles.update((profiles) => {
      const existing = profiles[userId];
      if (!existing) return profiles;
      return {
        ...profiles,
        [userId]: { ...profiles[userId], preferences, onboardingComplete: true },
      };
    });
    this.persistProfiles();
  }

  updateProfile(userId: string, updatedData: Partial<UserProfile>): void {
    this.profiles.update((profiles) => ({
      ...profiles,
      [userId]: { ...profiles[userId], ...updatedData },
    }));
    this.persistProfiles();
  }

  getProfile(userId: string): UserProfile | null {
    return this.profiles()[userId] ?? null;
  }
}
