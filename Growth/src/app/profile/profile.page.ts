import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { ImageUploadService } from '../services/image.upload.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  user: any = { nome: '', email: '', cnpj: '', saldo: 0, tokens: 0, foto: '' };

  senhaAtual: string = '';
  novaSenha: string = '';
  confirmaSenha: string = '';

  constructor(
    private authService: AuthService,
    private utils: UtilsService,
    private imageUploadService: ImageUploadService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(u => {
      if (u) {
        this.user = { ...u };
      }
    });
  }

  // O HTML chama changePhoto()
  async changePhoto() {
    const base64 = await this.imageUploadService.selecionarImagem();
    if (base64) {
      this.user.foto = base64;
      this.saveProfile(true);
    }
  }

  // O HTML chama removePhoto($event)
  removePhoto(event: Event) {
    event.stopPropagation(); // Evita abrir o seletor ao clicar no X
    this.user.foto = '';
  }

  // O HTML chama saveProfile()
  async saveProfile(apenasFoto = false) {
    if (!this.user.nome || !this.user.email) {
      await this.utils.toast('Nome e email são obrigatórios!', 'warning');
      return;
    }

    await this.utils.showLoading('Atualizando perfil...');

    const dadosAtualizados = {
      ...this.user,
      requisicao: 'editar_perfil'
    };

    this.http.post<any>(environment.apiUrl, dadosAtualizados).subscribe({
      next: async (response) => {
        await this.utils.hideLoading();
        if (response.success) {
          this.authService.updateUser(dadosAtualizados);
          if (!apenasFoto) {
            await this.utils.toast('Perfil atualizado com sucesso!', 'success');
          }
        } else {
          await this.utils.toastError('Erro ao atualizar. Email pode já estar em uso.');
        }
      },
      error: async (error) => {
        await this.utils.hideLoading();
        await this.utils.toastError('Erro ao conectar ao servidor.');
      }
    });
  }

  // O HTML chama changePassword()
  async changePassword() {
    if (!this.senhaAtual || !this.novaSenha || !this.confirmaSenha) {
      await this.utils.toast('Preencha todos os campos de senha.', 'warning');
      return;
    }

    if (this.novaSenha.length < 6) {
      await this.utils.toast('A nova senha deve ter pelo menos 6 caracteres.', 'warning');
      return;
    }

    if (this.novaSenha !== this.confirmaSenha) {
      await this.utils.toast('As senhas não coincidem!', 'warning');
      return;
    }

    await this.utils.showLoading('Alterando senha...');

    const payload = {
      requisicao: 'alterar_senha',
      id: this.user.id,
      senha_atual: this.senhaAtual,
      nova_senha: this.novaSenha
    };

    this.http.post<any>(environment.apiUrl, payload).subscribe({
      next: async (response) => {
        await this.utils.hideLoading();
        if (response.success) {
          this.senhaAtual = '';
          this.novaSenha = '';
          this.confirmaSenha = '';
          await this.utils.toast('Senha alterada com sucesso!', 'success');
        } else {
          await this.utils.toast(response.message || 'Senha atual incorreta.', 'danger');
        }
      },
      error: async (error) => {
        await this.utils.hideLoading();
        await this.utils.toastError('Erro ao conectar ao servidor.');
      }
    });
  }
}
