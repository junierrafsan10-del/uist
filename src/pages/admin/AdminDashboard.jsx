import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import DashboardLayout from '../../layouts/DashboardLayout'
import Modal from '../../components/shared/Modal'
import Toast, { useToast } from '../../components/shared/Toast'
import { supabase, isSupabaseConnected } from '../../lib/supabase'
import useCountUp from '../../hooks/useCountUp'

const CHART_COLORS = ['#2196F3', '#43A047', '#F57C00', '#00ACC1', '#9C27B0', '#E91E63']

function AnimatedNumber({ value, prefix = '' }) {
  const count = useCountUp(typeof value === 'number' ? value : parseInt(value) || 0)
  return <span>{prefix}{count.toLocaleString()}</span>
}

function StatCard({ icon, label, value, color, trend }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-1">
        <AnimatedNumber value={value} />
      </p>
      <p className="text-sm text-gray-500">{label}</p>
    </motion.div>
  )
}

function TeachersTab({ addToast }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setTeachers([
      { id: 1, name: 'Prof. Dr. Md. Kamal Hossain', dept: 'CSE', designation: 'Professor', phone: '01711111111', email: 'kamal@ucep.edu.bd' },
      { id: 2, name: 'Ms. Fatima Rahman', dept: 'EEE', designation: 'Assistant Professor', phone: '01722222222', email: 'fatima@ucep.edu.bd' },
      { id: 3, name: 'Mr. Tanvir Ahmed', dept: 'Civil', designation: 'Lecturer', phone: '01733333333', email: 'tanvir@ucep.edu.bd' },
      { id: 4, name: 'Dr. Sharmin Akter', dept: 'Textile', designation: 'Associate Professor', phone: '01744444444', email: 'sharmin@ucep.edu.bd' },
    ])
    setLoading(false)
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F57C00]"></div></div>

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-gray-800 text-lg">Faculty Members ({teachers.length})</h3>
          <button
            onClick={() => addToast('Add teacher feature coming soon!', 'info')}
            className="px-4 py-2 bg-[#0f2040] text-white rounded-xl text-sm font-medium hover:opacity-90"
          >
            + Add Teacher
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map(t => (
            <div key={t.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#0f2040] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.designation} - {t.dept}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📧 {t.email}</span>
                <span>📞 {t.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NoticesTab({ addToast, supabase, isConnected }) {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', date: new Date().toISOString().split('T')[0] })

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    if (!isConnected) {
      setNotices([
        { id:1, title:'Semester Final Exam Schedule', body:'Exams begin June 10, 2025.', date:'2025-05-10' },
        { id:2, title:'Tech Fest 2025', body:'Annual tech fest with prizes worth Tk. 2,00,000.', date:'2025-05-08' },
        { id:3, title:'Library Extended Hours', body:'Library open until 11 PM during exam season.', date:'2025-05-05' },
        { id:4, title:'Internship Opportunity', body:'Google Summer of Code 2025.', date:'2025-05-03' },
        { id:5, title:'Campus Placement Drive', body:'Top recruiters visiting in June.', date:'2025-05-01' },
      ])
    } else {
      const { data } = await supabase
        .from('notices')
        .select('*')
        .order('date', { ascending: false })
      setNotices(data || [])
    }
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!form.title) { addToast('Title required', 'warning'); return }
    if (isConnected) {
      const { error } = await supabase.from('notices').insert({
        title: form.title,
        body: form.body,
        date: form.date,
      })
      if (error) { addToast('Failed: ' + error.message, 'error'); return }
    }
    addToast('Notice added!', 'success')
    setShowModal(false)
    setForm({ title:'', body:'', date: new Date().toISOString().split('T')[0] })
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return
    if (isConnected) {
      await supabase.from('notices').delete().eq('id', id)
    }
    addToast('Notice deleted', 'success')
    load()
  }

  const categoryColor = {
    exam: 'bg-orange-100 text-orange-700',
    admission: 'bg-blue-100 text-blue-700',
    urgent: 'bg-red-100 text-red-700',
    general: 'bg-green-100 text-green-700',
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F57C00]"></div></div>

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-gray-800 text-lg">
            All Notices ({notices.length})
          </h3>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#0f2040] text-white rounded-xl text-sm font-medium hover:opacity-90"
          >
            + Add Notice
          </button>
        </div>
        <div className="space-y-3">
          {notices.map(n => (
            <div key={n.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColor[n.category] || 'bg-gray-100 text-gray-600'}`}>
                    {n.category || 'General'}
                  </span>
                  <span className="text-xs text-gray-400">{n.date}</span>
                </div>
                <h4 className="font-medium text-gray-800 truncate">{n.title}</h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.body}</p>
              </div>
              <button
                onClick={() => handleDelete(n.id)}
                className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
          {notices.length === 0 && (
            <div className="text-center py-8 text-gray-400">No notices found</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-gray-800 text-lg">Add Notice</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
                  placeholder="Notice title"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Content</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm({...form, body: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00] resize-none"
                  placeholder="Notice content..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2.5 bg-[#0f2040] text-white rounded-xl text-sm font-medium hover:opacity-90">Add Notice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PlacementsTab({ addToast }) {
  const [placements, setPlacements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setPlacements([
      { id: 1, company: 'Google', student: 'Arif Hossain', role: 'SDE Intern', package: '12 LPA', date: '2025-06-15' },
      { id: 2, company: 'Microsoft', student: 'Fatima Begum', role: 'Software Engineer', package: '15 LPA', date: '2025-06-10' },
      { id: 3, company: 'Amazon', student: 'Tanvir Ahmed', role: 'Cloud Engineer', package: '14 LPA', date: '2025-06-08' },
      { id: 4, company: 'Samsung', student: 'Nusrat Jahan', role: 'R&D Engineer', package: '10 LPA', date: '2025-06-05' },
      { id: 5, company: 'GP', student: 'Rakib Hasan', role: 'Network Engineer', package: '8 LPA', date: '2025-06-01' },
    ])
    setLoading(false)
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F57C00]"></div></div>

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-gray-800 text-lg">Job Placements ({placements.length})</h3>
          <button
            onClick={() => addToast('Add placement feature coming soon!', 'info')}
            className="px-4 py-2 bg-[#0f2040] text-white rounded-xl text-sm font-medium hover:opacity-90"
          >
            + Add Placement
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {placements.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-700 font-medium">{p.student}</td>
                  <td className="px-4 py-3 text-gray-600">{p.company}</td>
                  <td className="px-4 py-3 text-gray-600">{p.role}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{p.package}</td>
                  <td className="px-4 py-3 text-gray-500">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, placements: 0 })
  const [recentStudents, setRecentStudents] = useState([])
  const [recentNotices, setRecentNotices] = useState([])
  const [monthlyAdmissions, setMonthlyAdmissions] = useState([])
  const [deptDistribution, setDeptDistribution] = useState([])
  const [loading, setLoading] = useState(true)
  const { toasts, addToast, removeToast } = useToast()

  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false)
  const [studentForm, setStudentForm] = useState({
    name: '', email: '', phone: '', student_id: '', dept: 'CSE', year: '1st', sem: 1, address: ''
  })
  const [noticeForm, setNoticeForm] = useState({ title: '', body: '' })

useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (!isSupabaseConnected) {
        setStats({ students: 10, teachers: 4, courses: 6, placements: 45 })
        setRecentStudents([
          { id: 'S1001', name: 'Arif Hossain', dept: 'CSE', year: '3rd', created_at: '2025-05-10' },
          { id: 'S1002', name: 'Fatima Begum', dept: 'EEE', year: '2nd', created_at: '2025-05-09' },
          { id: 'S1003', name: 'Tanvir Ahmed', dept: 'BBA', year: '4th', created_at: '2025-05-08' },
        ])
        setRecentNotices([
          { id: 1, title: 'Exam Schedule', date: '2025-05-12', status: 'active' },
          { id: 2, title: 'Tech Fest 2025', date: '2025-05-10', status: 'active' },
        ])
        setMonthlyAdmissions([
          { name: 'Jan', admissions: 12 }, { name: 'Feb', admissions: 8 },
          { name: 'Mar', admissions: 15 }, { name: 'Apr', admissions: 10 },
          { name: 'May', admissions: 18 }, { name: 'Jun', admissions: 14 },
        ])
        setDeptDistribution([
          { name: 'CSE', value: 3 }, { name: 'EEE', value: 2 },
          { name: 'BBA', value: 2 }, { name: 'Civil', value: 2 },
        ])
        setLoading(false)
        return
      }

      const [studentsRes, teachersRes, noticesRes] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('faculty').select('*', { count: 'exact', head: true }),
        supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(3),
      ])

      const studentsCount = studentsRes.count || 0
      const teachersCount = teachersRes.count || 0

      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      const deptCount = {}
      studentsData?.forEach(s => {
        deptCount[s.dept] = (deptCount[s.dept] || 0) + 1
      })
      const deptDist = Object.entries(deptCount).map(([name, value]) => ({ name, value }))

      setStats({
        students: studentsCount,
        teachers: teachersCount,
        courses: 6,
        placements: 45,
      })
      setRecentStudents(studentsData || [])
      setRecentNotices(noticesRes.data || [])
      setDeptDistribution(deptDist)

      const mockMonthly = [
        { name: 'Jan', admissions: 12 }, { name: 'Feb', admissions: 8 },
        { name: 'Mar', admissions: 15 }, { name: 'Apr', admissions: 10 },
        { name: 'May', admissions: 18 }, { name: 'Jun', admissions: 14 },
      ]
      setMonthlyAdmissions(mockMonthly)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      addToast('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async () => {
    try {
      if (!studentForm.name || !studentForm.student_id) {
        addToast('Name and Student ID are required', 'warning')
        return
      }

      if (!isSupabaseConnected) {
        addToast('Student added (mock mode)', 'success')
        setShowAddStudentModal(false)
        setStudentForm({ name: '', email: '', phone: '', student_id: '', dept: 'CSE', year: '1st', sem: 1, address: '' })
        return
      }

      const { error } = await supabase.from('students').insert({
        id: studentForm.student_id,
        name: studentForm.name,
        email: studentForm.email,
        phone: studentForm.phone,
        dept: studentForm.dept,
        year: studentForm.year,
        sem: studentForm.sem,
        address: studentForm.address,
        cgpa: 0,
      })

      if (error) throw error
      addToast('Student added successfully!', 'success')
      setShowAddStudentModal(false)
      setStudentForm({ name: '', email: '', phone: '', student_id: '', dept: 'CSE', year: '1st', sem: 1, address: '' })
      fetchDashboardData()
    } catch (error) {
      addToast('Failed to add student: ' + error.message, 'error')
    }
  }

  const handleAddNotice = async () => {
    try {
      if (!noticeForm.title) {
        addToast('Notice title is required', 'warning')
        return
      }

      if (!isSupabaseConnected) {
        addToast('Notice posted (mock mode)', 'success')
        setShowAddNoticeModal(false)
        setNoticeForm({ title: '', body: '' })
        return
      }

      const { error } = await supabase.from('notices').insert({
        title: noticeForm.title,
        body: noticeForm.body,
        date: new Date().toISOString().split('T')[0],
      })

      if (error) throw error
      addToast('Notice posted successfully!', 'success')
      setShowAddNoticeModal(false)
      setNoticeForm({ title: '', body: '' })
      fetchDashboardData()
    } catch (error) {
      addToast('Failed to post notice: ' + error.message, 'error')
    }
  }

  const handleExportReport = () => {
    addToast('Exporting report...', 'info')
    setTimeout(() => {
      addToast('Report exported successfully!', 'success')
    }, 1500)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f2040]"></div>
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon="🎓" label="Total Students" value={stats.students} color="blue" trend={12} />
              <StatCard icon="👨‍🏫" label="Total Teachers" value={stats.teachers} color="green" trend={5} />
              <StatCard icon="📚" label="Active Courses" value={stats.courses} color="orange" trend={0} />
              <StatCard icon="💼" label="Placed Students" value={stats.placements} color="teal" trend={8} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 text-lg mb-4">Monthly Admissions</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyAdmissions}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="admissions" fill="#F57C00" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 text-lg mb-4">Students by Course</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={deptDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {deptDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 text-lg">Recent Students</h3>
                  <button className="text-sm text-[#F57C00] hover:underline font-medium">View All →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-gray-500">
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Course</th>
                        <th className="px-4 py-3 font-medium">Batch</th>
                        <th className="px-4 py-3 font-medium">Date Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentStudents.map((student, i) => (
                        <motion.tr
                          key={student.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-gray-50/50"
                        >
                          <td className="px-4 py-3 text-gray-700 font-medium">{student.name}</td>
                          <td className="px-4 py-3 text-gray-600">{student.dept}</td>
                          <td className="px-4 py-3 text-gray-600">{student.year}</td>
                          <td className="px-4 py-3 text-gray-500">{student.created_at || 'N/A'}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-[#0f2040] text-white rounded-xl text-sm font-medium hover:bg-[#0f2040]/90 transition-all"
                  >
                    <span className="text-lg">+</span> Add Student
                  </button>
                  <button
                    onClick={() => setShowAddNoticeModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-[#F57C00] text-white rounded-xl text-sm font-medium hover:bg-[#F57C00]/90 transition-all"
                  >
                    <span>📋</span> Add Notice
                  </button>
                  <button
                    onClick={handleExportReport}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-all"
                  >
                    <span>📊</span> Export Report
                  </button>
                  <button
                    onClick={() => { setActiveTab('attendance') }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-all"
                  >
                    <span>✅</span> Mark Attendance
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 text-lg mb-4">Recent Notices</h3>
                <div className="space-y-3">
                  {recentNotices.length > 0 ? recentNotices.map((notice, i) => (
                    <motion.div
                      key={notice.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700">{notice.title}</p>
                        <p className="text-xs text-gray-500">{notice.date}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-lg">Active</span>
                    </motion.div>
                  )) : (
                    <p className="text-sm text-gray-500">No notices yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 text-lg mb-4">Recent Placements</h3>
                <div className="space-y-3">
                  {[
                    { company: 'Google', student: 'Arif Hossain', date: '2h ago' },
                    { company: 'Microsoft', student: 'Fatima Begum', date: '1d ago' },
                    { company: 'Amazon', student: 'Tanvir Ahmed', date: '2d ago' },
                  ].map((placement, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700">{placement.student}</p>
                        <p className="text-xs text-gray-500">{placement.company}</p>
                      </div>
                      <span className="text-xs text-gray-400">{placement.date}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'students':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-lg">All Students ({stats.students})</h3>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-4 py-2 bg-[#0f2040] text-white rounded-xl text-sm font-medium"
              >
                + Add Student
              </button>
            </div>
            <p className="text-gray-500 text-sm">Student management coming soon...</p>
          </div>
        )

      case 'teachers':
        return <TeachersTab addToast={addToast} />

      case 'courses':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-gray-800 text-lg">
                Courses ({stats.courses || 6})
              </h3>
              <button
                onClick={() => addToast('Course management coming soon!', 'info')}
                className="px-4 py-2 bg-[#0f2040] text-white rounded-xl text-sm font-medium"
              >
                + Add Course
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name:'Civil Technology', code:'CIVIL-01', students:45, icon:'🏗️' },
                { name:'Mechanical Engineering', code:'MECH-01', students:38, icon:'⚙️' },
                { name:'Electrical Engineering', code:'EEE-01', students:42, icon:'⚡' },
                { name:'Computer Science & Tech', code:'CST-01', students:50, icon:'💻' },
                { name:'Textile Engineering', code:'TEXT-01', students:35, icon:'🧵' },
                { name:'Automobile Engineering', code:'AUTO-01', students:30, icon:'🚗' },
              ].map((course, i) => (
                <div key={i} className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-all">
                  <div className="text-3xl mb-3">{course.icon}</div>
                  <h4 className="font-semibold text-gray-800 mb-1">{course.name}</h4>
                  <p className="text-xs text-gray-400 mb-3">{course.code}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{course.students} students</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'notices':
        return <NoticesTab addToast={addToast} supabase={supabase} isConnected={isSupabaseConnected} />

      case 'attendance':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Attendance Management</h3>
            <p className="text-gray-500 text-sm">Attendance features coming soon...</p>
          </div>
        )

      case 'placements':
        return <PlacementsTab addToast={addToast} />

      case 'documents':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-gray-800 text-lg">Documents</h3>
                <button
                  onClick={() => addToast('Upload feature coming soon!', 'info')}
                  className="px-4 py-2 bg-[#0f2040] text-white rounded-xl text-sm font-medium"
                >
                  + Upload
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Academic Calendar 2025', type: 'PDF', size: '2.4 MB', date: '2025-01-15', icon: '📅' },
                  { name: 'Student Handbook', type: 'PDF', size: '5.1 MB', date: '2025-01-10', icon: '📖' },
                  { name: 'Exam Rules & Regulations', type: 'PDF', size: '1.8 MB', date: '2025-01-05', icon: '📋' },
                  { name: 'Faculty Directory', type: 'PDF', size: '0.9 MB', date: '2025-01-01', icon: '📇' },
                  { name: 'Library Catalog', type: 'PDF', size: '3.2 MB', date: '2024-12-20', icon: '📚' },
                  { name: 'Placement Brochure', type: 'PDF', size: '4.5 MB', date: '2024-12-15', icon: '💼' },
                ].map((doc, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all cursor-pointer">
                    <div className="text-3xl mb-3">{doc.icon}</div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">{doc.name}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{doc.type} · {doc.size}</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 text-lg mb-5">Institute Settings</h3>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Institute Name</label>
                  <input
                    defaultValue="UCEP Institute of Science and Technology"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Address</label>
                  <input
                    defaultValue="Plot# 2 & 3, Mirpur-2, Dhaka-1216"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Phone</label>
                  <input
                    defaultValue="+88-02-9036034"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Email</label>
                  <input
                    defaultValue="principal.uist.dhaka@ucepbd.org"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
                  />
                </div>
                <button
                  onClick={() => addToast('Settings saved!', 'success')}
                  className="px-6 py-2.5 bg-[#0f2040] text-white rounded-xl text-sm font-medium hover:opacity-90"
                >
                  Save Settings
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 text-lg mb-5">Account Settings</h3>
              <div className="space-y-3 max-w-lg">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Current Password</label>
                  <input type="password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]" />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">New Password</label>
                  <input type="password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]" />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Confirm Password</label>
                  <input type="password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]" />
                </div>
                <button
                  onClick={() => addToast('Password updated!', 'success')}
                  className="px-6 py-2.5 bg-[#F57C00] text-white rounded-xl text-sm font-medium hover:opacity-90"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </DashboardLayout>

      <Modal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title="Add New Student"
        footer={
          <>
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddStudent}
              className="px-4 py-2 bg-[#0f2040] text-white rounded-xl text-sm font-medium hover:bg-[#0f2040]/90"
            >
              Add Student
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Full Name *</label>
            <input
              type="text"
              value={studentForm.name}
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
              placeholder="Enter full name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Student ID *</label>
              <input
                type="text"
                value={studentForm.student_id}
                onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
                placeholder="S1001"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Department</label>
              <select
                value={studentForm.dept}
                onChange={(e) => setStudentForm({ ...studentForm, dept: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
              >
                <option>CSE</option>
                <option>EEE</option>
                <option>BBA</option>
                <option>Civil</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Year</label>
              <select
                value={studentForm.year}
                onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
              >
                <option>1st</option>
                <option>2nd</option>
                <option>3rd</option>
                <option>4th</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Semester</label>
              <select
                value={studentForm.sem}
                onChange={(e) => setStudentForm({ ...studentForm, sem: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              value={studentForm.email}
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
              placeholder="student@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Phone</label>
            <input
              type="text"
              value={studentForm.phone}
              onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
              placeholder="01712345678"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Address</label>
            <input
              type="text"
              value={studentForm.address}
              onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
              placeholder="Address"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddNoticeModal}
        onClose={() => setShowAddNoticeModal(false)}
        title="Post New Notice"
        footer={
          <>
            <button
              onClick={() => setShowAddNoticeModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNotice}
              className="px-4 py-2 bg-[#F57C00] text-white rounded-xl text-sm font-medium hover:bg-[#F57C00]/90"
            >
              Post Notice
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Title *</label>
            <input
              type="text"
              value={noticeForm.title}
              onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00]"
              placeholder="Notice title"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Content</label>
            <textarea
              rows={4}
              value={noticeForm.body}
              onChange={(e) => setNoticeForm({ ...noticeForm, body: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F57C00] resize-none"
              placeholder="Notice content..."
            />
          </div>
        </div>
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  )
}