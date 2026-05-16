import { useEffect, useRef, useState } from 'react'

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

// TODO: Replace with useNotices() hook from Supabase
const notices = [
  {
    id: 1,
    category: 'urgent',
    label: 'URGENT',
    color: '#E53935',
    title: 'Diploma Engineering Final Exam Schedule 2025',
    date: 'May 10, 2025',
    content: 'The final examination schedule for all diploma engineering technologies has been published. Students are advised to check the notice board for details.',
  },
  {
    id: 2,
    category: 'admission',
    label: 'ADMISSION',
    color: '#00ACC1',
    title: 'Admission Open for January 2026 Batch',
    date: 'May 5, 2025',
    content: 'Applications are now being accepted for the January 2026 academic session. Visit the admission office for details.',
  },
  {
    id: 3,
    category: 'exam',
    label: 'EXAM',
    color: '#F57C00',
    title: 'Result Published - 6th Semester Civil Technology',
    date: 'April 28, 2025',
    content: 'The results for the 6th semester final examinations of Civil Technology have been published and are available online.',
  },
  {
    id: 4,
    category: 'general',
    label: 'GENERAL',
    color: '#43A047',
    title: 'Industrial Visit to BGMEA for Textile Students',
    date: 'April 20, 2025',
    content: 'An industrial visit to BGMEA has been arranged for textile engineering students. Interested students should register by April 25.',
  },
]

function NoticeCard({ notice, index, visible }) {
  const [ref, show] = useOnScreen()
  const isVisible = visible && show

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl p-5 relative overflow-hidden transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${index * 150}ms`,
        borderLeft: `4px solid ${notice.color}`,
      }}
    >
      {/* Category badge */}
      <span
        className="absolute top-3 right-3 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
        style={{ background: notice.color }}
      >
        {notice.label}
      </span>
      <h4 className="font-bold text-gray-900 text-sm pr-24 mb-1">{notice.title}</h4>
      <p className="text-gray-400 text-xs mb-2">{notice.date}</p>
      <p className="text-gray-500 text-sm leading-relaxed">
        {notice.content.length > 80 ? notice.content.slice(0, 80) + '...' : notice.content}
      </p>
    </div>
  )
}

export default function NoticeBoard() {
  const [ref, visible] = useOnScreen()

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
