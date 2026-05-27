/**
 * Seed script — run once to bootstrap the database.
 * Usage: node src/utils/seed.js
 *
 * Creates:
 *  - An admin user (email + password from env or defaults below)
 *  - One sample pending portfolio so the admin panel isn't empty
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { User, Portfolio } from '../models/index.js'

dotenv.config()

const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    || 'admin@portfolioforge.dev'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345'
const ADMIN_NAME     = process.env.SEED_ADMIN_NAME     || 'PortfolioForge Admin'

async function seed() {
  console.log('🌱 Connecting to MongoDB…')
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Connected')

  /* ── Admin user ── */
  const existing = await User.findOne({ email: ADMIN_EMAIL })
  if (existing) {
    console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`)
  } else {
    const admin = await User.create({
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role:     'admin',
    })
    console.log(`✅ Admin created: ${admin.email}`)
  }

  /* ── Sample portfolio (pending) ── */
  const adminUser = await User.findOne({ email: ADMIN_EMAIL })
  const sampleExists = await Portfolio.findOne({ user: adminUser._id })
  if (!sampleExists) {
    await Portfolio.create({
      user:    adminUser._id,
      name:    'Jane Developer',
      tagline: 'Full-stack engineer crafting scalable APIs and beautiful UIs.',
      about:   'A passionate developer with experience in React, Node.js, and cloud deployment.',
      email:   'jane@example.com',
      theme:   'soft-editorial',
      status:  'pending',
      academics: {
        college:  'IIT Delhi',
        degree:   'B.Tech Computer Science',
        cgpa:     '8.9 / 10',
        gradYear: '2025',
      },
      skills: {
        languages:  'JavaScript, Python, TypeScript',
        frameworks: 'React, Express, Next.js',
        databases:  'PostgreSQL, MongoDB',
        tools:      'Git, Docker, AWS',
      },
      projects: [
        {
          title:       'E-Commerce Platform',
          description: 'Built a full-stack e-commerce platform with React and Express.',
          stack:       'React, Node.js, MongoDB, Stripe',
          liveUrl:     'https://shop.example.com',
          githubUrl:   'https://github.com/example/shop',
          highlight:   '10k monthly users',
        },
      ],
    })
    console.log('✅ Sample portfolio created')
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉  Seed complete!')
  console.log(`    Admin email:    ${ADMIN_EMAIL}`)
  console.log(`    Admin password: ${ADMIN_PASSWORD}`)
  console.log('    Login at:       /login')
  console.log('    Admin panel:    /admin')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
