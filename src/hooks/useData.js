/* SUPABASE READY
   This hook auto-switches between Supabase and mock data.
   To enable Supabase:
   1. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   2. Run supabase/migration.sql in Supabase SQL Editor
   3. Restart the dev server
   When env vars are missing, mock data is used automatically.
*/

import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConnected } from '../lib/supabase'
import { hashPassword } from '../lib/auth'
import {
  STUDENTS, ADMIN, FACULTY, NOTICES,
  buildResults, buildFees, buildAttendance,
} from '../data/mockData'

export function useSupabaseReady() {
  return isSupabaseConnected
}

// ─── Auth ───────────────────────────────────────────────────────
export async function loginStudent(id, password) {
  if (isSupabaseConnected) {
    const hashed = await hashPassword(password)
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', id)
      .eq('password', hashed)
      .eq('role', 'student')
      .maybeSingle()
    if (error) { console.error('Supabase login error:', error); return null }
    if (!user) return null
    const { data: s, error: err2 } = await supabase
      .from('students')
      .select('*')
      .eq('id', user.ref_id || id)
      .maybeSingle()
    if (err2) { console.error('Supabase student lookup error:', err2); return null }
    if (!s) return null
    return { role: 'student', id: s.id, name: s.name, dept: s.dept, year: s.year, sem: s.sem, email: s.email, phone: s.phone, address: s.address, cgpa: s.cgpa, photo: s.photo, password: id }
  }
  const s = STUDENTS.find(s => s.id === id && s.password === password)
  return s ? { role: 'student', ...s } : null
}

export async function loginAdmin(username, password) {
  if (isSupabaseConnected) {
    const hashed = await hashPassword(password)
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', hashed)
      .eq('role', 'admin')
      .maybeSingle()
    if (error || !user) return null
    return { role: 'admin', username: user.username, name: user.email || 'Administrator', password: user.password }
  }
  return (username === ADMIN.username && password === ADMIN.password) ? { role: 'admin', ...ADMIN } : null
}

// ─── Students ────────────────────────────────────────────────────
export function useStudents() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    if (isSupabaseConnected) {
      const { data: d } = await supabase.from('students').select('*').order('id')
      setData(d || [])
    } else {
      setData(STUDENTS)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, refetch: fetch }
}

// ─── Faculty ─────────────────────────────────────────────────────
export function useFaculty() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    if (isSupabaseConnected) {
      const { data: d } = await supabase.from('faculty').select('*').order('id')
      setData(d || [])
    } else {
      setData(FACULTY)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, refetch: fetch }
}

// ─── Notices ─────────────────────────────────────────────────────
export function useNotices() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    if (isSupabaseConnected) {
      const { data: d } = await supabase.from('notices').select('*').order('id', { ascending: false })
      setData(d || [])
    } else {
      setData(NOTICES)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, refetch: fetch }
}

// ─── Results ─────────────────────────────────────────────────────
export function useResults(studentId, studentDept, studentSem) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!studentId) { setData([]); setLoading(false); return }
    setLoading(true)
    if (isSupabaseConnected) {
      const { data: rows } = await supabase
        .from('results').select('*')
        .eq('student_id', studentId).order('semester').order('id')
      if (rows && rows.length > 0) {
        const grouped = {}
        rows.forEach(r => {
          if (!grouped[r.semester]) grouped[r.semester] = { semester: r.semester, subjects: [] }
          grouped[r.semester].subjects.push({ subject: r.subject, credits: r.credits, marks: r.marks, grade: r.grade, points: r.points })
        })
        setData(Object.values(grouped).sort((a, b) => a.semester - b.semester))
      } else {
        const student = { id: studentId, dept: studentDept || 'CSE', sem: studentSem || 1 }
        setData(buildResults(student))
      }
    } else {
      const student = STUDENTS.find(s => s.id === studentId)
      setData(student ? buildResults(student) : [])
    }
    setLoading(false)
  }, [studentId, studentDept, studentSem])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, refetch: fetch }
}

// ─── Fees ────────────────────────────────────────────────────────
export function useFees(studentId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!studentId) { setData([]); setLoading(false); return }
    setLoading(true)
    if (isSupabaseConnected) {
      const { data: d } = await supabase.from('fees').select('*').eq('student_id', studentId).order('id')
      setData(d && d.length > 0 ? d : buildFees(studentId))
    } else {
      setData(buildFees(studentId))
    }
    setLoading(false)
  }, [studentId])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, refetch: fetch }
}

// ─── Attendance ──────────────────────────────────────────────────
export function useAttendance(studentId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!studentId) { setData([]); setLoading(false); return }
    setLoading(true)
    if (isSupabaseConnected) {
      const { data: d } = await supabase.from('attendance').select('*').eq('student_id', studentId)
      setData(d && d.length > 0 ? d : buildAttendance(studentId))
    } else {
      setData(buildAttendance(studentId))
    }
    setLoading(false)
  }, [studentId])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, refetch: fetch }
}

// ─── CRUD Helpers ──────────────────────────────────────────────
export async function addStudent(student) {
  if (!isSupabaseConnected) return null
  const { data, error } = await supabase.from('students').insert(student).select().single()
  if (error) throw error
  return data
}

export async function createStudentUser(studentId, password = 'pass123') {
  if (!isSupabaseConnected) return null
  const hashed = await hashPassword(password)
  const { error } = await supabase.from('users').insert({
    username: studentId,
    password: hashed,
    role: 'student',
    ref_id: studentId,
  })
  if (error) throw error
  return true
}

export async function updateStudent(id, updates) {
  if (!isSupabaseConnected) return null
  const { data, error } = await supabase.from('students').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteStudent(id) {
  if (!isSupabaseConnected) return null
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function addFaculty(faculty) {
  if (!isSupabaseConnected) return null
  const { data, error } = await supabase.from('faculty').insert(faculty).select().single()
  if (error) throw error
  return data
}

export async function updateFaculty(id, updates) {
  if (!isSupabaseConnected) return null
  const { data, error } = await supabase.from('faculty').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteFaculty(id) {
  if (!isSupabaseConnected) return null
  const { error } = await supabase.from('faculty').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function addNotice(notice) {
  if (!isSupabaseConnected) return null
  const { data, error } = await supabase.from('notices').insert(notice).select().single()
  if (error) throw error
  return data
}

export async function updateNotice(id, updates) {
  if (!isSupabaseConnected) return null
  const { data, error } = await supabase.from('notices').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteNotice(id) {
  if (!isSupabaseConnected) return null
  const { error } = await supabase.from('notices').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function saveResults(results) {
  if (!isSupabaseConnected) return null
  const { error } = await supabase.from('results').insert(results)
  if (error) throw error
  return true
}

export async function saveAttendance(records) {
  if (!isSupabaseConnected) return null
  const { error } = await supabase.from('attendance').insert(records)
  if (error) throw error
  return true
}
