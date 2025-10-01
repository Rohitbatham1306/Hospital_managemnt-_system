import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { Card, CardHeader, CardContent } from '../components/ui/card.jsx'
import { Input } from '../components/ui/input.jsx'
import { Button } from '../components/ui/button.jsx'
import { Table, THead, TR, TH, TD } from '../components/ui/table.jsx'
import { useToast } from '../components/ui/toast.jsx'

export default function LabDashboard() {
  const { token } = useAuth()
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [file, setFile] = useState(null)
  const [type, setType] = useState('General')
  const [notes, setNotes] = useState('')
  const [reports, setReports] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const fileInputRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoadingPatients(true)
        const res = await fetch('http://localhost:4000/api/lab/patients', { 
          headers: { Authorization: `Bearer ${token}` } 
        })
        const data = await res.json()
        if (res.ok) {
          setPatients(data.items || [])
        } else {
          toast?.error('Failed to load patients')
        }
      } catch (error) {
        console.error('Error loading patients:', error)
        toast?.error('Failed to load patients')
      } finally {
        setLoadingPatients(false)
      }
    }
    if (token) loadPatients()
  }, [token, toast])

  async function loadReports(patientId) {
    const res = await fetch(`http://localhost:4000/api/lab/patients/${patientId}/reports`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (res.ok) setReports(data.items)
  }

  async function onUpload(e) {
    e.preventDefault()
    if (!file) {
      toast?.error('Please select a file to upload')
      return
    }
    if (!selectedPatient) {
      toast?.error('Please select a patient')
      return
    }
    if (!type.trim()) {
      toast?.error('Please enter a report type')
      return
    }
    
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('patientId', selectedPatient)
    form.append('type', type)
    form.append('notes', notes)
    
    try {
      const res = await fetch('http://localhost:4000/api/lab/reports/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      })
      
      if (res.ok) {
        setFile(null)
        setNotes('')
        setType('General')
        if (fileInputRef.current) fileInputRef.current.value = ''
        toast?.success('Report uploaded successfully')
        loadReports(selectedPatient)
      } else {
        const errorData = await res.json()
        toast?.error(errorData.message || 'Failed to upload report')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast?.error('Failed to upload report')
    } finally {
      setUploading(false)
    }
  }

  async function openLabReport(reportId) {
    try {
      const res = await fetch(`http://localhost:4000/api/files/lab-reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.fileUrl) {
          // Open the file in a new tab
          window.open(data.fileUrl, '_blank')
        } else {
          toast?.error('Failed to get file URL')
        }
      } else {
        const errorData = await res.json()
        toast?.error(errorData.message || 'Failed to access lab report')
      }
    } catch (error) {
      console.error('Error opening lab report:', error)
      toast?.error('Failed to open lab report')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="text-xl font-semibold mb-4">Lab</h1>
        <Card>
          <CardHeader>Upload Report</CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onUpload}>
              <select 
                className="w-full border p-2 rounded" 
                value={selectedPatient} 
                onChange={e=>{ setSelectedPatient(e.target.value); if (e.target.value) loadReports(e.target.value) }}
                disabled={loadingPatients}
              >
                <option value="">
                  {loadingPatients ? 'Loading patients...' : 'Select patient'}
                </option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
              <Input placeholder="Type (e.g. CBC)" value={type} onChange={e=>setType(e.target.value)} />
              <Input placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} />
              <input ref={fileInputRef} className="w-full" type="file" onChange={e=>setFile(e.target.files?.[0] || null)} />
              <Button className="w-full" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>Reports</CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {selectedPatient ? 'No reports found for this patient' : 'Select a patient to view their reports'}
              </div>
            ) : (
              <Table>
                <THead>
                  <TR><TH>Date</TH><TH>Patient</TH><TH>Type</TH><TH>File</TH></TR>
                </THead>
                <tbody>
                  {reports.map(r => (
                    <TR key={r.id}>
                      <TD>{new Date(r.createdAt).toLocaleString()}</TD>
                      <TD>{r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : 'Unknown'}</TD>
                      <TD>{r.type}</TD>
                      <TD>
                        <button 
                          className="text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer"
                          onClick={() => openLabReport(r.id)}
                        >
                          Open
                        </button>
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


