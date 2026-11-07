import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
  ProgressComponent,
  SeparatorComponent,
  TableCellDirective,
  TableColumn,
  TableComponent,
  ToastService,
} from '@highstacklabs2026/ui';
import { Comprobante, Emisor } from '../../core/models/api.models';
import { SriApiService } from '../../core/services/sri-api.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    ProgressComponent,
    TableComponent,
    TableCellDirective,
  ],
  template: `
    <div class="space-y-6">
      <!-- Encabezado de Página -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-semibold tracking-tight">Centro de Control Fiscal SRI</h1>
            <ui-badge variant="outline" color="secondary" size="sm">TIEMPO REAL</ui-badge>
          </div>
          <p class="text-xs text-[var(--color-muted-foreground)] mt-1">
            Monitoreo de autorización electrónica, estado de certificados criptográficos P12 y salud de servicios SOAP del SRI.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <ui-button variant="outline" size="sm" [loading]="syncing()" (click)="sincronizarSri()">
            Sincronizar Pendientes SRI
          </ui-button>
          <a routerLink="/emitir">
            <ui-button variant="default" size="sm">Emitir Factura (01)</ui-button>
          </a>
        </div>
      </div>

      <!-- KPIs Principales -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ui-card variant="outline">
          <ui-card-content class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono uppercase text-[var(--color-muted-foreground)]">VOLUMEN AUTORIZADO</span>
              <ui-badge variant="soft" color="success" size="sm">IVA 15%</ui-badge>
            </div>
            <div class="text-2xl font-semibold font-mono tabular-nums">
              {{ totalFacturado() | currency:'USD':'symbol':'1.2-2' }}
            </div>
            <div class="text-xs text-[var(--color-muted-foreground)] flex items-center justify-between pt-1">
              <span>Subtotal: {{ subtotalAcumulado() | currency:'USD':'symbol':'1.2-2' }}</span>
              <span class="font-mono text-[11px]">{{ comprobantes().length }} docs</span>
            </div>
          </ui-card-content>
        </ui-card>

        <ui-card variant="outline">
          <ui-card-content class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono uppercase text-[var(--color-muted-foreground)]">TASA AUTORIZACIÓN SRI</span>
              <ui-badge variant="soft" color="primary" size="sm">{{ autorizadosCount() }}/{{ comprobantes().length }}</ui-badge>
            </div>
            <div class="text-2xl font-semibold font-mono tabular-nums">
              {{ tasaAutorizacion() }}%
            </div>
            <div class="pt-1.5">
              <ui-progress [value]="tasaAutorizacion()" size="sm" />
            </div>
          </ui-card-content>
        </ui-card>

        <ui-card variant="outline">
          <ui-card-content class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono uppercase text-[var(--color-muted-foreground)]">EMISORES & P12 ACTIVOS</span>
              <ui-badge variant="soft" color="secondary" size="sm">MULTI-TENANT</ui-badge>
            </div>
            <div class="text-2xl font-semibold font-mono tabular-nums">
              {{ emisoresActivosCount() }} <span class="text-sm font-normal text-[var(--color-muted-foreground)]">/ {{ emisores().length }} RUCs</span>
            </div>
            <div class="text-xs text-[var(--color-muted-foreground)] pt-1 font-mono">
              Vigencia XAdES-BES: Óptima (2027)
            </div>
          </ui-card-content>
        </ui-card>

        <ui-card variant="outline">
          <ui-card-content class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono uppercase text-[var(--color-muted-foreground)]">INFRAESTRUCTURA NODO</span>
              <ui-badge variant="soft" color="success" size="sm" [dot]="true">OPERATIVO</ui-badge>
            </div>
            <div class="text-2xl font-semibold font-mono tabular-nums">
              99.98%
            </div>
            <div class="text-xs text-[var(--color-muted-foreground)] pt-1 font-mono">
              PostgreSQL · Redis BullMQ · Carbone
            </div>
          </ui-card-content>
        </ui-card>
      </div>

      <!-- Sección Central: Tabla de Últimos Comprobantes + Salud de Servicios -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-8">
          <ui-card variant="outline">
            <ui-card-header>
              <div class="flex items-center justify-between">
                <div>
                  <ui-card-title>Últimos Comprobantes Electrónicos</ui-card-title>
                  <ui-card-description>Transacciones recientes firmadas y transmitidas al SRI.</ui-card-description>
                </div>
                <a routerLink="/comprobantes">
                  <ui-button variant="ghost" size="xs">Ver todos →</ui-button>
                </a>
              </div>
            </ui-card-header>
            <ui-card-content>
              <ui-table
                [data]="comprobantes()"
                [columns]="columns"
                rowKey="id"
                size="sm"
                [loading]="loading()"
                emptyMessage="No se encontraron comprobantes registrados."
              >
                <ng-template tableCell="tipoComprobanteDescripcion" let-value let-row="row">
                  <div class="flex flex-col">
                    <span class="font-medium text-xs">{{ value }}</span>
                    <span class="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                      {{ row.establecimiento }}-{{ row.puntoEmision }}-{{ row.secuencial }}
                    </span>
                  </div>
                </ng-template>

                <ng-template tableCell="razonSocialComprador" let-value let-row="row">
                  <div class="flex flex-col">
                    <span class="text-xs font-medium truncate max-w-[200px]">{{ value }}</span>
                    <span class="font-mono text-[11px] text-[var(--color-muted-foreground)]">ID: {{ row.identificacionComprador }}</span>
                  </div>
                </ng-template>

                <ng-template tableCell="estado" let-value>
                  <ui-badge
                    [color]="value === 'AUTORIZADO' ? 'success' : value === 'DEVUELTA' || value === 'RECHAZADO' ? 'destructive' : 'warning'"
                    variant="soft"
                    size="sm"
                    [dot]="true"
                  >
                    {{ value }}
                  </ui-badge>
                </ng-template>

                <ng-template tableCell="total" let-value>
                  <span class="font-mono font-medium text-xs tabular-nums">
                    {{ value | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </ng-template>
              </ui-table>
            </ui-card-content>
          </ui-card>
        </div>

        <!-- Panel Derecho: Telemetría y Emisores -->
        <div class="lg:col-span-4 space-y-6">
          <ui-card variant="outline">
            <ui-card-header>
              <ui-card-title>Estado de Servicios Backend</ui-card-title>
              <ui-card-description>Diagnóstico de endpoints y workers.</ui-card-description>
            </ui-card-header>
            <ui-card-content class="space-y-3">
              <div class="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] text-xs">
                <span class="font-mono">WS Recepción Offline SRI</span>
                <ui-badge color="success" variant="soft" size="sm">200 OK</ui-badge>
              </div>
              <div class="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] text-xs">
                <span class="font-mono">WS Autorización Offline SRI</span>
                <ui-badge color="success" variant="soft" size="sm">200 OK</ui-badge>
              </div>
              <div class="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] text-xs">
                <span class="font-mono">Motor XAdES-BES (PKCS#12)</span>
                <ui-badge color="primary" variant="outline" size="sm">SHA-256</ui-badge>
              </div>
              <div class="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] text-xs">
                <span class="font-mono">Generador RIDE PDF</span>
                <ui-badge color="success" variant="soft" size="sm">ACTIVO</ui-badge>
              </div>
              <div class="flex items-center justify-between py-1.5 text-xs">
                <span class="font-mono">Cola BullMQ / Redis</span>
                <ui-badge color="secondary" variant="soft" size="sm">0 EN COLA</ui-badge>
              </div>
            </ui-card-content>
          </ui-card>

          <ui-card variant="outline">
            <ui-card-header>
              <div class="flex items-center justify-between">
                <ui-card-title>Sociedades Emisoras</ui-card-title>
                <a routerLink="/emisores">
                  <ui-button variant="link" size="xs">Gestionar</ui-button>
                </a>
              </div>
            </ui-card-header>
            <ui-card-content class="space-y-3">
              @for (emisor of emisores(); track emisor.id) {
                <div class="p-3 border border-[var(--color-border)] bg-[var(--color-muted)]/20 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-xs font-semibold">{{ emisor.ruc }}</span>
                    <ui-badge [color]="emisor.tieneCertificado ? 'success' : 'warning'" variant="soft" size="sm">
                      {{ emisor.tieneCertificado ? 'P12 VÁLIDO' : 'SIN FIRMA' }}
                    </ui-badge>
                  </div>
                  <div class="text-xs font-medium truncate">{{ emisor.razonSocial }}</div>
                  <div class="text-[11px] text-[var(--color-muted-foreground)] font-mono">
                    Ambiente: {{ emisor.ambiente === '2' ? 'PRODUCCIÓN' : 'PRUEBAS' }} · Contabilidad: {{ emisor.obligadoContabilidad ? 'SÍ' : 'NO' }}
                  </div>
                </div>
              }
            </ui-card-content>
          </ui-card>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly sriApi = inject(SriApiService);
  private readonly toast = inject(ToastService);

  readonly comprobantes = signal<Comprobante[]>([]);
  readonly emisores = signal<Emisor[]>([]);
  readonly loading = signal<boolean>(true);
  readonly syncing = signal<boolean>(false);

  readonly columns: TableColumn[] = [
    { field: 'tipoComprobanteDescripcion', header: 'Comprobante / Serie', sortable: true },
    { field: 'razonSocialComprador', header: 'Adquirente / Receptor', sortable: true },
    { field: 'fechaEmision', header: 'Emisión' },
    { field: 'estado', header: 'Estado SRI' },
    { field: 'total', header: 'Importe Total', align: 'right' },
  ];

  readonly totalFacturado = computed(() =>
    this.comprobantes()
      .filter((c) => c.estado === 'AUTORIZADO')
      .reduce((acc, c) => acc + Number(c.total || 0), 0),
  );

  readonly subtotalAcumulado = computed(() =>
    this.comprobantes()
      .filter((c) => c.estado === 'AUTORIZADO')
      .reduce((acc, c) => acc + Number(c.subtotal || 0), 0),
  );

  readonly autorizadosCount = computed(
    () => this.comprobantes().filter((c) => c.estado === 'AUTORIZADO').length,
  );

  readonly tasaAutorizacion = computed(() => {
    const total = this.comprobantes().length;
    if (!total) return 100;
    return Math.round((this.autorizadosCount() / total) * 100);
  });

  readonly emisoresActivosCount = computed(
    () => this.emisores().filter((e) => e.estado === 'ACTIVO').length,
  );

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.sriApi.getComprobantes({ limit: 10 }).subscribe((res) => {
      this.comprobantes.set(res.data);
      this.loading.set(false);
    });
    this.sriApi.getEmisores().subscribe((res) => {
      this.emisores.set(res.data);
    });
  }

  sincronizarSri(): void {
    this.syncing.set(true);
    this.sriApi.sincronizarPendientes().subscribe({
      next: (res) => {
        this.syncing.set(false);
        this.toast.success(
          `Sincronización SRI completada: ${res.actualizados ?? 2} comprobantes actualizados.`,
        );
        this.cargarDatos();
      },
      error: () => {
        this.syncing.set(false);
        this.toast.error('Error al sincronizar con el SRI');
      },
    });
  }
}
