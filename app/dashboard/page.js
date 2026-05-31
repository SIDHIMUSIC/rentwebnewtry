'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function Dashboard() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTenants()
  }, [])

  async function fetchTenants() {
    try {
      const res = await fetch('/api/tenants')
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setTenants(data.tenants || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const active = tenants.filter(t => t.isActive)
  const totalRent = active.reduce((sum, t) => sum + (t.rentAmount || 0), 0)
  const totalDeposit = active.reduce((sum, t) => sum + (t.depositAmount || 0), 0)

  // This month pending
  const now = new Date()
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const thisMonth = months[now.getMonth()]
  const thisYear = now.getFullYear()

  const pendingCount = active.filter(t => {
    const hasPaid = t.payments?.some(p =>
      p.month === thisMonth && p.year === thisYear && p.status === 'paid'
    )
    return !hasPaid
  }).length

  return (
    <div>
      <Navbar />
      <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: '#64748b', marginBottom: '28px' }}>Welcome back, Admin 👋</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Active Tenants', value: active.length, icon: '👥', color: '#3b82f6' },
            { label: 'Monthly Rent', value: `₹${totalRent.toLocaleString()}`, icon: '💰', color: '#10b981' },
            { label: 'Total Deposit', value: `₹${totalDeposit.toLocaleString()}`, icon: '🏦', color: '#8b5cf6' },
            { label: 'Pending This Month', value: pendingCount, icon: '⏳', color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: '12px', padding: '20px 24px',
              borderLeft: `4px solid ${s.color}`,
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{loading ? '...' : s.value}</div>
              <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Tenants */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>Active Tenants</h2>
            <button onClick={() => router.push('/add-tenant')} style={{
              background: '#1d4ed8', border: 'none', color: 'white',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
            }}>+ Add Tenant</button>
          </div>

          {loading ? (
            <p style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</p>
          ) : active.length === 0 ? (
            <p style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No tenants yet. Add your first tenant!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    {['Name', 'Room', 'Rent', 'Phone', 'This Month', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.map(t => {
                    const paid = t.payments?.some(p => p.month === thisMonth && p.year === thisYear && p.status === 'paid')
                    return (
                      <tr key={t._id} style={{ borderBottom: '1px solid #1e293b' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 20px', fontWeight: 500 }}>{t.name}</td>
                        <td style={{ padding: '14px 20px', color: '#94a3b8' }}>#{t.roomNumber}</td>
                        <td style={{ padding: '14px 20px', color: '#10b981', fontWeight: 600 }}>₹{t.rentAmount?.toLocaleString()}</td>
                        <td style={{ padding: '14px 20px', color: '#94a3b8' }}>{t.phone}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                            background: paid ? '#14532d' : '#7f1d1d',
                            color: paid ? '#86efac' : '#fca5a5',
                          }}>{paid ? '✓ Paid' : '⏳ Pending'}</span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <button onClick={() => router.push(`/tenants?id=${t._id}`)} style={{
                            background: '#1e40af', border: 'none', color: '#93c5fd',
                            padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                          }}>View</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
