import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { execSync } from 'child_process'
import simpleGit from 'simple-git'
import { Portfolio, User } from '../models/index.js'
import { sendPortfolioLiveEmail, sendGenerationFailedEmail } from './email.js'
import { geminiGenerateAbout } from './ai.js'
import { generatePortfolioCode } from '../templates/portfolioTemplate.js'

/* ── Main queue function (fire-and-forget) ── */
export async function queuePortfolioGeneration(portfolioId) {
  await new Promise(r => setTimeout(r, 500))
  try {
    await runGeneration(portfolioId)
  } catch (err) {
    console.error(`[Generator] Fatal error for ${portfolioId}:`, err.message)
    await Portfolio.findByIdAndUpdate(portfolioId, {
      status: 'failed',
      errorLog: err.message,
      statusMessage: 'Generation failed. Admin has been notified.',
    })
    const portfolio = await Portfolio.findById(portfolioId)
    const user = await User.findById(portfolio?.user)
    if (user) sendGenerationFailedEmail(user, portfolioId).catch(console.error)
  }
}

async function runGeneration(portfolioId) {
  console.log(`[Generator] Starting for portfolio ${portfolioId}`)

  await Portfolio.findByIdAndUpdate(portfolioId, {
    status: 'generating',
    statusMessage: 'AI is enhancing your content…',
  })

  const portfolio = await Portfolio.findById(portfolioId).lean()
  const user = await User.findById(portfolio.user).select('name email').lean()

  // AI enhance about section if short
  let enhancedAbout = portfolio.about
  if (portfolio.about && portfolio.about.length < 100) {
    try {
      enhancedAbout = await geminiGenerateAbout({
        name:         portfolio.name,
        college:      portfolio.academics?.college,
        degree:       portfolio.academics?.degree,
        skills:       [portfolio.skills?.languages, portfolio.skills?.frameworks].filter(Boolean).join(', '),
        projects:     portfolio.projects?.map(p => p.title),
        achievements: portfolio.achievements?.map(a => a.title),
      })
    } catch {
      console.warn('[Generator] AI about enhancement failed, using original')
    }
  }

  const enrichedPortfolio = { ...portfolio, about: enhancedAbout }

  await Portfolio.findByIdAndUpdate(portfolioId, {
    statusMessage: 'Generating React portfolio code…',
  })

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pf-'))
  console.log(`[Generator] Working in ${tmpDir}`)

  try {
    // 1. Write React source files
    await generatePortfolioCode(enrichedPortfolio, tmpDir)

    // 2. Install deps and build
    await Portfolio.findByIdAndUpdate(portfolioId, {
      statusMessage: 'Installing dependencies and building…',
    })
    console.log('[Generator] Running npm install…')
    execSync('npm install', { cwd: tmpDir, stdio: 'pipe' })

    console.log('[Generator] Running npm run build…')
    execSync('npm run build', { cwd: tmpDir, stdio: 'pipe' })

    const distDir = path.join(tmpDir, 'dist')

    // 3. Write .nojekyll — CRITICAL for GitHub Pages
    // Without this, GitHub Pages ignores _assets/ folder entirely
    await fs.writeFile(path.join(distDir, '.nojekyll'), '')
    console.log('[Generator] .nojekyll written to dist/')

    // 4. Verify index.html uses relative paths
    const indexHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf8')
    if (indexHtml.includes('src="/assets/') || indexHtml.includes('href="/assets/')) {
      console.error('[Generator] WARNING: index.html still has absolute /assets/ paths!')
      console.error('[Generator] Check vite.config.js base setting in template')
      // Patch it as a safety net
      const patched = indexHtml
        .replace(/src="\/assets\//g, 'src="./assets/')
        .replace(/href="\/assets\//g, 'href="./assets/')
      await fs.writeFile(path.join(distDir, 'index.html'), patched)
      console.log('[Generator] Patched absolute paths to relative in index.html')
    } else {
      console.log('[Generator] ✅ index.html has correct relative asset paths')
    }

    // 5. Deploy to GitHub
    await Portfolio.findByIdAndUpdate(portfolioId, {
      status: 'deploying',
      statusMessage: 'Pushing to GitHub and deploying…',
    })

    let deployedUrl = null
    let githubRepoUrl = null

    if (process.env.GITHUB_TOKEN && process.env.GITHUB_USERNAME) {
      try {
        const result = await deployToGitHub(enrichedPortfolio, distDir, user)
        deployedUrl   = result.pagesUrl
        githubRepoUrl = result.repoUrl
      } catch (ghErr) {
        console.warn('[Generator] GitHub deploy failed:', ghErr.message)
      }
    } else {
      console.log('[Generator] No GitHub credentials — skipping auto-deploy')
    }

    // 6. Mark live
    const now = new Date()
    await Portfolio.findByIdAndUpdate(portfolioId, {
      status:        deployedUrl ? 'live' : 'pending',
      statusMessage: deployedUrl
        ? 'Your portfolio is live! (GitHub Pages may take 2-3 min to propagate)'
        : 'Code generated. Awaiting manual deployment.',
      deployedUrl,
      githubRepoUrl,
      generatedAt: now,
      deployedAt:  deployedUrl ? now : undefined,
    })

    if (deployedUrl) {
      const updated = await Portfolio.findById(portfolioId).lean()
      await sendPortfolioLiveEmail(user, updated)
      console.log(`[Generator] ✅ Portfolio ${portfolioId} live at ${deployedUrl}`)
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
}

/* ── GitHub deployment — pushes built dist/ folder ── */
async function deployToGitHub(portfolio, distDir, user) {
  const token    = process.env.GITHUB_TOKEN
  const ghUser   = process.env.GITHUB_USERNAME
  const safeName = portfolio.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 40)
  const repoName = `portfolio-${safeName}-${Date.now()}`

  const headers = {
    Authorization:  `Bearer ${token}`,
    Accept:         'application/vnd.github+json',
    'User-Agent':   'PortfolioForge/1.0',
    'Content-Type': 'application/json',
  }

  // 1. Create GitHub repo
  console.log(`[GitHub] Creating repo: ${repoName}`)
  const createRes = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name:        repoName,
      description: `Portfolio for ${portfolio.name} — generated by PortfolioForge`,
      private:     false,
      auto_init:   false,
    }),
  })
  if (!createRes.ok) {
    const err = await createRes.json()
    throw new Error(`GitHub repo creation failed: ${err.message}`)
  }
  console.log(`[GitHub] Repo created: https://github.com/${ghUser}/${repoName}`)

  // 2. Init git in dist/ and push
  const git = simpleGit(distDir)
  await git.init()
  await git.checkoutLocalBranch('main')
  await git.addConfig('user.email', user.email)
  await git.addConfig('user.name',  user.name)
  await git.add('.')

  // Verify .nojekyll was staged
  const status = await git.status()
  console.log(`[GitHub] Staging ${status.staged.length} files (includes .nojekyll: ${status.staged.includes('.nojekyll')})`)

  await git.commit(`Portfolio for ${portfolio.name} — built by PortfolioForge`)
  await git.addRemote('origin', `https://${ghUser}:${token}@github.com/${ghUser}/${repoName}.git`)
  await git.push('origin', 'main', ['--set-upstream'])
  console.log('[GitHub] Code pushed to main branch')

  // 3. Enable GitHub Pages from root of main branch
  // Wait a moment for the branch to register
  await new Promise(r => setTimeout(r, 2000))
  const pagesRes = await fetch(`https://api.github.com/repos/${ghUser}/${repoName}/pages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ source: { branch: 'main', path: '/' } }),
  })
  if (!pagesRes.ok) {
    const pagesErr = await pagesRes.json()
    console.warn('[GitHub] Pages setup warning:', pagesErr.message)
    // Non-fatal — Pages may already be in queue or need a moment
  } else {
    console.log('[GitHub] GitHub Pages enabled')
  }

  return {
    repoUrl:  `https://github.com/${ghUser}/${repoName}`,
    pagesUrl: `https://${ghUser}.github.io/${repoName}/`,
  }
}
