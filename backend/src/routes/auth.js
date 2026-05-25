import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { User } from '../models/index.js'
import { authenticate } from '../middleware/auth.js'
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.js'
import crypto from 'crypto'

const router = express.Router()

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

/* POST /api/auth/register */
router.post('/register',
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    const { name, email, password } = req.body
    try {
      const exists = await User.findOne({ email })
      if (exists) return res.status(409).json({ message: 'Email already registered' })

      const user = await User.create({ name, email, password })

      // Send welcome email (non-blocking)
      sendWelcomeEmail(user).catch(console.error)

      res.status(201).json({
        token: signToken(user._id),
        user: user.toSafeObject(),
      })
    } catch (err) {
      console.error('[Register]', err)
      res.status(500).json({ message: 'Registration failed' })
    }
  }
)

/* POST /api/auth/login */
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid credentials' })

    const { email, password } = req.body
    try {
      const user = await User.findOne({ email })
      if (!user) return res.status(401).json({ message: 'Invalid email or password' })

      const valid = await user.comparePassword(password)
      if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

      res.json({
        token: signToken(user._id),
        user: user.toSafeObject(),
      })
    } catch (err) {
      res.status(500).json({ message: 'Login failed' })
    }
  }
)

/* GET /api/auth/me */
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user.toSafeObject() })
})

/* POST /api/auth/forgot-password */
router.post('/forgot-password',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    const { email } = req.body
    try {
      const user = await User.findOne({ email })
      // Always respond success to prevent email enumeration
      if (!user) return res.json({ message: 'If this email exists, a reset link was sent.' })

      const token = crypto.randomBytes(32).toString('hex')
      user.resetToken = token
      user.resetTokenExpires = Date.now() + 3600000 // 1 hour
      await user.save()

      await sendPasswordResetEmail(user, token)
      res.json({ message: 'If this email exists, a reset link was sent.' })
    } catch (err) {
      res.status(500).json({ message: 'Failed to send reset email' })
    }
  }
)

/* POST /api/auth/reset-password */
router.post('/reset-password',
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    const { token, password } = req.body
    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() },
      })
      if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' })

      user.password = password
      user.resetToken = undefined
      user.resetTokenExpires = undefined
      await user.save()

      res.json({ message: 'Password reset successfully' })
    } catch (err) {
      res.status(500).json({ message: 'Password reset failed' })
    }
  }
)

export default router
