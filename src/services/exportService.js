import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function addLetterhead(doc) {
  doc.setFillColor(15, 32, 64)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('UCEP Institute of Science and Technology', 105, 11, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Plot# 2 & 3, Mirpur-2, Dhaka-1216 | +88-02-9036034 | principal.uist.dhaka@ucepbd.org', 105, 20, { align: 'center' })
  doc.setFillColor(245, 124, 0)
  doc.rect(0, 28, 210, 2, 'F')
  doc.setTextColor(30, 30, 30)
}

export function exportStudentsExcel(students) {
  const rows = students.map((s, i) => ({
    'No': i + 1,
    'Student ID': s.student_id || s.id || '',
    'Full Name': s.name || '',
    'Course': s.course || s.dept || '',
    'Batch': s.batch || s.year || '',
    'Phone': s.phone || '',
    'Email': s.email || '',
    'Status': s.status || 'active',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{wch:5},{wch:12},{wch:22},{wch:28},{wch:8},{wch:14},{wch:26},{wch:10}]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Students')
  XLSX.writeFile(wb, `UIST_Students_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportStudentsPDF(students) {
  const doc = new jsPDF()
  addLetterhead(doc)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 32, 64)
  doc.text('STUDENT LIST', 105, 40, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(`Total: ${students.length} students | Generated: ${new Date().toLocaleDateString()}`, 105, 48, { align: 'center' })
  autoTable(doc, {
    startY: 54,
    head: [['#', 'Student ID', 'Name', 'Course', 'Batch', 'Phone', 'Status']],
    body: students.map((s, i) => [i+1, s.student_id||s.id, s.name, s.course||s.dept, s.batch||s.year, s.phone||'-', s.status||'active']),
    headStyles: { fillColor: [15,32,64], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248,249,250] },
    bodyStyles: { fontSize: 8 },
  })
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text(`Generated on ${new Date().toLocaleDateString()} | UCEP Institute of Science and Technology`, 105, 285, { align: 'center' })
  doc.save(`UIST_Students_${new Date().toISOString().split('T')[0]}.pdf`)
}

export function exportResultsPDF(results, title = 'Results Report') {
  const doc = new jsPDF()
  addLetterhead(doc)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 32, 64)
  doc.text(title.toUpperCase(), 105, 40, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(`Total Records: ${results.length} | Generated: ${new Date().toLocaleDateString()}`, 105, 48, { align: 'center' })
  autoTable(doc, {
    startY: 54,
    head: [['Student', 'ID', 'Course', 'Exam', 'Marks', 'Total', '%', 'Grade']],
    body: results.map(r => {
      const pct = r.marks && r.total ? ((r.marks/r.total)*100).toFixed(1) : '0'
      return [r.student_name||'Unknown', r.student_id||r.student_id, r.course||'-', r.exam_type||'-', r.marks||0, r.total||100, pct+'%', r.grade||'-']
    }),
    headStyles: { fillColor: [15,32,64], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248,249,250] },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 7: { halign: 'center' } },
  })
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text(`Generated on ${new Date().toLocaleDateString()} | UCEP Institute of Science and Technology`, 105, 285, { align: 'center' })
  doc.save(`UIST_Results_${new Date().toISOString().split('T')[0]}.pdf`)
}

export function exportResultsExcel(results) {
  const rows = results.map((r, i) => ({
    'No': i + 1,
    'Student Name': r.student_name || '',
    'Student ID': r.student_id || '',
    'Course': r.course || '',
    'Exam Type': r.exam_type || '',
    'Marks': r.marks || 0,
    'Total': r.total || 100,
    'Percentage': r.marks && r.total ? ((r.marks/r.total)*100).toFixed(1)+'%' : '0%',
    'Grade': r.grade || '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{wch:5},{wch:20},{wch:12},{wch:25},{wch:12},{wch:8},{wch:8},{wch:12},{wch:8}]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Results')
  XLSX.writeFile(wb, `UIST_Results_${new Date().toISOString().split('T')[0]}.xlsx`)
}
