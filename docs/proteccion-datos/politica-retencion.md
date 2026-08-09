# Política de conservación y supresión de datos

**Base legal:** art. 3 lit. e Ley 21.719 (principio de finalidad y calidad): los datos deben conservarse solo mientras sean necesarios para la finalidad que justificó su tratamiento.

> **Los plazos marcados con `[N]` deben validarse con contabilidad y con asesoría laboral antes de aplicarse.** Dependen de obligaciones tributarias y de los plazos de prescripción de las acciones laborales, que no se pueden deducir del código.

---

## Matriz de retención

| Dato | Plazo propuesto | Fundamento | Qué hacer al vencer |
|---|---|---|---|
| Ficha de cliente activo | Mientras dure la relación de servicio | Ejecución del contrato | — |
| Ficha de cliente dado de baja | `[N]` años desde el término del servicio | Plazo de prescripción de acciones contractuales | Supresión |
| Historial de mantenciones y reparaciones | Igual que la ficha del cliente | Respaldo del servicio prestado y de la garantía | Supresión |
| Revestimientos e imágenes asociadas | Igual que la ficha del cliente, salvo garantía vigente más larga | Garantía del trabajo | Supresión, incluidas las imágenes en Cloudinary |
| Observaciones sobre clientes | Igual que la ficha del cliente | — | Supresión |
| Ficha de trabajador activo | Mientras dure la relación laboral | Contrato de trabajo | — |
| Ficha de trabajador desvinculado | `[N]` años desde el término | Prescripción de acciones laborales y obligaciones previsionales | Supresión |
| Notas de trabajadores | Igual que la ficha, o antes si dejan de ser necesarias | — | Supresión |
| Comprobantes de pago y documentos tributarios | `[N]` años | Obligación tributaria | Supresión |
| Cuentas de usuario del sistema | Baja **inmediata** al término de la relación | Seguridad | Desactivar (`isActive = false`) y suprimir a los `[N]` meses |
| Registro de accesos (`access_audit`) | Mínimo 12 meses, máximo `[N]` | Acreditación del cumplimiento y análisis de brechas | Purga automática |
| Constancias de supresión (`data_deletion_log`) | `[N]` años, superior al de los datos que acreditan | Es la prueba de que la supresión se hizo | Conservar |
| Expedientes de solicitudes ARCOP | `[N]` años desde la respuesta | Prueba de haber atendido el derecho | — |
| Registro de incidentes y brechas | `[N]` años | Acreditación ante la Agencia | — |
| Copias de cédula recibidas para verificar identidad | **Eliminar apenas verificada la identidad** | Minimización | Eliminación inmediata |

**Criterio general:** cuando un dato ya no sirve a la finalidad que lo justificó y no hay obligación legal de conservarlo, se suprime. Conservar "por si acaso" no es una base de licitud.

---

## Baja de cuentas de usuario

Es el punto de mayor riesgo práctico: una cuenta de un trabajador desvinculado que sigue activa es un acceso no controlado a los datos de todos los clientes.

**Al término de la relación, el mismo día:**

1. `PUT /api/users/:id` con `isActive: false`. La estrategia de JWT rechaza los tokens de usuarios inactivos, así que el acceso se corta de inmediato.
2. Verificar en `access_audit` que no haya accesos posteriores.
3. Registrar la baja.

**Revisión trimestral:** contrastar la lista de usuarios activos con la de personal vigente. Cualquier discrepancia se documenta.

---

## Datos sensibles (art. 16)

Los datos sensibles requieren consentimiento expreso o una habilitación legal específica. El sistema **no está diseñado para tratarlos** y no debe acumularlos.

### Dónde pueden entrar sin que nadie lo decida

| Punto | Riesgo |
|---|---|
| `employees.estado = 'LICENCIA'` | Revela una licencia médica: dato de salud |
| `employee_notes.descripcion` | Texto libre asociado a un trabajador: puede recoger salud, afiliación sindical, materias disciplinarias |
| `observaciones.detalle` y `client.observaciones` | Texto libre sobre el cliente o su domicilio; puede recoger datos de terceros que vivan allí |

### Instrucción de uso

Debe comunicarse por escrito a todo el personal con acceso, y figurar junto a los campos correspondientes (ver [avisos-de-tratamiento.md](avisos-de-tratamiento.md)):

> Los campos de texto libre forman parte de los datos del titular y este puede pedir una copia. Registre únicamente lo necesario para el servicio o para la gestión laboral.
>
> **No registre:** diagnósticos, tratamientos ni motivos de licencias médicas; afiliación sindical, política o religiosa; situación económica ajena al servicio; apreciaciones personales; ni datos de terceros que no sean el titular.
>
> Para ausencias por licencia médica basta el estado del trabajador. El motivo no se registra en este sistema.

### Revisión

Semestral: revisar una muestra de `employee_notes` y `observaciones` y depurar lo que exceda la finalidad. Dejar constancia de la revisión.

Si el negocio necesita registrar formalmente licencias médicas, no debe hacerse en un campo de texto libre: requiere un campo estructurado, con control de acceso reforzado y una base de licitud propia documentada en el registro de actividades.

---

## Purga automática

**Pendiente de implementar.** Requiere que los plazos `[N]` estén definidos.

Diseño propuesto: una tarea programada en `src/tasks/` que, con frecuencia diaria:

1. Identifique los registros que superaron su plazo de conservación.
2. Los suprima usando el mismo camino que el ejercicio del derecho de supresión, con `motivo: 'fin_plazo_conservacion'`, de modo que quede constancia en `data_deletion_log`.
3. Purgue `access_audit` más allá del plazo máximo definido.
4. Emita un informe al responsable con lo purgado.

**No implementar la purga antes de fijar los plazos.** Una purga con un plazo equivocado destruye datos que había obligación de conservar, y es irreversible.

Mientras tanto, la revisión de vencimientos se hace manualmente con periodicidad trimestral y se documenta.

---

## Respaldos

Un dato suprimido que sigue vivo en un respaldo no está suprimido.

Definir y documentar:

- Frecuencia y retención de los respaldos.
- Si están cifrados y quién tiene la clave.
- **Cómo se aplica la supresión sobre los respaldos.** El criterio habitual y aceptable es no reescribir los respaldos históricos, pero sí garantizar que, si se restaura uno, se vuelva a aplicar el registro de supresiones (`data_deletion_log`) antes de poner el sistema en servicio. Ese procedimiento debe estar escrito.
- Prueba de restauración documentada, al menos anual.
