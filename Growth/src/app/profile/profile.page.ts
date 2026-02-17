import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../services/auth.service';
import { UtilsService } from '../services/utils.service'; // <--- Utils moderno
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
  user: User | null = null;

  // Dados para edição
  nome: string = '';
  email: string = '';

  // Senha
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
      this.user = u;
      if (u) {
        this.nome = u.nome;
        this.email = u.email;
      }
    });
  }

  async selecionarFoto() {
    if (!this.user) return;
    const base64 = await this.imageUploadService.selecionarImagem();
    if (base64) {
      this.user.foto = base64;
      this.salvarPerfil(true); // Salva silenciosamente a foto
    }
  }

  async salvarPerfil(apenasFoto = false) {
    if (!this.user) return;

    if (!this.nome.trim() || !this.email.trim()) {
      await this.utils.toast('Nome e email são obrigatórios!', 'warning');
      return;
    }

    // Validação básica de email
    if (!this.email.includes('@')) {
      await this.utils.toast('Email inválido!', 'warning');
      return;
    }

    await this.utils.showLoading('Atualizando perfil...');

    const dadosAtualizados = {
      ...this.user,
      nome: this.nome,
      email: this.email,
      requisicao: 'editar_perfil'
    };

    this.http.post<any>(environment.apiUrl, dadosAtualizados).subscribe({
      next: async (response) => {
        await this.utils.hideLoading();
        if (response.success) {
          // Atualiza o local storage e o subject
          this.authService.updateUser(dadosAtualizados);
          if (!apenasFoto) {
            await this.utils.toast('Perfil atualizado com sucesso!', 'success');
          }
        } else {
          await this.utils.toastError('Erro ao atualizar perfil. Email pode já estar em uso.');
        }
      },
      error: async (error) => {
        await this.utils.hideLoading();
        await this.utils.toastError('Erro ao conectar ao servidor.');
      }
    });
  }

  async alterarSenha() {
    if (!this.user) return;

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
