import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GerenciarComentariosPage } from './gerenciar-comentarios.page';

const routes: Routes = [
  {
    path: '',
    component: GerenciarComentariosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GerenciarComentariosPageRoutingModule {}
