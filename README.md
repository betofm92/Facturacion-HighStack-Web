# Facturación HighStack Web — Consola Fiscal SRI Ecuador

Frontend corporativo construido con **Angular 22**, **Tailwind CSS v4** y la librería oficial de componentes **[`@highstacklabs2026/ui`](https://github.com/Highstack-Labs/highstack-ui)** para operar y auditar el backend **[Facturacion-HighStack](https://github.com/betofm92/Facturacion-HighStack)** (Open API Facturación Electrónica SRI Ecuador).

## Características de Diseño & Arquitectura

- **Librería de Componentes HighStack UI (`@highstacklabs2026/ui`)**: Uso nativo de componentes standalone basados en Angular Signals (`<ui-table>`, `<ui-card>`, `<ui-drawer>`, `<ui-modal>`, `<ui-datepicker>`, `<ui-segmented>`, `<ui-tabs>`, `<ui-stepper>`, `ToastService`, etc.).
- **Estética Sobria, Ejecutiva y Arquitectónica**: Tokens CSS personalizados con geometría de bordes rectos/sutiles (`--radius: 0.25rem` / `4px`), paleta corporativa Zinc de alto contraste, tipografía técnica (`Inter` + `JetBrains Mono` para RUC, Claves de Acceso de 49 dígitos y montos tabulares) y soporte para Modo Claro / Modo Oscuro.
- **Conexión en Vivo + Modo Demostración Resiliente**: Se conecta por defecto a `http://localhost:3001` con interceptor JWT y ofrece también un **Modo Demostración** interactivo con datos fiscales reales del SRI si el backend no está encendido localmente.

## Módulos Incluidos

1. **Acceso a Consola Fiscal (`/login`)**: Autenticación JWT contra `POST /auth/login` o ingreso directo en modo demostración.
2. **Resumen Ejecutivo (`/dashboard`)**: KPIs de facturación autorizada, tasa de autorización SRI, monitoreo de servicios SOAP (`CELCER`/`CEL`) y sociedades emisoras.
3. **Registro de Comprobantes (`/comprobantes`)**: Tabla de alta densidad con filtros por tipo (`01`, `04`, `05`, `06`, `07`), estado SRI, fecha y RUC, además de **Drawer de Auditoría Técnica**, descarga de **RIDE (PDF)**, descarga de **XML XAdES-BES** y verificación directa en WS del SRI.
4. **Emisión de Comprobantes (`/emitir`)**: Formulario fiscal con cálculo en vivo de bases imponibles e IVA 15%, previsualización del XML SRI v2.1.0 (`POST /sri/preview/factura`) y firma/transmisión (`POST /sri/emitir/factura`).
5. **Emisores, Establecimientos y Secuenciales (`/emisores`)**: Gestión multi-RUC (`GET/POST /emisores`), puntos de emisión (`001-001`) y control de correlativos de 9 dígitos.
6. **Firma Electrónica PKCS#12 (`/certificados`)**: Bóveda criptográfica para subir, validar vigencia X.509 y vincular certificados `.p12` (`POST /certificates/upload-cert`).
7. **Webhooks HMAC & Tenants (`/integraciones`)**: Configuración de endpoints de notificación de eventos del SRI y administración multi-tenant.

## Desarrollo Local

```bash
npm install
npm start
```

La aplicación estará disponible en `http://localhost:4200`.
