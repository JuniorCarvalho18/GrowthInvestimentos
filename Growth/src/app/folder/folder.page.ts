import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false,
})
export class FolderPage implements OnInit {
  login = {
    emailCnpj: '',
    senha: '',
  };

  constructor(
    private rota: Router,
    private authService: AuthService,
    private utils: UtilsService
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.rota.navigate(['/home']);
    }
  }

  criarConta() {
    this.rota.navigate(['/cadastro']);
  }

  async logar() {
  if (!this.login.emailCnpj.trim() || !this.login.senha.trim()) {
    await this.utils.showWarning('Por favor, preencha todos os campos!');
    return;
  }

  await this.utils.showLoading('Entrando...');

  this.authService.login(this.login.emailCnpj, this.login.senha).subscribe({
    next: async (response) => {
      await this.utils.hideLoading();

      // 🔍 ADICIONE ESTE LOG TEMPORÁRIO
      console.log('📋 Resposta do login:', response);

      if (response.success) {
        // 🔍 ADICIONE ESTE LOG TEMPORÁRIO
        console.log('✅ Login bem-sucedido, navegando para /home');

        await this.utils.showSuccess('Bem-vindo ao Growth!');

        // 🔍 ADICIONE ESTE LOG TEMPORÁRIO
        const navResult = await this.rota.navigate(['/home']);
        console.log('🧭 Resultado da navegação:', navResult);
      } else {
        await this.utils.showError(response.message || 'Credenciais inválidas!');
      }
    },
    error: async (error) => {
      await this.utils.hideLoading();
      console.error('❌ Erro no login:', error);
      await this.utils.showError('Erro ao conectar ao servidor.');
    }
  });
}
}
