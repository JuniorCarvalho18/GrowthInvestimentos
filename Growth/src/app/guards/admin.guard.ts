import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async canActivate(): Promise<boolean> {
    // Pega o usuário atual
    const user = this.authService.currentUserValue;

    // Verifica se existe usuário e se ele é admin
    // O 'isAdmin' deve vir como true do seu backend/banco de dados
    if (user && user.isAdmin) {
      return true;
    }

    // Se não for admin:
    console.log('⛔ Acesso negado: Usuário não é admin');

    // 1. Redireciona para home
    this.router.navigate(['/home']);

    // 2. Mostra aviso
    const toast = await this.toastController.create({
      message: 'Acesso restrito a administradores.',
      duration: 3000,
      color: 'danger',
      position: 'top',
      icon: 'lock-closed'
    });
    toast.present();

    return false;
  }
}
