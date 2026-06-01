import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AntragService } from './antrag.service';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  department: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_KEY = 'urheberdb_user';

  constructor(private router: Router, private antragService: AntragService) {}

  // Reaktive Signals
  readonly isVerified = signal<boolean>(false);
  readonly currentUser = signal<AuthUser | null>(null);
  readonly identityPending = signal<boolean>(false);

  get isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  markVerified(): void {
    this.isVerified.set(true);
    this.identityPending.set(false);
    this.antragService.clearPersonType();
  }

  submitPassportVerification(): void {
    this.identityPending.set(true);
  }

  /** Simulates a MediaKey login (replace with real SSO redirect in production) */
  loginWithMediaKey(): void {
    const mockUser: AuthUser = {
      id: 'mk-12345',
      name: 'Max Mustermann',
      email: 'max.mustermann@orf.at',
      department: 'Urheberrecht'
    };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(mockUser));
    this.currentUser.set(mockUser);
    this.isVerified.set(false);
    this.antragService.clearPersonType();
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentUser.set(null);
    this.isVerified.set(false);
    this.identityPending.set(false);
    this.antragService.clearPersonType();
    this.router.navigate(['/welcome']);
  }
}
