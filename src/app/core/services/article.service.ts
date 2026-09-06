import { computed, inject, Injectable, signal } from '@angular/core';
import { Article } from '../../models/article.model';
import { STORAGE_KEYS, StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private storageService = inject(StorageService);
  articleRecord = signal<Record<string, Article>>({});

  articles = computed(() => Object.values(this.articleRecord()));

  publishedArticles = computed(() => this.articles().filter((article) => article.status === 'published'));

  latestArticles = computed(() =>
    this.publishedArticles().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
}
