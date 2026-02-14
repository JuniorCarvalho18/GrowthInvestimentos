import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  constructor(private platform: Platform) {}

  /**
   * Seleciona imagem de forma adaptativa:
   * - Desktop: Abre seletor de arquivos
   * - Mobile: Abre câmera/galeria do Capacitor
   */
  async selecionarImagem(): Promise<string | null> {
    try {
      // Detecta se está em desktop (navegador web)
      const isDesktop = !this.platform.is('capacitor') && !this.platform.is('cordova');

      if (isDesktop) {
        // DESKTOP: Usa input file nativo
        return await this.selecionarImagemDesktop();
      } else {
        // MOBILE: Usa Capacitor Camera
        return await this.selecionarImagemMobile();
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      return null;
    }
  }

  /**
   * Seleção de imagem para DESKTOP (input file)
   */
  private async selecionarImagemDesktop(): Promise<string | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            resolve(e.target.result); // Base64 DataURL
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  /**
   * Seleção de imagem para MOBILE (Capacitor)
   */
  private async selecionarImagemMobile(): Promise<string | null> {
    try {
      const imagem = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Selecionar Imagem',
        promptLabelPhoto: 'Galeria',
        promptLabelPicture: 'Câmera'
      });

      return imagem.dataUrl || null;
    } catch (error) {
      return null;
    }
  }
}
