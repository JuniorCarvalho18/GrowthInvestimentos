import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { PostsService, Post, Comentario } from '../services/posts.service';
import { ImageUploadService } from '../services/image.upload.service';
import { ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProjetosService } from '../services/projetos.service';
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
  isModalOpen = false;
  isNotificationsModalOpen = false;
  isNovoPostModalOpen = false;
  isComentariosModalOpen = false;
  isInvestirModalOpen = false;
  currentUser: User | null = null;
  loadingProjetos = true;
  loadingPosts = true;

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

  filtroCategoria = 'todos';
  projetosFiltrados: Projeto[] = [];
  posts: Post[] = [];
  filtroPostCategoria = 'todos';
  postsFiltrados: Post[] = [];
  paginaAtualPosts = 1;
  itensPorPagina = 3;
  totalPaginasPosts = 1;

  novoPost = { texto: '', categoria: 'Comunidade Prêmios', imagem: '' };
  editandoPost: Post | null = null;
  comentariosAtual: Comentario[] = [];
  postSelecionadoComentarios: Post | null = null;
  novoComentario = '';
  projetoSelecionado: Projeto | null = null;
  valorInvestimento: number = 0;

  constructor(
    private rota: Router,
    private authService: AuthService,
    private postsService: PostsService,
    private projetosService: ProjetosService,
    private imageUploadService: ImageUploadService,
    private toastController: ToastController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    // Carrega projetos da API
    this.carregarProjetos();

    // Carrega posts
    this.carregarPosts();
  }

  get userName(): string { return this.currentUser?.nome || 'Usuário'; }
  get userId(): number { return this.currentUser?.id || 0; }

  async carregarProjetos() {
  this.loadingProjetos = true;

  this.projetosService.listarProjetos().subscribe({
    next: (response) => {
      if (response.success && response.projetos) {
        // Mapeia os projetos da API para o formato esperado
        this.projetosSustentaveis = response.projetos.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          descricao: p.descricao,
          categoria: p.categoria || 'Sustentável',
          dataInicio: p.data_criacao ? new Date(p.data_criacao).toLocaleDateString('pt-BR') : '',
          meta: p.meta ? p.meta.toString() : '0',
          previsao: p.previsao || '',
          local: p.local || '',
          avaliacoes: [] // Você pode adicionar avaliações depois
        }));

        // Pega os 2 primeiros para destaques
        this.projetosDestaque = this.projetosSustentaveis.slice(0, 2);
      }

      this.loadingProjetos = false;
      this.filtrarProjetos();
    },
    error: async (error) => {
      this.loadingProjetos = false;
      console.error('Erro ao carregar projetos:', error);
      await this.showToast('Erro ao carregar projetos. Usando dados de exemplo.', 'warning');

      // Em caso de erro, mantém os dados estáticos
      this.filtrarProjetos();
    }
  });
}

  async carregarPosts() {
    this.loadingPosts = true;
    this.postsService.listarPosts().subscribe({
      next: (response) => {
        if (response.success) {
          this.posts = response.posts.map((p: any) => ({ ...p, tempo: this.calcularTempo(p.data_criacao), curtido: false }));
          this.filtrarPosts();
        }
        this.loadingPosts = false;
      },
      error: async () => { this.loadingPosts = false; await this.showToast('Erro ao carregar posts', 'danger'); }
    });
  }

  calcularTempo(dataString: string): string {
    const diff = Math.floor((new Date().getTime() - new Date(dataString).getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(dataString).toLocaleDateString('pt-BR');
  }

  async publicarPost() {
    if (!this.novoPost.texto.trim()) { await this.showToast('Por favor, escreva algo no post!', 'warning'); return; }
    const postData: Post = { usuario_id: this.userId, autor: this.userName, texto: this.novoPost.texto, categoria: this.novoPost.categoria, imagem: this.novoPost.imagem, curtidas: 0, comentarios: 0 };
    if (this.editandoPost) {
      postData.id = this.editandoPost.id;
      this.postsService.editarPost(postData).subscribe({
        next: async (r) => { if (r.success) { await this.showToast('Post atualizado!', 'success'); this.carregarPosts(); this.fecharNovoPost(); } else { await this.showToast('Erro ao atualizar post', 'danger'); }},
        error: async () => { await this.showToast('Erro ao conectar ao servidor', 'danger'); }
      });
    } else {
      this.postsService.criarPost(postData).subscribe({
        next: async (r) => { if (r.success) { await this.showToast('Post publicado!', 'success'); this.carregarPosts(); this.fecharNovoPost(); } else { await this.showToast('Erro ao publicar post', 'danger'); }},
        error: async () => { await this.showToast('Erro ao conectar ao servidor', 'danger'); }
      });
    }
  }

  curtirPost(post: Post) {
    if (!post.id) return;
    this.postsService.curtirPost(post.id, this.userId).subscribe({
      next: (r) => { if (r.success) { if (r.curtido) { post.curtidas++; post.curtido = true; } else { post.curtidas--; post.curtido = false; }}},
      error: async () => { await this.showToast('Erro ao curtir post', 'danger'); }
    });
  }

  async deletarPost(post: Post) {
    if (!post.id) return;
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão', message: 'Deseja realmente excluir este post?',
      buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Excluir', role: 'destructive', handler: async () => {
        this.postsService.deletarPost(post.id!, this.userId).subscribe({
          next: async (r) => { if (r.success) { await this.showToast('Post excluído!', 'success'); this.carregarPosts(); } else { await this.showToast('Erro ao excluir post', 'danger'); }},
          error: async () => { await this.showToast('Erro ao conectar ao servidor', 'danger'); }
        });
      }}]
    });
    await alert.present();
  }

  abrirComentarios(post: Post) {
    this.postSelecionadoComentarios = post;
    this.novoComentario = '';
    if (!post.id) return;
    this.postsService.listarComentarios(post.id).subscribe({
      next: (r) => { if (r.success) { this.comentariosAtual = r.comentarios.map((c: any) => ({ ...c, data: this.calcularTempo(c.data) })); } this.isComentariosModalOpen = true; },
      error: async () => { await this.showToast('Erro ao carregar comentários', 'danger'); }
    });
  }

  async adicionarComentario() {
    if (!this.novoComentario.trim() || !this.postSelecionadoComentarios?.id) return;
    const comentario: Comentario = { post_id: this.postSelecionadoComentarios.id, usuario_id: this.userId, autor: this.userName, texto: this.novoComentario, data: new Date().toISOString() };
    this.postsService.adicionarComentario(comentario).subscribe({
      next: async (r) => { if (r.success) { this.novoComentario = ''; this.postSelecionadoComentarios!.comentarios++; await this.showToast('Comentário adicionado!', 'success');
        if (this.postSelecionadoComentarios?.id) {
          this.postsService.listarComentarios(this.postSelecionadoComentarios.id).subscribe({
            next: (res) => { if (res.success) { this.comentariosAtual = res.comentarios.map((c: any) => ({ ...c, data: this.calcularTempo(c.data) })); }}
          });
        }
      }},
      error: async () => { await this.showToast('Erro ao adicionar comentário', 'danger'); }
    });
  }

  async selecionarImagem() {
    const imagemBase64 = await this.imageUploadService.selecionarImagem();
    if (imagemBase64) { this.novoPost.imagem = imagemBase64; await this.showToast('Imagem adicionada!', 'success'); }
  }

  filtrarProjetos() {
    this.projetosFiltrados = this.filtroCategoria === 'todos' ? [...this.projetosSustentaveis] : this.projetosSustentaveis.filter(p => p.categoria === this.filtroCategoria);
  }

  filtrarPosts() {
    let postsFiltrados = this.filtroPostCategoria !== 'todos' ? this.posts.filter(p => p.categoria === this.filtroPostCategoria) : [...this.posts];
    this.totalPaginasPosts = Math.ceil(postsFiltrados.length / this.itensPorPagina);
    const inicio = (this.paginaAtualPosts - 1) * this.itensPorPagina;
    this.postsFiltrados = postsFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  mudarPaginaPosts(novaPagina: number) { this.paginaAtualPosts = novaPagina; this.filtrarPosts(); }
  getEstrelas(nota: number): string { return '⭐'.repeat(nota); }

  async verTodasAvaliacoes(projeto: Projeto) {
    if (!projeto.avaliacoes) return;
    let lista = '';
    projeto.avaliacoes.forEach((av, i) => { lista += `${av.autor} ${this.getEstrelas(av.nota)}\n"${av.comentario}"\n`; if (i < projeto.avaliacoes!.length - 1) lista += '\n'; });
    const alert = await this.alertController.create({ header: `Avaliações - ${projeto.nome}`, message: lista, cssClass: 'avaliacoes-alert', buttons: ['Fechar'] });
    await alert.present();
  }

  trackByProjetoId(index: number, projeto: Projeto): number { return projeto.id || index; }
  trackByPostId(index: number, post: Post): number { return post.id || index; }
  abrirNovoPost() { this.editandoPost = null; this.novoPost = { texto: '', categoria: 'Comunidade Prêmios', imagem: '' }; this.isNovoPostModalOpen = true; }
  fecharNovoPost() { this.isNovoPostModalOpen = false; this.editandoPost = null; this.novoPost = { texto: '', categoria: 'Comunidade Prêmios', imagem: '' }; }
  fecharComentarios() { this.isComentariosModalOpen = false; this.postSelecionadoComentarios = null; this.comentariosAtual = []; }

  async abrirMenuPost(post: Post) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opções do Post',
      buttons: [
        { text: 'Editar', icon: 'create-outline', handler: () => { this.editarPost(post); }},
        { text: 'Deletar', icon: 'trash-outline', role: 'destructive', handler: () => { this.deletarPost(post); }},
        { text: 'Cancelar', icon: 'close', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  editarPost(post: Post) { this.editandoPost = post; this.novoPost = { texto: post.texto, categoria: post.categoria, imagem: post.imagem || '' }; this.isNovoPostModalOpen = true; }
  openAddProjectModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }
  openNotificationsModal() { this.isNotificationsModalOpen = true; }
  closeNotificationsModal() { this.isNotificationsModalOpen = false; }
  abrirModalInvestir(projeto: Projeto) { this.projetoSelecionado = projeto; this.valorInvestimento = 0; this.isInvestirModalOpen = true; }
  fecharModalInvestir() { this.isInvestirModalOpen = false; this.projetoSelecionado = null; this.valorInvestimento = 0; }
  calcularTokens(): number { return Math.floor(this.valorInvestimento * 0.1); }

  async confirmarInvestimento() {
    if (!this.valorInvestimento || this.valorInvestimento < 10) { await this.showToast('Valor mínimo de investimento: R$ 10,00', 'warning'); return; }
    const alert = await this.alertController.create({
      header: 'Confirmar Investimento',
      message: `Projeto: ${this.projetoSelecionado?.nome}\n\nValor: R$ ${this.valorInvestimento.toFixed(2)}\n\nTokens: ${this.calcularTokens()} tokens\n\nDeseja confirmar o investimento?`,
      buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Confirmar', handler: async () => { await this.showToast('Investimento realizado com sucesso!', 'success'); this.fecharModalInvestir(); }}]
    });
    await alert.present();
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({ message, duration: 2500, color, position: 'top', buttons: [{ text: 'OK', role: 'cancel' }] });
    await toast.present();
  }
}
