import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { connectDB } from './utils/db.js'

import authRoutes       from './routes/auth.js'
import portfolioRoutes  from './routes/portfolio.js'
import uploadRoutes     from './routes/upload.js'
import aiRoutes         from './routes/ai.js'
import adminRoutes      from './routes/admin.js'
import resumeRoutes     from './routes/resume.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 4000

// ── Security middleware ──────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Rate limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts. Try again later.' },
})

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',      authLimiter, authRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/upload',    uploadRoutes)
app.use('/api/ai',        aiRoutes)
app.use('/api/admin',     adminRoutes)
app.use('/api/resume',    resumeRoutes)

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message)
  const status = err.status || 500
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ── Start ─────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 PortfolioForge API running on port ${PORT}`))
})
