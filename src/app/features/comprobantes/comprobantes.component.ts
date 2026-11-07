import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  DatepickerComponent,
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
  TableCellDirective,
  TableColumn,
  TableComponent,
  ToastService,
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
    TableComponent,
    TableCellDirective,
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
              placeholder="Seleccionar fecha"
              size="sm"
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
              <div class="flex flex-col">
                <div class="flex items-center gap-1.5">
                  <span class="font-mono text-[11px] px-1.5 py-0.5 border border-[var(--color-border)] bg-[var(--color-muted)]">
                    {{ row.tipoComprobante }}
                  </span>
                  <span class="font-medium text-xs">{{ value }}</span>
                </div>
                <span class="font-mono text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
                  Serie: {{ row.establecimiento }}-{{ row.puntoEmision }}-{{ row.secuencial }}
                </span>
              </div>
            </ng-template>

            <ng-template tableCell="claveAcceso" let-value>
              <div class="flex items-center gap-2">
                <code class="font-mono text-[11px] text-[var(--color-muted-foreground)] bg-[var(--color-muted)]/50 px-1.5 py-0.5 border border-[var(--color-border)]">
                  {{ value.slice(0, 14) }}…{{ value.slice(-10) }}
                </code>
                <ui-button variant="ghost" size="xs" (click)="copiarClave(value)">
                  Copiar
                </ui-button>
              </div>
            </ng-template>

            <ng-template tableCell="razonSocialComprador" let-value let-row="row">
              <div class="flex flex-col">
                <span class="text-xs font-medium">{{ value }}</span>
                <span class="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                  RUC/CI: {{ row.identificacionComprador }}
                </span>
              </div>
            </ng-template>

            <ng-template tableCell="estado" let-value let-row="row">
              <div class="flex flex-col items-start gap-1">
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
              <div class="text-right font-mono tabular-nums">
                <div class="text-xs font-semibold">{{ value | currency:'USD':'symbol':'1.2-2' }}</div>
                <div class="text-[10px] text-[var(--color-muted-foreground)]">
                  IVA: {{ row.totalImpuestos | currency:'USD':'symbol':'1.2-2' }}
                </div>
              </div>
            </ng-template>

            <ng-template tableCell="Acciones" let-row="row">
              <div class="flex items-center justify-end gap-1.5">
                <ui-button variant="outline" size="xs" (click)="inspeccionar(row)">
                  Inspeccionar
                </ui-button>

                <ui-dropdown align="end">
                  <ui-button uiDropdownTrigger variant="ghost" size="xs">•••</ui-button>
                  <ui-dropdown-label>Operaciones SRI</ui-dropdown-label>
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
            <ui-pagination [(page)]="page" [totalPages]="totalPages()" size="sm" variant="compact" />
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
export class ComprobantesComponent implements OnInit {
  private readonly sriApi = inject(SriApiService);
  private readonly toast = inject(ToastService);

  readonly comprobantes = signal<Comprobante[]>([]);
  readonly loading = signal<boolean>(true);
  readonly page = signal<number>(1);
  readonly totalPages = signal<number>(1);

  readonly filtroBusqueda = signal<string>('');
  readonly filtroTipo = signal<string>('');
  readonly filtroEstado = signal<string>('');
  readonly filtroFechaDesde = signal<string>('');

  readonly drawerOpen = signal<boolean>(false);
  readonly seleccionado = signal<ComprobanteDetallado | null>(null);

  readonly columns: TableColumn[] = [
    { field: 'tipoComprobanteDescripcion', header: 'Tipo / Secuencial', sortable: true },
    { field: 'claveAcceso', header: 'Clave de Acceso (49 dígitos)' },
    { field: 'razonSocialComprador', header: 'Receptor / Adquirente', sortable: true },
    { field: 'fechaEmision', header: 'Emisión' },
    { field: 'estado', header: 'Estado SRI' },
    { field: 'total', header: 'Total USD', align: 'right' },
    { header: 'Acciones', align: 'right' },
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

  inspeccionar(row: Comprobante): void {
    this.sriApi.getComprobanteDetalle(row.claveAcceso).subscribe((det) => {
      this.seleccionado.set(det);
      this.drawerOpen.set(true);
    });
  }

  verificarEstadoSri(row: Comprobante): void {
    this.sriApi.verificarEnSri(row.claveAcceso).subscribe((res) => {
      this.toast.success(`Estado en WS SRI: ${res.estado} (Sincronizado: Sí)`);
    });
  }

  reintentarEnvio(row: Comprobante): void {
    this.sriApi.reintentarComprobante(row.claveAcceso).subscribe((res) => {
      this.toast.success(res.mensaje || 'Comprobante reenviado al SRI');
      this.aplicarFiltros();
    });
  }

  descargarRide(row: Comprobante): void {
    const url = `${environment.apiUrl}/sri/comprobantes/${row.claveAcceso}/ride`;
    this.toast.info(`Generando RIDE PDF para ${row.establecimiento}-${row.puntoEmision}-${row.secuencial}`);
    window.open(url, '_blank');
  }

  descargarXml(row: Comprobante): void {
    const url = `${environment.apiUrl}/sri/comprobantes/${row.claveAcceso}/xml`;
    this.toast.info(`Descargando XML XAdES-BES (${row.claveAcceso.slice(0, 12)}...)`);
    window.open(url, '_blank');
  }
}
