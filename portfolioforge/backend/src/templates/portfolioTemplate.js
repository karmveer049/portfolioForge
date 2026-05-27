import fs from 'fs/promises'
import path from 'path'

/* ── Theme definitions ── */
const THEMES = {
  'soft-editorial': {
    bg:          '#F7F3ED',
    bgAlt:       '#FDFAF4',
    text:        '#1C1410',
    textMid:     '#7A6248',
    textSoft:    '#A8896A',
    accent:      '#D4922A',
    accentLight: '#E8B660',
    border:      '#C9A87C',
    cardBg:      '#FFFCF7',
    tagBg:       'rgba(212,146,42,0.1)',
  },
  'warm-library': {
    bg:          '#16100A',
    bgAlt:       '#1A120C',
    text:        '#F0D9B5',
    textMid:     '#A8896A',
    textSoft:    '#5C3518',
    accent:      '#D4922A',
    accentLight: '#E8B660',
    border:      '#3D2510',
    cardBg:      '#1E1510',
    tagBg:       'rgba(212,146,42,0.12)',
  },
  'espresso': {
    bg:          '#0D0804',
    bgAlt:       '#130A05',
    text:        '#F5E6D3',
    textMid:     '#9A7D60',
    textSoft:    '#5C3518',
    accent:      '#C9933A',
    accentLight: '#D4AA55',
    border:      '#2C1A0E',
    cardBg:      '#160C06',
    tagBg:       'rgba(201,147,58,0.12)',
  },
  'studio-journal': {
    bg:          '#F7F2EA',
    bgAlt:       '#EDE5D5',
    text:        '#3D2B1F',
    textMid:     '#7A5C3A',
    textSoft:    '#A8896A',
    accent:      '#7A5C3A',
    accentLight: '#9A7A55',
    border:      '#BFA882',
    cardBg:      '#FFFCF5',
    tagBg:       'rgba(122,92,58,0.1)',
  },
}

function skillsArray(str) {
  if (!str) return []
  return str.split(',').map(s => s.trim()).filter(Boolean)
}

function projectsToCode(projects) {
  if (!projects?.length) return '[]'
  return JSON.stringify(projects.map(p => ({
    title:       p.title       || '',
    description: p.description || '',
    stack:       skillsArray(p.stack),
    liveUrl:     p.liveUrl     || '',
    githubUrl:   p.githubUrl   || '',
    screenshot:  p.screenshot  || '',
    highlight:   p.highlight   || '',
  })), null, 2)
}

function experienceToCode(exp) {
  if (!exp?.length) return '[]'
  return JSON.stringify(exp.map(e => ({
    role:        e.role        || '',
    company:     e.company     || '',
    startDate:   e.startDate   || '',
    endDate:     e.endDate     || 'Present',
    type:        e.type        || 'Remote',
    description: e.description || '',
    tech:        skillsArray(e.tech),
  })), null, 2)
}

/* ── Main function: write all files to tmpDir ── */
export async function generatePortfolioCode(portfolio, tmpDir) {
  const t = THEMES[portfolio.theme] || THEMES['soft-editorial']

  // File map: path → content
  const files = {
    'package.json':        packageJson(portfolio),
    'index.html':          indexHtml(portfolio),
    'vite.config.js':      viteConfig(),
    'tailwind.config.js':  tailwindConfig(t),
    'postcss.config.js':   'export default { plugins: { tailwindcss: {}, autoprefixer: {} } }\n',
    '.gitignore':          'node_modules\ndist\n.env\n.DS_Store\n',
    'README.md':           readmeContent(portfolio),
    'src/main.jsx':        mainJsx(),
    'src/index.css':       indexCss(t),
    'src/App.jsx':         appJsx(portfolio, t),
    'src/data.js':         dataJs(portfolio),
    'src/components/Navbar.jsx':     navbarComponent(portfolio, t),
    'src/components/Hero.jsx':       heroComponent(portfolio, t),
    'src/components/About.jsx':      aboutComponent(portfolio, t),
    'src/components/Skills.jsx':     skillsComponent(portfolio, t),
    'src/components/Projects.jsx':   projectsComponent(t),
    'src/components/Experience.jsx': experienceComponent(t),
    'src/components/Contact.jsx':    contactComponent(portfolio, t),
    'src/components/Footer.jsx':     footerComponent(portfolio, t),
  }

  // Create dirs and write files
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(tmpDir, filePath)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, content, 'utf8')
  }

  console.log(`[Template] Wrote ${Object.keys(files).length} files to ${tmpDir}`)
}

