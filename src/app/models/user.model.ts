export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  photoUrl?: string;
}
export interface UserPreferences {
  categories: string[];
  tags: string[];
  authors: string[];
}
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  bio?: string;
  preferences: UserPreferences;
  createdAt: string;
  onboardingComplete: boolean;
}