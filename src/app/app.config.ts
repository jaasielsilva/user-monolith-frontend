import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/services/auth.service';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),

    // A ORDEM IMPORTA: o de autenticação anexa o token, o de erro
    // envolve a chamada já autenticada — invertidos, o retry após
    // refresh sairia sem o token novo.
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),

    { provide: LOCALE_ID, useValue: 'pt-BR' },

    // Tenta reaproveitar o refresh token guardado (localStorage) antes
    // da primeira rota abrir — sem isso, todo F5 cairia no login.
    provideAppInitializer(() => inject(AuthService).restaurarSessao()),
  ],
};
