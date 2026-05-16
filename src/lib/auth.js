const SALT = 'uist-salt'

export async function hashPassword(password) {
  if (typeof crypto?.subtle?.digest === 'function') {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + SALT)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  let h = 0
  for (let i = 0; i < password.length; i++) {
    const c = password.charCodeAt(i)
    h = ((h << 5) - h) + c
    h = h & h
  }
  return Math.abs(h).toString(16)
}
