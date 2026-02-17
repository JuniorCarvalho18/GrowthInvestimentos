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

  usuario = {
    nome: '',
    email: '',
    cnpj: '',
    senha: '',
    confirmaSenha: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private utils: UtilsService
  ) { }

  ngOnInit() { }

  async cadastrar() {
    // Validações
    if (!this.usuario.nome || !this.usuario.email || !this.usuario.cnpj || !this.usuario.senha || !this.usuario.confirmaSenha) {
      await this.utils.toast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    // Validação simples de CNPJ (apenas tamanho para exemplo)
    if (this.usuario.cnpj.length < 14) {
      await this.utils.toast('CNPJ inválido! Formato: 00.000.000/0000-00', 'warning');
      return;
    }

    if (this.usuario.senha.length < 6) {
      await this.utils.toast('A senha deve ter pelo menos 6 caracteres.', 'warning');
      return;
    }

    if (this.usuario.senha !== this.usuario.confirmaSenha) {
      await this.utils.toast('As senhas não coincidem!', 'warning');
      return;
    }

    await this.utils.showLoading('Criando conta...');

    this.authService.cadastrar(this.usuario).subscribe({
      next: async (response) => {
        await this.utils.hideLoading();
        if (response.success) {
          await this.utils.toast('Conta criada! Faça login para continuar.', 'success');
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
