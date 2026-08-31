/**
 * Ambiente de desenvolvimento (`ng serve`).
 *
 * O user-monolith não usa prefixo /api/v1 nem envelope de resposta — os
 * endpoints ficam direto na raiz (/auth/login, /users, etc.), então a
 * base é só o host:porta da API.
 */
export const environment = {
  producao: false,
  apiUrl: 'http://localhost:8080',
};
