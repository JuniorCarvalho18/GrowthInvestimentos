import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.page.html',
  styleUrls: ['./marketplace.page.scss'],
  standalone: false,
})
export class MarketplacePage implements AfterViewInit {
  // Pega a referência da div #carousel do HTML
  @ViewChild('carousel') carousel!: ElementRef;

  isNotificationsModalOpen = false;
  showShadow = true; // Controla se a sombra aparece ou não

  constructor(private rota: Router) {}

  // Executado quando a tela termina de carregar os elementos visuais
  ngAfterViewInit() {
    // Faz uma verificação inicial (caso a lista seja pequena e não precise de scroll)
    this.checkScroll();
  }

  // Lógica da Sombra (Chamada pelo evento (scroll) no HTML)
  checkScroll() {
    if (!this.carousel) return;

    const el = this.carousel.nativeElement;

    // Calcula se chegou no fim da rolagem horizontal
    // scrollLeft: quanto já rolou
    // offsetWidth: largura visível na tela
    // scrollWidth: largura total do conteúdo
    // -10: pequena tolerância para garantir que funcione em qualquer tela
    const isEnd = el.scrollLeft + el.offsetWidth >= el.scrollWidth - 10;

    // Se chegou no fim, esconde a sombra (!true = false). Se não, mostra.
    this.showShadow = !isEnd;
  }

  openNotificationsModal() {
    this.isNotificationsModalOpen = true;
  }

  closeNotificationsModal() {
    this.isNotificationsModalOpen = false;
  }
}
