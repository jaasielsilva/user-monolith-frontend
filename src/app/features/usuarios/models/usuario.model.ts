import { Role } from '../../../core/models/sessao.model';

/** Espelho de UserResponseDTO — mesmo formato em toda resposta (não tem "resumo" x "detalhe" separado). */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/**
 * Espelho de UserRequestDTO. `senha` é sempre obrigatória, inclusive
 * ao EDITAR — o backend hoje reencripta a senha em todo update, sem
 * distinguir "troquei a senha" de "só mudei o nome". É uma limitação
 * real do user-monolith (Passo 5/6), não uma escolha do frontend.
 */
export interface UsuarioSalvar {
  nome: string;
  email: string;
  senha: string;
  role: Role;
}
