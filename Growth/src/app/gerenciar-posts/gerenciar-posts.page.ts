import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '../services/utils.service';
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
  private refreshSubscription?: Subscription;

  constructor(
    private rota: Router,
    private postsService: PostsService,
    private imageUploadService: ImageUploadService,
    private utils: UtilsService
  ) {}

  ngOnInit() {
    this.listarPosts();
    // 🔄 AUTO-REFRESH: Atualiza a cada 5 segundos
    this.refreshSubscription = interval(5000).subscribe(() => {
      this.listarPosts(true);
    });
  }

  ngOnDestroy() {
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

  async listarPosts(silencioso = false) {
    if (!silencioso) await this.utils.showLoading('Carregando posts...');

    this.postsService.listarPosts().subscribe({
      next: async (res) => {
        if (!silencioso) await this.utils.hideLoading();
        if (res.success) {
          this.posts = res.posts;
        } else {
          if (!silencioso) await this.utils.toast('Erro ao carregar posts', 'warning');
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

  async selecionarImagem() {
    const imagemBase64 = await this.imageUploadService.selecionarImagem();
    if (imagemBase64) {
      this.post.imagem = imagemBase64;
      await this.utils.toast('Imagem adicionada!', 'success');
    }
  }

  validarFormulario(): boolean {
    if (!this.post.autor.trim()) {
      this.utils.toast('Autor é obrigatório!', 'warning');
      return false;
    }
    if (!this.post.texto.trim()) {
      this.utils.toast('Texto é obrigatório!', 'warning');
      return false;
    }
    if (!this.post.categoria) {
      this.utils.toast('Categoria é obrigatória!', 'warning');
      return false;
    }
    return true;
  }

  async salvarPost() {
    if (!this.validarFormulario()) {
      return;
    }

    await this.utils.showLoading(this.post.id ? 'Atualizando...' : 'Salvando...');

    const observable = this.post.id
      ? this.postsService.editarPost(this.post)
      : this.postsService.criarPost(this.post);

    observable.subscribe({
      next: async (res) => {
        await this.utils.hideLoading();
        if (res.success) {
          await this.utils.toast(
            this.post.id ? 'Post atualizado!' : 'Post criado!',
            'success'
          );
          this.post = this.limparFormulario();
          this.listarPosts();
        } else {
          await this.utils.toastError('Erro ao salvar post!');
        }
      },
      error: async (error) => {
        await this.utils.hideLoading();
        console.error('Erro:', error);
        await this.utils.toastError('Erro ao conectar ao servidor');
      }
    });
  }

  // --- MÉTODOS QUE FALTAVAM ---

  editar(p: Post) {
    this.post = { ...p };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.post = this.limparFormulario();
  }

  async deletar(id: number, autor: string) {
    const confirmou = await this.utils.alertConfirm(
      'Confirmar Exclusão',
      `Deseja realmente excluir o post de "${autor}"?`
    );

    if (confirmou) {
      await this.utils.showLoading('Excluindo...');

      this.postsService.deletarPost(id, 1).subscribe({
        next: async (res) => {
          await this.utils.hideLoading();
          if (res.success) {
            await this.utils.toast('Post excluído!', 'success');
            this.listarPosts();
          } else {
            await this.utils.toastError('Erro ao excluir post');
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
}
