import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '../services/utils.service'; // <--- Importado
import { UsuariosService, Usuario } from '../services/Usuarios.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: false,
})
export class UsuariosPage implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  usuario: Usuario = this.limparFormulario();
  private refreshSubscription?: Subscription;

  constructor(
    private rota: Router,
    private usuariosService: UsuariosService,
    private utils: UtilsService, // <--- Injeção do Utils
  ) {}

  ngOnInit() {
    this.listarUsuarios();
    // 🔄 Auto-refresh a cada 5s
    this.refreshSubscription = interval(5000).subscribe(() => {
      this.listarUsuarios(true);
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  limparFormulario(): Usuario {
    return {
      nome: '',
      email: '',
      cnpj: '',
      senha: ''
    };
  }

  // --- LISTAGEM ---

  async listarUsuarios(silencioso = false) {
    if (!silencioso) {
      await this.utils.showLoading('Carregando usuários...');
    }

    this.usuariosService.listarUsuarios().subscribe({
      next: async (res) => {
        if (!silencioso) await this.utils.hideLoading();

        if (res.success) {
          this.usuarios = res.usuarios;
        } else {
          // Erro leve (ex: lista vazia ou erro lógico simples)
          if (!silencioso) await this.utils.toast('Erro ao carregar usuários', 'warning');
        }
      },
      error: async (error) => {
        if (!silencioso) {
          await this.utils.hideLoading();
          console.error('Erro:', error);
          await this.utils.toastError('Erro ao conectar ao servidor');
        }
      }
    });
  }

  // --- VALIDAÇÃO E SALVAMENTO ---

  validarFormulario(): boolean {
    if (!this.usuario.nome.trim()) {
      this.utils.toast('Nome é obrigatório!', 'warning');
      return false;
    }
    if (!this.usuario.email.trim()) {
      this.utils.toast('Email é obrigatório!', 'warning');
      return false;
    }
    if (!this.usuario.cnpj.trim()) {
      this.utils.toast('CNPJ é obrigatório!', 'warning');
      return false;
    }

    // Validação de email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.usuario.email)) {
      this.utils.toast('Email inválido!', 'warning');
      return false;
    }

    // Validação de senha (obrigatória apenas ao criar novo)
    if (!this.usuario.id && (!this.usuario.senha || this.usuario.senha.length < 6)) {
      this.utils.toast('Senha deve ter pelo menos 6 caracteres!', 'warning');
      return false;
    }

    return true;
  }

  async salvarUsuario() {
    if (!this.validarFormulario()) {
      return;
    }

    await this.utils.showLoading(this.usuario.id ? 'Atualizando...' : 'Salvando...');

    const observable = this.usuario.id
      ? this.usuariosService.editarUsuario(this.usuario)
      : this.usuariosService.salvarUsuario(this.usuario);

    observable.subscribe({
      next: async (res) => {
        await this.utils.hideLoading();
        if (res.success) {
          await this.utils.toast(
            this.usuario.id ? 'Usuário atualizado!' : 'Usuário criado!',
            'success'
          );
          this.usuario = this.limparFormulario();
          this.listarUsuarios();
        } else {
          // Erro específico de negócio (duplicidade)
          await this.utils.toast('Erro: Email ou CNPJ já cadastrado!', 'danger');
        }
      },
      error: async (error) => {
        await this.utils.hideLoading();
        console.error('Erro:', error);
        await this.utils.toastError('Erro ao salvar usuário');
      }
    });
  }

  // --- CRUD AUXILIAR ---

  editar(u: Usuario) {
    this.usuario = { ...u, senha: '' }; // Limpa a senha para não exibir hash ou valor antigo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.usuario = this.limparFormulario();
  }

  async deletar(id: number, nome: string) {
    // Confirmação usando Utils
    const confirmou = await this.utils.alertConfirm(
      'Confirmar Exclusão',
      `Deseja realmente excluir o usuário "${nome}"? Esta ação não pode ser desfeita.`
    );

    if (confirmou) {
      await this.utils.showLoading('Excluindo...');

      this.usuariosService.deletarUsuario(id).subscribe({
        next: async (res) => {
          await this.utils.hideLoading();
          if (res.success) {
            await this.utils.toast('Usuário excluído!', 'success');
            this.listarUsuarios();
          } else {
            await this.utils.toastError('Erro ao excluir usuário');
          }
        },
        error: async (error) => {
          await this.utils.hideLoading();
          console.error('Erro:', error);
          await this.utils.toastError('Erro de conexão');
        }
      });
    }
  }
}
