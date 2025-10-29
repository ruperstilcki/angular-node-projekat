import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AuthData, AuthDataResponse, AuthServiceDataModel } from '../models/auth-data.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly token: WritableSignal<string | null> = signal(null);
  private readonly userId: WritableSignal<string | null> = signal(null);

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
      .post<{ message: string; result: AuthData }>('http://localhost:3000/api/user/signup/', authData)
      .pipe(map(res => res.message));
  }

  getUserId() {
    return this.userId();
  }

  setUserId(id: string | null): void {
    this.userId.set(id);
  }

  login(authData: AuthData): Observable<string> {
    return this.http.post<AuthDataResponse>('http://localhost:3000/api/user/login/', authData).pipe(
      tap((res: AuthDataResponse) => {
        this.setAuthTimer(res.expiresIn * 1000);
        const expirationDate = new Date();
        expirationDate.setSeconds(expirationDate.getSeconds() + res.expiresIn);
        this.setToken(res.token);
        this.saveAuthData(res.token, expirationDate, res.userId);
        this.setUserId(res.userId);
        this.router.navigate(['/']);
      }),
      map(res => res.token)
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
      this.setUserId(authInformation.userId);
    }
  }

  logOut(): void {
    this.setToken(null);
    clearTimeout(this.tokenTimeout!);
    this.setUserId(null);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private getTokenDuration(expirationDate: Date): number {
    const now = new Date();
    return expirationDate.getTime() - now.getTime();
  }

  private setAuthTimer(duration: number): void {
    this.tokenTimeout = setTimeout(() => {
      this.logOut();
    }, duration);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData(): AuthServiceDataModel | null {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate || !userId) {
      return null;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    };
  }
}
