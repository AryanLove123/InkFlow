import { Injectable, signal } from '@angular/core';

export type FeedTab = 'latest' | 'popular' | 'forYou';

@Injectable({
  providedIn: 'root',
})
export class HomeFeedStateService {
  tab = signal<FeedTab>('latest');
  page = signal(1);

  setTab(tab: FeedTab): void {
    this.tab.set(tab);
    this.page.set(1);
  }

  setPage(page: number): void {
    this.page.set(page);
  }
}
