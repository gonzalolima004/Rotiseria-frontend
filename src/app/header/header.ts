import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-header',
    standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  constructor(public auth: AuthService, private router: Router) {}

  goToLogin() {
    this.router.navigate(['/ingresar']);
  }

  logout() {
    this.auth.logout();
  }
}
