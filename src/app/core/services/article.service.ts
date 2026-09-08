import { computed, inject, Injectable, signal } from '@angular/core';
import { Article } from '../../models/article.model';
import { STORAGE_KEYS, StorageService } from '../storage/storage.service';
import { PopularityService } from './popularity.service';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  constructor(
    private storageService: StorageService,
    private popularityService: PopularityService,
  ) {
    const saved = this.storageService.get<Record<string, Article>>(STORAGE_KEYS.ARTICLES);
    if (saved) {
      this.articleRecord.set(saved);
    }
  }
  articleRecord = signal<Record<string, Article>>({});

  articles = computed(() => Object.values(this.articleRecord()));

  publishedArticles = computed(() =>
    this.articles().filter((article) => article.status === 'published'),
  );

  latestArticles = computed(() =>
    [...this.publishedArticles()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );

  popularArticles = computed(() =>
    this.popularityService.sortByPopularity(this.publishedArticles()),
  );

  featuredArticles = computed(() =>
    this.popularityService.selectFeatured(this.publishedArticles()),
  );

  persistArticles() {
    this.storageService.set(STORAGE_KEYS.ARTICLES, this.articleRecord());
  }

  getArticleById(articleId: string): Article | null {
    return this.articleRecord()[articleId] ?? null;
  }

  deleteArticle(articleId: string): void {
    this.articleRecord.update((articles) => {
      const { [articleId]: _, ...rest } = articles;
      return rest;
    });
    this.persistArticles();
  }

  recordViewedBy(userId: string, articleId: string): void {
    const viewedArticles = this.storageService.get<Record<string, string[]>>(STORAGE_KEYS.VIEWED_ARTICLES) ?? {};
    const viewedArticleByUser = viewedArticles[userId] ?? [];

    if (!viewedArticleByUser.includes(articleId)) {
      viewedArticles[userId] = [...viewedArticleByUser, articleId];
      this.storageService.set(STORAGE_KEYS.VIEWED_ARTICLES, viewedArticles);
    }
  }

  getViewedArticleIds(userId: string): string[] {
    const viewedArticles =
      this.storageService.get<Record<string, string[]>>(STORAGE_KEYS.VIEWED_ARTICLES) ?? {};
    return viewedArticles[userId] ?? [];
  }

  getArticlesByAuthorId(authorId: string): Article[] {
    return this.publishedArticles().filter((a) => a.authorId == authorId);
  }

  toggleLike(articleId: string, userId: string): void {
    this.articleRecord.update((articles) => {
      const existing = articles[articleId];
      if (!existing) return articles;

      const alreadyLiked = existing.likedBy.includes(userId);
      const likedBy = alreadyLiked
        ? existing.likedBy.filter((id) => id != userId)
        : [...existing.likedBy, userId];

      return {
        ...articles,
        [articleId]: { ...existing, likedBy, likes: likedBy.length },
      };
    });
    this.persistArticles();
  }

  incrementView(articleId: string): void{
    this.articleRecord.update((articles) =>{
      const existing = articles[articleId];
      if(!existing) return articles;
      return {...articles, [articleId]: {...existing, views: existing.views+1}};
    });
    this.persistArticles();
  }

  paginate<T>(
    items: T[],
    page: number,
    pageSize = 10,
  ): { items: T[]; totalPages: number; page: number } {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), totalPages, page: safePage };
  }
}
