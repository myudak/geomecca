import { Router } from 'express'
import { UserModel } from '../models/User'
import { comparePassword } from '../utils/password'
import { signToken } from '../utils/jwt'

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ status: false, message: 'username and password required' })

  const user = await UserModel.findOne({ username })
  if (!user) return res.status(401).json({ status: false, message: 'invalid credentials' })

  const ok = await comparePassword(password, user.password)
  if (!ok) return res.status(401).json({ status: false, message: 'invalid credentials' })

  const token = signToken({ sub: user.id, username: user.username, role: user.role })
  return res.json({ status: true, data: { token, user: { _id: user.id, username: user.username, role: user.role, region: user.region } } })
})
