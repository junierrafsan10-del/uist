import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import TiltCard from '../components/TiltCard'
import useCountUp from '../hooks/useCountUp'
import { useStudents, useFaculty, useNotices, addStudent, updateStudent, deleteStudent, addFaculty, updateFaculty, deleteFaculty, addNotice, updateNotice, deleteNotice, createStudentUser } from '../hooks/useData'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'
import { DEPT_SUBJECTS, getGrade, buildFees, buildAttendance } from '../data/mockData'

const CHART_COLORS = ['#0f2040', '#1d4ed8', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

const tabs = [
  { key: 'overview', label: 'Overview', icon: '▦' }, { key: 'students', label: 'Students', icon: '◎' },
  { key: 'faculty', label: 'Faculty', icon: '◈' }, { key: 'fees', label: 'Fees', icon: '₿' },
  { key: 'attendance', label: 'Attendance', icon: '◷' }, { key: 'results', label: 'Results', icon: '★' },
  { key: 'notices', label: 'Notices', icon: '☰' }, { key: 'settings', label: 'Settings', icon: '⚙' },
]

function StatCard({ label, value, color, prefix }) {
  const count = useCountUp(typeof value === 'number' ? value : parseInt(value) || 0)
  return (
    <TiltCard className="bg-white rounded-2xl shadow-card border border-gray-50 p-5">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{prefix || ''}{value.toLocaleString ? value.toLocaleString() : count}</p>
    </TiltCard>
  )
}

export default function AdminDashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const { data: fetchedStudents, refetch: refetchStudents } = useStudents()
  const { data: fetchedFaculty, refetch: refetchFaculty } = useFaculty()
  const { data: fetchedNotices, refetch: refetchNotices } = useNotices()
  const [students, setStudents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [notices, setNotices] = useState([])
  const [toast, setToast] = useState('')

  useEffect(() => { setStudents(fetchedStudents) }, [fetchedStudents])
  useEffect(() => { setFaculty(fetchedFaculty) }, [fetchedFaculty])
  useEffect(() => { setNotices(fetchedNotices) }, [fetchedNotices])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }
  const noticeIdRef = useRef(6)

  const feesData = useMemo(() => students.map(s => ({ ...s, fees: buildFees(s.id) })), [students])
  const totalFees = feesData.reduce((s, st) => s + st.fees.reduce((a, f) => a + f.amount, 0), 0)
  const totalDues = feesData.reduce((s, st) => s + st.fees.reduce((a, f) => a + (f.amount - f.paid), 0), 0)

  const renderTab = () => {
    switch (tab) {
      case 'overview': return <OverviewTab students={students} totalFees={totalFees} totalDues={totalDues} facultyCount={faculty.length} />
      case 'students': return <StudentsTab students={students} setStudents={setStudents} showToast={showToast} refetch={refetchStudents} />
      case 'faculty': return <FacultyTab faculty={faculty} setFaculty={setFaculty} showToast={showToast} refetch={refetchFaculty} />
      case 'fees': return <FeesTab students={students} feesData={feesData} totalFees={totalFees} totalDues={totalDues} showToast={showToast} />
      case 'attendance': return <AdminAttendanceTab students={students} showToast={showToast} />
      case 'results': return <AdminResultsTab students={students} showToast={showToast} />
      case 'notices': return <NoticesTab notices={notices} setNotices={setNotices} showToast={showToast} noticeIdRef={noticeIdRef} refetch={refetchNotices} />
      case 'settings': return <SettingsTab showToast={showToast} />
      default: return null
    }
  }

const dashPage = {
  initial: { clipPath: 'circle(0% at 50% 50%)', opacity: 0 },
  animate: {
    clipPath: 'circle(100% at 50% 50%)',
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

  return (
    <motion.div className="min-h-screen bg-bg font-body flex" variants={dashPage} initial="initial" animate="animate">
      {toast && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-4 right-4 z-50 bg-success text-white px-5 py-3 rounded-xl shadow-lg text-sm">{toast}</motion.div>}
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
            <div><p className="font-display text-sm text-navy leading-tight">UIST</p><p className="text-xs text-muted">Admin Panel</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((t, i) => (
            <motion.button key={t.key}
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: open ? i * 0.04 : 0 }}
              onClick={() => { setTab(t.key); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all relative ${tab === t.key ? 'text-navy' : 'text-muted hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {tab === t.key && <motion.div layoutId="adminTab" className="absolute inset-0 bg-accent/5 rounded-xl border-l-4 border-accent" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
              <span className="relative z-10 text-lg">{t.icon}</span>
              <span className="relative z-10 truncate">{t.label}</span>
            </motion.button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={() => { signOut(); navigate('/') }} className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium text-muted hover:bg-red-50 hover:text-danger transition-all">
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
            <div className="text-right hidden sm:block"><p className="text-sm font-medium text-gray-700">{user?.name}</p><p className="text-xs text-muted">Admin</p></div>
            <div className="w-9 h-9 bg-navy/5 rounded-full flex items-center justify-center text-navy font-bold text-sm">{user?.name?.charAt(0) || 'A'}</div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  )
}

function OverviewTab({ students, totalFees, totalDues, facultyCount }) {
  const collected = totalFees - totalDues
  const monthly = [{ name: 'Jan', amt: 120000 }, { name: 'Feb', amt: 95000 }, { name: 'Mar', amt: 140000 }, { name: 'Apr', amt: 110000 }, { name: 'May', amt: 160000 }, { name: 'Jun', amt: 135000 }]
  const deptPie = Object.entries(students.reduce((acc, s) => { acc[s.dept] = (acc[s.dept] || 0) + 1; return acc }, {})).map(([n, v]) => ({ name: n, value: v }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Total Students" value={students.length} color="#0f2040" />
        <StatCard label="Total Faculty" value={facultyCount} color="#0f2040" />
        <StatCard label="Collected" value={collected} color="#10b981" prefix="৳" />
        <StatCard label="Pending Dues" value={totalDues} color="#ef4444" prefix="৳" />
        <StatCard label="Attendance" value={82} color="#3b82f6" prefix="" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6">
          <h3 className="font-display text-lg text-navy mb-4">Monthly Collections</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthly}><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip />
              <Bar dataKey="amt" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {monthly.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6">
          <h3 className="font-display text-lg text-navy mb-4">Dept Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={deptPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ n, v }) => `${n}: ${v}`}>{deptPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6">
        <h3 className="font-display text-lg text-navy mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'New student enrolled: Tanvir Ahmed (BBA)', time: '2h ago' },
            { action: 'Fee payment: S1004 — ৳45,000', time: '4h ago' },
            { action: 'Attendance submitted: CSE Data Structures', time: 'Yesterday' },
            { action: 'Results updated: Semester 5 CSE', time: 'Yesterday' },
            { action: 'Notice posted: Exam Schedule', time: '2d ago' },
          ].map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-2 h-2 rounded-full bg-accent" /><p className="text-sm text-gray-600 flex-1">{a.action}</p><span className="text-xs text-muted">{a.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StudentsTab({ students, setStudents, showToast, refetch }) {
  const [search, setSearch] = useState(''), [dept, setDept] = useState(''), [showModal, setShowModal] = useState(null), [editing, setEditing] = useState(null), [viewing, setViewing] = useState(null)
  const filtered = students.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase())) return false
    if (dept && s.dept !== dept) return false
    return true
  })
  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateStudent(editing.id, data)
        showToast('Student updated!')
      } else {
        const nid = 'S' + String(Date.now()).slice(-6)
        const { password, ...studentData } = data
        await addStudent({ id: nid, cgpa: 0, photo: null, ...studentData })
        await createStudentUser(nid, password || 'pass123')
        showToast('Student added!')
      }
      if (refetch) refetch()
    } catch (e) { showToast('Error: ' + e.message) }
    setEditing(null); setShowModal(null)
  }
  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return
    try { await deleteStudent(id); if (refetch) refetch(); showToast('Deleted!') }
    catch (e) { showToast('Error: ' + e.message) }
  }
  const FormModal = ({ data, onSave, onClose, title }) => {
    const [f, setF] = useState(data || { name: '', dept: 'CSE', year: '1st', sem: 1, email: '', phone: '', address: '' })
    return (<div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}><motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
      <h3 className="font-display text-xl text-navy mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><input placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent" /></div>
        <select value={f.dept} onChange={e => setF({ ...f, dept: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"><option>CSE</option><option>EEE</option><option>BBA</option><option>Civil</option></select>
        <select value={f.year} onChange={e => setF({ ...f, year: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"><option>1st</option><option>2nd</option><option>3rd</option><option>4th</option></select>
        <input placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent" />
        <input placeholder="Phone" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent" />
        <div className="col-span-2"><input placeholder="Address" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent" /></div>
      </div>
      <div className="flex gap-3 mt-6 justify-end"><button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm">Cancel</button><button onClick={() => onSave(f)} className="px-4 py-2 bg-navy text-white rounded-xl text-sm">Save</button></div>
    </motion.div></div>)
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 w-full max-w-xs transition-all" />
          <select value={dept} onChange={e => setDept(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none"><option value="">All</option><option>CSE</option><option>EEE</option><option>BBA</option><option>Civil</option></select>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-all">+ Add Student</button>
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-muted"><th className="px-4 py-3 font-medium">Photo</th><th className="px-4 py-3 font-medium">ID</th><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Dept</th><th className="px-4 py-3 font-medium">Year</th><th className="px-4 py-3 text-center font-medium">CGPA</th><th className="px-4 py-3 text-right font-medium">Due</th><th className="px-4 py-3 text-center font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s, i) => {
                const due = buildFees(s.id).reduce((a, f) => a + (f.amount - f.paid), 0)
                return (
                  <motion.tr key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50/50 group">
                    <td className="px-4 py-3"><div className="w-8 h-8 bg-navy/5 rounded-full flex items-center justify-center text-navy font-bold text-xs hover:rotate-12 transition-transform">{s.name.charAt(0)}</div></td>
                    <td className="px-4 py-3 text-muted font-mono text-xs">{s.id}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.dept}</td>
                    <td className="px-4 py-3 text-gray-600">{s.year}</td>
                    <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600">{s.cgpa}</span></td>
                    <td className={`px-4 py-3 text-right font-medium text-sm ${due > 0 ? 'text-danger' : 'text-success'}`}>৳{due.toLocaleString()}</td>
                    <td className="px-4 py-3"><div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewing(s)} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">View</button>
                      <button onClick={() => setEditing(s)} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs">Del</button>
                    </div></td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <FormModal onClose={() => setShowModal(false)} onSave={handleSave} title="Add Student" />}
      {editing && <FormModal data={editing} onClose={() => setEditing(null)} onSave={(d) => handleSave({ ...d, cgpa: editing.cgpa })} title="Edit Student" />}
      {viewing && <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}><motion.div initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-xl text-navy mb-4">Profile</h3>
        <div className="space-y-2 text-sm">{['name','id','dept','year','email','phone','address'].map(k => <div key={k} className="flex justify-between"><span className="text-muted capitalize">{k}</span><span className="text-gray-700">{viewing[k]}</span></div>)}</div>
        <button onClick={() => setViewing(null)} className="mt-6 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm">Close</button>
      </motion.div></div>}
    </div>
  )
}

function FacultyTab({ faculty, setFaculty, showToast, refetch }) {
  const [editing, setEditing] = useState(null)
  const handleSave = async (data) => {
    try {
      if (editing?.id) {
        await updateFaculty(editing.id, data)
        showToast('Updated!')
      } else {
        const nid = 'F' + String(Date.now()).slice(-6)
        await addFaculty({ id: nid, ...data })
        showToast('Added!')
      }
      if (refetch) refetch()
    } catch (e) { showToast('Error: ' + e.message) }
    setEditing(null)
  }
  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return
    try { await deleteFaculty(id); if (refetch) refetch(); showToast('Deleted!') }
    catch (e) { showToast('Error: ' + e.message) }
  }
  const Modal = ({ data, onSave, onClose }) => {
    const [f, setF] = useState(data || { name: '', dept: 'CSE', designation: '', email: '', subjects: 'Math' })
    return (<div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}><motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
      <h3 className="font-display text-xl text-navy mb-4">{data?.id ? 'Edit' : 'Add'} Faculty</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><input placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none" /></div>
        <select value={f.dept} onChange={e => setF({ ...f, dept: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"><option>CSE</option><option>EEE</option><option>BBA</option><option>Civil</option></select>
        <input placeholder="Designation" value={f.designation} onChange={e => setF({ ...f, designation: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none" />
        <input placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none" />
        <input placeholder="Subjects" value={f.subjects} onChange={e => setF({ ...f, subjects: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none" />
      </div>
      <div className="flex gap-3 mt-6 justify-end"><button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm">Cancel</button><button onClick={() => onSave(f)} className="px-4 py-2 bg-navy text-white rounded-xl text-sm">Save</button></div>
    </motion.div></div>)
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h3 className="font-display text-lg text-navy">Faculty</h3><button onClick={() => setEditing({})} className="px-4 py-2.5 bg-navy text-white rounded-xl text-sm font-medium">+ Add</button></div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-muted"><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Dept</th><th className="px-4 py-3 font-medium">Designation</th><th className="px-4 py-3 font-medium">Subjects</th><th className="px-4 py-3 font-medium">Contact</th><th className="px-4 py-3 text-center font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-50">{faculty.map(f => (<tr key={f.id} className="hover:bg-gray-50/50"><td className="px-4 py-3 text-gray-700 font-medium">{f.name}</td><td className="px-4 py-3 text-gray-600">{f.dept}</td><td className="px-4 py-3 text-gray-600">{f.designation}</td><td className="px-4 py-3 text-gray-600">{f.subjects}</td><td className="px-4 py-3 text-gray-600">{f.email}</td><td className="px-4 py-3 text-center"><div className="flex gap-2 justify-center"><button onClick={() => setEditing(f)} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs">Edit</button><button onClick={() => handleDelete(f.id)} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs">Del</button></div></td></tr>))}</tbody>
          </table>
        </div>
      </div>
      {editing !== null && <Modal data={editing.id ? editing : null} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  )
}

function FeesTab({ students, totalFees, totalDues, showToast }) {
  const [filter, setFilter] = useState('')
  const collected = totalFees - totalDues
  const rate = totalFees ? Math.round(collected / totalFees * 100) : 0
  const filtered = students.filter(s => {
    const due = buildFees(s.id).reduce((a, f) => a + (f.amount - f.paid), 0)
    if (filter === 'paid') return due === 0
    if (filter === 'unpaid') return due >= buildFees(s.id).reduce((a, f) => a + f.amount, 0)
    if (filter === 'partial') return due > 0 && due < buildFees(s.id).reduce((a, f) => a + f.amount, 0)
    return true
  })
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TiltCard className="bg-white rounded-2xl shadow-card border border-gray-50 p-6"><p className="text-xs text-muted mb-1">Collected</p><p className="text-2xl font-bold text-success">৳{collected.toLocaleString()}</p></TiltCard>
        <TiltCard className="bg-white rounded-2xl shadow-card border border-gray-50 p-6"><p className="text-xs text-muted mb-1">Pending</p><p className="text-2xl font-bold text-danger">৳{totalDues.toLocaleString()}</p></TiltCard>
        <TiltCard className="bg-white rounded-2xl shadow-card border border-gray-50 p-6"><p className="text-xs text-muted mb-1">Collection Rate</p><p className="text-2xl font-bold text-accent">{rate}%</p></TiltCard>
      </div>
      <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none"><option value="">All</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="unpaid">Unpaid</option></select>
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-muted"><th className="px-4 py-3 font-medium">Student</th><th className="px-4 py-3 font-medium">ID</th><th className="px-4 py-3 font-medium">Dept</th><th className="px-4 py-3 font-medium">Progress</th><th className="px-4 py-3 text-right font-medium">Due</th><th className="px-4 py-3 text-center font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-50">{filtered.map(s => {
              const fees = buildFees(s.id); const due = fees.reduce((a, f) => a + (f.amount - f.paid), 0); const total = fees.reduce((a, f) => a + f.amount, 0); const pct = total ? Math.round((total - due) / total * 100) : 0
              return (<tr key={s.id} className="hover:bg-gray-50/50"><td className="px-4 py-3 text-gray-700 font-medium">{s.name}</td><td className="px-4 py-3 text-muted font-mono text-xs">{s.id}</td><td className="px-4 py-3 text-gray-600">{s.dept}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex-1 bg-gray-100 rounded-full h-2"><motion.div className="h-full rounded-full bg-success" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} /></div><span className="text-xs text-muted w-8 text-right">{pct}%</span></div></td><td className="px-4 py-3 text-right font-medium text-danger">৳{due.toLocaleString()}</td><td className="px-4 py-3 text-center"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${due === 0 ? 'text-success bg-green-50' : due >= total ? 'text-danger bg-red-50' : 'text-warning bg-yellow-50'}`}>{due === 0 ? 'Paid' : due >= total ? 'Unpaid' : 'Partial'}</span></td></tr>)
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AdminAttendanceTab({ students, showToast }) {
  const depts = [...new Set(students.map(s => s.dept))]
  const [dept, setDept] = useState(depts[0] || ''), [subject, setSubject] = useState('Mathematics'), [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState({})
  const filtered = students.filter(s => s.dept === dept)
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <select value={dept} onChange={e => { setDept(e.target.value); setStatus({}) }} className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none">{depts.map(d => <option key={d}>{d}</option>)}</select>
        <select value={subject} onChange={e => setSubject(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none"><option>Mathematics</option><option>Physics</option><option>Programming</option><option>English</option><option>Digital Logic</option></select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none" />
        <button onClick={() => showToast('Attendance saved!')} className="px-4 py-2.5 bg-navy text-white rounded-xl text-sm font-medium">Submit</button>
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50"><h3 className="font-display text-lg text-navy">{dept}</h3></div>
        <div className="divide-y divide-gray-50">{filtered.map(s => {
          const isPresent = status[s.id] === 'present'
          return (<motion.div key={s.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50">
            <div className="flex items-center gap-3"><div className="w-8 h-8 bg-navy/5 rounded-full flex items-center justify-center text-navy font-bold text-xs">{s.name.charAt(0)}</div><div><p className="text-sm font-medium text-gray-700">{s.name}</p><p className="text-xs text-muted">{s.id}</p></div></div>
            <motion.button onClick={() => setStatus({ ...status, [s.id]: isPresent ? 'absent' : 'present' })} whileTap={{ scale: 0.9 }}
              className={`relative w-16 h-8 rounded-full transition-colors ${isPresent ? 'bg-success' : 'bg-gray-200'}`}
            ><motion.div className="absolute top-1 w-6 h-6 bg-white rounded-full shadow" animate={{ left: isPresent ? 36 : 4 }} transition={{ type: 'spring', stiffness: 300 }} /></motion.button>
          </motion.div>)
        })}</div>
      </div>
    </div>
  )
}

function AdminResultsTab({ students, showToast }) {
  const [sid, setSid] = useState(students[0]?.id || ''), [sem, setSem] = useState(1), [marks, setMarks] = useState({})
  const student = students.find(s => s.id === sid)
  const deptData = student ? DEPT_SUBJECTS[student.dept]?.find(s => s.sem === sem) : null
  const subjects = deptData?.subjects || []
  const calcGpa = () => { let tc = 0, tp = 0; subjects.forEach((sub, i) => { const m = marks[`${sem}-${i}`]; if (m !== undefined && !isNaN(m)) { const g = getGrade(m); tc += sub.credits; tp += sub.credits * g.points } }); return tc ? (tp / tc).toFixed(2) : 'N/A' }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <select value={sid} onChange={e => { setSid(e.target.value); setMarks({}) }} className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none">{students.map(s => <option key={s.id} value={s.id}>{s.id} — {s.name}</option>)}</select>
        <select value={sem} onChange={e => { setSem(Number(e.target.value)); setMarks({}) }} className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none">{[1,2,3,4,5,6,7].map(s => <option key={s} value={s}>Sem {s}</option>)}</select>
        <button onClick={() => showToast('Results saved!')} className="px-4 py-2.5 bg-navy text-white rounded-xl text-sm font-medium">Save</button>
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50"><h3 className="font-display text-lg text-navy">{student?.name} — Sem {sem}</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-muted"><th className="px-4 py-3 font-medium">Subject</th><th className="px-4 py-3 text-center font-medium">Credits</th><th className="px-4 py-3 text-center font-medium">Marks</th><th className="px-4 py-3 text-center font-medium">Grade</th></tr></thead>
            <tbody className="divide-y divide-gray-50">{subjects.map((sub, i) => {
              const m = marks[`${sem}-${i}`]; const g = m !== undefined && !isNaN(m) ? getGrade(m).grade : '-'
              return (<tr key={i}><td className="px-4 py-3 text-gray-700">{sub.name}</td><td className="px-4 py-3 text-center text-gray-600">{sub.credits}</td><td className="px-4 py-3 text-center"><input type="number" min="0" max="100" value={marks[`${sem}-${i}`] ?? ''} onChange={e => setMarks({ ...marks, [`${sem}-${i}`]: Number(e.target.value) })} className="w-20 px-2 py-1.5 rounded-xl border border-gray-200 text-center text-sm outline-none focus:border-accent" /></td><td className="px-4 py-3 text-center">
                <motion.span key={g} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${g === 'A+' ? 'text-green-600 bg-green-50 border-green-200' : g === 'A' ? 'text-blue-600 bg-blue-50 border-blue-200' : g === 'B' ? 'text-indigo-600 bg-indigo-50 border-indigo-200' : g === 'C' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : g === 'F' ? 'text-red-600 bg-red-50 border-red-200' : 'text-gray-400 bg-gray-50 border-gray-100'}`}>{g}</motion.span>
              </td></tr>)
            })}</tbody>
          </table>
        </div>
      </div>
      <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-6 border border-accent/10"><p className="text-xs text-muted mb-1">GPA</p><p className="text-3xl font-bold text-accent">{calcGpa()}</p></div>
    </div>
  )
}

function NoticesTab({ notices, setNotices, showToast, noticeIdRef, refetch }) {
  const [editing, setEditing] = useState(null)
  const handleSave = async (data) => {
    try {
      const payload = { ...data, date: new Date().toISOString().split('T')[0] }
      if (editing?.id) {
        await updateNotice(editing.id, payload)
        showToast('Updated!')
      } else {
        await addNotice({ id: noticeIdRef.current++, ...payload })
        showToast('Posted!')
      }
      if (refetch) refetch()
    } catch (e) { showToast('Error: ' + e.message) }
    setEditing(null)
  }
  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return
    try { await deleteNotice(id); if (refetch) refetch(); showToast('Deleted!') }
    catch (e) { showToast('Error: ' + e.message) }
  }
  const Modal = ({ data, onSave, onClose }) => {
    const [f, setF] = useState(data || { title: '', body: '' })
    return (<div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}><motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
      <h3 className="font-display text-xl text-navy mb-4">{data?.id ? 'Edit' : 'Post'} Notice</h3>
      <div className="space-y-4"><input placeholder="Title" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none" /><textarea rows={4} placeholder="Body" value={f.body} onChange={e => setF({ ...f, body: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none resize-none" /></div>
      <div className="flex gap-3 mt-6 justify-end"><button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm">Cancel</button><button onClick={() => onSave(f)} className="px-4 py-2 bg-navy text-white rounded-xl text-sm">Save</button></div>
    </motion.div></div>)
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h3 className="font-display text-lg text-navy">Notices</h3><button onClick={() => setEditing({})} className="px-4 py-2.5 bg-navy text-white rounded-xl text-sm font-medium">+ Post</button></div>
      {notices.map((n, i) => (
        <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl shadow-card border border-gray-50 p-6">
          <div className="flex items-start justify-between gap-4"><div className="flex-1"><h4 className="font-display text-lg text-navy">{n.title}</h4><p className="text-xs text-muted mt-1">{n.date}</p><p className="text-sm text-gray-600 mt-3">{n.body}</p></div><div className="flex gap-2 flex-shrink-0"><button onClick={() => setEditing(n)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100">Edit</button><button onClick={() => handleDelete(n.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">Del</button></div></div>
        </motion.div>
      ))}
      {editing !== null && <Modal data={editing.id ? editing : null} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  )
}

function SettingsTab({ showToast }) {
  const [form, setForm] = useState({ name: 'UCEP Institute of Science and Technology - UIST', tagline: 'Excellence · Innovation · Integrity', email: 'info@uist.edu', phone: '+880 1711-111111' })
  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-8">
        <h3 className="font-display text-lg text-navy mb-6">Institute Settings</h3>
        <div className="space-y-5">
          <div><label className="text-xs text-muted block mb-1">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent" /></div>
          <div><label className="text-xs text-muted block mb-1">Tagline</label><input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-muted block mb-1">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent" /></div><div><label className="text-xs text-muted block mb-1">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-accent" /></div></div>
        </div>
        <button onClick={() => showToast('Settings saved!')} className="mt-6 px-6 py-2.5 bg-navy text-white rounded-xl font-medium text-sm hover:bg-navy/90">Save</button>
      </div>
    </div>
  )
}
