# Procedimiento de atención de derechos ARCOP

**Base legal:** arts. 4 a 9 Ley 21.719
**Responsable del procedimiento:** [NOMBRE RESPONSABLE]
**Canal oficial:** [EMAIL CONTACTO DATOS]

---

## 1. Derechos cubiertos

| Derecho | Artículo | Qué puede pedir el titular |
|---|---|---|
| Acceso | 5 | Saber qué datos suyos tratamos y obtener una copia |
| Rectificación | 6 | Corregir datos inexactos, desactualizados o incompletos |
| Supresión | 6 | Que eliminemos sus datos cuando ya no sean necesarios o el tratamiento no se ajuste a la ley |
| Oposición | 8 | Que dejemos de tratar sus datos en determinados casos |
| Portabilidad | 9 | Recibir sus datos en formato estructurado y de uso común |
| Bloqueo | 7 | Suspensión temporal mientras se resuelve una rectificación u oposición |

El ejercicio es **gratuito** y no puede condicionarse a que el titular explique el motivo, salvo cuando la ley lo exija para el derecho concreto.

---

## 2. Flujo

### Paso 1 — Recepción (día 0)

Toda solicitud entra por **[EMAIL CONTACTO DATOS]**. Si llega por otro canal (WhatsApp, teléfono, un técnico en terreno), quien la recibe debe reenviarla a esa casilla el mismo día y avisar al titular de que ese es el canal oficial.

Registrar en la planilla de solicitudes: fecha de recepción, identificación del solicitante, derecho invocado, canal de entrada.

### Paso 2 — Acuse de recibo (dentro de 2 días hábiles)

Responder al titular confirmando la recepción e indicando el plazo de respuesta. Plantilla en la sección 4.

### Paso 3 — Verificación de identidad

**No entregar datos sin verificar quién los pide.** Un procedimiento ARCOP mal verificado es un canal de fuga: basta con escribir a nombre de otro.

- Solicitar copia de la cédula de identidad por ambos lados.
- Contrastar el nombre y, si aplica, el RUT con los datos que tenemos registrados.
- Si escribe desde un correo distinto al registrado, exigir además una verificación adicional (por ejemplo, confirmación desde el correo o teléfono que sí figura en la ficha).
- Si actúa un representante, exigir el poder correspondiente.

Si la identidad no queda acreditada, se rechaza la solicitud explicando por qué y qué falta.

### Paso 4 — Ejecución

| Derecho | Cómo se ejecuta |
|---|---|
| **Acceso / Portabilidad** | `GET /api/arcop/cliente/:id/exportar` o `GET /api/arcop/empleado/:id/exportar`. Devuelve un JSON estructurado con todo lo que la aplicación guarda del titular. Entregarlo junto con una explicación legible de qué significa cada bloque. |
| **Rectificación** | Por los endpoints de actualización habituales (`PUT /api/clients/update/:id`, `POST /api/empleados/:id`). Quedan registrados en `access_audit` con el usuario que hizo el cambio. |
| **Supresión** | `DELETE /api/arcop/cliente/:id` o `DELETE /api/arcop/empleado/:id`, indicando `motivo` y `referencia_solicitud`. Deja constancia en `data_deletion_log` con el alcance. **Es irreversible.** |
| **Oposición** | Es una decisión de negocio. Se materializa dando de baja al titular (`isActive = false`) y, si corresponde, suprimiendo. Documentar la decisión y su fundamento. |
| **Bloqueo** | Marcar al titular como inactivo mientras se resuelve. Registrar la fecha de inicio y de término del bloqueo. |

**Antes de suprimir**, verificar que no exista una obligación legal de conservación vigente (plazos tributarios o laborales). Si la hay, se puede rechazar la supresión de esos datos concretos, explicando cuál es la obligación y hasta cuándo rige, y suprimir el resto.

**La supresión no termina en la base de datos.** La respuesta del endpoint indica en `requiere_accion_manual` cuando quedan archivos asociados en Google Drive: hay que eliminarlos también en el proveedor y dejar constancia de ello.

### Paso 5 — Respuesta (dentro del plazo legal)

Responder por escrito, aunque la respuesta sea negativa. Una solicitud rechazada sin respuesta es un incumplimiento.

Adjuntar la exportación cuando corresponda, en formato JSON o convertida a un formato legible para el titular.

### Paso 6 — Cierre

Registrar en la planilla: fecha de respuesta, resultado (atendida / parcialmente atendida / rechazada), fundamento en caso de rechazo, y referencia a la constancia en `data_deletion_log` si hubo supresión.

