import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  DatepickerComponent,
  DialogService,
  DrawerComponent,
  DrawerContentComponent,
  DrawerDescriptionComponent,
  DrawerFooterComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
  DropdownComponent,
  DropdownItemComponent,
  DropdownLabelComponent,
  DropdownSeparatorComponent,
  DropdownTriggerDirective,
  InputComponent,
  OptionComponent,
  PaginationComponent,
  SelectComponent,
  SeparatorComponent,
  SkeletonComponent,
  TableCellDirective,
  TableColumn,
  TableComponent,
  ToastService,
  TooltipDirective,
} from '@highstacklabs2026/ui';
import { Comprobante, ComprobanteDetallado } from '../../core/models/api.models';
import { SriApiService } from '../../core/services/sri-api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-comprobantes',
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    DatepickerComponent,
    DrawerComponent,
    DrawerHeaderComponent,
    DrawerTitleComponent,
    DrawerDescriptionComponent,
    DrawerContentComponent,
    DrawerFooterComponent,
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownItemComponent,
    DropdownLabelComponent,
    DropdownSeparatorComponent,
    InputComponent,
    SelectComponent,
    OptionComponent,
    PaginationComponent,
    SeparatorComponent,
    SkeletonComponent,
    TableComponent,
    TableCellDirective,
    TooltipDirective,
  ],
  template: `
    <div class="space-y-6">
      <!-- Cabecera -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <h1 class="text-xl font-semibold tracking-tight">Registro General de Comprobantes SRI</h1>
          <p class="text-xs text-[var(--color-muted-foreground)] mt-1">
            Auditoría de Claves de Acceso de 49 dígitos, descarga de XML firmado XAdES-BES y representación impresa RIDE (PDF).
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <ui-button variant="outline" size="sm" (click)="limpiarFiltros()">
            Restablecer Filtros
          </ui-button>
          <a routerLink="/emitir">
            <ui-button variant="default" size="sm">Nuevo Comprobante</ui-button>
          </a>
        </div>
      </div>

      <!-- Barra de Filtros Corporativa -->
      <ui-card variant="outline">
        <ui-card-content>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <ui-input
              label="Buscar RUC / Razón Social"
              placeholder="Ej: 1790016919001 o Favorita"
              size="sm"
              [(value)]="filtroBusqueda"
            />

            <ui-select label="Tipo de Comprobante" placeholder="Todos los tipos" size="sm" [(value)]="filtroTipo">
              <ui-option value="">Todos los tipos</ui-option>
              <ui-option value="01">01 · Factura</ui-option>
              <ui-option value="04">04 · Nota de Crédito</ui-option>
              <ui-option value="05">05 · Nota de Débito</ui-option>
              <ui-option value="06">06 · Guía de Remisión</ui-option>
              <ui-option value="07">07 · Comprobante de Retención</ui-option>
            </ui-select>

            <ui-select label="Estado SRI" placeholder="Todos los estados" size="sm" [(value)]="filtroEstado">
              <ui-option value="">Todos los estados</ui-option>
              <ui-option value="AUTORIZADO">AUTORIZADO</ui-option>
              <ui-option value="EN PROCESO">EN PROCESO</ui-option>
              <ui-option value="PENDIENTE">PENDIENTE</ui-option>
              <ui-option value="DEVUELTA">DEVUELTA</ui-option>
              <ui-option value="RECHAZADO">RECHAZADO</ui-option>
              <ui-option value="ANULADO">ANULADO</ui-option>
            </ui-select>

            <ui-datepicker
              label="Fecha Emisión Desde"
              placeholder="Seleccionar o escribir"
              size="sm"
              [typeable]="true"
              [(value)]="filtroFechaDesde"
            />

            <div class="flex items-center gap-2">
              <ui-button variant="default" size="sm" [full]="true" (click)="aplicarFiltros()">
                Filtrar Registro
              </ui-button>
            </div>
          </div>
        </ui-card-content>
      </ui-card>

      <!-- Tabla de Comprobantes -->
      <ui-card variant="outline">
        <ui-card-content class="space-y-4">
          <ui-table
            [data]="comprobantes()"
            [columns]="columns"
            rowKey="id"
            size="sm"
            [loading]="loading()"
            emptyMessage="No existen comprobantes con los criterios seleccionados."
          >
            <ng-template tableCell="tipoComprobanteDescripcion" let-value let-row="row">
              <div class="flex flex-col cursor-pointer group" (click)="inspeccionar(row)">
                <div class="flex items-center gap-1.5">
                  <span class="font-mono text-[11px] px-1.5 py-0.5 border border-[var(--color-border)] bg-[var(--color-muted)]">
                    {{ row.tipoComprobante }}
                  </span>
                  <span class="font-medium text-xs group-hover:underline">{{ value }}</span>
                </div>
                <span class="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-0.5 group-hover:text-[var(--color-foreground)] transition-colors">
                  Serie: {{ row.establecimiento }}-{{ row.puntoEmision }}-{{ row.secuencial }}
                </span>
              </div>
            </ng-template>

            <ng-template tableCell="claveAcceso" let-value let-row="row">
              <div class="flex items-center gap-2">
                <code
                  class="font-mono text-[11px] text-[var(--color-muted-foreground)] bg-[var(--color-muted)]/50 px-1.5 py-0.5 border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-ring)] hover:text-[var(--color-foreground)] transition-colors"
                  (click)="inspeccionar(row)"
                >
                  {{ value.slice(0, 14) }}…{{ value.slice(-10) }}
                </code>
                <ui-button
                  variant="ghost"
                  size="xs"
                  uiTooltip="Copiar Clave de Acceso (49 dígitos)"
                  (click)="copiarClave(value)"
                >
                  Copiar
                </ui-button>
              </div>
            </ng-template>

            <ng-template tableCell="razonSocialComprador" let-value let-row="row">
              <div class="flex flex-col cursor-pointer group" (click)="inspeccionar(row)">
                <span class="text-xs font-medium group-hover:underline">{{ value }}</span>
                <span class="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                  RUC/CI: {{ row.identificacionComprador }}
                </span>
              </div>
            </ng-template>

            <ng-template tableCell="fechaEmision" let-value let-row="row">
              <span class="font-mono text-xs cursor-pointer hover:underline" (click)="inspeccionar(row)">
                {{ formatearFechaEmision(row) }}
              </span>
            </ng-template>

            <ng-template tableCell="estado" let-value let-row="row">
              <div class="flex flex-col items-start gap-1 cursor-pointer" (click)="inspeccionar(row)">
                <ui-badge
                  [color]="value === 'AUTORIZADO' ? 'success' : value === 'DEVUELTA' || value === 'RECHAZADO' ? 'destructive' : 'warning'"
                  variant="soft"
                  size="sm"
                  [dot]="true"
                >
                  {{ value }}
                </ui-badge>
                <span class="font-mono text-[10px] text-[var(--color-muted-foreground)]">
                  Amb: {{ row.ambiente === '2' ? 'PRODUCCIÓN' : 'PRUEBAS' }}
                </span>
              </div>
            </ng-template>

            <ng-template tableCell="total" let-value let-row="row">
              <div class="text-right font-mono tabular-nums cursor-pointer" (click)="inspeccionar(row)">
                <div class="text-xs font-semibold">{{ value | currency:'USD':'symbol':'1.2-2' }}</div>
                <div class="text-[10px] text-[var(--color-muted-foreground)]">
                  IVA: {{ row.totalImpuestos | currency:'USD':'symbol':'1.2-2' }}
                </div>
              </div>
            </ng-template>

            <ng-template tableCell="acciones" let-row="row">
              <div class="flex items-center justify-end gap-1.5">
                <ui-button variant="outline" size="xs" (click)="inspeccionar(row)">
                  Ver Detalles
                </ui-button>

                <ui-dropdown align="end">
                  <ui-button uiDropdownTrigger variant="ghost" size="xs">•••</ui-button>
                  <ui-dropdown-label>Operaciones SRI</ui-dropdown-label>
                  <ui-dropdown-item (select)="inspeccionar(row)">
                    Ver Detalles del Comprobante
                  </ui-dropdown-item>
                  <ui-dropdown-item (select)="verificarEstadoSri(row)">
                    Verificar en WS SRI
                  </ui-dropdown-item>
                  <ui-dropdown-item (select)="descargarRide(row)">
                    Descargar RIDE (PDF)
                  </ui-dropdown-item>
                  <ui-dropdown-item (select)="descargarXml(row)">
                    Descargar XML Autorizado
                  </ui-dropdown-item>
                  <ui-dropdown-separator />
                  <ui-dropdown-item (select)="reintentarEnvio(row)">
                    Reintentar Autorización
                  </ui-dropdown-item>
                </ui-dropdown>
              </div>
            </ng-template>
          </ui-table>

          <div class="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
            <span class="text-xs text-[var(--color-muted-foreground)] font-mono">
              Mostrando {{ comprobantes().length }} comprobantes electrónicos
            </span>
            <ui-pagination
              [(page)]="page"
              [totalPages]="totalPages()"
              [(pageSize)]="pageSize"
              [pageSizeOptions]="[10, 20, 50]"
              size="sm"
              variant="compact"
            />
          </div>
        </ui-card-content>
      </ui-card>

      <!-- Drawer Lateral de Auditoría de Comprobante -->
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
                  <span>{{ formatearFechaEmision(comp) }}</span>
                </div>
                <div class="p-2.5 border border-[var(--color-border)] bg-[var(--color-muted)]/10">
                  <span class="text-[var(--color-muted-foreground)] block text-[10px] uppercase">Autorización SRI</span>
                  <span>{{ formatearFechaAutorizacion(comp) }}</span>
                </div>
              </div>

              <ui-separator />

              <div class="space-y-2">
                <div class="font-mono text-[11px] uppercase text-[var(--color-muted-foreground)]">
                  Líneas de Detalle ({{ comp.detalles.length }})
                </div>
                @if (cargandoDetalle()) {
                  <div class="space-y-2 p-3 border border-[var(--color-border)]">
                    <ui-skeleton width="70%" height="0.875rem" />
                    <ui-skeleton width="45%" height="0.75rem" />
                  </div>
                } @else {
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
                }
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
export class ComprobantesComponent implements OnInit {
  private readonly sriApi = inject(SriApiService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  readonly comprobantes = signal<Comprobante[]>([]);
  readonly loading = signal<boolean>(true);
  readonly page = signal<number>(1);
  readonly pageSize = signal<number>(20);
  readonly totalPages = signal<number>(1);

  readonly filtroBusqueda = signal<string>('');
  readonly filtroTipo = signal<string>('');
  readonly filtroEstado = signal<string>('');
  readonly filtroFechaDesde = signal<string>('');

  readonly drawerOpen = signal<boolean>(false);
  readonly cargandoDetalle = signal<boolean>(false);
  readonly seleccionado = signal<ComprobanteDetallado | null>(null);

  readonly columns: TableColumn[] = [
    { field: 'tipoComprobanteDescripcion', header: 'Tipo / Secuencial', sortable: true },
    { field: 'claveAcceso', header: 'Clave de Acceso (49 dígitos)' },
    { field: 'razonSocialComprador', header: 'Receptor / Adquirente', sortable: true },
    { field: 'fechaEmision', header: 'Emisión' },
    { field: 'estado', header: 'Estado SRI' },
    { field: 'total', header: 'Total USD', align: 'right' },
    { field: 'acciones', header: 'Acciones', align: 'right' },
  ];

  ngOnInit(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.loading.set(true);
    this.sriApi
      .getComprobantes({
        rucEmisor: this.filtroBusqueda(),
        tipoComprobante: this.filtroTipo(),
        estado: this.filtroEstado(),
        fechaDesde: this.filtroFechaDesde(),
        page: this.page(),
        limit: this.pageSize(),
      })
      .subscribe((res) => {
        this.comprobantes.set(res.data);
        this.totalPages.set(res.meta.totalPages || 1);
        this.loading.set(false);
      });
  }

  limpiarFiltros(): void {
    this.filtroBusqueda.set('');
    this.filtroTipo.set('');
    this.filtroEstado.set('');
    this.filtroFechaDesde.set('');
    this.aplicarFiltros();
  }

  copiarClave(clave: string): void {
    void navigator.clipboard.writeText(clave);
    this.toast.info('Clave de acceso de 49 dígitos copiada al portapapeles');
  }

  formatearFechaEmision(comp: Comprobante): string {
    return this.sriApi.formatearFechaEmision(comp.fechaEmision, comp.createdAt);
  }

  formatearFechaAutorizacion(comp: Comprobante): string {
    if (!comp.fechaAutorizacion && comp.estado !== 'AUTORIZADO') {
      return 'Pendiente';
    }
    return this.sriApi.formatearFechaAutorizacion(comp.fechaAutorizacion, comp.updatedAt || comp.createdAt);
  }

  inspeccionar(row: Comprobante): void {
    this.seleccionado.set({
      ...row,
      detalles: [],
      infoAdicional: [],
      xmlDisponible: true,
    });
    this.cargandoDetalle.set(true);
    this.drawerOpen.set(true);
    this.sriApi.getComprobanteDetalle(row.claveAcceso, row).subscribe((det) => {
      this.seleccionado.set(det);
      this.cargandoDetalle.set(false);
    });
  }

  verificarEstadoSri(row: Comprobante): void {
    this.sriApi.verificarEnSri(row.claveAcceso).subscribe((res) => {
      void this.dialog.alert({
        title: `Respuesta WS SRI · ${res.estado}`,
        message: `Clave de Acceso: ${row.claveAcceso}\nSincronizado: ${res.sincronizado ? 'Sí' : 'No'}\nDetalle: ${(res.mensajes || ['Comprobante verificado en WS Autorización Offline SRI.']).join(' ')}`,
        confirmText: 'Entendido',
      });
    });
  }

  async reintentarEnvio(row: Comprobante): Promise<void> {
    const ok = await this.dialog.confirm({
      title: '¿Reintentar autorización ante el SRI?',
      message: `Se volverá a firmar y transmitir el comprobante ${row.establecimiento}-${row.puntoEmision}-${row.secuencial} a los Web Services del SRI.`,
      confirmText: 'Reintentar Envío',
      cancelText: 'Cancelar',
    });
    if (!ok) return;

    this.sriApi.reintentarComprobante(row.claveAcceso).subscribe((res) => {
      this.toast.success(res.mensaje || 'Comprobante reenviado al SRI');
      this.aplicarFiltros();
    });
  }

  descargarRide(row: Comprobante): void {
    this.toast.info(`Generando RIDE PDF para ${row.establecimiento}-${row.puntoEmision}-${row.secuencial}`);
    this.sriApi.downloadRide(row.claveAcceso, row).subscribe({
      next: (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `RIDE_${row.establecimiento}-${row.puntoEmision}-${row.secuencial}.pdf`;
          a.click();
        }
      },
      error: () => {
        this.toast.error('No se pudo descargar el RIDE PDF de este comprobante');
      },
    });
  }

  descargarXml(row: Comprobante): void {
    this.toast.info(`Descargando XML XAdES-BES (${row.claveAcceso.slice(0, 12)}...)`);
    this.sriApi.downloadXml(row.claveAcceso, row).subscribe({
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

