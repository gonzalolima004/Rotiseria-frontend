import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgIf } from '@angular/common'; // 👈 Importar NgIf
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, NgIf], // 👈 Agregar NgIf aquí
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  loading = false;
  error: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  login(form: NgForm) {
    form.form.markAllAsTouched();

    if (!form.valid) {
      this.error = 'Por favor, completa todos los campos correctamente.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    const { email, password } = form.value;

    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 401) {
          this.error = 'Credenciales incorrectas. Verifique su email y contraseña.';
        } else if (error.status === 0) {
          this.error = 'Error de conexión. Verifique su conexión a internet.';
        } else if (error.status >= 500) {
          this.error = 'Error del servidor. Inténtelo más tarde.';
        } else {
          this.error = 'Error inesperado. Inténtelo de nuevo.';
        }

        this.cdr.markForCheck();
        console.error('Login error:', error);
      },
    });
  }

  clearError() {
    this.error = null;
    this.cdr.markForCheck();
  }
}
