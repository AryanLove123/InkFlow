import { computed, inject, Injectable, signal } from '@angular/core';
import { Article, ArticleDraft } from '../../models/article.model';
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
    this.publishDueScheduledArticles();
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

  popularTags = computed(() => {
    const counts = new Map<string, number>();
    this.publishedArticles().forEach((a) => a.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  });

  persistArticles() {
    this.storageService.set(STORAGE_KEYS.ARTICLES, this.articleRecord());
  }

  getArticleById(articleId: string): Article | null {
    return this.articleRecord()[articleId] ?? null;
  }

  byTag(tag: string): Article[] {
    return this.publishedArticles().filter((a) => a.tags.includes(tag));
  }

  search(query: string): Article[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.publishedArticles().filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  deleteArticle(articleId: string): void {
    this.articleRecord.update((articles) => {
      const { [articleId]: _, ...rest } = articles;
      return rest;
    });
    this.persistArticles();
  }

  recordViewedBy(userId: string, articleId: string): void {
    const viewedArticles =
      this.storageService.get<Record<string, string[]>>(STORAGE_KEYS.VIEWED_ARTICLES) ?? {};
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

  incrementView(articleId: string): void {
    this.articleRecord.update((articles) => {
      const existing = articles[articleId];
      if (!existing) return articles;
      return { ...articles, [articleId]: { ...existing, views: existing.views + 1 } };
    });
    this.persistArticles();
  }

  publish(draft: ArticleDraft, authorName: string, authorAvatar?: string): Article {
    const now = new Date().toISOString();
    const existing = draft.originalArticleId ? this.articleRecord()[draft.originalArticleId] : null;

    const article: Article = existing
      ? {
          ...existing,
          title: draft.title,
          description: draft.description,
          content: draft.content,
          thumbnail: draft.thumbnail,
          category: draft.category,
          tags: draft.tags,
          updatedAt: now,
        }
      : {
          id: `article_${Date.now()}`,
          title: draft.title,
          description: draft.description,
          content: draft.content,
          thumbnail: draft.thumbnail,
          authorId: draft.authorId,
          authorName,
          authorAvatar,
          category: draft.category,
          tags: draft.tags,
          status: 'published',
          createdAt: now,
          updatedAt: now,
          publishedAt: now,
          views: 0,
          likes: 0,
          likedBy: [],
          commentCount: 0,
        };
    this.articleRecord.update((articles) => ({ ...articles, [article.id]: article }));
    this.persistArticles();
    return article;
  }

  schedule(draft: ArticleDraft, authorName: string, scheduledAt: string,  authorAvatar?: string): Article{
    const now = new Date().toISOString();
    const article: Article ={
      id: draft.originalArticleId ?? `article_${Date.now()}`,
      title: draft.title,
      description: draft.description,
      content: draft.content,
      thumbnail: draft.thumbnail,
      authorId: draft.authorId,
      authorName,
      authorAvatar,
      category: draft.category,
      tags: draft.tags,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
      scheduledAt,
      views: 0,
      likes: 0,
      likedBy: [],
      commentCount: 0
    };
    this.articleRecord.update((articles) => ({...articles, [article.id]: article}));
    this.persistArticles();
    return article;
  }

  publishDueScheduledArticles(): void{
    const now = Date.now();
    let changed = false;
    this.articleRecord.update((articles) => {
      const allArticles = {...articles};
      Object.values(allArticles).forEach((a) => {
        if(a.status == 'scheduled' && a.scheduledAt && new Date(a.scheduledAt).getTime() <=now){
          allArticles[a.id] = {...a, status: 'published', publishedAt: a.scheduledAt};
          changed = true;
        }
      });
      return allArticles;
    });
    if(changed){
      this.persistArticles();
    }
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
