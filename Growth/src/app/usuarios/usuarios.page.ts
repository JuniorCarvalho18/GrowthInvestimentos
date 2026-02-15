import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
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
  loading: HTMLIonLoadingElement | null = null;
  private refreshSubscription?: Subscription;

  constructor(
    private rota: Router,
    private usuariosService: UsuariosService,
    private toast: ToastController,
    private alert: AlertController,
    private loadingController: LoadingController,
  ) {}

  ngOnInit() {
    this.listarUsuarios();
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

  async showLoading(message: string = 'Carregando...') {
    this.loading = await this.loadingController.create({
      message,
      spinner: 'crescent'
    });
    await this.loading.present();
  }

  async hideLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  async presentToast(msg: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toast.create({
      message: msg,
      duration: 3000,
      color,
      position: 'top',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  async listarUsuarios(silencioso = false) {
    if (!silencioso) {
      await this.showLoading('Carregando usuários...');
    }

    this.usuariosService.listarUsuarios().subscribe({
      next: async (res) => {
        if (!silencioso) {
          await this.hideLoading();
        }
        if (res.success) {
          this.usuarios = res.usuarios;
        } else {
          await this.presentToast('Erro ao carregar usuários', 'danger');
        }
      },
      error: async (error) => {
        if (!silencioso) {
          await this.hideLoading();
        }
        console.error('Erro:', error);
        await this.presentToast('Erro ao conectar ao servidor', 'danger');
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.usuario.nome.trim()) {
      this.presentToast('Nome é obrigatório!', 'warning');
      return false;
    }
    if (!this.usuario.email.trim()) {
      this.presentToast('Email é obrigatório!', 'warning');
      return false;
    }
    if (!this.usuario.cnpj.trim()) {
      this.presentToast('CNPJ é obrigatório!', 'warning');
      return false;
    }

    // Validação de email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.usuario.email)) {
      this.presentToast('Email inválido!', 'warning');
      return false;
    }

    // Validação de senha (só ao criar novo)
    if (!this.usuario.id && (!this.usuario.senha || this.usuario.senha.length < 6)) {
      this.presentToast('Senha deve ter pelo menos 6 caracteres!', 'warning');
      return false;
    }

    return true;
  }

  async salvarUsuario() {
    if (!this.validarFormulario()) {
      return;
    }

    await this.showLoading(this.usuario.id ? 'Atualizando...' : 'Salvando...');

    const observable = this.usuario.id
      ? this.usuariosService.editarUsuario(this.usuario)
      : this.usuariosService.salvarUsuario(this.usuario);

    observable.subscribe({
      next: async (res) => {
        await this.hideLoading();
        if (res.success) {
          await this.presentToast(
            this.usuario.id ? 'Usuário atualizado!' : 'Usuário criado!',
            'success'
          );
          this.usuario = this.limparFormulario();
          this.listarUsuarios();
        } else {
          await this.presentToast('Erro: Email ou CNPJ já cadastrado!', 'danger');
        }
      },
      error: async (error) => {
        await this.hideLoading();
        console.error('Erro:', error);
        await this.presentToast('Erro ao salvar usuário', 'danger');
      }
    });
  }

  editar(u: Usuario) {
    this.usuario = { ...u, senha: '' }; // Não carrega a senha
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.usuario = this.limparFormulario();
  }

  async deletar(id: number, nome: string) {
    const alert = await this.alert.create({
      header: 'Confirmar Exclusão',
      message: `Deseja realmente excluir o usuário "${nome}"? Esta ação não pode ser desfeita.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          cssClass: 'alert-button-danger',
          handler: async () => {
            await this.showLoading('Excluindo...');

            this.usuariosService.deletarUsuario(id).subscribe({
              next: async (res) => {
                await this.hideLoading();
                if (res.success) {
                  await this.presentToast('Usuário excluído!', 'success');
                  this.listarUsuarios();
                } else {
                  await this.presentToast('Erro ao excluir usuário', 'danger');
                }
              },
              error: async (error) => {
                await this.hideLoading();
                console.error('Erro:', error);
                await this.presentToast('Erro ao conectar ao servidor', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
