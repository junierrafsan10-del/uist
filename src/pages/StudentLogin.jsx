import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { loginStudent } from '../hooks/useData'
import TiltCard from '../components/TiltCard'
import GraduationCap3D from '../components/GraduationCap3D'
import ErrorBoundary from '../components/ErrorBoundary'

const pageVariants = {
  initial: { clipPath: 'circle(0% at 50% 50%)', opacity: 0 },
  animate: {
    clipPath: 'circle(100% at 50% 50%)',
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    clipPath: 'circle(0% at 50% 50%)',
    opacity: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function StudentLogin({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ id: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const student = await loginStudent(form.id, form.password)
    setLoading(false)
    if (student) {
      onLogin({ role: 'student', ...student })
      navigate('/student-dashboard')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <motion.div className="min-h-screen bg-navy flex font-body" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0"><ErrorBoundary><GraduationCap3D /></ErrorBoundary></div>
        <div className="relative text-center px-12 max-w-md">
              <motion.img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="NIT" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-display text-5xl text-white mb-4">Welcome Back</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-muted leading-relaxed">Access your academic dashboard to view results, fees, attendance, and more.</motion.p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="w-full max-w-sm">
          <motion.button whileHover={{ x: -3 }} onClick={() => navigate('/')} className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-8 text-sm group">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>Back
          </motion.button>
          <h2 className="font-display text-4xl text-white mb-1">Student Login</h2>
          <p className="text-muted text-sm mb-8">Enter your credentials</p>
          <motion.form onSubmit={handleSubmit} className="space-y-5" animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
            <div>
              <label className={`block text-xs mb-1.5 transition-colors ${focused === 'id' ? 'text-accent' : 'text-muted'}`}>Student ID</label>
              <input
                type="text" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })}
                onFocus={() => setFocused('id')} onBlur={() => setFocused('')}
                placeholder="S1001"
                className="w-full bg-transparent border-b-2 px-1 py-3 text-white outline-none transition-colors placeholder:text-muted/50"
                style={{ borderColor: focused === 'id' ? '#3b82f6' : '#334155' }}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1.5 transition-colors ${focused === 'pass' ? 'text-accent' : 'text-muted'}`}>Password</label>
              <input
                type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                placeholder="••••••"
                className="w-full bg-transparent border-b-2 px-1 py-3 text-white outline-none transition-colors placeholder:text-muted/50"
                style={{ borderColor: focused === 'pass' ? '#3b82f6' : '#334155' }}
              />
            </div>
            {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-danger text-sm">{error}</motion.p>}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-accent text-white rounded-xl font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </motion.button>
            <div className="text-center"><button type="button" className="text-xs text-muted hover:text-accent transition-colors">Forgot Password?</button></div>
          </motion.form>
        </motion.div>
      </div>
    </motion.div>
  )
}
