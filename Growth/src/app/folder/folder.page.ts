import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false
})
export class FolderPage implements OnInit {
  public folder!: string;

  // O HTML espera um objeto 'login'
  login = {
    emailCnpj: '',
    senha: ''
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }

  // O HTML chama (click)="logar()"
  async logar() {
    if (!this.login.emailCnpj || !this.login.senha) {
      await this.utils.toast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    await this.utils.showLoading('Entrando...');

    this.authService.login(this.login.emailCnpj, this.login.senha).subscribe({
      next: async (response) => {
        await this.utils.hideLoading();
        if (response.success) {
          await this.utils.toast(`Bem-vindo!`, 'success');
          this.router.navigate(['/home']);
        } else {
          await this.utils.toast(response.message || 'Credenciais inválidas!', 'danger');
        }
      },
      error: async (error) => {
        await this.utils.hideLoading();
        console.error(error);
        await this.utils.toastError('Erro ao conectar ao servidor.');
      }
    });
  }

  criarConta() {
    this.router.navigate(['/cadastro']);
  }
}