/* ── File generators ── */

function packageJson(p) {
  const safeName = p.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-portfolio'
  return JSON.stringify({
    name:    `${safeName}-portfolio`,
    version: '1.0.0',
    type:    'module',
    scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
    dependencies: {
      'framer-motion': '^11.0.0',
      'lucide-react':  '^0.383.0',
      react:           '^18.3.1',
      'react-dom':     '^18.3.1',
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.3.1',
      autoprefixer:           '^10.4.19',
      postcss:                '^8.4.40',
      tailwindcss:            '^3.4.7',
      vite:                   '^5.4.0',
    },
  }, null, 2)
}

function indexHtml(p) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${p.tagline || `${p.name}'s developer portfolio`}" />
    <meta property="og:title" content="${p.name} — Developer Portfolio" />
    <meta property="og:description" content="${p.tagline || ''}" />
    <title>${p.name} — Developer Portfolio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
}

function viteConfig() {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})\n`
}

function tailwindConfig(t) {
  return `export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans:  ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}\n`
}

function mainJsx() {
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)\n`
}

function indexCss(t) {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
@layer base {
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background-color: ${t.bg}; color: ${t.text}; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::selection { background: ${t.accent}; color: ${t.bg}; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${t.bg}; }
  ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
}
@layer utilities {
  .font-serif { font-family: 'DM Serif Display', Georgia, serif; }
  .font-mono-k { font-family: 'JetBrains Mono', monospace; }
  .ink-line { height: 1px; background: linear-gradient(90deg, transparent, ${t.border} 20%, ${t.accent} 50%, ${t.border} 80%, transparent); opacity: 0.5; }
  .card-pf { background: ${t.cardBg}; border: 1px solid ${t.border}40; box-shadow: 0 2px 16px ${t.text}0a, 0 1px 0 rgba(255,255,255,0.06) inset; transition: box-shadow 0.3s, border-color 0.3s, transform 0.3s; }
  .card-pf:hover { border-color: ${t.accent}80; box-shadow: 0 8px 32px ${t.text}12; transform: translateY(-2px); }
}\n`
}

function dataJs(p) {
  const skills = p.skills || {}
  const skillChapters = [
    { id: 'I',   title: 'Languages',  skills: skillsArray(skills.languages) },
    { id: 'II',  title: 'Frameworks', skills: skillsArray(skills.frameworks) },
    { id: 'III', title: 'Databases',  skills: skillsArray(skills.databases) },
    { id: 'IV',  title: 'Tools',      skills: skillsArray(skills.tools) },
    { id: 'V',   title: 'AI / ML',    skills: skillsArray(skills.ai) },
  ].filter(c => c.skills.length > 0)

  const stats = [
    p.academics?.cgpa     && { label: `CGPA at ${p.academics?.college || 'college'}`, value: p.academics.cgpa },
    p.projects?.length    && { label: 'Projects deployed', value: `${p.projects.length}+` },
    p.achievements?.length && { label: 'Achievements', value: `${p.achievements.length}+` },
  ].filter(Boolean)

  return `export const DATA = ${JSON.stringify({
    name:        p.name,
    tagline:     p.tagline,
    about:       p.about,
    email:       p.email,
    phone:       p.phone,
    location:    p.location,
    resumeUrl:   p.resumeUrl,
    socials:     p.socials || {},
    academics:   p.academics || {},
    skillChapters,
    stats,
    projects:    p.projects || [],
    experience:  p.experience || [],
    certifications: p.certifications || [],
    achievements:   p.achievements || [],
  }, null, 2)}\n`
}

function appJsx(p, t) {
  return `import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <div style={{ background: '${t.bg}', minHeight: '100vh' }}>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}\n`
}

function navbarComponent(p, t) {
  return `import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className={\`fixed top-0 left-0 right-0 z-50 transition-all duration-500 \${
          scrolled ? 'py-3 backdrop-blur-md border-b' : 'py-6'
        }\`}
        style={{ background: scrolled ? '${t.bg}ee' : 'transparent', borderColor: '${t.border}40' }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#hero" className="font-serif text-xl transition-colors"
            style={{ color: '${t.text}' }} onMouseEnter={e=>e.target.style.color='${t.accent}'}
            onMouseLeave={e=>e.target.style.color='${t.text}'}>
            ${p.name?.split(' ')[0] || 'Portfolio'}
          </a>
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <a key={l.label} href={l.href}
                className="font-sans text-sm transition-colors"
                style={{ color: '${t.textMid}' }}
                onMouseEnter={e=>e.target.style.color='${t.text}'}
                onMouseLeave={e=>e.target.style.color='${t.textMid}'}>
                {l.label}
              </a>
            ))}
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden" style={{ color: '${t.textMid}' }}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 p-6 flex flex-col gap-4 border-b"
            style={{ background: '${t.bg}', borderColor: '${t.border}40' }}>
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                className="font-sans text-sm" style={{ color: '${t.textMid}' }}>
                {l.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}\n`
}

