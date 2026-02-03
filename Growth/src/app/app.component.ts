import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Marketplace', url: '/marketplace', icon: 'bag' },
    { title: 'Configurações', url: '/configaracao', icon: 'settings' },
  ];

  isContasAtivo = false;
  isHistoricoAtivo = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.ShowSplash();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isContasAtivo = event.url === '/saldo';
        this.isHistoricoAtivo = event.url === '/historico';
      });
  }

  async ShowSplash() {
    await SplashScreen.show({
      autoHide: true,
      showDuration: 4000,
    });
  }

  async toggleContas(event: Event) {
    if (this.isContasAtivo) return;
    event.stopPropagation();
    await this.router.navigate(['/saldo']);
  }

  async navigateToHistorico(event: Event) {
    if (this.isHistoricoAtivo) return;
    event.stopPropagation();
    this.router.navigate(['/historico']);
  }

  logout() {
    this.authService.logout();
  }
}
