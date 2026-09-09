import { Component, Input } from '@angular/core';
import { UserProfile } from '../../../models/user.model';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-author-card',
  imports: [RouterLink],
  templateUrl: './author-card.component.html',
  styleUrl: './author-card.component.scss',
})
export class AuthorCardComponent {
  @Input() author!: UserProfile;
  @Input() articleCount?: number;
}
