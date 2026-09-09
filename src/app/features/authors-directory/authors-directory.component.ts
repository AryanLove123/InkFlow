import { Component, computed, inject, signal } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { ArticleService } from '../../core/services/article.service';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { AuthorCardComponent } from '../../shared/components/author-card/author-card.component';

@Component({
  selector: 'app-authors-directory',
  imports: [SearchBarComponent, EmptyStateComponent, AuthorCardComponent],
  templateUrl: './authors-directory.component.html',
  styleUrl: './authors-directory.component.scss',
})
export class AuthorsDirectoryComponent {
  userService = inject(UserService);
  articleService = inject(ArticleService);
  query = signal('');

  results = computed(() =>{
    const q = this.query().trim().toLocaleLowerCase();
    const profiles = this.userService.getAllProfiles();
    return q ? profiles.filter((a) => a.name.toLowerCase().includes(q)) : profiles;
  })
}
