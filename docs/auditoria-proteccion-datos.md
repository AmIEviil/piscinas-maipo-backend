# Auditoría de Ciberseguridad y Protección de Datos Personales

**Proyecto:** Piscinas El Maipo (backend NestJS + frontend React/Vite)
**Fecha:** 2026-08-08
**Marco legal aplicable:** Ley 19.628 (vigente), **Ley 21.719** (vigencia 01-12-2026), Ley 21.663 (Marco de Ciberseguridad), Código del Trabajo art. 154 bis.

> **Plazo crítico:** quedan ~16 semanas para el 1 de diciembre de 2026, fecha en que entra en vigencia la Ley 21.719 y comienza a operar la Agencia de Protección de Datos Personales. Multas: hasta 5.000 UTM (graves) y 20.000 UTM (gravísimas); reincidencia hasta 2%–4% de ingresos anuales.

---

## 1. Resumen ejecutivo

El sistema trata datos personales de **clientes** (nombre, dirección, comuna, teléfono, email) y **trabajadores** (nombre, RUT, dirección, teléfono, email, **sueldo**, tipo de contrato, notas de texto libre). El RUT y la remuneración están explícitamente cubiertos por la Ley 21.719 y por el deber de reserva del art. 154 bis del Código del Trabajo.

Se hizo un trabajo previo de endurecimiento visible en el código (helmet, throttling, `synchronize` fail-closed, guardia global de JWT, anti-enumeración parcial en login, hash de refresh token). Sobre esa base quedan **5 hallazgos críticos, 10 altos, 10 medios** y un **cumplimiento normativo prácticamente inexistente** (sin política de privacidad, sin registro de actividades de tratamiento, sin procedimiento ARCOP, sin contratos de encargado, sin procedimiento de brechas).

| Severidad | Cantidad | Bloquea cumplimiento |
|---|---|---|
| Crítico | 4 (+1 rebajado a alto tras acotar el alcance) | Sí |
| Alto | 10 | Sí |
| Medio | 10 | Parcial |
| Cumplimiento normativo | 8 | Sí |

**Estado:** las cuatro fases del plan están implementadas en lo que depende del código. Ver sección 4.

La documentación normativa de la Fase 2 está en [`docs/proteccion-datos/`](proteccion-datos/README.md). **Todos esos documentos contienen marcadores entre corchetes** (razón social, RUT, domicilio, plazos) que deben completarse antes de publicarlos: no se rellenaron con valores inventados porque una política de privacidad con datos societarios incorrectos es en sí misma un incumplimiento.

Durante la implementación aparecieron **tres defectos adicionales** que la revisión estática inicial no había detectado; están descritos como A-11, A-12 y M-11.

---

## 2. Inventario de datos personales tratados

| Entidad | Archivo | Datos personales | Categoría Ley 21.719 |
|---|---|---|---|
| `Client` | `src/clients/entities/clients.entity.ts` | nombre, dirección, comuna, teléfono, email | Datos personales comunes |
| `Employee` | `src/empleados/entities/empleado.entity.ts` | nombre, apellido, **RUT + DV**, email, teléfono, dirección, **sueldo**, tipo y fechas de contrato | Comunes + datos de situación socioeconómica (art. 2 lit. g) |
| `EmployeeNote` | `src/empleados/entities/employee_notes.entity.ts` | `descripcion` texto libre asociado a un trabajador | **Riesgo de datos sensibles** (salud, licencias médicas) |
| `User` | `src/users/entities/user.entity.ts` | nombre, email, credenciales, `last_login`, intentos fallidos | Comunes + credenciales |
| `Vehicle` | `src/vehicles/entities/vehicle.entity.ts` | `chofer_asignado`, `copiloto_asignado` (nombres) | Comunes |
| `ComprobantePago` | `src/pagos/entities/comprobante-pago.entity.ts` | nombre, monto, documento adjunto | Comunes + económicos |
| `UploadedFiles` | `src/uploaded-files/entities/uploaded-files.entity.ts` | metadatos y URL de documentos en Google Drive | Depende del contenido |
| `Observaciones` | `src/observaciones/entity/observaciones.entity.ts` | texto libre sobre clientes | Riesgo de datos no previstos |

**Encargados de tratamiento identificados** (art. 15 y ss.): Cloudinary (imágenes), Google Drive (documentos), Gmail/Google Workspace (correo transaccional), proveedor de VPS (72.61.219.117), Render (referencia comentada en el `.env` del frontend). **Todos ellos implican transferencia internacional de datos** (art. 27–29): ninguno tiene contrato de encargo ni evaluación documentada.

---

## 3. Hallazgos

### 3.1 CRÍTICOS

---

**C-1 — Tráfico sin TLS: datos personales viajan en texto claro**

`src/main.ts:14-17` incluye en la whitelist de CORS `http://72.61.219.117` y `http://72.61.219.117:80`. El `.env` del frontend apunta a `http://localhost:3000`. `docker-compose.yml` expone `backend:3001` y `frontend:8080` sin proxy inverso ni terminación TLS.

Consecuencia: credenciales, JWT, RUT, sueldos y direcciones de clientes son interceptables en cualquier salto de red. Incumple directamente el deber de seguridad (art. 14 quinquies Ley 21.719) y hace inviable acreditar medidas técnicas adecuadas.

---

**C-2 — Inyección SQL por el parámetro `orderBy`**

```ts
// src/clients/clients.service.ts:158
query.orderBy(`client.${filters.orderBy}`, filters.orderDirection);

// src/empleados/empleados.service.ts:57
query.orderBy(`employee.${filters.orderBy}`, ...);
```

La causa raíz es que `FilterClientsDto` (`src/clients/dto/FilterClients.dto.ts`) y `FiltersEmployeesDto` (`src/empleados/dto/FiltersEmployees.dto.ts`) están declarados como **`interface`, no como clase**. Una interfaz se borra en compilación, por lo que el `ValidationPipe` global no tiene metatipo que validar y deja pasar el valor sin filtrar. TypeORM no parametriza la expresión de columna en `orderBy`: la concatena.

`GET /api/clients/filter?orderBy=...` **no tiene `@Roles`** (`src/clients/clients.controller.ts:39`), por lo que es alcanzable por **cualquier usuario autenticado**, incluido el rol `Tecnico` y el rol `Cliente`. El de empleados requiere Admin, pero expone la tabla de RUT y sueldos.

`orderDirection` sufre el mismo problema: el tipo `'ASC' | 'DESC'` no existe en runtime.

