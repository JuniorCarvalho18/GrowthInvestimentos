import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GerenciarComentariosPageRoutingModule } from './gerenciar-comentarios-routing.module';

import { GerenciarComentariosPage } from './gerenciar-comentarios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GerenciarComentariosPageRoutingModule
  ],
  declarations: [GerenciarComentariosPage]
})
export class GerenciarComentariosPageModule {}
