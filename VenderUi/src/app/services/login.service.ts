import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserApi } from '../Constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(UserApi.login, body).pipe(
      tap((res) => {
        const token =
          res?.data?.token ||
          res?.token ||
          res?.accessToken;

        const userEmail =
          res?.data?.email ||
          res?.email ||
          email;

        const venderCode =
          res?.data?.venderCode ||
          res?.venderCode ||
          res?.data?.code;

        const userId =
          res?.data?.userId ||
          res?.userId;

        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('email', userEmail);

          if (venderCode) {
            localStorage.setItem('venderCode', venderCode);
          }

          if (userId) {
            localStorage.setItem('userId', userId.toString());
          }
        }
      })
    );
  }

  logout(): void {
    // Get userId from localStorage
    const userId = localStorage.getItem('userId');

    if (userId) {
      // Call backend logout API to mark user offline
      this.http.post<any>(UserApi.logout, { userId: Number(userId) }).subscribe({
        next: () => {
          console.log('Logged out from server.');
        },
        error: (err) => {
          console.error('Error logging out on server', err);
        }
      });
    }

    // Clear local storage, session storage, and cookies
    localStorage.clear();
    sessionStorage.clear();

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }

    // Redirect to login page
    window.location.href = '/login';
  }

  getUserId(): number {
    return Number(localStorage.getItem('userId'));
  }

  getVenderCode(): string | null {
    return localStorage.getItem('venderCode');
  }

  SignUp(email: string, password: string, venderCode: string): Observable<any> {
    const body = { email, password, venderCode };
    return this.http.post<any>(UserApi.SignUp, body);
  }

  sendOtp(email: string, venderCode: string): Observable<any> {
    const body = { email, venderCode };
    return this.http.post<any>(UserApi.sendOtp, body);
  }

  verifyOtp(email: string, OtpCode: string): Observable<any> {
    const body = { email, OtpCode };
    return this.http.post<any>(UserApi.verifyOtp, body);
  }

  resetPassword(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(UserApi.resetPassword, body);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}