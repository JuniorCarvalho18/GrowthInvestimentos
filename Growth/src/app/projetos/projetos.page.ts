import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ProjetosService, Projeto } from '../services/projetos.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-projetos',
  templateUrl: './projetos.page.html',
  styleUrls: ['./projetos.page.scss'],
  standalone: false,
})
export class ProjetosPage implements OnInit, OnDestroy {
  projetos: Projeto[] = [];
  projeto: Projeto = this.limparFormulario();
  loading: HTMLIonLoadingElement | null = null;

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

  statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  constructor(
    private rota: Router,
    private projetosService: ProjetosService,
    private toast: ToastController,
    private alert: AlertController,
    private loadingController: LoadingController,
    private refreshSubscription?: Subscription
  ) {}

  ngOnInit() {
    this.listarProjetos();
    this.refreshSubscription = interval(5000).subscribe(() => {
      this.listarProjetos(true);
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  limparFormulario(): Projeto {
    return {
      nome: '',
      descricao: '',
      meta: 0,
      arrecadado: 0,
      previsao: '',
      local: '',
      imagem: '',
      categoria: 'Energia Renovável',
      impacto_estimado: '',
      status: 'ativo'
    };
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

  async presentToast(msg: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toast.create({
      message: msg,
      duration: 3000,
      color,
      position: 'top',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  async listarProjetos(silencioso = false) {
    if (!silencioso) {
      await this.showLoading('Carregando projetos...');
    }

    this.projetosService.listarProjetos().subscribe({
      next: async (res) => {
        if (!silencioso) {
          await this.hideLoading();
        }
        if (res.success) {
          this.projetos = res.projetos;
        } else {
          await this.presentToast('Erro ao carregar projetos', 'danger');
        }
      },
      error: async (error) => {
        if (!silencioso) {
          await this.hideLoading();
        }
        console.error('Erro:', error);
        await this.presentToast('Erro ao conectar ao servidor', 'danger');
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.projeto.nome.trim()) {
      this.presentToast('Nome do projeto é obrigatório!', 'warning');
      return false;
    }
    if (!this.projeto.descricao.trim()) {
      this.presentToast('Descrição é obrigatória!', 'warning');
      return false;
    }
    if (!this.projeto.meta || this.projeto.meta <= 0) {
      this.presentToast('Meta deve ser maior que zero!', 'warning');
      return false;
    }
    if (!this.projeto.previsao) {
      this.presentToast('Previsão é obrigatória!', 'warning');
      return false;
    }
    if (!this.projeto.local.trim()) {
      this.presentToast('Local é obrigatório!', 'warning');
      return false;
    }

    return true;
  }

  async salvarProjeto() {
    if (!this.validarFormulario()) {
      return;
    }

    await this.showLoading(this.projeto.id ? 'Atualizando...' : 'Salvando...');

    const observable = this.projeto.id
      ? this.projetosService.editarProjeto(this.projeto)
      : this.projetosService.salvarProjeto(this.projeto);

    observable.subscribe({
      next: async (res) => {
        await this.hideLoading();
        if (res.success) {
          await this.presentToast(
            this.projeto.id ? 'Projeto atualizado!' : 'Projeto criado!',
            'success'
          );
          this.projeto = this.limparFormulario();
          this.listarProjetos();
        } else {
          await this.presentToast('Erro ao salvar projeto!', 'danger');
        }
      },
      error: async (error) => {
        await this.hideLoading();
        console.error('Erro:', error);
        await this.presentToast('Erro ao salvar projeto', 'danger');
      }
    });
  }

  editar(p: Projeto) {
    this.projeto = { ...p };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.projeto = this.limparFormulario();
  }

  async deletar(id: number, nome: string) {
    const alert = await this.alert.create({
      header: 'Confirmar Exclusão',
      message: `Deseja realmente excluir o projeto "${nome}"? Esta ação não pode ser desfeita.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          cssClass: 'alert-button-danger',
          handler: async () => {
            await this.showLoading('Excluindo...');

            this.projetosService.deletarProjeto(id).subscribe({
              next: async (res) => {
                await this.hideLoading();
                if (res.success) {
                  await this.presentToast('Projeto excluído!', 'success');
                  this.listarProjetos();
                } else {
                  await this.presentToast('Erro ao excluir projeto', 'danger');
                }
              },
              error: async (error) => {
                await this.hideLoading();
                console.error('Erro:', error);
                await this.presentToast('Erro ao conectar ao servidor', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ativo': return 'success';
      case 'concluido': return 'primary';
      case 'cancelado': return 'danger';
      default: return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  }

  calcularProgresso(meta: number, arrecadado: number): number {
    return (arrecadado / meta) * 100;
  }
}
