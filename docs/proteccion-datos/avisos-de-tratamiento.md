# Avisos de tratamiento

El art. 14 de la Ley 21.719 exige informar al titular **en el momento de recoger sus datos**, no solo tener una política publicada en algún lugar del sitio. Estos son los textos breves que deben mostrarse en cada punto de recolección.

---

## 1. Alta de cliente

**Dónde:** formulario de creación de cliente (`CreateClientDialog.tsx`), visible antes del botón de guardar.
**Quién lo lee:** el trabajador que da de alta al cliente, que debe habérselo comunicado al cliente al contratar.

> **Tratamiento de datos personales.** Los datos de contacto y de servicio que se registren aquí serán tratados por [RAZÓN SOCIAL] con la única finalidad de prestar y administrar el servicio contratado. No se usarán con fines publicitarios ni se cederán a terceros. El cliente puede solicitar el acceso, la rectificación, la supresión o la portabilidad de sus datos escribiendo a [EMAIL CONTACTO DATOS]. Más información en [SITIO WEB]/privacidad.

**Recordatorio operativo, dirigido al trabajador:**

> El campo *Observaciones* forma parte de la ficha del cliente y este puede solicitar una copia. Registre solo información necesaria para el servicio. No anote apreciaciones personales, datos de salud ni información sobre terceros que vivan en el domicilio.

---

## 2. Alta de trabajador

**Dónde:** formulario de creación de empleado (`CreateEmployeeDialog.tsx`).

> **Tratamiento de datos personales.** Los datos registrados en esta ficha serán tratados por [RAZÓN SOCIAL] para administrar la relación laboral y cumplir con las obligaciones que la ley impone al empleador. El acceso está limitado al personal de administración y todo acceso queda registrado. El trabajador puede solicitar el acceso, la rectificación o la portabilidad de sus datos escribiendo a [EMAIL CONTACTO DATOS].

**Recordatorio operativo, dirigido a quien registra:**

> El campo *Notas* es de texto libre y forma parte de los datos del trabajador, que puede solicitar una copia. **No registre información de salud** (diagnósticos, licencias, tratamientos), afiliación sindical, opiniones políticas ni datos de la vida privada: son datos sensibles y su tratamiento requiere una base legal específica que este sistema no cubre. Para ausencias por licencia médica use únicamente el estado del trabajador, sin detallar el motivo.

---

## 3. Inicio de sesión en el sistema

**Dónde:** pantalla de login, como texto discreto al pie.

> El acceso a este sistema queda registrado (usuario, fecha, acción y dirección IP) con fines de seguridad y de cumplimiento de la normativa de protección de datos.

Esto no es un formalismo: informar del registro de accesos es lo que permite oponerlo a un trabajador en caso de un acceso indebido.

---

## 4. Solicitud de restablecimiento de contraseña

**Dónde:** pantalla de recuperación de contraseña.

> Su correo electrónico se usará únicamente para enviarle el enlace de restablecimiento, válido por 15 minutos.

---

## Pendiente de integración

Estos textos están redactados pero **todavía no aparecen en la interfaz**. Falta:

1. Completar los marcadores con los datos reales de la empresa.
2. Añadir los avisos a los formularios indicados y las cadenas correspondientes a `src/locales/`.
3. Publicar la política de privacidad en una ruta accesible (por ejemplo `/privacidad`) y enlazarla desde los avisos y desde el pie de la pantalla de login. La ruta debe ser pública, sin requerir sesión.
