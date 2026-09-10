import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { ArticleService } from '../../core/services/article.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [EmptyStateComponent,RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  articleService = inject(ArticleService);

  currentUser = toSignal(this.authService.currentUser$, {initialValue: null});

  profile = computed(() =>{
    const user = this.currentUser();
    return user? this.userService.getProfile(user.uid) : null;
  });

  myArticles = computed(() =>{
    const user = this.currentUser();
    return user ? this.articleService.getArticlesByAuthorId(user.uid).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) : [];
  })

  delete(id: string): void{
    if(confirm('Delete this article permanently?')){
      this.articleService.deleteArticle(id);
    }
  }

}
