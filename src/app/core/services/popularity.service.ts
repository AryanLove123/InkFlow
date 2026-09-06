import { Injectable } from '@angular/core';
import { Article } from '../../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class PopularityService {
  HALF_LIFE_DAYS = 14;

  calculatePopularityScore(article: Article): number {
    return article.views * 1 + article.likes * 5 + article.commentCount * 3;
  }

  calculateRecencyMultiplier(article: Article): number {
    const publishedAt = article.publishedAt ?? article.createdAt;
    const ageDays = (Date.now() - new Date(publishedAt).getTime()) / 86400000;
    const recencyMultiplier = Math.pow(0.5, Math.max(ageDays, 0) / this.HALF_LIFE_DAYS);
    return Math.max(recencyMultiplier, 0.05);
  }

  calculateFinalScore(article: Article): number {
    return this.calculatePopularityScore(article) * this.calculateRecencyMultiplier(article);
  }

  calculateFeaturedScore(article: Article): number {
    const recencyBonus = this.calculateRecencyMultiplier(article) * 50;
    return this.calculateFinalScore(article) + recencyBonus;
  }

  sortByPopularity(articles: Article[]): Article[] {
    return [...articles].sort((a, b) => this.calculateFinalScore(b) - this.calculateFinalScore(a));
  }

  selectFeatured(articles: Article[], count = 5): Article[] {
    return [...articles]
      .filter((a) => a.status == 'published')
      .sort((a, b) => this.calculateFeaturedScore(b) - this.calculateFeaturedScore(a))
      .slice(0, count);
  }
}