---

**C-3 — Llave privada SSH sin proteger junto al código** *(severidad rebajada: no está versionada)*

`vps_key.pem` en la raíz del monorepo, cabecera `-----BEGIN OPENSSH PRIVATE KEY-----`. Da acceso al servidor que aloja la base de datos con datos personales.

**Alcance confirmado con el equipo:** solo `piscinas-maipo-frontend/` y `piscinas-maipo-backend/` están bajo control de versiones. La raíz del monorepo (incluidos `vps_key.pem` y `docker-compose.yml`) **no está en GitHub**. Por lo tanto la llave nunca se publicó y no hay que rotarla por este motivo.

Riesgo residual, no obstante:
- La llave está en texto plano en una estación de trabajo, fuera de un gestor de secretos y sin passphrase verificada. Un robo de equipo o un malware la expone.
- La estructura es frágil: basta que alguien inicialice un repositorio en la raíz, o que se copie el directorio completo, para que la llave entre en el árbol versionado. No existe `.gitignore` en la raíz que lo impida.

Acciones: mover la llave fuera del árbol del proyecto (`~/.ssh/`), verificar que tenga passphrase, y crear un `.gitignore` en la raíz con `*.pem`, `*.key`, `.env` como red de seguridad ante un `git init` futuro.

---

**C-4 — Escalamiento de privilegios en la activación de cuentas**

`PATCH /api/auth/configure/:id` (`src/auth/auth.controller.ts:60`) exige JWT válido pero **nunca verifica que el `:id` del path corresponda al usuario del token**. `AuthService.configureAccount` (`src/auth/auth.service.ts`) solo comprueba que la cuenta no tenga `user_name`.

Cadena de ataque: cualquier usuario autenticado (p. ej. un `Tecnico`) enumera IDs de usuario y toma cualquier cuenta pendiente de activación — incluida una cuenta `Admin` o `Superadmin` recién creada — fijándole nombre de usuario y contraseña propios.

Agravante: `POST /api/auth/register` **devuelve el `activationToken` en el cuerpo de la respuesta HTTP** además de enviarlo por correo (`auth.service.ts`, `createUser`). Ese token es un JWT firmado con el secreto de la aplicación y payload `{ email }`, que es exactamente lo que `JwtStrategy.validate` necesita: **el token de activación es un token de sesión completo de 12 horas**.

Mismo defecto en `PATCH /api/auth/setLogout/:id` (sin verificación de propiedad).

---

**C-5 — Refresh token y access token son indistinguibles**

`AuthService.login` firma ambos con el mismo secreto y el mismo payload `{ email, id }`, variando solo `expiresIn` (12 h vs 7 d). `JwtStrategy` no valida ningún claim de tipo.

Consecuencia: el refresh token funciona como token de acceso con **7 días de validez**. Si se filtra (se entrega al cliente y se guarda en el navegador), la ventana de exposición se multiplica por 14. El token de activación tiene el mismo problema (C-4).

---

### 3.2 ALTOS

---

**A-1 — Ausencia de control de acceso por titular (IDOR sistémico)**

Existe el rol `Cliente` (`src/auth/constants/roles.ts`). Los siguientes endpoints solo exigen JWT válido, sin ninguna restricción de rol ni filtrado por titular:

| Endpoint | Archivo |
|---|---|
| `GET /api/clients` y `GET /api/clients/:id` | `clients.controller.ts:34,62` |
| `GET /api/clients/filter` | `clients.controller.ts:39` |
| `GET /api/maintenances`, `/:id`, `/client/:id` | `maintenance.controller.ts:26,30,53` |
| `GET /api/repairs`, `/:id` | `repairs.controller.ts:24,29` |
| `GET /api/revestimiento`, `/:id` | `revestimientos.controller.ts:24,29` |
| `GET /api/uploaded-files/:parentId` | `uploaded-files.controller.ts:10` |
| `GET /api/pdf/revestimiento-propuesta/:id` y `/html/:id` | `pdf.controller.ts:9,25` |
| `GET /api/products/*` | `products.controller.ts:24-47` |

Un usuario `Cliente` o `Tecnico` puede descargar la base completa de clientes. Esto vulnera el principio de finalidad y proporcionalidad (art. 3 lit. b y c) y el deber de confidencialidad.

---

**A-2 — Módulo PDF sin control de rol y con salida HTML cruda**

`src/pdf/pdf.controller.ts` no declara `@Roles`. `GET /api/pdf/revestimiento-propuesta/html/:id` devuelve HTML generado desde datos de cliente directamente en la respuesta. Además `src/pdf/pdf.service.ts:34` hace `console.log(revestimiento)`, volcando el objeto completo con los datos del cliente al log del servidor.

---

**A-3 — Descarga arbitraria desde Google Drive**

`GET /api/drive/file/:fileId` (`src/google-drive/google-drive.controller.ts:45`) acepta cualquier ID de Drive y lo sirve usando el refresh token OAuth de la aplicación. El alcance no está limitado a la carpeta `GOOGLE_DRIVE_FOLDER_ID`: si esa cuenta de servicio tiene acceso a otros archivos, son alcanzables. Se sirve con `Content-Disposition: inline` y `Content-Type` tomado de Drive, lo que permite renderizar contenido activo desde el origen de la API.

---

**A-4 — Mass assignment por ausencia de DTO**

| Punto | Problema |
|---|---|
| `users.controller.ts:33,38` — `@Body() user: Partial<User>` | `Partial<User>` no es una clase validable; el `ValidationPipe` no la procesa. Un Admin puede escribir `password` **en texto plano** (rompiendo la autenticación), `refresh_token`, `isActive`, `failed_attempts`, `blocked_until`. |
| `empleados.controller.ts:35,40` — `Partial<Employee>` / `Employee` | Sin validación de RUT, email, longitudes ni tipos. |
| `clients.controller.ts:91` — `@Body() dto: UpdateCampoDto[]` | Al ser el metatipo `Array`, Nest **omite la validación de los elementos**. El `@IsIn(ALLOWED_CAMPOS)` de `Campos.dto.ts` nunca se ejecuta, y `clientRepository.merge(existing, {[campo]: valor})` permite escribir cualquier columna. |

---

**A-5 — El cierre de sesión no invalida el token**

`User.session_closed_at` se persiste (`auth.service.ts`, `setSessionClosedAt`) pero `JwtStrategy.validate` (`src/auth/strategies/jwt.strategy.ts`) nunca lo consulta. No hay lista de revocación ni versión de token. Tras "cerrar sesión", el JWT sigue siendo válido hasta 12 horas (y el refresh, 7 días). El frontend solo borra `localStorage`.

