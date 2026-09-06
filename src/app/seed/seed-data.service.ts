import { Injectable } from '@angular/core';
import { STORAGE_KEYS, StorageService } from '../core/storage/storage.service';
import { Article, CATEGORIES } from '../models/article.model';
import { UserProfile } from '../models/user.model';
import { SEED_ARTICLES, SEED_AUTHORS, SEED_CONTENT_PARAGRAPHS } from './constants';

@Injectable({
  providedIn: 'root',
})
export class SeedDataService {
  constructor(private storageService: StorageService) {}

  seedOnStartup() {
    const hasSeeded = this.storageService.has(STORAGE_KEYS.HAS_SEEDED);
    if(hasSeeded) return;
    this.seedUsers();
    this.seedArticles();
    this.storageService.set(STORAGE_KEYS.HAS_SEEDED, true);
  }

  avatarSeedToUrl(seed: string): string {
    return `https://avatars.dicebear.com/api/avataaars/${seed}.svg`;
  }

  seedUsers() : void {
    const Profiles: Record<string, UserProfile> = {};
    SEED_AUTHORS.forEach((author,i) => {
      Profiles[author.uid] = {
        id: author.uid,
        name: author.name,
        email: author.email,
        bio: author.bio,
        photoUrl: this.avatarSeedToUrl(author.avatarSeed),
        preferences: {
          categories: [CATEGORIES[i%CATEGORIES.length], CATEGORIES[(i+1)%CATEGORIES.length]],
          tags: [],
          authors: [],
        },
        createdAt: new Date().toISOString(),
        onboardingComplete: true,
      };
    });
    this.storageService.set(STORAGE_KEYS.USERS, Profiles);
  }

  seedArticles() :  Article[] {
    const now = Date.now();
    const byId: Record<string, Article> = {};
    const articles: Article[] = SEED_ARTICLES.reduce((acc, spec, i) => {
      const id = `article_${i + 1}`;
      const author = SEED_AUTHORS[spec.authorIndex];
      const createdAt = new Date(now - spec.daysAgo * 24 * 60 * 60 * 1000).toISOString();
      const contentParas = this.pickContentParagraphs(i);
      const article: Article = {
        id,
        title: spec.title,
        description: spec.description,
        content: contentParas.join('\n\n'),
        thumbnail: `https://picsum.photos/seed/${i}/600/400`,
        authorId: author.uid,
        authorName: author.name,
        authorAvatar: this.avatarSeedToUrl(author.avatarSeed),
        category: spec.category,
        tags: spec.tags,
        createdAt,
        updatedAt: createdAt,
        publishedAt: createdAt,
        status: 'published',
        views: spec.views,
        likes: spec.likeCount,
        likedBy: [],
        commentCount: 0,
      };
      byId[id] = article;
      acc.push(article);
      return acc;
    }, [] as Article[]);
    this.storageService.set(STORAGE_KEYS.ARTICLES, byId);
    return articles;
  }

  pickContentParagraphs(seedIndex: number): string[] {
    const offset = seedIndex % SEED_CONTENT_PARAGRAPHS.length;
    const rotated = [...SEED_CONTENT_PARAGRAPHS.slice(offset), ...SEED_CONTENT_PARAGRAPHS.slice(0, offset)];
    return rotated.slice(0, 3);
  }
}
