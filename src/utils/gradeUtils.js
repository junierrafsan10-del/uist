export function calculateGrade(marks, total) {
  return calculateGradeFromPct((marks / total) * 100)
}

export function calculateGradeFromPct(pct) {
  if (pct >= 90) return { grade: 'A+', gpa: 4.0 }
  if (pct >= 80) return { grade: 'A',  gpa: 4.0 }
  if (pct >= 70) return { grade: 'B',  gpa: 3.0 }
  if (pct >= 60) return { grade: 'C',  gpa: 2.0 }
  if (pct >= 50) return { grade: 'D',  gpa: 1.0 }
  return { grade: 'F', gpa: 0.0 }
}

export function calculateGPA(results) {
  if (!results || results.length === 0) return '0.00'
  const total = results.reduce((sum, r) => {
    return sum + calculateGrade(r.marks, r.total).gpa
  }, 0)
  return (total / results.length).toFixed(2)
}

export function getLetterFromGPA(gpa) {
  const g = parseFloat(gpa)
  if (g >= 3.7) return 'A+'
  if (g >= 3.3) return 'A'
  if (g >= 2.7) return 'B'
  if (g >= 2.0) return 'C'
  if (g >= 1.0) return 'D'
  return 'F'
}
