import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AuthData } from '../models/auth-data.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly token: WritableSignal<string | null> = signal(null);

  private tokenTimeout: NodeJS.Timeout | null = null;

  getToken(): string | null {
    return this.token();
  }

  setToken(value: string | null): void {
    this.token.set(value);
  }

  isLoggedIn(): Signal<boolean> {
    return computed(() => !!this.token());
  }

  createUser(authData: AuthData): Observable<string> {
    return this.http
      .post<{ message: string; result: AuthData }>(
        'http://localhost:3000/api/user/signup/',
        authData
      )
      .pipe(map((res) => res.message));
  }

  login(authData: AuthData): Observable<string> {
    return this.http
      .post<{ token: string, expiresIn: number }>(
        'http://localhost:3000/api/user/login/',
        authData
      )
      .pipe(
        tap((a) => console.log(a)),
        tap((res) => {
          this.setAuthTimer(res.expiresIn * 1000);
          const expirationDate = new Date();
          expirationDate.setSeconds(
            expirationDate.getSeconds() + (res.expiresIn)
          );
          this.saveAuthData(res.token, expirationDate);
        }),
        map((res) => res.token),
        tap((token) => {
          this.setToken(token);
          this.router.navigate(['/']);
        })
      );
  }

  autoAuthUser(): void {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    if (authInformation.expirationDate > now) {
      this.setToken(authInformation.token);
      this.setAuthTimer(authInformation.expirationDate.getTime() - now.getTime());
    }
  }

  logOut(): void {
    this.setToken(null);
    clearTimeout(this.tokenTimeout!);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private getTokenDuration(expirationDate: Date): number {
    const now = new Date();
    return expirationDate.getTime() - now.getTime();
  }

  private setAuthTimer(duration: number): void {
    console.log('Setting timer: ' + duration);
    this.tokenTimeout = setTimeout(() => {
      this.logOut();
    }, duration);
  }

  private saveAuthData(token: string, expirationDate: Date): void {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData(): { token: string; expirationDate: Date } | null {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    if (!token || !expirationDate) {
      return null;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
    };
  }
}
