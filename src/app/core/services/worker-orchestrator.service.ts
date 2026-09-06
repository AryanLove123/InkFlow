import { Injectable } from '@angular/core';
import { PopularityService } from './popularity.service';
import { RecommendationService } from './recommendation.service';
import { Article } from '../../models/article.model';
import { UserPreferences } from '../../models/user.model';

interface RankContext {
  likedAuthorIds: string[];
  likedCategories: string[];
  viewedArticleIds: string[];
}

const WORKER_TIMEOUT_MS = 4000;

@Injectable({
  providedIn: 'root',
})
export class WorkerOrchestratorService {
  worker: Worker | null = null;
  requestCounter = 0;
  pending = new Map<
    number,
    { resolve: (ids: string[]) => void; timeoutId: ReturnType<typeof setTimeout> }
  >(); // it tracks the in-flight requests to the worker
  // or we can say that it acts as a lookup table
  // so the service can match a worker response back to the correct promise that's waiting for it
  // and cancel the timeout once the response arrives.

  constructor(
    private popularityService: PopularityService,
    private recommendationService: RecommendationService,
  ) {
    if (typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(new URL('../../workers/ranking.worker', import.meta.url));

        this.worker.onmessage = ({ data }) => {
          if (data?.type == 'rank-result') {
            this.settle(data.payload.requestId, data.payload.rankedIds);
          }
        };

        this.worker.onerror = (event) => {
          console.error(
            '[WorkerOrchestrator] Worker Crashed, using the fallback main-thread ranking',
            event,
          );
          this.worker = null;
          this.pending.forEach(({ resolve, timeoutId }) => {
            clearTimeout(timeoutId);
            resolve([]);
          });
          this.pending.clear();
        };
      } catch (err) {
        console.error('[WorkerOrchestartor] Failed to construct a worker', err);
        this.worker = null;
      }
    }
  }

  settle(requestId: number, rankedArticleIds: string[]): void {
    const entry = this.pending.get(requestId);
    if (!entry) return;

    clearTimeout(entry.timeoutId);
    entry.resolve(rankedArticleIds);
    this.pending.delete(requestId);
  }

  postToWorker(
    mode: 'popular' | 'featured' | 'recommend',
    articles: Article[],
    preferences?: UserPreferences,
    context?: RankContext,
  ): Promise<string[]> {
    const requestId = ++this.requestCounter;

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        if (this.pending.has(requestId)) {
          console.warn(
            `[WorkerOrchestartor] Worker request ${requestId} (${mode}) timed out after ${WORKER_TIMEOUT_MS}ms —  using fallback.`,
          );
          this.pending.delete(requestId);
          resolve([]);
        }
      }, WORKER_TIMEOUT_MS);

      this.pending.set(requestId, {resolve, timeoutId});

      try{
        this.worker!.postMessage({
          type: 'rank',
          payload:{
            requestId,
            mode,
            articles: articles.map((a) =>({
              id: a.id,
              views: a.views,
              likes: a.likes,
              commentCount: a.commentCount,
              publishedAt: a.publishedAt,
              createdAt: a.createdAt,
              category: a.category,
              tags: a.tags,
              authorId: a.authorId,
              status: a.status
            })),
            preferences,
            context
          }
        });
      }catch(err){
        console.error('[WorkerOrchestrator] post message failed, now using fallback', err);
        this.settle(requestId, []);
      }
    });
  }

  reorder(articles: Article[], orderedIds: string[]): Article[]{
    const byId =  new Map(articles.map((a) => [a.id, a]));
    return orderedIds.map((id) => byId.get(id)!).filter(Boolean);
  }

  async rankPopular(articles: Article[]): Promise<Article[]> {
    if (!this.worker) return this.popularityService.sortByPopularity(articles);
    const ids = await this.postToWorker('popular', articles);
    return ids.length ? this.reorder(articles, ids) : this.popularityService.sortByPopularity(articles);
  }

  async rankFeatured(articles: Article[]): Promise<Article[]> {
    if (!this.worker) return this.popularityService.selectFeatured(articles, articles.length);
    const ids = await this.postToWorker('featured', articles);
    return ids.length
      ? this.reorder(articles, ids)
      : this.popularityService.selectFeatured(articles, articles.length);
  }

  async rankRecommended(
    articles: Article[],
    preferences: UserPreferences,
    context: RankContext,
  ): Promise<Article[]> {
    const fallback = () =>
      this.recommendationService.rankForUser(articles, preferences, {
        likedAuthorIds: new Set(context.likedAuthorIds),
        likedCategories: new Set(context.likedCategories),
        viewedArticleIds: new Set(context.viewedArticleIds),
      });

    if (!this.worker) return fallback();
    const ids = await this.postToWorker('recommend', articles, preferences, context);
    return ids.length ? this.reorder(articles, ids) : fallback();
  }
}
