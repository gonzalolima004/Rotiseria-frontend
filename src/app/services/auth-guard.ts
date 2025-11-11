import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
    // Solo ejecutamos en navegador
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');

      if (token && token.trim() !== '') {
        return true; // ✅ acceso permitido
      }
    }

    // ❌ No hay token → redirigir al login
    this.router.navigate(['/ingresar']);
    return false;
  }
}
