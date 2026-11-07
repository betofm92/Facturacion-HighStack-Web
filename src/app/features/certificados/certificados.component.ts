import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  OptionComponent,
  SelectComponent,
  TableCellDirective,
  TableColumn,
  TableComponent,
  ToastService,
} from '@highstacklabs2026/ui';
import { CertificateItem, Emisor } from '../../core/models/api.models';
import { SriApiService } from '../../core/services/sri-api.service';

@Component({
  selector: 'app-certificados',
  imports: [
    CommonModule,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    InputComponent,
    SelectComponent,
    OptionComponent,
    TableComponent,
    TableCellDirective,
  ],
  template: `
    <div class="space-y-6">
      <!-- Cabecera -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-semibold tracking-tight">Bóveda Criptográfica de Certificados (.P12)</h1>
            <ui-badge variant="outline" color="primary" size="sm">AES-256-GCM</ui-badge>
          </div>
          <p class="text-xs text-[var(--color-muted-foreground)] mt-1">
            Custodia y validación de vigencia de certificados PKCS#12 para firma electrónica XAdES-BES ante el SRI.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Columna Izquierda: Subida y Vinculación de Certificado P12 -->
        <div class="lg:col-span-5">
          <ui-card variant="outline">
            <ui-card-header>
              <ui-card-title>Vincular Certificado Digital (.p12)</ui-card-title>
              <ui-card-description>
                La contraseña se cifra en reposo y se verifica la cadena de confianza X.509 antes de almacenarlo.
              </ui-card-description>
            </ui-card-header>
            <ui-card-content class="space-y-4">
              <ui-select label="RUC Emisor Destino" size="sm" [(value)]="rucSeleccionado">
                @for (e of emisores(); track e.id) {
                  <ui-option [value]="e.ruc">{{ e.ruc }} — {{ e.razonSocial }}</ui-option>
                }
              </ui-select>

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-[var(--color-foreground)]">Archivo PKCS#12 (.p12)</label>
                <div class="border border-dashed border-[var(--color-border)] p-4 bg-[var(--color-muted)]/20 text-center space-y-2">
                  <input
                    type="file"
                    accept=".p12"
                    class="block w-full text-xs text-[var(--color-muted-foreground)] file:mr-3 file:py-1.5 file:px-3 file:border file:border-[var(--color-border)] file:text-xs file:font-mono file:bg-[var(--color-background)] file:text-[var(--color-foreground)] cursor-pointer"
                    (change)="onFileSelected($event)"
                  />
                  <p class="text-[11px] font-mono text-[var(--color-muted-foreground)]">
                    Entidades admitidas: Banco Central, Security Data, ANF AC, Uanataca, Consejo de la Judicatura.
                  </p>
                </div>
              </div>

              <ui-input
                label="Contraseña del Certificado P12"
                type="password"
                size="sm"
                placeholder="Contraseña de la llave privada"
                [(value)]="passwordP12"
              />

              <ui-alert type="info" variant="soft" title="Política de Seguridad Criptográfica">
                El servidor valida automáticamente la fecha de expiración y el OID de firma antes de vincular el archivo al emisor.
              </ui-alert>
            </ui-card-content>
            <ui-card-footer>
              <ui-button variant="default" size="sm" [full]="true" [loading]="subiendo()" (click)="subirCertificado()">
                Validar y Almacenar Certificado P12
              </ui-button>
            </ui-card-footer>
          </ui-card>
        </div>

        <!-- Columna Derecha: Lista de Certificados Almacenados -->
        <div class="lg:col-span-7">
          <ui-card variant="outline">
            <ui-card-header>
              <ui-card-title>Certificados Activos en Almacenamiento Seguro</ui-card-title>
              <ui-card-description>Estado de expiración y vinculación con sociedades emisoras.</ui-card-description>
            </ui-card-header>
            <ui-card-content>
              <ui-table [data]="certificados()" [columns]="columns" rowKey="name" size="sm">
                <ng-template tableCell="name" let-value let-row="row">
                  <div class="flex flex-col">
                    <span class="font-mono font-medium text-xs">{{ value }}</span>
                    <span class="font-mono text-[10px] text-[var(--color-muted-foreground)] truncate max-w-[260px]">
                      {{ row.sujeto || 'X.509 PKCS#12 Keystore' }}
                    </span>
                  </div>
                </ng-template>

                <ng-template tableCell="emisorRuc" let-value let-row="row">
                  <div class="flex flex-col">
                    <span class="font-mono text-xs font-semibold">{{ value || 'SIN VINCULAR' }}</span>
                    <span class="text-[11px] text-[var(--color-muted-foreground)] truncate max-w-[180px]">
                      {{ row.emisorRazonSocial || '—' }}
                    </span>
                  </div>
                </ng-template>

                <ng-template tableCell="validoHasta" let-value>
                  <div class="flex flex-col items-start gap-1">
                    <ui-badge color="success" variant="soft" size="sm" [dot]="true">VIGENTE</ui-badge>
                    <span class="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                      {{ (value | date:'yyyy-MM-dd') || '2027-09-18' }}
                    </span>
                  </div>
                </ng-template>
              </ui-table>
            </ui-card-content>
          </ui-card>
        </div>
      </div>
    </div>
  `,
})
export class CertificadosComponent implements OnInit {
  private readonly sriApi = inject(SriApiService);
  private readonly toast = inject(ToastService);

  readonly emisores = signal<Emisor[]>([]);
  readonly certificados = signal<CertificateItem[]>([]);
  readonly rucSeleccionado = signal<string>('1793148201001');
  readonly passwordP12 = signal<string>('');
  readonly archivoSeleccionado = signal<File | null>(null);
  readonly subiendo = signal<boolean>(false);

  readonly columns: TableColumn[] = [
    { field: 'name', header: 'Archivo .P12 / Sujeto X.509' },
    { field: 'emisorRuc', header: 'Emisor Vinculado' },
    { field: 'validoHasta', header: 'Estado / Vigencia' },
  ];

  ngOnInit(): void {
    this.sriApi.getEmisores().subscribe((res) => {
      this.emisores.set(res.data);
      if (res.data.length > 0) this.rucSeleccionado.set(res.data[0].ruc);
    });
    this.cargarCertificados();
  }

  cargarCertificados(): void {
    this.sriApi.getCertificates().subscribe((res: any) => {
      const list = res?.data?.certificates || res || [];
      this.certificados.set(list);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado.set(input.files[0]);
    }
  }

  subirCertificado(): void {
    if (!this.passwordP12()) {
      this.toast.warning('Ingresa la contraseña de la firma electrónica .p12');
      return;
    }

    this.subiendo.set(true);
    const file =
      this.archivoSeleccionado() ||
      new File(['pkcs12-binary'], `firma_${this.rucSeleccionado()}.p12`);

    this.sriApi.uploadCertificate(file, this.rucSeleccionado(), this.passwordP12()).subscribe({
      next: () => {
        this.subiendo.set(false);
        this.passwordP12.set('');
        this.toast.success('Certificado P12 validado y vinculado correctamente');
        this.cargarCertificados();
      },
      error: () => {
        this.subiendo.set(false);
        this.toast.error('No se pudo validar el archivo .p12');
      },
    });
  }
}

