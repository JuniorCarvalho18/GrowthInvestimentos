import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { trigger, transition, style, animate } from '@angular/animations';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface Avaliacao {
  autor: string;
  nota: number;
  comentario: string;
}

interface Projeto {
  id?: number;
  nome: string;
  descricao: string;
  categoria: string;
  dataInicio?: string;
  meta?: string;
  previsao?: string;
  local?: string;
  avaliacoes?: Avaliacao[];
}

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

interface Comentario {
  id: number;
  autor: string;
  texto: string;
  data: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class HomePage implements OnInit {
  // Modais
  isModalOpen = false;
  isNotificationsModalOpen = false;
  isNovoPostModalOpen = false;
  isComentariosModalOpen = false;
  isInvestirModalOpen = false;

  // Usuário
  currentUser: User | null = null;

  // Loading states
  loadingProjetos = true;
  loadingPosts = true;

  // Projetos em Destaque
  projetosDestaque: Projeto[] = [
    {
      id: 1,
      nome: 'Fazenda Solar Comunitária',
      descricao: 'Energia limpa para 500 famílias',
      categoria: 'Sustentável',
      dataInicio: '01/12/2024',
      meta: '50.000,00',
      previsao: 'Dez/2025',
      local: 'São Paulo, SP'
    },
    {
      id: 2,
      nome: 'Reflorestamento Amazônia',
      descricao: 'Plantio de 10.000 árvores nativas',
      categoria: 'Sustentável',
      dataInicio: '15/01/2025',
      meta: '35.000,00',
      previsao: 'Out/2025',
      local: 'Amazonas, AM'
    }
  ];

  // Projetos Sustentáveis com Avaliações
  projetosSustentaveis: Projeto[] = [
    {
      id: 1,
      nome: 'Energia Solar Residencial',
      descricao: 'Painéis solares para redução de custos',
      categoria: 'Energia Renovável',
      avaliacoes: [
        { autor: 'CotistaFeliz99', nota: 5, comentario: 'O projeto tem trazido muitos retornos!' },
        { autor: 'InvestidorVerde', nota: 4, comentario: 'Ótima iniciativa sustentável!' },
        { autor: 'EcoWarrior', nota: 5, comentario: 'Impacto ambiental visível!' }
      ]
    },
    {
      id: 2,
      nome: 'Reciclagem Comunitária',
      descricao: 'Centro de reciclagem no bairro',
      categoria: 'Reciclagem',
      avaliacoes: [
        { autor: 'InvestidorVerde', nota: 4, comentario: 'Excelente iniciativa sustentável!' },
        { autor: 'ApoiadorLocal', nota: 5, comentario: 'Transformou o bairro!' }
      ]
    },
    {
      id: 3,
      nome: 'Horta Urbana Coletiva',
      descricao: 'Alimentos orgânicos para a comunidade',
      categoria: 'Reflorestamento',
      avaliacoes: [
        { autor: 'ApoiadorEco', nota: 5, comentario: 'Impacto ambiental visível!' },
        { autor: 'Sustentavel123', nota: 4, comentario: 'Produtos frescos e saudáveis!' }
      ]
    },
    {
      id: 4,
      nome: 'Tratamento de Água',
      descricao: 'Sistema de filtragem comunitário',
      categoria: 'Sustentável',
      avaliacoes: [
        { autor: 'InvesteSustentavel', nota: 4, comentario: 'Resultados consistentes!' },
        { autor: 'AguaLimpa', nota: 5, comentario: 'Água de qualidade para todos!' }
      ]
    }
  ];

  // Filtros e Paginação - Projetos
  filtroCategoria = 'todos';
  projetosFiltrados: Projeto[] = [];

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

  // Filtros e Paginação - Posts
  filtroPostCategoria = 'todos';
  postsFiltrados: Post[] = [];
  paginaAtualPosts = 1;
  itensPorPagina = 3;
  totalPaginasPosts = 1;

  // Formulário Novo Post
  novoPost = {
    texto: '',
    categoria: 'Comunidade Prêmios',
    imagem: ''
  };
  editandoPost: Post | null = null;

  // Comentários (armazenamento local por post)
  comentariosPorPost: { [postId: number]: Comentario[] } = {
    1: [
      { id: 1, autor: 'ComentaristaAtivo', texto: 'Concordo totalmente!', data: '1h' },
      { id: 2, autor: 'OutroUsuario', texto: 'Parabéns pelo post!', data: '2h' }
    ],
    2: [
      { id: 1, autor: 'FãDeEnergia', texto: 'Quanto rendeu?', data: '3h' }
    ]
  };

  comentariosAtual: Comentario[] = [];
  postSelecionadoComentarios: Post | null = null;
  novoComentario = '';

  // Investimento
  projetoSelecionado: Projeto | null = null;
  valorInvestimento: number = 0;

  constructor(
    private rota: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    // Simular carregamento
    setTimeout(() => {
      this.loadingProjetos = false;
      this.loadingPosts = false;
      this.filtrarProjetos();
      this.filtrarPosts();
    }, 800);

    // Carregar posts/comentários do localStorage
    this.carregarDadosLocais();
  }

  get userName(): string {
    return this.currentUser?.nome || 'Usuário';
  }

  // ==========================================
  // PERSISTÊNCIA LOCAL
  // ==========================================

  carregarDadosLocais() {
    const postsGuardados = localStorage.getItem('growth_posts');
    const comentariosGuardados = localStorage.getItem('growth_comentarios');

    if (postsGuardados) {
      this.posts = JSON.parse(postsGuardados);
    }

    if (comentariosGuardados) {
      this.comentariosPorPost = JSON.parse(comentariosGuardados);
    }
  }

  salvarPosts() {
    localStorage.setItem('growth_posts', JSON.stringify(this.posts));
  }

  salvarComentarios() {
    localStorage.setItem('growth_comentarios', JSON.stringify(this.comentariosPorPost));
  }

  // ==========================================
  // NAVEGAÇÃO E MODAIS BÁSICOS
  // ==========================================

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
  // PROJETOS - FILTROS E AVALIAÇÕES
  // ==========================================

  filtrarProjetos() {
    if (this.filtroCategoria === 'todos') {
      this.projetosFiltrados = [...this.projetosSustentaveis];
    } else {
      this.projetosFiltrados = this.projetosSustentaveis.filter(
        p => p.categoria === this.filtroCategoria
      );
    }
  }

  getEstrelas(nota: number): string {
    return '⭐'.repeat(nota);
  }

  async verTodasAvaliacoes(projeto: Projeto) {
    if (!projeto.avaliacoes) return;

    // Criar lista de avaliações em texto puro (sem HTML)
    let listaAvaliacoes = '';
    projeto.avaliacoes.forEach((av, index) => {
      listaAvaliacoes += `${av.autor} ${this.getEstrelas(av.nota)}\n`;
      listaAvaliacoes += `"${av.comentario}"\n`;
      if (index < projeto.avaliacoes!.length - 1) {
        listaAvaliacoes += '\n';
      }
    });

    const alert = await this.alertController.create({
      header: `Avaliações - ${projeto.nome}`,
      message: listaAvaliacoes,
      cssClass: 'avaliacoes-alert',
      buttons: ['Fechar']
    });

    await alert.present();
  }

  trackByProjetoId(index: number, projeto: Projeto): number {
    return projeto.id || index;
  }

  // ==========================================
  // SISTEMA DE POSTS COMPLETO
  // ==========================================

  filtrarPosts() {
    let postsFiltrados = [...this.posts];

    // Filtro por categoria
    if (this.filtroPostCategoria !== 'todos') {
      postsFiltrados = postsFiltrados.filter(
        p => p.categoria === this.filtroPostCategoria
      );
    }

    // Paginação
    this.totalPaginasPosts = Math.ceil(postsFiltrados.length / this.itensPorPagina);
    const inicio = (this.paginaAtualPosts - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;

    this.postsFiltrados = postsFiltrados.slice(inicio, fim);
  }

  mudarPaginaPosts(novaPagina: number) {
    this.paginaAtualPosts = novaPagina;
    this.filtrarPosts();
  }

  abrirNovoPost() {
    this.editandoPost = null;
    this.novoPost = {
      texto: '',
      categoria: 'Comunidade Prêmios',
      imagem: ''
    };
    this.isNovoPostModalOpen = true;
  }

  fecharNovoPost() {
    this.isNovoPostModalOpen = false;
    this.editandoPost = null;
    this.novoPost = {
      texto: '',
      categoria: 'Comunidade Prêmios',
      imagem: ''
    };
  }

  async publicarPost() {
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

    if (this.editandoPost) {
      // Editar post existente
      const index = this.posts.findIndex(p => p.id === this.editandoPost!.id);
      if (index !== -1) {
        this.posts[index].texto = this.novoPost.texto;
        this.posts[index].categoria = this.novoPost.categoria;
        this.posts[index].imagem = this.novoPost.imagem;
      }

      const toast = await this.toastController.create({
        message: 'Post atualizado com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'top',
        icon: 'checkmark-circle-outline'
      });
      await toast.present();
    } else {
      // Criar novo post
      const novoPostObj: Post = {
        id: this.posts.length + 1,
        autor: this.userName,
        tempo: 'agora',
        texto: this.novoPost.texto,
        categoria: this.novoPost.categoria,
        imagem: this.novoPost.imagem,
        curtidas: 0,
        comentarios: 0,
        curtido: false
      };

      this.posts.unshift(novoPostObj);

      const toast = await this.toastController.create({
        message: 'Post publicado com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'top',
        icon: 'checkmark-circle-outline'
      });
      await toast.present();
    }

    this.salvarPosts(); // PERSISTIR
    this.filtrarPosts();
    this.fecharNovoPost();
  }

  curtirPost(post: Post) {
    if (post.curtido) {
      post.curtidas--;
      post.curtido = false;
    } else {
      post.curtidas++;
      post.curtido = true;
    }
    this.salvarPosts(); // PERSISTIR
  }

  async abrirMenuPost(post: Post) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opções do Post',
      buttons: [
        {
          text: 'Editar',
          icon: 'create-outline',
          handler: () => {
            this.editarPost(post);
          }
        },
        {
          text: 'Deletar',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.deletarPost(post);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  editarPost(post: Post) {
    this.editandoPost = post;
    this.novoPost = {
      texto: post.texto,
      categoria: post.categoria,
      imagem: post.imagem || ''
    };
    this.isNovoPostModalOpen = true;
  }

  async deletarPost(post: Post) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Deseja realmente excluir este post?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            const index = this.posts.findIndex(p => p.id === post.id);
            if (index !== -1) {
              this.posts.splice(index, 1);
              this.salvarPosts(); // PERSISTIR
              this.filtrarPosts();

              const toast = await this.toastController.create({
                message: 'Post excluído com sucesso!',
                duration: 2000,
                color: 'success',
                position: 'top'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  trackByPostId(index: number, post: Post): number {
    return post.id;
  }

  async selecionarImagem() {
    try {
      const imagem = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Selecionar Imagem',
        promptLabelPhoto: 'Galeria',
        promptLabelPicture: 'Câmera'
      });

      if (imagem.dataUrl) {
        this.novoPost.imagem = imagem.dataUrl;
        await this.showToast('Imagem adicionada!', 'success');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      await this.showToast('Erro ao selecionar imagem', 'danger');
    }
  }

  // ==========================================
  // SISTEMA DE COMENTÁRIOS
  // ==========================================

  abrirComentarios(post: Post) {
    this.postSelecionadoComentarios = post;
    this.novoComentario = '';

    // Carregar comentários deste post
    this.comentariosAtual = this.comentariosPorPost[post.id] || [];

    this.isComentariosModalOpen = true;
  }

  fecharComentarios() {
    this.isComentariosModalOpen = false;
    this.postSelecionadoComentarios = null;
    this.comentariosAtual = [];
  }

  async adicionarComentario() {
    if (!this.novoComentario.trim() || !this.postSelecionadoComentarios) return;

    const postId = this.postSelecionadoComentarios.id;

    // Garantir que o array existe
    if (!this.comentariosPorPost[postId]) {
      this.comentariosPorPost[postId] = [];
    }

    const novoComent: Comentario = {
      id: this.comentariosPorPost[postId].length + 1,
      autor: this.userName,
      texto: this.novoComentario,
      data: 'agora'
    };

    this.comentariosPorPost[postId].push(novoComent);
    this.comentariosAtual = this.comentariosPorPost[postId];
    this.postSelecionadoComentarios.comentarios++;

    this.salvarComentarios(); // PERSISTIR
    this.salvarPosts(); // PERSISTIR contador

    this.novoComentario = '';

    const toast = await this.toastController.create({
      message: 'Comentário adicionado!',
      duration: 1500,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  // ==========================================
  // MODAL INVESTIR
  // ==========================================

  abrirModalInvestir(projeto: Projeto) {
    this.projetoSelecionado = projeto;
    this.valorInvestimento = 0;
    this.isInvestirModalOpen = true;
  }

  fecharModalInvestir() {
    this.isInvestirModalOpen = false;
    this.projetoSelecionado = null;
    this.valorInvestimento = 0;
  }

  calcularTokens(): number {
    return Math.floor(this.valorInvestimento * 0.1);
  }

  async confirmarInvestimento() {
    if (!this.valorInvestimento || this.valorInvestimento < 10) {
      await this.showToast('Valor mínimo de investimento: R$ 10,00', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Investimento',
      message: `Projeto: ${this.projetoSelecionado?.nome}\n\nValor: R$ ${this.valorInvestimento.toFixed(2)}\n\nTokens: ${this.calcularTokens()} tokens\n\nDeseja confirmar o investimento?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            await this.showToast('Investimento realizado com sucesso!', 'success');
            this.fecharModalInvestir();
          }
        }
      ]
    });

    await alert.present();
  }

  // ==========================================
  // UTILS
  // ==========================================

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}
