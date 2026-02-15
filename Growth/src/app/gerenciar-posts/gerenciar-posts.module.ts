import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GerenciarPostsPageRoutingModule } from './gerenciar-posts-routing.module';

import { GerenciarPostsPage } from './gerenciar-posts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GerenciarPostsPageRoutingModule
  ],
  declarations: [GerenciarPostsPage]
})
export class GerenciarPostsPageModule {}
