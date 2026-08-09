# Gobernanza de protección de datos

**Base legal:** art. 3 lit. g (responsabilidad), art. 14 quinquies (medidas de seguridad) y art. 49 (modelo de prevención de infracciones) Ley 21.719

La Fase 3 no añade controles nuevos: hace que los de las fases anteriores **sigan existiendo dentro de un año**. Un control que nadie revisa deja de funcionar sin que nadie se entere.

---

## 1. Roles y responsabilidades

| Rol | Quién | Qué le corresponde |
|---|---|---|
| **Responsable del tratamiento** | [RAZÓN SOCIAL] | Responde ante la Agencia y ante los titulares |
| **Punto de contacto en materia de datos** | [NOMBRE RESPONSABLE] | Atiende las solicitudes ARCOP, mantiene el registro de actividades, coordina la respuesta a brechas |
| **Responsable técnico** | [NOMBRE] | Ejecuta las medidas técnicas, mantiene las revisiones periódicas, custodia los secretos |
| **Personal con acceso a datos** | Usuarios Superadmin, Admin y Técnico | Cumple las instrucciones de tratamiento y avisa de cualquier incidente |

### Delegado de protección de datos

La ley no obliga a designarlo en una empresa de este tamaño. **Sí conviene designar un punto de contacto único** y publicarlo: es la persona a la que escribirá un titular o la Agencia, y sin ella las solicitudes se pierden entre correos.

---

## 2. Calendario de revisiones

Cada revisión termina con una constancia escrita, aunque el resultado sea "sin hallazgos". La constancia es la evidencia de diligencia.

### Trimestral

| Revisión | Cómo | Responsable |
|---|---|---|
| **Cuentas activas** | Contrastar `GET /api/users` con la lista de personal vigente. Cualquier cuenta de alguien desvinculado es un acceso no controlado a todos los datos de clientes | Responsable técnico |
| **Matriz de roles** | Verificar que cada usuario tenga el rol mínimo que su función requiere. Revisar que ningún controlador nuevo haya quedado sin `@Roles` | Responsable técnico |
| **Vencimientos de conservación** | Mientras la purga automática no exista, revisar manualmente qué registros superaron su plazo y suprimirlos con `motivo: fin_plazo_conservacion` | Punto de contacto |
| **Solicitudes ARCOP** | Que todas las recibidas estén respondidas y registradas | Punto de contacto |

### Semestral

| Revisión | Cómo | Responsable |
|---|---|---|
| **Campos de texto libre** | Muestra de `employee_notes` y `observaciones`: depurar lo que exceda la finalidad, en particular datos de salud | Punto de contacto |
| **Registro de accesos** | Muestra de `access_audit`: buscar patrones anómalos (accesos masivos, fuera de horario, desde IP desconocidas) | Responsable técnico |
| **Dependencias** | `yarn audit` en ambos repositorios; actualizar lo que tenga vulnerabilidades conocidas | Responsable técnico |
| **Capacitación** | Recordatorio al personal sobre el tratamiento de datos y los campos de texto libre | Punto de contacto |

### Anual

| Revisión | Cómo | Responsable |
|---|---|---|
| **Registro de actividades** | Revisar las seis fichas: ¿hay finalidades nuevas? ¿encargados nuevos? ¿cambió alguna categoría de datos? | Punto de contacto |
| **Encargados y transferencias** | Verificar que los DPA sigan vigentes y que no se hayan incorporado subencargados sin aviso | Punto de contacto |
| **Prueba de restauración de respaldos** | Restaurar un respaldo en un entorno aislado y verificar que los datos estén completos y legibles. Un respaldo que nunca se restauró no es un respaldo | Responsable técnico |
| **Simulacro de brecha** | Ver `procedimiento-brechas.md`. Cronometrar desde la detección hasta la notificación redactada | Ambos |
| **Revisión de la política de privacidad** | Que siga describiendo lo que el sistema realmente hace | Punto de contacto |
| **Prueba de penetración** | Externa, sobre el entorno de producción, con autorización escrita | Responsable técnico |

### Al desvincular a una persona — el mismo día

1. `PUT /api/users/:id` con `isActive: false`. La estrategia de JWT rechaza los tokens de usuarios inactivos, así que el acceso se corta de inmediato.
2. Revisar `access_audit` para confirmar que no hay accesos posteriores.
3. Si tenía acceso a los proveedores (VPS, Cloudinary, Google), revocarlo también ahí.
4. Rotar cualquier secreto que esa persona conociera.
5. Dejar constancia.

---

## 3. Al incorporar personal con acceso

1. Crear la cuenta con el **rol mínimo** necesario. `Técnico` por defecto; `Admin` solo si la función lo exige.
2. Entregar y hacer firmar el acuerdo de confidencialidad.
3. Entregar las instrucciones de tratamiento: qué puede registrarse en los campos de texto libre y qué no (ver `politica-retencion.md`).
4. Informar de que los accesos quedan registrados.
5. Dejar constancia de la entrega.

---

## 4. Al cambiar el sistema

Antes de desplegar un cambio que toque datos personales:

