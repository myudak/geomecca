import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface JwtPayload {
  sub: string
  username: string
  role: string
}

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: '12h' })

export const verifyToken = (token: string) => jwt.verify(token, env.jwtSecret) as JwtPayload