---

**A-6 — Operaciones destructivas de esquema expuestas por HTTP**

`src/migraciones/migraciones.controller.ts` expone a cualquier `Admin`:
- `POST /api/migrations/revert-last`
- `POST /api/migrations/execute-all`
- `POST /api/migrations/revert/:migrationName/:userId`

`migration.down()` puede eliminar tablas completas: pérdida masiva e irreversible de datos personales (deber de disponibilidad e integridad, art. 3 lit. f). Además el `userId` que queda en la auditoría **viene del path de la URL, no del JWT** (`migraciones.controller.ts:18,26`), por lo que la atribución del registro de auditoría es falsificable por quien invoca el endpoint.

---

**A-7 — Bloqueo de cuentas inducible por terceros y enumeración de usuarios**

En `AuthService.login`: si la contraseña no cumple el regex de formato, se incrementa `failed_attempts` y a los 5 intentos se bloquea la cuenta **12 horas**. Un atacante que conozca un nombre de usuario puede dejarlo fuera de servicio con 5 peticiones.

Simultáneamente, las respuestas distinguen escenarios: usuario inexistente devuelve el mensaje genérico, pero un usuario existente con contraseña mal formada devuelve `invalid_password_format`, y además existen `inactive_account` y `blocked_until` con la fecha exacta. Eso permite enumerar cuentas válidas, pese al hash señuelo que sí neutraliza la fuga por temporización.

---

**A-8 — Base de datos sin TLS ni cifrado en reposo; credencial por defecto**

`app.module.ts` y `src/data-source.ts` configuran TypeORM sin la opción `ssl`. `docker-compose.yml` usa `POSTGRES_PASSWORD: ${DB_PASSWORD:-root}`: si la variable no está definida, el contenedor arranca con la contraseña `root`. No hay cifrado a nivel de columna para RUT ni sueldos, ni cifrado de volumen documentado.

(`docker-compose.yml` está en la raíz del monorepo, fuera del control de versiones, pero el riesgo del fallback `:-root` es el mismo en el entorno donde se ejecute.)

---

**A-9 — Sin registro de auditoría de acceso a datos personales**

El único registro es `migration_audit` y, parcialmente, `observaciones`. En `ClientsService.updateCampo` (`clients.service.ts:88`) la observación se crea **sin `usuarioId`** y usando `registro_id: user_id`, donde `user_id` es en realidad el id del cliente (el parámetro está mal nombrado). No existe traza de quién consultó, exportó o eliminó datos de clientes o trabajadores.

La Ley 21.719 exige poder **acreditar** el cumplimiento (principio de responsabilidad, art. 3 lit. g). Sin logs de acceso no hay forma de responder a una fiscalización ni de dimensionar una brecha.

---

**A-10 — Eliminación física sin trazabilidad**

`ClientsService.remove`, `UsersService.remove`, `EmpleadosService.remove` ejecutan `repository.delete()` directo. No queda constancia de la supresión (fecha, solicitante, motivo, alcance), que es justamente la evidencia que se necesita para acreditar el ejercicio del derecho de supresión, y no hay borrado en cascada de los archivos asociados en Cloudinary/Drive.

---

**A-11 — La validación del refresh token no comparaba el token completo** *(detectado al implementar la Fase 1)*

El refresh token se almacenaba con `bcrypt.hashSync(refreshToken, 10)` y se verificaba con `bcrypt.compareSync`. **bcrypt trunca su entrada a 72 bytes.** Un JWT es bastante más largo, y dos refresh tokens del mismo usuario comparten cabecera e inicio del payload (`{"id":...,"email":...,"typ":"refresh"...`): sus primeros 72 bytes son idénticos.

Consecuencia: `bcrypt.compareSync` daba por válido cualquier refresh token emitido para ese usuario, incluido uno ya rotado o caducado en la práctica. La comprobación "el refresh token entregado coincide con el almacenado" no distinguía un token de otro, y por tanto ninguna rotación ni detección de reutilización podía funcionar sobre esa base.

Lo detectó un test de rotación escrito durante la Fase 1: el token viejo seguía validando contra el hash del nuevo.

Corregido: el refresh token se almacena como SHA-256 y se compara con `timingSafeEqual`. Un JWT firmado es de alta entropía, así que no necesita una función lenta como bcrypt, cuyo valor está en resistir la adivinación de contraseñas.

El mismo truncamiento afectaba a las contraseñas: el máximo se bajó de 128 a 72 caracteres para que ninguna se corte en silencio.

---

**A-12 — `resetPassword` devolvía el hash del refresh token al cliente** *(detectado al implementar la Fase 1)*

`resetPassword` omitía `password` del objeto de respuesta (`const { password: _pwd, ...userWithoutPassword } = user`) pero dejaba `refresh_token`, es decir el hash de sesión almacenado, viajando al cliente. El mismo patrón estaba en `configureAccount`, que además devolvía ese hash bajo el nombre `refreshToken`, como si fuera el token utilizable.

Corregido en ambos: se eliminan `password` y `refresh_token` de la respuesta y se emiten tokens reales.

---

### 3.3 MEDIOS

**M-1 — Tokens y PII en `localStorage`.** `src/store/AuthStore.ts:18` y `src/core/client/client.ts:17`. Además, el middleware `persist` de Zustand (`src/store/BoundedStore.ts`, clave `piscinas-store`) serializa `userData` completo a `localStorage`, sin expiración y accesible a cualquier script del origen.

**M-2 — Sin paginación.** `clients.findAll`, `empleados.findAll`, `users.findAll` devuelven la tabla completa en una sola respuesta. Facilita la exfiltración masiva y contradice la minimización.

**M-3 — PII en logs.** `pdf.service.ts:34` (objeto completo con datos de cliente), `empleados.service.ts:20` (filtros con nombre y teléfono), `pagos.controller.ts:45` (DTO completo), `repairs.service.ts:50`, `products.service.ts:25,58`. 67 llamadas a `console.*`/`logger.*` en el backend y 60 en el frontend, sin política de retención ni redacción.

**M-4 — Validación de archivos solo por `mimetype` declarado.** `src/utils/file-validation.pipe.ts` confía en el header enviado por el cliente. Sin verificación de magic bytes, sin sanitización del nombre de archivo, sin análisis antimalware.

