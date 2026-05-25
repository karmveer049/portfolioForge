import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles, Github, Zap, Globe, Mail, Check, Star } from 'lucide-react'

/* ── Floating decoration helpers ── */
function Dot({ style }) {
  return (
    <motion.div
      className="absolute rounded-full bg-[#D4922A] pointer-events-none"
      style={style}
      animate={{ y: [0, -10, 0], opacity: [0.15, 0.28, 0.15] }}
      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

function GradientOrb({ className }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      animate={{ scale: [1, 1.12, 1], opacity: [0.06, 0.1, 0.06] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/* ── Step card ── */
function Step({ num, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay }}
      className="card-ed rounded-lg p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4922A]/30 to-transparent" />
      <div className="font-serif text-4xl text-[#D4922A]/20 group-hover:text-[#D4922A]/35 transition-colors mb-4 leading-none">
        {num}
      </div>
      <h3 className="font-sans font-semibold text-[#1C1410] mb-2">{title}</h3>
      <p className="font-sans text-sm text-[#7A6248] font-light leading-relaxed">{desc}</p>
    </motion.div>
  )
}

/* ── Feature card ── */
function Feature({ icon: Icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex gap-4 p-5 card-ed rounded-lg group"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-[#F0E8DA] border border-[#DDD0BC] group-hover:border-[#D4922A] flex items-center justify-center transition-colors">
        <Icon size={17} className="text-[#C9A87C] group-hover:text-[#D4922A] transition-colors" />
      </div>
      <div>
        <h4 className="font-sans font-semibold text-[#1C1410] text-sm mb-1">{title}</h4>
        <p className="font-sans text-xs text-[#7A6248] font-light leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

const steps = [
  { num: '01', title: 'Fill your details', desc: 'Complete our guided multi-step form with your projects, skills, experience, and personal info.' },
  { num: '02', title: 'AI enhances your content', desc: 'Our AI rewrites your bio, improves descriptions, and generates professional taglines automatically.' },
  { num: '03', title: 'Choose your theme', desc: 'Pick from premium editorial, warm library, dark espresso, and more design directions.' },
  { num: '04', title: 'Portfolio goes live', desc: 'We generate your React portfolio, push to GitHub, and deploy it. You get the URL in your email.' },
]

const features = [
  { icon: Sparkles, title: 'AI-powered writing', desc: 'Gemini AI rewrites your content to sound polished and professional.' },
  { icon: Github, title: 'Auto GitHub push', desc: 'Your portfolio repo is created and pushed automatically.' },
  { icon: Globe, title: 'Instant deployment', desc: 'Deployed to GitHub Pages or Vercel. Live URL in minutes.' },
  { icon: Zap, title: 'Framer Motion animations', desc: 'Premium scroll-triggered animations and parallax effects.' },
  { icon: Mail, title: 'Email delivery', desc: 'Your hosted portfolio link arrives in your inbox.' },
  { icon: Star, title: 'Premium design system', desc: 'Built on a curated editorial design language. Not templates.' },
]

const pricingPlans = [
  {
    name: 'Starter', price: 'Free', highlight: false,
    features: ['1 portfolio', 'Basic themes', 'GitHub Pages deploy', 'AI bio generation', 'Email delivery'],
  },
  {
    name: 'Pro', price: '$9', period: '/mo', highlight: true,
    features: ['Unlimited portfolios', 'All premium themes', 'Vercel auto-deploy', 'Full AI suite', 'Custom domain', 'Priority support', 'Analytics'],
  },
  {
    name: 'Team', price: '$29', period: '/mo', highlight: false,
    features: ['Everything in Pro', '10 team members', 'Admin panel access', 'White-label option', 'API access'],
  },
]

export default function Landing() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpac = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <div className="min-h-screen bg-[#F7F3ED]">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F3ED]/90 backdrop-blur-md border-b border-[#E8DDD0]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl text-[#1C1410] hover:text-[#D4922A] transition-colors">
            Portfolio<span className="text-[#D4922A]">Forge</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'How it works', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
                className="font-sans text-sm text-[#7A6248] hover:text-[#1C1410] transition-colors">
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
        {/* ambient orbs */}
        <GradientOrb className="w-[600px] h-[400px] bg-[#D4922A] -top-20 -right-40" />
        <GradientOrb className="w-[400px] h-[400px] bg-[#C9A87C] bottom-0 -left-32" />
        {/* dots */}
        {[...Array(12)].map((_, i) => (
          <Dot key={i} style={{ width: 3 + (i%3)*2, height: 3 + (i%3)*2, opacity: 0.15,
            left: `${(i * 37) % 90}%`, top: `${(i * 53) % 80}%` }} />
        ))}
        {/* grid bg */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full"><defs><pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#1C1410" strokeWidth="0.5"/>
          </pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpac }}
          className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 amber-tag rounded-full text-xs font-sans font-medium mb-8"
          >
            <Sparkles size={12} /> AI-Powered Portfolio Generation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2 }}
            className="font-serif text-[clamp(3rem,7vw,6rem)] leading-[1.05] text-[#1C1410] mb-6 max-w-4xl mx-auto"
          >
            Your portfolio,{' '}
            <span className="italic text-[#D4922A]">generated</span>{' '}
            and deployed in minutes.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.38 }}
            className="font-sans text-lg text-[#7A6248] max-w-2xl mx-auto leading-relaxed mb-12 font-light"
          >
            Fill a form. AI writes your content. We generate a premium animated React portfolio, push it to GitHub, and deploy it live — all automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52 }}
            className="flex flex-wrap justify-center items-center gap-4"
          >
            <Link to="/register"
              className="btn-primary text-base px-8 py-4 shadow-lg hover:shadow-xl transition-shadow">
              Generate my portfolio <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="btn-secondary text-base px-8 py-4">
              See how it works
            </a>
          </motion.div>

          {/* social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="font-sans text-xs text-[#A8896A] mt-8"
          >
            Free to start · No credit card · Live URL in your inbox
          </motion.p>
        </motion.div>

        {/* preview mockup strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto px-6 pb-20"
        >
          <div className="card-ed rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-[#F0E8DA] border-b border-[#E0D4C0]">
              <span className="w-3 h-3 rounded-full bg-[#E8B0A0]" />
              <span className="w-3 h-3 rounded-full bg-[#E8D0A0]" />
              <span className="w-3 h-3 rounded-full bg-[#A8C890]" />
              <div className="flex-1 mx-3 h-5 bg-[#E8DDD0] rounded-sm flex items-center px-3">
                <span className="font-mono-k text-[10px] text-[#A8896A]">yourname.vercel.app</span>
              </div>
            </div>
            <div className="bg-[#FFFCF7] p-10 text-center">
              <div className="font-serif text-5xl text-[#1C1410] mb-2">Your Name</div>
              <div className="font-serif text-3xl text-[#D4922A] italic mb-4">Here.</div>
              <div className="font-sans text-sm text-[#7A6248] max-w-xs mx-auto font-light">
                Building thoughtful software for modern startups.
              </div>
              <div className="flex justify-center gap-3 mt-6">
                <div className="px-5 py-2.5 bg-[#1C1410] text-[#F7F3ED] text-xs font-sans rounded-sm">View my work</div>
                <div className="px-5 py-2.5 border border-[#C9A87C] text-[#7A6248] text-xs font-sans rounded-sm">Let's talk</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-[#FDFAF4] relative">
        <div className="ink-line absolute top-0 left-0 right-0" />
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16">
            <div className="font-mono-k text-xs text-[#D4922A] tracking-[0.2em] uppercase mb-4">How it works</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1C1410]">
              From form to <span className="italic text-[#D4922A]">live portfolio</span> in 4 steps.
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => <Step key={s.num} {...s} delay={i * 0.1} />)}
          </div>
        </div>
        <div className="ink-line absolute bottom-0 left-0 right-0" />
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-[#F7F3ED]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <div className="font-mono-k text-xs text-[#D4922A] tracking-[0.2em] uppercase mb-4">Features</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1C1410]">
              Everything you need,<br /><span className="italic text-[#D4922A]">nothing you don't.</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => <Feature key={f.title} {...f} delay={i * 0.08} />)}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-[#FDFAF4] relative">
        <div className="ink-line absolute top-0 left-0 right-0" />
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <div className="font-mono-k text-xs text-[#D4922A] tracking-[0.2em] uppercase mb-4">Pricing</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1C1410]">
              Simple, <span className="italic text-[#D4922A]">transparent</span> pricing.
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className={`relative rounded-lg p-7 overflow-hidden ${
                  plan.highlight
                    ? 'bg-[#1C1410] border-2 border-[#D4922A]'
                    : 'card-ed'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-4 right-4 font-mono-k text-[10px] px-2.5 py-1 bg-[#D4922A] text-[#1C1410] rounded-sm tracking-widest">
                    POPULAR
                  </div>
                )}
                <div className={`font-sans text-xs tracking-widest uppercase mb-3 ${plan.highlight ? 'text-[#C9A87C]' : 'text-[#A8896A]'}`}>
                  {plan.name}
                </div>
                <div className={`font-serif text-5xl mb-1 ${plan.highlight ? 'text-[#F7F3ED]' : 'text-[#1C1410]'}`}>
                  {plan.price}
                  {plan.period && <span className="text-2xl font-sans font-light">{plan.period}</span>}
                </div>
                <div className={`ink-line my-5 ${plan.highlight ? 'opacity-20' : ''}`} />
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2.5 font-sans text-sm ${plan.highlight ? 'text-[#C9A87C]' : 'text-[#7A6248]'}`}>
                      <Check size={14} className="text-[#D4922A] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className={`block text-center py-3 rounded-sm font-sans text-sm font-medium transition-all ${
                    plan.highlight
                      ? 'bg-[#D4922A] text-[#1C1410] hover:bg-[#E8B660]'
                      : 'btn-secondary w-full justify-center'
                  }`}
                >
                  Get started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="ink-line absolute bottom-0 left-0 right-0" />
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-[#1C1410] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full"><defs><pattern id="g2" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#F7F3ED" strokeWidth="0.5"/>
          </pattern></defs><rect width="100%" height="100%" fill="url(#g2)" /></svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-[#F7F3ED] mb-6 leading-tight">
            Your portfolio should be as good as <span className="italic text-[#D4922A]">your code.</span>
          </h2>
          <p className="font-sans text-[#C9A87C] font-light mb-10 leading-relaxed">
            Stop spending weekends building portfolios. Let us do it in minutes.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-3 px-10 py-4 bg-[#D4922A] text-[#1C1410] font-sans font-semibold rounded-sm hover:bg-[#E8B660] transition-all">
            Generate my portfolio <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#F0E8DA] border-t border-[#E8DDD0] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg text-[#1C1410]">
            Portfolio<span className="text-[#D4922A]">Forge</span>
          </span>
          <p className="font-sans text-xs text-[#A8896A]">
            © {new Date().getFullYear()} PortfolioForge. Built with care.
          </p>
        </div>
      </footer>
    </div>
  )
}
