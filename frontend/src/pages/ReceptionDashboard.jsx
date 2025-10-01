import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { Input } from '../components/ui/input.jsx'
import { Button } from '../components/ui/button.jsx'
import { Card, CardHeader, CardContent } from '../components/ui/card.jsx'
import { Table, THead, TR, TH, TD } from '../components/ui/table.jsx'
import { Link } from 'react-router-dom'
import { useToast } from '../components/ui/toast.jsx'

export default function ReceptionDashboard() {
  const { token } = useAuth()
  const toast = useToast()
  const [patients, setPatients] = useState([])
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', preferredPaymentMethod: 'CASH' })
  const [assign, setAssign] = useState({ patientId: '', doctorId: '', reason: '' })
  const [doctors, setDoctors] = useState([])

  const [page, setPage] = useState(1)

  async function load() {
    try {
      const res = await fetch(`http://localhost:4000/api/reception/patients?q=${encodeURIComponent(q)}&page=${page}&pageSize=10`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setPatients(data.items)
    } catch (error) {
      console.error('Failed to load patients:', error)
      toast?.error('Failed to load patients')
    }
  }

  useEffect(() => { if (token) load() }, [token, page])

  async function loadDoctors() {
    try {
      const res = await fetch('http://localhost:4000/api/reception/doctors?page=1&pageSize=100', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setDoctors(data.items)
    } catch (error) {
      console.error('Failed to load doctors:', error)
      toast?.error('Failed to load doctors')
    }
  }
  useEffect(() => { if (token) loadDoctors() }, [token])

  async function onCreatePatient(e) {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:4000/api/reception/patients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      })
      setForm({ firstName: '', lastName: '', phone: '', preferredPaymentMethod: 'CASH' })
      load()
      toast?.success('Patient created')
    } catch (error) {
      console.error('Failed to create patient:', error)
      toast?.error('Failed to create patient')
    }
  }

  async function onAssign(e) {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:4000/api/reception/assign', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(assign)
      })
      setAssign({ patientId: '', doctorId: '', reason: '' })
      toast?.success('Assigned to doctor')
    } catch (error) {
      console.error('Failed to assign:', error)
      toast?.error('Failed to assign')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-xl font-semibold mb-4">Reception</h1>
        <div className="mb-3 flex gap-2">
          <Input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
          <Button onClick={load}>Search</Button>
        </div>
        <Card>
          <CardHeader>Patients</CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR><TH>Name</TH><TH>Phone</TH></TR>
              </THead>
              <tbody>
                {patients.map(p => (
                  <TR key={p.id}>
                    <TD>{p.firstName} {p.lastName}</TD>
                    <TD>{p.phone}</TD>
                    <TD><Link className="text-blue-600" to={`/reception/patient/${p.id}`}>View</Link></TD>
                  </TR>
                ))}
              </tbody>
            </Table>
        </CardContent>
        </Card>
        <div className="mt-3 flex items-center gap-2">
          <Button variant="outline" onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
          <div className="text-sm">Page {page}</div>
          <Button variant="outline" onClick={()=>setPage(p=>p+1)}>Next</Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>Register Patient</CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onCreatePatient}>
              <Input placeholder="First name" value={form.firstName} onChange={e=>setForm({...form, firstName: e.target.value})} />
              <Input placeholder="Last name" value={form.lastName} onChange={e=>setForm({...form, lastName: e.target.value})} />
              <Input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} />
              <select className="w-full border p-2 rounded" value={form.preferredPaymentMethod} onChange={e=>setForm({...form, preferredPaymentMethod: e.target.value})}>
                <option value="CASH">Cash</option>
                <option value="ONLINE">Online</option>
              </select>
              <Button className="w-full">Create</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Assign to Doctor</CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onAssign}>
              <select className="w-full border p-2 rounded" value={assign.patientId} onChange={e=>setAssign({...assign, patientId: e.target.value})}>
                <option value="">Select patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
              <select className="w-full border p-2 rounded" value={assign.doctorId} onChange={e=>setAssign({...assign, doctorId: e.target.value})}>
                <option value="">Select doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.user.fullName}</option>)}
              </select>
              <Input placeholder="Reason" value={assign.reason} onChange={e=>setAssign({...assign, reason: e.target.value})} />
              <Button className="w-full">Assign</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