**M-5 — Sin CSP en el frontend.** `helmet()` protege las respuestas de la API, no la SPA servida por nginx. Sin `Content-Security-Policy`, un XSS extrae directamente los tokens de `localStorage` (M-1).

**M-6 — Token de restablecimiento reutilizable.** `resetPassword` valida el claim `purpose: 'pwd_reset'` (bien) pero el token no es de un solo uso: no hay `jti`, ni versión de contraseña, ni invalidación tras el consumo. Reutilizable durante los 15 minutos de vigencia.

**M-7 — `RolesGuard` con resolución de rol ambigua.** `src/auth/guards/roles.guard.ts` hace `findOne({ where: { user: { id } } })` sin criterio de orden. Si un usuario tuviera más de una fila en `role_user`, el rol efectivo es indeterminado.

**M-8 — Política de contraseñas débil.** El regex `/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*/` usa `|`, por lo que dígito y símbolo son alternativos, no ambos requeridos. `ConfigureAccountDto` acepta mínimo 6 caracteres. Sin verificación contra listas de contraseñas filtradas.

**M-9 — JWT sin `issuer`/`audience`, sin rotación de refresh token.** El refresh token no se rota al usarse (`AuthService.refreshToken` solo emite un nuevo access token), por lo que un refresh robado sirve los 7 días completos sin posibilidad de detectar el uso duplicado.

**M-12 — El despliegue no ejecuta las migraciones y no valida nada antes de publicar.** *(detectado al implementar la Fase 3)*

`.github/workflows/deploy.yml` hace `git reset --hard origin/main`, reconstruye el contenedor y lo levanta. **No ejecuta migraciones en ningún momento**, y `start:prod` en `package.json` es `node dist/main`, no "migraciones y luego arranque" como afirma el `CLAUDE.md` del proyecto. Con `synchronize` ya en fail-closed (correcto), el esquema no se actualiza solo: cualquier tabla nueva simplemente no existe en producción.

Efecto concreto sobre esta rama: sin `yarn migration:run`, los registros de `access_audit` fallan (queda en el log del servidor, no interrumpe la petición) y las supresiones ARCOP fallan por completo.

Además el repositorio del backend **solo tenía `deploy.yml`**: se desplegaba a producción sin lint, sin compilación y sin tests previos. El frontend sí tenía `ci-check.yml`.

Corregido en parte: se añadió `ci-check.yml` al backend, con lint, build, tests y auditoría de dependencias. **No se modificó `deploy.yml`**: ejecutar migraciones automáticamente en cada despliegue es una decisión de operación con riesgo propio (una migración destructiva se aplicaría sola) y corresponde al equipo tomarla. Mientras tanto, `yarn migration:run` es un paso manual obligatorio del despliegue.

Corregir también la línea de `CLAUDE.md` que describe `start:prod`.

---

**M-11 — El esquema de la base de datos no es reproducible desde las migraciones.** *(detectado al implementar la Fase 1)* Las migraciones existentes en `src/migrations/` solo insertan datos semilla (roles, usuarios, columnas sueltas): las tablas se crearon con `synchronize`. No hay forma de reconstruir la base desde cero de manera controlada, lo que afecta a la disponibilidad e integridad de los datos personales ante un incidente y complica cualquier restauración. La migración nueva `CreateAccessAudit` sí crea su tabla, e incluye `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` porque ninguna migración previa la declara.

**M-10 — Cabecera incorrecta en el cliente HTTP.** `src/core/client/client.ts:11` envía `"Access-Control-Allow-Origin": "*"` como cabecera **de solicitud**. No tiene efecto de seguridad y fuerza un preflight en cada petición.

---

### 3.4 BRECHAS DE CUMPLIMIENTO NORMATIVO

Ninguno de estos elementos existe hoy en el proyecto:

| # | Obligación | Referencia Ley 21.719 |
|---|---|---|
| N-1 | Política de privacidad y aviso de tratamiento a clientes y trabajadores | Art. 14 (deber de información y transparencia) |
| N-2 | Registro de actividades de tratamiento | Art. 15 bis |
| N-3 | Determinación y documentación de la base de licitud por finalidad | Art. 12 y 13 |
| N-4 | Procedimiento y canal para derechos ARCOP (acceso, rectificación, cancelación, oposición, **portabilidad**), con respuesta en plazo | Art. 4 a 9 |
| N-5 | Contratos de encargo de tratamiento con Cloudinary, Google, proveedor de VPS, y evaluación de transferencia internacional | Art. 15 y art. 27–29 |
| N-6 | Procedimiento de notificación de brechas a la Agencia y a los titulares | Art. 14 septies |
| N-7 | Plazos de conservación y supresión por tipo de dato | Art. 3 lit. e (principio de finalidad y calidad) |
| N-8 | Tratamiento controlado de datos sensibles potenciales en `employee_notes` (salud, licencias) | Art. 16 |

Adicional: el art. 154 bis del Código del Trabajo obliga a mantener reserva de los datos privados del trabajador — hoy el RUT y el sueldo son alcanzables por cualquier `Admin` sin traza de auditoría (A-9) y expuestos a inyección SQL (C-2).

Sobre la **Ley 21.663 (Marco de Ciberseguridad)**: el proyecto no parece calificar como Operador de Importancia Vital ni como servicio esencial, por lo que las obligaciones ante la ANCI no le aplican directamente. Se recomienda igualmente adoptar su estándar de gestión de incidentes, porque es el criterio de referencia que aplicará la Agencia al evaluar la "diligencia debida" del art. 14 quinquies.

---

## 4. Plan de implementación

### Fase 0 — Contención inmediata (72 horas)

**Implementado en código:**

