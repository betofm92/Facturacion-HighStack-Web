import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
  TabComponent,
  TableCellDirective,
  TableColumn,
  TableComponent,
  TabsComponent,
  ToastService,
} from '@highstacklabs2026/ui';
import { TenantItem, WebhookConfig } from '../../core/models/api.models';
import { SriApiService } from '../../core/services/sri-api.service';

@Component({
  selector: 'app-integraciones',
  imports: [
    CommonModule,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    TabsComponent,
    TabComponent,
    TableComponent,
    TableCellDirective,
  ],
  template: `
    <div class="space-y-6">
      <!-- Cabecera -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-semibold tracking-tight">Webhooks HMAC & Arquitectura Multi-Tenant</h1>
            <ui-badge variant="outline" color="secondary" size="sm">ENTERPRISE</ui-badge>
          </div>
          <p class="text-xs text-[var(--color-muted-foreground)] mt-1">
            Despacho de eventos asíncronos firmados con HMAC-SHA256 y aislamiento de inquilinos/clientes.
          </p>
        </div>
      </div>

      <ui-tabs [(value)]="tabActiva" variant="underline">
        <ui-tab value="webhooks" label="Endpoints Webhook (Eventos SRI)">
          <div class="pt-4 space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              @for (wh of webhooks(); track wh.id) {
                <ui-card variant="outline">
                  <ui-card-header>
                    <div class="flex items-center justify-between">
                      <ui-card-title>{{ wh.nombre }}</ui-card-title>
                      <ui-badge [color]="wh.activo ? 'success' : 'secondary'" variant="soft" size="sm" [dot]="true">
                        {{ wh.activo ? 'ACTIVO' : 'INACTIVO' }}
                      </ui-badge>
                    </div>
                    <ui-card-description class="font-mono text-xs break-all">
                      POST {{ wh.url }}
                    </ui-card-description>
                  </ui-card-header>
                  <ui-card-content class="space-y-3">
                    <div class="space-y-1.5">
                      <div class="text-[11px] font-mono uppercase text-[var(--color-muted-foreground)]">Eventos Suscritos:</div>
                      <div class="flex flex-wrap gap-1.5">
                        @for (ev of wh.eventos; track ev) {
                          <ui-badge variant="outline" color="secondary" size="sm">{{ ev }}</ui-badge>
                        }
                      </div>
                    </div>

                    <div class="p-2.5 border border-[var(--color-border)] bg-[var(--color-muted)]/30 flex items-center justify-between text-xs font-mono">
                      <span class="text-[var(--color-muted-foreground)]">Signing Secret: {{ wh.secreto }}</span>
                      <ui-button variant="ghost" size="xs" (click)="copiarSecreto(wh.secreto || '')">Copiar</ui-button>
                    </div>
                  </ui-card-content>
                </ui-card>
              }
            </div>
          </div>
        </ui-tab>

        <ui-tab value="tenants" label="Inquilinos / Tenants (SUPERADMIN)">
          <div class="pt-4">
            <ui-card variant="outline">
              <ui-card-header>
                <ui-card-title>Organizaciones Registradas en el Clúster</ui-card-title>
                <ui-card-description>Control de planes, aislamiento de datos y RUCs asociados por tenant.</ui-card-description>
              </ui-card-header>
              <ui-card-content>
                <ui-table [data]="tenants()" [columns]="colsTenants" rowKey="id" size="sm">
                  <ng-template tableCell="plan" let-value>
                    <ui-badge variant="outline" color="primary" size="sm">{{ value }}</ui-badge>
                  </ng-template>
                  <ng-template tableCell="estado" let-value>
                    <ui-badge color="success" variant="soft" size="sm" [dot]="true">{{ value }}</ui-badge>
                  </ng-template>
                </ui-table>
              </ui-card-content>
            </ui-card>
          </div>
        </ui-tab>
      </ui-tabs>
    </div>
  `,
})
export class IntegracionesComponent implements OnInit {
  private readonly sriApi = inject(SriApiService);
  private readonly toast = inject(ToastService);

  readonly tabActiva = signal<string>('webhooks');
  readonly webhooks = signal<WebhookConfig[]>([]);
  readonly tenants = signal<TenantItem[]>([]);

  readonly colsTenants: TableColumn[] = [
    { field: 'nombre', header: 'Organización / Tenant', sortable: true },
    { field: 'ruc', header: 'RUC Matriz' },
    { field: 'emailContacto', header: 'Contacto Técnico' },
    { field: 'plan', header: 'Plan' },
    { field: 'estado', header: 'Estado' },
  ];

  ngOnInit(): void {
    this.sriApi.getWebhooks().subscribe((wh) => this.webhooks.set(wh));
    this.sriApi.getTenants().subscribe((res) => this.tenants.set(res.data || []));
  }

  copiarSecreto(sec: string): void {
    void navigator.clipboard.writeText(sec);
    this.toast.info('Secreto HMAC copiado al portapapeles');
  }
}
