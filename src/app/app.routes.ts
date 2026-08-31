import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';
import { authGuard } from './core/guards/auth.guard';

/**
 * Dois blocos: login é público; tudo o mais vive dentro do
 * AppShellComponent, atrás do authGuard. Sem /criar-conta,
 * /esqueci-senha etc. — esses endpoints não existem no backend.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
      {
        path: 'usuarios',
        loadChildren: () => import('./features/usuarios/usuarios.routes').then((m) => m.rotas),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
