# Registro de actividades de tratamiento

**Responsable:** [RAZÓN SOCIAL], RUT [RUT EMPRESA]
**Domicilio:** [DOMICILIO]
**Contacto en materia de datos:** [EMAIL CONTACTO DATOS]
**Última actualización:** 2026-08-08
**Base legal:** art. 15 bis Ley 21.719

> Este registro debe mantenerse actualizado y estar disponible para la Agencia de Protección de Datos Personales cuando lo requiera. Actualizar cada vez que se agregue una finalidad, una categoría de datos o un encargado.

---

## Ficha 1 — Gestión de clientes y servicio de mantención

| Campo | Contenido |
|---|---|
| **Finalidad** | Prestar el servicio de mantención, reparación y revestimiento de piscinas: agendar visitas, planificar rutas, registrar trabajos ejecutados y llevar el historial del servicio |
| **Base de licitud** | Ejecución de un contrato en el que el titular es parte (art. 13 lit. b) |
| **Categorías de titulares** | Clientes personas naturales |
| **Categorías de datos** | Nombre, dirección, comuna, teléfono, correo electrónico, tipo de piscina, día y frecuencia de mantención, ruta asignada, valor del servicio, historial de mantenciones, reparaciones y revestimientos, observaciones de texto libre |
| **Origen** | Directamente del titular al contratar el servicio |
| **Destinatarios internos** | Superadmin, Admin y Técnico (los técnicos acceden a la cartera para ejecutar su ruta) |
| **Encargados** | Proveedor de VPS (alojamiento), Cloudinary (imágenes de trabajos), Google Drive (documentos) |
| **Transferencia internacional** | Sí — ver [encargados-y-transferencias.md](encargados-y-transferencias.md) |
| **Plazo de conservación** | Ver [politica-retencion.md](politica-retencion.md) |
| **Medidas de seguridad** | Autenticación con JWT y control de acceso por rol con denegación por defecto; registro de accesos en `access_audit`; TLS en tránsito; validación de entrada; bloqueo por intentos fallidos con retroceso exponencial |
| **Sistemas** | Tablas `client`, `maintenance`, `repair`, `revestimiento`, `observaciones` |

**Riesgo específico:** el campo `observaciones` es de texto libre y puede recoger información no prevista sobre el titular o su domicilio. Ver la instrucción de uso en [politica-retencion.md](politica-retencion.md).

---

## Ficha 2 — Gestión laboral de trabajadores

| Campo | Contenido |
|---|---|
| **Finalidad** | Administrar la relación laboral: identificación del trabajador, contrato, remuneración, asignación a grupos de trabajo y seguimiento de su estado |
| **Base de licitud** | Ejecución del contrato de trabajo y cumplimiento de obligaciones legales del empleador (art. 13 lit. b y c) |
| **Categorías de titulares** | Trabajadores de la empresa |
| **Categorías de datos** | Nombre, apellido, **RUT y dígito verificador**, correo electrónico, teléfono, domicilio, fecha de inicio y término de contrato, **remuneración**, tipo de contrato, estado, grupo, notas asociadas |
| **Origen** | Directamente del trabajador y de la documentación laboral |
| **Destinatarios internos** | Superadmin y Admin |
| **Encargados** | Proveedor de VPS |
| **Transferencia internacional** | Sí — alojamiento |
| **Plazo de conservación** | Durante la relación laboral y el plazo de prescripción de las acciones laborales y tributarias posteriores |
| **Medidas de seguridad** | Acceso restringido a Superadmin y Admin; registro de accesos en `access_audit`; validación de RUT y de rangos; TLS en tránsito |
| **Sistemas** | Tablas `employees`, `employee_notes` |

**Riesgo específico — datos sensibles (art. 16).** Dos puntos requieren control:

1. El estado `LICENCIA` del trabajador revela una **licencia médica**, es decir un dato relativo a la salud.
2. `employee_notes.descripcion` es texto libre asociado a un trabajador y puede recoger información de salud, sindical o disciplinaria.

Los datos sensibles requieren consentimiento expreso o una habilitación legal específica. Ver la instrucción de uso en [politica-retencion.md](politica-retencion.md). Además, el art. 154 bis del Código del Trabajo impone al empleador el deber de mantener reserva de los datos privados del trabajador.

---

