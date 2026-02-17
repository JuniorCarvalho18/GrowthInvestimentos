import { Injectable } from '@angular/core';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loading: HTMLIonLoadingElement | null = null;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  // --- LOADING (Carregando...) ---
  async showLoading(message: string = 'Carregando...') {
    // Se já existir um loading, fecha antes de abrir outro para evitar sobreposição
    await this.hideLoading();

    this.loading = await this.loadingCtrl.create({
      message,
      spinner: 'crescent',
      cssClass: 'custom-loading', // Opcional: usa seu estilo global se tiver
      duration: 10000 // Segurança: fecha sozinho em 10s se algo travar
    });
    await this.loading.present();
  }

  async hideLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  async toast(
      message: string,
      color: 'success' | 'warning' | 'danger' | 'medium' | 'dark' | 'primary' = 'success',
      duration: number = 3000
    ) {
      const toast = await this.toastCtrl.create({
        message: message,
        duration: duration,
        color: color,
        position: 'top',
        cssClass: 'toast-custom',
        buttons: []
      });
      await toast.present();
    }

  // --- TOAST DE ERRO (Requer Atenção) ---
  // Use este para: "Erro de conexão", "Falha ao salvar", "Erro 500"
  async toastError(message: string, duration: number = 5000) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration, // Dura mais tempo (5s)
      color: 'danger',
      position: 'top',
      icon: 'alert-circle-outline',
      // COM BOTÃO: Caso o erro seja longo, o usuário pode fechar.
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            console.log('Fechou erro');
          }
        }
      ]
    });
    await toast.present();
  }

  // --- ALERTA (Confirmação) ---
  // Use este para: "Deseja excluir?", "Tem certeza?"
  async alertConfirm(header: string, message: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header,
        message,
        buttons: [
          {
            text: 'Não',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => resolve(false)
          }, {
            text: 'Sim',
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }
}
