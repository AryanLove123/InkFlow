import { Routes } from '@angular/router';

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
        path: 'onboarding',
        loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent)
    },
    {
        path: 'create',
        loadComponent: () => import('./features/editor/editor.component').then(m=> m.EditorComponent)
    },
    {
        path: 'drafts',
        loadComponent: () => import('./features/drafts/drafts.component').then(m=> m.DraftsComponent)
    },
    {
        path: 'article/:id',
        loadComponent: () => import('./features/article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
    }
];
