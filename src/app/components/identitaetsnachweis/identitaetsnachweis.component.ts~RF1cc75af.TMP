import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-identitaetsnachweis',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './identitaetsnachweis.component.html',
  styleUrls: ['./identitaetsnachweis.component.scss']
})
export class IdentitaetsnachweisComponent {
  activeMethod: 'none' | 'reisepass' = 'none';
  submitted = false;

  vorname = '';
  nachname = '';
  dokumentnummer = '';
  dokumentFile: File | null = null;
  fileError = false;

  constructor(private auth: AuthService, private router: Router) {}

  selectReisepass(): void {
    this.activeMethod = 'reisepass';
  }

  mitIdAustria(): void {
    // Simulate ID-Austria verification
    this.auth.markVerified();
    this.router.navigate(['/antrag/neu']);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (file && allowed.includes(file.type)) {
      this.dokumentFile = file;
      this.fileError = false;
    } else {
      this.dokumentFile = null;
      this.fileError = !!file;
    }
  }

  get formValid(): boolean {
    return (
      this.vorname.trim().length > 0 &&
      this.nachname.trim().length > 0 &&
      this.dokumentnummer.trim().length > 0 &&
      this.dokumentFile !== null
    );
  }

  bestaetigen(): void {
    this.submitted = true;
    if (!this.formValid) return;
    this.auth.markVerified();
    this.router.navigate(['/antrag/neu']);
  }

  abbrechen(): void {
    this.router.navigate(['/dashboard']);
  }
}
