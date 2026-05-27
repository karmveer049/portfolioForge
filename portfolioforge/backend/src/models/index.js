import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

/* ── USER ─────────────────────────────────────────────── */
const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 8 },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  resetToken:        String,
  resetTokenExpires: Date,
  lastParsedResume:  { type: Object, default: null },
}, { timestamps: true })

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password)
}

UserSchema.methods.toSafeObject = function() {
  const { password, resetToken, resetTokenExpires, ...safe } = this.toObject()
  return safe
}

export const User = mongoose.model('User', UserSchema)

/* ── PORTFOLIO ────────────────────────────────────────── */
const ProjectSchema = new mongoose.Schema({
  title:       String,
  description: String,
  stack:       String,   // comma-separated
  liveUrl:     String,
  githubUrl:   String,
  screenshot:  String,   // Cloudinary URL
  highlight:   String,
})

const ExperienceSchema = new mongoose.Schema({
  role:        String,
  company:     String,
  startDate:   String,
  endDate:     String,
  type:        String,
  description: String,
  tech:        String,
})

const PortfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Personal
  name:      String,
  tagline:   String,
  about:     String,
  email:     String,
  phone:     String,
  location:  String,
  resumeUrl: String,

  // Social
  socials: {
    github:    String,
    linkedin:  String,
    twitter:   String,
    leetcode:  String,
    kaggle:    String,
    portfolio: String,
  },

  // Academics
  academics: {
    college:  String,
    degree:   String,
    cgpa:     String,
    gradYear: String,
    tenth:    String,
    twelfth:  String,
  },

  // Skills
  skills: {
    rawInput:   String,
    languages:  String,
    frameworks: String,
    databases:  String,
    tools:      String,
    ai:         String,
  },

  // Arrays
  projects:       [ProjectSchema],
  experience:     [ExperienceSchema],
  certifications: [{ title: String, org: String, url: String }],
  achievements:   [{ title: String, desc: String }],

  // Customization
  theme:              { type: String, default: 'soft-editorial' },
  animationIntensity: { type: String, default: '2' },
  fontStyle:          { type: String, default: 'serif-sans' },

  // Generation status
  status: {
    type: String,
    enum: ['pending', 'generating', 'deploying', 'live', 'failed'],
    default: 'pending',
  },
  statusMessage: String,
  deployedUrl:   String,
  githubRepoUrl: String,
  previewUrl:    String,
  generatedAt:   Date,
  deployedAt:    Date,
  errorLog:      String,
}, { timestamps: true })

export const Portfolio = mongoose.model('Portfolio', PortfolioSchema)
