export interface JwtPayload{
    sub: number;
    username: number,
    rol?: number,
    iat?: number,
    exp?: number,
    admin?: boolean
}