function heroComponent(p, t) {
  return `import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowDown, Github, Linkedin } from 'lucide-react'
import { DATA } from '../data'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y    = useTransform(scrollYProgress, [0,1], ['0%','18%'])
  const opac = useTransform(scrollYProgress, [0,0.6], [1,0])
  return (
    <section id="hero" ref={ref} className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 60%, ${t.border}28 0%, transparent 70%)' }} />
      {[...Array(10)].map((_,i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width: 3+(i%3)*2, height: 3+(i%3)*2, background: '${t.accent}', opacity: 0.15,
            left: \`\${(i*37)%90}%\`, top: \`\${(i*53)%80}%\` }}
          animate={{ y: [0,-10,0], opacity: [0.12,0.22,0.12] }}
          transition={{ duration: 3+i*0.6, repeat: Infinity, delay: i*0.4, ease: 'easeInOut' }}
        />
      ))}
      <motion.div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24" style={{ y, opacity: opac }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-10">
          <span className="w-8 h-px" style={{ background: '${t.accent}' }} />
          <span className="font-mono-k text-xs tracking-[0.2em] uppercase" style={{ color: '${t.accent}' }}>
            Full-Stack Developer
          </span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9 }}
          className="font-serif leading-[1.02] mb-3" style={{ fontSize: 'clamp(3.5rem,9vw,7rem)', color: '${t.text}' }}>
          {DATA.name?.split(' ')[0]}
        </motion.h1>
        <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, duration: 0.9 }}
          className="font-serif italic leading-[1.02] mb-8" style={{ fontSize: 'clamp(3.5rem,9vw,7rem)', color: '${t.accent}' }}>
          {DATA.name?.split(' ').slice(1).join(' ')}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }}
          className="font-sans text-lg max-w-xl leading-relaxed mb-12 font-light" style={{ color: '${t.textMid}' }}>
          {DATA.tagline}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.78 }}
          className="flex flex-wrap items-center gap-4">
          <a href="#projects" className="font-sans text-sm px-7 py-3.5 rounded-sm tracking-wide transition-all duration-300"
            style={{ background: '${t.text}', color: '${t.bg}' }}
            onMouseEnter={e=>{e.target.style.background='${t.accent}';e.target.style.color='${t.bg}'}}
            onMouseLeave={e=>{e.target.style.background='${t.text}';e.target.style.color='${t.bg}'}}>
            View my work
          </a>
          <a href="#contact" className="font-sans text-sm px-7 py-3.5 rounded-sm tracking-wide transition-all duration-300"
            style={{ border: '1px solid ${t.border}', color: '${t.textMid}' }}
            onMouseEnter={e=>{e.target.style.borderColor='${t.accent}';e.target.style.color='${t.text}'}}
            onMouseLeave={e=>{e.target.style.borderColor='${t.border}';e.target.style.color='${t.textMid}'}}>
            Let's talk
          </a>
          {DATA.socials?.github && (
            <a href={DATA.socials.github} target="_blank" rel="noopener noreferrer"
              style={{ color: '${t.border}' }} onMouseEnter={e=>e.target.style.color='${t.accent}'}
              onMouseLeave={e=>e.target.style.color='${t.border}'}>
              <Github size={20} />
            </a>
          )}
          {DATA.socials?.linkedin && (
            <a href={DATA.socials.linkedin} target="_blank" rel="noopener noreferrer"
              style={{ color: '${t.border}' }} onMouseEnter={e=>e.target.style.color='${t.accent}'}
              onMouseLeave={e=>e.target.style.color='${t.border}'}>
              <Linkedin size={20} />
            </a>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
          className="mt-24 flex items-center gap-3">
          <motion.div animate={{ y: [0,5,0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
            <ArrowDown size={16} style={{ color: '${t.border}' }} />
          </motion.div>
          <span className="font-mono-k text-xs tracking-widest uppercase" style={{ color: '${t.border}' }}>
            Scroll to explore
          </span>
        </motion.div>
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 ink-line" />
    </section>
  )
}\n`
}

