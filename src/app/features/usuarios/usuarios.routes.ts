import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/auth.guard';

/**
 * 'novo' precisa vir ANTES de ':id', senão a rota de parâmetro captura
 * a palavra "novo" e a tela de cadastro tenta carregar um usuário
 * chamado "novo". Criar/editar são ADMIN-only aqui no front — o
 * backend já bloqueia de verdade, isso só evita a tela de erro.
 */
export const rotas: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/usuarios-lista.page').then((m) => m.UsuariosListaPage),
  },
  {
    path: 'novo',
    canActivate: [roleGuard('ADMIN')],
    loadComponent: () =>
      import('./pages/usuarios-form.page').then((m) => m.UsuariosFormPage),
  },
  {
    path: ':id',
    canActivate: [roleGuard('ADMIN')],
    loadComponent: () =>
      import('./pages/usuarios-form.page').then((m) => m.UsuariosFormPage),
  },
];
