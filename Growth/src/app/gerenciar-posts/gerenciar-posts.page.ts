import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { PostsService, Post } from '../services/posts.service';
import { ImageUploadService } from '../services/image.upload.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-gerenciar-posts',
  templateUrl: './gerenciar-posts.page.html',
  styleUrls: ['./gerenciar-posts.page.scss'],
  standalone: false,
})
export class GerenciarPostsPage implements OnInit, OnDestroy {
  posts: Post[] = [];
  post: Post = this.limparFormulario();
  loading: HTMLIonLoadingElement | null = null;
  private refreshSubscription?: Subscription;

  constructor(
    private rota: Router,
    private postsService: PostsService,
    private imageUploadService: ImageUploadService,
    private toast: ToastController,
    private alert: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.listarPosts();
    // 🔄 AUTO-REFRESH: Atualiza a cada 5 segundos
    this.refreshSubscription = interval(5000).subscribe(() => {
      this.listarPosts(true); // true = silencioso (sem loading)
    });
  }

  ngOnDestroy() {
    // Cancela o auto-refresh quando sair da página
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  limparFormulario(): Post {
    return {
      autor: '',
      texto: '',
      categoria: 'Comunidade Prêmios',
      imagem: '',
      curtidas: 0,
      comentarios: 0
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

  async listarPosts(silencioso = false) {
    if (!silencioso) {
      await this.showLoading('Carregando posts...');
    }

    this.postsService.listarPosts().subscribe({
      next: async (res) => {
        if (!silencioso) {
          await this.hideLoading();
        }
        if (res.success) {
          this.posts = res.posts;
        } else {
          if (!silencioso) {
            await this.presentToast('Erro ao carregar posts', 'danger');
          }
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

  async selecionarImagem() {
    const imagemBase64 = await this.imageUploadService.selecionarImagem();
    if (imagemBase64) {
      this.post.imagem = imagemBase64;
      await this.presentToast('Imagem adicionada!', 'success');
    }
  }

  validarFormulario(): boolean {
    if (!this.post.autor.trim()) {
      this.presentToast('Autor é obrigatório!', 'warning');
      return false;
    }
    if (!this.post.texto.trim()) {
      this.presentToast('Texto é obrigatório!', 'warning');
      return false;
    }
    if (!this.post.categoria) {
      this.presentToast('Categoria é obrigatória!', 'warning');
      return false;
    }

    return true;
  }

  async salvarPost() {
    if (!this.validarFormulario()) {
      return;
    }

    await this.showLoading(this.post.id ? 'Atualizando...' : 'Salvando...');

    const observable = this.post.id
      ? this.postsService.editarPost(this.post)
      : this.postsService.criarPost(this.post);

    observable.subscribe({
      next: async (res) => {
        await this.hideLoading();
        if (res.success) {
          await this.presentToast(
            this.post.id ? 'Post atualizado!' : 'Post criado!',
            'success'
          );
          this.post = this.limparFormulario();
          this.listarPosts();
        } else {
          await this.presentToast('Erro ao salvar post!', 'danger');
        }
      },
      error: async (error) => {
        await this.hideLoading();
        console.error('Erro:', error);
        await this.presentToast('Erro ao salvar post', 'danger');
      }
    });
  }

  editar(p: Post) {
    this.post = { ...p };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.post = this.limparFormulario();
  }

  async deletar(id: number, autor: string) {
    const alert = await this.alert.create({
      header: 'Confirmar Exclusão',
      message: `Deseja realmente excluir o post de "${autor}"?`,
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

            this.postsService.deletarPost(id, 1).subscribe({
              next: async (res) => {
                await this.hideLoading();
                if (res.success) {
                  await this.presentToast('Post excluído!', 'success');
                  this.listarPosts();
                } else {
                  await this.presentToast('Erro ao excluir post', 'danger');
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
