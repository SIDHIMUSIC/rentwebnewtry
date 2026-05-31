'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function AddTenant() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', email: '', roomNumber: '',
    rentAmount: '', depositAmount: '', joinDate: '',
    address: '', notes: '',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Failed to add tenant')
      }
    } catch {
      setError('Server error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '32px 24px', maxWidth: '680px', margin: '0 auto' }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: '#94a3b8',
          cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0,
        }}>← Back</button>

        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Add New Tenant</h1>

        <form onSubmit={handleSubmit} style={{
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: '14px', padding: '32px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Full Name *', name: 'name', type: 'text', placeholder: 'Ramesh Kumar' },
              { label: 'Phone *', name: 'phone', type: 'tel', placeholder: '9876543210' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'ramesh@email.com' },
              { label: 'Room Number *', name: 'roomNumber', type: 'text', placeholder: '101' },
              { label: 'Rent Amount (₹) *', name: 'rentAmount', type: 'number', placeholder: '8000' },
              { label: 'Deposit Amount (₹)', name: 'depositAmount', type: 'number', placeholder: '16000' },
              { label: 'Join Date *', name: 'joinDate', type: 'date', placeholder: '' },
            ].map(field => (
              <div key={field.name} style={{ gridColumn: field.name === 'address' || field.name === 'notes' ? 'span 2' : 'span 1' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.label.includes('*')}
                  style={inputStyle}
                />
              </div>
            ))}

            {/* Address full width */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange}
                placeholder="Permanent address" style={inputStyle} />
            </div>

            {/* Notes full width */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange}
                placeholder="Any additional notes..." rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          </div>

          {error && (
            <div style={{
              background: '#7f1d1d', border: '1px solid #ef4444',
              borderRadius: '8px', padding: '10px 14px', color: '#fca5a5',
              fontSize: '14px', marginTop: '16px',
            }}>⚠️ {error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: '24px', width: '100%', padding: '13px',
            background: loading ? '#1e40af' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: 'none', borderRadius: '8px', color: 'white',
            fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Adding Tenant...' : '+ Add Tenant'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 13px',
  background: '#0f172a', border: '1px solid #334155',
  borderRadius: '8px', color: '#f1f5f9', fontSize: '14px',
  outline: 'none', boxSizing: 'border-box',
}
