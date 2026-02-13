import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { AddprojPageModule } from '../addproj/addproj.module';
import { NotificacoesPageModule } from '../notificacoes/notificacoes.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    AddprojPageModule,
    NotificacoesPageModule,
    // BrowserAnimationsModule já está no app.module.ts
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