| Acción | Hallazgo | Archivos |
|---|---|---|
| DTOs de filtro convertidos de `interface` a `class`, con `@IsIn` sobre lista blanca de columnas en `orderBy` y `@IsIn(['ASC','DESC'])` en `orderDirection` | C-2 | `clients/dto/FilterClients.dto.ts`, `empleados/dto/FiltersEmployees.dto.ts` |
| Segunda validación contra la lista blanca dentro del service, antes de interpolar (el service no confía en su entrada) | C-2 | `clients/clients.service.ts`, `empleados/empleados.service.ts` |
| `GET /clients/filter` recibe el DTO completo en vez de parámetros sueltos, para que el `ValidationPipe` global se aplique | C-2 | `clients/clients.controller.ts` |
| Claim `typ` en todos los JWT emitidos (`access`, `refresh`, `pwd_reset`, `activation`), con emisión centralizada y verificación por tipo | C-5 | `auth/constants/token-types.ts`, `auth/auth.service.ts` |
| `JwtStrategy` rechaza todo token cuyo `typ` no sea `access` | C-5 | `auth/strategies/jwt.strategy.ts` |
| `refreshToken()` exige `typ: 'refresh'`: un access token robado ya no prolonga la sesión | C-5 | `auth/auth.service.ts` |
| `configure/:id` pasa a `@Public()` y se autoriza con el token de activación recibido por correo, verificando `typ`, `id` contra el `:id` del path y `email` contra la cuenta | C-4 | `auth/auth.controller.ts`, `auth/auth.service.ts`, `auth/dto/configure-user.dto.ts` |
| `POST /auth/register` deja de devolver el `activationToken` en la respuesta HTTP | C-4 | `auth/auth.service.ts`, front: `service/usuarios.interface.ts` |
| `configureAccount` dejaba de filtrar el **hash bcrypt** del refresh token como si fuera el refresh token (defecto colateral detectado al corregir C-4); ahora emite tokens reales y omite `password` y `refresh_token` de la respuesta | C-4 | `auth/auth.service.ts` |
| Verificación de propiedad en `setLogout/:id` (`req.user.id === :id`) | C-4 | `auth/auth.controller.ts` |
| Throttle de 5/15 min en `configure/:id` | C-4 | `auth/auth.controller.ts` |
| Tests que fijan las invariantes: rechazo por tipo de token, activación cruzada entre usuarios, token expirado, reutilización, no filtración de credenciales | C-4, C-5 | `auth/auth.service.spec.ts`, `auth/strategies/jwt.strategy.spec.ts` |

**Pendiente, requiere acción fuera del código:**

| Acción | Hallazgo | Detalle |
|---|---|---|
| Mover `vps_key.pem` fuera del árbol del proyecto | C-3 | **Parcial.** El `.gitignore` de la raíz ya existe y excluye `*.pem`, `*.key` y `.env`. Falta mover la llave a `~/.ssh/` y verificar que tenga passphrase: los comandos están en `infra/README.md` § 8. No requiere rotación: la raíz no está versionada. |
| Rotar credenciales del `.env` | — | `JWT_SECRET`, contraseña de BD, API secret de Cloudinary, refresh token de Google, app password de Gmail. **La rotación de `JWT_SECRET` es necesaria además por otro motivo**: invalida los tokens ya emitidos sin claim `typ`, que de otro modo seguirían siendo rechazados con un 401 confuso hasta expirar. |

**Cambio incompatible al desplegar:** los tokens emitidos antes de este cambio no llevan el claim `typ` y `JwtStrategy` los rechaza. **Todas las sesiones activas se cerrarán** y los usuarios deberán volver a iniciar sesión. El interceptor de respuesta del frontend ya redirige a `/login` ante un 401, por lo que la transición es automática, pero conviene avisar al equipo antes de publicar.

**Cambio de contrato en la API (Fase 0):**
- `POST /api/auth/register` ya no incluye `activationToken` en la respuesta (solo `message` y `userId`).
- `PATCH /api/auth/configure/:id` ya no requiere cabecera `Authorization`; ahora exige el campo `token` en el cuerpo (el token de activación del correo). El frontend todavía no consume este endpoint, así que no hay ruptura en el cliente actual.

**Cambios de contrato de la Fase 1:**
- `POST /api/auth/login`: la respuesta de error pierde el objeto `details` (`mensaje`, `remaining_attempts`, `blocked_until`) y siempre devuelve `Usuario o contraseña incorrecta`. El frontend solo lee `response.data.message`, así que no hay ruptura; las slices `useShowErrorBoxStore` que exponían el contador de intentos quedan sin fuente de datos (ya estaban sin usar, comentadas en `LoginView.tsx`).
- `POST /api/auth/login`: la respuesta de éxito ya no incluye `failed_attempts`, `blocked_until`, `session_closed_at` ni `last_login`.
- `POST /api/auth/refreshToken`: ahora devuelve también `refreshToken` (rotado). Quien consuma este endpoint debe guardar el nuevo, porque el anterior queda invalidado.
- `PATCH /api/auth/setLogout/:id`: el cuerpo `logout_at` se ignora; la fecha la fija el servidor.
- `POST /api/migrations/execute/:name` y `revert/:name`: se retiró el segmento `/:userId` de la ruta. Frontend actualizado.
- `POST /api/migrations/execute-all` y `revert-last`: eliminados.
- Migraciones: pasan de `Superadmin + Admin` a **solo `Superadmin`**, en línea con la matriz del frontend.
- Contraseñas nuevas: mínimo 12 caracteres con minúscula, mayúscula, dígito y símbolo. Afecta a la activación de cuenta y al restablecimiento; **las contraseñas ya existentes siguen funcionando** porque solo se valida al fijarlas.

**Requiere ejecutar las migraciones** (`yarn migration:run`) antes de arrancar:
- `1786000000000-CreateAccessAudit` — tabla `access_audit`. Si no existe, el interceptor registra el fallo en el log del servidor pero no interrumpe las peticiones.
- `1786000100000-CreateDeletionLog` — tabla `data_deletion_log`. Sin ella, las supresiones ARCOP fallan.

**Dos obstáculos detectados al probar la ejecución, ambos anteriores a esta rama:**

1. `yarn migration:run` abortaba antes de ejecutar nada con `Entity metadata for Product#historial was not found`: `AppDataSource` (`src/data-source.ts`) no compartía la lista de entidades del `AppModule` y le faltaban seis. Daba igual mientras el esquema lo creara `synchronize`; deja de dar igual ahora que hay tablas que solo existen por migración. Corregido.
2. El esquema de producción lo creó `synchronize`, no las migraciones, así que la tabla `migrations` probablemente esté vacía o no exista. En ese estado el CLI da por pendientes **todas** las migraciones desde la primera y ejecuta `CreateRoles`, `CreateClients` y `CreateUsers` sobre tablas que ya existen. Antes de correrlas hay que declarar las seis antiguas como aplicadas sin ejecutarlas; el procedimiento está en `infra/README.md` § 5.1.

Verificado contra una base vacía: las dos migraciones nuevas se aplican, `down()` revierte y una segunda corrida informa `No migrations are pending`.

**Endpoints nuevos de la Fase 2** (todos Superadmin, todos auditados):
- `GET /api/arcop/cliente/:id/exportar`, `GET /api/arcop/empleado/:id/exportar`
- `DELETE /api/arcop/cliente/:id`, `DELETE /api/arcop/empleado/:id` — **irreversibles**, requieren `{ motivo, referencia_solicitud }` en el cuerpo
- `GET /api/arcop/supresiones`

