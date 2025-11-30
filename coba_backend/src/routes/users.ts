import { Router } from 'express'
import { UserModel } from '../models/User'
import { hashPassword } from '../utils/password'
import { AuthRequest, requireAuth } from '../middleware/auth'
import { comparePassword } from '../utils/password'
import { signToken } from '../utils/jwt'

export const usersRouter = Router()

// Public login endpoint to match frontend expectation: POST /user/login
usersRouter.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ status: false, message: 'username and password required' })

  const user = await UserModel.findOne({ username })
  if (!user) return res.status(401).json({ status: false, message: 'invalid credentials' })

  const ok = await comparePassword(password, user.password)
  if (!ok) return res.status(401).json({ status: false, message: 'invalid credentials' })

  const token = signToken({ sub: user.id, username: user.username, role: user.role })
  return res.json({
    status: true,
    data: {
      id: user.id,
      username: user.username,
      region: user.region,
      access_token: token
    }
  })
})

// Current user profile
usersRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.sub
  if (!userId) return res.status(401).json({ status: false, message: 'unauthorized' })

  const user = await UserModel.findById(userId).select('-password')
  if (!user) return res.status(404).json({ status: false, message: 'user not found' })

  return res.json({ status: true, message: 'ok', data: user })
})

usersRouter.get('/getall', requireAuth, async (req, res) => {
  const page = Number(req.query.page ?? 1)
  const limit = Number(req.query.limit ?? 10)
  const q = (req.query.q as string | undefined)?.trim()

  const filter = q ? { username: { $regex: q, $options: 'i' } } : {}
  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit),
    UserModel.countDocuments(filter)
  ])

  return res.json({ data: { users, total } })
})

usersRouter.post('/', requireAuth, async (req, res) => {
  const { username, password, region } = req.body
  if (!username || !password || !region) return res.status(400).json({ status: false, message: 'username, password, region required' })

  const existing = await UserModel.findOne({ username })
  if (existing) return res.status(409).json({ status: false, message: 'username already exists' })

  const hashed = await hashPassword(password)
  const user = await UserModel.create({ username, password: hashed, region, role: 'user' })
  return res.status(201).json({ status: true, data: { _id: user.id, username: user.username, role: user.role, region: user.region, stations: user.stations, disable_stations: user.disable_stations } })
})

usersRouter.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const { username, region } = req.body
  if (!username || !region) return res.status(400).json({ status: false, message: 'username and region required' })

  const existing = await UserModel.findOne({ username, _id: { $ne: id } })
  if (existing) return res.status(409).json({ status: false, message: 'username already exists' })

  const user = await UserModel.findByIdAndUpdate(id, { username, region }, { new: true })
  if (!user) return res.status(404).json({ status: false, message: 'user not found' })

  return res.json({ status: true, data: { _id: user.id, username: user.username, role: user.role, region: user.region, stations: user.stations, disable_stations: user.disable_stations } })
})

usersRouter.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const deleted = await UserModel.findByIdAndDelete(id)
  if (!deleted) return res.status(404).json({ status: false, message: 'user not found' })
  return res.json({ status: true })
})
