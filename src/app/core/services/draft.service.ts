import { computed, Injectable, signal } from '@angular/core';
import { ArticleDraft } from '../../models/article.model';
import { STORAGE_KEYS, StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class DraftService {
  draftRecords = signal<Record<string, ArticleDraft>>({});
  drafts = computed(() => Object.values(this.draftRecords()));

  constructor(private storageService: StorageService) {
    const saved = this.storageService.get<Record<string, ArticleDraft>>(STORAGE_KEYS.DRAFTS);
    if (saved) this.draftRecords.set(saved);
  }

  persistDrafts(): void {
    this.storageService.set(STORAGE_KEYS.DRAFTS, this.draftRecords());
  }

  getDraftById(id: string): ArticleDraft | null {
    return this.draftRecords()[id] ?? null;
  }

  getDraftByAuthorId(authorId: string): ArticleDraft[] {
    return this.drafts()
      .filter((d) => d.authorId == authorId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  save(draft: Partial<ArticleDraft> & { authorId: string }): ArticleDraft {
    const now = new Date().toISOString();
    const id = draft.id ?? `draft_${Date.now()}`;
    const existing = this.draftRecords()[id];

    const full: ArticleDraft = {
      id,
      authorId: draft.authorId,
      title: draft.title ?? existing?.title ?? '',
      description: draft.description ?? existing?.description ?? '',
      content: draft.content ?? existing?.content ?? '',
      thumbnail: draft.thumbnail ?? existing?.thumbnail,
      category: draft.category ?? existing?.category ?? '',
      tags: draft.tags ?? existing?.tags ?? [],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      originalArticleId: draft.originalArticleId ?? existing?.originalArticleId,
    };

    this.draftRecords.update((drafts) => ({
      ...drafts,
      [id]: full,
    }));
    this.persistDrafts();
    return full;
  }

  delete(id: string): void {
    this.draftRecords.update((drafts) => {
      const { [id]: _removed, ...rest } = drafts;
      return rest;
    });
    this.persistDrafts();
  }
}
