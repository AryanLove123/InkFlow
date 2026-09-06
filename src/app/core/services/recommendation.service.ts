import { Injectable } from '@angular/core';
import { PopularityService } from './popularity.service';
import { Article } from '../../models/article.model';
import { UserPreferences } from '../../models/user.model';
import { score } from 'firebase/firestore/pipelines';

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  constructor(private popularityService: PopularityService) {}

  scoreArticle(
    article: Article,
    preferences: UserPreferences,
    context: {
      likedAuthorIds: Set<string>;
      likedCategories: Set<string>;
      viewedArticleIds: Set<string>;
    },
  ): number {
    let score = 0;
    if (preferences.categories.includes(article.category)) score += 10;
    const matchingTags = article.tags.filter((t) => preferences.tags.includes(t));
    score += matchingTags.length * 5;

    if (context.likedAuthorIds.has(article.authorId)) score += 3;
    if (context.likedCategories.has(article.category)) score += 3;
    if (context.viewedArticleIds.has(article.id)) score -= 1;

    score += this.popularityService.calculateFinalScore(article) * 0.001;
    return score;
  }

  rankForUser(
    articles: Article[],
    preferences: UserPreferences,
    context: {
      likedAuthorIds: Set<string>;
      likedCategories: Set<string>;
      viewedArticleIds: Set<string>;
    },
  ): Article[] {
    return [...articles]
      .filter((a) => a.status == 'published')
      .map((a) => ({ article: a, score: this.scoreArticle(a, preferences, context) }))
      .sort((a, b) => b.score - a.score)
      .map((a) => a.article);
  }
}