- [ ] ¿Aparece una **finalidad nueva**? Entonces necesita ficha en el registro de actividades y base de licitud documentada.
- [ ] ¿Se recoge un **dato nuevo**? ¿Es necesario para la finalidad, o se está recogiendo "por si acaso"?
- [ ] ¿Hay un **controlador nuevo**? Debe declarar `@Roles`. El guard deniega por defecto, así que el olvido se detecta en la primera petición, pero conviene verificarlo antes.
- [ ] ¿Toca datos personales? Entonces necesita `@Audit(entidad)`.
- [ ] ¿Aparece un **proveedor nuevo**? Necesita contrato de encargo antes de enviarle un solo dato.
- [ ] ¿Se añade un campo de **texto libre**? Evaluar si se puede estructurar; si no, documentar la instrucción de uso.
- [ ] ¿El cambio permite **exportar o descargar** datos? Verificar que quede auditado.

Este checklist debería vivir en la plantilla de pull request de ambos repositorios.

---

## 5. Modelo de prevención de infracciones (art. 49)

Es **voluntario**. Su valor: acreditado ante la Agencia, constituye atenuante al determinar una sanción.

Sus elementos y el estado actual:

| Elemento | Estado |
|---|---|
| Identificación de las actividades de riesgo | Hecho: [auditoría](../auditoria-proteccion-datos.md) y [registro de actividades](registro-actividades-tratamiento.md) |
| Protocolos y procedimientos de prevención | Hecho: procedimientos [ARCOP](procedimiento-arcop.md), [brechas](procedimiento-brechas.md) y [retención](politica-retencion.md) |
| Identificación de procedimientos de gestión de recursos | Pendiente: asignar presupuesto y horas a las revisiones de este documento |
| Supervisión y certificación del modelo | Pendiente: designar al encargado de prevención y definir la periodicidad de la certificación |
| Sanciones internas por incumplimiento | Pendiente: incorporar al reglamento interno |

Recomendación: completar los tres pendientes **después** de cerrar las acciones técnicas y contractuales abiertas. Un modelo de prevención que documenta controles que no existen es peor que no tenerlo, porque acredita que se conocía el riesgo.

---

## 6. Indicadores

Pocos y accionables. Revisar en cada revisión trimestral:

| Indicador | Fuente | Umbral de alerta |
|---|---|---|
| Cuentas activas sin persona vigente detrás | `GET /api/users` vs. planilla | Cualquiera |
| Solicitudes ARCOP fuera de plazo | Planilla de solicitudes | Cualquiera |
| Brechas detectadas y no cerradas | Registro de incidentes | Cualquiera |
| Registros que superaron su plazo de conservación | Consulta manual | Crece entre trimestres |
| Endpoints sin `@Roles` o sin `@Audit` | Revisión de código | Cualquiera |
| Dependencias con vulnerabilidad conocida | `yarn audit` | Severidad alta o crítica |

---

## 7. Estado consolidado

| Frente | Estado |
|---|---|
| Contención inmediata (fase 0) | Hecho en código; falta mover la llave SSH y rotar credenciales |
| Endurecimiento técnico (fase 1) | Hecho en código; falta la infraestructura (TLS, dominio, `docker-compose`, cifrado de volumen) |
| Cumplimiento normativo (fase 2) | Documentos redactados y soporte ARCOP implementado; faltan datos societarios, plazos, DPA y validación legal |
| Gobernanza (fase 3) | Este documento; falta asignar nombres y arrancar el calendario |

**Lo que sigue bloqueando el cumplimiento y no se puede resolver desde el código:**

1. TLS en producción. Mientras la aplicación se sirva por HTTP, ninguna otra medida compensa que las credenciales y los datos personales viajen en claro. La aplicación ya aborta el arranque en producción si el origen configurado es `http://`.
2. Completar los datos societarios y los plazos de conservación en los siete documentos.
3. Suscribir los contratos de encargo con los proveedores.
4. Designar el punto de contacto y publicarlo.

**Decisiones de operación pendientes:**

| Decisión | Contexto |
|---|---|
| ¿Las migraciones se ejecutan solas en el despliegue? | Hoy `deploy.yml` no las ejecuta y `start:prod` tampoco, pese a lo que dice el `CLAUDE.md` del proyecto. Automatizarlo evita olvidos; también hace que una migración destructiva se aplique sola. Mientras no se decida, `yarn migration:run` es un paso manual obligatorio |
| ¿`forbidNonWhitelisted` en el ValidationPipe? | Requiere alinear antes los payloads del frontend, que envían campos que los DTO no declaran |
| ¿Access token a 1 hora? | Requiere cablear el flujo de refresh en el cliente. El backend ya lo tiene, con rotación |
| ¿Cookie `httpOnly` para el token? | Requiere protección CSRF. Sin ella, mover el token a cookie empeora la postura |
| Acuerdo de confidencialidad para el personal con acceso | Documento laboral: debe redactarlo asesoría legal, no se incluyó un borrador aquí |

---

## Control de cambios

| Fecha | Cambio | Responsable |
|---|---|---|
| 2026-08-08 | Versión inicial | [NOMBRE RESPONSABLE] |
