import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MENU, itensVisiveis } from '../../navigation/nav.config';
import { AuthService } from '../../services/auth.service';

/** Moldura da área autenticada: menu, identificação do usuário. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout" [class.menu-aberto]="menuAberto()">
      <aside class="menu">
        <div class="marca">User Monolith</div>
        <nav>
          @for (item of itens(); track item.rota) {
            <a
              [routerLink]="item.rota"
              routerLinkActive="ativo"
              (click)="menuAberto.set(false)"
            >
              <span class="icone" aria-hidden="true">{{ item.icone }}</span>
              {{ item.titulo }}
            </a>
          }
        </nav>
      </aside>

      <div class="conteudo">
        <header class="topo">
          <button type="button" class="hamburguer" (click)="alternarMenu()" aria-label="Menu">
            ≡
          </button>
          <div class="usuario">
            <span class="texto-suave">
              {{ usuario()?.nome }}
              <span class="selo" [class]="ehAdmin() ? 'selo-admin' : 'selo-user'">
                {{ usuario()?.role }}
              </span>
            </span>
            <button type="button" class="btn btn-secundario" (click)="sair()">Sair</button>
          </div>
        </header>

        <main class="area">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .layout {
        display: flex;
        min-height: 100vh;
      }
      .menu {
        width: 230px;
        flex-shrink: 0;
        background: var(--sidebar-bg);
        color: var(--sidebar-texto);
        padding: 18px 12px;
      }
      .marca {
        padding: 6px 10px 18px;
        font-size: 1.05rem;
        font-weight: 600;
        color: #fff;
      }
      .menu nav {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .menu a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 10px;
        border-radius: var(--raio-pequeno);
        color: var(--sidebar-texto);
        text-decoration: none;
      }
      .menu a:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }
      .menu a.ativo {
        background: var(--color-primary);
        color: #fff;
      }
      .icone {
        font-size: 0.7rem;
        opacity: 0.8;
      }
      .conteudo {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .topo {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        background: var(--card-bg);
        border-bottom: 1px solid var(--borda);
      }
      .usuario {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .hamburguer {
        display: none;
        background: none;
        border: none;
        font-size: 1.3rem;
        cursor: pointer;
      }
      .area {
        flex: 1;
        padding: 20px;
      }

      @media (max-width: 860px) {
        .menu {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 500;
          transform: translateX(-100%);
          transition: transform 0.2s ease;
        }
        .menu-aberto .menu {
          transform: translateX(0);
        }
        .hamburguer {
          display: block;
        }
      }
    `,
  ],
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly usuario = this.auth.usuario;
  protected readonly menuAberto = signal(false);

  protected readonly ehAdmin = computed(() => this.usuario()?.role === 'ADMIN');

  protected readonly itens = computed(() => itensVisiveis(MENU, this.usuario()?.role ?? null));

  protected alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  protected sair(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
