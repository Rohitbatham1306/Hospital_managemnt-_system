import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { Input } from '../components/ui/input.jsx'
import { Button } from '../components/ui/button.jsx'
import { Card, CardHeader, CardContent } from '../components/ui/card.jsx'
import { useToast } from '../components/ui/toast.jsx'
import { Table, THead, TR, TH, TD } from '../components/ui/table.jsx'

export default function ReceptionBilling() {
  const { token } = useAuth()
  const toast = useToast()
  const [patients, setPatients] = useState([])
  const [bill, setBill] = useState({ patientId: '', items: [{ label: '', quantity: 1, unitPrice: 0 }] })
  const [q, setQ] = useState('')
  const [bills, setBills] = useState({ items: [], total: 0 })
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function loadPatients() {
      const res = await fetch('http://localhost:4000/api/reception/patients?page=1&pageSize=100', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) setPatients(data.items)
    }
    if (token) loadPatients()
  }, [token])

  async function loadBills() {
    const res = await fetch(`http://localhost:4000/api/reception/bills?q=${encodeURIComponent(q)}&page=${page}&pageSize=10`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (res.ok) setBills(data)
  }
  useEffect(() => { if (token) loadBills() }, [token, page])

  function addItem() {
    setBill({ ...bill, items: [...bill.items, { label: '', quantity: 1, unitPrice: 0 }] })
  }
  function updateItem(idx, patch) {
    const next = bill.items.slice()
    next[idx] = { ...next[idx], ...patch }
    setBill({ ...bill, items: next })
  }

  async function onCreateBill(e) {
    e.preventDefault()
    const res = await fetch('http://localhost:4000/api/reception/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(bill)
    })
    if (res.ok) { setBill({ patientId: '', items: [{ label: '', quantity: 1, unitPrice: 0 }] }); toast?.success('Bill created') } else { toast?.error('Failed to create bill') }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>Create Bill</CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onCreateBill}>
            <select className="w-full border p-2 rounded" value={bill.patientId} onChange={e=>setBill({ ...bill, patientId: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </select>
            <div className="space-y-3">
              {bill.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <Input placeholder="Item" value={it.label} onChange={e=>updateItem(idx, { label: e.target.value })} />
                  <Input type="number" placeholder="Qty" value={it.quantity} onChange={e=>updateItem(idx, { quantity: Number(e.target.value) })} />
                  <Input type="number" placeholder="Unit Price" value={it.unitPrice} onChange={e=>updateItem(idx, { unitPrice: Number(e.target.value) })} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={addItem}>Add Item</Button>
              <Button className="ml-auto">Create Bill</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="font-semibold">Bills</div>
            <div className="ml-auto flex gap-2">
              <Input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
              <Button onClick={()=>{ setPage(1); loadBills(); }}>Search</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR><TH>Date</TH><TH>Patient</TH><TH>Total</TH></TR>
            </THead>
            <tbody>
              {bills.items.map(b => (
                <TR key={b.id}>
                  <TD>{new Date(b.createdAt).toLocaleString()}</TD>
                  <TD>{b.patient.firstName} {b.patient.lastName}</TD>
                  <TD>{Number(b.total).toFixed(2)}</TD>
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
  )
}


