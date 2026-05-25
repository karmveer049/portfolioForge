import express from 'express'
import { Portfolio } from '../models/index.js'
import { authenticate } from '../middleware/auth.js'
import { queuePortfolioGeneration } from '../services/generator.js'

const router = express.Router()

/* POST /api/portfolio/generate — submit form data, kick off async generation */
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { user: _ignored, status: _status, deployedUrl: _d, githubRepoUrl: _g, ...safeBody } = req.body
const portfolio = await Portfolio.create({
  ...safeBody,
  user:   req.user._id,
  status: 'pending',
})

    // Kick off async generation (does NOT block the response)
    queuePortfolioGeneration(portfolio._id).catch(err => {
      console.error('[Generator queue error]', err.message)
    })

    res.status(201).json({
      message: 'Portfolio generation started. You will receive the URL by email.',
      portfolioId: portfolio._id,
    })
  } catch (err) {
    console.error('[Generate]', err)
    res.status(500).json({ message: 'Failed to start generation' })
  }
})

/* GET /api/portfolio/my — list current user's portfolios */
router.get('/my', authenticate, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('name tagline theme status deployedUrl githubRepoUrl previewUrl createdAt')
    res.json({ portfolios })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch portfolios' })
  }
})

/* GET /api/portfolio/:id — single portfolio detail */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' })
    res.json({ portfolio })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch portfolio' })
  }
})

/* GET /api/portfolio/:id/status — poll generation status */
router.get('/:id/status', authenticate, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne(
      { _id: req.params.id, user: req.user._id },
      'status statusMessage deployedUrl githubRepoUrl generatedAt deployedAt'
    )
    if (!portfolio) return res.status(404).json({ message: 'Not found' })
    res.json(portfolio)
  } catch (err) {
    res.status(500).json({ message: 'Failed to get status' })
  }
})

/* DELETE /api/portfolio/:id */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Portfolio.deleteOne({ _id: req.params.id, user: req.user._id })
    res.json({ message: 'Portfolio deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' })
  }
})

export default router
