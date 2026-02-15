import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configuracao',
  templateUrl: './configuracao.page.html',
  styleUrls: ['./configuracao.page.scss'],
  standalone: false,
})
export class ConfiguracaoPage implements OnInit {

  constructor(private rota: Router) { }

  ngOnInit() {
  }

  goToProfile() {
    this.rota.navigate(['/profile']);
  }
}
