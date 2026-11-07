import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardFooterComponent,
  CardHeaderComponent,
  CardTitleComponent,
  DatepickerComponent,
  InputComponent,
  ModalComponent,
  ModalContentComponent,
  ModalDescriptionComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleComponent,
  OptionComponent,
  SegmentedComponent,
  SegmentedOption,
  SelectComponent,
  SeparatorComponent,
  StepItem,
  StepperComponent,
  ToastService,
} from '@highstacklabs2026/ui';
import { Emisor } from '../../core/models/api.models';
import { SriApiService } from '../../core/services/sri-api.service';

interface LineaDetalle {
  id: string;
  codigoPrincipal: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  tarifaIva: number;
}

@Component({
  selector: 'app-emision',
  imports: [
    CommonModule,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    DatepickerComponent,
    InputComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleComponent,
    ModalDescriptionComponent,
    ModalContentComponent,
    ModalFooterComponent,
    SelectComponent,
    OptionComponent,
    SegmentedComponent,
    SeparatorComponent,
    StepperComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Cabecera -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-semibold tracking-tight">Emisión de Comprobante Electrónico</h1>
            <ui-badge variant="outline" color="primary" size="sm">ESQUEMA XSD v2.1.0</ui-badge>
          </div>
          <p class="text-xs text-[var(--color-muted-foreground)] mt-1">
            Generación de XML, firma criptográfica XAdES-BES y transmisión síncrona/asíncrona a los Web Services del SRI.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <ui-button variant="outline" size="sm" (click)="previsualizarXml()">
            Previsualizar XML SRI
          </ui-button>
          <ui-button variant="default" size="sm" [loading]="emitiendo()" (click)="emitirComprobante()">
            Firmar y Transmitir al SRI
          </ui-button>
        </div>
      </div>

      <!-- Selector de Tipo de Comprobante + Stepper -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div class="lg:col-span-5">
          <ui-segmented
            size="sm"
            [fullWidth]="true"
            [options]="tiposDocOptions"
            [(value)]="tipoDocumento"
          />
        </div>
        <div class="lg:col-span-7">
          <ui-stepper [(active)]="pasoActivo" [steps]="steps" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Columna Principal del Formulario -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Sección 1: Emisor y Serie -->
          <ui-card variant="outline">
            <ui-card-header>
              <div class="flex items-center justify-between">
                <ui-card-title>1. Identificación del Emisor y Punto de Emisión</ui-card-title>
                <span class="font-mono text-xs text-[var(--color-muted-foreground)]">COD DOC: {{ tipoDocumento() }}</span>
              </div>
            </ui-card-header>
            <ui-card-content>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="sm:col-span-2">
                  <ui-select label="Sociedad Emisora (RUC)" size="sm" [(value)]="rucEmisorSeleccionado">
                    @for (e of emisores(); track e.id) {
                      <ui-option [value]="e.ruc">{{ e.ruc }} — {{ e.razonSocial }}</ui-option>
                    }
                  </ui-select>
                </div>

                <ui-input
                  label="Establecimiento"
                  size="sm"
                  [(value)]="establecimiento"
                  placeholder="001"
                />

                <ui-input
                  label="Punto de Emisión"
                  size="sm"
                  [(value)]="puntoEmision"
                  placeholder="001"
                />

                <div class="sm:col-span-2">
                  <ui-datepicker
                    label="Fecha de Emisión Fiscal"
                    size="sm"
                    [(value)]="fechaIso"
                  />
                </div>

                <div class="sm:col-span-2">
                  <ui-select label="Forma de Pago SRI (Tabla 24)" size="sm" [(value)]="formaPago">
                    <ui-option value="20">20 · Otros con utilización del sistema financiero</ui-option>
                    <ui-option value="01">01 · Sin utilización del sistema financiero (Efectivo)</ui-option>
                    <ui-option value="19">19 · Tarjeta de Crédito</ui-option>
                    <ui-option value="16">16 · Tarjeta de Débito</ui-option>
                  </ui-select>
                </div>
              </div>
            </ui-card-content>
          </ui-card>

          <!-- Sección 2: Datos del Adquirente / Receptor -->
          <ui-card variant="outline">
            <ui-card-header>
              <ui-card-title>2. Datos del Adquirente / Sujeto Fiscal</ui-card-title>
              <ui-card-description>Información tributaria para validación en el esquema del SRI.</ui-card-description>
            </ui-card-header>
            <ui-card-content>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ui-select label="Tipo de Identificación" size="sm" [(value)]="tipoIdentificacion">
                  <ui-option value="04">04 · RUC (13 dígitos)</ui-option>
                  <ui-option value="05">05 · Cédula de Identidad (10 dígitos)</ui-option>
                  <ui-option value="06">06 · Pasaporte</ui-option>
                  <ui-option value="07">07 · Venta a Consumidor Final</ui-option>
                </ui-select>

                <ui-input
                  label="Número de Identificación"
                  size="sm"
                  [(value)]="identificacionComprador"
                  placeholder="1790016919001"
                />

                <ui-input
                  label="Correo para Envío RIDE/XML"
                  type="email"
                  size="sm"
                  [(value)]="emailComprador"
                  placeholder="facturacion@cliente.com"
                />

                <div class="sm:col-span-2">
                  <ui-input
                    label="Razón Social / Apellidos y Nombres"
                    size="sm"
                    [(value)]="razonSocialComprador"
                    placeholder="CORPORACION FAVORITA C.A."
                  />
                </div>

                <ui-input
                  label="Dirección Fiscal"
                  size="sm"
                  [(value)]="direccionComprador"
                  placeholder="Av. General Enríquez, Quito"
                />
              </div>
            </ui-card-content>
          </ui-card>

          <!-- Sección 3: Líneas de Detalle e Impuestos -->
          <ui-card variant="outline">
            <ui-card-header>
              <div class="flex items-center justify-between">
                <div>
                  <ui-card-title>3. Detalle de Conceptos e Impuestos</ui-card-title>
                  <ui-card-description>Cálculo automático de bases imponibles e IVA vigente (15% / 0%).</ui-card-description>
                </div>
                <ui-button variant="outline" size="xs" (click)="agregarItem()">
                  + Añadir Concepto
                </ui-button>
              </div>
            </ui-card-header>
            <ui-card-content class="space-y-3">
              <div class="border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                @for (item of items(); track item.id; let idx = $index) {
                  <div class="p-3 bg-[var(--color-background)] space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div class="sm:col-span-2">
                        <ui-input
                          label="Código"
                          size="sm"
                          [value]="item.codigoPrincipal"
                          (valueChange)="actualizarItem(idx, 'codigoPrincipal', $event)"
                        />
                      </div>
                      <div class="sm:col-span-4">
                        <ui-input
                          label="Descripción del Bien / Servicio"
                          size="sm"
                          [value]="item.descripcion"
                          (valueChange)="actualizarItem(idx, 'descripcion', $event)"
                        />
                      </div>
                      <div class="sm:col-span-2">
                        <ui-input
                          label="Cantidad"
                          type="number"
                          size="sm"
                          [value]="String(item.cantidad)"
                          (valueChange)="actualizarItemNumero(idx, 'cantidad', $event)"
                        />
                      </div>
                      <div class="sm:col-span-2">
                        <ui-input
                          label="P. Unitario"
                          type="number"
                          size="sm"
                          [value]="String(item.precioUnitario)"
                          (valueChange)="actualizarItemNumero(idx, 'precioUnitario', $event)"
                        />
                      </div>
                      <div class="sm:col-span-2 flex items-center justify-between gap-2 pb-1">
                        <div class="text-right font-mono text-xs">
                          <div class="text-[10px] text-[var(--color-muted-foreground)]">Subtotal</div>
                          <div class="font-semibold">
                            {{ (item.cantidad * item.precioUnitario - item.descuento) | currency:'USD' }}
                          </div>
                        </div>
                        @if (items().length > 1) {
                          <ui-button variant="ghost" size="xs" (click)="eliminarItem(idx)">✕</ui-button>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </ui-card-content>
          </ui-card>
        </div>

        <!-- Columna Derecha: Liquidación Tributaria y Firma -->
        <div class="lg:col-span-4 space-y-6">
          <ui-card variant="outline">
            <ui-card-header>
              <ui-card-title>Liquidación Fiscal SRI</ui-card-title>
              <ui-card-description>Resumen financiero del comprobante.</ui-card-description>
            </ui-card-header>
            <ui-card-content class="space-y-4">
              <div class="space-y-2 text-xs font-mono">
                <div class="flex justify-between py-1 border-b border-[var(--color-border)]">
                  <span class="text-[var(--color-muted-foreground)]">SUBTOTAL IVA 15%:</span>
                  <span>{{ subtotalIva15() | currency:'USD' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-[var(--color-border)]">
                  <span class="text-[var(--color-muted-foreground)]">SUBTOTAL IVA 0%:</span>
                  <span>$0.00</span>
                </div>
                <div class="flex justify-between py-1 border-b border-[var(--color-border)]">
                  <span class="text-[var(--color-muted-foreground)]">TOTAL DESCUENTO:</span>
                  <span>{{ totalDescuento() | currency:'USD' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-[var(--color-border)]">
                  <span class="text-[var(--color-muted-foreground)]">IVA 15% (CÓD. 4):</span>
                  <span>{{ totalIva() | currency:'USD' }}</span>
                </div>
                <div class="flex justify-between py-2 text-base font-semibold">
                  <span>VALOR TOTAL:</span>
                  <span>{{ totalGeneral() | currency:'USD' }}</span>
                </div>
              </div>

              <ui-separator />

              <div class="p-3 border border-[var(--color-border)] bg-[var(--color-muted)]/30 space-y-1.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-[11px] text-[var(--color-muted-foreground)]">CERTIFICADO P12</span>
                  <ui-badge color="success" variant="soft" size="sm">LISTO</ui-badge>
                </div>
                <div class="font-mono text-[11px] truncate">
                  RUC: {{ rucEmisorSeleccionado() }}
                </div>
                <div class="text-[11px] text-[var(--color-muted-foreground)]">
                  El XML se firmará con estándar XAdES-BES y se enviará al ambiente {{ sriApi.activeAmbiente() === '2' ? 'PRODUCCIÓN' : 'PRUEBAS' }}.
                </div>
              </div>
            </ui-card-content>
            <ui-card-footer>
              <ui-button variant="default" [full]="true" [loading]="emitiendo()" (click)="emitirComprobante()">
                Firmar y Emitir Comprobante
              </ui-button>
            </ui-card-footer>
          </ui-card>
        </div>
      </div>

      <!-- Modal de Previsualización XML -->
      <ui-modal [(open)]="xmlModalOpen" size="lg">
        <ui-modal-header>
          <ui-modal-title>Previsualización Estructura XML SRI (v2.1.0)</ui-modal-title>
          <ui-modal-description>
            Documento generado antes de inyectar el bloque ds:Signature XAdES-BES.
          </ui-modal-description>
        </ui-modal-header>
        <ui-modal-content>
          <pre class="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-[var(--color-border)] leading-relaxed">{{ xmlPreview() }}</pre>
        </ui-modal-content>
        <ui-modal-footer>
          <ui-button variant="outline" size="sm" (click)="xmlModalOpen.set(false)">Cerrar</ui-button>
          <ui-button variant="default" size="sm" (click)="xmlModalOpen.set(false); emitirComprobante()">
            Proceder a Firmar y Enviar
          </ui-button>
        </ui-modal-footer>
      </ui-modal>
    </div>
  `,
})
export class EmisionComponent implements OnInit {
  readonly sriApi = inject(SriApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly String = String;

  readonly emisores = signal<Emisor[]>([]);
  readonly rucEmisorSeleccionado = signal<string>('1793148201001');
  readonly establecimiento = signal<string>('001');
  readonly puntoEmision = signal<string>('001');
  readonly fechaIso = signal<string>('2026-11-06');
  readonly formaPago = signal<string>('20');

  readonly tipoDocumento = signal<string>('01');
  readonly pasoActivo = signal<number>(0);

  readonly tipoIdentificacion = signal<string>('04');
  readonly identificacionComprador = signal<string>('1790016919001');
  readonly razonSocialComprador = signal<string>('CORPORACION FAVORITA C.A.');
  readonly emailComprador = signal<string>('recepcion.facturas@favorita.com');
  readonly direccionComprador = signal<string>('Av. General Enríquez, Sangolquí - Quito');

  readonly items = signal<LineaDetalle[]>([
    {
      id: 'item-1',
      codigoPrincipal: 'HS-API-PRO',
      descripcion: 'Suscripción Mensual Pasarela Facturación Electrónica SRI Multi-Tenant',
      cantidad: 1,
      precioUnitario: 450.0,
      descuento: 0,
      tarifaIva: 15,
    },
  ]);

  readonly emitiendo = signal<boolean>(false);
  readonly xmlModalOpen = signal<boolean>(false);
  readonly xmlPreview = signal<string>('');

  readonly tiposDocOptions: SegmentedOption[] = [
    { value: '01', label: '01 · Factura' },
    { value: '04', label: '04 · Nota Crédito' },
    { value: '07', label: '07 · Retención' },
    { value: '06', label: '06 · Guía' },
  ];

  readonly steps: StepItem[] = [
    { label: '1. Emisor & Serie' },
    { label: '2. Receptor Fiscal' },
    { label: '3. firma XAdES-BES' },
  ];

  readonly subtotalIva15 = computed(() =>
    this.items().reduce((acc, i) => acc + (i.cantidad * i.precioUnitario - i.descuento), 0),
  );

  readonly totalDescuento = computed(() =>
    this.items().reduce((acc, i) => acc + Number(i.descuento || 0), 0),
  );

  readonly totalIva = computed(() => +(this.subtotalIva15() * 0.15).toFixed(2));
  readonly totalGeneral = computed(() => +(this.subtotalIva15() + this.totalIva()).toFixed(2));

  ngOnInit(): void {
    this.sriApi.getEmisores().subscribe((res) => {
      this.emisores.set(res.data);
      if (res.data.length > 0) {
        this.rucEmisorSeleccionado.set(res.data[0].ruc);
      }
    });
  }

  agregarItem(): void {
    this.items.update((list) => [
      ...list,
      {
        id: `item-${Date.now()}`,
        codigoPrincipal: `SRV-0${list.length + 1}`,
        descripcion: 'Servicio de Consultoría e Integración API',
        cantidad: 1,
        precioUnitario: 120.0,
        descuento: 0,
        tarifaIva: 15,
      },
    ]);
  }

  eliminarItem(idx: number): void {
    this.items.update((list) => list.filter((_, i) => i !== idx));
  }

  actualizarItem(idx: number, field: 'codigoPrincipal' | 'descripcion', val: string): void {
    this.items.update((list) =>
      list.map((item, i) => (i === idx ? { ...item, [field]: val } : item)),
    );
  }

  actualizarItemNumero(idx: number, field: 'cantidad' | 'precioUnitario', val: string): void {
    const num = Math.max(0, Number(val) || 0);
    this.items.update((list) =>
      list.map((item, i) => (i === idx ? { ...item, [field]: num } : item)),
    );
  }

  private construirDto() {
    const emisorObj =
      this.emisores().find((e) => e.ruc === this.rucEmisorSeleccionado()) || this.emisores()[0];

    const [yyyy, mm, dd] = (this.fechaIso() || '2026-11-06').split('-');
    const fechaEmisionSri = `${dd}/${mm}/${yyyy}`;

    return {
      ambiente: this.sriApi.activeAmbiente(),
      tipoEmision: '1',
      fechaEmision: fechaEmisionSri,
      emisor: {
        ruc: emisorObj?.ruc || this.rucEmisorSeleccionado(),
        razonSocial: emisorObj?.razonSocial || 'HIGHSTACK LABS ECUADOR S.A.S.',
        nombreComercial: emisorObj?.nombreComercial || 'HighStack',
        dirMatriz: emisorObj?.direccionMatriz || 'Quito, Ecuador',
        establecimiento: this.establecimiento(),
        puntoEmision: this.puntoEmision(),
        obligadoContabilidad: emisorObj?.obligadoContabilidad ? 'SI' : 'NO',
      },
      comprador: {
        tipoIdentificacion: this.tipoIdentificacion(),
        identificacion: this.identificacionComprador(),
        razonSocial: this.razonSocialComprador(),
        direccion: this.direccionComprador(),
        email: this.emailComprador(),
      },
      detalles: this.items().map((item) => {
        const base = +(item.cantidad * item.precioUnitario - item.descuento).toFixed(2);
        const valorIva = +(base * 0.15).toFixed(2);
        return {
          codigoPrincipal: item.codigoPrincipal,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          descuento: item.descuento,
          impuestos: [
            {
              codigo: '2',
              codigoPorcentaje: '4',
              tarifa: 15,
              baseImponible: base,
              valor: valorIva,
            },
          ],
        };
      }),
      pagos: [
        {
          formaPago: this.formaPago(),
          total: this.totalGeneral(),
          plazo: 30,
          unidadTiempo: 'dias',
        },
      ],
      infoAdicional: [
        { nombre: 'Email', valor: this.emailComprador() },
        { nombre: 'Dirección', valor: this.direccionComprador() },
      ],
      _totals: {
        subtotal: this.subtotalIva15(),
        iva: this.totalIva(),
        total: this.totalGeneral(),
      },
    };
  }

  previsualizarXml(): void {
    const dto = this.construirDto();
    this.sriApi.previewFacturaXml(dto).subscribe((res) => {
      this.xmlPreview.set(res.xml);
      this.xmlModalOpen.set(true);
    });
  }

  emitirComprobante(): void {
    this.emitiendo.set(true);
    this.pasoActivo.set(2);
    const dto = this.construirDto();

    this.sriApi.emitirFactura(dto).subscribe({
      next: (res) => {
        this.emitiendo.set(false);
        this.toast.success(
          `Comprobante ${res.estado || 'AUTORIZADO'} · Clave: ${res.claveAcceso?.slice(0, 15)}...`,
        );
        void this.router.navigate(['/comprobantes']);
      },
      error: () => {
        this.emitiendo.set(false);
        this.toast.error('Error al emitir el comprobante ante el SRI');
      },
    });
  }
}
