import { Component, computed, inject } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { ArticleService } from '../../core/services/article.service';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';

@Component({
  selector: 'app-author-profile',
  imports: [EmptyStateComponent, ArticleCardComponent],
  templateUrl: './author-profile.component.html',
  styleUrl: './author-profile.component.scss',
})
export class AuthorProfileComponent {
  userService = inject(UserService);
  articleService = inject(ArticleService);
  route = inject(ActivatedRoute);

  authorId = toSignal(this.route.paramMap.pipe(), { initialValue: this.route.snapshot.paramMap });

  author = computed(() => {
    const id = this.authorId().get('id');
    return id ? this.userService.getProfile(id) : null;
  });

  articles = computed(() => {
    const id = this.authorId().get('id');

    return id
      ? this.articleService
          .byAuthor(id)
          .sort(
            (a, b) =>
              new Date(b.publishedAt ?? b.createdAt).getTime() -
              new Date(a.publishedAt ?? a.createdAt).getTime(),
          )
      : [];
  });
}
