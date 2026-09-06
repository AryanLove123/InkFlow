import { Injectable } from '@angular/core';

const prefix = 'inkflow_';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  key(key: string): string {
    return `${prefix}${key}`;
  }

  get<T>(key: string): T | null {
    const item = localStorage.getItem(this.key(key));
    
    if (item) {
      try {
        return JSON.parse(item) as T;
      } catch (error) {
        console.error('Error parsing item from storage:', error);
        return null;
      }
    }
    return null;
  }

  set<T>(key: string, value: T): boolean {
    try{
      localStorage.setItem(this.key(key), JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting item in storage:', error);
      return false;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.key(key));
  }

  has(key: string): boolean {
    return localStorage.getItem(this.key(key)) !== null;
  }

  clear(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
  }
}

export const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER_ID: 'current_user_id',
  ARTICLES: 'articles',
  HAS_SEEDED: 'hasSeeded',
} as const;
