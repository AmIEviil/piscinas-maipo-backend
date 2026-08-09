// Politica de contrasenas.
//
// El regex anterior era /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*/
// El `|` hacia que digito y simbolo fueran alternativos, no ambos exigidos, y
// el minimo en la activacion de cuenta era de 6 caracteres.
export const PASSWORD_MIN_LENGTH = 12;
// bcrypt trunca su entrada a 72 bytes. Aceptar mas seria admitir contrasenas
// cuyo final se descarta en silencio: dos contrasenas distintas que compartan
// los primeros 72 bytes abrirían la misma cuenta.
export const PASSWORD_MAX_LENGTH = 72;

// Minuscula, mayuscula, digito y un caracter no alfanumerico, todos exigidos.
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const PASSWORD_MESSAGE =
  `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres e ` +
  'incluir minúscula, mayúscula, número y un símbolo';
