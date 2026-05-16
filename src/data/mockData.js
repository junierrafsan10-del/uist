/* SUPABASE READY
   Replace getMockData() with useSupabase() calls:
   - supabase.from('students').select()
   - supabase.from('results').select().eq('student_id', id)
   - supabase.from('fees').select()
   - supabase.from('attendance').select()
   - supabase.auth.signInWithPassword({ email, password })
   Tables: students, results, fees, attendance, faculty, notices, users
*/

export const STUDENTS = [
  { id: 'S1001', name: 'Arif Hossain', password: 'pass123', dept: 'CSE', year: '3rd', sem: 5, email: 'arif@uist.edu', phone: '01711111111', address: 'Dhaka', cgpa: 8.7, photo: null },
  { id: 'S1002', name: 'Fatima Begum', password: 'pass123', dept: 'EEE', year: '2nd', sem: 3, email: 'fatima@uist.edu', phone: '01711111112', address: 'Chittagong', cgpa: 8.2, photo: null },
  { id: 'S1003', name: 'Tanvir Ahmed', password: 'pass123', dept: 'BBA', year: '4th', sem: 7, email: 'tanvir@uist.edu', phone: '01711111113', address: 'Sylhet', cgpa: 7.9, photo: null },
  { id: 'S1004', name: 'Nusrat Jahan', password: 'pass123', dept: 'Civil', year: '3rd', sem: 5, email: 'nusrat@uist.edu', phone: '01711111114', address: 'Rajshahi', cgpa: 9.1, photo: null },
  { id: 'S1005', name: 'Mahbub Karim', password: 'pass123', dept: 'CSE', year: '1st', sem: 1, email: 'mahbub@uist.edu', phone: '01711111115', address: 'Khulna', cgpa: 8.5, photo: null },
  { id: 'S1006', name: 'Shamim Reza', password: 'pass123', dept: 'EEE', year: '3rd', sem: 5, email: 'shamim@uist.edu', phone: '01711111116', address: 'Barisal', cgpa: 8.9, photo: null },
  { id: 'S1007', name: 'Jannatul Ferdous', password: 'pass123', dept: 'BBA', year: '2nd', sem: 3, email: 'jannatul@uist.edu', phone: '01711111117', address: 'Dhaka', cgpa: 8.1, photo: null },
  { id: 'S1008', name: 'Hasan Mahmud', password: 'pass123', dept: 'Civil', year: '4th', sem: 7, email: 'hasan@uist.edu', phone: '01711111118', address: 'Comilla', cgpa: 7.7, photo: null },
  { id: 'S1009', name: 'Tahmina Akhter', password: 'pass123', dept: 'CSE', year: '2nd', sem: 3, email: 'tahmina@uist.edu', phone: '01711111119', address: 'Mymensingh', cgpa: 9.3, photo: null },
  { id: 'S1010', name: 'Rafiul Islam', password: 'pass123', dept: 'BBA', year: '1st', sem: 1, email: 'rafiul@uist.edu', phone: '01711111120', address: 'Rangpur', cgpa: 8.0, photo: null },
]

export const ADMIN = { username: 'admin', password: 'admin123', name: 'Prof. Dr. Ayesha Rahman' }

export const FACULTY = [
  { id: 'F1001', name: 'Prof. Kamal Hossain', dept: 'CSE', designation: 'Professor & Head', subjects: ['Data Structures', 'Algorithms'], email: 'kamal@uist.edu', phone: '01711111121' },
  { id: 'F1002', name: 'Dr. Farzana Akhter', dept: 'EEE', designation: 'Associate Professor', subjects: ['Circuit Analysis', 'Power Systems'], email: 'farzana@uist.edu', phone: '01711111122' },
  { id: 'F1003', name: 'Mr. Shahidul Islam', dept: 'BBA', designation: 'Assistant Professor', subjects: ['Marketing', 'Finance'], email: 'shahidul@uist.edu', phone: '01711111123' },
  { id: 'F1004', name: 'Dr. Mahmuda Begum', dept: 'Civil', designation: 'Professor', subjects: ['Structural Analysis', 'Geotechnical Engg'], email: 'mahmuda@uist.edu', phone: '01711111124' },
]

