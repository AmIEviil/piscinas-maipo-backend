# Encargados de tratamiento y transferencias internacionales

**Base legal:** art. 15 (encargados) y arts. 27 a 29 (transferencias internacionales) Ley 21.719

Un **encargado** es quien trata datos personales por cuenta del responsable. La ley exige que esa relación conste en un contrato que fije el objeto, la duración, la naturaleza y la finalidad del tratamiento, las categorías de datos y las obligaciones de las partes.

**Situación actual: no existe contrato de encargo firmado con ninguno de los proveedores listados.** Todos ellos ofrecen un anexo de tratamiento de datos (DPA) de adhesión; el trabajo consiste en revisarlo, aceptarlo formalmente y archivar la evidencia.

---

## Inventario de encargados

### 1. Proveedor de VPS — `[PROVEEDOR]`, IP 72.61.219.117

| Campo | Contenido |
|---|---|
| **Qué trata** | Todo. Aloja la aplicación y la base de datos completa: clientes, trabajadores (RUT y remuneraciones), usuarios, comprobantes |
| **Riesgo** | El más alto del inventario: un fallo aquí compromete la totalidad de los datos |
| **Transferencia internacional** | Determinar el país de alojamiento. **Pendiente de confirmar** |
| **DPA** | Pendiente |
| **Acciones** | 1. Confirmar razón social y jurisdicción del proveedor. 2. Suscribir DPA. 3. Verificar qué personal del proveedor puede acceder al servidor. 4. Confirmar si el volumen de datos está cifrado en reposo. 5. Documentar el régimen de respaldos: dónde se guardan, por cuánto tiempo, quién accede |

### 2. Cloudinary

| Campo | Contenido |
|---|---|
| **Qué trata** | Fotografías de trabajos realizados (revestimientos). Pueden mostrar el domicilio del cliente y, eventualmente, a personas |
| **Transferencia internacional** | Sí — Estados Unidos |
| **DPA** | Cloudinary publica un Data Processing Addendum de adhesión |
| **Acciones** | 1. Aceptar formalmente el DPA y archivar la evidencia. 2. Revisar si el plan contratado permite fijar la región de almacenamiento. 3. Verificar que las URL de las imágenes no sean adivinables ni públicamente listables. 4. Definir qué ocurre con las imágenes cuando un cliente ejerce la supresión |

### 3. Google — Drive

| Campo | Contenido |
|---|---|
| **Qué trata** | Documentos adjuntos y comprobantes de pago, asociados a clientes y a operaciones |
| **Transferencia internacional** | Sí — Estados Unidos |
| **DPA** | Google Workspace incluye Data Processing Amendment |
| **Riesgo específico** | La aplicación usa un refresh token OAuth de una cuenta. **Verificar que el alcance de esa cuenta esté limitado a la carpeta de la aplicación** y no abarque el Drive completo de una persona: el endpoint de descarga ahora comprueba que el archivo esté registrado en la aplicación, pero el alcance del token sigue siendo el que se concedió |
| **Acciones** | 1. Confirmar que la cuenta es de servicio o dedicada, no la cuenta personal de un trabajador. 2. Aceptar el DPA. 3. Limitar el alcance OAuth a `drive.file`. 4. Definir la eliminación de archivos al ejercerse la supresión |

### 4. Google — Gmail SMTP

| Campo | Contenido |
|---|---|
| **Qué trata** | Nombre y correo del personal, en correos de activación de cuenta y restablecimiento de contraseña |
| **Transferencia internacional** | Sí — Estados Unidos |
| **Riesgo específico** | Se usa una contraseña de aplicación (`GMAIL_APP_PASSWORD`) de una cuenta de Gmail. Si es una cuenta personal, hay datos de la empresa en una cuenta que no controla la empresa |
| **Acciones** | 1. Migrar a una cuenta corporativa o a un servicio de correo transaccional. 2. Aceptar el DPA correspondiente |

### 5. Render — *referencia comentada en `piscinas-maipo-frontend/.env`*

| Campo | Contenido |
|---|---|
| **Situación** | Aparece comentada una URL `https://piscinas-maipo-backend.onrender.com` |
| **Acción** | Confirmar si existe un despliegue activo o histórico en Render. Si lo hubo, **verificar si quedaron datos personales allí** y eliminarlos. Si no se usa, borrar la referencia |

---

## Transferencias internacionales

Los arts. 27 a 29 permiten transferir datos al extranjero cuando el país de destino tenga un nivel adecuado de protección, o cuando el responsable adopte garantías apropiadas (cláusulas contractuales, normas corporativas vinculantes) o concurra alguna de las excepciones legales.

Chile no ha emitido aún la lista de países con nivel adecuado. Mientras tanto, la vía practicable es la **garantía contractual**: los DPA de Cloudinary y Google incluyen cláusulas contractuales tipo. Aceptarlos formalmente y archivar la evidencia es lo que permite acreditar la garantía.

**A documentar por cada transferencia:** proveedor, país de destino, categorías de datos, finalidad, mecanismo de garantía invocado y fecha de suscripción.

---

## Cláusulas mínimas de un contrato de encargo

Cuando el proveedor no ofrezca un DPA de adhesión y haya que redactar el contrato, debe contener al menos:

1. Objeto, duración, naturaleza y finalidad del tratamiento.
2. Categorías de datos y de titulares afectados.
3. Obligación de tratar los datos **únicamente** conforme a instrucciones documentadas del responsable.
4. Deber de confidencialidad del personal del encargado.
5. Medidas de seguridad exigibles.
6. Condiciones para subcontratar: autorización previa y traslado de las mismas obligaciones al subencargado.
7. Deber de asistir al responsable en la atención de los derechos de los titulares.
8. Deber de notificar las brechas de seguridad **sin dilaciones indebidas**, con el detalle que el responsable necesita para su propia notificación a la Agencia.
9. Devolución o eliminación de los datos al término del contrato, a elección del responsable, y certificación de la eliminación.
10. Derecho del responsable a auditar o a recibir evidencia del cumplimiento.

---

## Checklist de cierre

- [ ] Confirmar razón social, jurisdicción y régimen de respaldos del proveedor de VPS
- [ ] Suscribir DPA con el proveedor de VPS
- [ ] Aceptar y archivar el DPA de Cloudinary
- [ ] Aceptar y archivar el DPA de Google
- [ ] Verificar y reducir el alcance OAuth de Google Drive a `drive.file`
- [ ] Migrar el correo saliente a una cuenta corporativa
- [ ] Resolver la situación de Render
- [ ] Documentar cada transferencia internacional en el registro de actividades
- [ ] Definir el procedimiento de eliminación de archivos en Cloudinary y Drive al ejercerse la supresión
