import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GerenciarAvaliacoesPageRoutingModule } from './gerenciar-avaliacoes-routing.module';

import { GerenciarAvaliacoesPage } from './gerenciar-avaliacoes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GerenciarAvaliacoesPageRoutingModule
  ],
  declarations: [GerenciarAvaliacoesPage]
})
export class GerenciarAvaliacoesPageModule {}
