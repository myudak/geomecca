import { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt'

export interface AuthRequest extends Request {
  user?: {
    sub: string
    username: string
    role: string
  }
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ status: false, message: 'missing token' })

  const [, token] = header.split(' ')
  if (!token) return res.status(401).json({ status: false, message: 'missing token' })

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    return next()
  } catch (err) {
    return res.status(401).json({ status: false, message: 'invalid token' })
  }
}
