import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'folder/inbox',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'cadastro',
    loadChildren: () => import('./cadastro/cadastro.module').then(m => m.CadastroPageModule)
  },
  // 🔒 ROTAS PROTEGIDAS - Requerem login
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'saldo',
    loadChildren: () => import('./saldo/saldo.module').then( m => m.SaldoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'historico',
    loadChildren: () => import('./historico/historico.module').then( m => m.HistoricoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'configaracao',
    loadChildren: () => import('./configaracao/configaracao.module').then( m => m.ConfigaracaoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'marketplace',
    loadChildren: () => import('./marketplace/marketplace.module').then( m => m.MarketplacePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'projetos',
    loadChildren: () => import('./projetos/projetos.module').then( m => m.ProjetosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'addproj',
    loadChildren: () => import('./addproj/addproj.module').then( m => m.AddprojPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'investir',
    loadChildren: () => import('./investir/investir.module').then( m => m.InvestirPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'dev',
    loadChildren: () => import('./dev/dev.module').then( m => m.DevPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./usuarios/usuarios.module').then( m => m.UsuariosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'notificacoes',
    loadChildren: () => import('./notificacoes/notificacoes.module').then( m => m.NotificacoesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'verificacao',
    loadChildren: () => import('./verificacao/verificacao.module').then( m => m.VerificacaoPageModule)
  },
  {
    path: 'gerenciar-posts',
    loadChildren: () => import('./gerenciar-posts/gerenciar-posts.module').then( m => m.GerenciarPostsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gerenciar-comentarios',
    loadChildren: () => import('./gerenciar-comentarios/gerenciar-comentarios.module').then( m => m.GerenciarComentariosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gerenciar-avaliacoes',
    loadChildren: () => import('./gerenciar-avaliacoes/gerenciar-avaliacoes.module').then( m => m.GerenciarAvaliacoesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gerenciar-posts',
    loadChildren: () => import('./gerenciar-posts/gerenciar-posts.module').then( m => m.GerenciarPostsPageModule)
  },
  {
    path: 'gerenciar-comentarios',
    loadChildren: () => import('./gerenciar-comentarios/gerenciar-comentarios.module').then( m => m.GerenciarComentariosPageModule)
  },
  {
    path: 'gerenciar-avaliacoes',
    loadChildren: () => import('./gerenciar-avaliacoes/gerenciar-avaliacoes.module').then( m => m.GerenciarAvaliacoesPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
