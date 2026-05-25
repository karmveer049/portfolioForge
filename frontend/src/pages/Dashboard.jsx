import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ExternalLink, Github, Clock, CheckCircle, XCircle, Loader2, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const STATUS_CONFIG = {
  pending:    { label: 'Queued',     color: 'text-[#A8896A]',  bg: 'bg-[#F0E8DA]',          icon: Clock },
  generating: { label: 'Generating', color: 'text-[#A06B10]',  bg: 'bg-[#FFF3D0]',          icon: Loader2 },
  deploying:  { label: 'Deploying',  color: 'text-[#6B8FA0]',  bg: 'bg-[#E0F0F8]',          icon: Loader2 },
  live:       { label: 'Live',       color: 'text-[#4A8A5A]',  bg: 'bg-[#E0F0E8]',          icon: CheckCircle },
  failed:     { label: 'Failed',     color: 'text-red-600',    bg: 'bg-red-50',             icon: XCircle },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  const spinning = status === 'generating' || status === 'deploying'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-sans text-xs font-medium ${cfg.color} ${cfg.bg}`}>
      <Icon size={11} className={spinning ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  )
}

function PortfolioCard({ portfolio }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-ed rounded-lg overflow-hidden group"
    >
      {/* screenshot preview */}
      <div className="relative h-40 bg-[#F0E8DA] overflow-hidden">
        {portfolio.previewUrl ? (
          <img src={portfolio.previewUrl} alt={portfolio.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="font-serif text-2xl text-[#C9A87C] mb-1">{portfolio.name?.split(' ')[0]}</div>
              <div className="font-mono-k text-xs text-[#A8896A]">{portfolio.theme}</div>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={portfolio.status} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4922A]/30 to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="font-sans font-semibold text-[#1C1410] mb-1">{portfolio.name}</h3>
        <p className="font-sans text-xs text-[#A8896A] mb-4 font-light">{portfolio.tagline}</p>

        {portfolio.status === 'live' && (
          <div className="flex gap-2">
            <a href={portfolio.deployedUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-sans text-xs text-[#D4922A] hover:text-[#A06B10] transition-colors font-medium">
              <ExternalLink size={12} /> View live
            </a>
            {portfolio.githubUrl && (
              <a href={portfolio.githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-sans text-xs text-[#A8896A] hover:text-[#1C1410] transition-colors ml-3">
                <Github size={12} /> Repository
              </a>
            )}
          </div>
        )}

        {portfolio.status === 'pending' && (
          <p className="font-sans text-xs text-[#A8896A]">
            Queued for generation. You'll be notified by email.
          </p>
        )}

        {portfolio.status === 'generating' && (
          <p className="font-sans text-xs text-[#A06B10]">
            AI is writing and building your portfolio…
          </p>
        )}

        {portfolio.status === 'failed' && (
          <p className="font-sans text-xs text-red-500">
            Generation failed. Please contact support.
          </p>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#EBE0CF]">
          <span className="font-mono-k text-[10px] text-[#C9A87C]">
            {new Date(portfolio.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="font-mono-k text-[10px] text-[#C9A87C] capitalize">{portfolio.theme?.replace('-', ' ')}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/portfolio/my')
      .then(res => setPortfolios(res.data.portfolios))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      {/* navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F3ED]/92 backdrop-blur-md border-b border-[#E8DDD0]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl text-[#1C1410]">
            Portfolio<span className="text-[#D4922A]">Forge</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-sans text-sm text-[#7A6248]">
              Hello, <span className="text-[#1C1410] font-medium">{user?.name?.split(' ')[0]}</span>
            </span>
            <button onClick={logout}
              className="flex items-center gap-1.5 font-sans text-xs text-[#A8896A] hover:text-[#1C1410] transition-colors">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-24">
        {/* header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between mb-12">
          <div>
            <div className="font-mono-k text-xs text-[#D4922A] tracking-[0.2em] uppercase mb-2">Dashboard</div>
            <h1 className="font-serif text-4xl text-[#1C1410]">
              Your portfolios.
            </h1>
          </div>
          <Link to="/builder" className="btn-primary">
            <Plus size={15} /> New portfolio
          </Link>
        </motion.div>

        <div className="ink-line mb-10" />

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={24} className="animate-spin text-[#C9A87C]" />
          </div>
        ) : portfolios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-ed rounded-xl p-16 text-center max-w-md mx-auto"
          >
            <div className="font-serif text-5xl text-[#C9A87C] mb-4">∅</div>
            <h2 className="font-serif text-2xl text-[#1C1410] mb-3">No portfolios yet.</h2>
            <p className="font-sans text-sm text-[#7A6248] font-light mb-8 leading-relaxed">
              You haven't generated a portfolio yet. Fill in your details and we'll build one for you.
            </p>
            <Link to="/builder" className="btn-primary">
              <Plus size={15} /> Build my portfolio
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {portfolios.map(p => <PortfolioCard key={p._id || p.id} portfolio={p} />)}
            <Link to="/builder"
              className="card-ed rounded-lg flex flex-col items-center justify-center min-h-[280px] hover:border-[#D4922A] transition-colors group">
              <div className="w-12 h-12 rounded-sm bg-[#F0E8DA] border border-[#DDD0BC] group-hover:border-[#D4922A] flex items-center justify-center mb-4 transition-colors">
                <Plus size={20} className="text-[#C9A87C] group-hover:text-[#D4922A] transition-colors" />
              </div>
              <span className="font-sans text-sm text-[#A8896A] group-hover:text-[#1C1410] transition-colors">New portfolio</span>
            </Link>
          </div>
        )}

        {/* info banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-5 card-ed rounded-lg flex items-start gap-4"
        >
          <div className="w-8 h-8 rounded-sm bg-[#FFF3D0] border border-[#E8C87A]/40 flex items-center justify-center flex-shrink-0">
            <Clock size={14} className="text-[#A06B10]" />
          </div>
          <div>
            <p className="font-sans text-sm text-[#1C1410] font-medium mb-1">Generation timeline</p>
            <p className="font-sans text-xs text-[#7A6248] font-light">
              Portfolio generation typically takes 5–30 minutes. Complex portfolios may take up to 24 hours.
              You'll receive an email at <strong>{user?.email}</strong> with your live URL.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
