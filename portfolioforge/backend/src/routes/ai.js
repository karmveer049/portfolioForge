import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { geminiImprove, geminiCategorizeSkills, geminiImproveProject, geminiGenerateTagline } from '../services/ai.js'

const router = express.Router()

/* POST /api/ai/improve-bio */
router.post('/improve-bio', authenticate, async (req, res) => {
  const { bio } = req.body
  if (!bio?.trim()) return res.status(400).json({ message: 'Bio is required' })
  try {
    const improved = await geminiImprove(bio, 'developer bio')
    res.json({ improved })
  } catch (err) {
    res.status(500).json({ message: 'AI improvement failed' })
  }
})

/* POST /api/ai/improve-project */
router.post('/improve-project', authenticate, async (req, res) => {
  const { description } = req.body
  if (!description?.trim()) return res.status(400).json({ message: 'Description required' })
  try {
    const improved = await geminiImproveProject(description)
    res.json({ improved })
  } catch (err) {
    res.status(500).json({ message: 'AI improvement failed' })
  }
})

/* POST /api/ai/categorize-skills */
router.post('/categorize-skills', authenticate, async (req, res) => {
  const { raw } = req.body
  if (!raw?.trim()) return res.status(400).json({ message: 'Skills input required' })
  try {
    const categories = await geminiCategorizeSkills(raw)
    res.json(categories)
  } catch (err) {
    res.status(500).json({ message: 'AI categorization failed' })
  }
})

/* POST /api/ai/generate-tagline */
router.post('/generate-tagline', authenticate, async (req, res) => {
  const { name, skills, about } = req.body
  try {
    const tagline = await geminiGenerateTagline({ name, skills, about })
    res.json({ tagline })
  } catch (err) {
    res.status(500).json({ message: 'AI tagline generation failed' })
  }
})

export default router