## Ficha 3 — Gestión de pagos y comprobantes

| Campo | Contenido |
|---|---|
| **Finalidad** | Registrar los comprobantes de pago asociados a clientes y a operaciones de la empresa |
| **Base de licitud** | Ejecución del contrato y cumplimiento de obligaciones tributarias (art. 13 lit. b y c) |
| **Categorías de titulares** | Clientes y contrapartes de pago |
| **Categorías de datos** | Nombre del titular del comprobante, tipo de documento, fecha de emisión, monto, documento adjunto |
| **Destinatarios internos** | Superadmin y Admin |
| **Encargados** | Google Drive (almacenamiento de los documentos) |
| **Transferencia internacional** | Sí — Google |
| **Plazo de conservación** | Plazo tributario aplicable |
| **Medidas de seguridad** | Acceso restringido a Superadmin y Admin; los archivos solo se sirven si están registrados en la aplicación; descarga forzada como adjunto |
| **Sistemas** | Tabla `comprobante_pago`, `uploaded_files`, Google Drive |

---

## Ficha 4 — Cuentas de usuario del sistema

| Campo | Contenido |
|---|---|
| **Finalidad** | Autenticar y autorizar al personal que opera la aplicación, y dejar traza de sus accesos |
| **Base de licitud** | Interés legítimo del responsable en la seguridad del tratamiento (art. 13 lit. e), y obligación de adoptar medidas de seguridad (art. 14 quinquies) |
| **Categorías de titulares** | Personal de la empresa con acceso al sistema |
| **Categorías de datos** | Nombre, apellido, correo electrónico, nombre de usuario, contraseña cifrada, rol, último acceso, intentos fallidos, estado de bloqueo |
| **Destinatarios internos** | Superadmin y Admin |
| **Plazo de conservación** | Mientras dure la relación con la empresa; baja inmediata al término |
| **Medidas de seguridad** | Contraseñas con bcrypt; tokens tipificados con emisor y audiencia; rotación de refresh token con detección de reutilización; cierre de sesión efectivo en el servidor |
| **Sistemas** | Tablas `user`, `roles`, `role_users` |

---

## Ficha 5 — Registro de accesos y auditoría

| Campo | Contenido |
|---|---|
| **Finalidad** | Acreditar el cumplimiento (art. 3 lit. g), detectar accesos indebidos y poder dimensionar el alcance de una eventual brecha para notificarla |
| **Base de licitud** | Cumplimiento de una obligación legal del responsable (art. 13 lit. c) |
| **Categorías de titulares** | Personal de la empresa con acceso al sistema |
| **Categorías de datos** | Identificador y nombre de usuario, acción, entidad y registro afectado, método y ruta HTTP, código de respuesta, dirección IP, agente de usuario, fecha |
| **Qué NO se registra** | El contenido de los datos accedidos, ni la cadena de consulta (los filtros llevan nombre y teléfono). El registro de auditoría no debe convertirse en una segunda copia de los datos personales |
| **Destinatarios internos** | Superadmin |
| **Plazo de conservación** | Mínimo 12 meses. Definir el máximo en [politica-retencion.md](politica-retencion.md) |
| **Sistemas** | Tablas `access_audit`, `data_deletion_log`, `migration_audit` |

---

## Ficha 6 — Comunicaciones transaccionales

| Campo | Contenido |
|---|---|
| **Finalidad** | Enviar correos de activación de cuenta, restablecimiento de contraseña y alertas internas de stock |
| **Base de licitud** | Ejecución del contrato y medidas de seguridad (art. 13 lit. b y e) |
| **Categorías de titulares** | Personal de la empresa |
| **Categorías de datos** | Nombre, correo electrónico, enlaces con token de un solo uso |
| **Encargados** | Google (Gmail SMTP) |
| **Transferencia internacional** | Sí — Google |
| **Sistemas** | Módulo `mail` |

**Nota:** no existe hoy ninguna finalidad de marketing o comunicaciones comerciales. Si se agrega, requiere **una ficha propia y consentimiento separado y revocable**: la base contractual de la Ficha 1 no la cubre.

---

## Control de cambios

| Fecha | Cambio | Responsable |
|---|---|---|
| 2026-08-08 | Versión inicial, derivada de la auditoría técnica del sistema | [NOMBRE RESPONSABLE] |
