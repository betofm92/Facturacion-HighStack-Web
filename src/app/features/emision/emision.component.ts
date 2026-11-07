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
  LabelComponent,
  ModalComponent,
  ModalContentComponent,
  ModalDescriptionComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleComponent,
  OptionComponent,
  PhoneInputComponent,
  RadioComponent,
  RadioGroupComponent,
  SegmentedComponent,
  SegmentedOption,
  SelectComponent,
  SeparatorComponent,
  SpinnerComponent,
  StepItem,
  StepperComponent,
  SwitchComponent,
  TextareaComponent,
  TimepickerComponent,
  TimezoneSelectComponent,
  ToastService,
  checkE164,
} from '@highstacklabs2026/ui';
import { ConsultaContribuyenteResponse, Emisor } from '../../core/models/api.models';
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
    LabelComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleComponent,
    ModalDescriptionComponent,
    ModalContentComponent,
    ModalFooterComponent,
    SelectComponent,
    OptionComponent,
    PhoneInputComponent,
    RadioGroupComponent,
    RadioComponent,
    SegmentedComponent,
    SeparatorComponent,
    SpinnerComponent,
    StepperComponent,
    SwitchComponent,
    TextareaComponent,
    TimepickerComponent,
    TimezoneSelectComponent,
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
          <ui-button
            variant="default"
            size="sm"
            [loading]="emitiendo()"
            [disabled]="bloqueoEmision()"
            (click)="emitirComprobante()"
          >
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

                <ui-datepicker
                  label="Fecha de Emisión Fiscal"
                  size="sm"
                  [(value)]="fechaIso"
                />

                <ui-timepicker
                  label="Hora de Emisión (24h)"
                  size="sm"
                  [hourFormat]="24"
                  [minuteStep]="5"
                  [(value)]="horaEmision"
                />

                <div class="sm:col-span-2">
                  <ui-timezone-select
                    label="Zona Horaria Fiscal (IANA)"
                    size="sm"
                    modalTitle="Zona Horaria de Emisión"
                    [(value)]="zonaHoraria"
                  />
                </div>

                <div class="sm:col-span-4">
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
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <ui-card-title>2. Datos del Adquirente / Sujeto Fiscal</ui-card-title>
                  <ui-card-description>Información tributaria para validación en el esquema del SRI.</ui-card-description>
                </div>

                <div class="flex items-center gap-2">
                  @if (consultandoSri()) {
                    <div class="flex items-center gap-1.5 text-xs font-mono text-[var(--color-muted-foreground)]">
                      <ui-spinner size="sm" />
                      <span>Consultando Catastro SRI…</span>
                    </div>
                  } @else if (badgeConfirmacionSri()) {
                    <ui-badge color="success" variant="soft" size="sm" [dot]="true">
                      {{ badgeConfirmacionSri() }}
                    </ui-badge>
                  }
                </div>
              </div>
            </ui-card-header>
            <ui-card-content class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                <div class="sm:col-span-4">
                  <ui-select
                    label="Tipo de Identificación"
                    size="sm"
                    [value]="tipoIdentificacion()"
                    (valueChange)="onTipoIdentificacionChange($event)"
                  >
                    <ui-option value="04">04 · RUC (13 dígitos)</ui-option>
                    <ui-option value="05">05 · Cédula de Identidad (10 dígitos)</ui-option>
                    <ui-option value="06">06 · Pasaporte</ui-option>
                    <ui-option value="07">07 · Venta a Consumidor Final</ui-option>
                  </ui-select>
                </div>

                <div class="sm:col-span-4">
                  <ui-label for="identificacion-comprador-input">Número de Identificación</ui-label>
                  <div class="flex items-start gap-2">
                    <div class="flex-1 min-w-0">
                      <ui-input
                        id="identificacion-comprador-input"
                        size="sm"
                        [value]="identificacionComprador()"
                        (valueChange)="onIdentificacionChange($event)"
                        [error]="errorIdentificacion()"
                        [hint]="!errorIdentificacion() && estadoDetalleSri() ? estadoDetalleSri() : ''"
                        placeholder="Ej: 0750138141001"
                      />
                    </div>
                    <ui-button
                      variant="outline"
                      size="sm"
                      class="shrink-0"
                      [loading]="consultandoSri()"
                      (click)="validarIdentificacionManual()"
                    >
                      Validar
                    </ui-button>
                  </div>
                </div>

                <div class="sm:col-span-4">
                  <ui-input
                    label="Correo para Envío RIDE/XML"
                    type="email"
                    size="sm"
                    [(value)]="emailComprador"
                    placeholder="facturacion@cliente.com"
                  />
                </div>

                <div class="sm:col-span-8">
                  <ui-input
                    label="Razón Social / Apellidos y Nombres"
                    size="sm"
                    [(value)]="razonSocialComprador"
                    placeholder="CORPORACION FAVORITA C.A."
                  />
                </div>

                <div class="sm:col-span-4">
                  <ui-phone-input
                    label="Teléfono Contacto (E.164)"
                    locale="es-EC"
                    defaultCountry="EC"
                    [preferredCountries]="['EC', 'CO', 'PE', 'US']"
                    size="sm"
                    [(value)]="telefonoComprador"
                    (countryChange)="paisComprador.set($event)"
                  />
                </div>

                <div class="sm:col-span-12">
                  <ui-input
                    label="Dirección Fiscal"
                    size="sm"
                    [(value)]="direccionComprador"
                    placeholder="EL ORO / MACHALA / JULIO MAYORGA G SN Y BOLIVAR PAREDES"
                  />
                </div>

                @if (datosCatastroSri(); as infoSri) {
                  @if (infoSri.tipoContribuyente || infoSri.regimen || infoSri.nombreComercial || infoSri.actividadEconomica) {
                    <div class="sm:col-span-12 p-3 border border-[var(--color-border)] bg-[var(--color-muted)]/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
                      @if (infoSri.nombreComercial) {
                        <div>
                          <span class="block text-[10px] uppercase text-[var(--color-muted-foreground)]">Nombre Comercial</span>
                          <span class="font-medium text-[var(--color-foreground)]">{{ infoSri.nombreComercial }}</span>
                        </div>
                      }
                      @if (infoSri.tipoContribuyente) {
                        <div>
                          <span class="block text-[10px] uppercase text-[var(--color-muted-foreground)]">Tipo Contribuyente</span>
                          <span class="font-medium text-[var(--color-foreground)]">{{ infoSri.tipoContribuyente }}</span>
                        </div>
                      }
                      @if (infoSri.regimen) {
                        <div>
                          <span class="block text-[10px] uppercase text-[var(--color-muted-foreground)]">Régimen / Contabilidad</span>
                          <span class="font-medium text-[var(--color-foreground)]">
                            {{ infoSri.regimen }} · Obligado: {{ infoSri.obligadoContabilidad || 'NO' }}
                          </span>
                        </div>
                      }
                      @if (infoSri.actividadEconomica) {
                        <div class="sm:col-span-2 lg:col-span-1">
                          <span class="block text-[10px] uppercase text-[var(--color-muted-foreground)]">Actividad Económica</span>
                          <span class="font-medium text-[var(--color-foreground)] line-clamp-1" [title]="infoSri.actividadEconomica">
                            {{ infoSri.actividadEconomica }}
                          </span>
                        </div>
                      }
                    </div>
                  }
                }

                <div class="sm:col-span-12">
                  <ui-textarea
                    label="Observaciones / Glosa Adicional (RIDE)"
                    [rows]="2"
                    [autoGrow]="true"
                    [(value)]="observacionesRide"
                    placeholder="Ej: Orden de Compra #OC-2026-99412 · Condiciones de entrega..."
                    hint="Se inyecta automáticamente como campo adicional en el XML y RIDE PDF."
                  />
                </div>
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

              <!-- Modo de Transmisión SOAP (RadioGroup) -->
              <div class="space-y-2">
                <ui-label>Modo de Despacho SOAP SRI</ui-label>
                <ui-radio-group [(value)]="modoDespacho" appearance="card" orientation="vertical" size="sm">
                  <ui-radio
                    value="sincrono"
                    label="Recepción + Autorización Síncrona"
                    description="Espera respuesta inmediata del WS SRI (~2s)"
                  />
                  <ui-radio
                    value="cola"
                    label="Cola Asíncrona BullMQ / Redis"
                    description="Encola firma y notifica vía Webhook HMAC"
                  />
                </ui-radio-group>
              </div>

              <ui-switch
                label="Notificar RIDE PDF + XML por correo"
                description="Envío automático al autorizar"
                size="sm"
                [(checked)]="notificarPorCorreo"
              />

              <ui-separator />

              <div class="p-3 border border-[var(--color-border)] bg-[var(--color-muted)]/30 space-y-1.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-[11px] text-[var(--color-muted-foreground)]">CERTIFICADO P12</span>
                  <ui-badge color="success" variant="soft" size="sm">LISTO</ui-badge>
                </div>
                <div class="font-mono text-[11px] truncate">
                  RUC: {{ rucEmisorSeleccionado() }} · {{ horaEmision() }} ({{ zonaHoraria() }})
                </div>
                <div class="text-[11px] text-[var(--color-muted-foreground)]">
                  El XML se firmará con estándar XAdES-BES y se enviará al ambiente {{ sriApi.activeAmbiente() === '2' ? 'PRODUCCIÓN' : 'PRUEBAS' }}.
                </div>
              </div>
            </ui-card-content>
            <ui-card-footer>
              <ui-button
                variant="default"
                [full]="true"
                [loading]="emitiendo()"
                [disabled]="bloqueoEmision()"
                (click)="emitirComprobante()"
              >
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
  readonly fechaIso = signal<string>(EmisionComponent.obtenerFechaLocalIso());
  readonly horaEmision = signal<string>(EmisionComponent.obtenerHoraLocal24());
  readonly zonaHoraria = signal<string>('America/Guayaquil');
  readonly formaPago = signal<string>('20');

  private static obtenerFechaLocalIso(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private static obtenerHoraLocal24(): string {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
  }

  readonly tipoDocumento = signal<string>('01');
  readonly pasoActivo = signal<number>(0);
  readonly modoDespacho = signal<string>('sincrono');
  readonly notificarPorCorreo = signal<boolean>(true);

  readonly tipoIdentificacion = signal<string>('04');
  readonly identificacionComprador = signal<string>('1790016919001');
  readonly razonSocialComprador = signal<string>('CORPORACION FAVORITA C.A.');
  readonly emailComprador = signal<string>('recepcion.facturas@favorita.com');
  readonly telefonoComprador = signal<string>('+593987654321');
  readonly paisComprador = signal<string>('EC');
  readonly direccionComprador = signal<string>('Av. General Enríquez, Sangolquí - Quito');
  readonly observacionesRide = signal<string>('Orden de Compra corporativa · Emisión electrónica XAdES-BES');

  readonly consultandoSri = signal<boolean>(false);
  readonly errorIdentificacion = signal<string>('');
  readonly badgeConfirmacionSri = signal<string>('RUC ACTIVO EN SRI');
  readonly estadoDetalleSri = signal<string>('Verificado en Catastro SRI');
  readonly identificacionValida = signal<boolean>(true);
  readonly datosCatastroSri = signal<ConsultaContribuyenteResponse | null>(null);
  private consultaSeq = 0;

  readonly telefonoInvalido = computed(() => {
    const tel = this.telefonoComprador();
    return tel !== '' && checkE164(tel) !== 'ok';
  });

  readonly bloqueoEmision = computed(
    () =>
      this.telefonoInvalido() ||
      !this.identificacionValida() ||
      Boolean(this.errorIdentificacion()) ||
      this.consultandoSri(),
  );

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
    { label: '3. Firma XAdES-BES' },
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

  onTipoIdentificacionChange(tipo: string): void {
    this.tipoIdentificacion.set(tipo);
    this.errorIdentificacion.set('');

    if (tipo === '07') {
      this.identificacionComprador.set('9999999999999');
      this.razonSocialComprador.set('CONSUMIDOR FINAL');
      this.badgeConfirmacionSri.set('CONSUMIDOR FINAL');
      this.estadoDetalleSri.set('Identificación estándar SRI Consumidor Final');
      this.identificacionValida.set(true);
      return;
    }

    const actual = this.identificacionComprador().trim();
    if (tipo === '06') {
      const ok = actual.length >= 5 && actual.length <= 20;
      this.identificacionValida.set(ok);
      this.badgeConfirmacionSri.set(ok ? 'PASAPORTE VÁLIDO' : '');
      this.estadoDetalleSri.set('');
      if (!ok && actual.length > 0) {
        this.errorIdentificacion.set('El pasaporte debe tener entre 5 y 20 caracteres');
      }
      return;
    }

    this.onIdentificacionChange(actual);
  }

  onIdentificacionChange(valor: string): void {
    this.identificacionComprador.set(valor);
    const trimmed = String(valor || '').trim();

    if (!trimmed) {
      this.consultaSeq++;
      this.consultandoSri.set(false);
      this.datosCatastroSri.set(null);
      this.badgeConfirmacionSri.set('');
      this.estadoDetalleSri.set('Ingrese 10 dígitos (Cédula) o 13 dígitos (RUC)');
      this.errorIdentificacion.set('');
      this.identificacionValida.set(false);
      return;
    }

    // Caso 1: Consumidor Final (9999999999999)
    if (trimmed === '9999999999999') {
      this.consultaSeq++;
      this.consultandoSri.set(false);
      this.datosCatastroSri.set(null);
      this.tipoIdentificacion.set('07');
      this.razonSocialComprador.set('CONSUMIDOR FINAL');
      this.direccionComprador.set('ECUADOR');
      this.errorIdentificacion.set('');
      this.badgeConfirmacionSri.set('CONSUMIDOR FINAL');
      this.estadoDetalleSri.set('Identificación estándar del SRI para Consumidor Final');
      this.identificacionValida.set(true);
      return;
    }

    // Caso 2: 10 dígitos numéricos -> Cédula (05) + consulta automática al SRI
    if (/^\d{10}$/.test(trimmed)) {
      this.tipoIdentificacion.set('05');
      this.ejecutarConsultaSri(trimmed);
      return;
    }

    // Caso 3: 13 dígitos numéricos (distinto de 9999999999999) -> RUC (04) + consulta automática al SRI
    if (/^\d{13}$/.test(trimmed)) {
      this.tipoIdentificacion.set('04');
      this.ejecutarConsultaSri(trimmed);
      return;
    }

    // Si es Pasaporte (06) y contiene letras o longitud válida
    if (this.tipoIdentificacion() === '06' && !/^\d+$/.test(trimmed)) {
      const ok = trimmed.length >= 5 && trimmed.length <= 20;
      this.datosCatastroSri.set(null);
      this.identificacionValida.set(ok);
      this.errorIdentificacion.set(ok ? '' : 'El pasaporte debe tener entre 5 y 20 caracteres');
      this.badgeConfirmacionSri.set(ok ? 'PASAPORTE VÁLIDO' : '');
      this.estadoDetalleSri.set('');
      return;
    }

    // Mientras escribe una longitud incompleta o inválida para Cédula (10) / RUC (13)
    this.consultaSeq++;
    this.consultandoSri.set(false);
    this.datosCatastroSri.set(null);
    this.badgeConfirmacionSri.set('');
    this.estadoDetalleSri.set('Ingrese 10 dígitos (Cédula) o 13 dígitos (RUC) para consultar en SRI');
    this.identificacionValida.set(false);
    if (trimmed.length > 13 || (trimmed.length > 0 && !/^\d+$/.test(trimmed) && this.tipoIdentificacion() !== '06')) {
      this.errorIdentificacion.set('La identificación para RUC/Cédula debe contener 10 o 13 dígitos numéricos');
    } else {
      this.errorIdentificacion.set('');
    }
  }

  validarIdentificacionManual(): void {
    const trimmed = this.identificacionComprador().trim();
    if (!trimmed) {
      this.errorIdentificacion.set('Debe proporcionar un número de RUC o Cédula');
      this.identificacionValida.set(false);
      this.badgeConfirmacionSri.set('');
      return;
    }

    if (trimmed === '9999999999999') {
      this.onIdentificacionChange(trimmed);
      return;
    }

    if (/^\d{10}$/.test(trimmed)) {
      this.tipoIdentificacion.set('05');
    } else if (/^\d{13}$/.test(trimmed)) {
      this.tipoIdentificacion.set('04');
    }

    this.ejecutarConsultaSri(trimmed);
  }

  private ejecutarConsultaSri(identificacion: string): void {
    const reqId = ++this.consultaSeq;
    this.consultandoSri.set(true);
    this.errorIdentificacion.set('');
    this.badgeConfirmacionSri.set('');
    this.estadoDetalleSri.set('Verificando en Catastro del SRI…');

    this.sriApi.consultarContribuyente(identificacion).subscribe({
      next: (rawRes: ConsultaContribuyenteResponse) => {
        if (reqId !== this.consultaSeq) return;
        this.consultandoSri.set(false);

        const res: ConsultaContribuyenteResponse = (rawRes as any)?.data ?? rawRes;

        if (res.tipoIdentificacion) {
          this.tipoIdentificacion.set(res.tipoIdentificacion);
        }

        if (!res.formatoValido || !res.existeEnSri) {
          this.datosCatastroSri.set(null);
          this.identificacionValida.set(false);
          this.badgeConfirmacionSri.set('');
          this.estadoDetalleSri.set('');
          this.errorIdentificacion.set(
            res.errorValidacion ||
              res.mensaje ||
              'Identificación inválida o no consta en el Catastro del SRI',
          );
          return;
        }

        this.datosCatastroSri.set(res);
        this.identificacionValida.set(true);
        this.errorIdentificacion.set('');

        if (res.tipoIdentificacion === '07') {
          this.badgeConfirmacionSri.set('CONSUMIDOR FINAL');
        } else if (res.tipoIdentificacion === '05') {
          this.badgeConfirmacionSri.set(
            res.estadoContribuyente
              ? `CÉDULA ${res.estadoContribuyente} EN SRI`
              : 'CÉDULA VÁLIDA',
          );
        } else {
          this.badgeConfirmacionSri.set(
            res.estadoContribuyente
              ? `RUC ${res.estadoContribuyente} EN SRI`
              : 'RUC ACTIVO EN SRI',
          );
        }

        this.estadoDetalleSri.set(res.mensaje || 'Verificado en Catastro SRI');

        if (res.razonSocial) {
          this.razonSocialComprador.set(res.razonSocial);
        }
        if (res.direccionMatriz) {
          this.direccionComprador.set(res.direccionMatriz);
        }
        if (res.emailSugerido) {
          this.emailComprador.set(res.emailSugerido);
        }
        if (res.telefonoSugerido) {
          this.telefonoComprador.set(res.telefonoSugerido);
        }
      },
      error: (err) => {
        if (reqId !== this.consultaSeq) return;
        this.consultandoSri.set(false);
        this.datosCatastroSri.set(null);
        this.identificacionValida.set(false);
        this.badgeConfirmacionSri.set('');
        this.estadoDetalleSri.set('');
        const msg =
          err?.error?.message ||
          'No se pudo validar la identificación en el servidor SRI';
        this.errorIdentificacion.set(Array.isArray(msg) ? msg.join(', ') : msg);
      },
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

    const rawFecha = (this.fechaIso() || EmisionComponent.obtenerFechaLocalIso()).trim();
    const fechaEmisionSri = /^\d{2}\/\d{2}\/\d{4}$/.test(rawFecha)
      ? rawFecha
      : (() => {
          const [yyyy, mm, dd] = rawFecha.split('-');
          return `${dd}/${mm}/${yyyy}`;
        })();

    const infoAdicional: Array<{ nombre: string; valor: string }> = [];
    if (this.observacionesRide().trim()) {
      infoAdicional.push({ nombre: 'Observaciones', valor: this.observacionesRide().trim() });
    }
    infoAdicional.push({
      nombre: 'Timbrado',
      valor: `${this.horaEmision() || EmisionComponent.obtenerHoraLocal24()} (${this.zonaHoraria()})`,
    });

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
        identificacion: this.identificacionComprador().trim(),
        razonSocial: this.razonSocialComprador().trim(),
        direccion: this.direccionComprador().trim() || undefined,
        email: this.emailComprador().trim() || undefined,
        telefono: this.telefonoComprador().trim() || undefined,
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
      infoAdicional,
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
    if (!this.identificacionValida() || this.errorIdentificacion()) {
      this.toast.warning(
        this.errorIdentificacion() ||
          'Ingresa un RUC (13 dígitos) o Cédula (10 dígitos) válida antes de emitir',
      );
      return;
    }
    if (this.telefonoInvalido()) {
      this.toast.warning('Verifica la longitud del número telefónico E.164 antes de emitir');
      return;
    }
    this.emitiendo.set(true);
    this.pasoActivo.set(2);
    const dto = this.construirDto();

    this.sriApi.emitirFactura(dto).subscribe({
      next: (res) => {
        this.emitiendo.set(false);
        const payload = res?.data ?? res;
        this.toast.success(
          `Comprobante ${payload?.estado || 'PROCESADO'} · Clave: ${(payload?.claveAcceso || '').slice(0, 15)}...`,
        );
        void this.router.navigate(['/comprobantes']);
      },
      error: (err) => {
        this.emitiendo.set(false);
        const rawErr = err?.error?.error || err?.error?.message;
        const msg = Array.isArray(rawErr)
          ? rawErr.join(', ')
          : rawErr || 'Error al emitir el comprobante ante el SRI';
        this.toast.error(msg);
      },
    });
  }
}