export const DEPT_SUBJECTS = {
  CSE: [
    { sem: 1, subjects: [{ name: 'Mathematics I', credits: 4 }, { name: 'Programming Fund.', credits: 4 }, { name: 'Digital Logic', credits: 3 }, { name: 'English', credits: 2 }, { name: 'Physics', credits: 3 }] },
    { sem: 2, subjects: [{ name: 'Mathematics II', credits: 4 }, { name: 'Data Structures', credits: 4 }, { name: 'Discrete Math', credits: 3 }, { name: 'Computer Org.', credits: 3 }, { name: 'Electronics', credits: 3 }] },
    { sem: 3, subjects: [{ name: 'OOP', credits: 4 }, { name: 'Database Systems', credits: 4 }, { name: 'Operating Systems', credits: 3 }, { name: 'Networks', credits: 3 }, { name: 'Software Engg.', credits: 3 }] },
    { sem: 4, subjects: [{ name: 'Algorithms', credits: 4 }, { name: 'Web Technologies', credits: 4 }, { name: 'Machine Learning', credits: 3 }, { name: 'Compiler Design', credits: 3 }, { name: 'Security', credits: 3 }] },
    { sem: 5, subjects: [{ name: 'AI', credits: 4 }, { name: 'Cloud Computing', credits: 4 }, { name: 'Data Science', credits: 3 }, { name: 'Blockchain', credits: 3 }, { name: 'IoT', credits: 3 }] },
  ],
  EEE: [
    { sem: 1, subjects: [{ name: 'Mathematics I', credits: 4 }, { name: 'Basic Electrical', credits: 4 }, { name: 'Engg Physics', credits: 3 }, { name: 'English', credits: 2 }, { name: 'Drawing', credits: 3 }] },
    { sem: 2, subjects: [{ name: 'Mathematics II', credits: 4 }, { name: 'Circuit Analysis', credits: 4 }, { name: 'Analog Electronics', credits: 3 }, { name: 'Digital Electronics', credits: 3 }, { name: 'Instrumentation', credits: 3 }] },
    { sem: 3, subjects: [{ name: 'Electrical Machines', credits: 4 }, { name: 'Power Systems', credits: 4 }, { name: 'Control Systems', credits: 3 }, { name: 'Microprocessors', credits: 3 }, { name: 'Signal Proc.', credits: 3 }] },
  ],
  BBA: [
    { sem: 1, subjects: [{ name: 'Management Principles', credits: 4 }, { name: 'Microeconomics', credits: 4 }, { name: 'Financial Acct.', credits: 3 }, { name: 'Business English', credits: 2 }, { name: 'Business Math', credits: 3 }] },
    { sem: 2, subjects: [{ name: 'Macroeconomics', credits: 4 }, { name: 'Marketing Mgmt.', credits: 4 }, { name: 'Org. Behavior', credits: 3 }, { name: 'Cost Accounting', credits: 3 }, { name: 'Business Law', credits: 3 }] },
    { sem: 3, subjects: [{ name: 'HR Management', credits: 4 }, { name: 'Financial Mgmt.', credits: 4 }, { name: 'Operations Research', credits: 3 }, { name: 'Taxation', credits: 3 }, { name: 'Entrepreneurship', credits: 3 }] },
  ],
  Civil: [
    { sem: 1, subjects: [{ name: 'Mathematics I', credits: 4 }, { name: 'Engg Mechanics', credits: 4 }, { name: 'Building Materials', credits: 3 }, { name: 'English', credits: 2 }, { name: 'Drawing', credits: 3 }] },
    { sem: 2, subjects: [{ name: 'Mathematics II', credits: 4 }, { name: 'Surveying', credits: 4 }, { name: 'Fluid Mechanics', credits: 3 }, { name: 'Strength of Mat.', credits: 3 }, { name: 'Env. Studies', credits: 3 }] },
    { sem: 3, subjects: [{ name: 'Structural Analysis', credits: 4 }, { name: 'Geotechnical Engg', credits: 4 }, { name: 'Transportation', credits: 3 }, { name: 'Hydrology', credits: 3 }, { name: 'Concrete Tech.', credits: 3 }] },
  ],
}

