import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false,
})
export class CadastroPage implements OnInit {
  cadastro = {
    nome: '',
    email: '',
    cnpj: '',
    senha: '',
    confirmarSenha: '',
  };

  constructor(
    private rota: Router,
    private authService: AuthService,
    private utils: UtilsService
  ) {}

  ngOnInit() {}

  voltar() {
    this.rota.navigate(['/folder/inbox']);
  }

  async cadastrar() {
    // Validações
    if (
      !this.cadastro.nome.trim() ||
      !this.cadastro.email.trim() ||
      !this.cadastro.cnpj.trim() ||
      !this.cadastro.senha.trim() ||
      !this.cadastro.confirmarSenha.trim()
    ) {
      await this.utils.showWarning('Por favor, preencha todos os campos!');
      return;
    }

    const cnpjPattern = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (!cnpjPattern.test(this.cadastro.cnpj)) {
      await this.utils.showError('CNPJ inválido! Formato: 00.000.000/0000-00');
      return;
    }

    if (this.cadastro.senha.length < 6) {
      await this.utils.showWarning('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    if (this.cadastro.senha !== this.cadastro.confirmarSenha) {
      await this.utils.showError('As senhas não coincidem!');
      return;
    }

    await this.utils.showLoading('Criando conta...');

    this.authService.cadastrar({
      nome: this.cadastro.nome,
      email: this.cadastro.email,
      cnpj: this.cadastro.cnpj,
      senha: this.cadastro.senha,
    }).subscribe({
      next: async (response) => {
        await this.utils.hideLoading();

        if (response.success) {
          await this.utils.showSuccess('Conta criada! Faça login para continuar.');
          this.rota.navigate(['/folder/inbox']);
        } else {
          await this.utils.showError('Erro ao criar conta. Email ou CNPJ já cadastrado.');
        }
      },
      error: async (error) => {
        await this.utils.hideLoading();
        console.error('Erro:', error);
        await this.utils.showError('Erro ao conectar ao servidor.');
      }
    });
  }
}
