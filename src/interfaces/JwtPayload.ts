export interface JwtPayload{
    sub: number;
    username: number,
    rol?: number,
    profilePhoto?: string,
    iat?: number,
    exp?: number,
    admin?: boolean
}