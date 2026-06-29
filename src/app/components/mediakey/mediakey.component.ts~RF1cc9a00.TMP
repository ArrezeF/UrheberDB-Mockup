import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mediakey',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mediakey.component.html',
  styleUrls: ['./mediakey.component.scss']
})
export class MediakeyComponent {
  step: 1 | 2 = 1;
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  emailError = false;
  passwordError = false;

  constructor(private auth: AuthService) {}

  weiter(): void {
    if (!this.email || !this.email.includes('@')) {
      this.emailError = true;
      return;
    }
    this.emailError = false;
    this.step = 2;
  }

  andereEmail(): void {
    this.step = 1;
    this.password = '';
    this.passwordError = false;
  }

  anmelden(): void {
    if (!this.password || this.password.length < 1) {
      this.passwordError = true;
      return;
    }
    this.passwordError = false;
    this.loading = true;
    setTimeout(() => {
      this.auth.loginWithMediaKey();
      this.loading = false;
    }, 800);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
