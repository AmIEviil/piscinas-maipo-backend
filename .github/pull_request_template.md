## Qué cambia

<!-- Una o dos frases. Qué problema resuelve, no qué archivos toca. -->

## Protección de datos

Marcar lo que aplique. Si nada aplica, indicarlo explícitamente.

- [ ] **No toca datos personales** — el resto de esta sección no aplica
- [ ] Hay un **controlador nuevo** y declara `@Roles` con el grupo mínimo necesario
- [ ] El controlador **toca datos personales** y declara `@Audit(entidad)`
- [ ] Se **recoge un dato personal nuevo**, y es necesario para la finalidad (no "por si acaso")
- [ ] Aparece una **finalidad nueva** de tratamiento → ficha añadida en `docs/proteccion-datos/registro-actividades-tratamiento.md` con su base de licitud
- [ ] Se incorpora un **proveedor externo** que recibirá datos → tiene contrato de encargo suscrito
- [ ] Se añade un **campo de texto libre** asociado a una persona → documentada la instrucción de uso
- [ ] El cambio permite **exportar o descargar** datos personales y queda auditado
- [ ] Ningún `console.log` ni `logger` registra datos personales

> `src/audit/cobertura-controladores.spec.ts` comprueba automáticamente las tres
> primeras casillas. El resto requiere criterio.

## Verificación

- [ ] `yarn build`
- [ ] `yarn test`
- [ ] `yarn lint`
- [ ] Si añade una migración: probada contra una copia de la base

## Notas para quien revise

<!-- Decisiones no obvias, alternativas descartadas, deuda que queda abierta. -->
