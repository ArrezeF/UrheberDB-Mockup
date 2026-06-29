import { Injectable, signal } from '@angular/core';

export interface AntragEintrag {
  id: string;
  personenart: 'Natürliche Person' | 'Juristische Person';
  eingereichtAm: string;
  status: 'In Bearbeitung';
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AntragService {
  private antraege: AntragEintrag[] = [];
  private counter = 1;

  // Reaktive Signals – Angular erkennt Änderungen sofort
  readonly activePersonType = signal<'natuerlich' | 'juristisch' | null>(null);
  readonly selectedAntragId = signal<string | null>(null);

  clearPersonType(): void {
    this.activePersonType.set(null);
    this.selectedAntragId.set(null);
  }

  submitAntrag(personenart: 'Natürliche Person' | 'Juristische Person', name: string): AntragEintrag {
    const now = new Date();
    const datum = now.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const entry: AntragEintrag = {
      id: `ANT-${now.getFullYear()}-${String(this.counter++).padStart(3, '0')}`,
      personenart,
      eingereichtAm: datum,
      status: 'In Bearbeitung',
      name
    };
    this.antraege.push(entry);
    const type = personenart === 'Natürliche Person' ? 'natuerlich' : 'juristisch';
    this.activePersonType.set(type);
    this.selectedAntragId.set(entry.id);
    return entry;
  }

  getAntraege(): AntragEintrag[] {
    return [...this.antraege];
  }

  getJurAntraege(): AntragEintrag[] {
    return this.antraege.filter(a => a.personenart === 'Juristische Person');
  }

  getSelectedAntrag(): AntragEintrag | null {
    return this.antraege.find(a => a.id === this.selectedAntragId()) ?? null;
  }
}
