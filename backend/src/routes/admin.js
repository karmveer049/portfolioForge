import express from 'express'
import { Portfolio, User } from '../models/index.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { queuePortfolioGeneration } from '../services/generator.js'

const router = express.Router()
router.use(authenticate, requireAdmin)

/* GET /api/admin/stats */
router.get('/stats', async (_req, res) => {
  try {
    const [totalUsers, totalPortfolios, livePortfolios, pendingCount] = await Promise.all([
      User.countDocuments(),
      Portfolio.countDocuments(),
      Portfolio.countDocuments({ status: 'live' }),
      Portfolio.countDocuments({ status: 'pending' }),
    ])
    res.json({ totalUsers, totalPortfolios, livePortfolios, pendingCount })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

/* GET /api/admin/portfolios */
router.get('/portfolios', async (req, res) => {
  try {
    const portfolios = await Portfolio.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean()
    // flatten for table
    const shaped = portfolios.map(p => ({
      id:          p._id,
      name:        p.name,
      tagline:     p.tagline,
      theme:       p.theme,
      status:      p.status,
      deployedUrl: p.deployedUrl,
      githubUrl:   p.githubRepoUrl,
      createdAt:   p.createdAt,
      user:        p.user,
    }))
    res.json({ portfolios: shaped })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch portfolios' })
  }
})

/* GET /api/admin/users */
router.get('/users', async (_req, res) => {
  try {
    const users = await User.find().select('-password').lean()
    const counts = await Portfolio.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ])
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]))
    const shaped = users.map(u => ({
      id:             u._id,
      name:           u.name,
      email:          u.email,
      role:           u.role,
      portfolioCount: countMap[u._id.toString()] || 0,
      createdAt:      u.createdAt,
    }))
    res.json({ users: shaped })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

/* POST /api/admin/portfolios/:id/deploy — manually trigger */
router.post('/portfolios/:id/deploy', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id)
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' })
    portfolio.status = 'pending'
    await portfolio.save()
    queuePortfolioGeneration(portfolio._id).catch(console.error)
    res.json({ message: 'Deployment triggered' })
  } catch (err) {
    res.status(500).json({ message: 'Trigger failed' })
  }
})

/* DELETE /api/admin/portfolios/:id */
router.delete('/portfolios/:id', async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' })
  }
})

/* DELETE /api/admin/users/:id */
router.delete('/users/:id', async (req, res) => {
  try {
    await Portfolio.deleteMany({ user: req.params.id })
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User and all their portfolios deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' })
  }
})

export default router