**Conservar el expediente de la solicitud**: es la prueba de que se atendió, y es lo primero que pediría la Agencia ante un reclamo.

---

## 3. Registro de solicitudes

Mantener una planilla con, como mínimo:

| Columna | Contenido |
|---|---|
| N° | Correlativo |
| Fecha recepción | |
| Solicitante | Nombre y RUT |
| Tipo de titular | Cliente / Trabajador / Otro |
| Derecho invocado | |
| Identidad verificada | Sí / No, y cómo |
| Fecha de respuesta | |
| Resultado | Atendida / Parcial / Rechazada |
| Fundamento del rechazo | Si aplica |
| Referencia técnica | `data_deletion_log.id` u otra |

---

## 4. Plantillas

### 4.1 Acuse de recibo

> Estimado/a [NOMBRE]:
>
> Confirmamos la recepción de su solicitud de [DERECHO] sobre sus datos personales, ingresada el [FECHA].
>
> Para poder atenderla necesitamos verificar su identidad. Le pedimos responder a este correo adjuntando una copia de su cédula de identidad por ambos lados. Este documento se usará únicamente para verificar su identidad y no se conservará más allá de lo necesario para ello.
>
> Le responderemos dentro del plazo legal desde que contemos con la verificación.
>
> [RAZÓN SOCIAL] — [EMAIL CONTACTO DATOS]

### 4.2 Respuesta a solicitud de acceso o portabilidad

> Estimado/a [NOMBRE]:
>
> En respuesta a su solicitud del [FECHA], adjuntamos la totalidad de los datos personales suyos que tratamos, en formato estructurado.
>
> El archivo contiene sus datos de identificación y contacto, los datos del servicio contratado y el historial de trabajos realizados. Respecto de los documentos adjuntos, se incluye el inventario (nombre, tipo, tamaño y fecha); si desea copia del contenido, indíquenoslo y se la haremos llegar.
>
> Le recordamos que puede solicitar en cualquier momento la rectificación o la supresión de estos datos.
>
> [RAZÓN SOCIAL] — [EMAIL CONTACTO DATOS]

### 4.3 Confirmación de supresión

> Estimado/a [NOMBRE]:
>
> Confirmamos que, en atención a su solicitud del [FECHA], hemos eliminado sus datos personales de nuestros sistemas con fecha [FECHA].
>
> [Si aplica:] Se conservan únicamente [DATOS] por [N] años, por así exigirlo [OBLIGACIÓN LEGAL]. Vencido ese plazo se eliminarán automáticamente.
>
> [RAZÓN SOCIAL] — [EMAIL CONTACTO DATOS]

### 4.4 Rechazo fundado

> Estimado/a [NOMBRE]:
>
> En respuesta a su solicitud del [FECHA], le informamos que no es posible atenderla [total / parcialmente], por el siguiente motivo: [FUNDAMENTO CONCRETO, CON REFERENCIA A LA NORMA U OBLIGACIÓN APLICABLE].
>
> Si no está de acuerdo con esta respuesta, puede reclamar ante la Agencia de Protección de Datos Personales.
>
> [RAZÓN SOCIAL] — [EMAIL CONTACTO DATOS]

---

## 5. Soporte técnico disponible

| Endpoint | Método | Rol | Qué hace |
|---|---|---|---|
| `/api/arcop/cliente/:id/exportar` | GET | Superadmin | Exportación completa de un cliente |
| `/api/arcop/empleado/:id/exportar` | GET | Superadmin | Exportación completa de un trabajador |
| `/api/arcop/cliente/:id` | DELETE | Superadmin | Supresión con constancia. Irreversible |
| `/api/arcop/empleado/:id` | DELETE | Superadmin | Supresión con constancia. Irreversible |
| `/api/arcop/supresiones` | GET | Superadmin | Constancias de supresión (evidencia ante fiscalización) |

Cuerpo requerido en las supresiones:

```json
{
  "motivo": "solicitud_titular",
  "referencia_solicitud": "TICKET-42"
}
```

Valores admitidos en `motivo`: `solicitud_titular`, `fin_plazo_conservacion`, `dato_inexacto`, `otro`.

Todas estas llamadas quedan además en `access_audit`.

**Limitación conocida:** los endpoints no tienen interfaz en el frontend; se invocan directamente. Construir la pantalla es trabajo pendiente. Dado que la supresión es irreversible y restringida a Superadmin, exponerla en la UI requiere primero una confirmación explícita en dos pasos.
