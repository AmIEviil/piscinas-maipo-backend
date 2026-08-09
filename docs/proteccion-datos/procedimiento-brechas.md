# Procedimiento de gestión de brechas de seguridad

**Base legal:** art. 14 septies Ley 21.719
**Responsable:** [NOMBRE RESPONSABLE]
**Contacto de emergencia:** [TELÉFONO] / [EMAIL CONTACTO DATOS]

---

## Qué es una brecha

Cualquier vulneración de la seguridad que ocasione la destrucción, pérdida o alteración accidental o ilícita de datos personales, o la comunicación o acceso no autorizado a ellos.

**Cuenta como brecha, aunque no haya intención:**

- Un acceso no autorizado a la base de datos o al servidor.
- Un correo con datos personales enviado al destinatario equivocado.
- La pérdida o robo de un equipo con acceso al sistema.
- Un archivo con datos de clientes o trabajadores subido a un lugar público por error.
- Un ransomware que cifre la base de datos (pérdida de disponibilidad).
- La filtración de credenciales de un usuario del sistema.
- Un borrado accidental sin respaldo recuperable.

**No es una brecha** un intento fallido que las medidas de seguridad bloquearon, pero sí debe registrarse como incidente si es reiterado o revela una debilidad.

---

## Fase 1 — Detección y contención (primeras horas)

Quien detecte el incidente avisa **de inmediato** a [NOMBRE RESPONSABLE], por teléfono. No esperar a tener el diagnóstico completo.

Acciones de contención, según el caso:

| Situación | Acción inmediata |
|---|---|
| Credenciales comprometidas | Desactivar la cuenta (`isActive = false`) y forzar el cierre de sesión. Al cambiar la contraseña, las sesiones abiertas quedan invalidadas |
| Acceso no autorizado en curso | Rotar `JWT_SECRET`: invalida todos los tokens emitidos y cierra todas las sesiones |
| Servidor comprometido | Aislar de la red. **No apagar**: se pierde la evidencia en memoria. Preservar los logs |
| Fuga por un proveedor | Contactar al encargado y exigir el detalle por escrito |

**Preservar la evidencia.** Copiar los logs del servidor y exportar las tablas `access_audit` y `data_deletion_log` del período afectado antes de cualquier reinstalación. Es lo que permite determinar el alcance.

---

## Fase 2 — Evaluación (dentro de las primeras 24 horas)

Documentar en el registro de incidentes:

1. **Qué pasó** y cómo se detectó.
2. **Cuándo** empezó y cuándo terminó, o si sigue en curso.
3. **Qué datos** están afectados: categorías y volumen aproximado.
4. **Cuántos titulares** y de qué tipo (clientes, trabajadores).
5. **Qué consecuencias** puede tener para esas personas.
6. **Qué medidas** se tomaron y cuáles quedan pendientes.

La tabla `access_audit` es la fuente principal para los puntos 3 y 4: registra quién accedió a qué entidad y qué registro, con fecha e IP.

### Evaluación del riesgo

| Nivel | Cuándo | Ejemplo |
|---|---|---|
| **Bajo** | Datos no identificables o cifrados con clave no comprometida; sin impacto previsible | Filtración de identificadores internos sin contenido |
| **Medio** | Datos identificables, impacto acotado | Acceso indebido a la lista de rutas con nombres y comunas |
| **Alto** | Datos que permiten fraude, suplantación o afectan la esfera privada; o pérdida de disponibilidad prolongada | Filtración de RUT y remuneraciones de trabajadores; filtración de domicilios de clientes; base de datos cifrada por ransomware sin respaldo |

**RUT junto con nombre y domicilio se evalúa siempre como riesgo alto**: es la combinación que habilita la suplantación de identidad.

---

## Fase 3 — Notificación

### A la Agencia de Protección de Datos Personales

**Siempre**, salvo que sea improbable que la brecha entrañe un riesgo para los derechos de los titulares. La ley exige hacerlo **sin dilaciones indebidas**: no esperar a tener la investigación cerrada. Si falta información, notificar lo que se sabe e informar el resto después.

Contenido de la notificación:

- Naturaleza de la brecha.
- Categorías y número aproximado de titulares y de registros afectados.
- Datos de contacto del responsable.
- Consecuencias probables.
- Medidas adoptadas o propuestas, incluidas las de mitigación.

### A los titulares afectados

Cuando la brecha entrañe un **riesgo alto** para sus derechos.

La comunicación debe ser **directa** (correo o teléfono a cada afectado), en lenguaje claro y sin tecnicismos, indicando:

- Qué pasó y qué datos suyos están afectados.
- Qué consecuencias puede tener para ellos.
- **Qué deben hacer**: cambiar contraseñas, estar atentos a intentos de suplantación, etc.
- A quién dirigirse para más información.

No corresponde comunicar individualmente si ello supone un esfuerzo desproporcionado; en ese caso se hace una comunicación pública de efecto equivalente.

### Plantilla de comunicación al titular

> Estimado/a [NOMBRE]:
>
> Le escribimos para informarle de un incidente de seguridad que afectó a datos personales suyos que tratamos.
>
> **Qué ocurrió:** [DESCRIPCIÓN EN LENGUAJE SIMPLE, SIN TECNICISMOS].
>
> **Qué datos suyos se vieron afectados:** [LISTA CONCRETA].
>
> **Qué hemos hecho:** [MEDIDAS DE CONTENCIÓN Y CORRECCIÓN].
>
> **Qué le recomendamos hacer:** [ACCIONES CONCRETAS].
>
> Hemos notificado el incidente a la Agencia de Protección de Datos Personales. Si tiene dudas, escríbanos a [EMAIL CONTACTO DATOS] o llame al [TELÉFONO].
>
> Lamentamos lo ocurrido.
>
> [RAZÓN SOCIAL]

---

## Fase 4 — Registro y cierre

**Toda brecha se registra, se haya notificado o no.** El registro interno es obligatorio y es lo que permite acreditar ante la Agencia que hubo una evaluación y que la decisión de no notificar, si se tomó, estuvo fundada.

| Campo | Contenido |
|---|---|
| N° | Correlativo |
| Fecha y hora de detección | |
| Fecha y hora de inicio estimado | |
| Descripción | |
| Datos y titulares afectados | Categorías y volumen |
| Nivel de riesgo | Bajo / Medio / Alto, con fundamento |
| ¿Se notificó a la Agencia? | Sí/No + fecha, o fundamento de por qué no |
| ¿Se notificó a los titulares? | Sí/No + fecha, o fundamento |
| Medidas de contención | |
| Causa raíz | |
| Medidas correctivas | Con responsable y plazo |
| Fecha de cierre | |

Cerrar el incidente solo cuando las medidas correctivas estén implementadas y verificadas, no cuando se contuvo la brecha.

---

## Simulacro

Hacer al menos **un simulacro anual**. Un procedimiento que nunca se ejecutó falla justo cuando se necesita.

Escenario sugerido para el primero: *filtración de las credenciales de un usuario Admin*. Recorrer el flujo completo, cronometrando desde la detección hasta la notificación redactada. El resultado del simulacro se registra igual que un incidente real, marcado como tal.
