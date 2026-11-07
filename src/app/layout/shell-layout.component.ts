import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  AvatarComponent,
  BadgeComponent,
  ButtonComponent,
  DropdownComponent,
  DropdownItemComponent,
  DropdownLabelComponent,
  DropdownSeparatorComponent,
  DropdownTriggerDirective,
  SegmentedComponent,
  SegmentedOption,
  SeparatorComponent,
  TooltipDirective,
} from '@highstacklabs2026/ui';
import { AuthService } from '../core/services/auth.service';
import { SriApiService } from '../core/services/sri-api.service';

interface NavItem {
  label: string;
  route: string;
  code: string;
  iconPath: string;
}

@Component({
  selector: 'app-shell-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AvatarComponent,
    BadgeComponent,
    ButtonComponent,
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownItemComponent,
    DropdownLabelComponent,
    DropdownSeparatorComponent,
    SegmentedComponent,
    SeparatorComponent,
    TooltipDirective,
  ],
  template: `
    <div class="min-h-screen flex bg-[var(--color-background)] text-[var(--color-foreground)]">
      <!-- Sidebar Corporativo -->
      <aside class="w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-muted)]/20 flex flex-col justify-between select-none">
        <div>
          <!-- Brand Header -->
          <div class="h-14 px-5 flex items-center justify-between border-b border-[var(--color-border)]">
            <div class="flex items-center gap-2.5">
              <div class="size-7 bg-[var(--color-foreground)] text-[var(--color-background)] flex items-center justify-center font-mono font-bold text-xs tracking-tighter">
                HS
              </div>
              <div class="flex flex-col">
                <span class="font-semibold text-sm tracking-tight leading-none">HIGHSTACK</span>
                <span class="text-[10px] font-mono text-[var(--color-muted-foreground)] tracking-widest mt-0.5">FACTURACIÓN SRI</span>
              </div>
            </div>
            <ui-badge variant="outline" color="secondary" size="sm">v2.0</ui-badge>
          </div>

          <!-- Acción Rápida Primaria -->
          <div class="p-4 border-b border-[var(--color-border)]">
            <ui-button variant="default" size="sm" [full]="true" (click)="irAEmitir()">
              <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14" stroke-linecap="square" />
              </svg>
              Nuevo Comprobante
            </ui-button>
          </div>

          <!-- Navegación Principal -->
          <div class="px-3 py-4 space-y-6">
            <div>
              <div class="px-2 pb-2 text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Operaciones Fiscales
              </div>
              <nav class="space-y-0.5">
                @for (item of mainNav; track item.route) {
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="bg-[var(--color-accent)] text-[var(--color-foreground)] font-medium border-l-2 border-[var(--color-foreground)]"
                    class="group flex items-center justify-between px-2.5 py-2 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)]/60 transition-colors"
                  >
                    <div class="flex items-center gap-2.5">
                      <svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                        <path [attr.d]="item.iconPath" stroke-linecap="square" stroke-linejoin="miter" />
                      </svg>
                      <span>{{ item.label }}</span>
                    </div>
                    <span class="font-mono text-[10px] opacity-60">{{ item.code }}</span>
                  </a>
                }
              </nav>
            </div>

            <div>
              <div class="px-2 pb-2 text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Infraestructura & Firma
              </div>
              <nav class="space-y-0.5">
                @for (item of infraNav; track item.route) {
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="bg-[var(--color-accent)] text-[var(--color-foreground)] font-medium border-l-2 border-[var(--color-foreground)]"
                    class="group flex items-center justify-between px-2.5 py-2 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)]/60 transition-colors"
                  >
                    <div class="flex items-center gap-2.5">
                      <svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                        <path [attr.d]="item.iconPath" stroke-linecap="square" stroke-linejoin="miter" />
                      </svg>
                      <span>{{ item.label }}</span>
                    </div>
                    <span class="font-mono text-[10px] opacity-60">{{ item.code }}</span>
                  </a>
                }
              </nav>
            </div>
          </div>
        </div>

        <!-- Pie del Sidebar: Estado del Nodo SRI & Usuario -->
        <div class="p-3 border-t border-[var(--color-border)] space-y-3 bg-[var(--color-background)]">
          <div class="p-2.5 border border-[var(--color-border)] bg-[var(--color-muted)]/30 space-y-1.5">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-mono text-[var(--color-muted-foreground)]">CONEXIÓN WS SRI</span>
              <ui-badge [color]="sriApi.activeAmbiente() === '2' ? 'warning' : 'success'" variant="soft" size="sm" [dot]="true">
                {{ sriApi.activeAmbiente() === '2' ? 'CEL PROD' : 'CELCER TEST' }}
              </ui-badge>
            </div>
            <div class="text-[11px] text-[var(--color-muted-foreground)] font-mono truncate">
              XAdES-BES · SHA256 · RSA
            </div>
          </div>

          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-2.5 min-w-0">
              <ui-avatar [name]="userName()" size="sm" shape="square" status="online" />
              <div class="min-w-0">
                <div class="text-xs font-medium truncate">{{ auth.user()?.email || 'admin@highstack.ec' }}</div>
                <div class="text-[10px] font-mono text-[var(--color-muted-foreground)]">{{ auth.user()?.rol || 'SUPERADMIN' }}</div>
              </div>
            </div>

            <ui-dropdown align="end" side="top">
              <ui-button uiDropdownTrigger variant="ghost" size="icon" aria-label="Menú de usuario">
                <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
                </svg>
              </ui-button>
              <ui-dropdown-label>Sesión Activa</ui-dropdown-label>
              <ui-dropdown-item (select)="toggleDarkMode()">
                {{ isDark() ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro' }}
              </ui-dropdown-item>
              <ui-dropdown-separator />
              <ui-dropdown-item [destructive]="true" (select)="auth.logout()">
                Cerrar Sesión
              </ui-dropdown-item>
            </ui-dropdown>
          </div>
        </div>
      </aside>

      <!-- Área Principal -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Topbar Ejecutiva -->
        <header class="h-14 px-6 border-b border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-between gap-4 sticky top-0 z-20">
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono uppercase tracking-wider text-[var(--color-muted-foreground)]">
              CONSOLA FISCAL ECUADOR
            </span>
            <ui-separator orientation="vertical" class="h-4" />
            @if (auth.isDemoMode()) {
              <ui-badge variant="outline" color="warning" size="sm">
                MODO DEMOSTRACIÓN ACTIVO (DATOS LOCALES + FALLBACK API)
              </ui-badge>
            } @else {
              <ui-badge variant="soft" color="success" size="sm" [dot]="true">
                CONECTADO A API LOCALHOST:3001
              </ui-badge>
            }
          </div>

          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs text-[var(--color-muted-foreground)] hidden sm:inline">Ambiente SRI:</span>
              <ui-segmented
                size="sm"
                [options]="ambienteOptions"
                [value]="sriApi.activeAmbiente()"
                (valueChange)="setAmbiente($event)"
              />
            </div>

            <ui-separator orientation="vertical" class="h-4" />

            <ui-button
              variant="outline"
              size="icon"
              [uiTooltip]="isDark() ? 'Activar tema claro' : 'Activar tema oscuro'"
              tooltipPlacement="bottom"
              (click)="toggleDarkMode()"
            >
              @if (isDark()) {
                <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              } @else {
                <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              }
            </ui-button>
          </div>
        </header>

        <!-- Contenido de la Vista -->
        <main class="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class ShellLayoutComponent {
  readonly auth = inject(AuthService);
  readonly sriApi = inject(SriApiService);
  private readonly router = inject(Router);

  readonly isDark = signal<boolean>(
    (localStorage.getItem('hs_sri_theme') ?? 'dark') === 'dark',
  );

  readonly userName = computed(() => {
    const email = this.auth.user()?.email || 'HighStack Admin';
    return email.split('@')[0].replace('.', ' ').toUpperCase();
  });

  readonly ambienteOptions: SegmentedOption[] = [
    { value: '1', label: '1 · PRUEBAS' },
    { value: '2', label: '2 · PRODUCCIÓN' },
  ];

  readonly mainNav: NavItem[] = [
    {
      label: 'Resumen Ejecutivo',
      route: '/dashboard',
      code: 'KPI',
      iconPath: 'M3 3v18h18M7 16v-5m5 5V8m5 8v-3',
    },
    {
      label: 'Comprobantes SRI',
      route: '/comprobantes',
      code: 'XML/RIDE',
      iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    },
    {
      label: 'Emitir Comprobante',
      route: '/emitir',
      code: 'EMISIÓN',
      iconPath: 'M12 5v14M5 12h14',
    },
  ];

  readonly infraNav: NavItem[] = [
    {
      label: 'Emisores & Puntos',
      route: '/emisores',
      code: 'RUC/001',
      iconPath: 'M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h2m-2 4h2m4-4h2m-2 4h2',
    },
    {
      label: 'Firma Electrónica P12',
      route: '/certificados',
      code: 'PKCS#12',
      iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    },
    {
      label: 'Webhooks & Tenants',
      route: '/integraciones',
      code: 'API/HOOK',
      iconPath: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
    },
  ];

  setAmbiente(val: string): void {
    this.sriApi.activeAmbiente.set(val === '2' ? '2' : '1');
  }

  toggleDarkMode(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem('hs_sri_theme', next ? 'dark' : 'light');
    document.body.classList.toggle('dark', next);
  }

  irAEmitir(): void {
    void this.router.navigate(['/emitir']);
  }
}