### Fase 1 — Endurecimiento técnico

**Implementado en código.**

**1.1 Transporte y despliegue** — C-1, A-8, M-5

| Acción | Archivos |
|---|---|
| Los orígenes CORS se leen de `FRONTEND_URL` (admite lista separada por comas). Se retiraron las entradas fijas `http://72.61.219.117` y `:80` | `main.ts` |
| En producción la aplicación **aborta el arranque** si algún origen es `http://` o si `FRONTEND_URL` no está definida: mantener un origen sin TLS equivale a aceptar credenciales en texto claro | `main.ts` |
| `trust proxy` activado, para que la auditoría registre la IP real del cliente y no la del proxy, y para que el throttler no cuente todo como un solo origen | `main.ts` |
| TLS hacia la base de datos vía `DB_SSL` / `DB_SSL_REJECT_UNAUTHORIZED` | `app.module.ts`, `data-source.ts`, `.env.example` |
| CSP y cabeceras de seguridad en la SPA (`script-src 'self'` sin `unsafe-inline`, `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`), con la línea de HSTS lista para descomentar cuando haya TLS | `piscinas-maipo-frontend/nginx.conf` |

**1.2 Autorización** — A-1, A-2, A-3, A-4, A-6

| Acción | Archivos |
|---|---|
| `RolesGuard` pasa a **denegar por defecto**: un endpoint sin `@Roles` devuelve 403 en vez de quedar abierto a cualquier usuario autenticado. Honra `@Public()` | `auth/guards/roles.guard.ts` |
| `RolesGuard` evalúa **todos** los roles del usuario (`find` en vez de `findOne`): con varias filas en `role_user` el rol efectivo era indeterminado | `auth/guards/roles.guard.ts` |
| Matriz de roles documentada como constante `ROLE_GROUPS` (STAFF / MANAGEMENT / SUPER_ONLY) y aplicada a los 18 controladores. `Cliente` no aparece en ningún grupo | `auth/constants/roles.ts` y todos los controladores |
| `@Roles` añadido donde no existía: `pdf`, `uploaded-files`, `observaciones`, `vehicles`, y los `GET` de `clients`, `maintenance`, `repairs`, `revestimientos`, `products`, `upload` | varios |
| `GET /` marcado `@Public()` (health check, devuelve una cadena fija) | `app.controller.ts` |
| `Partial<User>` y `Partial<Employee>` reemplazados por DTOs validados que no exponen credenciales ni estado de bloqueo | `users/dto/manage-user.dto.ts`, `empleados/dto/empleado.dto.ts` |
| `ParseArrayPipe({ items, whitelist, forbidNonWhitelisted })` en `update-campos`, donde el `@IsIn` nunca llegaba a ejecutarse | `clients/clients.controller.ts` |
| `GET /drive/file/:fileId` solo sirve archivos registrados por la aplicación (`UploadedFiles.driveId` o `ComprobantePago.fileId`), con `Content-Disposition: attachment`, `nosniff` y nombre saneado | `google-drive/google-drive.controller.ts` |
| Migraciones restringidas a Superadmin; `execute-all` y `revert-last` retirados; el actor de la auditoría se toma del JWT y no de la URL | `migraciones/migraciones.controller.ts`, front: `MigrationsService.ts`, `MigrationsHooks.ts` |

**1.3 Sesiones y credenciales** — A-5, A-7, A-11, A-12, M-6, M-8, M-9

| Acción | Archivos |
|---|---|
| `JwtStrategy` verifica `iat` contra `session_closed_at` (con 2 s de tolerancia por el redondeo a segundos de `iat`): cerrar sesión ahora invalida el token de verdad | `auth/strategies/jwt.strategy.ts` |
| La marca de cierre la fija el servidor; el `logout_at` que enviaba el cliente se ignora. Cerrar sesión también borra el refresh token | `auth/auth.service.ts`, `auth/auth.controller.ts` |
| Cambiar la contraseña invalida las sesiones abiertas | `auth/auth.service.ts` |
| Rotación del refresh token en cada uso, con detección de reutilización: un token que ya no coincide invalida la familia completa | `auth/auth.service.ts` |
| Refresh token almacenado como SHA-256 con comparación en tiempo constante, en vez de bcrypt (ver A-11) | `auth/auth.service.ts` |
| Login: respuesta idéntica para usuario inexistente, contraseña incorrecta, formato inválido, cuenta inactiva y cuenta bloqueada. Se eliminó el chequeo de formato de contraseña en el login, que solo servía para filtrar la existencia de la cuenta e incrementar el contador ajeno | `auth/auth.service.ts` |
| Bloqueo con retroceso exponencial (1, 2, 4… minutos, tope 30) en lugar de 12 horas fijas | `auth/auth.service.ts` |
| Política de contraseñas: mínimo 12, máximo 72 (límite real de bcrypt), con minúscula, mayúscula, dígito y símbolo **todos** exigidos | `auth/constants/password-policy.ts` |
| `issuer` y `audience` en la emisión y en toda verificación, incluida la estrategia de Passport | `auth/constants/token-types.ts`, `auth/auth.service.ts`, `auth/strategies/jwt.strategy.ts` |

**1.4 Datos y trazabilidad** — A-9, M-1, M-3

| Acción | Archivos |
|---|---|
| Registro de accesos a datos personales: entidad `access_audit` (quién, qué entidad, qué registro, acción, ruta, código de respuesta, IP, user-agent, fecha), interceptor global y decorador explícito `@Audit(entidad)` | `audit/`, migración `1786000000000-CreateAccessAudit.ts` |
| `@Audit` aplicado a `clients`, `empleados`, `users`, `pagos`, `uploaded-files`, `drive` y `pdf` | los siete controladores |
| El registro guarda la ruta pero **no** la query: los filtros llevan nombre y teléfono. Tampoco guarda el contenido accedido, para no crear una segunda copia de los datos personales | `audit/audit.interceptor.ts` |
| PII eliminada de los logs: `pdf.service.ts` (objeto completo del cliente), `repairs.service.ts` (DTO), `products.service.ts` (×2), `empleados.service.ts` (filtros con nombre y teléfono), `pagos.controller.ts` (DTO), `uploaded-files.service.ts` (nombres y URL de Drive), `google-drive.controller.ts` (nombre de archivo) | varios |
| La respuesta del login se reduce a lo que la interfaz usa: se dejaron de enviar `failed_attempts`, `blocked_until`, `session_closed_at` y `last_login` | `auth/auth.service.ts` |
| El `persist` de Zustand ya no serializa el usuario completo a `localStorage`: solo `id`, `user_name` y el rol, que es lo único que la UI consulta tras recargar. `token` deja de duplicarse en esa clave | `store/BoundedStore.ts` |
| `updateCampo` registra el autor del cambio (`usuarioId`), que faltaba, y el parámetro `user_id` mal nombrado pasa a `clientId` | `clients/clients.service.ts`, `clients/clients.controller.ts` |

