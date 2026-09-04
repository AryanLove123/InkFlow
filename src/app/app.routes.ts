import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },
];
