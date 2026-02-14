import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ImageUploadService } from '../services/image-upload.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-addproj',
  templateUrl: './addproj.page.html',
  styleUrls: ['./addproj.page.scss'],
  standalone: false,
})
export class AddprojPage implements OnInit {
  projeto = {
    nome: '',
    meta: '',
    previsao: '',
    local: '',
    descricao: '',
    imagem: '' // Nova propriedade para imagem
  };

  constructor(
    private rota: Router,
    private imageUploadService: ImageUploadService,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  async selecionarImagem() {
    const imagemBase64 = await this.imageUploadService.selecionarImagem();

    if (imagemBase64) {
      this.projeto.imagem = imagemBase64;
      await this.showToast('Imagem adicionada!', 'success');
    }
  }

  removerImagem() {
    this.projeto.imagem = '';
  }

  async adicionar() {
    // Validações básicas
    if (!this.projeto.nome.trim()) {
      await this.showToast('Nome do projeto é obrigatório!', 'warning');
      return;
    }

    if (!this.projeto.meta.trim()) {
      await this.showToast('Meta é obrigatória!', 'warning');
      return;
    }

    // TODO: Integrar com API para salvar o projeto
    console.log('Projeto a ser salvo:', this.projeto);

    await this.showToast('Projeto adicionado com sucesso!', 'success');

    // Limpar formulário
    this.projeto = {
      nome: '',
      meta: '',
      previsao: '',
      local: '',
      descricao: '',
      imagem: ''
    };
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}
