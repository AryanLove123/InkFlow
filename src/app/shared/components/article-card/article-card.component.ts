import { Component, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Article } from '../../../models/article.model';

@Component({
  selector: 'app-article-card',
  imports: [RouterLink],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.scss',
})
export class ArticleCardComponent {
  @Input() article!: Article;
  @Input() badge?: string;
  @Input() isFeatured = false;
}
