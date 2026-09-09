import { Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ArticleDraft, CATEGORIES } from '../../models/article.model';
import { DraftService } from '../../core/services/draft.service';
import { debounceTime, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

type SaveStatus = 'idle' | 'saving' | 'saved';

@Component({
  selector: 'app-editor',
  imports: [FormsModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild('contentArea') contentArea!: ElementRef<HTMLDivElement>;

  router = inject(Router);
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  userService = inject(UserService);
  articleService = inject(ArticleService);
  draftService = inject(DraftService);

  currentUser = toSignal(this.authService.currentUser$, {initialValue: null});

  categories = CATEGORIES;

  draftId: string | null = null;
  originalArticleId: string | null = null;

  title = '';
  description = '';
  category = '';
  thumbnail = '';
  tags: string[] = [];
  tagInput = '';

  scheduling = signal(false);
  scheduledAt = '';

  saveStatus = signal<SaveStatus>('idle');
  errorMessage = signal<string | null>(null);

  contentChange$ = new Subject<void>();
  sub = this.contentChange$.pipe(debounceTime(1000)).subscribe(() => this.autoSave());

  ngOnInit(): void {
    const editId = this.route.snapshot.paramMap.get('id');  
    const draftIdParam = this.route.snapshot.queryParamMap.get('draftId');

    if(editId){
      const article = this.articleService.getArticleById(editId);
      if(article){
        this.originalArticleId = article.id;
        this.title = article.title;
        this.description = article.description;
        this.category = article.category;
        this.thumbnail = article.thumbnail ?? '';
        this.tags = [...article.tags];
        queueMicrotask(() => {
          if (this.contentArea) this.contentArea.nativeElement.innerHTML = article.content;
        });
      }
    } else if(draftIdParam){
      const draft = this.draftService.getDraftById(draftIdParam);
      if(draft){
        this.draftId = draft.id;
        this.originalArticleId = draft.originalArticleId ?? null;
        this.title = draft.title;
        this.description = draft.description;
        this.category = draft.category;
        this.thumbnail = draft.thumbnail ?? '';
        this.tags = [...draft.tags];
        queueMicrotask(() => {
          if (this.contentArea) this.contentArea.nativeElement.innerHTML = draft.content;
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  addTag(): void{
    const t = this.tagInput.trim().toLocaleLowerCase().replace(/\s+/g, '-');
    if(t && !this.tags.includes(t)){
      this.tags = [...this.tags, t];
    }
    this.tagInput= '';
  }

  removeTag(tag: string): void{
    this.tags = this.tags.filter((t) => t!=tag);
  }

  toggleScheduling(): void {
    this.scheduling.update((v) => !v);
  }

  onContentInput(): void{
    this.contentChange$.next();
  }

  exec(command: string, value?: string): void{
    this.contentArea.nativeElement.focus();
    document.execCommand(command, false, value);
    this.onContentInput();
  }

  insertLink(): void{
    const url = prompt('Link URL (https://...)');
    if(url) this.exec('createLink',url);
  }

  insertImage(): void{
    const url = prompt('Image URL (https://...)');
    if(url) this.exec('insertImage', url);
  }


  buildDraftPayload(): Omit<ArticleDraft,'id' |  'createdAt' | 'updatedAt'> & {id?: string}{
    const user =  this.currentUser()!;
    return {
      id: this.draftId ?? undefined,
      authorId: user.uid,
      title: this.title,
      description: this.description,
      content: this.contentArea?.nativeElement.innerHTML ?? '',
      thumbnail: this.thumbnail || undefined,
      category: this.category,
      tags: this.tags,
      originalArticleId: this.originalArticleId ?? undefined
    }
  }

  validate(): boolean {
    if (!this.title.trim()) {
      this.errorMessage.set('Title is required.');
      return false;
    }
    if (!this.description.trim()) {
      this.errorMessage.set('A short description is required.');
      return false;
    }
    if (!this.category) {
      this.errorMessage.set('Choose a category.');
      return false;
    }
    const content = this.contentArea?.nativeElement.innerHTML ?? '';
    if (!content.trim() || content === '<br>') {
      this.errorMessage.set('Article content cannot be empty.');
      return false;
    }
    this.errorMessage.set(null);
    return true;
  }

  autoSave(): void{
    const user = this.currentUser();
    if(!user || this.title.trim()) return;
    this.saveStatus.set('saving');
    const saved = this.draftService.save(this.buildDraftPayload());
    this.draftId = saved.id;
    this.saveStatus.set('saved');
  }


  saveDraftManually(): void{
    const user = this.currentUser();
    if(!user) return;
    if(!this.title.trim()){
      this.errorMessage.set('Give your article a title before saving');
      return;
    }
    this.errorMessage.set(null);
    const saved = this.draftService.save(this.buildDraftPayload());
    this.draftId = saved.id;
    this.saveStatus.set('saved');
    this.router.navigate(['/drafts']);
  }

  schedulePublish(): void{
    const user = this.currentUser();
    if(!user || !this.validate()) return;
    if(!this.scheduledAt){
      this.errorMessage.set("Choose a date and time to schedule this article publishing.");
      return;
    }

    const scheduledDate = new Date(this.scheduledAt);
    if(scheduledDate.getTime() <= Date.now()){
      this.errorMessage.set("Scheduled time must be in the future");
      return;
    }
    const draft: ArticleDraft = {
      ...this.buildDraftPayload(),
      id: this.draftId ?? `draft_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.articleService.schedule(draft, user.name, scheduledDate.toISOString(), user.photoUrl);
    if(this.draftId){
      this.draftService.delete(this.draftId);
    }
    this.router.navigate(['/drafts']);
  }


  publish(): void{
    const user =  this.currentUser();
    if(!user || !this.validate()) return;
    const draft: ArticleDraft = {
      ...this.buildDraftPayload(),
      id: this.draftId ?? `draft_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const article = this.articleService.publish(draft, user.name, user.photoUrl);

    if(this.draftId){
      this.draftService.delete(this.draftId);
    }

    this.router.navigate(['/article', article.id]);
  }
  
}
