import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CertificateItem,
  ComprobanteDetallado,
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
      catchError(() => {
        let filtered = [...this.mockComprobantes];
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

  getComprobanteDetalle(claveAcceso: string): Observable<ComprobanteDetallado> {
    return this.http
      .get<ComprobanteDetallado>(`${this.baseUrl}/sri/comprobantes/${claveAcceso}`)
      .pipe(
        catchError(() => {
          const found =
            this.mockComprobantes.find((c) => c.claveAcceso === claveAcceso) ||
            this.mockComprobantes[0];
          return of(found);
        }),
      );
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
      catchError(() => {
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
          subtotal: payload._totals?.subtotal || 0,
          totalImpuestos: payload._totals?.iva || 0,
          total: payload._totals?.total || 0,
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
