export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  email: string;
  rol: UserRole;
  tenantId: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
  user: AuthUser;
}

export interface Comprobante {
  id: string;
  claveAcceso: string;
  tipoComprobante: string;
  tipoComprobanteDescripcion: string;
  ambiente: string;
  fechaEmision: string;
  establecimiento: string;
  puntoEmision: string;
  secuencial: string;
  rucEmisor: string;
  razonSocialEmisor: string;
  identificacionComprador: string;
  razonSocialComprador: string;
  subtotal: number;
  totalImpuestos: number;
  total: number;
  estado: string;
  fechaAutorizacion?: string;
  numAutorizacion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComprobanteDetalleItem {
  id: string;
  codigoPrincipal: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

export interface ComprobanteDetallado extends Comprobante {
  detalles: ComprobanteDetalleItem[];
  infoAdicional?: Array<{ nombre: string; valor: string }>;
  xmlDisponible: boolean;
}

export interface PaginatedComprobantes {
  data: Comprobante[];
  meta: {
    total?: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
  nextCursor?: string | null;
  hasMore?: boolean;
}

export interface Emisor {
  id: string;
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccionMatriz: string;
  obligadoContabilidad: boolean;
  contribuyenteEspecial?: string;
  agenteRetencion?: string;
  contribuyenteRimpe: boolean;
  ambiente: string;
  estado: 'ACTIVO' | 'INACTIVO';
  tenantId?: string;
  tieneCertificado: boolean;
  certificadoValidoHasta?: string;
  certificadoSujeto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PuntoEmision {
  id: string;
  emisorId: string;
  establecimientoId: string;
  establecimiento: string;
  puntoEmision: string;
  direccion: string;
  descripcion?: string;
  estado: string;
  createdAt: string;
  secuenciales?: Record<string, number>;
}

export interface Secuencial {
  id: string;
  puntoEmisionId: string;
  establecimiento?: string;
  puntoEmision?: string;
  tipoComprobante: string;
  tipoDescripcion: string;
  ultimoSecuencial: number;
  proximoSecuencial: number;
  updatedAt: string;
}

export interface CertificateItem {
  name: string;
  size: number;
  modifiedAt: string;
  emisorRuc: string | null;
  emisorRazonSocial: string | null;
  validoHasta: string | null;
  sujeto: string | null;
}

export interface WebhookConfig {
  id: string;
  nombre: string;
  url: string;
  eventos: string[];
  activo: boolean;
  secreto?: string;
  emisorId?: string | null;
  createdAt: string;
}

export interface TenantItem {
  id: string;
  nombre: string;
  ruc?: string;
  emailContacto?: string;
  plan: string;
  estado: string;
  createdAt: string;
}

export interface SriVerifyResponse {
  claveAcceso: string;
  existeEnSri: boolean;
  estado: string;
  fechaAutorizacion?: string;
  numeroAutorizacion?: string;
  mensajes?: string[];
  estadoLocal?: string;
  sincronizado: boolean;
}

