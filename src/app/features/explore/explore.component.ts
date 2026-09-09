import { Component, computed, inject, signal } from '@angular/core';
import { ArticleService } from '../../core/services/article.service';
import { UserService } from '../../core/services/user.service';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { TagChipComponent } from '../../shared/components/tag-chip/tag-chip.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';

@Component({
  selector: 'app-explore',
  imports: [SearchBarComponent, TagChipComponent, EmptyStateComponent, PaginationComponent, ArticleCardComponent],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss',
})
export class ExploreComponent {
  articleService = inject(ArticleService);
  userService = inject(UserService);

  query = signal('');
  activeTag = signal<string | null>(null);
  page = signal(1);
  pageSize = 9;

  popularTags = computed(() => this.articleService.popularTags().slice(0, 12));

  articleResults = computed(() => {
    const q = this.query();
    const tag = this.activeTag();
    if (tag) return this.articleService.byTag(tag);
    if (q) return this.articleService.search(q);
    return this.articleService.latestArticles();
  });

  pagedArticles = computed(() =>
    this.articleService.paginate(this.articleResults(), this.page(), this.pageSize),
  );

  onQuery(q: string): void {
    this.query.set(q);
    this.activeTag.set(null);
    this.page.set(1);
  }

  onTagClick(tag: string): void {
    this.activeTag.set(this.activeTag() === tag ? null : tag);
    this.query.set('');
    this.page.set(1);
  }

  onPageChange(p: number): void {
    this.page.set(p);
  }
}