function aboutComponent(p, t) {
  return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { DATA } from '../data'

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section id="about" className="py-28 md:py-36 relative" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }} className="flex items-center gap-3 mb-8">
              <span className="font-mono-k text-xs tracking-[0.2em] uppercase" style={{ color: '${t.accent}' }}>01 — About</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl leading-tight mb-6" style={{ color: '${t.text}' }}>
              A developer who builds with{' '}
              <span className="italic" style={{ color: '${t.accent}' }}>intention.</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-sans leading-relaxed mb-10 font-light" style={{ color: '${t.textMid}' }}>
              {DATA.about}
            </motion.p>
            <div className="grid grid-cols-2 gap-4">
              {DATA.stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 8 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 + i * 0.08 }}
                  className="p-4 card-pf rounded-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: \`linear-gradient(90deg, transparent, ${'${t.accent}'}50, transparent)\` }} />
                  <div className="font-serif text-3xl mb-1" style={{ color: '${t.accent}' }}>{s.value}</div>
                  <div className="font-sans text-xs" style={{ color: '${t.textSoft}' }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-6 card-pf rounded-sm">
            {DATA.academics?.college && (
              <div className="mb-4 pb-4" style={{ borderBottom: '1px solid ${t.border}30' }}>
                <div className="font-mono-k text-xs tracking-widest mb-2" style={{ color: '${t.accent}' }}>EDUCATION</div>
                <div className="font-sans font-medium" style={{ color: '${t.text}' }}>{DATA.academics.degree}</div>
                <div className="font-sans text-sm" style={{ color: '${t.accent}' }}>{DATA.academics.college}</div>
                {DATA.academics.cgpa && <div className="font-sans text-sm mt-1" style={{ color: '${t.textMid}' }}>CGPA: {DATA.academics.cgpa}</div>}
              </div>
            )}
            <div className="font-mono-k text-xs tracking-widest mb-3" style={{ color: '${t.accent}' }}>OPEN TO</div>
            {['Remote roles', 'Startup collaborations', 'Freelance projects', 'AI integration work'].map(i => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '${t.accent}' }} />
                <span className="font-sans text-sm" style={{ color: '${t.textMid}' }}>{i}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}\n`
}

function skillsComponent(p, t) {
  return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { DATA } from '../data'

export default function Skills() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section id="skills" className="py-28 md:py-36 relative" ref={ref} style={{ background: '${t.bgAlt}' }}>
      <div className="ink-line absolute top-0 left-0 right-0" />
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex items-center gap-4 mb-16">
          <span className="font-mono-k text-xs tracking-[0.2em] uppercase" style={{ color: '${t.accent}' }}>02 — Skills</span>
          <h2 className="font-serif text-3xl md:text-4xl" style={{ color: '${t.text}' }}>The toolkit.</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-5">
          {DATA.skillChapters.map((ch, i) => (
            <motion.div key={ch.id} initial={{ opacity: 0, x: -14 }}
              animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.08 }}
              className="group flex items-start gap-5 p-5 card-pf rounded-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '${t.accent}' }} />
              <div className="font-serif text-lg w-8 flex-shrink-0 transition-colors" style={{ color: '${t.border}' }}>{ch.id}</div>
              <div>
                <div className="font-sans text-xs tracking-widest uppercase mb-3" style={{ color: '${t.textSoft}' }}>{ch.title}</div>
                <div className="flex flex-wrap gap-2">
                  {ch.skills.map(s => (
                    <span key={s} className="font-sans text-xs px-2.5 py-1 rounded-sm transition-colors cursor-default"
                      style={{ background: '${t.tagBg}', border: \`1px solid ${t.border}50\`, color: '${t.textMid}' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {DATA.achievements?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }} className="mt-10 p-6 card-pf rounded-sm">
            <div className="font-mono-k text-xs tracking-widest mb-4" style={{ color: '${t.accent}' }}>ACHIEVEMENTS</div>
            <div className="grid md:grid-cols-2 gap-3">
              {DATA.achievements.map(a => (
                <div key={a.title} className="flex items-start gap-2.5">
                  <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: '${t.accent}' }} />
                  <div>
                    <span className="font-sans text-sm font-medium" style={{ color: '${t.accent}' }}>{a.title}</span>
                    {a.desc && <span className="font-sans text-xs ml-2" style={{ color: '${t.textSoft}' }}>{a.desc}</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <div className="ink-line absolute bottom-0 left-0 right-0" />
    </section>
  )
}\n`
}

