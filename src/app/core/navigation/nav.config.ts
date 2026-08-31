import { Role } from '../models/sessao.model';

export interface ItemDeMenu {
  rota: string;
  titulo: string;
  icone: string;
  /** Ausente = qualquer usuário autenticado. */
  roles?: Role[];
}

export const MENU: ItemDeMenu[] = [{ rota: '/usuarios', titulo: 'Usuários', icone: '●' }];

/** Função pura: testável sem TestBed, sem HTTP e sem navegador. */
export function itensVisiveis(itens: ItemDeMenu[], role: Role | null): ItemDeMenu[] {
  return itens.filter((item) => !item.roles || (role != null && item.roles.includes(role)));
}
