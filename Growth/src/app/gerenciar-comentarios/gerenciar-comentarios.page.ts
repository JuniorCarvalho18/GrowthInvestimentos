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
      await this.showLoading('Carregando comentários...');
    }

    this.postsService.listarPosts().subscribe({
      next: async (res) => {
        if (res.success) {
          this.posts = res.posts;
          await this.carregarTodosComentarios(silencioso);
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

  async carregarTodosComentarios(silencioso = false) {
    const requests = this.posts.map(post =>
      this.postsService.listarComentarios(post.id!)
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        this.todosComentarios = [];
        results.forEach(res => {
          if (res.success) {
            this.todosComentarios = [...this.todosComentarios, ...res.comentarios];
          }
        });
        this.filtrarComentarios();
      },
      error: async (error) => {
        if (!silencioso) {
          console.error('Erro ao carregar comentários:', error);
        }
      }
    });
  }

  filtrarComentarios() {
    if (this.postSelecionadoId === 0) {
      this.comentariosFiltrados = [...this.todosComentarios];
    } else {
      this.comentariosFiltrados = this.todosComentarios.filter(
        c => c.post_id === this.postSelecionadoId
      );
    }

    // Ordena por data (mais recentes primeiro)
    this.comentariosFiltrados.sort((a, b) =>
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }

  async deletar(id: number, autor: string) {
    const alert = await this.alert.create({
      header: 'Confirmar Exclusão',
      message: `Deseja realmente excluir o comentário de "${autor}"?`,
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

            // Nota: Você precisará implementar este método no posts.service.ts
            // Por enquanto, vou mostrar um toast de "não implementado"
            await this.hideLoading();
            await this.presentToast('Função de exclusão em desenvolvimento', 'warning');

            // Quando implementar, use:
            // this.postsService.deletarComentario(id).subscribe(...)
          }
        }
      ]
    });
    await alert.present();
  }
}
