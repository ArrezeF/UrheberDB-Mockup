import { Injectable } from '@angular/core';

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
    return entry;
  }

  getAntraege(): AntragEintrag[] {
    return [...this.antraege];
  }
}
