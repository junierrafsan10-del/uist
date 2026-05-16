import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TiltCard from '../components/TiltCard'
import useCountUp from '../hooks/useCountUp'
import { useResults, useFees, useAttendance } from '../hooks/useData'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'
import { getGrade, buildResults, buildFees, buildAttendance, DEPT_SUBJECTS } from '../data/mockData'

const GRADE_COLORS = { 'A+': 'text-green-600 bg-green-50 border-green-200', 'A': 'text-blue-600 bg-blue-50 border-blue-200', 'B': 'text-indigo-600 bg-indigo-50 border-indigo-200', 'C': 'text-yellow-600 bg-yellow-50 border-yellow-200', 'D': 'text-orange-600 bg-orange-50 border-orange-200', 'F': 'text-red-600 bg-red-50 border-red-200' }

function AnimatedArc({ value, max = 10, size = 120, stroke = 8, color = '#3b82f6' }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, offset = circ - (value / max) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  )
}

function AnimatedRing({ pct, size = 120, stroke = 8 }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, offset = circ - (pct / 100) * circ
  const color = pct < 75 ? '#ef4444' : pct < 85 ? '#f59e0b' : '#10b981'
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </svg>
  )
}

function AnimatedProgress({ paid, total }) {
  const pct = total ? Math.min(paid / total * 100, 100) : 0
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <motion.div className="h-full rounded-full bg-success" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
    </div>
  )
}

function StatCard({ label, value, icon, color, suffix }) {
  const count = useCountUp(typeof value === 'number' ? value : parseFloat(value) || 0)
  const display = typeof value === 'string' ? value : count + (suffix || '')
  return (
    <TiltCard className="bg-white rounded-2xl shadow-card border border-gray-50 p-5">
      <p className="text-xs text-muted mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold" style={{ color }}>{display}</span>
        <span className="text-xl">{icon}</span>
      </div>
    </TiltCard>
  )
}

function PaymentTimeline({ fees }) {
  return (
    <div className="relative pl-8 space-y-6">
      <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 1.5 }} className="absolute left-3.5 top-2 w-0.5 bg-accent/30 origin-top" />
      {fees.map((f, i) => {
        const isPaid = f.status === 'paid'
        const isPartial = f.status === 'partial'
        return (
          <motion.div key={f.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="relative">
            <motion.div className={`absolute -left-7 top-1 w-4 h-4 rounded-full border-2 ${isPaid ? 'bg-success border-success' : isPartial ? 'bg-warning border-warning' : 'bg-danger border-danger'}`}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 + 0.5, type: 'spring' }}
            >
              {isPaid && (
                <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <motion.path d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: i * 0.15 + 0.8, duration: 0.3 }} />
                </svg>
              )}
            </motion.div>
            <div className="flex justify-between items-start">
              <div><p className="text-sm font-medium text-gray-700">{f.desc}</p><p className="text-xs text-muted">{f.date}</p></div>
              <div className="text-right"><p className="text-sm font-semibold">৳{f.amount.toLocaleString()}</p><p className={`text-xs ${isPaid ? 'text-success' : isPartial ? 'text-warning' : 'text-danger'}`}>{f.status}</p></div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: '▦' },
  { key: 'results', label: 'Results', icon: '★' },
  { key: 'fees', label: 'Fee Status', icon: '₿' },
  { key: 'attendance', label: 'Attendance', icon: '◷' },
  { key: 'profile', label: 'Profile', icon: '⊙' },
]

