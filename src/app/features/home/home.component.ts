import { Component, computed, effect, inject, signal } from '@angular/core';
import { ArticleService } from '../../core/services/article.service';
import { WorkerOrchestratorService } from '../../core/services/worker-orchestrator.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { FeedTab, HomeFeedStateService } from '../../core/services/home-feed-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Article } from '../../models/article.model';
import { AuthUser, UserPreferences } from '../../models/user.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ArticleCardComponent, PaginationComponent, EmptyStateComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  articleService = inject(ArticleService);
  rankingOrchestratorService = inject(WorkerOrchestratorService);
  feedStateService = inject(HomeFeedStateService);

  currentUser = toSignal(this.authService.currentUser$, {initialValue: null});

  tab = this.feedStateService.tab;
  page = this.feedStateService.page;
  pageSize = 8;

  featuredArticles = computed(() => this.articleService.featuredArticles());

  //this is kept as a signal because it is used in the templates 
  // and the results are coming from the async operation of workers which returns a promise 
  // and template need to react to those updates
  rankedArticles = signal<Article[]>([]);

  isRanking = signal(false);
  paged = computed(() => this.articleService.paginate(this.rankedArticles(), this.page(), this.pageSize));

  constructor(){
    effect((onCleanup) => {
      const tab = this.tab();
      const articles = this.articleService.publishedArticles();
      const user = this.currentUser();
      const preferences = user ? this.userService.activeProfile()?.preferences : undefined;

      let cancelled = false;
      onCleanup(() =>{
        cancelled = true;
      });

      //ranking articles started
      this.isRanking.set(true);
      this.computeRanking(tab, articles, user, preferences).then((ranked) =>{
        if(!cancelled){
          this.rankedArticles.set(ranked);
        }
      }).finally(()=>{
        if(!cancelled){
          this.isRanking.set(false);
        }
      })
    }) 
  }

  setTab(tab: FeedTab): void{
    this.feedStateService.setTab(tab);
  }

  onPageChange(p: number): void {
    this.feedStateService.setPage(p);
  }

  async computeRanking(
    tab: FeedTab,
    articles: Article[],
    user: AuthUser | null,
    preferences: UserPreferences | undefined
  ): Promise<Article[]>{
    if(tab == 'latest'){
      return this.articleService.latestArticles();
    }
    if(tab == 'popular'){
      return this.rankingOrchestratorService.rankPopular(articles);
    }
    if(!user || !preferences){
      return [];
    }

    const likedAuthorIds = new Set<string>();
    const likedCategories = new Set<string>();

    articles.forEach((a) =>{
      if(a.likedBy.includes(user.uid)){
        likedAuthorIds.add(a.authorId);
        likedCategories.add(a.category);
      }
    });

    const viewedArticleIds = this.articleService.getViewedArticleIds(user.uid);

    return this.rankingOrchestratorService.rankRecommended(
      articles,
      preferences,
      {
        likedAuthorIds: [...likedAuthorIds],
        likedCategories: [...likedCategories],
        viewedArticleIds
      }
    );
  }
}
