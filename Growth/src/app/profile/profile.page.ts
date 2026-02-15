import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ImageUploadService } from '../services/image.upload.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  user: User = {
    id: 0,
    nome: '',
    cnpj: '',
    email: '',
    saldo: 0,
    tokens: 0,
    foto: ''
  };

  private apiUrl = environment.apiUrl;

  constructor(
    private rota: Router,
    private authService: AuthService,
    private utils: UtilsService,
    private alertController: AlertController,
    private imageService: ImageUploadService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
      const currentUser = this.authService.currentUserValue;
      if (currentUser) {
        this.user = {
          ...currentUser,
          saldo: Number(currentUser.saldo || 0),
          tokens: Number(currentUser.tokens || 0)
        };
      }
    }

  async changePhoto() {
    const imagemBase64 = await this.imageService.selecionarImagem();
    if (imagemBase64) {
      this.user.foto = imagemBase64;
    }
  }

  async saveProfile() {
    // Validações
    if (!this.user.nome.trim() || !this.user.email.trim()) {
      await this.utils.showWarning('Nome e email são obrigatórios!');
      return;
    }

    // Validação de email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.user.email)) {
      await this.utils.showError('Email inválido!');
      return;
    }

    await this.utils.showLoading('Salvando...');

    // Chama a API para atualizar o perfil
    this.http.post<any>(this.apiUrl, {
      requisicao: 'editar',
      id: this.user.id,
      nome: this.user.nome,
      email: this.user.email,
      cnpj: this.user.cnpj,
      foto: this.user.foto
    }).subscribe({
      next: async (response) => {
        await this.utils.hideLoading();

        if (response.success) {
          this.authService.updateUser(this.user);
          await this.utils.showSuccess('Perfil atualizado com sucesso!');
        } else {
          await this.utils.showError('Erro ao atualizar perfil. Email pode já estar em uso.');
        }
      },
      error: async (error) => {
        await this.utils.hideLoading();
        console.error('Erro:', error);
        await this.utils.showError('Erro ao conectar ao servidor.');
      }
    });
  }

  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Alterar Senha',
      inputs: [
        {
          name: 'senhaAtual',
          type: 'password',
          placeholder: 'Senha atual'
        },
        {
          name: 'novaSenha',
          type: 'password',
          placeholder: 'Nova senha'
        },
        {
          name: 'confirmarSenha',
          type: 'password',
          placeholder: 'Confirmar nova senha'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Alterar',
          handler: async (data) => {
            if (!data.senhaAtual || !data.novaSenha || !data.confirmarSenha) {
              await this.utils.showWarning('Preencha todos os campos!');
              return false;
            }

            if (data.novaSenha.length < 6) {
              await this.utils.showWarning('A nova senha deve ter pelo menos 6 caracteres!');
              return false;
            }

            if (data.novaSenha !== data.confirmarSenha) {
              await this.utils.showError('As senhas não coincidem!');
              return false;
            }

            await this.updatePassword(data.senhaAtual, data.novaSenha);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async updatePassword(senhaAtual: string, novaSenha: string) {
    await this.utils.showLoading('Alterando senha...');

    this.http.post<any>(this.apiUrl, {
      requisicao: 'alterar_senha',
      id: this.user.id,
      senha_atual: senhaAtual,
      nova_senha: novaSenha
    }).subscribe({
      next: async (response) => {
        await this.utils.hideLoading();

        if (response.success) {
          await this.utils.showSuccess('Senha alterada com sucesso!');
        } else {
          await this.utils.showError(response.message || 'Senha atual incorreta!');
        }
      },
      error: async (error) => {
        await this.utils.hideLoading();
        console.error('Erro:', error);
        await this.utils.showError('Erro ao conectar ao servidor.');
      }
    });
  }

  async removePhoto(event: Event) {
    event.stopPropagation(); // Evita abrir a galeria ao clicar na lixeira

    const alert = await this.alertController.create({
      header: 'Remover Foto',
      message: 'Tem certeza que deseja remover sua foto de perfil?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Remover',
          handler: () => {
            this.user.foto = ''; // Limpa a foto localmente
            this.saveProfile();  // Salva no banco imediatamente
          }
        }
      ]
    });
    await alert.present();
  }
}
