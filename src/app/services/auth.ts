import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  public isLoggedIn = signal<boolean>(false);

  constructor(
    private http: HttpClient,
     private router: Router, // ✅ NUEVO
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // ✅ Verificamos si estamos en navegador antes de acceder a localStorage
    if (isPlatformBrowser(this.platformId)) {
      const hasToken = !!localStorage.getItem('token');
      this.isLoggedIn.set(hasToken);
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          const raw =
            (res as any)?.access_token ??
            (res as any)?.token ??
            (res as any)?.accessToken ??
            (res as any)?.data?.access_token;

          if (raw && isPlatformBrowser(this.platformId)) {
            const token = String(raw)
              .replace(/^\"|\"$/g, '')
              .replace(/^Bearer\s+/i, '')
              .trim();
            localStorage.setItem('token', token);
            this.isLoggedIn.set(true);
          }
        })
      );
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  public isLogged(): boolean {
    return this.isLoggedIn();
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.isLoggedIn.set(false);

    this.router.navigate(['/']);
  }
}
