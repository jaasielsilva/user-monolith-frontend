import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Usuario, UsuarioSalvar } from '../models/usuario.model';

/**
 * SERVICE DE REFERÊNCIA do projeto: HttpClient só aqui, componente
 * nunca chama a API direto. Sem envelope pra desembrulhar (o backend
 * devolve o DTO cru) e sem paginação (GET /users devolve array
 * completo — é aceitável pro volume de um CRUD de estudo, mas seria o
 * primeiro ponto a rever num sistema com muitos usuários de verdade).
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/users`;

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  buscar(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  criar(dados: UsuarioSalvar): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, dados);
  }

  atualizar(id: number, dados: UsuarioSalvar): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, dados);
  }

  excluir(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
