import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Use memory storage — stream directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf',
                     'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('File type not allowed'))
  },
})

function streamToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
    stream.end(buffer)
  })
}

/* POST /api/upload/image — project screenshots, profile photos */
router.post('/image', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  try {
    const result = await streamToCloudinary(req.file.buffer, {
      folder:           `portfolioforge/${req.user._id}/images`,
      transformation:   [{ width: 1200, crop: 'limit' }, { quality: 'auto' }],
      resource_type:    'image',
    })
    res.json({ url: result.secure_url, publicId: result.public_id })
  } catch (err) {
    console.error('[Upload image]', err)
    res.status(500).json({ message: 'Image upload failed' })
  }
})

/* POST /api/upload/resume — PDF/DOC resume */
router.post('/resume', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  try {
    const result = await streamToCloudinary(req.file.buffer, {
      folder:        `portfolioforge/${req.user._id}/resumes`,
      resource_type: 'raw',
      format:        'pdf',
    })
    res.json({ url: result.secure_url, publicId: result.public_id })
  } catch (err) {
    console.error('[Upload resume]', err)
    res.status(500).json({ message: 'Resume upload failed' })
  }
})

export default router
