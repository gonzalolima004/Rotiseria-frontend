import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  token = '';
  password = '';
  confirmPassword = '';
  cargando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.email || !this.token) {
      Swal.fire('Error', 'El enlace no es válido.', 'error');
      this.router.navigate(['/forgot-password']);
    }
  }

  reset() {
    if (!this.password || !this.confirmPassword) {
      Swal.fire('Atención', 'Completá ambos campos.', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    this.cargando = true;
    this.http.post('http://localhost:8000/api/reset-password', {
      email: this.email,
      token: this.token,
      password: this.password,
      password_confirmation: this.confirmPassword
    }).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Tu contraseña fue restablecida correctamente.', 'success');
        this.router.navigate(['/ingresar']);
      },
      error: err => {
        Swal.fire('Error', err.error?.message || 'No se pudo restablecer la contraseña.', 'error');
      },
      complete: () => this.cargando = false
    });
  }
}
