import './globals.css'

export const metadata = {
  title: 'RentWeb - Rent Management System',
  description: 'Manage your tenants and rent payments easily',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
