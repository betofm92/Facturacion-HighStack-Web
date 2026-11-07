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
  CheckboxComponent,
  InputComponent,
  ModalComponent,
  ModalContentComponent,
  ModalDescriptionComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleComponent,
  OptionComponent,
  SelectComponent,
  TabComponent,
  TableCellDirective,
  TableColumn,
  TableComponent,
  TabsComponent,
  ToastService,
} from '@highstacklabs2026/ui';
import { Emisor, PuntoEmision, Secuencial } from '../../core/models/api.models';
import { SriApiService } from '../../core/services/sri-api.service';

@Component({
  selector: 'app-emisores',
  imports: [
    CommonModule,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CheckboxComponent,
    InputComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleComponent,
    ModalDescriptionComponent,
    ModalContentComponent,
    ModalFooterComponent,
    SelectComponent,
    OptionComponent,
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
          <h1 class="text-xl font-semibold tracking-tight">Emisores, Establecimientos y Secuenciales</h1>
          <p class="text-xs text-[var(--color-muted-foreground)] mt-1">
            Administración de RUCs emisores, cajas/puntos de emisión (001-001) y numeración correlativa por tipo de comprobante.
          </p>
        </div>

        <ui-button variant="default" size="sm" (click)="modalNuevoEmisor.set(true)">
          + Registrar Nuevo Emisor (RUC)
        </ui-button>
      </div>

      <!-- Tabs de Gestión -->
      <ui-tabs [(value)]="tabActiva" variant="underline">
        <ui-tab value="emisores" label="Sociedades Emisoras (RUCs)">
          <div class="pt-4">
            <ui-card variant="outline">
              <ui-card-content>
                <ui-table
                  [data]="emisores()"
                  [columns]="colsEmisores"
                  rowKey="id"
                  size="sm"
                >
                  <ng-template tableCell="ruc" let-value let-row="row">
                    <div class="flex flex-col">
                      <span class="font-mono font-semibold text-xs">{{ value }}</span>
                      <span class="text-[11px] text-[var(--color-muted-foreground)]">{{ row.nombreComercial || 'Matriz Corporativa' }}</span>
                    </div>
                  </ng-template>

                  <ng-template tableCell="obligadoContabilidad" let-value let-row="row">
                    <div class="flex items-center gap-1.5 font-mono text-xs">
                      <span>{{ value ? 'SÍ' : 'NO' }}</span>
                      @if (row.contribuyenteRimpe) {
                        <ui-badge variant="outline" color="secondary" size="sm">RIMPE</ui-badge>
                      }
                      @if (row.contribuyenteEspecial) {
                        <ui-badge variant="outline" color="primary" size="sm">CE #{{ row.contribuyenteEspecial }}</ui-badge>
                      }
                    </div>
                  </ng-template>

                  <ng-template tableCell="ambiente" let-value>
                    <ui-badge [color]="value === '2' ? 'warning' : 'secondary'" variant="soft" size="sm">
                      {{ value === '2' ? '2 · PRODUCCIÓN' : '1 · PRUEBAS' }}
                    </ui-badge>
                  </ng-template>

                  <ng-template tableCell="tieneCertificado" let-value let-row="row">
                    <div class="flex flex-col items-start">
                      <ui-badge [color]="value ? 'success' : 'destructive'" variant="soft" size="sm" [dot]="true">
                        {{ value ? 'P12 VINCULADO' : 'PENDIENTE P12' }}
                      </ui-badge>
                      @if (row.certificadoValidoHasta) {
                        <span class="font-mono text-[10px] text-[var(--color-muted-foreground)] mt-0.5">
                          Exp: {{ row.certificadoValidoHasta | date:'yyyy-MM-dd' }}
                        </span>
                      }
                    </div>
                  </ng-template>

                  <ng-template tableCell="estado" let-value>
                    <ui-badge [color]="value === 'ACTIVO' ? 'success' : 'secondary'" variant="outline" size="sm">
                      {{ value }}
                    </ui-badge>
                  </ng-template>

                  <ng-template tableCell="Acciones" let-row="row">
                    <ui-button variant="outline" size="xs" (click)="seleccionarEmisor(row)">
                      Ver Puntos & Secuenciales
                    </ui-button>
                  </ng-template>
                </ui-table>
              </ui-card-content>
            </ui-card>
          </div>
        </ui-tab>

        <ui-tab value="secuenciales" label="Puntos de Emisión & Secuenciales">
          <div class="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-5">
              <ui-card variant="outline">
                <ui-card-header>
                  <ui-card-title>Puntos de Emisión (Estab / PtoEmi)</ui-card-title>
                  <ui-card-description>
                    Emisor activo: {{ emisorSeleccionado()?.razonSocial || 'HIGHSTACK LABS ECUADOR S.A.S.' }}
                  </ui-card-description>
                </ui-card-header>
                <ui-card-content class="space-y-3">
                  @for (pe of puntosEmision(); track pe.id) {
                    <div class="p-3.5 border border-[var(--color-border)] bg-[var(--color-muted)]/20 space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="font-mono text-sm font-semibold">
                          Serie {{ pe.establecimiento }}-{{ pe.puntoEmision }}
                        </span>
                        <ui-badge color="success" variant="soft" size="sm">{{ pe.estado }}</ui-badge>
                      </div>
                      <div class="text-xs font-medium">{{ pe.descripcion }}</div>
                      <div class="text-[11px] text-[var(--color-muted-foreground)]">{{ pe.direccion }}</div>
                    </div>
                  }
                </ui-card-content>
              </ui-card>
            </div>

            <div class="lg:col-span-7">
              <ui-card variant="outline">
                <ui-card-header>
                  <ui-card-title>Control de Numeración Secuencial (9 dígitos)</ui-card-title>
                  <ui-card-description>Correlativos automáticos asignados al firmar cada comprobante.</ui-card-description>
                </ui-card-header>
                <ui-card-content>
                  <ui-table [data]="secuenciales()" [columns]="colsSecuenciales" rowKey="id" size="sm">
                    <ng-template tableCell="tipoComprobante" let-value let-row="row">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-xs px-1.5 py-0.5 border border-[var(--color-border)] bg-[var(--color-muted)]">
                          {{ value }}
                        </span>
                        <span class="text-xs font-medium">{{ row.tipoDescripcion }}</span>
                      </div>
                    </ng-template>

                    <ng-template tableCell="ultimoSecuencial" let-value>
                      <span class="font-mono text-xs text-[var(--color-muted-foreground)]">
                        {{ String(value).padStart(9, '0') }}
                      </span>
                    </ng-template>

                    <ng-template tableCell="proximoSecuencial" let-value>
                      <span class="font-mono text-xs font-semibold text-[var(--color-foreground)]">
                        {{ String(value).padStart(9, '0') }}
                      </span>
                    </ng-template>
                  </ui-table>
                </ui-card-content>
              </ui-card>
            </div>
          </div>
        </ui-tab>
      </ui-tabs>

      <!-- Modal Crear Emisor -->
      <ui-modal [(open)]="modalNuevoEmisor" size="md">
        <ui-modal-header>
          <ui-modal-title>Registrar Sociedad Emisora en el SRI</ui-modal-title>
          <ui-modal-description>
            Habilita un nuevo RUC dentro del tenant actual para facturación electrónica.
          </ui-modal-description>
        </ui-modal-header>
        <ui-modal-content>
          <div class="space-y-4">
            <ui-input label="Número de RUC (13 dígitos)" [(value)]="nuevoRuc" placeholder="1790000000001" [required]="true" />
            <ui-input label="Razón Social" [(value)]="nuevaRazonSocial" placeholder="EMPRESA CORPORATIVA S.A." [required]="true" />
            <ui-input label="Nombre Comercial" [(value)]="nuevoNombreComercial" placeholder="Marca Comercial" />
            <ui-input label="Dirección de Matriz" [(value)]="nuevaDireccion" placeholder="Av. Amazonas y Naciones Unidas, Quito" [required]="true" />

            <ui-select label="Ambiente SRI Inicial" [(value)]="nuevoAmbiente">
              <ui-option value="1">1 · Pruebas (CELCER)</ui-option>
              <ui-option value="2">2 · Producción (CEL)</ui-option>
            </ui-select>

            <div class="pt-2 space-y-2">
              <ui-checkbox label="Obligado a llevar contabilidad" [(checked)]="nuevoObligado" />
              <ui-checkbox label="Contribuyente Régimen RIMPE" [(checked)]="nuevoRimpe" />
            </div>
          </div>
        </ui-modal-content>
        <ui-modal-footer>
          <ui-button variant="ghost" size="sm" (click)="modalNuevoEmisor.set(false)">Cancelar</ui-button>
          <ui-button variant="default" size="sm" (click)="guardarEmisor()">Registrar Emisor</ui-button>
        </ui-modal-footer>
      </ui-modal>
    </div>
  `,
})
export class EmisoresComponent implements OnInit {
  private readonly sriApi = inject(SriApiService);
  private readonly toast = inject(ToastService);
  protected readonly String = String;

  readonly tabActiva = signal<string>('emisores');
  readonly emisores = signal<Emisor[]>([]);
  readonly emisorSeleccionado = signal<Emisor | null>(null);
  readonly puntosEmision = signal<PuntoEmision[]>([]);
  readonly secuenciales = signal<Secuencial[]>([]);

  readonly modalNuevoEmisor = signal<boolean>(false);
  readonly nuevoRuc = signal<string>('');
  readonly nuevaRazonSocial = signal<string>('');
  readonly nuevoNombreComercial = signal<string>('');
  readonly nuevaDireccion = signal<string>('');
  readonly nuevoAmbiente = signal<string>('1');
  readonly nuevoObligado = signal<boolean>(true);
  readonly nuevoRimpe = signal<boolean>(false);

  readonly colsEmisores: TableColumn[] = [
    { field: 'ruc', header: 'RUC / Nombre Comercial', sortable: true },
    { field: 'razonSocial', header: 'Razón Social Legal', sortable: true },
    { field: 'obligadoContabilidad', header: 'Contabilidad / Régimen' },
    { field: 'ambiente', header: 'Ambiente' },
    { field: 'tieneCertificado', header: 'Certificado P12' },
    { field: 'estado', header: 'Estado' },
    { header: 'Acciones', align: 'right' },
  ];

  readonly colsSecuenciales: TableColumn[] = [
    { field: 'tipoComprobante', header: 'Tipo de Documento SRI' },
    { field: 'establecimiento', header: 'Estab.' },
    { field: 'puntoEmision', header: 'Pto. Emi.' },
    { field: 'ultimoSecuencial', header: 'Último Emitido', align: 'right' },
    { field: 'proximoSecuencial', header: 'Próximo Correlativo', align: 'right' },
  ];

  ngOnInit(): void {
    this.sriApi.getEmisores().subscribe((res) => {
      this.emisores.set(res.data);
      if (res.data.length > 0) {
        this.cargarDetallesEmisor(res.data[0]);
      }
    });
  }

  cargarDetallesEmisor(emisor: Emisor): void {
    this.emisorSeleccionado.set(emisor);
    this.sriApi.getPuntosEmision(emisor.id).subscribe((pe) => this.puntosEmision.set(pe));
    this.sriApi.getSecuencialesByEmisor(emisor.id).subscribe((sec) => this.secuenciales.set(sec));
  }

  seleccionarEmisor(emisor: Emisor): void {
    this.cargarDetallesEmisor(emisor);
    this.tabActiva.set('secuenciales');
  }

  guardarEmisor(): void {
    if (!this.nuevoRuc() || !this.nuevaRazonSocial()) {
      this.toast.warning('Completa el RUC de 13 dígitos y la Razón Social');
      return;
    }

    this.sriApi
      .createEmisor({
        ruc: this.nuevoRuc(),
        razonSocial: this.nuevaRazonSocial(),
        nombreComercial: this.nuevoNombreComercial(),
        direccionMatriz: this.nuevaDireccion(),
        ambiente: this.nuevoAmbiente(),
        obligadoContabilidad: this.nuevoObligado(),
        contribuyenteRimpe: this.nuevoRimpe(),
      })
      .subscribe((creado) => {
        this.emisores.update((list) => [creado, ...list]);
        this.modalNuevoEmisor.set(false);
        this.toast.success(`Emisor ${creado.ruc} registrado exitosamente`);
      });
  }
}

