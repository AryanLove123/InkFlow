import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m =>m.HomeComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'onboarding',
        loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
        canActivate: [authGuard],
    },
    {
        path: 'explore',
        loadComponent: () => import('./features/explore/explore.component').then(m => m.ExploreComponent)
    },
    {
        path: 'create',
        loadComponent: () => import('./features/editor/editor.component').then(m=> m.EditorComponent),
        canActivate: [authGuard],
    },
    {
        path: 'drafts',
        loadComponent: () => import('./features/drafts/drafts.component').then(m=> m.DraftsComponent),
        canActivate: [authGuard],
    },
    {
        path: 'authors',
        loadComponent: () => import('./features/authors-directory/authors-directory.component').then(m=> m.AuthorsDirectoryComponent)
    },
    {
        path: 'authors/:id',
        loadComponent: () => import('./features/author-profile/author-profile.component').then(m => m.AuthorProfileComponent)
    },
    {
        path: 'article/:id',
        loadComponent: () => import('./features/article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./features/editor/editor.component').then(m =>m.EditorComponent),
        canActivate: [authGuard]
    },
    {
        path: '**',
        loadComponent: () => import('./features/home/home.component').then((m)=> m.HomeComponent)
    }
];
