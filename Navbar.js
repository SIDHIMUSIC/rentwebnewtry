'use client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <nav style={{
      background: '#1e293b',
      borderBottom: '1px solid #334155',
      padding: '0 24px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '22px' }}>🏠</span>
        <span style={{ fontWeight: 700, fontSize: '18px', color: '#f1f5f9' }}>RentWeb</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <a href="/dashboard" style={navLink}>Dashboard</a>
        <a href="/tenants" style={navLink}>Tenants</a>
        <a href="/add-tenant" style={navLink}>+ Add</a>
        <button onClick={handleLogout} style={{
          background: '#7f1d1d', border: '1px solid #ef4444',
          color: '#fca5a5', padding: '6px 14px', borderRadius: '6px',
          cursor: 'pointer', fontSize: '13px', fontWeight: 500,
        }}>
          Logout
        </button>
      </div>
    </nav>
  )
}

const navLink = {
  color: '#94a3b8',
  textDecoration: 'none',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'color 0.2s',
}
