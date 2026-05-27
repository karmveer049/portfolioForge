import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, FolderOpen, Clock, CheckCircle, Loader2, Play, Trash2, Eye, XCircle, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="card-ed rounded-lg p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4922A]/25 to-transparent" />
      <div className={`w-10 h-10 rounded-sm flex items-center justify-center mb-4 ${color}`}>
        <Icon size={17} />
      </div>
      <div className="font-serif text-4xl text-[#1C1410] mb-1">{value}</div>
      <div className="font-sans text-xs text-[#A8896A]">{label}</div>
    </motion.div>
  )
}

const STATUS_COLORS = {
  pending:    'text-[#A8896A] bg-[#F0E8DA]',
  generating: 'text-[#A06B10] bg-[#FFF3D0]',
  deploying:  'text-[#4A7A90] bg-[#E0F0F8]',
  live:       'text-[#4A8A5A] bg-[#E0F0E8]',
  failed:     'text-red-600 bg-red-50',
}

export default function AdminPage() {
  const { user, logout } = useAuth()
  const [tab, setTab]               = useState('portfolios')
  const [portfolios, setPortfolios] = useState([])
  const [users, setUsers]           = useState([])
  const [stats, setStats]           = useState({})
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/portfolios'),
      api.get('/admin/users'),
      api.get('/admin/stats'),
    ]).then(([pRes, uRes, sRes]) => {
      setPortfolios(pRes.data.portfolios)
      setUsers(uRes.data.users)
      setStats(sRes.data)
    }).catch(() => toast.error('Failed to load admin data'))
    .finally(() => setLoading(false))
  }, [])

  const triggerDeploy = async (id) => {
    try {
      await api.post(`/admin/portfolios/${id}/deploy`)
      setPortfolios(prev => prev.map(p => p.id === id ? { ...p, status: 'deploying' } : p))
      toast.success('Deployment triggered!')
    } catch { toast.error('Deploy failed') }
  }

  const deletePortfolio = async (id) => {
    if (!confirm('Delete this portfolio?')) return
    try {
      await api.delete(`/admin/portfolios/${id}`)
      setPortfolios(prev => prev.filter(p => p.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user and all their data?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success('User deleted')
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1C1410] border-b border-[#2A1A0D]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-serif text-lg text-[#F7F3ED]">
              Portfolio<span className="text-[#D4922A]">Forge</span>
            </Link>
            <span className="font-mono-k text-[10px] text-[#D4922A] tracking-widest px-2 py-0.5 border border-[#D4922A]/30 rounded-sm">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-sans text-xs text-[#C9A87C]">{user?.email}</span>
            <button onClick={logout}
              className="flex items-center gap-1.5 font-sans text-xs text-[#C9A87C] hover:text-[#F7F3ED]">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="font-mono-k text-xs text-[#D4922A] tracking-[0.2em] uppercase mb-2">Admin Panel</div>
          <h1 className="font-serif text-4xl text-[#1C1410]">Overview.</h1>
        </motion.div>

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users}      label="Total users"        value={stats.totalUsers     || 0} color="bg-[#F0E8DA] text-[#C9A87C]" />
          <StatCard icon={FolderOpen} label="Portfolios"         value={stats.totalPortfolios || 0} color="bg-[#FFF3D0] text-[#D4922A]" />
          <StatCard icon={CheckCircle} label="Live"               value={stats.livePortfolios  || 0} color="bg-[#E0F0E8] text-[#4A8A5A]" />
          <StatCard icon={Clock}      label="Pending"            value={stats.pendingCount    || 0} color="bg-[#EBE0CF] text-[#A8896A]" />
        </div>

        {/* tabs */}
        <div className="flex gap-1 mb-8 p-1 bg-[#F0E8DA] rounded-sm w-fit">
          {['portfolios', 'users'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`font-sans text-sm px-5 py-2 rounded-sm transition-all capitalize ${
                tab === t ? 'bg-[#1C1410] text-[#F7F3ED] shadow-sm' : 'text-[#7A6248] hover:text-[#1C1410]'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#C9A87C]" /></div>
        ) : tab === 'portfolios' ? (
          <div className="card-ed rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EBE0CF] bg-[#FDFAF4]">
                    {['User', 'Portfolio', 'Theme', 'Status', 'Created', 'Actions'].map(h => (
                      <th key={h} className="text-left font-mono-k text-[10px] tracking-widest text-[#A8896A] uppercase px-5 py-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolios.map((p, i) => (
                    <motion.tr key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-[#F0E8DA] hover:bg-[#FDFAF4] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-sans text-sm text-[#1C1410]">{p.user?.name}</div>
                        <div className="font-sans text-xs text-[#A8896A]">{p.user?.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-sans text-sm text-[#1C1410] font-medium">{p.name}</div>
                        <div className="font-sans text-xs text-[#A8896A] truncate max-w-[180px]">{p.tagline}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono-k text-xs text-[#A8896A] capitalize">{p.theme?.replace('-', ' ')}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-sans text-xs font-medium px-2 py-1 rounded-sm capitalize ${STATUS_COLORS[p.status] || STATUS_COLORS.pending}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-sans text-xs text-[#A8896A]">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {p.deployedUrl && (
                            <a href={p.deployedUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[#A8896A] hover:text-[#D4922A] transition-colors" title="View live">
                              <Eye size={15} />
                            </a>
                          )}
                          {(p.status === 'pending' || p.status === 'failed') && (
                            <button onClick={() => triggerDeploy(p.id)}
                              className="text-[#A8896A] hover:text-[#4A8A5A] transition-colors" title="Trigger deploy">
                              <Play size={15} />
                            </button>
                          )}
                          <button onClick={() => deletePortfolio(p.id)}
                            className="text-[#A8896A] hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card-ed rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EBE0CF] bg-[#FDFAF4]">
                    {['Name', 'Email', 'Role', 'Portfolios', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left font-mono-k text-[10px] tracking-widest text-[#A8896A] uppercase px-5 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <motion.tr key={u.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-[#F0E8DA] hover:bg-[#FDFAF4] transition-colors"
                    >
                      <td className="px-5 py-4 font-sans text-sm text-[#1C1410] font-medium">{u.name}</td>
                      <td className="px-5 py-4 font-sans text-sm text-[#7A6248]">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`font-mono-k text-[10px] px-2 py-0.5 rounded-sm ${
                          u.role === 'admin' ? 'amber-tag' : 'bg-[#F0E8DA] text-[#A8896A]'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-sans text-sm text-[#7A6248]">{u.portfolioCount || 0}</td>
                      <td className="px-5 py-4 font-sans text-xs text-[#A8896A]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => deleteUser(u.id)}
                          className="text-[#A8896A] hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
