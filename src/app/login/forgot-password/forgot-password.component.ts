import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  cargando = false;

    constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  volver() {
  this.router.navigate(['/ingresar']);
  }


  enviar() {
  if (!this.email) {
    Swal.fire('Atención', 'Por favor, ingresa tu correo electrónico.', 'warning');
    return;
  }

  this.cargando = true;
  this.http.post('http://localhost:8000/api/forgot-password', { email: this.email }).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        text: 'Te enviamos un correo con el enlace para restablecer tu contraseña.',
        confirmButtonText: 'Ir al inicio de sesión',
        confirmButtonColor: '#CAA021'
      }).then(() => {
        this.router.navigate(['/ingresar']);
      });
      this.email = '';
    },
    error: err => {
      if (err.status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'Correo no encontrado',
          text: 'No existe ningún usuario con ese email.',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#CAA021'
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire('Error', err.error?.message || 'No se pudo enviar el correo.', 'error');
      }
    },
    complete: () => this.cargando = false
  });
}

}
