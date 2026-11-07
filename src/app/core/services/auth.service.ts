import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser } from '../models/api.models';

const TOKEN_KEY = 'hs_sri_access_token';
const REFRESH_KEY = 'hs_sri_refresh_token';
const USER_KEY = 'hs_sri_user';
const DEMO_KEY = 'hs_sri_demo_mode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly user = signal<AuthUser | null>(this.loadStoredUser());
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly isDemoMode = signal<boolean>(localStorage.getItem(DEMO_KEY) === 'true');

  readonly isAuthenticated = computed(() => !!this.token() || this.isDemoMode());
  readonly isSuperAdmin = computed(() => this.user()?.rol === 'SUPERADMIN');

  private loadStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.accessToken);
          localStorage.setItem(REFRESH_KEY, res.refreshToken);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          localStorage.removeItem(DEMO_KEY);
          this.token.set(res.accessToken);
          this.user.set(res.user);
          this.isDemoMode.set(false);
        }),
      );
  }

  enterDemoMode(): void {
    const demoUser: AuthUser = {
      id: 'demo-superadmin-01',
      email: 'arquitectura@highstack.ec',
      rol: 'SUPERADMIN',
      tenantId: 'tenant-highstack-corp',
    };
    localStorage.setItem(DEMO_KEY, 'true');
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
    this.isDemoMode.set(true);
    this.user.set(demoUser);
    this.token.set('demo-jwt-token');
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(DEMO_KEY);
    this.token.set(null);
    this.user.set(null);
    this.isDemoMode.set(false);
    void this.router.navigate(['/login']);
  }
}
