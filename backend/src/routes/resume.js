/**
 * routes/resume.js
 *
 * POST /api/resume/parse
 *   - Accepts PDF or DOCX upload (multipart/form-data, field name: "resume")
 *   - Extracts text, runs Gemini parsing + enhancement
 *   - Returns structured JSON ready to auto-fill the Builder form
 *   - Optionally saves parsed data to the user's session in DB
 */
import fs from 'fs'
import path from 'path'
import os from 'os'
import express          from 'express'
import multer           from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { authenticate } from '../middleware/auth.js'
import { extractResumeData } from '../services/resumeParser.js'
import { User } from '../models/index.js'

const router = express.Router()

/* ── Multer: memory storage, 10MB limit ── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF, DOCX, or TXT files are accepted'))
    }
  },
})

/* ── POST /api/resume/parse ── */
router.post('/parse', authenticate, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No resume file uploaded' })
  }

  try {
    // 1. Upload original file to Cloudinary for storage
    let resumeUrl = null
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder:        `portfolioforge/${req.user._id}/resumes`,
            resource_type: 'raw',
            public_id:     `resume_${Date.now()}`,
          },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        stream.end(req.file.buffer)
      })
      resumeUrl = uploadResult.secure_url
    } catch (uploadErr) {
      console.warn('[Resume] Cloudinary upload failed (non-fatal):', uploadErr.message)
    }

 
const tempPath = path.join(os.tmpdir(), `${Date.now()}-${req.file.originalname}`)

fs.writeFileSync(tempPath, req.file.buffer)

const enhanced = await extractResumeData(tempPath)

fs.unlinkSync(tempPath)

    // 5. Attach resume URL
    if (resumeUrl) {
      enhanced.resumeUrl = resumeUrl
    }

    // 6. Optionally cache parsed data on the user record for resuming later
    await User.findByIdAndUpdate(req.user._id, {
      $set: { lastParsedResume: enhanced },
    })

    res.json({
      success:   true,
      data:      enhanced,
      resumeUrl: resumeUrl || null,
      rawLength: JSON.stringify(enhanced).length,
    })
  } catch (err) {
    console.error('[Resume parse error]', err.message)
    res.status(500).json({
      message: err.message || 'Resume parsing failed. Please try again.',
    })
  }
})

/* ── GET /api/resume/last — retrieve last cached parse ── */
router.get('/last', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('lastParsedResume')
    res.json({ data: user?.lastParsedResume || null })
  } catch {
    res.status(500).json({ message: 'Failed to retrieve cached resume' })
  }
})

export default router
