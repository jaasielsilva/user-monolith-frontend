import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Role } from '../../../core/models/sessao.model';
import { ToastService } from '../../../core/services/toast.service';
import { UsuarioSalvar } from '../models/usuario.model';
import { UsuarioService } from '../services/usuario.service';

/**
 * FORMULÁRIO DE REFERÊNCIA (criar e editar na mesma tela).
 *
 * O campo "senha" aparece sempre, inclusive editando — é uma limitação
 * real do backend hoje (UserService.update reencripta a senha sem
 * checar se ela mudou). O texto de apoio abaixo do campo existe pra
 * isso não parecer bug do formulário.
 */
@Component({
  selector: 'app-usuarios-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="barra-topo">
      <h1>{{ ehNovo() ? 'Novo usuário' : 'Editar usuário' }}</h1>
      <a class="btn btn-secundario" routerLink="/usuarios">Voltar</a>
    </div>

    <form class="card" style="max-width: 480px" [formGroup]="form" (ngSubmit)="salvar()">
      <label class="campo">
        <span>Nome *</span>
        <input formControlName="nome" [class.invalido]="invalido('nome')" />
        @if (invalido('nome')) {
          <span class="erro-campo">Nome deve ter entre 2 e 150 caracteres.</span>
        }
      </label>

      <label class="campo">
        <span>E-mail *</span>
        <input type="email" formControlName="email" [class.invalido]="invalido('email')" />
        @if (invalido('email')) {
          <span class="erro-campo">E-mail inválido.</span>
        }
      </label>

      <label class="campo">
        <span>Senha *</span>
        <input type="password" formControlName="senha" [class.invalido]="invalido('senha')" />
        @if (invalido('senha')) {
          <span class="erro-campo">Senha deve ter entre 6 e 100 caracteres.</span>
        }
        @if (!ehNovo()) {
          <span class="texto-suave">Informe uma senha para confirmar a alteração do cadastro.</span>
        }
      </label>

      <label class="campo">
        <span>Role *</span>
        <select formControlName="role">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </label>

      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px">
        <a class="btn btn-secundario" routerLink="/usuarios">Cancelar</a>
        <button type="submit" class="btn" [disabled]="salvando()">
          {{ salvando() ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  `,
})
export class UsuariosFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  private readonly id = Number(this.rota.snapshot.paramMap.get('id'));

  protected readonly salvando = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    senha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    role: ['USER' as Role, [Validators.required]],
  });

  constructor() {
    if (!this.ehNovo()) {
      // Senha vem em branco de propósito: o backend nunca devolve o
      // hash, e não faria sentido devolver mesmo que devolvesse.
      this.service.buscar(this.id).subscribe((dados) =>
        this.form.patchValue({ nome: dados.nome, email: dados.email, role: dados.role }),
      );
    }
  }

  protected ehNovo(): boolean {
    return !this.id;
  }

  protected invalido(campo: 'nome' | 'email' | 'senha'): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && controle.touched;
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dados: UsuarioSalvar = this.form.getRawValue();

    this.salvando.set(true);
    const requisicao = this.ehNovo()
      ? this.service.criar(dados)
      : this.service.atualizar(this.id, dados);

    requisicao.subscribe({
      next: () => {
        this.toast.sucesso(this.ehNovo() ? 'Usuário cadastrado.' : 'Alterações salvas.');
        this.router.navigate(['/usuarios']);
      },
      error: () => {
        // O toast do erro já saiu no errorInterceptor.
        this.salvando.set(false);
      },
    });
  }
}