const dashPage = {
  initial: { clipPath: 'circle(0% at 50% 50%)', opacity: 0 },
  animate: {
    clipPath: 'circle(100% at 50% 50%)',
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function StudentDashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const storedProfile = JSON.parse(sessionStorage.getItem('authUser') || 'null')?.profile
  const displayName = profile?.name || storedProfile?.name || user?.email?.split('@')[0] || 'Student'
  const displayId = storedProfile?.student_id || user?.id?.slice(0, 8) || 'S1001'
  const displayDept = profile?.dept || storedProfile?.dept || 'CSE'
  const displayYear = profile?.year || storedProfile?.year || '1st'
  const displaySem = profile?.sem || storedProfile?.sem || 1
  const displayPhoto = profile?.photo || storedProfile?.photo || null

  const { data: results } = useResults(displayId, displayDept, displaySem)
  const { data: fees } = useFees(displayId)
  const { data: attendance } = useAttendance(displayId)
  const due = fees.reduce((s, f) => s + (f.amount - f.paid), 0)
  const paid = fees.reduce((s, f) => s + f.paid, 0)
  const total = fees.reduce((s, f) => s + f.amount, 0)
  const overallAtt = (() => { const t = attendance.reduce((s, a) => s + a.total, 0), at = attendance.reduce((s, a) => s + a.attended, 0); return t ? Math.round(at / t * 100) : 0 })()
  const overallCgpa = (() => { let tc = 0, tp = 0; results.forEach(s => s.subjects.forEach(sub => { tc += sub.credits; tp += sub.credits * sub.points })); return tc ? (tp / tc) : 0 })()

  const handleLogout = () => { signOut(); navigate('/') }

  return (
    <motion.div className="min-h-screen bg-bg font-body flex" variants={dashPage} initial="initial" animate="animate">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
      <motion.aside
        animate={{ x: isDesktop ? 0 : open ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-100 flex flex-col shadow-xl lg:shadow-none"
      >
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src={logo} alt="NIT" className="w-9 h-9 rounded-full object-cover" loading="lazy" decoding="async" />
            <div><p className="font-display text-sm text-navy leading-tight">UIST</p><p className="text-xs text-muted">Student Portal</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((t, i) => (
            <motion.button key={t.key}
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: open ? i * 0.05 : 0 }}
              onClick={() => { setTab(t.key); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${tab === t.key ? 'text-navy' : 'text-muted hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {tab === t.key && <motion.div layoutId="activeTab" className="absolute inset-0 bg-accent/5 rounded-xl border-l-4 border-accent" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
              <span className="relative z-10 text-lg">{t.icon}</span>
              <span className="relative z-10">{t.label}</span>
            </motion.button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium text-muted hover:bg-red-50 hover:text-danger transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>Logout
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-muted">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <img src={logo} alt="UIST" style={{ height: '36px', objectFit: 'contain' }} loading="lazy" decoding="async" />
            <h2 className="font-display text-lg text-navy capitalize ml-2">{tab}</h2>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
            <div className="text-right hidden sm:block"><p className="text-sm font-medium text-gray-700">{displayName}</p><p className="text-xs text-muted">{displayId}</p></div>
            <div className="w-9 h-9 bg-navy/5 rounded-full flex items-center justify-center text-navy font-bold text-sm">{displayName.charAt(0)}</div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {tab === 'dashboard' && (
                <div className="space-y-6">
                  {due > 0 && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-center gap-3"><span className="w-2 h-2 bg-danger rounded-full animate-pulse" /><p className="text-sm text-red-700">Pending due: <strong>৳{due.toLocaleString()}</strong></p></motion.div>}
                  <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6"><p className="text-xs text-muted mb-1">Welcome back,</p><h2 className="font-display text-2xl text-navy">{displayName}</h2><p className="text-sm text-muted mt-1">{displayId} · {displayDept} · {displayYear} · Sem {displaySem}</p></div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'CGPA', value: overallCgpa, icon: '★', color: '#f59e0b' },
                      { label: 'Attendance', value: `${overallAtt}%`, icon: '◷', color: overallAtt < 75 ? '#ef4444' : '#10b981' },
                      { label: 'Due Amount', value: due, icon: '₿', color: due > 0 ? '#ef4444' : '#10b981', prefix: '৳' },
                      { label: 'Semester', value: displaySem, icon: '▣', color: '#1d4ed8' },
                    ].map((c, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                        <TiltCard className="bg-white rounded-2xl shadow-card border border-gray-50 p-5">
                          <p className="text-xs text-muted mb-1">{c.label}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold" style={{ color: c.color }}>{c.prefix || ''}{c.value}</span>
                            <span className="text-xl">{c.icon}</span>
                          </div>
                          {c.label === 'CGPA' && <div className="mt-3 flex justify-center"><AnimatedArc value={overallCgpa} max={10} size={80} stroke={6} /></div>}
                          {c.label === 'Attendance' && <div className="mt-3 flex justify-center"><AnimatedRing pct={overallAtt} size={80} stroke={6} /></div>}
                          {c.label === 'Due Amount' && due > 0 && <div className="mt-2 flex justify-center"><span className="animate-pulse-red inline-block w-full h-0.5 bg-danger/20 rounded" /></div>}
                        </TiltCard>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50"><h3 className="font-display text-lg text-navy">Recent Results</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 text-left text-muted"><th className="px-6 py-3 font-medium">Subject</th><th className="px-6 py-3 text-center font-medium">Marks</th><th className="px-6 py-3 text-center font-medium">Grade</th></tr></thead>
                        <tbody className="divide-y divide-gray-50">
                          {results.length > 0 && results[results.length - 1].subjects.slice(0, 3).map((sub, i) => (
                            <motion.tr key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="hover:bg-gray-50/50">
                              <td className="px-6 py-3 text-gray-700">{sub.subject}</td><td className="px-6 py-3 text-center text-gray-600">{sub.marks}</td>
                              <td className="px-6 py-3 text-center">
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: i * 0.08 + 0.2 }}
                                  className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${GRADE_COLORS[sub.grade] || 'text-gray-600 bg-gray-50'}`}>{sub.grade}</motion.span>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'results' && <ResultsTabContent results={results} />}
              {tab === 'fees' && <FeesTabContent fees={fees} due={due} paid={paid} total={total} />}
              {tab === 'attendance' && <AttendanceTabContent attendance={attendance} overallAtt={overallAtt} />}
              {tab === 'profile' && <ProfileTabContent user={user} displayName={displayName} displayId={displayId} displayDept={displayDept} displayYear={displayYear} displaySem={displaySem} displayPhoto={displayPhoto} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  )
}

function ResultsTabContent({ results }) {
  const [sem, setSem] = useState(results.length > 0 ? results[results.length - 1].semester : 1)
  const [showBteb, setShowBteb] = useState(false)
  const semData = results.find(s => s.semester === sem)
  const gpa = semData ? (() => { const tc = semData.subjects.reduce((s, sub) => s + sub.credits, 0), tp = semData.subjects.reduce((s, sub) => s + sub.credits * sub.points, 0); return tc ? (tp / tc) : 0 })() : 0
  const cgpaVal = (() => { let tc = 0, tp = 0; results.forEach(r => r.subjects.forEach(sub => { tc += sub.credits; tp += sub.credits * sub.points })); return tc ? (tp / tc) : 0 })()
  const cgpaDisplay = useCountUp(Math.round(cgpaVal * 100))
  const gpaDisplay = useCountUp(Math.round(gpa * 100))

  const handleBtebClick = () => {
    setShowBteb(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {results.map(s => (
            <motion.button key={s.semester} onClick={() => setSem(s.semester)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${sem === s.semester ? 'bg-accent text-white shadow-md' : 'bg-white text-muted hover:bg-gray-50 border border-gray-100'}`}
              whileTap={{ scale: 0.95 }}
            >Sem {s.semester}</motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {!showBteb ? (
            <motion.button key="clickme" onClick={handleBtebClick}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-base font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/40"
            >
              Click Me
            </motion.button>
          ) : (
            <motion.a key="bteb" href="https://btebresultszone.com/results" target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="px-6 py-3 bg-red-600 text-white rounded-xl text-base font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/40 flex items-center gap-2 whitespace-nowrap animate-pulse-red"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              BTEB Result
            </motion.a>
          )}
        </AnimatePresence>
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-muted"><th className="px-6 py-4 font-medium">Subject</th><th className="px-6 py-4 text-center font-medium">Credits</th><th className="px-6 py-4 text-center font-medium">Marks</th><th className="px-6 py-4 text-center font-medium">Grade</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {semData?.subjects.map((sub, i) => (
                <motion.tr key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-700">{sub.subject}</td><td className="px-6 py-4 text-center text-gray-600">{sub.credits}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{sub.marks}</td>
                  <td className="px-6 py-4 text-center">
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, delay: i * 0.06 + 0.15 }}
                      className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${GRADE_COLORS[sub.grade] || 'text-gray-600 bg-gray-50'}`}>{sub.grade}</motion.span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-6 border border-accent/10">
          <p className="text-xs text-muted mb-1">Semester {sem} GPA</p>
          <p className="text-3xl font-bold text-accent">{(gpaDisplay / 100).toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-navy/5 to-navy/10 rounded-2xl p-6 border border-navy/10">
          <p className="text-xs text-muted mb-1">Overall CGPA</p>
          <p className="text-3xl font-bold text-navy">{(cgpaDisplay / 100).toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

function FeesTabContent({ fees, due, paid, total }) {
  const pct = total ? Math.round(paid / total * 100) : 0
  const countPaid = useCountUp(Math.round(paid / 1000))
  const countTotal = useCountUp(Math.round(total / 1000))
  const countDue = useCountUp(Math.round(due / 1000))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6"><p className="text-xs text-muted mb-1">Total Fee</p><p className="text-2xl font-bold text-navy">৳{countTotal},{String(total % 1000).padStart(3, '0')}</p></div>
        <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6"><p className="text-xs text-muted mb-1">Paid</p><p className="text-2xl font-bold text-success">৳{countPaid},{String(paid % 1000).padStart(3, '0')}</p></div>
        <div className={`rounded-2xl shadow-sm border p-6 ${due > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-50'}`}>
          <p className="text-xs text-muted mb-1">Due</p>
          <p className={`text-2xl font-bold ${due > 0 ? 'text-danger' : 'text-success'}`}>৳{countDue},{String(due % 1000).padStart(3, '0')}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6">
        <div className="flex justify-between text-sm mb-2"><span className="text-muted">Payment Progress</span><span className="font-semibold">{pct}%</span></div>
        <AnimatedProgress paid={paid} total={total} />
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6">
        <h3 className="font-display text-lg text-navy mb-6">Payment Timeline</h3>
        <PaymentTimeline fees={fees} />
      </div>
    </div>
  )
}

function AttendanceTabContent({ attendance, overallAtt }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-8 flex flex-col items-center">
        <AnimatedRing pct={overallAtt} size={140} stroke={10} />
        <div className="relative" style={{ marginTop: -100 }}>
          <span className={`text-3xl font-bold ${overallAtt < 75 ? 'text-danger' : overallAtt < 85 ? 'text-warning' : 'text-success'}`}>{overallAtt}%</span>
        </div>
        <p className="text-sm text-muted mt-12">
          {overallAtt < 75 ? 'Below minimum! Needs improvement.' : overallAtt < 85 ? 'Moderate attendance.' : 'Good attendance!'}
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50"><h3 className="font-display text-lg text-navy">Subject-wise</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-muted"><th className="px-6 py-3 font-medium">Subject</th><th className="px-6 py-3 text-center font-medium">Total</th><th className="px-6 py-3 text-center font-medium">Attended</th><th className="px-6 py-3 text-center font-medium">%</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {attendance.map((a, i) => {
                const pct = a.total ? Math.round(a.attended / a.total * 100) : 0
                const c = pct < 75 ? 'text-danger bg-red-50 border-red-100' : pct < 85 ? 'text-warning bg-yellow-50 border-yellow-100' : 'text-success bg-green-50 border-green-100'
                return (
                  <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className={`hover:bg-gray-50/50 ${pct < 75 ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="px-6 py-4 text-gray-700 font-medium">{a.subject}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{a.total}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{a.attended}</td>
                    <td className="px-6 py-4 text-center"><span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${c}`}>{pct}%</span></td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ProfileTabContent({ user, displayName, displayId, displayDept, displayYear, displaySem, displayPhoto }) {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="max-w-2xl">
      <motion.div className="bg-white rounded-2xl shadow-card border border-gray-50 p-8"
        animate={editing ? { rotateY: 5 } : { rotateY: 0 }} transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div className="w-28 h-28 rounded-full bg-navy/5 flex items-center justify-center border-2 border-dashed border-gray-200 mb-4 overflow-hidden"
            whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}
          >
            {displayPhoto ? <img src={displayPhoto} className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-navy">{displayName?.charAt(0)}</span>}
          </motion.div>
        </div>
        <motion.div className="space-y-4" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}>
          {[
            { label: 'Name', value: displayName, edit: false },
            { label: 'Student ID', value: displayId, edit: false },
            { label: 'Department', value: displayDept, edit: false },
            { label: 'Year / Semester', value: `${displayYear} / Sem ${displaySem}`, edit: false },
          ].map((f, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-muted">{f.label}</span>
              <span className="text-sm font-medium text-gray-700">{f.value}</span>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-6">
          <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 bg-navy text-white rounded-xl font-medium text-sm hover:bg-navy/90 transition-all"
          >
            {saved ? '✓ Saved!' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
