import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, XCircle, ExternalLink, Github, ArrowLeft } from 'lucide-react'
import { usePortfolioStatus } from '../hooks/usePortfolioStatus'

const STAGES = [
  { key: 'pending',    label: 'Queued',     desc: 'Waiting in generation queue.' },
  { key: 'generating', label: 'Generating', desc: 'AI is enhancing content and writing React code.' },
  { key: 'deploying',  label: 'Deploying',  desc: 'Pushing to GitHub and enabling Pages.' },
  { key: 'live',       label: 'Live',       desc: 'Your portfolio is deployed!' },
]

function StageRow({ stage, current, failed }) {
  const order   = STAGES.findIndex(s => s.key === stage.key)
  const curOrder = STAGES.findIndex(s => s.key === current)
  const done    = order < curOrder
  const active  = order === curOrder && !failed
  const isLive  = stage.key === 'live' && current === 'live'
  const isFail  = failed && order === curOrder

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: order * 0.08 }}
      className="flex items-center gap-4"
    >
      {/* icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
        isLive  ? 'bg-[#E0F0E8] border border-[#4A8A5A]' :
        isFail  ? 'bg-red-50 border border-red-400' :
        done    ? 'bg-[#FFF3D0] border border-[#D4922A]' :
        active  ? 'bg-[#F0E8DA] border-2 border-[#D4922A]' :
                  'bg-[#F0E8DA] border border-[#DDD0BC]'
      }`}>
        {isLive  ? <CheckCircle size={15} className="text-[#4A8A5A]" /> :
         isFail  ? <XCircle size={15} className="text-red-500" /> :
         done    ? <CheckCircle size={15} className="text-[#D4922A]" /> :
         active  ? <Loader2 size={15} className="text-[#D4922A] animate-spin" /> :
                   <div className="w-2 h-2 rounded-full bg-[#DDD0BC]" />}
      </div>

      {/* label */}
      <div>
        <div className={`font-sans text-sm font-medium ${
          active || done || isLive ? 'text-[#1C1410]' : 'text-[#C9A87C]'
        }`}>{stage.label}</div>
        {(active || isFail) && (
          <div className={`font-sans text-xs font-light mt-0.5 ${isFail ? 'text-red-500' : 'text-[#7A6248]'}`}>
            {isFail ? 'Generation failed. Please try again or contact support.' : stage.desc}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function PortfolioStatus() {
  const { id } = useParams()
  const { status, statusMessage, deployedUrl, githubUrl, loading } = usePortfolioStatus(id)

  return (
    <div className="min-h-screen bg-[#F7F3ED] flex flex-col">
      {/* nav */}
      <nav className="border-b border-[#E8DDD0] px-6 py-4 bg-[#F7F3ED]/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-serif text-lg text-[#1C1410]">
            Portfolio<span className="text-[#D4922A]">Forge</span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-1.5 font-sans text-xs text-[#A8896A] hover:text-[#1C1410] transition-colors">
            <ArrowLeft size={13} /> Dashboard
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {loading ? (
            <div className="flex justify-center"><Loader2 size={24} className="animate-spin text-[#C9A87C]" /></div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* header */}
              <div className="mb-10">
                <div className="font-mono-k text-xs text-[#D4922A] tracking-[0.2em] uppercase mb-3">Generation status</div>
                <h1 className="font-serif text-4xl text-[#1C1410] mb-2">
                  {status === 'live'   ? 'Your portfolio is live.' :
                   status === 'failed' ? 'Something went wrong.' :
                   'Building your portfolio…'}
                </h1>
                {statusMessage && (
                  <p className="font-sans text-sm text-[#7A6248] font-light">{statusMessage}</p>
                )}
              </div>

              {/* stages */}
              <div className="card-ed rounded-lg p-7 space-y-5 mb-6">
                {STAGES.map(s => (
                  <StageRow key={s.key} stage={s} current={status} failed={status === 'failed'} />
                ))}
              </div>

              {/* live result */}
              {status === 'live' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card-ed rounded-lg p-7 relative overflow-hidden"
                  style={{ borderColor: 'rgba(74,138,90,0.4)' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#4A8A5A]/50 to-transparent" />
                  <div className="font-mono-k text-[10px] tracking-widest text-[#4A8A5A] uppercase mb-4">🎉 Deployed</div>
                  {deployedUrl && (
                    <div className="mb-4">
                      <p className="font-sans text-xs text-[#A8896A] mb-2">Live URL</p>
                      <div className="flex items-center gap-3 p-3 bg-[#F0E8DA] rounded-sm">
                        <code className="font-mono-k text-sm text-[#1C1410] flex-1 truncate">{deployedUrl}</code>
                        <a href={deployedUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[#D4922A] hover:text-[#A06B10] flex-shrink-0 transition-colors">
                          <ExternalLink size={15} />
                        </a>
                      </div>
                    </div>
                  )}
                  {githubUrl && (
                    <div className="mb-6">
                      <p className="font-sans text-xs text-[#A8896A] mb-2">GitHub repository</p>
                      <div className="flex items-center gap-3 p-3 bg-[#F0E8DA] rounded-sm">
                        <code className="font-mono-k text-xs text-[#1C1410] flex-1 truncate">{githubUrl}</code>
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[#D4922A] hover:text-[#A06B10] flex-shrink-0 transition-colors">
                          <Github size={15} />
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    {deployedUrl && (
                      <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                        <ExternalLink size={14} /> View portfolio
                      </a>
                    )}
                    <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
                  </div>
                </motion.div>
              )}

              {/* failed state */}
              {status === 'failed' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="card-ed rounded-lg p-6 border-red-200">
                  <p className="font-sans text-sm text-[#7A6248] mb-4 font-light">
                    Your portfolio generation encountered an error. You can try again from your dashboard,
                    or contact support if the issue persists.
                  </p>
                  <div className="flex gap-3">
                    <Link to="/builder" className="btn-primary">Try again</Link>
                    <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
                  </div>
                </motion.div>
              )}

              {/* pending / in-progress info */}
              {(status === 'pending' || status === 'generating' || status === 'deploying') && (
                <div className="p-4 bg-[#FFF3D0] border border-[#E8C87A]/40 rounded-sm">
                  <p className="font-sans text-xs text-[#A06B10] font-light leading-relaxed">
                    This page refreshes automatically every 10 seconds. You can safely close it —
                    we'll send your live URL by email when it's ready.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
