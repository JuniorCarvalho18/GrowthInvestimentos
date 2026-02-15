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

  // Objeto para Formulário
  avaliacaoForm: Avaliacao = this.limparFormulario();
  editando = false;

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
    this.refreshSubscription = interval(5000).subscribe(() => {
      this.carregarDados(true);
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
  }

  limparFormulario(): Avaliacao {
    return {
      projeto_id: 0,
      usuario_id: 1, // Default Admin ID
      autor: '',
      nota: 5,
      comentario: ''
    };
  }

  async showLoading(message: string = 'Carregando...') {
    this.loading = await this.loadingController.create({
      message, spinner: 'crescent'
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
      message: msg, duration: 3000, color, position: 'top',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  async carregarDados(silencioso = false) {
    if (!silencioso) await this.showLoading();

    this.projetosService.listarProjetos().subscribe({
      next: async (res) => {
        if (res.success) {
          this.projetos = res.projetos;
          await this.carregarTodasAvaliacoes(silencioso);
        } else {
          if (!silencioso) await this.hideLoading();
        }
      },
      error: async () => {
        if (!silencioso) {
          await this.hideLoading();
          await this.presentToast('Erro ao carregar projetos', 'danger');
        }
      }
    });
  }

  async carregarTodasAvaliacoes(silencioso = false) {
    const requests = this.projetos.map(projeto =>
      this.avaliacoesService.listarAvaliacoes(projeto.id)
    );

    forkJoin(requests).subscribe({
      next: async (results) => {
        if (!silencioso) await this.hideLoading();
        this.todasAvaliacoes = [];
        results.forEach(res => {
          if (res.success) {
            this.todasAvaliacoes = [...this.todasAvaliacoes, ...res.avaliacoes];
          }
        });
        this.filtrarAvaliacoes();
      },
      error: async (error) => {
        if (!silencioso) await this.hideLoading();
        console.error(error);
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
    this.avaliacoesFiltradas.sort((a, b) =>
      new Date(b.data || '').getTime() - new Date(a.data || '').getTime()
    );
  }

  getProjetoNome(projetoId: number): string {
    const p = this.projetos.find(proj => proj.id === projetoId);
    return p ? p.nome : `Projeto #${projetoId}`;
  }

  // --- CRUD ---

  editar(a: Avaliacao) {
    this.avaliacaoForm = { ...a };
    this.editando = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.avaliacaoForm = this.limparFormulario();
    this.editando = false;
  }

  async salvar() {
    if (!this.avaliacaoForm.projeto_id) {
      this.presentToast('Selecione um projeto', 'warning');
      return;
    }
    if (!this.avaliacaoForm.autor) {
      this.presentToast('Informe o autor', 'warning');
      return;
    }

    await this.showLoading('Salvando...');

    // O método criarAvaliacao no PHP funciona como UPSERT (Atualiza se existir, Cria se não)
    // baseado no par (projeto_id, usuario_id).
    this.avaliacoesService.criarAvaliacao(this.avaliacaoForm).subscribe({
      next: async (res) => {
        await this.hideLoading();
        if (res.success) {
          await this.presentToast('Salvo com sucesso!', 'success');
          this.cancelarEdicao();
          this.carregarDados();
        } else {
          await this.presentToast('Erro ao salvar', 'danger');
        }
      },
      error: async () => {
        await this.hideLoading();
        await this.presentToast('Erro de conexão', 'danger');
      }
    });
  }

  async deletar(id: number, autor: string) {
    const alert = await this.alert.create({
      header: 'Excluir Avaliação',
      message: `Deletar avaliação de ${autor}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir', cssClass: 'alert-button-danger',
          handler: async () => {
            await this.showLoading('Excluindo...');
            this.avaliacoesService.deletarAvaliacao(id).subscribe({
              next: async (res) => {
                await this.hideLoading();
                if (res.success) {
                  await this.presentToast('Excluído!', 'success');
                  this.carregarDados();
                } else {
                  await this.presentToast('Erro ao excluir', 'danger');
                }
              },
              error: async () => {
                await this.hideLoading();
                await this.presentToast('Erro de conexão', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
