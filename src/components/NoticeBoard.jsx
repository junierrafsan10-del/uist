import { useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConnected } from '../lib/supabase'

function useOnScreen(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, visible]
}

function NoticeCard({ notice, index, visible }) {
  const [ref, show] = useOnScreen()
  const isVisible = visible && show

  const catColors = { urgent: '#E53935', admission: '#00ACC1', exam: '#F57C00', general: '#43A047' }
  const catLabels = { urgent: 'URGENT', admission: 'ADMISSION', exam: 'EXAM', general: 'GENERAL' }
  const color = notice.color || catColors[notice.category] || '#F57C00'
  const label = notice.label || catLabels[notice.category] || 'NOTICE'
  const content = notice.content || notice.body || ''

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl p-5 relative overflow-hidden transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${index * 150}ms`,
        borderLeft: `4px solid ${color}`,
      }}
    >
      {/* Category badge */}
      <span
        className="absolute top-3 right-3 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
        style={{ background: color }}
      >
        {label}
      </span>
      <h4 className="font-bold text-gray-900 text-sm pr-24 mb-1">{notice.title}</h4>
      <p className="text-gray-400 text-xs mb-2">{notice.date}</p>
      <p className="text-gray-500 text-sm leading-relaxed">
        {content.length > 80 ? content.slice(0, 80) + '...' : content}
      </p>
    </div>
  )
}

export default function NoticeBoard() {
  const [ref, visible] = useOnScreen()
  const [notices, setNotices] = useState([
    { id:1, title:'Semester Final Exam Schedule 2025', category:'exam', date:'2025-05-10', body:'End semester examinations will begin from June 10, 2025.' },
    { id:2, title:'Admission Open for 2025 Batch', category:'admission', date:'2025-05-05', body:'Applications are now open for January 2026 intake.' },
    { id:3, title:'Result Published - Semester 5', category:'general', date:'2025-04-28', body:'Results for 6th Semester Civil Technology have been published.' },
    { id:4, title:'Industrial Visit - BGMEA', category:'general', date:'2025-04-20', body:'Industrial visit for Textile Engineering students.' },
  ])

  useEffect(() => {
    if (!isSupabaseConnected) return
    supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => { if (data && data.length > 0) setNotices(data) })
  }, [])

  return (
    <section ref={ref} className="py-20" style={{ background: '#F5F5F5' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-ucep-orange inline-block relative pb-3">
            Latest Notices
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-ucep-orange rounded-full" />
          </h2>
          <a href="#" className="text-ucep-orange font-semibold text-sm hover:underline hidden sm:block">
            View All &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {notices.map((notice, i) => (
            <NoticeCard key={notice.id} notice={notice} index={i} visible={visible} />
          ))}
        </div>

        <a href="#" className="text-ucep-orange font-semibold text-sm hover:underline mt-5 text-center block sm:hidden">
          View All &rarr;
        </a>
      </div>
    </section>
  )
}
