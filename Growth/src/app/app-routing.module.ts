import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

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
    path: 'configuracao',
    loadChildren: () => import('./configuracao/configuracao.module').then( m => m.ConfiguracaoPageModule),
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
    path: 'investir',
    loadChildren: () => import('./investir/investir.module').then( m => m.InvestirPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'notificacoes',
    loadChildren: () => import('./notificacoes/notificacoes.module').then( m => m.NotificacoesPageModule),
    canActivate: [AuthGuard]
  },

  {
    path: 'dev',
    loadChildren: () => import('./dev/dev.module').then( m => m.DevPageModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'addproj',
    loadChildren: () => import('./addproj/addproj.module').then( m => m.AddprojPageModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./usuarios/usuarios.module').then( m => m.UsuariosPageModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'gerenciar-posts',
    loadChildren: () => import('./gerenciar-posts/gerenciar-posts.module').then( m => m.GerenciarPostsPageModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'gerenciar-comentarios',
    loadChildren: () => import('./gerenciar-comentarios/gerenciar-comentarios.module').then( m => m.GerenciarComentariosPageModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'gerenciar-avaliacoes',
    loadChildren: () => import('./gerenciar-avaliacoes/gerenciar-avaliacoes.module').then( m => m.GerenciarAvaliacoesPageModule),
    canActivate: [AuthGuard, AdminGuard]
  },

  {
    path: 'verificacao',
    loadChildren: () => import('./verificacao/verificacao.module').then( m => m.VerificacaoPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
