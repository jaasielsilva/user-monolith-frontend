import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/** Anexa o access token (memória) em toda requisição, quando existir. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken;

  return next(
    req.clone({
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  );
};
