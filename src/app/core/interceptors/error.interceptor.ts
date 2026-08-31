import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ErrorResponse } from '../models/api.model';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Traduz o formato de erro do GlobalExceptionHandler (ErrorResponse) em
 * toast, e resolve o 401 com UM refresh — o componente só precisa
 * tratar a regra de negócio dele, não o ciclo de vida do token.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((erro: HttpErrorResponse) => {
      const corpo = erro.error as ErrorResponse | undefined;
      const mensagem = corpo?.message;
      const ehAuth = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

      // 401 fora do fluxo de login/refresh = token expirou no meio do uso.
      // Tenta renovar UMA vez; se não der, desloga de verdade.
      if (erro.status === 401 && !ehAuth) {
        return auth.refresh().pipe(
          switchMap((usuario) => {
            if (!usuario) {
              auth.limparSessao();
              router.navigate(['/login']);
              return throwError(() => erro);
            }
            return next(
              req.clone({ setHeaders: { Authorization: `Bearer ${auth.accessToken}` } }),
            );
          }),
        );
      }

      // 401 no próprio /auth/login ou /auth/refresh: erro de negócio de
      // verdade (senha errada, refresh expirado) — quem chamou trata.
      if (ehAuth) {
        return throwError(() => erro);
      }

      switch (erro.status) {
        case 0:
          toast.erro('Sem conexão com o servidor. Verifique se a API está no ar.');
          break;
        case 403:
          toast.erro(mensagem ?? 'Você não tem permissão para esta ação.');
          break;
        case 404:
          toast.erro(mensagem ?? 'Registro não encontrado.');
          break;
        case 409:
          toast.aviso(mensagem ?? 'Operação não permitida.');
          break;
        case 400:
          toast.erro(mensagem ?? 'Verifique os campos informados.');
          break;
        default:
          toast.erro(mensagem ?? 'Erro inesperado. Tente novamente.');
      }

      return throwError(() => erro);
    }),
  );
};
