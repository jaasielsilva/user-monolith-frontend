import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmacaoService } from '../../../shared/confirmacao/confirmacao.service';
import { EstadoComponent } from '../../../shared/estado/estado.component';
import { Usuario } from '../models/usuario.model';
import { UsuarioService } from '../services/usuario.service';

/**
 * LISTAGEM DE REFERÊNCIA do projeto — copie esta estrutura em toda
 * listagem nova.
 *
 * Diferença do molde original: a busca aqui é feita NO CLIENTE (filtra
 * a lista já carregada), não no servidor — o backend não tem parâmetro
 * de busca em GET /users. Funciona bem pro volume de um CRUD de
 * estudo; numa lista com milhares de registros, isso precisaria virar
 * busca + paginação server-side de verdade.
 */
@Component({
  selector: 'app-usuarios-lista',
  imports: [RouterLink, EstadoComponent],
  template: `
    <div class="barra-topo">
      <div>
        <h1>Usuários</h1>
        <p class="texto-suave">{{ filtrados().length }} de {{ usuarios().length }} cadastrado(s)</p>
      </div>

      <div style="display: flex; gap: 8px; align-items: center">
        <input
          type="search"
          placeholder="Buscar por nome ou e-mail"
          style="min-height: 38px; padding: 8px 10px; border: 1px solid var(--borda); border-radius: var(--raio-pequeno); min-width: 260px"
          (input)="termo.set($any($event.target).value)"
        />
        @if (ehAdmin()) {
          <a class="btn" routerLink="novo">Novo</a>
        }
      </div>
    </div>

    <div class="card" style="padding: 0; overflow: hidden">
      @if (carregando() || erro() || filtrados().length === 0) {
        <app-estado
          [carregando]="carregando()"
          [erro]="erro()"
          [vazio]="filtrados().length === 0"
          [tituloVazio]="termo() ? 'Nenhum resultado' : 'Nenhum usuário ainda'"
          [textoVazio]="
            termo() ? 'Tente outro termo de busca.' : 'Cadastre o primeiro para começar.'
          "
          [ctaVazio]="termo() || !ehAdmin() ? null : 'Cadastrar usuário'"
          (acao)="aoAgirNoEstado()"
        />
      } @else {
        <table class="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Role</th>
              <th style="width: 1%"></th>
            </tr>
          </thead>
          <tbody>
            @for (item of filtrados(); track item.id) {
              <tr>
                <td>
                  @if (ehAdmin()) {
                    <a [routerLink]="[item.id]">{{ item.nome }}</a>
                  } @else {
                    {{ item.nome }}
                  }
                </td>
                <td>{{ item.email }}</td>
                <td>
                  <span class="selo" [class]="item.role === 'ADMIN' ? 'selo-admin' : 'selo-user'">
                    {{ item.role }}
                  </span>
                </td>
                <td style="white-space: nowrap">
                  @if (ehAdmin()) {
                    <a class="btn btn-secundario" [routerLink]="[item.id]">Editar</a>
                    <button type="button" class="btn btn-secundario" (click)="excluir(item)">
                      Excluir
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class UsuariosListaPage {
  private readonly service = inject(UsuarioService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly confirmacao = inject(ConfirmacaoService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly termo = signal('');

  protected readonly ehAdmin = computed(() => this.auth.temRole('ADMIN'));

  protected readonly filtrados = computed(() => {
    const termo = this.termo().trim().toLowerCase();
    if (!termo) {
      return this.usuarios();
    }
    return this.usuarios().filter(
      (u) => u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo),
    );
  });

  constructor() {
    this.carregar();
  }

  protected aoAgirNoEstado(): void {
    if (this.erro()) {
      this.carregar();
    }
  }

  protected async excluir(item: Usuario): Promise<void> {
    const confirmado = await this.confirmacao.perguntar(
      'Excluir usuário?',
      `"${item.nome}" será removido permanentemente.`,
      { confirmarTexto: 'Excluir', perigo: true },
    );
    if (!confirmado) {
      return;
    }

    this.service.excluir(item.id).subscribe(() => {
      this.toast.sucesso('Usuário excluído.');
      this.carregar();
    });
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.service.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a lista.');
        this.carregando.set(false);
      },
    });
  }
}
