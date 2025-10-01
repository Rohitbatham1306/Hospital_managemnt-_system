import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { Card, CardHeader, CardContent } from '../components/ui/card.jsx'
import { Table, THead, TR, TH, TD } from '../components/ui/table.jsx'

export default function ReceptionPatient() {
  const { patientId } = useParams()
  const { token } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    async function load() {
      const res = await fetch(`http://localhost:4000/api/reception/patients/${patientId}/overview`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      if (res.ok) setData(json)
    }
    if (token) load()
  }, [token, patientId])

  if (!data) return null

  const { patient, visits, prescriptions, bills } = data

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>Patient</CardHeader>
        <CardContent>
          <div className="text-sm">{patient.firstName} {patient.lastName} · {patient.phone}</div>
          <div className="text-sm text-gray-600">Preferred Payment: {patient.preferredPaymentMethod || '-'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Visits</CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR><TH>Date</TH><TH>Reason</TH><TH>Diagnosis</TH></TR>
            </THead>
            <tbody>
              {visits.map(v => (
                <TR key={v.id}>
                  <TD>{new Date(v.createdAt).toLocaleString()}</TD>
                  <TD>{v.reason || '-'}</TD>
                  <TD>{v.diagnosis || '-'}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Prescriptions</CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR><TH>Date</TH><TH>Medicines</TH><TH>Diagnosis</TH><TH>Suggestion</TH></TR>
            </THead>
            <tbody>
              {prescriptions.map(r => (
                <TR key={r.id}>
                  <TD>{new Date(r.createdAt).toLocaleString()}</TD>
                  <TD>{r.medicines}</TD>
                  <TD>{r.diagnosis || '-'}</TD>
                  <TD>{r.suggestion || '-'}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Bills</CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR><TH>Date</TH><TH>Total</TH><TH>Status</TH></TR>
            </THead>
            <tbody>
              {bills.map(b => (
                <TR key={b.id}>
                  <TD>{new Date(b.createdAt).toLocaleString()}</TD>
                  <TD>{Number(b.total).toFixed(2)}</TD>
                  <TD>{b.status}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


