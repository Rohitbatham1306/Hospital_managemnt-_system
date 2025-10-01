import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { Card, CardHeader, CardContent } from '../components/ui/card.jsx'
import { Table, THead, TR, TH, TD } from '../components/ui/table.jsx'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Input } from '../components/ui/input.jsx'
import { Button } from '../components/ui/button.jsx'
import { Users, Stethoscope, Activity, IndianRupee, CalendarRange } from 'lucide-react'

export default function AdminDashboard() {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [report, setReport] = useState({ visits: [], bills: [], revenue: 0 })
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('http://localhost:4000/api/admin/users?page=1&pageSize=10', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) setUsers(data.items)
    }
    async function loadStats() {
      const res = await fetch('http://localhost:4000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) setStats(data)
    }
    if (token) { load(); loadStats(); }
  }, [token])

  async function runReport() {
    const query = new URLSearchParams()
    if (from) query.set('from', from)
    if (to) query.set('to', to)
    const res = await fetch(`http://localhost:4000/api/admin/reports?${query.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (res.ok) setReport(data)
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600"><Users size={18}/></div>
              <div className="font-medium text-blue-800">Patients</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{stats?.patients ?? '-'}</div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-emerald-100 text-emerald-600"><Stethoscope size={18}/></div>
              <div className="font-medium text-emerald-800">Doctors</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{stats?.doctors ?? '-'}</div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600"><Activity size={18}/></div>
              <div className="font-medium text-amber-800">Open Visits</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{stats?.visitsOpen ?? '-'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader>Users</CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR><TH>Name</TH><TH>Email</TH><TH>Role</TH></TR>
              </THead>
              <tbody>
                {users.map(u => (
                  <TR key={u.id}>
                    <TD>{u.fullName}</TD>
                    <TD>{u.email}</TD>
                    <TD>{u.role}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-indigo-100 text-indigo-600"><IndianRupee size={18}/></div>
                <div className="font-semibold">Revenue</div>
              </div>
              <div className="ml-auto flex gap-2">
                <div className="flex items-center gap-2 bg-gray-50 border rounded px-2">
                  <CalendarRange size={16} className="text-gray-500"/>
                  <Input className="border-0 bg-transparent" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border rounded px-2">
                  <CalendarRange size={16} className="text-gray-500"/>
                  <Input className="border-0 bg-transparent" type="date" value={to} onChange={e=>setTo(e.target.value)} />
                </div>
                <Button onClick={runReport}>Run</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-2 font-medium text-indigo-700">Total: ₹{Number(report.revenue || 0).toFixed(2)}</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.payments?.map(p=>({ date: new Date(p.createdAt).toLocaleDateString(), amount: Number(p.amount) })) || []}>
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


