import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellLayoutComponent } from './layout/shell-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: ShellLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'comprobantes',
        loadComponent: () =>
          import('./features/comprobantes/comprobantes.component').then(
            (m) => m.ComprobantesComponent,
          ),
      },
      {
        path: 'emitir',
        loadComponent: () =>
          import('./features/emision/emision.component').then((m) => m.EmisionComponent),
      },
      {
        path: 'emisores',
        loadComponent: () =>
          import('./features/emisores/emisores.component').then((m) => m.EmisoresComponent),
      },
      {
        path: 'certificados',
        loadComponent: () =>
          import('./features/certificados/certificados.component').then(
            (m) => m.CertificadosComponent,
          ),
      },
      {
        path: 'integraciones',
        loadComponent: () =>
          import('./features/integraciones/integraciones.component').then(
            (m) => m.IntegracionesComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

