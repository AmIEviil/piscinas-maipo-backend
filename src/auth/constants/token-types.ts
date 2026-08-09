// Tipo de token declarado en el claim `typ`.
//
// Sin este claim todos los JWT emitidos por la aplicacion son intercambiables:
// firmados con el mismo secreto y con el mismo payload, un refresh token
// (7 dias) o un token de activacion sirven como token de acceso. El claim
// permite que cada punto de verificacion acepte unicamente el tipo que le
// corresponde.
export const TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  PWD_RESET: 'pwd_reset',
  ACTIVATION: 'activation',
} as const;

export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE];

export interface JwtPayload {
  id: string;
  email: string;
  typ: TokenType;
  iat?: number;
  exp?: number;
}

// `issuer` y `audience` acotan donde vale un token: un JWT emitido por otro
// sistema que compartiera el secreto por accidente no sirve aqui, y estos
// tokens no valen en otro sistema.
export const JWT_ISSUER = 'piscinas-el-maipo';
export const JWT_AUDIENCE = 'piscinas-el-maipo-api';
