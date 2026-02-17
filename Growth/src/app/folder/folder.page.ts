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
  emailCnpj: string = '';
  senha: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }

  async login() {
    if (!this.emailCnpj || !this.senha) {
      await this.utils.toast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    await this.utils.showLoading('Entrando...');

    this.authService.login(this.emailCnpj, this.senha).subscribe({
      next: async (response) => {
        await this.utils.hideLoading();
        if (response.success) {
          // Salva o usuário no serviço (já faz no login, mas garantindo)
          if(response.user){
             // this.authService.currentUserSubject.next(response.user); // Geralmente já feito no service
          }

          await this.utils.toast(`Bem-vindo, ${response.user.nome}!`, 'success');
          this.router.navigate(['/home']);
        } else {
          // Erro de credenciais inválidas
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
}
