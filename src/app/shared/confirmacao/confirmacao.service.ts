import { Injectable, signal } from '@angular/core';

export interface PedidoDeConfirmacao {
  titulo: string;
  texto: string;
  confirmarTexto: string;
  perigo: boolean;
}

/**
 * Confirmação antes de ação destrutiva. Não usa window.confirm de
 * propósito: o diálogo nativo não aceita estilo do produto e alguns
 * navegadores deixam o usuário suprimi-lo — a exclusão passaria direto.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmacaoService {
  readonly pedido = signal<PedidoDeConfirmacao | null>(null);

  private resolver?: (confirmado: boolean) => void;

  perguntar(
    titulo: string,
    texto: string,
    opcoes: { confirmarTexto?: string; perigo?: boolean } = {},
  ): Promise<boolean> {
    this.pedido.set({
      titulo,
      texto,
      confirmarTexto: opcoes.confirmarTexto ?? 'Confirmar',
      perigo: opcoes.perigo ?? false,
    });

    return new Promise<boolean>((resolve) => (this.resolver = resolve));
  }

  responder(confirmado: boolean): void {
    this.pedido.set(null);
    this.resolver?.(confirmado);
    this.resolver = undefined;
  }
}
