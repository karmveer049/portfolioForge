import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md">
        <div className="font-serif text-[8rem] leading-none text-[#E8DDD0] mb-4">404</div>
        <h1 className="font-serif text-3xl text-[#1C1410] mb-3">Page not found.</h1>
        <p className="font-sans text-[#7A6248] font-light mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn-primary">Go home</Link>
      </motion.div>
    </div>
  )
}
