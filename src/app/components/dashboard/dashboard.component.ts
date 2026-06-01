import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { AuthService } from '../../services/auth.service';
import { AntragService } from '../../services/antrag.service';

export interface Produktion {
  id: string; titel: string; sender: string;
  datum: string; uhrzeit: string; dauer: string; jahr: number;
}
export interface OnlineProduktion {
  id: string; titel: string; plattform: string; programmname: string;
  startDatum: string; endDatum: string; episode: string; jahr: number;
}
export interface RadioProduktion {
  id: string; titel: string; sender: string;
  datum: string; uhrzeit: string; dauer: string; jahr: number;
}
export interface KombinierteGruppe {
  titel: string;
  tv: Produktion[];
  online: OnlineProduktion[];
  radio: RadioProduktion[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, TableModule, TagModule, InputTextModule, DropdownModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(public auth: AuthService, public antragService: AntragService) {}

  mitIdAustria(): void { this.auth.markVerified(); }

  suchbegriff = '';
  selectedJahr: number | null = null;
  jahreOptionen = [
    { label: 'Alle Jahre', value: null },
    { label: '2024', value: 2024 },
    { label: '2023', value: 2023 },
    { label: '2022', value: 2022 },
  ];

  tvProduktionen: Produktion[] = [
    { id: 'TV-001', titel: 'Mein Werk - Dokumentation', sender: 'ORF 1', datum: '15.01.2024', uhrzeit: '20:15', dauer: '45 min', jahr: 2024 },
    { id: 'TV-002', titel: 'Mein Werk - Dokumentation', sender: 'ORF 2', datum: '22.01.2024', uhrzeit: '22:00', dauer: '45 min', jahr: 2024 },
    { id: 'TV-003', titel: 'Kurzfilm Compilation', sender: 'ORF 1', datum: '03.02.2024', uhrzeit: '23:30', dauer: '12 min', jahr: 2024 },
    { id: 'TV-004', titel: 'Musiksendung Spezial', sender: 'ORF 2', datum: '14.03.2024', uhrzeit: '21:05', dauer: '60 min', jahr: 2024 },
    { id: 'TV-005', titel: 'Mein Werk - Wiederholung', sender: 'ORF III', datum: '01.04.2024', uhrzeit: '15:00', dauer: '45 min', jahr: 2024 },
    { id: 'TV-006', titel: 'Mein Werk - Dokumentation', sender: 'ORF 1', datum: '10.06.2023', uhrzeit: '21:00', dauer: '45 min', jahr: 2023 },
    { id: 'TV-007', titel: 'Kurzfilm Compilation', sender: 'ORF 2', datum: '15.09.2023', uhrzeit: '23:00', dauer: '12 min', jahr: 2023 },
  ];

  onlineProduktionen: OnlineProduktion[] = [
    { id: 'ON-001', titel: 'Mein Werk - Dokumentation', plattform: 'ORF ON', programmname: 'ORF 1', startDatum: '15.01.2024', endDatum: '15.04.2024', episode: 'Folge 1', jahr: 2024 },
    { id: 'ON-002', titel: 'Mein Werk - Dokumentation', plattform: 'ORF ON', programmname: 'ORF 2', startDatum: '20.01.2024', endDatum: '20.04.2024', episode: 'Folge 2', jahr: 2024 },
    { id: 'ON-003', titel: 'Kurzfilm Compilation', plattform: 'ORF ON', programmname: 'ORF 1', startDatum: '03.02.2024', endDatum: '03.05.2024', episode: 'Folge 1', jahr: 2024 },
    { id: 'ON-004', titel: 'Musiksendung Spezial', plattform: 'ORF ON', programmname: '3sat', startDatum: '14.03.2024', endDatum: '14.06.2024', episode: 'Folge 1', jahr: 2024 },
    { id: 'ON-005', titel: 'Mein Werk - Dokumentation', plattform: 'ORF ON', programmname: 'ORF 3', startDatum: '10.06.2023', endDatum: '10.09.2023', episode: 'Folge 1', jahr: 2023 },
  ];

  radioProduktionen: RadioProduktion[] = [
    { id: 'RD-001', titel: 'Musikbeitrag - O3', sender: 'O3', datum: '10.01.2024', uhrzeit: '08:15', dauer: '3 min 20 sek', jahr: 2024 },
    { id: 'RD-002', titel: 'Feature - O1', sender: 'O1', datum: '25.01.2024', uhrzeit: '14:00', dauer: '25 min', jahr: 2024 },
    { id: 'RD-003', titel: 'Musikbeitrag - O3', sender: 'O3', datum: '12.02.2024', uhrzeit: '17:45', dauer: '3 min 20 sek', jahr: 2024 },
    { id: 'RD-004', titel: 'Kulturjournal', sender: 'O1', datum: '05.03.2024', uhrzeit: '07:05', dauer: '15 min', jahr: 2024 },
    { id: 'RD-005', titel: 'Musikbeitrag - FM4', sender: 'FM4', datum: '18.03.2024', uhrzeit: '20:00', dauer: '4 min 10 sek', jahr: 2024 },
    { id: 'RD-006', titel: 'Musikbeitrag - O3', sender: 'O3', datum: '22.05.2023', uhrzeit: '09:30', dauer: '3 min 20 sek', jahr: 2023 },
  ];

  private filterTv(list: Produktion[]): Produktion[] {
    return list.filter(p =>
      (!this.selectedJahr || p.jahr === this.selectedJahr) &&
      (!this.suchbegriff || p.titel.toLowerCase().includes(this.suchbegriff.toLowerCase()))
    );
  }
  private filterOnline(list: OnlineProduktion[]): OnlineProduktion[] {
    return list.filter(p =>
      (!this.selectedJahr || p.jahr === this.selectedJahr) &&
      (!this.suchbegriff || p.titel.toLowerCase().includes(this.suchbegriff.toLowerCase()))
    );
  }
  private filterRadio(list: RadioProduktion[]): RadioProduktion[] {
    return list.filter(p =>
      (!this.selectedJahr || p.jahr === this.selectedJahr) &&
      (!this.suchbegriff || p.titel.toLowerCase().includes(this.suchbegriff.toLowerCase()))
    );
  }

  get kombinierteGruppen(): KombinierteGruppe[] {
    const map = new Map<string, KombinierteGruppe>();
    const ensure = (titel: string) => {
      if (!map.has(titel)) map.set(titel, { titel, tv: [], online: [], radio: [] });
      return map.get(titel)!;
    };
    for (const p of this.filterTv(this.tvProduktionen)) ensure(p.titel).tv.push(p);
    for (const p of this.filterOnline(this.onlineProduktionen)) ensure(p.titel).online.push(p);
    for (const p of this.filterRadio(this.radioProduktionen)) ensure(p.titel).radio.push(p);
    return Array.from(map.values());
  }

  expandedKombiniert = new Map<string, Set<'tv' | 'online' | 'radio'>>();

  toggleMedium(titel: string, medium: 'tv' | 'online' | 'radio'): void {
    if (!this.expandedKombiniert.has(titel)) this.expandedKombiniert.set(titel, new Set());
    const set = this.expandedKombiniert.get(titel)!;
    set.has(medium) ? set.delete(medium) : set.add(medium);
    this.expandedKombiniert = new Map(this.expandedKombiniert);
  }

  isMediumExpanded(titel: string, medium: 'tv' | 'online' | 'radio'): boolean {
    return this.expandedKombiniert.get(titel)?.has(medium) ?? false;
  }

  get jurAntraegeOptionen(): { label: string; value: string }[] {
    return this.antragService.getJurAntraege().map(a => ({
      label: `${a.id} – ${a.name}`,
      value: a.id
    }));
  }
}