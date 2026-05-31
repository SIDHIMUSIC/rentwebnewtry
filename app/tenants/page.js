'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payLoading, setPayLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [msg, setMsg] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id')

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const thisMonth = months[now.getMonth()]
  const thisYear = now.getFullYear()

  const fetchTenants = useCallback(async () => {
    const res = await fetch('/api/tenants')
    if (res.status === 401) { router.push('/login'); return }
    const data = await res.json()
    const list = data.tenants || []
    setTenants(list)
    if (selectedId) {
      const found = list.find(t => t._id === selectedId)
      if (found) { setSelected(found); setEditForm(found) }
    }
    setLoading(false)
  }, [selectedId, router])

  useEffect(() => { fetchTenants() }, [fetchTenants])

  function selectTenant(t) {
    setSelected(t)
    setEditForm(t)
    setEditMode(false)
    setMsg('')
    router.push(`/tenants?id=${t._id}`, { scroll: false })
  }

  async function handleEdit(e) {
    e.preventDefault()
    const res = await fetch(`/api/tenants/${selected._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg('✅ Updated successfully!')
      setEditMode(false)
      await fetchTenants()
    } else {
      setMsg(`❌ ${data.error}`)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Deactivate this tenant?')) return
    const res = await fetch(`/api/tenants/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSelected(null)
      router.push('/tenants')
      await fetchTenants()
    }
  }

  async function handlePayment(tenant) {
    setPayLoading(true)
    setMsg('')
    try {
      // Load Razorpay script dynamically
      await loadRazorpayScript()

      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant._id,
          amount: tenant.rentAmount,
          month: thisMonth,
          year: thisYear,
        }),
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error)

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'RentWeb',
        description: `Rent for ${thisMonth} ${thisYear}`,
        order_id: order.orderId,
        prefill: {
          name: tenant.name,
          contact: tenant.phone,
          email: tenant.email || '',
        },
        theme: { color: '#3b82f6' },
        handler: async function (response) {
          // Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              tenantId: tenant._id,
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyRes.ok) {
            setMsg(`✅ Payment successful! Transaction ID: ${verifyData.transactionId}`)
            await fetchTenants()
          } else {
            setMsg(`❌ Verification failed: ${verifyData.error}`)
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setMsg(`❌ Payment error: ${err.message}`)
    } finally {
      setPayLoading(false)
    }
  }

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = resolve
      document.body.appendChild(script)
    })
  }

  const active = tenants.filter(t => t.isActive)
  const selectedPaid = selected?.payments?.some(p => p.month === thisMonth && p.year === thisYear && p.status === 'paid')

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>

        {/* Left: Tenant List */}
        <div style={{
          width: '300px', minWidth: '300px',
          borderRight: '1px solid #334155',
          overflowY: 'auto', background: '#0f172a',
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '15px' }}>Tenants ({active.length})</span>
            <button onClick={() => router.push('/add-tenant')} style={{
              background: '#1d4ed8', border: 'none', color: 'white',
              padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
            }}>+ Add</button>
          </div>

          {loading ? <p style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>Loading...</p> :
            active.map(t => {
              const paid = t.payments?.some(p => p.month === thisMonth && p.year === thisYear && p.status === 'paid')
              return (
                <div key={t._id} onClick={() => selectTenant(t)} style={{
                  padding: '14px 16px', cursor: 'pointer',
                  borderBottom: '1px solid #1e293b',
                  background: selected?._id === t._id ? '#1e293b' : 'transparent',
                  borderLeft: selected?._id === t._id ? '3px solid #3b82f6' : '3px solid transparent',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                    Room #{t.roomNumber} · ₹{t.rentAmount?.toLocaleString()}
                  </div>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px', marginTop: '4px', display: 'inline-block',
                    background: paid ? '#14532d' : '#7f1d1d',
                    color: paid ? '#86efac' : '#fca5a5',
                  }}>{paid ? '✓ Paid' : '⏳ Pending'}</span>
                </div>
              )
            })
          }
        </div>

        {/* Right: Detail Panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {!selected ? (
            <div style={{ textAlign: 'center', marginTop: '80px', color: '#475569' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👈</div>
              <p>Select a tenant to view details</p>
            </div>
          ) : (
            <>
              {msg && (
                <div style={{
                  background: msg.startsWith('✅') ? '#14532d' : '#7f1d1d',
                  border: `1px solid ${msg.startsWith('✅') ? '#22c55e' : '#ef4444'}`,
                  borderRadius: '8px', padding: '10px 16px', marginBottom: '20px',
                  color: msg.startsWith('✅') ? '#86efac' : '#fca5a5', fontSize: '14px',
                }}>{msg}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>{selected.name}</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Room #{selected.roomNumber}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditMode(!editMode)} style={{
                    background: '#1e40af', border: 'none', color: '#93c5fd',
                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                  }}>{editMode ? 'Cancel' : '✏️ Edit'}</button>
                  <button onClick={() => handleDelete(selected._id)} style={{
                    background: '#7f1d1d', border: 'none', color: '#fca5a5',
                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                  }}>🗑️ Remove</button>
                </div>
              </div>

              {/* Info Cards */}
              {!editMode ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                    {[
                      { label: 'Monthly Rent', value: `₹${selected.rentAmount?.toLocaleString()}`, color: '#10b981' },
                      { label: 'Deposit', value: `₹${selected.depositAmount?.toLocaleString() || 0}`, color: '#8b5cf6' },
                      { label: 'Phone', value: selected.phone, color: '#3b82f6' },
                      { label: 'Email', value: selected.email || '—', color: '#f59e0b' },
                      { label: 'Join Date', value: selected.joinDate ? new Date(selected.joinDate).toLocaleDateString('en-IN') : '—', color: '#94a3b8' },
                      { label: 'Address', value: selected.address || '—', color: '#94a3b8' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '14px 16px' }}>
                        <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ color: item.color, fontWeight: 600, fontSize: '14px' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Pay Button */}
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px' }}>Rent for {thisMonth} {thisYear}</div>
                        <div style={{ color: '#64748b', fontSize: '13px', marginTop: '3px' }}>Amount: ₹{selected.rentAmount?.toLocaleString()}</div>
                      </div>
                      {selectedPaid ? (
                        <span style={{ background: '#14532d', color: '#86efac', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px' }}>✓ Paid</span>
                      ) : (
                        <button
                          onClick={() => handlePayment(selected)}
                          disabled={payLoading}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            border: 'none', color: 'white',
                            padding: '10px 24px', borderRadius: '8px',
                            cursor: payLoading ? 'not-allowed' : 'pointer',
                            fontWeight: 600, fontSize: '14px',
                          }}
                        >
                          {payLoading ? 'Processing...' : '💳 Pay via Razorpay'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment History */}
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', fontWeight: 600 }}>Payment History</div>
                    {!selected.payments?.length ? (
                      <p style={{ padding: '20px', color: '#64748b', textAlign: 'center', fontSize: '14px' }}>No payments yet</p>
                    ) : (
                      selected.payments.slice().reverse().map((p, i) => (
                        <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid #0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '14px' }}>{p.month} {p.year}</div>
                            {p.transactionId && <div style={{ color: '#64748b', fontSize: '12px' }}>TXN: {p.transactionId}</div>}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, color: '#10b981' }}>₹{p.amount?.toLocaleString()}</div>
                            <span style={{
                              fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                              background: p.status === 'paid' ? '#14532d' : '#7f1d1d',
                              color: p.status === 'paid' ? '#86efac' : '#fca5a5',
                            }}>{p.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                /* Edit Form */
                <form onSubmit={handleEdit} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ margin: '0 0 20px', fontSize: '16px' }}>Edit Tenant Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[
                      { label: 'Name', name: 'name', type: 'text' },
                      { label: 'Phone', name: 'phone', type: 'tel' },
                      { label: 'Email', name: 'email', type: 'email' },
                      { label: 'Room Number', name: 'roomNumber', type: 'text' },
                      { label: 'Rent Amount (₹)', name: 'rentAmount', type: 'number' },
                      { label: 'Deposit Amount (₹)', name: 'depositAmount', type: 'number' },
                    ].map(f => (
                      <div key={f.name}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>{f.label}</label>
                        <input
                          type={f.type} value={editForm[f.name] || ''}
                          onChange={e => setEditForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                          style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '7px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>Notes</label>
                      <textarea value={editForm.notes || ''} rows={3}
                        onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '7px', color: '#f1f5f9', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                  <button type="submit" style={{
                    marginTop: '20px', padding: '11px 28px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none', borderRadius: '8px', color: 'white',
                    fontWeight: 600, cursor: 'pointer', fontSize: '14px',
                  }}>Save Changes</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
