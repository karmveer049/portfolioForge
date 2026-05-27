import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import api from '../lib/api'

/* ── Shared layout (reuses the same split-panel from Login) ── */
function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[#F7F3ED] flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#1C1410] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <svg className="w-full h-full"><defs><pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#F7F3ED" strokeWidth="0.5"/>
          </pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>
        </div>
        <Link to="/" className="font-serif text-xl text-[#F7F3ED] relative z-10">
          Portfolio<span className="text-[#D4922A]">Forge</span>
        </Link>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }} className="relative z-10">
          <div className="font-serif text-5xl text-[#F7F3ED] leading-tight mb-4">
            Account <br /><span className="italic text-[#D4922A]">recovery.</span>
          </div>
          <p className="font-sans text-[#C9A87C] font-light leading-relaxed max-w-xs">
            We'll send a secure link to your email so you can get back in.
          </p>
        </motion.div>
        <p className="font-sans text-xs text-[#5C3518] relative z-10">Secure · Encrypted · Temporary link</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-2 font-sans text-xs text-[#A8896A] hover:text-[#1C1410] mb-8 transition-colors">
            <ArrowLeft size={13} /> Back to login
          </Link>
          <h2 className="font-serif text-3xl text-[#1C1410] mb-2">{title}</h2>
          <p className="font-sans text-sm text-[#7A6248] mb-8 font-light">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  )
}

/* ── Forgot Password ── */
export function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async ({ email }) => {
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      // Always show success to prevent email enumeration
      setSent(true)
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your inbox." subtitle="A reset link has been sent if this email is registered.">
        <div className="card-ed rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📬</div>
          <p className="font-sans text-sm text-[#7A6248] font-light leading-relaxed mb-6">
            If an account exists for that email, you'll receive a password reset link within a few minutes.
            Check your spam folder if you don't see it.
          </p>
          <Link to="/login" className="btn-primary">Back to login</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block font-mono-k text-[10px] tracking-[0.18em] text-[#A8896A] uppercase mb-2">
            Email address
          </label>
          <input
            {...register('email', { required: true })}
            type="email"
            placeholder="you@example.com"
            className="input-ed"
          />
        </div>
        <motion.button type="submit" disabled={isSubmitting}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="btn-primary w-full justify-center py-3 disabled:opacity-60">
          {isSubmitting
            ? 'Sending…'
            : <><span>Send reset link</span> <ArrowRight size={15} /></>
          }
        </motion.button>
      </form>
    </AuthShell>
  )
}

/* ── Reset Password ── */
export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const token = searchParams.get('token')
  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm()

  const onSubmit = async ({ password }) => {
    if (!token) return toast.error('Missing reset token')
    try {
      await api.post('/auth/reset-password', { token, password })
      toast.success('Password reset! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — link may have expired')
    }
  }

  if (!token) {
    return (
      <AuthShell title="Invalid link." subtitle="This reset link is missing or malformed.">
        <Link to="/forgot-password" className="btn-primary">Request a new link</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Set a new password." subtitle="Choose a strong password for your account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block font-mono-k text-[10px] tracking-[0.18em] text-[#A8896A] uppercase mb-2">
            New password
          </label>
          <div className="relative">
            <input
              {...register('password', { required: true, minLength: 8 })}
              type={showPass ? 'text' : 'password'}
              placeholder="Min 8 characters"
              className="input-ed pr-10"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A87C] hover:text-[#7A6248]">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password?.type === 'minLength' && (
            <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
          )}
        </div>
        <div>
          <label className="block font-mono-k text-[10px] tracking-[0.18em] text-[#A8896A] uppercase mb-2">
            Confirm password
          </label>
          <input
            {...register('confirm', {
              required: true,
              validate: v => v === watch('password') || 'Passwords do not match',
            })}
            type={showPass ? 'text' : 'password'}
            placeholder="Repeat password"
            className="input-ed"
          />
          {errors.confirm && (
            <p className="text-xs text-red-500 mt-1">{errors.confirm.message}</p>
          )}
        </div>
        <motion.button type="submit" disabled={isSubmitting}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="btn-primary w-full justify-center py-3 disabled:opacity-60">
          {isSubmitting ? 'Saving…' : <><span>Reset password</span> <ArrowRight size={15} /></>}
        </motion.button>
      </form>
    </AuthShell>
  )
}

export default ForgotPassword
