import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('🛡️ AuthGuard verificando autenticação...');

    if (this.authService.isAuthenticated()) {
      console.log('✅ Usuário autenticado!');
      return true;
    }

    console.log('❌ Usuário NÃO autenticado, redirecionando para login');
    this.router.navigate(['/folder/inbox'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
