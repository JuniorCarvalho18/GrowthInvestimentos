import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GerenciarPostsPage } from './gerenciar-posts.page';

const routes: Routes = [
  {
    path: '',
    component: GerenciarPostsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GerenciarPostsPageRoutingModule {}
