import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  irAForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  async onSubmit() {
    const email = this.emailInput?.nativeElement.value?.trim();
    const password = this.passwordInput?.nativeElement.value?.trim();

    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos antes de continuar.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.auth.login(email, password).subscribe({
      next: async () => {
        this.loading = false;
        this.cdr.markForCheck();

        this.router.navigate(['/productos-y-categorias']);
      },
      error: async (error) => {
        this.loading = false;

        let message = 'Error inesperado. Inténtelo de nuevo.';
        let icon: 'error' | 'warning' = 'error';

        if (error.status === 401) {
          message = 'Credenciales incorrectas. Verifique su email y contraseña.';
        } else if (error.status === 0) {
          message = 'Error de conexión. Verifique su conexión a internet.';
        } else if (error.status >= 500) {
          message = 'Error del servidor. Inténtelo más tarde.';
        }

        await Swal.fire({
          icon,
          title: 'Error al iniciar sesión',
          text: message,
          confirmButtonColor: '#d33',
        });

        this.cdr.markForCheck();
        console.error('Login error:', error);
      },
    });
  }
}
