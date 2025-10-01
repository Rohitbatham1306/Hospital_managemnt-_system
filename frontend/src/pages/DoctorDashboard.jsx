import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { Card, CardHeader, CardContent } from '../components/ui/card.jsx'
import { Table, THead, TR, TH, TD } from '../components/ui/table.jsx'
import { Input } from '../components/ui/input.jsx'
import { Button } from '../components/ui/button.jsx'
import { Link } from 'react-router-dom'
import { useToast } from '../components/ui/toast.jsx'


export default function DoctorDashboard() {
  const { token, user } = useAuth()
  const [visits, setVisits] = useState([])
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')

  useEffect(() => {
    async function load() {
      try {
        // For admins, require a doctor selection before loading
        if (user?.role === 'ADMIN' && !selectedDoctor) {
          setVisits([])
          return
        }
        const query = user?.role === 'ADMIN' && selectedDoctor ? `?doctorId=${selectedDoctor}` : ''
        const res = await fetch(`http://localhost:4000/api/doctor/dashboard${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) {
          setVisits([])
          return
        }
        const data = await res.json()
        setVisits(Array.isArray(data.visits) ? data.visits : [])
      } catch (error) {
        console.error('Failed to load visits:', error)
      }
    }
    async function loadDoctors() {
      try {
        const res = await fetch('http://localhost:4000/api/reception/doctors?page=1&pageSize=100', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setDoctors(data.items)
      } catch (error) {
        console.error('Failed to load doctors:', error)
      }
    }
    if (token) {
      if (user?.role === 'ADMIN') loadDoctors()
      load()
    }
  }, [token, user, selectedDoctor])

  const [noteByVisit, setNoteByVisit] = useState({})

  const toast = useToast()

  async function addNote(visitId) {
    const content = noteByVisit[visitId]
    if (!content) return
    await fetch(`http://localhost:4000/api/doctor/visits/${visitId}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content })
    })
    setNoteByVisit({ ...noteByVisit, [visitId]: '' })
    toast?.success('Note added')
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Doctor Dashboard</h1>
      {user?.role === 'ADMIN' && (
        <div className="mb-3 flex gap-2">
          <select className="border p-2 rounded" value={selectedDoctor} onChange={e=>setSelectedDoctor(e.target.value)}>
            <option value="">Select doctor to view</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.user.fullName}</option>)}
          </select>
        </div>
      )}
      <Card>
        <CardHeader>Assigned Visits</CardHeader>
        <CardContent>
          {user?.role === 'ADMIN' && !selectedDoctor && (
            <div className="mb-2 text-sm text-gray-600">Select a doctor to view visits.</div>
          )}
          <Table>
            <THead>
              <TR><TH>Patient</TH><TH>Reason</TH><TH>Status</TH><TH>Add Note</TH><TH></TH></TR>
            </THead>
            <tbody>
              {visits.map(v => (
                <TR key={v.id}>
                  <TD>{v.patient.firstName} {v.patient.lastName}</TD>
                  <TD>{v.reason || '-'}</TD>
                  <TD>{v.status}</TD>
                  <TD>
                    <div className="flex gap-2">
                      <Input placeholder="Note" value={noteByVisit[v.id] || ''} onChange={e=>setNoteByVisit({ ...noteByVisit, [v.id]: e.target.value })} />
                      <Button onClick={()=>addNote(v.id)}>Add</Button>
                    </div>
                  </TD>
                  <TD><Link className="text-blue-600" to={`/doctor/patient/${v.patientId}`}>View</Link></TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


