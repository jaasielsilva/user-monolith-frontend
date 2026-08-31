import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmacaoComponent } from './shared/confirmacao/confirmacao.component';
import { ToastComponent } from './shared/toast/toast.component';

/**
 * Raiz da aplicação. Toast e confirmação ficam aqui, montados uma vez,
 * porque são usados de qualquer lugar (inclusive de dentro de um
 * interceptor, que não tem componente próprio).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ConfirmacaoComponent],
  template: `
    <router-outlet />
    <app-toasts />
    <app-confirmacao />
  `,
})
export class App {}
