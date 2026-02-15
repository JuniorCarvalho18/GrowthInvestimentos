import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ProjetosService } from '../services/projetos.service';
import { AvaliacoesService, Avaliacao } from '../services/avaliacoes.service';
import { Subscription, interval, forkJoin } from 'rxjs';

@Component({
  selector: 'app-gerenciar-avaliacoes',
  templateUrl: './gerenciar-avaliacoes.page.html',
  styleUrls: ['./gerenciar-avaliacoes.page.scss'],
  standalone: false,
})
export class GerenciarAvaliacoesPage implements OnInit, OnDestroy {
  projetos: any[] = [];
  todasAvaliacoes: Avaliacao[] = [];
  avaliacoesFiltradas: Avaliacao[] = [];
  projetoSelecionadoId: number = 0;
  loading: HTMLIonLoadingElement | null = null;
  private refreshSubscription?: Subscription;

  constructor(
    private rota: Router,
    private projetosService: ProjetosService,
    private avaliacoesService: AvaliacoesService,
    private toast: ToastController,
    private alert: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.carregarDados();
    // 🔄 AUTO-REFRESH: Atualiza a cada 5 segundos
    this.refreshSubscription = interval(5000).subscribe(() => {
      this.carregarDados(true);
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
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

  async carregarDados(silencioso = false) {
    if (!silencioso) {
      await this.showLoading('Carregando avaliações...');
    }

    this.projetosService.listarProjetos().subscribe({
      next: async (res) => {
        if (res.success) {
          this.projetos = res.projetos;
          await this.carregarTodasAvaliacoes(silencioso);
        }
        if (!silencioso) {
          await this.hideLoading();
        }
      },
      error: async (error) => {
        if (!silencioso) {
          await this.hideLoading();
          console.error('Erro:', error);
          await this.presentToast('Erro ao conectar ao servidor', 'danger');
        }
      }
    });
  }

  async carregarTodasAvaliacoes(silencioso = false) {
    const requests = this.projetos.map(projeto =>
      this.avaliacoesService.listarAvaliacoes(projeto.id)
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        this.todasAvaliacoes = [];
        results.forEach(res => {
          if (res.success) {
            this.todasAvaliacoes = [...this.todasAvaliacoes, ...res.avaliacoes];
          }
        });
        this.filtrarAvaliacoes();
      },
      error: async (error) => {
        if (!silencioso) {
          console.error('Erro ao carregar avaliações:', error);
        }
      }
    });
  }

  filtrarAvaliacoes() {
    if (this.projetoSelecionadoId === 0) {
      this.avaliacoesFiltradas = [...this.todasAvaliacoes];
    } else {
      this.avaliacoesFiltradas = this.todasAvaliacoes.filter(
        a => a.projeto_id === this.projetoSelecionadoId
      );
    }

    // Ordena por data (mais recentes primeiro)
    this.avaliacoesFiltradas.sort((a, b) =>
      new Date(b.data || '').getTime() - new Date(a.data || '').getTime()
    );
  }

  getProjetoNome(projetoId: number): string {
    const projeto = this.projetos.find(p => p.id === projetoId);
    return projeto ? projeto.nome : `Projeto #${projetoId}`;
  }

  async deletar(id: number, autor: string) {
    const alert = await this.alert.create({
      header: 'Confirmar Exclusão',
      message: `Deseja realmente excluir a avaliação de "${autor}"?`,
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

            this.avaliacoesService.deletarAvaliacao(id).subscribe({
              next: async (res) => {
                await this.hideLoading();
                if (res.success) {
                  await this.presentToast('Avaliação excluída!', 'success');
                  this.carregarDados(); // Recarrega a lista
                } else {
                  await this.presentToast('Erro ao excluir avaliação', 'danger');
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
}
