/**
 * Espelho do que a API de fato expõe. Sem `roles[]`, `modulos`,
 * `empresa`, `nivelAcesso` — o user-monolith é single-tenant e tem um
 * único role por usuário (USER | ADMIN), não uma lista.
 */
export type Role = 'USER' | 'ADMIN';

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  role: Role;
}

/** Espelho de TokenResponseDTO no backend. */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
