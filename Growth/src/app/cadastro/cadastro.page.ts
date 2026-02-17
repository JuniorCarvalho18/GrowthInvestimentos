import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false
})
export class CadastroPage implements OnInit {

  // O HTML espera um objeto chamado 'cadastro'
  cadastro = {
    nome: '',
    email: '',
    cnpj: '',
    senha: '',
    confirmarSenha: '' // O HTML chama de 'confirmarSenha', não 'confirmaSenha'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private utils: UtilsService
  ) { }

  ngOnInit() { }

  async cadastrar() {
    const c = this.cadastro; // Atalho

    // Validações
    if (!c.nome || !c.email || !c.cnpj || !c.senha || !c.confirmarSenha) {
      await this.utils.toast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    if (c.cnpj.length < 14) {
      await this.utils.toast('CNPJ inválido!', 'warning');
      return;
    }

    if (c.senha.length < 6) {
      await this.utils.toast('A senha deve ter pelo menos 6 caracteres.', 'warning');
      return;
    }

    if (c.senha !== c.confirmarSenha) {
      await this.utils.toast('As senhas não coincidem!', 'warning');
      return;
    }

    await this.utils.showLoading('Criando conta...');

    // O serviço provavelmente espera { nome, email... }, então passamos o objeto cadastro
    this.authService.cadastrar(c).subscribe({
      next: async (response) => {
        await this.utils.hideLoading();
        if (response.success) {
          await this.utils.toast('Conta criada! Faça login.', 'success');
          this.router.navigate(['/folder/inbox']);
        } else {
          await this.utils.toastError('Erro ao criar conta. Email ou CNPJ já cadastrados.');
        }
      },
      error: async (error) => {
        await this.utils.hideLoading();
        console.error(error);
        await this.utils.toastError('Erro ao conectar ao servidor.');
      }
    });
  }
}
