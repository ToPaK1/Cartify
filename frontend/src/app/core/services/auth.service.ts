import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = 'http://localhost:3000/api';
  readonly user = signal<User | null>(this.readUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, { email, password }).pipe(
      tap((response) => {
        if (response.token && response.user) {
          localStorage.setItem('cartify_token', response.token);
          localStorage.setItem('cartify_user', JSON.stringify(response.user));
          this.user.set(response.user);
        }
      })
    );
  }

  signup(data: { name: string; email: string; phone: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/signup`, data);
  }

  me(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.api}/auth/me`).pipe(
      tap((response) => {
        if (response.user) {
          localStorage.setItem('cartify_user', JSON.stringify(response.user));
          this.user.set(response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('cartify_token');
    localStorage.removeItem('cartify_user');
    this.user.set(null);
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('cartify_token');
  }

  private readUser(): User | null {
    try {
      const value = localStorage.getItem('cartify_user');
      return value ? JSON.parse(value) as User : null;
    } catch {
      return null;
    }
  }
}
