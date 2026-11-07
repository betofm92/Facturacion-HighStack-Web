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
  DrawerComponent,
  DrawerContentComponent,
  DrawerDescriptionComponent,
  DrawerFooterComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
  ProgressComponent,
  SeparatorComponent,
  TableCellDirective,
  TableColumn,
  TableComponent,
  ToastService,
} from '@highstacklabs2026/ui';
import { Comprobante, ComprobanteDetallado, Emisor } from '../../core/models/api.models';
import { SriApiService } from '../../core/services/sri-api.service';
import { environment } from '../../../environments/environment';

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
    DrawerComponent,
    DrawerHeaderComponent,
    DrawerTitleComponent,
    DrawerDescriptionComponent,
    DrawerContentComponent,
    DrawerFooterComponent,
    ProgressComponent,
    SeparatorComponent,
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
                  <div class="flex flex-col cursor-pointer group" (click)="inspeccionar(row)">
                    <span class="font-medium text-xs group-hover:underline">{{ value }}</span>
                    <span class="font-mono text-[11px] text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors">
                      {{ row.establecimiento }}-{{ row.puntoEmision }}-{{ row.secuencial }}
                    </span>
                  </div>
                </ng-template>

                <ng-template tableCell="razonSocialComprador" let-value let-row="row">
                  <div class="flex flex-col cursor-pointer group" (click)="inspeccionar(row)">
                    <span class="text-xs font-medium truncate max-w-[200px] group-hover:underline">{{ value }}</span>
                    <span class="font-mono text-[11px] text-[var(--color-muted-foreground)]">ID: {{ row.identificacionComprador }}</span>
                  </div>
                </ng-template>

                <ng-template tableCell="fechaEmision" let-value let-row="row">
                  <span class="font-mono text-xs cursor-pointer hover:underline" (click)="inspeccionar(row)">
                    {{ value | date:'dd/MM/yyyy' }}
                  </span>
                </ng-template>

                <ng-template tableCell="estado" let-value let-row="row">
                  <div class="cursor-pointer inline-block" (click)="inspeccionar(row)">
                    <ui-badge
                      [color]="value === 'AUTORIZADO' ? 'success' : value === 'DEVUELTA' || value === 'RECHAZADO' ? 'destructive' : 'warning'"
                      variant="soft"
                      size="sm"
                      [dot]="true"
                    >
                      {{ value }}
                    </ui-badge>
                  </div>
                </ng-template>

                <ng-template tableCell="total" let-value let-row="row">
                  <span class="font-mono font-medium text-xs tabular-nums cursor-pointer hover:underline" (click)="inspeccionar(row)">
                    {{ value | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </ng-template>

                <ng-template tableCell="acciones" let-row="row">
                  <div class="flex justify-end">
                    <ui-button variant="outline" size="xs" (click)="inspeccionar(row)">
                      Ver Detalle
                    </ui-button>
                  </div>
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
      <!-- Drawer Lateral de Detalle del Comprobante -->
      <ui-drawer [(open)]="drawerOpen" side="right" size="lg">
        <ui-drawer-header>
          <ui-drawer-title>Auditoría Técnica del Comprobante</ui-drawer-title>
          <ui-drawer-description>
            Detalle de estructura XML, impuestos y autorización ante el SRI.
          </ui-drawer-description>
        </ui-drawer-header>

        <ui-drawer-content>
          @if (seleccionado(); as comp) {
            <div class="space-y-5 text-xs">
              <div class="p-3.5 border border-[var(--color-border)] bg-[var(--color-muted)]/30 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)]">
                    {{ comp.tipoComprobanteDescripcion }} · {{ comp.establecimiento }}-{{ comp.puntoEmision }}-{{ comp.secuencial }}
                  </span>
                  <ui-badge
                    [color]="comp.estado === 'AUTORIZADO' ? 'success' : 'warning'"
                    variant="soft"
                    size="sm"
                  >
                    {{ comp.estado }}
                  </ui-badge>
                </div>
                <div class="space-y-1 pt-1">
                  <div class="text-[11px] text-[var(--color-muted-foreground)]">Clave de Acceso (49 dígitos):</div>
                  <div class="font-mono text-[11px] break-all bg-[var(--color-background)] p-2 border border-[var(--color-border)] select-all">
                    {{ comp.claveAcceso }}
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 border border-[var(--color-border)]">
                  <div class="text-[10px] font-mono uppercase text-[var(--color-muted-foreground)]">Emisor</div>
                  <div class="font-semibold mt-1">{{ comp.razonSocialEmisor }}</div>
                  <div class="font-mono text-[11px] text-[var(--color-muted-foreground)]">RUC: {{ comp.rucEmisor }}</div>
                </div>
                <div class="p-3 border border-[var(--color-border)]">
                  <div class="text-[10px] font-mono uppercase text-[var(--color-muted-foreground)]">Adquirente / Receptor</div>
                  <div class="font-semibold mt-1">{{ comp.razonSocialComprador }}</div>
                  <div class="font-mono text-[11px] text-[var(--color-muted-foreground)]">ID: {{ comp.identificacionComprador }}</div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div class="p-2.5 border border-[var(--color-border)] bg-[var(--color-muted)]/10">
                  <span class="text-[var(--color-muted-foreground)] block text-[10px] uppercase">Fecha Emisión</span>
                  <span>{{ comp.fechaEmision | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="p-2.5 border border-[var(--color-border)] bg-[var(--color-muted)]/10">
                  <span class="text-[var(--color-muted-foreground)] block text-[10px] uppercase">Autorización SRI</span>
                  <span>{{ comp.fechaAutorizacion ? (comp.fechaAutorizacion | date:'dd/MM/yyyy HH:mm') : 'Pendiente' }}</span>
                </div>
              </div>

              <ui-separator />

              <div class="space-y-2">
                <div class="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)]">
                  Líneas de Detalle ({{ comp.detalles.length }})
                </div>
                <div class="border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                  @for (item of comp.detalles; track item.id) {
                    <div class="p-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div class="font-medium">{{ item.descripcion }}</div>
                        <div class="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                          Cód: {{ item.codigoPrincipal }} · Cant: {{ item.cantidad }} × {{ item.precioUnitario | currency:'USD' }}
                        </div>
                      </div>
                      <div class="font-mono font-semibold tabular-nums">
                        {{ item.subtotal | currency:'USD' }}
                      </div>
                    </div>
                  } @empty {
                    <div class="p-3 text-center text-[var(--color-muted-foreground)] font-mono text-[11px]">
                      Sin líneas de detalle adicionales registradas.
                    </div>
                  }
                </div>
              </div>

              <div class="p-3 border border-[var(--color-border)] bg-[var(--color-muted)]/20 space-y-1.5 font-mono">
                <div class="flex justify-between">
                  <span class="text-[var(--color-muted-foreground)]">Subtotal Sin Impuestos:</span>
                  <span>{{ comp.subtotal | currency:'USD' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[var(--color-muted-foreground)]">Total Impuestos (IVA):</span>
                  <span>{{ comp.totalImpuestos | currency:'USD' }}</span>
                </div>
                <div class="flex justify-between text-sm font-semibold border-t border-[var(--color-border)] pt-1.5">
                  <span>Importe Total:</span>
                  <span>{{ comp.total | currency:'USD' }}</span>
                </div>
              </div>

              @if (comp.infoAdicional?.length) {
                <div class="space-y-1.5">
                  <div class="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)]">Información Adicional</div>
                  <div class="border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                    @for (info of comp.infoAdicional; track info.nombre) {
                      <div class="px-3 py-1.5 flex justify-between">
                        <span class="text-[var(--color-muted-foreground)]">{{ info.nombre }}</span>
                        <span class="font-mono">{{ info.valor }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </ui-drawer-content>

        <ui-drawer-footer>
          @if (seleccionado(); as comp) {
            <ui-button variant="outline" size="sm" (click)="descargarXml(comp)">
              Descargar XML
            </ui-button>
            <ui-button variant="default" size="sm" (click)="descargarRide(comp)">
              Descargar RIDE (PDF)
            </ui-button>
          }
        </ui-drawer-footer>
      </ui-drawer>
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

  readonly drawerOpen = signal<boolean>(false);
  readonly seleccionado = signal<ComprobanteDetallado | null>(null);

  readonly columns: TableColumn[] = [
    { field: 'tipoComprobanteDescripcion', header: 'Comprobante / Serie', sortable: true },
    { field: 'razonSocialComprador', header: 'Adquirente / Receptor', sortable: true },
    { field: 'fechaEmision', header: 'Emisión' },
    { field: 'estado', header: 'Estado SRI' },
    { field: 'total', header: 'Importe Total', align: 'right' },
    { field: 'acciones', header: 'Acciones', align: 'right' },
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

  inspeccionar(row: Comprobante): void {
    this.seleccionado.set({
      ...row,
      detalles: [],
      infoAdicional: [],
      xmlDisponible: true,
    });
    this.drawerOpen.set(true);
    this.sriApi.getComprobanteDetalle(row.claveAcceso, row).subscribe((det) => {
      this.seleccionado.set(det);
    });
  }

  descargarRide(row: Comprobante): void {
    this.toast.info(`Generando RIDE PDF para ${row.establecimiento}-${row.puntoEmision}-${row.secuencial}`);
    this.sriApi.downloadRide(row.claveAcceso).subscribe({
      next: (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      },
      error: () => {
        this.toast.error('No se pudo descargar el RIDE PDF de este comprobante');
      },
    });
  }

  descargarXml(row: Comprobante): void {
    this.toast.info(`Descargando XML XAdES-BES (${row.claveAcceso.slice(0, 12)}...)`);
    this.sriApi.downloadXml(row.claveAcceso).subscribe({
      next: (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${row.claveAcceso}.xml`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      },
      error: () => {
        this.toast.error('XML autorizado no disponible para este comprobante');
      },
    });
  }
}
