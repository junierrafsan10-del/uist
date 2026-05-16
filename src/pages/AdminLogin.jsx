import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loginAdmin } from '../hooks/useData'
import TiltCard from '../components/TiltCard'

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

export default function AdminLogin({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const admin = await loginAdmin(form.username, form.password)
    setLoading(false)
    if (admin) {
      onLogin(admin)
      navigate('/admin-dashboard')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <motion.div className="min-h-screen bg-[#0a0f1a] flex font-body" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden" style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)' }}>
        <div className="relative text-center px-12 max-w-md">
          <motion.img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="NIT" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.3 }} className="w-24 h-24 rounded-full object-cover mx-auto mb-6" />
          <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="font-display text-4xl text-white mb-4">Admin Portal</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted leading-relaxed">Manage students, faculty, fees, attendance, and notices.</motion.p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="w-full max-w-sm">
          <motion.button whileHover={{ x: -3 }} onClick={() => navigate('/')} className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-8 text-sm group">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>Back
          </motion.button>
          <h2 className="font-display text-4xl text-white mb-1">Admin Login</h2>
          <p className="text-muted text-sm mb-8">Authorized personnel only</p>
          <motion.form onSubmit={handleSubmit} className="space-y-5" animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
            <div>
              <label className="block text-xs text-muted mb-1.5">Username</label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="admin" className="w-full bg-transparent border-b-2 border-slate-700 px-1 py-3 text-white outline-none focus:border-accent transition-colors placeholder:text-muted/50" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••" className="w-full bg-transparent border-b-2 border-slate-700 px-1 py-3 text-white outline-none focus:border-accent transition-colors placeholder:text-muted/50" />
            </div>
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger text-sm">{error}</motion.p>}
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-accent text-white rounded-xl font-semibold shadow-lg shadow-accent/20 disabled:opacity-70 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </motion.div>
  )
}
