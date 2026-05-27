import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#F7F3ED] flex">
      {/* left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#1C1410] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <svg className="w-full h-full"><defs><pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#F7F3ED" strokeWidth="0.5"/>
          </pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>
        </div>
        <Link to="/" className="font-serif text-xl text-[#F7F3ED] relative z-10">
          Portfolio<span className="text-[#D4922A]">Forge</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10"
        >
          <div className="font-serif text-5xl text-[#F7F3ED] leading-tight mb-4">
            Your portfolio,<br />
            <span className="italic text-[#D4922A]">generated.</span>
          </div>
          <p className="font-sans text-[#C9A87C] font-light leading-relaxed max-w-xs">
            Fill a form. AI writes your content. Your live portfolio URL arrives in your inbox.
          </p>
        </motion.div>
        <p className="font-sans text-xs text-[#5C3518] relative z-10">
          Free to start · No credit card required
        </p>
      </div>

      {/* right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-2">
            <Link to="/" className="font-serif text-lg text-[#1C1410] hover:text-[#D4922A] transition-colors lg:hidden">
              Portfolio<span className="text-[#D4922A]">Forge</span>
            </Link>
          </div>
          <h2 className="font-serif text-3xl text-[#1C1410] mb-2 mt-4">{title}</h2>
          <p className="font-sans text-sm text-[#7A6248] mb-8 font-light">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  )
}

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <AuthLayout title="Welcome back." subtitle="Sign in to your PortfolioForge account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block font-mono-k text-[10px] tracking-[0.18em] text-[#A8896A] uppercase mb-2">Email</label>
          <input {...register('email', { required: true })}
            type="email" placeholder="you@example.com" className="input-ed" />
          {errors.email && <p className="text-xs text-red-500 mt-1">Email is required</p>}
        </div>
        <div>
          <label className="block font-mono-k text-[10px] tracking-[0.18em] text-[#A8896A] uppercase mb-2">Password</label>
          <div className="relative">
            <input {...register('password', { required: true })}
              type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input-ed pr-10" />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A87C] hover:text-[#7A6248]">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span />
          <Link to="/forgot-password" className="font-sans text-xs text-[#A06B10] hover:text-[#D4922A]">
            Forgot password?
          </Link>
        </div>
        <motion.button type="submit" disabled={isSubmitting}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="btn-primary w-full justify-center py-3 disabled:opacity-60">
          {isSubmitting ? 'Signing in…' : <><span>Sign in</span> <ArrowRight size={15} /></>}
        </motion.button>
      </form>
      <p className="font-sans text-sm text-center text-[#7A6248] mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#D4922A] hover:text-[#A06B10] font-medium">Sign up free</Link>
      </p>
    </AuthLayout>
  )
}

export function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password })
      toast.success('Account created! Let\'s build your portfolio.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <AuthLayout title="Create your account." subtitle="Start building your portfolio in minutes — free.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block font-mono-k text-[10px] tracking-[0.18em] text-[#A8896A] uppercase mb-2">Full name</label>
          <input {...register('name', { required: true })}
            placeholder="Karmveer Kumar" className="input-ed" />
        </div>
        <div>
          <label className="block font-mono-k text-[10px] tracking-[0.18em] text-[#A8896A] uppercase mb-2">Email</label>
          <input {...register('email', { required: true })}
            type="email" placeholder="you@example.com" className="input-ed" />
        </div>
        <div>
          <label className="block font-mono-k text-[10px] tracking-[0.18em] text-[#A8896A] uppercase mb-2">Password</label>
          <div className="relative">
            <input {...register('password', { required: true, minLength: 8 })}
              type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" className="input-ed pr-10" />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A87C] hover:text-[#7A6248]">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password?.type === 'minLength' && (
            <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
          )}
        </div>
        <motion.button type="submit" disabled={isSubmitting}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="btn-primary w-full justify-center py-3 disabled:opacity-60">
          {isSubmitting ? 'Creating account…' : <><span>Create account</span> <ArrowRight size={15} /></>}
        </motion.button>
        <p className="font-sans text-xs text-[#A8896A] text-center">
          By signing up you agree to our Terms & Privacy Policy.
        </p>
      </form>
      <p className="font-sans text-sm text-center text-[#7A6248] mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-[#D4922A] hover:text-[#A06B10] font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default Login
