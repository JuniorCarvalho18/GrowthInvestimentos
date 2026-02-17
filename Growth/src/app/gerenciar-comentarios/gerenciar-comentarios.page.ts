import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '../services/utils.service';
import { PostsService, Post, Comentario } from '../services/posts.service';
import { Subscription, interval, forkJoin } from 'rxjs';

@Component({
  selector: 'app-gerenciar-comentarios',
  templateUrl: './gerenciar-comentarios.page.html',
  styleUrls: ['./gerenciar-comentarios.page.scss'],
  standalone: false,
})
export class GerenciarComentariosPage implements OnInit, OnDestroy {
  posts: Post[] = [];
  todosComentarios: Comentario[] = [];
  comentariosFiltrados: Comentario[] = [];
  postSelecionadoId: number = 0;

  // Objeto para o Formulário
  comentarioForm: Comentario = this.limparFormulario();
  editando = false;

  private refreshSubscription?: Subscription;

  constructor(
    private rota: Router,
    private postsService: PostsService,
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
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  limparFormulario(): Comentario {
    return {
      post_id: 0,
      usuario_id: 1, // ID padrão de admin/sistema
      autor: '',
      texto: '',
      data: ''
    };
  }

  // --- CARREGAMENTO DE DADOS ---

  async carregarDados(silencioso = false) {
    if (!silencioso) await this.utils.showLoading('Carregando dados...');

    this.postsService.listarPosts().subscribe({
      next: async (res) => {
        if (res.success) {
          this.posts = res.posts;
          await this.carregarTodosComentarios(silencioso);
        } else {
          if (!silencioso) {
            await this.utils.hideLoading();
            await this.utils.toast('Erro ao carregar posts', 'warning');
          }
        }
      },
      error: async (error) => {
        if (!silencioso) {
          await this.utils.hideLoading();
          await this.utils.toastError('Erro de conexão ao carregar posts');
        }
      }
    });
  }

  async carregarTodosComentarios(silencioso = false) {
    const requests = this.posts.map(post =>
      this.postsService.listarComentarios(post.id!)
    );

    forkJoin(requests).subscribe({
      next: async (results) => {
        if (!silencioso) await this.utils.hideLoading();
        this.todosComentarios = [];
        results.forEach(res => {
          if (res.success) {
            this.todosComentarios = [...this.todosComentarios, ...res.comentarios];
          }
        });
        this.filtrarComentarios();
      },
      error: async (error) => {
        if (!silencioso) await this.utils.hideLoading();
        console.error(error);
        if (!silencioso) await this.utils.toastError('Erro ao carregar comentários');
      }
    });
  }

  filtrarComentarios() {
    if (this.postSelecionadoId === 0) {
      this.comentariosFiltrados = [...this.todosComentarios];
    } else {
      this.comentariosFiltrados = this.todosComentarios.filter(
        c => c.post_id == this.postSelecionadoId
      );
    }
    // Ordenar decrescente por ID (mais novos primeiro)
    this.comentariosFiltrados.sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  // --- CRUD (Salvar / Editar / Deletar) ---

  editar(c: Comentario) {
    this.comentarioForm = { ...c };
    this.editando = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.comentarioForm = this.limparFormulario();
    this.editando = false;
  }

  async salvar() {
    if (!this.comentarioForm.post_id) {
      this.utils.toast('Selecione um Post', 'warning');
      return;
    }
    if (!this.comentarioForm.autor) {
      this.utils.toast('Informe o Autor', 'warning');
      return;
    }
    if (!this.comentarioForm.texto) {
      this.utils.toast('Informe o Texto', 'warning');
      return;
    }

    await this.utils.showLoading('Salvando...');

    const request = this.editando
      ? this.postsService.editarComentario(this.comentarioForm)
      : this.postsService.adicionarComentario(this.comentarioForm);

    request.subscribe({
      next: async (res) => {
        await this.utils.hideLoading();
        if (res.success) {
          await this.utils.toast(this.editando ? 'Atualizado com sucesso!' : 'Criado com sucesso!', 'success');
          this.cancelarEdicao();
          this.carregarDados();
        } else {
          await this.utils.toastError('Erro ao salvar comentário');
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
      'Confirmar Exclusão',
      `Deseja realmente excluir o comentário de "${autor}"?`
    );

    if (confirmou) {
      await this.utils.showLoading('Excluindo...');

      this.postsService.deletarComentario(id).subscribe({
        next: async (res) => {
          await this.utils.hideLoading();
          if (res.success) {
            await this.utils.toast('Comentário excluído!', 'success');
            this.carregarDados();
          } else {
            await this.utils.toastError('Erro ao excluir comentário');
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
