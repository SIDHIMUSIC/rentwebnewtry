import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function getTokenFromRequest(request) {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  // Check cookie
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const match = cookieHeader.match(/token=([^;]+)/)
    if (match) return match[1]
  }
  return null
}

export function requireAuth(request) {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}
