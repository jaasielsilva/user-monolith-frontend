import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, Role, UsuarioLogado } from '../models/sessao.model';

const CHAVE_REFRESH_TOKEN = 'user-monolith.refreshToken';

/**
 * Dono da sessão. Duas adaptações em relação ao molde original, porque
 * o user-monolith não tem a infraestrutura que ele pressupõe:
 *
 * 1. O backend não emite cookie httpOnly pro refresh token — ele vem
 *    no CORPO da resposta, como texto que o JavaScript já enxerga. Sem
 *    cookie, guardar o refresh token só em memória perderia a sessão
 *    em todo F5 (recarregar apaga a memória). A alternativa pragmática
 *    é localStorage: menos seguro que httpOnly (um XSS leria o
 *    refresh token também, não só o access token), mas é o que dá pra
 *    fazer sem tocar no backend. Em produção de verdade, o certo é o
 *    backend passar a setar um cookie httpOnly.
 *
 * 2. Não existe endpoint /me nem /auth/logout. O perfil (nome) é
 *    buscado via GET /users/email/{email} logo após o login/refresh; o
 *    "logout" é só limpar o estado local — não há sessão no servidor
 *    pra encerrar.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  private token: string | null = null;
  private refreshEmAndamento?: Observable<UsuarioLogado | null>;

  readonly usuario = signal<UsuarioLogado | null>(null);
  readonly autenticado = computed(() => this.usuario() !== null);

  get accessToken(): string | null {
    return this.token;
  }

  temRole(...roles: Role[]): boolean {
    const role = this.usuario()?.role;
    return role != null && roles.includes(role);
  }

  login(email: string, senha: string): Observable<UsuarioLogado> {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, { email, senha }).pipe(
      tap((dados) => this.aplicarTokens(dados)),
      switchMap(() => this.carregarPerfil(email)),
      tap((usuario) => this.usuario.set(usuario)),
    );
  }

  logout(): void {
    // Sem endpoint de logout no backend — o token simplesmente continua
    // válido até expirar, só deixa de ser usado por este navegador.
    this.limparSessao();
  }

  /**
   * single-flight: evita que duas chamadas 401 em paralelo disparem
   * dois refresh ao mesmo tempo.
   */
  refresh(): Observable<UsuarioLogado | null> {
    if (!this.refreshEmAndamento) {
      const refreshToken = localStorage.getItem(CHAVE_REFRESH_TOKEN);
      if (!refreshToken) {
        return of(null);
      }

      this.refreshEmAndamento = this.http
        .post<LoginResponse>(`${this.api}/auth/refresh`, { refreshToken })
        .pipe(
          tap((dados) => this.aplicarTokens(dados)),
          switchMap((dados) => this.carregarPerfil(this.extrairEmail(dados.accessToken))),
          tap((usuario) => this.usuario.set(usuario)),
          catchError(() => {
            this.limparSessao();
            return of(null);
          }),
          finalize(() => (this.refreshEmAndamento = undefined)),
          shareReplay(1),
        );
    }
    return this.refreshEmAndamento;
  }

  /** Roda uma vez na subida da aplicação (provideAppInitializer). */
  restaurarSessao(): Observable<unknown> {
    return this.refresh();
  }

  limparSessao(): void {
    this.token = null;
    this.usuario.set(null);
    localStorage.removeItem(CHAVE_REFRESH_TOKEN);
  }

  private carregarPerfil(email: string): Observable<UsuarioLogado> {
    return this.http.get<UsuarioLogado>(`${this.api}/users/email/${encodeURIComponent(email)}`);
  }

  private aplicarTokens(dados: LoginResponse): void {
    this.token = dados.accessToken;
    localStorage.setItem(CHAVE_REFRESH_TOKEN, dados.refreshToken);
  }

  /** O JWT não é secreto pro dono dele — só decodifica o payload, sem validar assinatura (quem valida é sempre o backend). */
  private extrairEmail(accessToken: string): string {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    return payload.sub as string;
  }
}