function projectsComponent(t) {
  return `import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, X, Play } from 'lucide-react'
import { DATA } from '../data'

function Lightbox({ p, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(28,20,16,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ duration: 0.3, ease: [0.22,1,0.36,1] }}
        className="relative w-full max-w-4xl rounded-lg overflow-hidden"
        style={{ background: '${t.cardBg}', border: \`1px solid ${t.border}60\` }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ background: '${t.bgAlt}', borderColor: \`${t.border}40\` }}>
          <span className="font-mono-k text-xs" style={{ color: '${t.textSoft}' }}>{p.liveUrl}</span>
          <button onClick={onClose} style={{ color: '${t.textMid}' }} className="hover:opacity-70 transition-opacity"><X size={15}/></button>
        </div>
        {p.screenshot && (
          <div style={{ maxHeight: '65vh', overflow: 'hidden' }}>
            <img src={p.screenshot} alt={p.title} className="w-full object-cover object-top" />
          </div>
        )}
        <div className="p-5 flex items-center justify-between">
          <div>
            <div className="font-serif text-lg" style={{ color: '${t.text}' }}>{p.title}</div>
            <div className="font-sans text-xs" style={{ color: '${t.textSoft}' }}>{p.highlight}</div>
          </div>
          <div className="flex gap-3">
            {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
              className="font-sans text-sm px-4 py-2 rounded-sm" style={{ background: '${t.text}', color: '${t.bg}' }}>
              Open live
            </a>}
            {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
              className="font-sans text-sm px-4 py-2 rounded-sm" style={{ border: \`1px solid ${t.border}\`, color: '${t.textMid}' }}>
              Code
            </a>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [active, setActive] = useState(null)
  return (
    <>
      <section id="projects" className="py-28 md:py-36" ref={ref}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-16">
            <span className="font-mono-k text-xs tracking-[0.2em] uppercase" style={{ color: '${t.accent}' }}>03 — Projects</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-2" style={{ color: '${t.text}' }}>
              Things I've <span className="italic" style={{ color: '${t.accent}' }}>shipped.</span>
            </h2>
            <p className="font-sans mt-3 font-light" style={{ color: '${t.textSoft}' }}>Every project below is live and deployed. Click to preview.</p>
          </motion.div>
          <div className="space-y-5">
            {DATA.projects.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 + i * 0.12 }}
                className="group card-pf rounded-lg overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ background: '${t.accent}' }} />
                <div className={\`grid \${p.screenshot ? 'md:grid-cols-2' : ''}\`}>
                  {p.screenshot && (
                    <div className="relative overflow-hidden cursor-pointer" style={{ minHeight: 220, background: '${t.bgAlt}' }}
                      onClick={() => setActive(p)}>
                      <div className="absolute top-0 left-0 right-0 flex items-center gap-1.5 px-3 py-2 z-10"
                        style={{ background: \`${t.bgAlt}e0\`, borderBottom: \`1px solid ${t.border}40\` }}>
                        {['#E8B0A0','#E8D0A0','#A8C890'].map(c => <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                      </div>
                      <motion.img src={p.screenshot} alt={p.title} className="w-full h-full object-cover object-top pt-8"
                        whileHover={{ scale: 1.04 }} transition={{ duration: 0.4 }} style={{ minHeight: 220 }} />
                      <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(28,20,16,0.4)', backdropFilter: 'blur(2px)' }}>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-sm" style={{ background: '${t.bg}' }}>
                          <Play size={13} style={{ color: '${t.accent}' }} />
                          <span className="font-sans text-sm" style={{ color: '${t.text}' }}>Preview</span>
                        </div>
                      </motion.div>
                    </div>
                  )}
                  <div className="p-7 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="font-mono-k text-xs" style={{ color: '${t.border}' }}>{String(i+1).padStart(2,'0')}</span>
                      {p.highlight && <span className="font-sans text-xs px-2.5 py-1 rounded-sm" style={{ background: '${t.tagBg}', border: \`1px solid ${t.border}50\`, color: '${t.accent}' }}>{p.highlight}</span>}
                    </div>
                    <h3 className="font-serif text-2xl mb-2 transition-colors" style={{ color: '${t.text}' }}>{p.title}</h3>
                    <p className="font-sans text-sm mb-5 font-light leading-relaxed" style={{ color: '${t.textMid}' }}>{p.description}</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {p.stack?.map(s => <span key={s} className="font-mono-k text-xs px-2 py-0.5 rounded-sm"
                        style={{ color: '${t.textMid}', background: '${t.tagBg}', border: \`1px solid ${t.border}40\` }}>{s}</span>)}
                    </div>
                    <div className="flex items-center gap-4">
                      {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 font-sans text-sm font-medium transition-colors"
                        style={{ color: '${t.accent}' }}>
                        <ExternalLink size={13}/> Live demo
                      </a>}
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 font-sans text-sm transition-colors"
                        style={{ color: '${t.textSoft}' }}>
                        <Github size={13}/> GitHub
                      </a>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <AnimatePresence>{active && <Lightbox p={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </>
  )
}\n`
}

