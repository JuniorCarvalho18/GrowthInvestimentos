import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '../services/utils.service'; // <--- Importado
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
  private refreshSubscription?: Subscription;

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
    private utils: UtilsService // <--- Injeção do Utils
  ) {}

  ngOnInit() {
    this.listarProjetos();
    // 🔄 Auto-refresh a cada 5s
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

  // --- LISTAGEM ---

  async listarProjetos(silencioso = false) {
    if (!silencioso) {
      await this.utils.showLoading('Carregando projetos...');
    }

    this.projetosService.listarProjetos().subscribe({
      next: async (res) => {
        if (!silencioso) await this.utils.hideLoading();

        if (res.success) {
          this.projetos = res.projetos;
        } else {
          // Erro leve, apenas aviso se não for silencioso
          if (!silencioso) await this.utils.toast('Erro ao carregar projetos', 'warning');
        }
      },
      error: async (error) => {
        if (!silencioso) {
          await this.utils.hideLoading();
          console.error('Erro:', error);
          await this.utils.toastError('Erro ao conectar ao servidor');
        }
      }
    });
  }

  // --- VALIDAÇÃO E SALVAMENTO ---

  validarFormulario(): boolean {
    if (!this.projeto.nome.trim()) {
      this.utils.toast('Nome do projeto é obrigatório!', 'warning');
      return false;
    }
    if (!this.projeto.descricao.trim()) {
      this.utils.toast('Descrição é obrigatória!', 'warning');
      return false;
    }
    if (!this.projeto.meta || this.projeto.meta <= 0) {
      this.utils.toast('Meta deve ser maior que zero!', 'warning');
      return false;
    }
    if (!this.projeto.previsao) {
      this.utils.toast('Previsão é obrigatória!', 'warning');
      return false;
    }
    if (!this.projeto.local.trim()) {
      this.utils.toast('Local é obrigatório!', 'warning');
      return false;
    }

    return true;
  }

  async salvarProjeto() {
    if (!this.validarFormulario()) {
      return;
    }

    await this.utils.showLoading(this.projeto.id ? 'Atualizando...' : 'Salvando...');

    const observable = this.projeto.id
      ? this.projetosService.editarProjeto(this.projeto)
      : this.projetosService.salvarProjeto(this.projeto);

    observable.subscribe({
      next: async (res) => {
        await this.utils.hideLoading();
        if (res.success) {
          await this.utils.toast(
            this.projeto.id ? 'Projeto atualizado!' : 'Projeto criado!',
            'success'
          );
          this.projeto = this.limparFormulario();
          this.listarProjetos();
        } else {
          await this.utils.toastError('Erro ao salvar projeto!');
        }
      },
      error: async (error) => {
        await this.utils.hideLoading();
        console.error('Erro:', error);
        await this.utils.toastError('Erro de conexão');
      }
    });
  }

  // --- CRUD AUXILIAR ---

  editar(p: Projeto) {
    this.projeto = { ...p };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.projeto = this.limparFormulario();
  }

  async deletar(id: number, nome: string) {
    // Confirmação usando Utils
    const confirmou = await this.utils.alertConfirm(
      'Confirmar Exclusão',
      `Deseja realmente excluir o projeto "${nome}"? Esta ação não pode ser desfeita.`
    );

    if (confirmou) {
      await this.utils.showLoading('Excluindo...');

      this.projetosService.deletarProjeto(id).subscribe({
        next: async (res) => {
          await this.utils.hideLoading();
          if (res.success) {
            await this.utils.toast('Projeto excluído!', 'success');
            this.listarProjetos();
          } else {
            await this.utils.toastError('Erro ao excluir projeto');
          }
        },
        error: async (error) => {
          await this.utils.hideLoading();
          console.error('Erro:', error);
          await this.utils.toastError('Erro de conexão');
        }
      });
    }
  }

  // --- UI HELPERS ---

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
