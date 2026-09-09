import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ArticleService } from '../../core/services/article.service';
import { RecommendationService } from '../../core/services/recommendation.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { CompactNumberPipe } from '../../shared/pipes/compact-number.pipe';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';

@Component({
  selector: 'app-article-detail',
  imports: [RelativeTimePipe, CompactNumberPipe, ArticleCardComponent, RouterLink],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
})
export class ArticleDetailComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);
  articleService = inject(ArticleService);
  authService = inject(AuthService);
  userService = inject(UserService);
  recommendationService = inject(RecommendationService);

  viewTrackingSet = new Set<string>();

  paramMap = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  currentUser = toSignal(this.authService.currentUser$, {initialValue: null});

  articleId = computed(() => this.paramMap().get('id')?? '');
  article = computed(() => this.articleService.getArticleById(this.articleId()));

  author = computed(() => {
    const a = this.article();
    return a ? this.userService.getProfile(a.authorId) : null;
  });

  otherArticlesFromAuthor = computed(() =>{
    const a = this.article();
    if(!a) return [];
    return this.articleService.getArticlesByAuthorId(a.authorId).filter((x) => x.id != a.id).slice(0.3);
  });

  relatedArticles = computed(()=>{
    const a = this.article();
    if(!a) return [];
    return this.recommendationService.findRelatedArticles(a, this.articleService.publishedArticles(), 4);
  });

  isLiked = computed(()=>{
    const user = this.currentUser();
    const a = this.article();
    return !!user && !!a && a.likedBy.includes(user.uid);
  });

  constructor(){
    effect(() =>{
      const id = this.articleId();
      const article = this.articleService.getArticleById(id);
      if (!article || this.viewTrackingSet.has(id)) return;
      this.viewTrackingSet.add(id);
      this.articleService.incrementView(id);
      const user =  this.currentUser();
      if(user){
        this.articleService.recordViewedBy(user.uid, id);
      }
    });
  }

  toggleLike():void{
    const user = this.currentUser();
    const a = this.article();
    if(!user || !a){
      this.router.navigate(['/login'], {queryParams: {redirect: this.router.url}});
      return;
    }
    this.articleService.toggleLike(a.id, user.uid);
  }

}