**1.5 Archivos** — M-4

| Acción | Archivos |
|---|---|
| Validación por firma real del contenido (magic bytes) para JPEG, PNG, GIF, WebP, PDF, DOC y DOCX, exigiendo además que coincida con el tipo declarado. Antes la única comprobación era la cabecera `Content-Type` que envía el cliente | `utils/file-validation.pipe.ts` |
| Saneamiento del nombre de archivo (se quitan rutas y caracteres de control) antes de que llegue a Drive o Cloudinary | `utils/file-validation.pipe.ts` |

**Pendiente dentro de la Fase 1, con motivo:**

| Punto | Por qué no se hizo ahora |
|---|---|
| `forbidNonWhitelisted: true` en el `ValidationPipe` global | El formulario de empleados envía `fechaTerminoContrato`, `notas` e `id`, campos que los DTOs no declaran; activarlo devolvería 400 y rompería el alta de empleados. `whitelist: true` ya descarta esos campos antes de llegar al service, que es lo que cierra el mass assignment; `forbidNonWhitelisted` solo convierte el descarte silencioso en error. Requiere primero alinear los payloads del frontend. |
| Paginación obligatoria | Cambia la forma de la respuesta (`Client[]` pasa a `{items, total}`) y afecta a todas las vistas de listado. Es una refactorización de frontend, no un cambio de seguridad aislado. El riesgo de extracción masiva quedó mitigado por la restricción de roles y por el registro de accesos. |
| Cookie `httpOnly` para el access token | Requiere CORS con credenciales y protección CSRF; sin CSRF, mover el token a cookie **empeora** la postura. Se redujo mientras tanto la superficie en `localStorage`. |
| Cifrado de columna para `Employee.rut` y `Employee.sueldo` | Necesita gestión de claves (dónde vive la clave, cómo se rota) y migración de los datos existentes. Hacerlo a medias da una falsa sensación de protección. |
| Contraste de contraseñas contra listas filtradas (HIBP) | Añade una dependencia de red en el flujo de activación; conviene decidir si se usa el rango k-anonymity en línea o una lista local. |
| Access token a 1 h | No hay flujo de refresh conectado en el frontend (`AuthService.ts` no llama a `refreshToken`). Bajar el TTL cerraría la sesión cada hora. Primero hay que cablear el refresh, que ya está listo y con rotación en el backend. |
| Antimalware en las subidas | Requiere un servicio externo (ClamAV o equivalente) y una decisión de infraestructura. |

**Fuera del código:** el fallback `:-root` de `docker-compose.yml` ya no existe; `DB_PASSWORD`, `JWT_SECRET` y `FRONTEND_URL` son ahora variables obligatorias y `docker-compose` falla nombrando la que falte en vez de arrancar con `root`. Backend y frontend pasan a publicarse solo en `127.0.0.1`.

La configuración del reverse proxy con TLS y Let's Encrypt está escrita y validada con `nginx -t` en `infra/nginx/piscinas.conf` e `infra/docker-compose.proxy.yml`, con el procedimiento completo en `infra/README.md`. **Falta aplicarla en el VPS**, junto con el dominio propio en lugar de `72.61.219.117` y el cifrado del volumen de datos. Estos archivos viven en la raíz del monorepo, que no está versionada.

### Fase 2 — Cumplimiento normativo

**Documentación redactada** en [`docs/proteccion-datos/`](proteccion-datos/README.md):

| Documento | Cubre | Estado |
|---|---|---|
| `registro-actividades-tratamiento.md` | N-2, N-3 (art. 15 bis). Seis fichas: clientes, trabajadores, pagos, cuentas de usuario, auditoría y comunicaciones transaccionales, con base de licitud, categorías, destinatarios, encargados, transferencias y medidas | Completo; faltan los plazos y los datos societarios |
| `politica-privacidad.md` | N-1 (art. 14). Texto listo para publicar | Faltan datos societarios |
| `avisos-de-tratamiento.md` | N-1. Textos breves para el punto de recolección: alta de cliente, alta de trabajador, login y recuperación de contraseña, más las instrucciones operativas sobre campos de texto libre | Redactado; pendiente integrarlo en los formularios |
| `procedimiento-arcop.md` | N-4 (arts. 4 a 9). Flujo completo con verificación de identidad, plazos, plantillas de respuesta y registro de solicitudes | Completo |
| `encargados-y-transferencias.md` | N-5 (arts. 15, 27 a 29). Inventario de los cinco encargados con acciones concretas y cláusulas mínimas del contrato | Inventario completo; contratos pendientes de suscribir |
| `procedimiento-brechas.md` | N-6 (art. 14 septies). Detección, contención, evaluación de riesgo, notificación y registro, con plantillas | Completo |
| `politica-retencion.md` | N-7, N-8 (art. 3 lit. e, art. 16). Matriz de retención, baja de cuentas, control de datos sensibles y diseño de la purga automática | Faltan los plazos concretos |

**Soporte técnico de ARCOP implementado** (2.2):

| Acción | Archivos |
|---|---|
| Módulo `arcop` restringido a Superadmin y auditado | `arcop/arcop.controller.ts`, `arcop/arcop.module.ts` |
| Exportación completa y estructurada de un cliente (ficha, mantenciones, reparaciones, revestimientos, observaciones, inventario de archivos y comprobantes) y de un trabajador (ficha, datos laborales, notas) — derechos de acceso y portabilidad | `arcop/arcop.service.ts` |
| Supresión transaccional con constancia del alcance. Borra explícitamente observaciones, archivos y comprobantes, que se enlazan por un id suelto sin clave foránea y de otro modo quedarían huérfanos | `arcop/arcop.service.ts` |
| Entidad `data_deletion_log`: guarda metadatos de la operación (entidad, id, motivo, referencia de la solicitud, quién la ejecutó, recuento por tabla) y **nunca los datos suprimidos** — conservar una copia bajo el nombre de "auditoría" vaciaría de contenido la supresión. Hay un test que lo verifica | `arcop/entities/deletion-log.entity.ts`, migración `1786000100000` |
| La respuesta indica en `requiere_accion_manual` cuando quedan archivos en Google Drive por eliminar en el proveedor | `arcop/arcop.service.ts` |
| `GET /api/arcop/supresiones`: evidencia ante fiscalización o reclamo | `arcop/arcop.controller.ts` |

