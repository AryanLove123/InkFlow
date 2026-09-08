import { Component, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Article } from '../../../models/article.model';
import { CompactNumberPipe } from '../../pipes/compact-number.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

@Component({
  selector: 'app-article-card',
  imports: [RouterLink, CompactNumberPipe, RelativeTimePipe],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.scss',
})
export class ArticleCardComponent {
  @Input() article!: Article;
  @Input() badge?: string;
  @Input() isFeatured = false;
}
