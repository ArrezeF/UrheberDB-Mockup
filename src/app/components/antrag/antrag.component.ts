import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { StepsModule } from 'primeng/steps';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { AntragService } from '../../services/antrag.service';
import { AuthService } from '../../services/auth.service';

export type PersonType = 'natuerlich' | 'juristisch' | null;

// Simulierte Datenbank für Honorarnummern
const MOCK_PERSONAL: Record<string, { vorname: string; nachname: string; strasse: string; plz: string; ort: string; land: string }> = {
  'H12345': { vorname: 'Max', nachname: 'Mustermann', strasse: 'Musterstraße 1', plz: '1010', ort: 'Wien', land: 'AT' },
  'H99999': { vorname: 'Anna', nachname: 'Beispiel', strasse: 'Ringstraße 5', plz: '8010', ort: 'Graz', land: 'AT' },
};

@Component({
  selector: 'app-antrag',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    ButtonModule, InputTextModule, DropdownModule, CalendarModule,
    StepsModule, DividerModule, MessageModule
  ],
  templateUrl: './antrag.component.html',
  styleUrls: ['./antrag.component.scss']
})
export class AntragComponent {
  step = 1;
  selectedType: PersonType = null;

  // Honorarnummer-State (nur für natürliche Person)
  personalnummer = '';
  personalnummerStatus: 'idle' | 'searching' | 'found' | 'not-found' | 'skipped' = 'idle';
  personalnummerError = false;

  natForm: FormGroup;
  jurForm: FormGroup;

  // Juristische Person – Datei-Uploads
  firmenbuchFile: File | null = null;
  vollmachtFile: File | null = null;
  jurSubmitted = false;

  laender = [
    { label: 'Österreich', value: 'AT' },
    { label: 'Deutschland', value: 'DE' },
    { label: 'Schweiz', value: 'CH' },
    { label: 'Sonstige', value: 'XX' }
  ];

  constructor(private fb: FormBuilder, private router: Router, private antragService: AntragService, public auth: AuthService) {
    this.natForm = this.fb.group({
      vorname: ['Max', Validators.required],
      nachname: ['Mustermann', Validators.required],
      email: ['max.mustermann@gmail.com', [Validators.required, Validators.email]],
      strasse: ['', Validators.required],
      plz: ['', [Validators.required, Validators.pattern(/^\d{4,5}$/)]],
      ort: ['', Validators.required],
      land: ['AT', Validators.required],
      telefon: ['', Validators.required]
    });

    this.jurForm = this.fb.group({
      firmenname: ['', Validators.required],
      email: ['max.mustermann@gmail.com', [Validators.required, Validators.email]],
      telefon: ['', Validators.required]
    });
  }

  get showAdressfelder(): boolean {
    return this.personalnummerStatus === 'not-found' || this.personalnummerStatus === 'skipped';
  }

  get personFound(): boolean {
    return this.personalnummerStatus === 'found';
  }

  mitIdAustria(): void {
    this.auth.markVerified();
  }

  selectType(type: PersonType): void {
    this.selectedType = type;
    // Reset Personalnummer-State beim Wechsel
    this.resetPersonalnummer();
  }

  resetPersonalnummer(): void {
    this.personalnummer = '';
    this.personalnummerStatus = 'idle';
    this.personalnummerError = false;
    // Validators wiederherstellen
    this.natForm.get('strasse')?.setValidators([Validators.required]);
    this.natForm.get('plz')?.setValidators([Validators.required, Validators.pattern(/^\d{4,5}$/)]);
    this.natForm.get('ort')?.setValidators([Validators.required]);
    this.natForm.get('land')?.setValidators([Validators.required]);
    this.natForm.get('telefon')?.setValidators([Validators.required]);
    this.natForm.reset({ land: 'AT', telefon: '', vorname: 'Max', nachname: 'Mustermann', email: 'max.mustermann@gmail.com' });
  }

  suchePersonalnummer(): void {
    if (!this.personalnummer.trim()) {
      this.personalnummerError = true;
      return;
    }
    this.personalnummerError = false;
    this.personalnummerStatus = 'searching';

    // Simulierter API-Call
    setTimeout(() => {
      const found = MOCK_PERSONAL[this.personalnummer.trim().toUpperCase()];
      if (found) {
        this.personalnummerStatus = 'found';
        this.natForm.patchValue({
          strasse: found.strasse,
          plz: found.plz,
          ort: found.ort,
          land: found.land
        });
        // Adresse + Telefon nicht erforderlich wenn Honorarnummer gefunden
        ['strasse', 'plz', 'ort', 'land', 'telefon'].forEach(f => {
          this.natForm.get(f)?.clearValidators();
          this.natForm.get(f)?.updateValueAndValidity();
        });
      } else {
        this.personalnummerStatus = 'not-found';
      }
    }, 800);
  }

  ohnePersonalnummer(): void {
    this.personalnummerStatus = 'skipped';
    this.personalnummer = '';
    this.natForm.reset({ land: 'AT', vorname: 'Max', nachname: 'Mustermann', email: 'max.mustermann@gmail.com' });
  }

  onFirmenbuchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.firmenbuchFile = input.files?.[0] ?? null;
  }

  onVollmachtChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.vollmachtFile = input.files?.[0] ?? null;
  }

  weiter(): void {
    if (this.step === 1 && this.selectedType) {
      this.step = 2;
    } else if (this.step === 2) {
      if (this.selectedType === 'natuerlich') {
        if (this.natForm.valid) {
          this.step = 3;
        } else {
          this.natForm.markAllAsTouched();
        }
      } else {
        this.jurSubmitted = true;
        if (this.jurForm.valid && this.firmenbuchFile && this.vollmachtFile) {
          this.step = 3;
        } else {
          this.jurForm.markAllAsTouched();
        }
      }
    }
  }

  zurueck(): void {
    if (this.step === 2) {
      this.resetPersonalnummer();
    }
    if (this.step > 1) {
      this.step--;
    }
  }

  submitAntrag(): void {
    const personenart = this.selectedType === 'natuerlich' ? 'Natürliche Person' : 'Juristische Person';
    const name = this.selectedType === 'natuerlich'
      ? `${this.natForm.value.strasse}, ${this.natForm.value.plz} ${this.natForm.value.ort}`
      : this.jurForm.value.firmenname;
    this.antragService.submitAntrag(personenart, name);
    this.router.navigate(['/dashboard']);
  }

  get currentForm(): FormGroup {
    return this.selectedType === 'natuerlich' ? this.natForm : this.jurForm;
  }

  isInvalid(controlName: string): boolean {
    const ctrl = this.currentForm.get(controlName);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }
}