function experienceComponent(t) {
  return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { DATA } from '../data'

export default function Experience() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  if (!DATA.experience?.length && !DATA.certifications?.length) return null
  return (
    <section id="experience" className="py-28 md:py-36" ref={ref} style={{ background: '${t.bgAlt}' }}>
      <div className="ink-line absolute top-0 left-0 right-0" style={{ position: 'relative' }}/>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex items-center gap-4 mb-16">
          <span className="font-mono-k text-xs tracking-[0.2em] uppercase" style={{ color: '${t.accent}' }}>04 — Experience</span>
          <h2 className="font-serif text-3xl md:text-4xl" style={{ color: '${t.text}' }}>The journey.</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            {DATA.experience.map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="relative pl-6 pb-8 last:pb-0"
                style={{ borderLeft: \`2px solid ${t.border}40\` }}>
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full" style={{ background: '${t.bg}', border: \`2px solid ${t.accent}\` }} />
                <div className="font-mono-k text-xs mb-1" style={{ color: '${t.textSoft}' }}>{e.startDate} — {e.endDate}</div>
                <div className="font-serif text-xl mb-0.5" style={{ color: '${t.text}' }}>{e.role}</div>
                <div className="font-sans text-sm font-medium mb-3" style={{ color: '${t.accent}' }}>{e.company} · {e.type}</div>
                {e.description && <p className="font-sans text-sm font-light leading-relaxed mb-3" style={{ color: '${t.textMid}' }}>{e.description}</p>}
                <div className="flex flex-wrap gap-2">
                  {e.tech?.map(s => <span key={s} className="font-mono-k text-xs px-2 py-0.5 rounded-sm"
                    style={{ color: '${t.textMid}', background: '${t.tagBg}', border: \`1px solid ${t.border}40\` }}>{s}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
          {DATA.certifications?.length > 0 && (
            <div>
              <div className="font-sans text-xs tracking-widest uppercase mb-5" style={{ color: '${t.textSoft}' }}>Certifications</div>
              <div className="space-y-3">
                {DATA.certifications.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.2 + i * 0.08 }} className="p-4 card-pf rounded-sm">
                    <div className="font-sans text-sm font-medium" style={{ color: '${t.text}' }}>{c.title}</div>
                    <div className="font-sans text-xs mt-0.5" style={{ color: '${t.textMid}' }}>{c.org}</div>
                    {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer"
                      className="font-sans text-xs mt-1 inline-block" style={{ color: '${t.accent}' }}>View credential →</a>}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}\n`
}

function contactComponent(p, t) {
  return `import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, Phone, Github, Linkedin, ArrowUpRight } from 'lucide-react'
import { DATA } from '../data'

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [copied, setCopied] = useState(false)
  const copyEmail = () => {
    navigator.clipboard.writeText(DATA.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const links = [
    DATA.phone       && { icon: Phone,    label: 'Phone',    value: DATA.phone,              href: \`tel:\${DATA.phone}\` },
    DATA.socials?.linkedin && { icon: Linkedin, label: 'LinkedIn', value: DATA.socials.linkedin,  href: DATA.socials.linkedin },
    DATA.socials?.github   && { icon: Github,   label: 'GitHub',   value: DATA.socials.github,    href: DATA.socials.github },
  ].filter(Boolean)
  return (
    <section id="contact" className="py-28 md:py-36" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-16">
          <span className="font-mono-k text-xs tracking-[0.2em] uppercase" style={{ color: '${t.accent}' }}>05 — Contact</span>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <motion.h2 initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }} className="font-serif leading-tight mb-6"
              style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: '${t.text}' }}>
              Let's build something{' '}
              <em className="not-italic" style={{ color: '${t.accent}' }}>worth remembering.</em>
            </motion.h2>
            <div className="space-y-3">
              {DATA.email && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.25 }} onClick={copyEmail}
                  className="group flex items-center gap-4 p-4 card-pf rounded-sm cursor-pointer">
                  <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
                    style={{ background: '${t.tagBg}', border: \`1px solid ${t.border}50\` }}>
                    <Mail size={16} style={{ color: '${t.border}' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono-k text-[10px] tracking-widest uppercase mb-0.5" style={{ color: '${t.textSoft}' }}>Email</div>
                    <div className="font-sans text-sm truncate" style={{ color: '${t.textMid}' }}>{DATA.email}</div>
                  </div>
                  <span className="font-mono-k text-[10px]" style={{ color: copied ? '${t.accent}' : '${t.border}' }}>
                    {copied ? '✓ Copied' : 'Click to copy'}
                  </span>
                </motion.div>
              )}
              {links.map((l, i) => (
                <motion.a key={l.label} href={l.href} target={l.href?.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.32 + i * 0.06 }}
                  className="group flex items-center gap-4 p-4 card-pf rounded-sm">
                  <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
                    style={{ background: '${t.tagBg}', border: \`1px solid ${t.border}50\` }}>
                    <l.icon size={16} style={{ color: '${t.border}' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono-k text-[10px] tracking-widest uppercase mb-0.5" style={{ color: '${t.textSoft}' }}>{l.label}</div>
                    <div className="font-sans text-sm truncate" style={{ color: '${t.textMid}' }}>{l.value}</div>
                  </div>
                  <ArrowUpRight size={13} style={{ color: '${t.border}' }} />
                </motion.a>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }} className="p-7 card-pf rounded-sm">
            <h3 className="font-serif text-2xl mb-2" style={{ color: '${t.text}' }}>I'm looking for</h3>
            <div className="ink-line mb-5" />
            {['Remote full-stack or backend roles','AI-integrated product development','API design & integration','Startup founding engineer opportunities','Freelance web development'].map(item => (
              <div key={item} className="flex items-center gap-3 mb-3">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '${t.accent}', boxShadow: '0 0 5px ${t.accent}60' }} />
                <span className="font-sans text-sm font-light" style={{ color: '${t.textMid}' }}>{item}</span>
              </div>
            ))}
            ${p.resumeUrl ? `
            {DATA.resumeUrl && (
              <a href={DATA.resumeUrl} target="_blank" rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 font-sans text-sm px-5 py-3 rounded-sm transition-all"
                style={{ background: '${t.text}', color: '${t.bg}' }}>
                Download Resume
              </a>
            )}` : ''}
          </motion.div>
        </div>
      </div>
    </section>
  )
}\n`
}

function footerComponent(p, t) {
  return `import { Github, Linkedin } from 'lucide-react'
import { DATA } from '../data'

export default function Footer() {
  return (
    <footer className="py-10 px-6 border-t" style={{ background: '${t.bgAlt}', borderColor: \`${t.border}40\` }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <span className="font-serif text-lg" style={{ color: '${t.text}' }}>{DATA.name?.split(' ')[0]}</span>
          <span style={{ color: '${t.border}' }}>·</span>
          <span className="font-sans text-xs" style={{ color: '${t.textSoft}' }}>Full-Stack Developer</span>
        </div>
        <div className="flex items-center gap-5">
          {DATA.socials?.github && <a href={DATA.socials.github} target="_blank" rel="noopener noreferrer" style={{ color: '${t.border}' }}><Github size={16}/></a>}
          {DATA.socials?.linkedin && <a href={DATA.socials.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '${t.border}' }}><Linkedin size={16}/></a>}
          <span className="font-sans text-xs" style={{ color: '${t.border}' }}>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}\n`
}

function readmeContent(p) {
  return `# ${p.name} — Portfolio

Generated by [PortfolioForge](https://portfolioforge.vercel.app).

## Run locally

\`\`\`bash
npm install
npm run dev
\`\`\`

## Deploy to Vercel

1. Push to GitHub
2. Import on vercel.com
3. Framework: Vite (auto-detected)
4. Deploy

## Customization

- Edit \`src/data.js\` to update any content
- Edit \`src/index.css\` for theme colors
- Components in \`src/components/\`
`
}
