import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GerenciarAvaliacoesPage } from './gerenciar-avaliacoes.page';

const routes: Routes = [
  {
    path: '',
    component: GerenciarAvaliacoesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GerenciarAvaliacoesPageRoutingModule {}
