import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ImageUploadService } from '../services/image.upload.service';
import { ToastController, LoadingController, ModalController } from '@ionic/angular';
import { ProjetosService } from '../services/projetos.service';

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
    categoria: 'Energia Renovável', // Categoria padrão
    imagem: ''
  };

  categorias = [
    'Energia Renovável',
    'Reflorestamento',
    'Reciclagem',
    'Tratamento de Água',
    'Agricultura Sustentável',
    'Mobilidade Verde',
    'Educação Ambiental',
    'Outro'
  ];

  loading: HTMLIonLoadingElement | null = null;

  constructor(
    private rota: Router,
    private imageUploadService: ImageUploadService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private projetosService: ProjetosService,
    private modalController: ModalController
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

    if (!this.projeto.local.trim()) {
      await this.showToast('Local é obrigatório!', 'warning');
      return;
    }

    if (!this.projeto.descricao.trim()) {
      await this.showToast('Descrição é obrigatória!', 'warning');
      return;
    }

    // Mostra loading
    await this.showLoading('Salvando projeto...');

    // Prepara dados para enviar à API
    const projetoData = {
      nome: this.projeto.nome,
      descricao: this.projeto.descricao,
      meta: parseFloat(this.projeto.meta.replace(/[^\d,.-]/g, '').replace(',', '.')),
      previsao: this.projeto.previsao,
      local: this.projeto.local,
      categoria: this.projeto.categoria,
      imagem: this.projeto.imagem
    };

    // Salva na API
    this.projetosService.salvarProjeto(projetoData).subscribe({
      next: async (response) => {
        await this.hideLoading();

        if (response.success) {
          await this.showToast('Projeto criado com sucesso!', 'success');

          // Limpa formulário
          this.projeto = {
            nome: '',
            meta: '',
            previsao: '',
            local: '',
            descricao: '',
            categoria: 'Energia Renovável',
            imagem: ''
          };

          // Fecha o modal se estiver em um modal
          this.modalController.dismiss({ success: true });
        } else {
          await this.showToast('Erro ao criar projeto!', 'danger');
        }
      },
      error: async (error) => {
        await this.hideLoading();
        console.error('Erro ao salvar projeto:', error);
        await this.showToast('Erro ao conectar ao servidor!', 'danger');
      }
    });
  }

  async showLoading(message: string = 'Carregando...') {
    this.loading = await this.loadingController.create({
      message,
      spinner: 'crescent'
    });
    await this.loading.present();
  }

  async hideLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
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
