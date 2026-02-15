import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
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

  loading: HTMLIonLoadingElement | null = null;
  private refreshSubscription?: Subscription;

  constructor(
    private rota: Router,
    private postsService: PostsService,
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
    if (!silencioso) await this.showLoading('Carregando dados...');

    this.postsService.listarPosts().subscribe({
      next: async (res) => {
        if (res.success) {
          this.posts = res.posts;
          await this.carregarTodosComentarios(silencioso);
        } else {
          if (!silencioso) await this.hideLoading();
        }
      },
      error: async (error) => {
        if (!silencioso) {
          await this.hideLoading();
          await this.presentToast('Erro ao carregar posts', 'danger');
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
        if (!silencioso) await this.hideLoading();
        this.todosComentarios = [];
        results.forEach(res => {
          if (res.success) {
            this.todosComentarios = [...this.todosComentarios, ...res.comentarios];
          }
        });
        this.filtrarComentarios();
      },
      error: async (error) => {
        if (!silencioso) await this.hideLoading();
        console.error(error);
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
    // Ordenar decrescente
    this.comentariosFiltrados.sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  // --- CRUD ---

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
      this.presentToast('Selecione um Post', 'warning');
      return;
    }
    if (!this.comentarioForm.autor) {
      this.presentToast('Informe o Autor', 'warning');
      return;
    }
    if (!this.comentarioForm.texto) {
      this.presentToast('Informe o Texto', 'warning');
      return;
    }

    await this.showLoading('Salvando...');

    const request = this.editando
      ? this.postsService.editarComentario(this.comentarioForm)
      : this.postsService.adicionarComentario(this.comentarioForm);

    request.subscribe({
      next: async (res) => {
        await this.hideLoading();
        if (res.success) {
          await this.presentToast(this.editando ? 'Atualizado!' : 'Criado!', 'success');
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
      header: 'Confirmar Exclusão',
      message: `Deletar comentário de ${autor}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          cssClass: 'alert-button-danger',
          handler: async () => {
            await this.showLoading('Excluindo...');
            this.postsService.deletarComentario(id).subscribe({
              next: async (res) => {
                await this.hideLoading();
                if (res.success) {
                  await this.presentToast('Excluído!', 'success');
                  this.carregarDados();
                }
              },
              error: async () => {
                await this.hideLoading();
                await this.presentToast('Erro ao excluir', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
