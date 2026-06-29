import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { MediakeyComponent } from './components/mediakey/mediakey.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AntragComponent } from './components/antrag/antrag.component';
import { AntraeegeComponent } from './components/antraege/antraege.component';
import { IdentitaetsnachweisComponent } from './components/identitaetsnachweis/identitaetsnachweis.component';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'mediakey', component: MediakeyComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'antraege', component: AntraeegeComponent },
      { path: 'antrag/neu', component: AntragComponent },
      { path: 'identitaetsnachweis', component: IdentitaetsnachweisComponent },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
