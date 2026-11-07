import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertComponent,
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardFooterComponent,
  CardHeaderComponent,
  CardTitleComponent,
  InputComponent,
  SeparatorComponent,
  ToastService,
} from '@highstacklabs2026/ui';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ButtonComponent,
    InputComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    BadgeComponent,
    AlertComponent,
    SeparatorComponent,
  ],
  template: `
    <div class="min-h-screen grid lg:grid-cols-12 bg-[var(--color-background)] text-[var(--color-foreground)]">
      <!-- Panel Izquierdo: Identidad Arquitectónica & Especificaciones -->
      <aside class="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 border-r border-[var(--color-border)] bg-[var(--color-muted)]/30 relative overflow-hidden">
        <div class="space-y-8 max-w-xl">
          <div class="flex items-center gap-3">
            <div class="size-9 bg-[var(--color-foreground)] text-[var(--color-background)] flex items-center justify-center font-mono font-bold text-sm tracking-tighter border border-[var(--color-border)]">
              HS
            </div>
            <div>
              <span class="font-semibold tracking-tight text-base">HIGHSTACK</span>
              <span class="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-foreground)] ml-2">SRI CORE v2.0</span>
            </div>
            <ui-badge variant="outline" color="primary" size="sm">ECUADOR</ui-badge>
          </div>

          <div class="space-y-4 pt-6">
            <h1 class="text-3xl font-semibold tracking-tight leading-tight">
              Infraestructura Corporativa de Facturación Electrónica SRI
            </h1>
            <p class="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
              Plataforma multi-tenant de misión crítica para emisión, firma criptográfica XAdES-BES, recepción y autorización SOAP ante el Servicio de Rentas Internas del Ecuador.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-4">
            <div class="p-4 border border-[var(--color-border)] bg-[var(--color-background)]">
              <div class="text-xs font-mono uppercase text-[var(--color-muted-foreground)]">Estándar Criptográfico</div>
              <div class="text-sm font-semibold mt-1 font-mono">XAdES-BES · PKCS#12</div>
              <div class="text-xs text-[var(--color-muted-foreground)] mt-1">Firma digital validada con BCE, Security Data y ANF AC</div>
            </div>
            <div class="p-4 border border-[var(--color-border)] bg-[var(--color-background)]">
              <div class="text-xs font-mono uppercase text-[var(--color-muted-foreground)]">Comprobantes SRI</div>
              <div class="text-sm font-semibold mt-1 font-mono">01 · 04 · 05 · 06 · 07</div>
              <div class="text-xs text-[var(--color-muted-foreground)] mt-1">Facturas, Notas de Crédito/Débito, Guías y Retenciones</div>
            </div>
            <div class="p-4 border border-[var(--color-border)] bg-[var(--color-background)]">
              <div class="text-xs font-mono uppercase text-[var(--color-muted-foreground)]">Arquitectura</div>
              <div class="text-sm font-semibold mt-1 font-mono">Multi-Tenant & BullMQ</div>
              <div class="text-xs text-[var(--color-muted-foreground)] mt-1">Aislamiento por RUC emisor, colas asíncronas y RIDE PDF</div>
            </div>
            <div class="p-4 border border-[var(--color-border)] bg-[var(--color-background)]">
              <div class="text-xs font-mono uppercase text-[var(--color-muted-foreground)]">Integración Continua</div>
              <div class="text-sm font-semibold mt-1 font-mono">Webhooks HMAC + SSE</div>
              <div class="text-xs text-[var(--color-muted-foreground)] mt-1">Notificación en tiempo real de cambios de estado SRI</div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-[var(--color-muted-foreground)] border-t border-[var(--color-border)] pt-6 font-mono">
          <span>WS CELCER / CEL PRODUCCIÓN · FICHA TÉCNICA SRI v2.28</span>
          <span>HIGHSTACK LABS</span>
        </div>
      </aside>

      <!-- Panel Derecho: Autenticación -->
      <main class="lg:col-span-5 flex items-center justify-center p-6 sm:p-12">
        <div class="w-full max-w-md space-y-6">
          <div class="lg:hidden flex items-center gap-3 mb-6">
            <div class="size-8 bg-[var(--color-foreground)] text-[var(--color-background)] flex items-center justify-center font-mono font-bold text-xs">
              HS
            </div>
            <span class="font-semibold tracking-tight">HighStack Facturación SRI</span>
          </div>

          <ui-card variant="outline">
            <ui-card-header>
              <div class="flex items-center justify-between">
                <ui-card-title>Acceso a Consola Fiscal</ui-card-title>
                <ui-badge variant="soft" color="secondary" size="sm">JWT AUTH</ui-badge>
              </div>
              <ui-card-description>
                Ingresa tus credenciales vinculadas al servidor Open API Facturación SRI.
              </ui-card-description>
            </ui-card-header>

            <ui-card-content>
              <form class="space-y-4" (submit)="onSubmit($event)">
                @if (errorMsg()) {
                  <ui-alert type="error" variant="soft" title="Error de autenticación" [closable]="true" (close)="errorMsg.set('')">
                    {{ errorMsg() }}
                  </ui-alert>
                }

                <ui-input
                  label="Correo corporativo"
                  type="email"
                  placeholder="admin@empresa.com"
                  [(value)]="email"
                  [required]="true"
                />

                <ui-input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••••••"
                  [(value)]="password"
                  [required]="true"
                />

                <div class="pt-2">
                  <ui-button type="submit" variant="default" [full]="true" [loading]="loading()">
                    Iniciar Sesión en Servidor SRI
                  </ui-button>
                </div>
              </form>

              <div class="my-5">
                <ui-separator />
              </div>

              <div class="space-y-3">
                <div class="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                  ¿Tu servidor backend local (<code class="font-mono">localhost:3001</code>) aún no está encendido? Puedes explorar toda la consola con datos fiscales reales del SRI en modo interactivo:
                </div>
                <ui-button variant="outline" [full]="true" (click)="enterDemo()">
                  Explorar Consola en Modo Demostración
                </ui-button>
              </div>
            </ui-card-content>

            <ui-card-footer>
              <div class="w-full flex items-center justify-between text-xs text-[var(--color-muted-foreground)] font-mono">
                <span>API: http://localhost:3001</span>
                <span>TLS / CORS READY</span>
              </div>
            </ui-card-footer>
          </ui-card>
        </div>
      </main>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly email = signal('admin@empresa.com');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly errorMsg = signal('');

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.email() || !this.password()) {
      this.errorMsg.set('Por favor completa el correo y la contraseña.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.email(), this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Sesión iniciada correctamente');
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message ||
          'No se pudo conectar con http://localhost:3001 o las credenciales son inválidas. Puedes usar el Modo Demostración.';
        this.errorMsg.set(Array.isArray(msg) ? msg.join(', ') : msg);
      },
    });
  }

  enterDemo(): void {
    this.auth.enterDemoMode();
    this.toast.info('Modo Demostración activado con datos corporativos SRI');
    void this.router.navigate(['/dashboard']);
  }
}

