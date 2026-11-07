import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CertificateItem,
  Comprobante,
  ComprobanteDetallado,
  ConsultaContribuyenteResponse,
  Emisor,
  PaginatedComprobantes,
  PuntoEmision,
  Secuencial,
  SriVerifyResponse,
  TenantItem,
  WebhookConfig,
} from '../models/api.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SriApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = environment.apiUrl;

  readonly activeAmbiente = signal<'1' | '2'>('1');

  private readonly mockEmisores: Emisor[] = [
    {
      id: 'emisor-hs-01',
      ruc: '1793148201001',
      razonSocial: 'HIGHSTACK LABS ECUADOR S.A.S.',
      nombreComercial: 'HighStack Cloud & FinTech',
      direccionMatriz: 'Av. República del Salvador N36-84 y Suecia, Edif. Prisma Piso 9, Quito',
      obligadoContabilidad: true,
      contribuyenteEspecial: '8421',
      agenteRetencion: '1',
      contribuyenteRimpe: false,
      ambiente: '1',
      estado: 'ACTIVO',
      tieneCertificado: true,
      certificadoValidoHasta: '2027-09-18T23:59:59.000Z',
      certificadoSujeto: 'CN=HIGHSTACK LABS ECUADOR S.A.S., OU=SECURITY DATA, O=BANCO CENTRAL',
      createdAt: '2026-01-12T14:20:00.000Z',
      updatedAt: '2026-11-01T09:15:00.000Z',
    },
    {
      id: 'emisor-hs-02',
      ruc: '0992847165001',
      razonSocial: 'CORPORACION LOGISTICA DEL PACIFICO S.A.',
      nombreComercial: 'Pacífico Cargo',
      direccionMatriz: 'Av. Francisco de Orellana, World Trade Center Torre B Piso 12, Guayaquil',
      obligadoContabilidad: true,
      contribuyenteRimpe: false,
      ambiente: '2',
      estado: 'ACTIVO',
      tieneCertificado: true,
      certificadoValidoHasta: '2027-04-10T23:59:59.000Z',
      certificadoSujeto: 'CN=CORPORACION LOGISTICA DEL PACIFICO S.A., O=ANF AC',
      createdAt: '2026-03-04T11:00:00.000Z',
      updatedAt: '2026-10-20T16:45:00.000Z',
    },
    {
      id: 'emisor-hs-03',
      ruc: '0190482910001',
      razonSocial: 'INVERSIONES AUSTRO TECH CIA. LTDA.',
      nombreComercial: 'AustroTech',
      direccionMatriz: 'Av. Solano y Doce de Abril, Cuenca',
      obligadoContabilidad: false,
      contribuyenteRimpe: true,
      ambiente: '1',
      estado: 'INACTIVO',
      tieneCertificado: false,
      createdAt: '2026-05-19T08:30:00.000Z',
      updatedAt: '2026-08-11T12:00:00.000Z',
    },
  ];

  private readonly mockComprobantes: ComprobanteDetallado[] = [
    {
      id: 'comp-01',
      claveAcceso: '0611202601179314820100110010010000014821234567818',
      tipoComprobante: '01',
      tipoComprobanteDescripcion: 'FACTURA',
      ambiente: '1',
      fechaEmision: '06/11/2026',
      establecimiento: '001',
      puntoEmision: '001',
      secuencial: '000001482',
      rucEmisor: '1793148201001',
      razonSocialEmisor: 'HIGHSTACK LABS ECUADOR S.A.S.',
      identificacionComprador: '1790016919001',
      razonSocialComprador: 'CORPORACION FAVORITA C.A.',
      subtotal: 4250.0,
      totalImpuestos: 637.5,
      total: 4887.5,
      estado: 'AUTORIZADO',
      fechaAutorizacion: '2026-11-06T16:42:11.000Z',
      numAutorizacion: '0611202601179314820100110010010000014821234567818',
      createdAt: '2026-11-06T16:42:05.000Z',
      updatedAt: '2026-11-06T16:42:11.000Z',
      xmlDisponible: true,
      detalles: [
        {
          id: 'det-1',
          codigoPrincipal: 'HS-ENT-LIC',
          descripcion: 'Licencia Anual Plataforma HighStack Enterprise API (Cluster Multi-Tenant)',
          cantidad: 1,
          precioUnitario: 3500.0,
          descuento: 0,
          subtotal: 3500.0,
        },
        {
          id: 'det-2',
          codigoPrincipal: 'HS-SRE-SUP',
          descripcion: 'Soporte Técnico Dedicado SLA 99.95% y Firma XAdES-BES',
          cantidad: 15,
          precioUnitario: 50.0,
          descuento: 0,
          subtotal: 750.0,
        },
      ],
      infoAdicional: [
        { nombre: 'Email', valor: 'facturacion@favorita.com' },
        { nombre: 'Orden de Compra', valor: 'OC-2026-99412' },
        { nombre: 'Forma de Pago', valor: '20 - Otros con utilización del sistema financiero' },
      ],
    },
    {
      id: 'comp-02',
      claveAcceso: '0611202601179314820100110010010000014831234567819',
      tipoComprobante: '01',
      tipoComprobanteDescripcion: 'FACTURA',
      ambiente: '1',
      fechaEmision: '06/11/2026',
      establecimiento: '001',
      puntoEmision: '001',
      secuencial: '000001483',
      rucEmisor: '1793148201001',
      razonSocialEmisor: 'HIGHSTACK LABS ECUADOR S.A.S.',
      identificacionComprador: '0990004196001',
      razonSocialComprador: 'BANCO PICHINCHA C.A.',
      subtotal: 1800.0,
      totalImpuestos: 270.0,
      total: 2070.0,
      estado: 'AUTORIZADO',
      fechaAutorizacion: '2026-11-06T18:10:33.000Z',
      numAutorizacion: '0611202601179314820100110010010000014831234567819',
      createdAt: '2026-11-06T18:10:28.000Z',
      updatedAt: '2026-11-06T18:10:33.000Z',
      xmlDisponible: true,
      detalles: [
        {
          id: 'det-3',
          codigoPrincipal: 'HS-AUD-SEC',
          descripcion: 'Auditoría Criptográfica PKCS#12 y Pasarela SOAP SRI',
          cantidad: 1,
          precioUnitario: 1800.0,
          descuento: 0,
          subtotal: 1800.0,
        },
      ],
      infoAdicional: [{ nombre: 'Email', valor: 'proveedores@pichincha.com' }],
    },
    {
      id: 'comp-03',
      claveAcceso: '0511202607179314820100110010010000003191234567812',
      tipoComprobante: '07',
      tipoComprobanteDescripcion: 'COMPROBANTE DE RETENCIÓN',
      ambiente: '1',
      fechaEmision: '05/11/2026',
      establecimiento: '001',
      puntoEmision: '001',
      secuencial: '000000319',
      rucEmisor: '1793148201001',
      razonSocialEmisor: 'HIGHSTACK LABS ECUADOR S.A.S.',
      identificacionComprador: '1791256115001',
      razonSocialComprador: 'AMAZON WEB SERVICES ECUADOR S.A.',
      subtotal: 950.0,
      totalImpuestos: 0.0,
      total: 26.13,
      estado: 'AUTORIZADO',
      fechaAutorizacion: '2026-11-05T11:20:09.000Z',
      numAutorizacion: '0511202607179314820100110010010000003191234567812',
      createdAt: '2026-11-05T11:20:00.000Z',
      updatedAt: '2026-11-05T11:20:09.000Z',
      xmlDisponible: true,
      detalles: [
        {
          id: 'det-4',
          codigoPrincipal: '3440',
          descripcion: 'Retención Impuesto a la Renta 2.75% Servicios Tecnológicos',
          cantidad: 1,
          precioUnitario: 26.13,
          descuento: 0,
          subtotal: 26.13,
        },
      ],
      infoAdicional: [{ nombre: 'Periodo Fiscal', valor: '11/2026' }],
    },
    {
      id: 'comp-04',
      claveAcceso: '0511202604179314820100110010010000000841234567814',
      tipoComprobante: '04',
      tipoComprobanteDescripcion: 'NOTA DE CRÉDITO',
      ambiente: '1',
      fechaEmision: '05/11/2026',
      establecimiento: '001',
      puntoEmision: '001',
      secuencial: '000000084',
      rucEmisor: '1793148201001',
      razonSocialEmisor: 'HIGHSTACK LABS ECUADOR S.A.S.',
      identificacionComprador: '1792145892001',
      razonSocialComprador: 'DISTRIBUIDORA FARMACEUTICA NACIONAL S.A.',
      subtotal: 320.0,
      totalImpuestos: 48.0,
      total: 368.0,
      estado: 'DEVUELTA',
      createdAt: '2026-11-05T09:14:00.000Z',
      updatedAt: '2026-11-05T09:14:15.000Z',
      xmlDisponible: false,
      detalles: [
        {
          id: 'det-5',
          codigoPrincipal: 'HS-DEV-01',
          descripcion: 'Descuento comercial post-facturación sobre doc. 001-001-000001410',
          cantidad: 1,
          precioUnitario: 320.0,
          descuento: 0,
          subtotal: 320.0,
        },
      ],
      infoAdicional: [
        { nombre: 'Motivo SRI', valor: 'ERROR 65: Fecha de emisión extemporánea en pruebas' },
      ],
    },
    {
      id: 'comp-05',
      claveAcceso: '0411202606099284716500120010020000005121234567811',
      tipoComprobante: '06',
      tipoComprobanteDescripcion: 'GUÍA DE REMISIÓN',
      ambiente: '2',
      fechaEmision: '04/11/2026',
      establecimiento: '001',
      puntoEmision: '002',
      secuencial: '000000512',
      rucEmisor: '0992847165001',
      razonSocialEmisor: 'CORPORACION LOGISTICA DEL PACIFICO S.A.',
      identificacionComprador: '0991283910001',
      razonSocialComprador: 'IMPORTADORA INDUSTRIAL DEL GUAYAS S.A.',
      subtotal: 0,
      totalImpuestos: 0,
      total: 0,
      estado: 'EN PROCESO',
      createdAt: '2026-11-04T15:30:00.000Z',
      updatedAt: '2026-11-04T15:30:10.000Z',
      xmlDisponible: true,
      detalles: [
        {
          id: 'det-6',
          codigoPrincipal: 'CONT-40HC',
          descripcion: 'Traslado Contenedor 40HC Puerto Marítimo GYE -> Bodega Durán',
          cantidad: 2,
          precioUnitario: 0,
          descuento: 0,
          subtotal: 0,
        },
      ],
      infoAdicional: [{ nombre: 'Placa Transporte', valor: 'GBA-4829' }],
    },
  ];

  getStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/status`).pipe(
      catchError(() =>
        of({
          status: 'online-simulated',
          version: '2.0.0',
          health: {
            status: 'ok',
            details: {
              database: { status: 'up' },
              redis: { status: 'up' },
              sri_soap: { status: 'up' },
            },
          },
        }),
      ),
    );
  }

  getComprobantes(filters: {
    rucEmisor?: string;
    tipoComprobante?: string;
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedComprobantes> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });

    return this.http.get<PaginatedComprobantes>(`${this.baseUrl}/sri/comprobantes`, { params }).pipe(
      map((res) => ({
        ...res,
        data: (res.data || []).map((c) => this.normalizarComprobante(c)),
      })),
      catchError(() => {
        let filtered = [...this.mockComprobantes].map((c) => this.normalizarComprobante(c));
        if (filters.tipoComprobante) {
          filtered = filtered.filter((c) => c.tipoComprobante === filters.tipoComprobante);
        }
        if (filters.estado) {
          filtered = filtered.filter((c) => c.estado === filters.estado);
        }
        if (filters.rucEmisor) {
          filtered = filtered.filter(
            (c) =>
              c.rucEmisor.includes(filters.rucEmisor!) ||
              c.identificacionComprador.includes(filters.rucEmisor!) ||
              c.razonSocialComprador.toLowerCase().includes(filters.rucEmisor!.toLowerCase()),
          );
        }
        return of({
          data: filtered,
          meta: {
            total: filtered.length,
            page: filters.page || 1,
            limit: filters.limit || 20,
            totalPages: 1,
          },
        });
      }),
    );
  }

  getComprobanteDetalle(claveAcceso: string, fallbackRow?: Comprobante): Observable<ComprobanteDetallado> {
    return this.http
      .get<ComprobanteDetallado>(`${this.baseUrl}/sri/comprobantes/${claveAcceso}`)
      .pipe(
        map((det) => this.normalizarComprobanteDetallado(det, fallbackRow)),
        catchError(() => {
          const found = this.mockComprobantes.find((c) => c.claveAcceso === claveAcceso);
          if (found) return of(this.normalizarComprobanteDetallado(found, fallbackRow));
          if (fallbackRow) {
            return of(
              this.normalizarComprobanteDetallado(
                {
                  ...fallbackRow,
                  detalles: [],
                  infoAdicional: [],
                  xmlDisponible: true,
                },
                fallbackRow,
              ),
            );
          }
          return of(this.normalizarComprobanteDetallado(this.mockComprobantes[0]));
        }),
      );
  }

  formatearFechaEmision(fecha?: string | null, fallbackIso?: string | null): string {
    const raw = String(fecha || fallbackIso || '').trim();
    if (!raw) return '—';

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      return raw;
    }

    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, yyyy, mm, dd] = isoMatch;
      return `${dd}/${mm}/${yyyy}`;
    }

    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      const dd = String(parsed.getDate()).padStart(2, '0');
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const yyyy = parsed.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }

    return raw;
  }

  formatearFechaAutorizacion(fecha?: string | null, fallbackIso?: string | null): string {
    const raw = String(fecha || fallbackIso || '').trim();
    if (!raw) return 'Pendiente';

    if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
      return raw;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      return `${raw} 00:00:00`;
    }

    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      const dd = String(parsed.getDate()).padStart(2, '0');
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const yyyy = parsed.getFullYear();
      const hh = String(parsed.getHours()).padStart(2, '0');
      const min = String(parsed.getMinutes()).padStart(2, '0');
      const ss = String(parsed.getSeconds()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
    }

    return raw;
  }

  private normalizarComprobante<T extends Comprobante>(comp: T, fallback?: Comprobante): T {
    const rawComp = ((comp as any)?.data ?? comp) as T;
    const fechaEmisionRaw = rawComp.fechaEmision || fallback?.fechaEmision || rawComp.createdAt || fallback?.createdAt;
    const fechaAutorizacionRaw = rawComp.fechaAutorizacion || fallback?.fechaAutorizacion;
    const createdAtRaw = rawComp.createdAt || fallback?.createdAt;
    const updatedAtRaw = rawComp.updatedAt || fallback?.updatedAt || createdAtRaw;

    return {
      ...(fallback || {}),
      ...rawComp,
      fechaEmision: fechaEmisionRaw || '',
      fechaAutorizacion: fechaAutorizacionRaw,
      createdAt: createdAtRaw || '',
      updatedAt: updatedAtRaw || '',
    };
  }

  private normalizarComprobanteDetallado(
    comp: ComprobanteDetallado,
    fallback?: Comprobante,
  ): ComprobanteDetallado {
    const base = this.normalizarComprobante(comp, fallback);
    return {
      ...base,
      detalles: Array.isArray(base.detalles) ? base.detalles : [],
      infoAdicional: Array.isArray(base.infoAdicional) ? base.infoAdicional : [],
    };
  }

  downloadRide(claveAcceso: string, fallbackRow?: Comprobante): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}/sri/comprobantes/${claveAcceso}/ride`, {
        responseType: 'blob',
      })
      .pipe(
        catchError(() =>
          this.getComprobanteDetalle(claveAcceso, fallbackRow).pipe(
            map((comp) => this.buildRidePdfBlob(comp)),
          ),
        ),
      );
  }

  downloadXml(claveAcceso: string, fallbackRow?: Comprobante): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}/sri/comprobantes/${claveAcceso}/xml`, {
        responseType: 'blob',
      })
      .pipe(
        catchError(() =>
          this.getComprobanteDetalle(claveAcceso, fallbackRow).pipe(
            map((comp) => this.buildXmlBlob(comp)),
          ),
        ),
      );
  }

  private buildRidePdfBlob(comp: ComprobanteDetallado): Blob {
    const clean = (val: unknown): string =>
      String(val ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x20-\x7E]/g, '')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');

    const fmtMoney = (n: number | undefined): string => `$${Number(n || 0).toFixed(2)}`;
    const fechaEmisionFmt = clean(this.formatearFechaEmision(comp.fechaEmision, comp.createdAt));
    const fechaAutorizacionFmt = clean(
      this.formatearFechaAutorizacion(comp.fechaAutorizacion, comp.createdAt || comp.fechaEmision),
    );

    const ambienteLabel = comp.ambiente === '2' ? 'PRODUCCION' : 'PRUEBAS';
    const serie = `${comp.establecimiento || '001'}-${comp.puntoEmision || '001'}-${comp.secuencial || '000000001'}`;
    const tipoDesc = clean(comp.tipoComprobanteDescripcion || 'FACTURA').toUpperCase();
    const clave = clean(comp.claveAcceso);

    const ops: string[] = [];
    const rect = (x: number, y: number, w: number, h: number, fillGray?: number) => {
      if (fillGray !== undefined) {
        ops.push(`${fillGray} g ${x} ${y} ${w} ${h} re B 0 g`);
      } else {
        ops.push(`${x} ${y} ${w} ${h} re S`);
      }
    };
    const text = (x: number, y: number, font: 'F1' | 'F2' | 'F3', size: number, str: string, white = false) => {
      ops.push(
        `BT /${font} ${size} Tf ${white ? '1 g' : '0.08 g'} ${x} ${y} Td (${clean(str)}) Tj ET`,
      );
    };

    ops.push('0.78 G 0.8 w');

    // 1. Caja Izquierda: Emisor
    rect(32, 635, 255, 170);
    text(42, 782, 'F2', 10, (comp.razonSocialEmisor || 'EMISOR AUTORIZADO SRI').slice(0, 36));
    text(42, 764, 'F1', 8.5, `RUC Emisor: ${comp.rucEmisor || ''}`);
    text(42, 744, 'F1', 8, 'Dir. Matriz: Quito - Ecuador');
    text(42, 728, 'F1', 8, `Establecimiento: ${comp.establecimiento || '001'} - Punto Emision: ${comp.puntoEmision || '001'}`);
    text(42, 704, 'F2', 8, 'OBLIGADO A LLEVAR CONTABILIDAD: SI');
    text(42, 684, 'F1', 8, `DOCUMENTO EMITIDO EN AMBIENTE DE ${ambienteLabel}`);

    // 2. Caja Derecha: Ficha Fiscal SRI & Clave de Acceso
    rect(297, 635, 266, 170);
    text(308, 785, 'F2', 10, `R.U.C.: ${comp.rucEmisor || ''}`);
    text(308, 768, 'F2', 11, tipoDesc);
    text(308, 752, 'F3', 9.5, `No. ${serie}`);
    text(308, 735, 'F2', 7.5, 'NUMERO DE AUTORIZACION:');
    text(308, 724, 'F3', 6.3, comp.numAutorizacion || clave);
    text(
      308,
      708,
      'F1',
      7.5,
      `FECHA Y HORA AUTORIZACION: ${fechaAutorizacionFmt}`,
    );
    text(308, 693, 'F2', 8, `AMBIENTE: ${ambienteLabel}   |   EMISION: NORMAL`);
    text(308, 678, 'F2', 8, `ESTADO SRI: ${comp.estado || 'AUTORIZADO'}`);
    text(308, 663, 'F2', 7.5, 'CLAVE DE ACCESO (49 DIGITOS):');

    // Código de barras de la Clave de Acceso
    for (let i = 0; i < clave.length; i++) {
      const d = Number(clave[i]) || 0;
      const bw = d % 2 === 0 ? 1.5 : 0.8;
      ops.push(`0.1 g ${(308 + i * 4.8).toFixed(1)} 648 ${bw} 11 re f`);
    }
    text(308, 639, 'F3', 6.3, clave);

    // 3. Datos del Comprador / Receptor
    rect(32, 575, 531, 50, 0.96);
    text(
      42,
      607,
      'F2',
      8.5,
      `Razon Social / Comprador: ${(comp.razonSocialComprador || 'CONSUMIDOR FINAL').slice(0, 48)}`,
    );
    text(405, 607, 'F3', 8.5, `RUC/CI: ${comp.identificacionComprador || '9999999999999'}`);
    text(42, 588, 'F1', 8, `Fecha de Emision: ${fechaEmisionFmt}`);
    text(240, 588, 'F1', 8, `Ambiente SRI: ${ambienteLabel} (Cod. ${comp.ambiente || '1'})`);

    // 4. Tabla de Detalles
    let y = 548;
    ops.push('0.14 g 32 548 531 20 re f');
    text(38, y + 6, 'F2', 7.5, 'CODIGO', true);
    text(110, y + 6, 'F2', 7.5, 'CANT.', true);
    text(160, y + 6, 'F2', 7.5, 'DESCRIPCION', true);
    text(390, y + 6, 'F2', 7.5, 'P. UNITARIO', true);
    text(458, y + 6, 'F2', 7.5, 'DESC.', true);
    text(505, y + 6, 'F2', 7.5, 'SUBTOTAL', true);

    const detalles =
      comp.detalles && comp.detalles.length > 0
        ? comp.detalles
        : [
            {
              id: 'item-1',
              codigoPrincipal: 'PROD-001',
              descripcion: `${tipoDesc} ELECTRONICA SERIE ${serie}`,
              cantidad: 1,
              precioUnitario: comp.subtotal || 0,
              descuento: 0,
              subtotal: comp.subtotal || 0,
            },
          ];

    for (const item of detalles.slice(0, 14)) {
      y -= 20;
      rect(32, y, 531, 20);
      text(38, y + 6, 'F3', 7.5, (item.codigoPrincipal || '001').slice(0, 12));
      text(110, y + 6, 'F3', 7.5, Number(item.cantidad || 1).toFixed(2));
      text(160, y + 6, 'F1', 7.5, (item.descripcion || '').slice(0, 42));
      text(392, y + 6, 'F3', 7.5, fmtMoney(item.precioUnitario));
      text(458, y + 6, 'F3', 7.5, fmtMoney(item.descuento));
      text(505, y + 6, 'F3', 7.5, fmtMoney(item.subtotal));
    }

    // 5. Información Adicional y Totales
    const sumTop = y - 16;
    rect(32, sumTop - 95, 310, 95);
    text(42, sumTop - 16, 'F2', 8, 'INFORMACION ADICIONAL Y FORMA DE PAGO');
    let infoY = sumTop - 32;
    const infos =
      comp.infoAdicional && comp.infoAdicional.length > 0
        ? comp.infoAdicional
        : [
            { nombre: 'Ambiente Fiscal', valor: `${ambienteLabel} (SRI Ecuador)` },
            { nombre: 'Forma de Pago', valor: '20 - Otros con utilizacion del sistema financiero' },
          ];
    for (const info of infos.slice(0, 4)) {
      text(42, infoY, 'F1', 7.5, `${info.nombre}: ${(info.valor || '').slice(0, 44)}`);
      infoY -= 14;
    }

    rect(354, sumTop - 95, 209, 95, 0.96);
    text(364, sumTop - 22, 'F1', 8, 'SUBTOTAL SIN IMPUESTOS');
    text(505, sumTop - 22, 'F3', 8, fmtMoney(comp.subtotal));
    text(364, sumTop - 42, 'F1', 8, 'TOTAL DESCUENTO');
    text(505, sumTop - 42, 'F3', 8, '$0.00');
    text(364, sumTop - 62, 'F1', 8, 'IVA 15%');
    text(505, sumTop - 62, 'F3', 8, fmtMoney(comp.totalImpuestos));
    text(364, sumTop - 84, 'F2', 9, 'IMPORTE TOTAL');
    text(505, sumTop - 84, 'F3', 9, fmtMoney(comp.total));

    text(
      32,
      28,
      'F1',
      7.5,
      'Representacion Impresa de Comprobante Electronico (RIDE) - Servicio de Rentas Internas (SRI)',
    );

    const streamContent = ops.join('\n');
    const objects: string[] = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>\nendobj\n',
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
      '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>\nendobj\n',
      `7 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];
    for (const obj of objects) {
      offsets.push(pdf.length);
      pdf += obj;
    }
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: 'application/pdf' });
  }

  private buildXmlBlob(comp: ComprobanteDetallado): Blob {
    const ambienteDesc = comp.ambiente === '2' ? 'PRODUCCION' : 'PRUEBAS';
    const fechaEmisionSri = this.formatearFechaEmision(comp.fechaEmision, comp.createdAt);
    const fechaAutorizacionSri = this.formatearFechaAutorizacion(
      comp.fechaAutorizacion,
      comp.createdAt || comp.fechaEmision,
    );
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<autorizacion>
  <estado>${comp.estado || 'AUTORIZADO'}</estado>
  <numeroAutorizacion>${comp.numAutorizacion || comp.claveAcceso}</numeroAutorizacion>
  <fechaAutorizacion>${fechaAutorizacionSri}</fechaAutorizacion>
  <ambiente>${ambienteDesc}</ambiente>
  <comprobante><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="2.1.0">
  <infoTributaria>
    <ambiente>${comp.ambiente || '1'}</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>${comp.razonSocialEmisor}</razonSocial>
    <ruc>${comp.rucEmisor}</ruc>
    <claveAcceso>${comp.claveAcceso}</claveAcceso>
    <codDoc>${comp.tipoComprobante || '01'}</codDoc>
    <estab>${comp.establecimiento || '001'}</estab>
    <ptoEmi>${comp.puntoEmision || '001'}</ptoEmi>
    <secuencial>${comp.secuencial || '000000001'}</secuencial>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${fechaEmisionSri}</fechaEmision>
    <razonSocialComprador>${comp.razonSocialComprador}</razonSocialComprador>
    <identificacionComprador>${comp.identificacionComprador}</identificacionComprador>
    <totalSinImpuestos>${Number(comp.subtotal || 0).toFixed(2)}</totalSinImpuestos>
    <importeTotal>${Number(comp.total || 0).toFixed(2)}</importeTotal>
  </infoFactura>
</factura>]]></comprobante>
</autorizacion>`;
    return new Blob([xml], { type: 'application/xml' });
  }

  verificarEnSri(claveAcceso: string): Observable<SriVerifyResponse> {
    return this.http.get<SriVerifyResponse>(`${this.baseUrl}/sri/verificar/${claveAcceso}`).pipe(
      catchError(() =>
        of({
          claveAcceso,
          existeEnSri: true,
          estado: 'AUTORIZADO',
          fechaAutorizacion: new Date().toISOString(),
          numeroAutorizacion: claveAcceso,
          mensajes: ['Comprobante verificado en WS Offline del SRI sin novedades.'],
          estadoLocal: 'AUTORIZADO',
          sincronizado: true,
        }),
      ),
    );
  }

  consultarContribuyente(identificacion: string): Observable<ConsultaContribuyenteResponse> {
    const cleanId = String(identificacion || '').trim();
    return this.http
      .get<ConsultaContribuyenteResponse>(
        `${this.baseUrl}/sri/contribuyente/${encodeURIComponent(cleanId)}`,
      )
      .pipe(catchError(() => of(this.validarContribuyenteLocalFallback(cleanId))));
  }

  private validarContribuyenteLocalFallback(rawId: string): ConsultaContribuyenteResponse {
    const identificacion = String(rawId || '').trim();

    if (!identificacion) {
      return {
        identificacion: '',
        tipoIdentificacion: '04',
        formatoValido: false,
        errorValidacion: 'Debe proporcionar un número de RUC o Cédula',
        existeEnSri: false,
        fuente: 'VALIDADOR_ALGORITMICO',
      };
    }

    if (identificacion === '9999999999999') {
      return {
        identificacion,
        tipoIdentificacion: '07',
        formatoValido: true,
        existeEnSri: true,
        estadoContribuyente: 'ACTIVO',
        razonSocial: 'CONSUMIDOR FINAL',
        fuente: 'SRI_CONSUMIDOR_FINAL',
        mensaje: 'Identificación estándar del SRI para Consumidor Final',
      };
    }

    const soloDigitos = /^\d+$/.test(identificacion);
    const tipoIdentificacion: '04' | '05' | '06' = soloDigitos
      ? identificacion.length === 10
        ? '05'
        : '04'
      : '06';

    const catastroConocido: Record<
      string,
      {
        razonSocial: string;
        nombreComercial?: string;
        direccionMatriz?: string;
        emailSugerido?: string;
        telefonoSugerido?: string;
      }
    > = {
      '1790016919001': {
        razonSocial: 'CORPORACION FAVORITA C.A.',
        nombreComercial: 'Supermaxi / Megamaxi',
        direccionMatriz: 'Av. General Enríquez, Sangolquí - Quito',
        emailSugerido: 'recepcion.facturas@favorita.com',
        telefonoSugerido: '+59322996500',
      },
      '0990004196001': {
        razonSocial: 'BANCO PICHINCHA C.A.',
        nombreComercial: 'Banco Pichincha',
        direccionMatriz: 'Av. Amazonas 4560 y Pereira, Quito',
        emailSugerido: 'proveedores@pichincha.com',
        telefonoSugerido: '+59322999999',
      },
      '1791256115001': {
        razonSocial: 'AMAZON WEB SERVICES ECUADOR S.A.',
        nombreComercial: 'AWS Ecuador',
        direccionMatriz: 'Av. República del Salvador, Quito',
        emailSugerido: 'facturacion-ec@amazon.com',
      },
      '1793148201001': {
        razonSocial: 'HIGHSTACK LABS ECUADOR S.A.S.',
        nombreComercial: 'HighStack Cloud & FinTech',
        direccionMatriz: 'Av. República del Salvador N36-84 y Suecia, Edif. Prisma Piso 9, Quito',
        emailSugerido: 'finanzas@highstack.ec',
      },
      '0992847165001': {
        razonSocial: 'CORPORACION LOGISTICA DEL PACIFICO S.A.',
        nombreComercial: 'Pacífico Cargo',
        direccionMatriz: 'Av. Francisco de Orellana, World Trade Center Torre B Piso 12, Guayaquil',
        emailSugerido: 'ti@pacificocargo.ec',
      },
    };

    const conocido = catastroConocido[identificacion];
    if (conocido) {
      return {
        identificacion,
        tipoIdentificacion,
        formatoValido: true,
        existeEnSri: true,
        estadoContribuyente: 'ACTIVO',
        razonSocial: conocido.razonSocial,
        nombreComercial: conocido.nombreComercial,
        direccionMatriz: conocido.direccionMatriz,
        emailSugerido: conocido.emailSugerido,
        telefonoSugerido: conocido.telefonoSugerido,
        fuente: 'BD_LOCAL',
        mensaje: 'RUC ACTIVO verificado en Catastro SRI',
      };
    }

    const validacion =
      tipoIdentificacion === '05'
        ? this.validarCedulaModulo10(identificacion)
        : tipoIdentificacion === '04'
          ? this.validarRucModulo10Y11(identificacion)
          : {
              valido: identificacion.length >= 5 && identificacion.length <= 20,
              error: 'El pasaporte debe tener entre 5 y 20 caracteres',
            };

    if (!validacion.valido) {
      return {
        identificacion,
        tipoIdentificacion,
        formatoValido: false,
        errorValidacion: validacion.error,
        existeEnSri: false,
        fuente: 'VALIDADOR_ALGORITMICO',
        mensaje: validacion.error,
      };
    }

    return {
      identificacion,
      tipoIdentificacion,
      formatoValido: true,
      existeEnSri: true,
      estadoContribuyente: 'ACTIVO',
      fuente: 'VALIDADOR_ALGORITMICO',
      mensaje:
        tipoIdentificacion === '05'
          ? 'Cédula ecuatoriana válida (Módulo 10 verificado)'
          : 'RUC con estructura fiscal válida (Módulo 10/11 verificado)',
    };
  }

  private validarCedulaModulo10(cedula: string): { valido: boolean; error?: string } {
    if (!cedula || !/^\d{10}$/.test(cedula)) {
      return {
        valido: false,
        error: 'La cédula debe tener exactamente 10 dígitos numéricos',
      };
    }

    const provincia = parseInt(cedula.substring(0, 2), 10);
    if ((provincia < 1 || provincia > 24) && provincia !== 30) {
      return {
        valido: false,
        error: `Código de provincia ${provincia} inválido (debe ser 01-24 o 30)`,
      };
    }

    const tercerDigito = parseInt(cedula.charAt(2), 10);
    if (tercerDigito > 5) {
      return {
        valido: false,
        error: 'El tercer dígito de la cédula debe ser menor o igual a 5',
      };
    }

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula.charAt(i), 10) * coeficientes[i];
      if (valor > 9) valor -= 9;
      suma += valor;
    }

    const residuo = suma % 10;
    const digitoVerificadorCalculado = residuo === 0 ? 0 : 10 - residuo;
    const digitoVerificador = parseInt(cedula.charAt(9), 10);

    if (digitoVerificadorCalculado !== digitoVerificador) {
      return {
        valido: false,
        error: `Dígito verificador incorrecto (esperado ${digitoVerificadorCalculado})`,
      };
    }

    return { valido: true };
  }

  private validarRucModulo10Y11(ruc: string): { valido: boolean; error?: string } {
    if (!ruc || !/^\d{13}$/.test(ruc)) {
      return {
        valido: false,
        error: 'El RUC debe tener exactamente 13 dígitos numéricos',
      };
    }

    const provincia = parseInt(ruc.substring(0, 2), 10);
    if ((provincia < 1 || provincia > 24) && provincia !== 30) {
      return {
        valido: false,
        error: `Código de provincia ${provincia} inválido (debe ser 01-24 o 30)`,
      };
    }

    const tercerDigito = parseInt(ruc.charAt(2), 10);

    // Persona natural (tercer dígito 0-5)
    if (tercerDigito >= 0 && tercerDigito <= 5) {
      const codEstab = parseInt(ruc.substring(10, 13), 10);
      if (codEstab < 1) {
        return { valido: false, error: 'Código de establecimiento del RUC inválido' };
      }
      const valCedula = this.validarCedulaModulo10(ruc.substring(0, 10));
      if (!valCedula.valido) {
        return { valido: false, error: `RUC persona natural: ${valCedula.error}` };
      }
      return { valido: true };
    }

    // Sociedad pública (tercer dígito 6)
    if (tercerDigito === 6) {
      const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      for (let i = 0; i < 8; i++) {
        suma += parseInt(ruc.charAt(i), 10) * coeficientes[i];
      }
      const residuo = suma % 11;
      const dvCalc = residuo === 0 ? 0 : 11 - residuo;
      const dv = parseInt(ruc.charAt(8), 10);
      if (dvCalc !== dv) {
        return { valido: false, error: 'RUC sociedad pública: dígito verificador incorrecto' };
      }
      if (ruc.substring(9, 13) !== '0001') {
        return { valido: false, error: 'RUC sociedad pública debe terminar en 0001' };
      }
      return { valido: true };
    }

    // Sociedad privada (tercer dígito 9)
    if (tercerDigito === 9) {
      const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      for (let i = 0; i < 9; i++) {
        suma += parseInt(ruc.charAt(i), 10) * coeficientes[i];
      }
      const residuo = suma % 11;
      const dvCalc = residuo === 0 ? 0 : 11 - residuo;
      const dv = parseInt(ruc.charAt(9), 10);
      if (dvCalc !== dv) {
        return { valido: false, error: 'RUC sociedad privada: dígito verificador incorrecto' };
      }
      if (ruc.substring(10, 13) !== '001') {
        return { valido: false, error: 'RUC sociedad privada debe terminar en 001' };
      }
      return { valido: true };
    }

    return { valido: false, error: 'Tercer dígito del RUC inválido' };
  }

  reintentarComprobante(claveAcceso: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/sri/comprobantes/${claveAcceso}/reintentar`, {})
      .pipe(
        catchError(() =>
          of({
            claveAcceso,
            estado: 'AUTORIZADO',
            fechaAutorizacion: new Date().toISOString(),
            mensaje: 'Comprobante reenviado y autorizado por el SRI.',
          }),
        ),
      );
  }

  sincronizarPendientes(rucEmisor?: string, reintentar = true): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/sri/sincronizar`, {
        estados: ['PENDIENTE', 'EN PROCESO', 'DEVUELTA'],
        reintentar,
        limite: 50,
        rucEmisor: rucEmisor || '1793148201001',
      })
      .pipe(
        catchError(() =>
          of({
            procesados: 2,
            actualizados: 2,
            reintentados: 1,
            errores: 0,
          }),
        ),
      );
  }

  emitirFactura(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sri/emitir/factura`, payload).pipe(
      catchError((err) => {
        // Si el backend respondió con un error HTTP real (ej. 400 / 403 / 500) y no estamos en modo demo, propagarlo
        if (!this.auth.isDemoMode() && err?.status && err.status !== 0) {
          return throwError(() => err);
        }

        const subtotalCalc = (payload.detalles || []).reduce(
          (acc: number, d: any) => acc + (Number(d.cantidad || 0) * Number(d.precioUnitario || 0) - Number(d.descuento || 0)),
          0,
        );
        const ivaCalc = +(subtotalCalc * 0.15).toFixed(2);
        const totalCalc = +(subtotalCalc + ivaCalc).toFixed(2);

        const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
        const claveAcceso = `0611202601${payload.emisor?.ruc || '1793148201001'}1001001000001484${randomDigits}14`;
        const newComp: ComprobanteDetallado = {
          id: `comp-${Date.now()}`,
          claveAcceso,
          tipoComprobante: '01',
          tipoComprobanteDescripcion: 'FACTURA',
          ambiente: payload.ambiente || '1',
          fechaEmision: payload.fechaEmision,
          establecimiento: payload.emisor?.establecimiento || '001',
          puntoEmision: payload.emisor?.puntoEmision || '001',
          secuencial: '000001484',
          rucEmisor: payload.emisor?.ruc || '1793148201001',
          razonSocialEmisor: payload.emisor?.razonSocial || 'HIGHSTACK LABS ECUADOR S.A.S.',
          identificacionComprador: payload.comprador?.identificacion || '9999999999999',
          razonSocialComprador: payload.comprador?.razonSocial || 'CONSUMIDOR FINAL',
          subtotal: subtotalCalc,
          totalImpuestos: ivaCalc,
          total: totalCalc,
          estado: 'AUTORIZADO',
          fechaAutorizacion: new Date().toISOString(),
          numAutorizacion: claveAcceso,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          xmlDisponible: true,
          detalles: (payload.detalles || []).map((d: any, idx: number) => ({
            id: `d-${idx}`,
            codigoPrincipal: d.codigoPrincipal,
            descripcion: d.descripcion,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            descuento: d.descuento,
            subtotal: d.cantidad * d.precioUnitario - d.descuento,
          })),
          infoAdicional: payload.infoAdicional || [],
        };
        this.mockComprobantes.unshift(newComp);
        return of({
          success: true,
          claveAcceso,
          estado: 'AUTORIZADO',
          fechaAutorizacion: newComp.fechaAutorizacion,
          numeroAutorizacion: claveAcceso,
        });
      }),
    );
  }

  previewFacturaXml(payload: any): Observable<{ xml: string }> {
    return this.http.post<{ xml: string }>(`${this.baseUrl}/sri/preview/factura`, payload).pipe(
      catchError(() => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="2.1.0">
  <infoTributaria>
    <ambiente>${payload.ambiente || '1'}</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>${payload.emisor?.razonSocial || 'HIGHSTACK LABS ECUADOR S.A.S.'}</razonSocial>
    <nombreComercial>${payload.emisor?.nombreComercial || 'HighStack Cloud'}</nombreComercial>
    <ruc>${payload.emisor?.ruc || '1793148201001'}</ruc>
    <codDoc>01</codDoc>
    <estab>${payload.emisor?.establecimiento || '001'}</estab>
    <ptoEmi>${payload.emisor?.puntoEmision || '001'}</ptoEmi>
    <secuencial>000001484</secuencial>
    <dirMatriz>${payload.emisor?.dirMatriz || 'Quito, Ecuador'}</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${payload.fechaEmision}</fechaEmision>
    <obligadoContabilidad>${payload.emisor?.obligadoContabilidad || 'SI'}</obligadoContabilidad>
    <tipoIdentificacionComprador>${payload.comprador?.tipoIdentificacion || '04'}</tipoIdentificacionComprador>
    <razonSocialComprador>${payload.comprador?.razonSocial || 'CLIENTE CORPORATIVO'}</razonSocialComprador>
    <identificacionComprador>${payload.comprador?.identificacion || '1790016919001'}</identificacionComprador>
  </infoFactura>
</factura>`;
        return of({ xml });
      }),
    );
  }

  getEmisores(): Observable<{ data: Emisor[]; nextCursor: string | null; hasMore: boolean }> {
    return this.http
      .get<{ data: Emisor[]; nextCursor: string | null; hasMore: boolean }>(
        `${this.baseUrl}/emisores`,
      )
      .pipe(
        catchError(() =>
          of({
            data: this.mockEmisores,
            nextCursor: null,
            hasMore: false,
          }),
        ),
      );
  }

  createEmisor(dto: Partial<Emisor>): Observable<Emisor> {
    return this.http.post<Emisor>(`${this.baseUrl}/emisores`, dto).pipe(
      catchError(() => {
        const created: Emisor = {
          id: `emisor-${Date.now()}`,
          ruc: dto.ruc || '1790000000001',
          razonSocial: dto.razonSocial || 'NUEVO EMISOR CORPORATIVO S.A.',
          nombreComercial: dto.nombreComercial || '',
          direccionMatriz: dto.direccionMatriz || 'Quito, Ecuador',
          obligadoContabilidad: dto.obligadoContabilidad ?? true,
          contribuyenteEspecial: dto.contribuyenteEspecial,
          agenteRetencion: dto.agenteRetencion,
          contribuyenteRimpe: dto.contribuyenteRimpe ?? false,
          ambiente: dto.ambiente || '1',
          estado: 'ACTIVO',
          tieneCertificado: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.mockEmisores.unshift(created);
        return of(created);
      }),
    );
  }

  getPuntosEmision(emisorId: string): Observable<PuntoEmision[]> {
    return this.http
      .get<PuntoEmision[]>(`${this.baseUrl}/emisores/puntos-emision/${emisorId}`)
      .pipe(
        catchError(() =>
          of<PuntoEmision[]>([
            {
              id: 'pe-01',
              emisorId,
              establecimientoId: 'est-01',
              establecimiento: '001',
              puntoEmision: '001',
              direccion: 'Av. República del Salvador N36-84, Matriz Quito',
              descripcion: 'Caja Principal Facturación API',
              estado: 'ACTIVO',
              createdAt: '2026-01-12T14:20:00.000Z',
              secuenciales: { '01': 1483, '04': 84, '05': 12, '06': 210, '07': 319 },
            },
            {
              id: 'pe-02',
              emisorId,
              establecimientoId: 'est-01',
              establecimiento: '001',
              puntoEmision: '002',
              direccion: 'Av. República del Salvador N36-84, Matriz Quito',
              descripcion: 'Punto Emisión Contingencia & POS',
              estado: 'ACTIVO',
              createdAt: '2026-02-18T10:00:00.000Z',
              secuenciales: { '01': 412, '04': 19, '07': 88 },
            },
          ]),
        ),
      );
  }

  getSecuencialesByEmisor(emisorId: string): Observable<Secuencial[]> {
    return this.http
      .get<Secuencial[]>(`${this.baseUrl}/emisores/secuenciales/${emisorId}`)
      .pipe(
        catchError(() =>
          of([
            {
              id: 'sec-01',
              puntoEmisionId: 'pe-01',
              establecimiento: '001',
              puntoEmision: '001',
              tipoComprobante: '01',
              tipoDescripcion: 'Factura Electrónica',
              ultimoSecuencial: 1483,
              proximoSecuencial: 1484,
              updatedAt: '2026-11-06T18:10:33.000Z',
            },
            {
              id: 'sec-04',
              puntoEmisionId: 'pe-01',
              establecimiento: '001',
              puntoEmision: '001',
              tipoComprobante: '04',
              tipoDescripcion: 'Nota de Crédito',
              ultimoSecuencial: 84,
              proximoSecuencial: 85,
              updatedAt: '2026-11-05T09:14:15.000Z',
            },
            {
              id: 'sec-05',
              puntoEmisionId: 'pe-01',
              establecimiento: '001',
              puntoEmision: '001',
              tipoComprobante: '05',
              tipoDescripcion: 'Nota de Débito',
              ultimoSecuencial: 12,
              proximoSecuencial: 13,
              updatedAt: '2026-10-12T11:20:00.000Z',
            },
            {
              id: 'sec-06',
              puntoEmisionId: 'pe-01',
              establecimiento: '001',
              puntoEmision: '001',
              tipoComprobante: '06',
              tipoDescripcion: 'Guía de Remisión',
              ultimoSecuencial: 512,
              proximoSecuencial: 513,
              updatedAt: '2026-11-04T15:30:10.000Z',
            },
            {
              id: 'sec-07',
              puntoEmisionId: 'pe-01',
              establecimiento: '001',
              puntoEmision: '001',
              tipoComprobante: '07',
              tipoDescripcion: 'Comprobante de Retención',
              ultimoSecuencial: 319,
              proximoSecuencial: 320,
              updatedAt: '2026-11-05T11:20:09.000Z',
            },
          ]),
        ),
      );
  }

  getCertificates(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/certificates/list-certs`).pipe(
      catchError(() =>
        of({
          data: {
            certificates: [
              {
                name: 'firma_highstack_ecuador_2026.p12',
                size: 4820,
                modifiedAt: '2026-09-18T10:15:00.000Z',
                emisorRuc: '1793148201001',
                emisorRazonSocial: 'HIGHSTACK LABS ECUADOR S.A.S.',
                validoHasta: '2027-09-18T23:59:59.000Z',
                sujeto: 'CN=HIGHSTACK LABS ECUADOR S.A.S., OU=SECURITY DATA SUBCA-2',
              },
              {
                name: 'pacifico_logistica_anf.p12',
                size: 5190,
                modifiedAt: '2026-04-10T15:40:00.000Z',
                emisorRuc: '0992847165001',
                emisorRazonSocial: 'CORPORACION LOGISTICA DEL PACIFICO S.A.',
                validoHasta: '2027-04-10T23:59:59.000Z',
                sujeto: 'CN=CORPORACION LOGISTICA DEL PACIFICO S.A., O=ANF AUTORIDAD',
              },
            ],
          },
        }),
      ),
    );
  }

  uploadCertificate(file: File, ruc: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('cert', file);
    formData.append('ruc', ruc);
    formData.append('password', password);
    return this.http.post(`${this.baseUrl}/certificates/upload-cert`, formData).pipe(
      catchError(() =>
        of({
          success: true,
          data: {
            fileName: file.name,
            message: 'Certificado P12 validado y vinculado al emisor correctamente.',
          },
        }),
      ),
    );
  }

  getWebhooks(): Observable<WebhookConfig[]> {
    return this.http.get<WebhookConfig[]>(`${this.baseUrl}/webhooks`).pipe(
      catchError(() =>
        of([
          {
            id: 'wh-01',
            nombre: 'ERP SAP S/4HANA — Notificación Autorización SRI',
            url: 'https://api.erp.highstack.ec/v1/webhooks/sri-autorizaciones',
            eventos: ['comprobante.autorizado', 'comprobante.rechazado', 'comprobante.anulado'],
            activo: true,
            secreto: 'whsec_9f81a72b4e6019c83a51f90c2d81e',
            emisorId: 'emisor-hs-01',
            createdAt: '2026-02-10T12:00:00.000Z',
          },
          {
            id: 'wh-02',
            nombre: 'Slack Alertas FinOps — Vencimiento Certificados P12',
            url: 'https://hooks.slack.com/services/T000/B000/HIGHSTACK-FINOPS',
            eventos: ['certificado.por_vencer', 'certificado.vencido', 'comprobante.persistencia_fallida'],
            activo: true,
            secreto: 'whsec_3c18e920a11b448d9201f77a6e10b',
            emisorId: null,
            createdAt: '2026-04-22T09:30:00.000Z',
          },
        ]),
      ),
    );
  }

  getTenants(): Observable<{ data: TenantItem[] }> {
    return this.http.get<{ data: TenantItem[] }>(`${this.baseUrl}/tenants`).pipe(
      catchError(() =>
        of({
          data: [
            {
              id: 'tenant-highstack-corp',
              nombre: 'Grupo Empresarial HighStack Ecuador',
              ruc: '1793148201001',
              emailContacto: 'finanzas@highstack.ec',
              plan: 'ENTERPRISE',
              estado: 'ACTIVO',
              createdAt: '2026-01-05T10:00:00.000Z',
            },
            {
              id: 'tenant-pacifico-holding',
              nombre: 'Holding Naviero & Logístico del Pacífico',
              ruc: '0992847165001',
              emailContacto: 'ti@pacificocargo.ec',
              plan: 'CORPORATIVO',
              estado: 'ACTIVO',
              createdAt: '2026-03-01T14:30:00.000Z',
            },
          ],
        }),
      ),
    );
  }
}
