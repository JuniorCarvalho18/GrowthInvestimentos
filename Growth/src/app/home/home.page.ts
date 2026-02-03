import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  isModalOpen = false;
  isNotificationsModalOpen = false;
  currentUser: User | null = null;

  constructor(
    private rota: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscreve para mudanças no usuário
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  get userName(): string {
    return this.currentUser?.nome || 'Usuário';
  }

  openAddProjectModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openNotificationsModal() {
    this.isNotificationsModalOpen = true;
  }

  closeNotificationsModal() {
    this.isNotificationsModalOpen = false;
  }
}
