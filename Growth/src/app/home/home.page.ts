import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

interface Post {
  id: number;
  autor: string;
  tempo: string;
  texto: string;
  categoria: string;
  imagem?: string;
  curtidas: number;
  comentarios: number;
  curtido: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  isModalOpen = false;
  isNotificationsModalOpen = false;
  isNovoPostModalOpen = false;
  currentUser: User | null = null;

  // Sistema de Posts
  posts: Post[] = [
    {
      id: 1,
      autor: 'ApoiadorSocial1',
      tempo: '2h',
      texto: 'Empolgado com minha nova aquisição!',
      categoria: 'Comunidade Prêmios',
      imagem: '',
      curtidas: 12,
      comentarios: 3,
      curtido: false
    },
    {
      id: 2,
      autor: 'InvestidorVerde',
      tempo: '5h',
      texto: 'Meu investimento no projeto de energia solar está dando ótimos resultados! 🌞',
      categoria: 'Investimentos',
      imagem: '',
      curtidas: 28,
      comentarios: 7,
      curtido: false
    },
    {
      id: 3,
      autor: 'EcoWarrior',
      tempo: '1d',
      texto: 'Acabei de resgatar um curso de sustentabilidade com meus tokens. Vale muito a pena!',
      categoria: 'Comunidade Prêmios',
      imagem: '',
      curtidas: 15,
      comentarios: 5,
      curtido: false
    }
  ];

  novoPost = {
    texto: '',
    categoria: 'Comunidade Prêmios'
  };

  constructor(
    private rota: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  get userName(): string {
    return this.currentUser?.nome || 'Usuário';
  }

  openAddProjectModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openNotificationsModal() {
    this.isNotificationsModalOpen = true;
  }

  closeNotificationsModal() {
    this.isNotificationsModalOpen = false;
  }

  // ==========================================
  // SISTEMA DE POSTS
  // ==========================================

  abrirNovoPost() {
    this.isNovoPostModalOpen = true;
  }

  fecharNovoPost() {
    this.isNovoPostModalOpen = false;
    // Limpa o formulário
    this.novoPost = {
      texto: '',
      categoria: 'Comunidade Prêmios'
    };
  }

  async publicarPost() {
    // Validação
    if (!this.novoPost.texto.trim()) {
      const toast = await this.toastController.create({
        message: 'Por favor, escreva algo no post!',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    // Criar novo post
    const novoPostObj: Post = {
      id: this.posts.length + 1,
      autor: this.userName,
      tempo: 'agora',
      texto: this.novoPost.texto,
      categoria: this.novoPost.categoria,
      imagem: '',
      curtidas: 0,
      comentarios: 0,
      curtido: false
    };

    // Adiciona no início da lista
    this.posts.unshift(novoPostObj);

    // Feedback de sucesso
    const toast = await this.toastController.create({
      message: 'Post publicado com sucesso!',
      duration: 2000,
      color: 'success',
      position: 'top',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();

    // Fecha o modal
    this.fecharNovoPost();
  }

  curtirPost(post: Post) {
    if (post.curtido) {
      // Descurtir
      post.curtidas--;
      post.curtido = false;
    } else {
      // Curtir
      post.curtidas++;
      post.curtido = true;
    }
  }
}