La **rectificación** no necesitó endpoints nuevos: se hace por los de actualización existentes, que ya dejan traza en `access_audit` con el usuario que hizo el cambio.

**Pendiente de la Fase 2, con motivo:**

| Punto | Por qué |
|---|---|
| Completar los marcadores de los documentos | Requieren razón social, RUT, domicilio, correo de contacto y los plazos de conservación, que dependen de obligaciones tributarias y laborales concretas. No se inventaron. |
| Publicar la política de privacidad en una ruta `/privacidad` del frontend | Depende de que el texto esté completo. La ruta debe ser pública, sin sesión. |
| Integrar los avisos de tratamiento en los formularios | Depende del texto final; implica cadenas nuevas en `src/locales/`. |
| Interfaz para los endpoints ARCOP | La supresión es irreversible: exponerla en la UI requiere confirmación explícita en dos pasos. Mientras tanto se invocan directamente, con la traza correspondiente. |
| Purga automática por vencimiento de plazos | **No debe implementarse antes de fijar los plazos.** Una purga con un plazo equivocado destruye datos que había obligación de conservar, y es irreversible. El diseño está descrito en `politica-retencion.md`. |
| Suscribir los DPA y verificar el alcance OAuth de Google Drive | Acciones contractuales y de configuración en los proveedores, fuera del código. Checklist en `encargados-y-transferencias.md`. |

### Fase 3 — Gobernanza y verificación continua

**Implementado.** El documento [`gobernanza.md`](proteccion-datos/gobernanza.md) recoge roles y responsabilidades, el calendario de revisiones (trimestral, semestral, anual y al alta y baja de personal), el checklist de cambios al sistema, el estado del modelo de prevención del art. 49 y los indicadores a seguir.

Los controles que se podían automatizar, se automatizaron: un checklist que depende de que alguien se acuerde de leerlo no es un control.

| Acción | Archivos |
|---|---|
| Test que recorre el código y falla si aparece un controlador sin `@Roles` ni `@Public`, uno con datos personales sin `@Audit`, o cualquiera que conceda acceso al rol `Cliente` | `src/audit/cobertura-controladores.spec.ts` |
| CI en el backend con lint, build, tests y auditoría de dependencias. **El repositorio solo tenía `deploy.yml`: se desplegaba a producción sin ninguna validación previa** | `.github/workflows/ci-check.yml` |
| Plantilla de pull request con el checklist de protección de datos, en ambos repositorios | `.github/pull_request_template.md` |

**Pendiente, requiere decisión o datos de la empresa:**

| Punto | Motivo |
|---|---|
| Designar el punto de contacto y publicarlo | La ley no obliga a un delegado en una empresa de este tamaño, pero sin un destinatario único las solicitudes se pierden |
| Completar los tres elementos abiertos del modelo de prevención (art. 49) | Conviene hacerlo **después** de cerrar las acciones técnicas y contractuales: un modelo que documenta controles inexistentes acredita que se conocía el riesgo |
| Acuerdo de confidencialidad para el personal con acceso | Documento laboral; debe redactarlo asesoría legal |
| Arrancar el calendario de revisiones | Requiere asignar nombres y horas |
| Prueba de restauración de respaldos y test de penetración | Requieren entorno y autorización |

---

## 5. Priorización sugerida

| Semana | Foco | Estado |
|---|---|---|
| 0 (72 h) | Fase 0: SQL injection, `configure/:id`, tipos de token | **Hecho** (queda mover la llave SSH y rotar credenciales) |
| 1–2 | Autorización, sesiones, auditoría de accesos, validación de archivos, CSP (1.1–1.5) | **Hecho en código** |
| 2–3 | Despliegue: reverse proxy con TLS, dominio propio, `docker-compose`, cifrado de volumen | `docker-compose` **hecho**; proxy y certbot escritos y validados en `infra/`, **pendiente aplicar en el VPS** |
| 3–4 | Alinear payloads del frontend y activar `forbidNonWhitelisted`; cablear el flujo de refresh y bajar el access token a 1 h; paginación | Pendiente |
| 1–2 | Fase 2: registro de actividades, política, avisos, procedimientos ARCOP y de brechas, retención, endpoints ARCOP | **Hecho** (borradores + código) |
| 3–4 | Completar datos societarios y plazos en los siete documentos; validación legal | Pendiente (requiere datos de la empresa) |
| 5–6 | Publicar la política en `/privacidad`; integrar los avisos en los formularios; cifrado de columna para RUT y sueldo | Pendiente |
| 7–9 | Suscribir DPA, reducir el alcance OAuth de Drive, resolver Render (2.3) | Pendiente (contractual) |
| 9–10 | Simulacro de brecha; interfaz para ARCOP | Pendiente |
| 1–2 | Fase 3: gobernanza, controles automatizados en CI, plantillas de PR | **Hecho** |
| 11–14 | Fijar plazos e implementar la purga automática; arrancar el calendario de revisiones | Pendiente |
| 15–16 | Revisión final, pruebas de penetración, evidencia de cumplimiento lista antes del 01-12-2026 | Pendiente |

---

## 6. Advertencia de alcance

Esta auditoría se basa exclusivamente en la revisión estática del código fuente del monorepo. Solo `piscinas-maipo-frontend/` y `piscinas-maipo-backend/` están bajo control de versiones; los archivos de la raíz (`docker-compose.yml`, `vps_key.pem`, este documento) no están en GitHub, lo que se tuvo en cuenta al graduar C-3.

**No cubre**: configuración real del servidor de producción, reglas de firewall, estado del sistema operativo del VPS, configuración efectiva de Cloudinary y Google Drive, respaldos existentes, ni pruebas dinámicas de explotación. Se recomienda una revisión de infraestructura y un test de penetración una vez completada la Fase 1.

Este documento es un análisis técnico de cumplimiento y no constituye asesoría legal. La redacción final de la política de privacidad, los contratos de encargo y el modelo de prevención de infracciones debe ser validada por un abogado especialista en protección de datos.
