import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  private loading: HTMLIonLoadingElement | null = null;

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async showLoading(message: string = 'Carregando...') {
    this.loading = await this.loadingController.create({
      message,
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await this.loading.present();
  }

  async hideLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success', duration: number = 3000) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: 'top',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  async showSuccess(message: string) {
    await this.showToast(message, 'success');
  }

  async showError(message: string) {
    await this.showToast(message, 'danger', 4000);
  }

  async showWarning(message: string) {
    await this.showToast(message, 'warning');
  }
}
