import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/sessao.model';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Guard é UX, não segurança — evita que a pessoa chegue numa tela que
 * só mostraria erro. Quem autoriza de verdade é o backend
 * (SecurityConfig + @PreAuthorize equivalente do Spring Security).
 */
export const authGuard: CanActivateFn = (_rota, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: estado.url } });
};

export const roleGuard = (...roles: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);

    if (auth.temRole(...roles)) {
      return true;
    }
    toast.erro('Você não tem acesso a esta área.');
    return router.createUrlTree(['/usuarios']);
  };
};
