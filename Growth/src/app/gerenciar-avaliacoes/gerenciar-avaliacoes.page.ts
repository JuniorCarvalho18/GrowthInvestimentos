import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '../services/utils.service'; // <--- Importado
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

  private refreshSubscription?: Subscription;

  constructor(
    private rota: Router,
    private projetosService: ProjetosService,
    private avaliacoesService: AvaliacoesService,
    private utils: UtilsService // <--- Injeção do Utils
  ) {}

  ngOnInit() {
    this.carregarDados();
    // 🔄 Atualiza a cada 5 segundos
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

  // --- CARREGAMENTO DE DADOS ---

  async carregarDados(silencioso = false) {
    if (!silencioso) await this.utils.showLoading();

    this.projetosService.listarProjetos().subscribe({
      next: async (res) => {
        if (res.success) {
          this.projetos = res.projetos;
          await this.carregarTodasAvaliacoes(silencioso);
        } else {
          if (!silencioso) {
            await this.utils.hideLoading();
            await this.utils.toast('Erro ao carregar projetos', 'warning');
          }
        }
      },
      error: async () => {
        if (!silencioso) {
          await this.utils.hideLoading();
          await this.utils.toastError('Erro ao carregar projetos');
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
        if (!silencioso) await this.utils.hideLoading();
        this.todasAvaliacoes = [];
        results.forEach(res => {
          if (res.success) {
            this.todasAvaliacoes = [...this.todasAvaliacoes, ...res.avaliacoes];
          }
        });
        this.filtrarAvaliacoes();
      },
      error: async (error) => {
        if (!silencioso) await this.utils.hideLoading();
        console.error(error);
        if (!silencioso) await this.utils.toastError('Erro ao carregar avaliações');
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

  // --- CRUD (Salvar / Editar / Deletar) ---

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
      this.utils.toast('Selecione um projeto', 'warning');
      return;
    }
    if (!this.avaliacaoForm.autor) {
      this.utils.toast('Informe o autor', 'warning');
      return;
    }

    await this.utils.showLoading('Salvando...');

    this.avaliacoesService.criarAvaliacao(this.avaliacaoForm).subscribe({
      next: async (res) => {
        await this.utils.hideLoading();
        if (res.success) {
          await this.utils.toast('Salvo com sucesso!', 'success');
          this.cancelarEdicao();
          this.carregarDados();
        } else {
          await this.utils.toastError('Erro ao salvar avaliação');
        }
      },
      error: async () => {
        await this.utils.hideLoading();
        await this.utils.toastError('Erro de conexão');
      }
    });
  }

  async deletar(id: number, autor: string) {
    // Usa o alert padronizado do Utils
    const confirmou = await this.utils.alertConfirm(
      'Excluir Avaliação',
      `Deletar avaliação de ${autor}?`
    );

    if (confirmou) {
      await this.utils.showLoading('Excluindo...');

      this.avaliacoesService.deletarAvaliacao(id).subscribe({
        next: async (res) => {
          await this.utils.hideLoading();
          if (res.success) {
            await this.utils.toast('Avaliação excluída!', 'success');
            this.carregarDados();
          } else {
            await this.utils.toastError('Erro ao excluir avaliação');
          }
        },
        error: async () => {
          await this.utils.hideLoading();
          await this.utils.toastError('Erro de conexão');
        }
      });
    }
  }
}
