import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AntragService } from './app/services/antrag.service';

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    // Dev-only hook for PDF generation script
    (window as any).__antragService = appRef.injector.get(AntragService);
  })
  .catch((err) => console.error(err));
