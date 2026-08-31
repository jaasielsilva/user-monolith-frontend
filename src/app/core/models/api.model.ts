/**
 * Espelho de ErrorResponse no backend (GlobalExceptionHandler). O
 * user-monolith não embrulha respostas de sucesso em envelope nenhum —
 * cada endpoint devolve o DTO cru. Só o corpo de ERRO tem formato fixo,
 * e é esse formato que o errorInterceptor lê.
 */
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
