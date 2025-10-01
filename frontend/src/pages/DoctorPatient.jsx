import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { Card, CardHeader, CardContent } from '../components/ui/card.jsx'
import { Table, THead, TR, TH, TD } from '../components/ui/table.jsx'
import { Input } from '../components/ui/input.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../components/ui/toast.jsx'

export default function DoctorPatient() {
  const { patientId } = useParams()
  const { token } = useAuth()
  const [history, setHistory] = useState({ items: [], total: 0 })
  const toast = useToast()
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [labs, setLabs] = useState([])
  const [rxForm, setRxForm] = useState({ medicines: '', diagnosis: '', suggestion: '' })

  async function loadHistory() {
    const res = await fetch(`http://localhost:4000/api/doctor/patients/${patientId}/history?page=${page}&pageSize=10&q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (res.ok) setHistory(data)
  }

  async function loadLabs() {
    const res = await fetch(`http://localhost:4000/api/doctor/patients/${patientId}/labs`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (res.ok) setLabs(data.items)
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

  useEffect(() => { if (token) { loadHistory(); loadLabs(); } }, [token, page])

  async function savePrescription() {
    await fetch('http://localhost:4000/api/doctor/prescriptions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ patientId, medicines: rxForm.medicines, diagnosis: rxForm.diagnosis, suggestion: rxForm.suggestion })
    })
    setRxForm({ medicines: '', diagnosis: '', suggestion: '' })
    toast?.success('Prescription saved')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="font-semibold">History</div>
              <div className="ml-auto flex gap-2">
                <Input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
                <Button onClick={()=>{ setPage(1); loadHistory(); }}>Search</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR><TH>Date</TH><TH>Reason</TH><TH>Diagnosis</TH></TR>
              </THead>
              <tbody>
                {history.items.map(v => (
                  <TR key={v.id}>
                    <TD>{new Date(v.createdAt).toLocaleString()}</TD>
                    <TD>{v.reason || '-'}</TD>
                    <TD>{v.diagnosis || '-'}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
            <div className="mt-3 flex items-center gap-2">
              <Button variant="outline" onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
              <div className="text-sm">Page {page}</div>
              <Button variant="outline" onClick={()=>setPage(p=>p+1)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>Lab Results</CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR><TH>Date</TH><TH>Type</TH><TH>File</TH></TR>
              </THead>
              <tbody>
                {labs.map(r => (
                  <TR key={r.id}>
                    <TD>{new Date(r.createdAt).toLocaleString()}</TD>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Prescription</CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input placeholder="Medicines" value={rxForm.medicines} onChange={e=>setRxForm({...rxForm, medicines: e.target.value})} />
              <Input placeholder="Diagnosis" value={rxForm.diagnosis} onChange={e=>setRxForm({...rxForm, diagnosis: e.target.value})} />
              <Input placeholder="Suggestion" value={rxForm.suggestion} onChange={e=>setRxForm({...rxForm, suggestion: e.target.value})} />
              <Button onClick={savePrescription}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