export const NOTICES = [
  { id: 1, title: 'Semester Final Exam Schedule', body: 'End semester examinations will begin from June 10, 2025. Detailed timetable available on the portal.', date: '2025-04-01' },
  { id: 2, title: 'Tech Fest 2025 — Register Now', body: 'Annual inter-university tech fest. Prizes worth Tk. 2,00,000. Register by May 15.', date: '2025-03-20' },
  { id: 3, title: 'Library Extended Hours', body: 'Library open until 11 PM during exam season starting next week.', date: '2025-03-15' },
  { id: 4, title: 'Internship Opportunity', body: 'Google Summer of Code 2025 — interested students contact the CSE department office.', date: '2025-03-10' },
  { id: 5, title: 'Campus Placement Drive', body: 'Top recruiters visiting campus in June. Register your interest by May 1.', date: '2025-03-05' },
]

export function getGrade(marks) {
  if (marks >= 90) return { grade: 'A+', points: 10 }
  if (marks >= 80) return { grade: 'A', points: 9 }
  if (marks >= 70) return { grade: 'B', points: 8 }
  if (marks >= 60) return { grade: 'C', points: 7 }
  if (marks >= 50) return { grade: 'D', points: 6 }
  return { grade: 'F', points: 0 }
}

function rng() { return Math.min(65 + Math.floor(Math.random() * 30) + Math.floor(Math.random() * 10 - 5), 100) }

export function buildResults(student) {
  const data = DEPT_SUBJECTS[student.dept]
  if (!data) return []
  return data.filter(s => s.sem <= student.sem).map(sem => ({
    semester: sem.sem,
    subjects: sem.subjects.map(sub => {
      const marks = rng()
      const { grade, points } = getGrade(marks)
      return { subject: sub.name, credits: sub.credits, marks, grade, points }
    }),
  }))
}

export function buildFees(sid) {
  const all = [
    { id: 1, desc: 'Tuition Fee Sem 1', amount: 45000, paid: 45000, date: '2024-07-15', status: 'paid' },
    { id: 2, desc: 'Library Fee Sem 1', amount: 5000, paid: 5000, date: '2024-07-15', status: 'paid' },
    { id: 3, desc: 'Lab Fee Sem 1', amount: 8000, paid: 8000, date: '2024-08-01', status: 'paid' },
    { id: 4, desc: 'Tuition Fee Sem 2', amount: 45000, paid: sid === 'S1004' ? 45000 : 30000, date: '2025-01-10', status: sid === 'S1004' ? 'paid' : 'partial' },
    { id: 5, desc: 'Hostel Fee', amount: 25000, paid: 25000, date: '2025-01-10', status: 'paid' },
    { id: 6, desc: 'Exam Fee', amount: 3000, paid: sid === 'S1004' ? 3000 : 0, date: '2025-03-01', status: sid === 'S1004' ? 'paid' : 'unpaid' },
  ]
  if (sid === 'S1001' || sid === 'S1006') return all.map(f => f.id === 4 ? { ...f, paid: 45000, status: 'paid' } : f)
  return all
}

export function buildAttendance(sid) {
  const weeks = 12
  const subjects = ['Mathematics', 'Physics', 'Programming', 'English', 'Digital Logic']
  return subjects.map(s => {
    const total = weeks * 2 + Math.floor(Math.random() * 4)
    const attended = Math.max(0, Math.min(total, total - Math.floor(Math.random() * 6) - 2))
    return { subject: s, total, attended }
  })
}
